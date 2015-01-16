module jasper.areas {

    // Area, downloading now...
    class AreaDefers {
        constructor(public name: string) {
        }

        //Waiting promises
        defers: ng.IDeferred<any>[] = [];
    }

    // Collection of waiting areas
    class LoadingAreasIdleCollection {

        private loadingAreas: AreaDefers[] = [];
        private initAreas: AreaDefers[] = [];

        constructor(public q: ng.IQService) { }

        isLoading(areaname: string) {
            return this.getLoadingAreaByName(areaname) != null;
        }

        // Mark that area is loading
        startLoading(areaname: string) {
            if (this.isLoading(areaname))
                throw areaname + ' allready loading';
            var loading = new AreaDefers(areaname);
            this.loadingAreas.push(loading);
        }

        // Mark that area is loading
        addInitializer(areaname: string): ng.IPromise<any> {
            if (!this.isLoading(areaname))
                throw areaname + ' does not loading';
            var d = this.q.defer();

            var initDefers = this.getInitDefersByName(areaname);
            if (initDefers) {
                initDefers.defers.push(d);
            } else {
                var init = new AreaDefers(areaname);
                init.defers.push(d);
                this.initAreas.push(init);
            }
            
            return d.promise;
        }

        // Notify when area is loaded
        onAreaLoaded(areaName: string): ng.IPromise<any> {
            var loadingSection = this.getLoadingAreaByName(areaName);
            if (loadingSection == null)
                throw areaName + ' not loading';
            var d = this.q.defer();

            loadingSection.defers.push(d);

            return d.promise;
        }


        // Notify
        notifyOnLoaded(areaName: string) {
            var loadingArea = this.getLoadingAreaByName(areaName);
            if (loadingArea == null)
                throw areaName + ' not loading';

            this.resolveInitializers(areaName);

            for (var j = 0; j < loadingArea.defers.length; j++) {
                loadingArea.defers[j].resolve();
            }

            // Remove area from loading area collection
            var i = this.loadingAreas.indexOf(loadingArea);
            if (i > -1) {
                this.loadingAreas.splice(i, 1);
            }
        }

        private resolveInitializers(areaName: string) {
            var initDefers = this.getInitDefersByName(areaName);
            if (initDefers && initDefers.defers.length) {
                initDefers.defers.forEach(defer => {
                    defer.resolve();
                });
                initDefers.defers = [];
            }
        }

        private getLoadingAreaByName(name: string) {
            return this.filterDefersByName(name, this.loadingAreas);
        }

        private getInitDefersByName(name: string) {
            return this.filterDefersByName(name, this.initAreas);
        }

        private filterDefersByName(name: string, collection: AreaDefers[]) {
            for (var i = 0; i < collection.length; i++) {
                if (collection[i].name === name)
                    return collection[i];
            }
            return null;
        }

    }

    // Object load areas
    export class JasperAreasService {

        static $inject = ['$q'];

        private config: any;
        private loadiingModules: LoadingAreasIdleCollection;

        static maxDependencyHops: number = 10;

        resourceManager: IResourceManager;
        loadedAreas: string[] = [];

        q: ng.IQService;

        constructor($q: ng.IQService) {
            this.resourceManager = new JasperResourcesManager();
            this.q = $q;
            this.loadiingModules = new LoadingAreasIdleCollection(this.q);
        }

        configure(config: any) {
            this.config = config;
        }

        onAreaLoaded(areaName: string): ng.IPromise<any> {
            if (this.isAreaLoaded(areaName)) {
                return this.q.when(true);
            } else {
                return this.loadAreas(areaName);
            }
        }

        initArea(areaName: string): ng.IPromise<any> {
            return this.loadiingModules.addInitializer(areaName);
        }

        loadAreas(areaName: string, hops: number = 0 /* avoid loop */): ng.IPromise<any> {
            if (!this.config)
                throw "Resources not configure";
            var section = <IAreaSection>this.config[areaName];
            if (!section)
                throw "Config with name '" + areaName + "' not found";

            //dependencies:
            hops++;
            if (hops > JasperAreasService.maxDependencyHops)
                throw 'Possible cyclic dependencies found on module: ' + areaName;

            var allDependencies: ng.IPromise<any>[] = []; // list of all deps of this module
            for (var i = 0; i < section.dependencies.length; i++) {
                var depSection = section.dependencies[i]; //current section depends on it
                allDependencies.push(this.loadAreas(depSection, hops));
            }

            var defer = this.q.defer();
            this.q.all(allDependencies).then(() => {
                //all dependencies loaded
                if (this.isAreaLoaded(areaName)) {
                    defer.resolve();
                }
                else if (this.loadiingModules.isLoading(areaName)) {
                    this.loadiingModules.onAreaLoaded(areaName).then(() => defer.resolve());
                } else {
                    this.loadiingModules.startLoading(areaName);
                    this.resourceManager.makeAccessible(
                        this.prepareUrls(section.scripts),
                        this.prepareUrls(section.styles),
                        () => {
                            this.loadiingModules.notifyOnLoaded(areaName);
                            defer.resolve();
                        });
                }

            });

            return defer.promise;
        }

        private isAreaLoaded(areaname: string) {
            return this.loadedAreas.indexOf(areaname) >= 0;
        }

        private prepareUrls(urls: string[]): string[] {
            if (!urls) return [];
            var result: string[] = [];
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].charAt(0) == '/')
                    result.push(urls[i]);
                else
                    result.push((this.config['_rootPath'] || '') + urls[i]);
            }
            return result;
        }
    }
}
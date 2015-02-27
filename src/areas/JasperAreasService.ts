module jasper.areas {

    // Area, downloading now...
    class AreaDefers {
        constructor(public name:string) {
        }

        //Waiting promises
        defers:ng.IDeferred<any>[] = [];
    }

    /**
     * Collection of loading areas
     */
    class LoadingAreasIdleCollection {

        private loadingAreas:AreaDefers[] = [];
        private initAreas:AreaDefers[] = [];

        constructor(public q:ng.IQService) {
        }

        isLoading(areaname:string) {
            return this.getLoadingAreaByName(areaname) != null;
        }

        /**
         * Mark that area is loading
         * @param areaname      name of the area
         */
        startLoading(areaname:string) {
            if (this.isLoading(areaname))
                throw areaname + ' allready loading';
            var loading = new AreaDefers(areaname);
            this.loadingAreas.push(loading);
        }

        /**
         * Adds initializer to area. Initializer invokes when area is fully loaded
         * @param areaname          name of the area
         * @returns {IPromise<T>}   promise resolves when area is loaded
         */
        addInitializer(areaname:string):ng.IPromise<any> {
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
        onAreaLoaded(areaName:string):ng.IPromise<any> {
            var loadingSection = this.getLoadingAreaByName(areaName);
            if (loadingSection == null)
                throw areaName + ' not loading';
            var d = this.q.defer();

            loadingSection.defers.push(d);

            return d.promise;
        }


        // Notify
        notifyOnLoaded(areaName:string) {
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

        private resolveInitializers(areaName:string) {
            var initDefers = this.getInitDefersByName(areaName);
            if (initDefers && initDefers.defers.length) {
                initDefers.defers.forEach(defer => {
                    defer.resolve();
                });
                initDefers.defers = [];
            }
        }

        private getLoadingAreaByName(name:string) {
            return this.filterDefersByName(name, this.loadingAreas);
        }

        private getInitDefersByName(name:string) {
            return this.filterDefersByName(name, this.initAreas);
        }

        private filterDefersByName(name:string, collection:AreaDefers[]) {
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
        /**
         * Client-side areas configuration
         */
        private config:any;
        private loadiingAreas:LoadingAreasIdleCollection;

        static maxDependencyHops:number = 10;

        resourceManager:IResourceManager;
        loadedAreas:string[] = [];

        q:ng.IQService;

        constructor($q:ng.IQService) {
            this.resourceManager = new JasperResourcesManager();
            this.q = $q;
            this.loadiingAreas = new LoadingAreasIdleCollection(this.q);
        }

        configure(config:any) {
            this.config = config;
        }

        onAreaLoaded(areaName:string):ng.IPromise<any> {
            if (this.isAreaLoaded(areaName)) {
                return this.q.when(true);
            } else {
                return this.loadAreas(areaName);
            }
        }

        initArea(areaName:string):ng.IPromise<any> {
            if (!this.config) {
                // resolve unregistred areas (bootstrapped)
                return this.q.when(true);
            }
            var area = this.ensureArea(areaName);
            if (!area.scripts || !area.scripts.length) {
                // no scripts specified for area (may be bootstraped - allready loaded with _base.min.js)
                return this.q.when(true);
            }

            return this.loadiingAreas.addInitializer(areaName);
        }

        loadAreas(areas:string, hops?:number):ng.IPromise<any>;
        loadAreas(areas:string[], hops?:number):ng.IPromise<any>;
        loadAreas(areas:any, hops:number = 0):ng.IPromise<any> {
            if (!this.config)
                throw "Areas not configured";

            if (angular.isArray(areas)) {
                var allAreas:ng.IPromise<any>[] = [];
                areas.forEach((areaName:string) => {
                    allAreas.push(this.loadAreas(areaName));
                });
                return this.q.all(allAreas);
            }

            var section = <IAreaSection>this.config[areas];
            if (!section)
                throw "Config with name '" + areas + "' not found";

            //dependencies:

            hops++;
            if (hops > JasperAreasService.maxDependencyHops)
                throw 'Possible cyclic dependencies found on module: ' + areas;

            var allDependencies:ng.IPromise<any>[] = []; // list of all deps of this module
            for (var i = 0; i < section.dependencies.length; i++) {
                var depSection = section.dependencies[i]; //current section depends on it
                allDependencies.push(this.loadAreas(depSection, hops));
            }

            var defer = this.q.defer();
            var allDependenciesLoaded = ()=> {
                //all dependencies loaded
                if (this.isAreaLoaded(areas)) {
                    defer.resolve();
                }
                else if (this.loadiingAreas.isLoading(areas)) {
                    // If area is loading now, register a callback when area is loaded
                    this.loadiingAreas.onAreaLoaded(areas).then(()=>defer.resolve());
                } else {
                    // mark area as loading now
                    this.loadiingAreas.startLoading(areas);
                    this.resourceManager.makeAccessible(
                        this.prepareUrls(section.scripts),
                        this.prepareUrls(section.styles),
                        () => {
                            // notify all subscribers that area is loaded
                            this.loadiingAreas.notifyOnLoaded(areas);
                            this.loadedAreas.push(areas);
                            defer.resolve();
                        });
                }
            };
            if (allDependencies.length) {
                this.q.all(allDependencies).then(allDependenciesLoaded);
            } else {
                allDependenciesLoaded();
            }

            return defer.promise;
        }

        /**
         * Ensures that areas exists in the configuration and return the found area config
         * @param areaName      name of area
         */
        private ensureArea(areaName:string):any {
            if (!this.config)
                throw "Areas not configured";
            var area = <IAreaSection>this.config[areaName];
            if (!area)
                throw "Area with name '" + areaName + "' not found";
            return area;
        }

        private isAreaLoaded(areaname:string) {
            return this.loadedAreas.indexOf(areaname) >= 0;
        }

        private prepareUrls(urls:string[]):string[] {
            if (!urls) return [];
            var result:string[] = [];
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
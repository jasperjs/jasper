module jasper {
    export interface IJasperStatic {
        /**
         * Register a component
         * @param def       component definition
         */
        component(def: core.IHtmlComponentDefinition);
        /**
         * Register a decorator component
         * @param def       decorator definition
         */
        decorator(def: core.IHtmlDecoratorDefinition);
        /**
         * Register a filter
         * @param def       filter definition
         */
        filter(def: core.IFilterDefinition);
        /**
         * Register a service
         * @param def       service definition
         */
        service(def: core.IServiceDefinition);
        /**
         * Jasper areas service
         */
        areas: areas.JasperAreasService;
        /**
         * Register a template in template cache
         * @param key       key to access to template
         * @param content   html content of the template
         */
        template(key: string, content: string);
        /**
         * Register an AngularJS directive. Use in a case of emergency
         * @param name      directive name
         * @param ddo       directive definition object
         */
        directive(name: string, ddo: any);
        /**
         * Register new value
         * @param name      name of the value
         * @param value     value (string|object|array|number)
         */
        value(name: string, value: any);

        /**
         * Notify when jasper is ready to work
         * @param cb
         */
        ready(cb?: () => void);

        setup(templateCache: ng.ITemplateCacheService, areasService: areas.JasperAreasService);
    }

    export class JasperStatic implements IJasperStatic {

        private isReady: boolean;
        private readyQueue: Array<() => void> = [];

        private componentProvider: core.IComponentProvider;
        private decoratorProvider: core.IDecoratorComponentProvider;
        private serviceProvider: core.IServiceProvider;
        private filtersProvider: core.IFilterProvider;
        private valueProvider: core.IValueProvider;

        private templateCahce: ng.ITemplateCacheService;

        directive: (name: string, ddo: any) => void;

        component(def: core.IHtmlComponentDefinition) {
            this.componentProvider.register(def);
        }

        decorator(def: core.IHtmlDecoratorDefinition) {
            this.decoratorProvider.register(def);
        }

        filter(def: core.IFilterDefinition) {
            this.filtersProvider.register(def);
        }

        service(def: core.IServiceDefinition){
            this.serviceProvider.register(def);
        }

        areas: areas.JasperAreasService;

        template(key: string, content: string){
            this.templateCahce.put(key, content);
        }

        value(name: string, value: any){
            this.valueProvider.register(name, value);
        }

        init(componentProvider: core.IComponentProvider,
             decoratorProvider: core.IDecoratorComponentProvider,
             serviceProvider: core.IServiceProvider,
             filterProvider: core.IFilterProvider,
             valueProvider: core.IValueProvider,
             directiveFactory: any) {

            this.componentProvider = componentProvider;
            this.decoratorProvider = decoratorProvider;
            this.serviceProvider = serviceProvider;
            this.valueProvider = valueProvider;
            this.filtersProvider = filterProvider;
            this.directive = directiveFactory;
        }

        setup(templateCache: ng.ITemplateCacheService, areasService: areas.JasperAreasService){
            this.areas = areasService;
            this.templateCahce = templateCache;
            this.ready();
        }

        ready(cb?: ()=>void) {
            if(!cb) {
                this.readyQueue.forEach(subscriber=>{
                    subscriber();
                });
                this.readyQueue = []; // flush subscriber queue
                this.isReady = true;
                return;
            }
            if(this.isReady) {
                cb();
            } else {
                this.readyQueue.push(cb);
            }
        }
    }

    window['jsp'] = new JasperStatic();
}
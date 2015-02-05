declare var jsp: jasper.IJasperStatic;

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
        decorator(def: core.IDecoratorComponentProvider);
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
    }

    angular.module('jasper',
        [
            'ng',
            'ngRoute',
            'jasperCore',
            'jasperAreas',
            'jasperRoutes'
        ])
        .config(['jasperComponentProvider'
            , 'jasperDecoratorProvider'
            , 'jasperServiceProvider'
            , 'jasperFilterProvider'
            , 'jasperValueProvider'
            , '$compileProvider',
            (jasperComponents: jasper.core.IComponentProvider
                , jasperDecorators: jasper.core.IDecoratorComponentProvider
                , jasperServices: jasper.core.IServiceProvider
                , jasperFilters: jasper.core.IFilterProvider
                , jasperValues: jasper.core.IValueProvider
                , $compileProvider: ng.ICompileProvider) => {

                window['jsp'] = {
                    component: def => jasperComponents.register(def),
                    decorator: def => jasperDecorators.register(def),
                    service: def => jasperServices.register(def),
                    filter: def => jasperFilters.register(def),
                    value: (name, value) => jasperValues.register(name, value),
                    directive: $compileProvider.directive
                };

            }]).run(['jasperAreasService', '$templateCache',
            (jasperAreasService: jasper.areas.JasperAreasService, $templateCache: ng.ITemplateCacheService) => {
                window['jsp'].areas = jasperAreasService;
                window['jsp'].template = (name: string, content: string) => {
                    $templateCache.put(name, content);
                };
            }]);
}


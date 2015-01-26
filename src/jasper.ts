declare var jsp: jasper.IJasperStatic;

module jasper {

    export interface IJasperStatic {
        component(def: core.IHtmlComponentDefinition);
        decorator(def: core.IDecoratorComponentProvider);
        filter(def: core.IFilterDefinition);
        service(def: core.IServiceDefinition);
        areas: areas.JasperAreasService;
        // dynamic template registration
        template(name: string, content: string);
        // legacy angularjs method
        directive(name: string, ddo: any);
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


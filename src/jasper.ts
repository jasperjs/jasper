declare var jsp: jasper.IJasperStatic;

module jasper {
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

                (<JasperStatic>window['jsp']).init(jasperComponents, jasperDecorators, jasperServices, jasperFilters, jasperValues, $compileProvider.directive);

            }]).run(['jasperAreasService', '$templateCache',
            (jasperAreasService: jasper.areas.JasperAreasService, $templateCache: ng.ITemplateCacheService) => {
                (<JasperStatic>window['jsp']).setup($templateCache, jasperAreasService);
            }]);
}

declare module 'jasper' {
    export = jsp;
}
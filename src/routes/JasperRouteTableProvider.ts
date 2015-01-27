module jasper.routing {
    export class JasperRouteTableProvider implements IRouteTableProvider {
        static $inject = ['$routeProvider'];

        constructor(private routeProvider: any) {

        }

        setup(config: IRoutesConfiguration) {
            angular.forEach(config.routes, (route: any, path) => {
                var routeConf = { template: route.template };
                if (route.template) {
                    routeConf['template'] = route.template;
                }

                if (route.templateUrl) {
                    routeConf['template'] = '<div ng-include="\'' + route.templateUrl + '\'"></div>';
                }

                routeConf['caseInsensitiveMatch'] = true;
                if (angular.isDefined(route.reloadOnSearch))
                    routeConf['reloadOnSearch'] = route.reloadOnSearch;
                else
                    routeConf['reloadOnSearch'] = false;

                if (route.redirectTo) {
                    routeConf['redirectTo'] = route.redirectTo;
                }

                if (route.area) {
                    routeConf['resolve'] = {
                        _m: [
                            'jasperAreasService', (jasperAreasService: areas.JasperAreasService) => {
                                // async load required areas before change route
                                return jasperAreasService.loadAreas(route.area);
                            }
                        ]
                    };
                }

                routeConf['prerender'] = route.prerender;

                this.routeProvider.when(path, routeConf);
            });

            if (config.defaultRoutePath) {
                this.routeProvider.otherwise({ redirectTo: config.defaultRoutePath });
            }
        }

        $get() {
            return this;
        }
    }
} 
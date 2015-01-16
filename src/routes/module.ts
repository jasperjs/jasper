module jasper.routing {
    export interface IRoutesConfiguration {
        defaultRoutePath: string; // redirect when route not found
        routes: any; // route config
    }

    export interface IRouteTableProvider {
        setup(config: IRoutesConfiguration);
    }
}

angular.module('jasperRoutes', ['jasperAreas'])
    .provider('jasperRoute', jasper.routing.JasperRouteTableProvider);
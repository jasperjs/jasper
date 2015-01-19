﻿angular.module('jasperCore', ['ng'])
    .provider('jasperComponent', jasper.core.ComponentProvider)
    .provider('jasperDecorator', jasper.core.DecoratorComponentProvider)
    .provider('jasperService', jasper.core.ServiceProvider)
    .provider('jasperFilter', jasper.core.FilterProvider)
    .service('$globalEvents', jasper.core.GlobalEventsService)
    .service('$appContext', jasper.core.AppContext);
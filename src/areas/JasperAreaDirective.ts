﻿module jasper.areas {
    export class JasperAreaDirective {
        static $inject = ['$compile', 'jasperAreasService'];

        constructor($compile:ng.ICompileService, jasperAreasService:JasperAreasService) {
            var processingCssClasses:string = "ng-hide jasper-area-loading";

            var directive:ng.IDirective = {
                priority: 1000,
                terminal: true,
                restrict: 'A',
                compile: (tElement:any) => {
                    tElement.addClass(processingCssClasses);
                    tElement.removeAttr('data-jasper-module').removeAttr('jasper-area');
                    return {
                        pre: (scope:ng.IScope, element:any, iAttrs:ng.IAttributes) => {

                            var areaNames = iAttrs["jasperArea"];
                            if (areaNames.indexOf(',') > 0) {
                                areaNames = areaNames.split(',');
                            }

                            jasperAreasService.loadAreas(areaNames).then(() => {
                                element.removeClass(processingCssClasses);
                                $compile(element)(scope);
                            });
                        }
                    };
                }
            };
            return directive;
        }
    }
}
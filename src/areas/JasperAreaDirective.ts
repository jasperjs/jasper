module jasper.areas {
    export class JasperAreaDirective {
        static $inject = ['$compile', 'jasperAreasService'];

        constructor($compile: ng.ICompileService, jasperAreasService: JasperAreasService) {
            var processingCssClasses: string = "ng-hide app-module-loading";

            var directive: ng.IDirective = {
                priority: 1000,
                terminal: true,
                restrict: 'A',
                compile: (tElement: any) => {
                    tElement.addClass(processingCssClasses);
                    tElement.removeAttr('data-jasper-module').removeAttr('jasper-area');
                    return {
                        pre: (scope: ng.IScope, element: any, iAttrs: ng.IAttributes) => {

                            var areaNames = iAttrs["jasperArea"];
                            if(areaNames.indexOf(',')> 0){
                                areaNames = areaNames.split(',');
                            }

                            jasperAreasService.loadAreas(areaNames).then(() => {
                                var linkFn = element.data('$compileresult');
                                if (!linkFn) {
                                    element.removeAttr('data-jasper-module').removeAttr('jasper-area');
                                    element.removeClass(processingCssClasses);

                                    linkFn = $compile(element);
                                    element.data('$compileresult', linkFn);
                                } else {
                                    element.removeClass(processingCssClasses);
                                }

                                linkFn(scope);

                            });
                        }
                    };
                }
            };
            return directive;
        }
    }
}
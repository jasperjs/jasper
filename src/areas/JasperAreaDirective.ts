module jasper.areas {
    export class JasperAreaDirective {
        static $inject = ['$compile', 'jasperAreasService', '$q'];

        constructor($compile: ng.ICompileService, jasperAreasService: JasperAreasService, $q: ng.IQService) {
            var processingCssClasses: string = "ng-hide app-module-loading";

            var directive: ng.IDirective = {
                priority: 1000,
                terminal: true,
                restrict: 'A',
                compile: (tElement: any, attrs: any) => {
                    tElement.addClass(processingCssClasses);
                    tElement.removeAttr('data-jasper-module').removeAttr('jasper-area');
                    return {
                        pre: (scope: ng.IScope, element: any, iAttrs: ng.IAttributes, controller: any) => {

                            var moduleName = iAttrs["jasperArea"];
                            var moduleNames = moduleName.split(',');
                            var allModulesPromises = [];
                            for (var i = 0; i < moduleNames.length; i++) {
                                allModulesPromises.push(jasperAreasService.loadAreas(moduleNames[i]));
                            }
                            $q.all(allModulesPromises).then(() => {
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
                                //element.append(clone);

                            });
                        }
                    };
                }
            };
            return directive;
        }
    }
}
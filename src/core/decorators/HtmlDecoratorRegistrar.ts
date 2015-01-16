module jasper.core {

    export class HtmlDecoratorRegistrar implements IHtmlRegistrar<IHtmlDecoratorDefinition> {

        private directive: (name: string, directiveFactory: Function) => ng.ICompileProvider;
        private utility: IUtilityService;

        constructor(compileProvider: ng.ICompileProvider) {
            this.directive = compileProvider.directive;
            this.utility = new UtilityService();
        }

        register(component: IHtmlDecoratorDefinition) {
            var ddo = this.createDirectiveFor(component);
            this.directive(component.name, () => ddo);
        }

        private createDirectiveFor(def: IHtmlDecoratorDefinition): ng.IDirective {
            var directive: ng.IDirective = {
                restrict: 'A',
                scope: false
            };

            var ctor = def.ctor || def.component;
            if (!ctor) {
                throw new Error(def.name + ' must specify constructor');
            }

            directive.scope[def.name] = '=';
            directive.controller = this.utility.getFactoryOf(ctor);
            directive.require = this.getRequirementsForComponent(def);

            directive.link = (scope: ng.IScope, element: JQuery, attrs: ng.IAttributes, controllers: any) => {
                var ctrls = this.utility.getComponentControllers(controllers, directive);

                var attrExpr = attrs[def.name];
                var eval = angular.isDefined(def.eval) ? def.eval : true;

                var value = undefined;
                if (angular.isDefined(attrExpr)) {
                    value = eval ? scope.$eval(attrExpr) : attrExpr;
                }

                if (ctrls.main.link)
                    ctrls.main.link(value, element[0], attrs, ctrls.controllersToPass);

                if (ctrls.main.onValueChanged && attrs[def.name] && eval) {
                    scope.$watch(attrExpr, (newValue: any, oldValue: any) => {
                        ctrls.main.onValueChanged(newValue, oldValue);
                    });
                }
            };

            return directive;
        }

        private getRequirementsForComponent(component: IHtmlDecoratorDefinition) {
            if (angular.isDefined(component.require)) {
                var req = [component.name];
                if (angular.isArray(component.require))
                    req = req.concat(component.require);
                else
                    req.push(component.require);

                return <any>req;
            } else {
                return component.name;
            }
        }

        private getComponentControllers(controllers, directive: ng.IDirective): IComponentControllers {
            var controllersToPass;
            var controller: IHtmlComponent;

            if (directive.require && angular.isArray(directive.require)) {

                controller = controllers.shift();
                controllersToPass = controllers;
                if (controllersToPass.length === 1) {
                    controllersToPass = controllersToPass[0];
                }

            } else {
                controller = controllers;
                controllersToPass = controller;
            }
            return {
                main: controller,
                controllersToPass: controllersToPass
            }
        }

    }
} 
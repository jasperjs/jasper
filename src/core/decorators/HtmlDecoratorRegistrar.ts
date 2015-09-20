module jasper.core {

    export class HtmlDecoratorRegistrar implements IHtmlRegistrar<IHtmlDecoratorDefinition> {

        private directive:(name:string, directiveFactory:Function) => ng.ICompileProvider;
        private utility:IUtilityService;
        private interceptor:IDirectiveInterceptor<IHtmlDecoratorDefinition>;

        constructor(compileProvider:ng.ICompileProvider) {
            this.directive = compileProvider.directive;
            this.utility = new UtilityService();
        }

        register(component:IHtmlDecoratorDefinition) {
            if(this.interceptor){
                this.interceptor.onRegister(component);
            }
            var ddo = this.createDirectiveFor(component);
            this.directive(component.name, () => ddo);
        }

        setInterceptor(interceptor:IDirectiveInterceptor<IHtmlDecoratorDefinition>) {
            this.interceptor = interceptor;
        }


        private createDirectiveFor(def:IHtmlDecoratorDefinition):ng.IDirective {
            var directive:ng.IDirective = {
                restrict: 'A',
                scope: false // decorators do not create own context
            };
            var ctrl = def.ctrl || def.ctor;
            if (!ctrl) {
                throw new Error(def.name + ' must specify constructor');
            }
            directive.controller = JasperDirectiveWrapperFactory(ctrl, this.utility.extractAttributeBindings(def), this.utility, false);
            directive.require = this.getRequirementsForComponent(def);

            directive.compile = (tElement:JQuery) => {
                if (this.interceptor) {
                    this.interceptor.onCompile(directive, tElement, def);
                }
                return {
                    post: (scope:ng.IScope, element:JQuery, attrs:ng.IAttributes, controllers:any) => {
                        var ctrls = this.utility.getComponentControllers(controllers, directive);

                        var attrExpr = attrs[def.name];
                        var evl = angular.isDefined(def.eval) ? def.eval : true;

                        var value = undefined;
                        if (angular.isDefined(attrExpr)) {
                            value = evl ? scope.$eval(attrExpr) : attrExpr;
                        }

                        if (ctrls.main.link)
                            ctrls.main.link(value, element[0], attrs, ctrls.controllersToPass);

                        var onValueChangedBinding;

                        if (ctrls.main.onValueChanged && attrs.hasOwnProperty(def.name) && evl) {
                            onValueChangedBinding = scope.$watch(attrExpr, (newValue:any, oldValue:any) => {
                                ctrls.main.onValueChanged(newValue, oldValue);
                            });
                        }


                        if (onValueChangedBinding) {
                            element.on('$destroy', () => {
                                onValueChangedBinding();
                            });
                        }

                        if (this.interceptor) {
                            this.interceptor.onMount(directive, scope, element, def);
                        }
                    }
                }
            }


            return directive;
        }

        private getRequirementsForComponent(component:IHtmlDecoratorDefinition) {
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

        private getComponentControllers(controllers, directive:ng.IDirective):IComponentControllers {
            var controllersToPass;
            var controller:IHtmlComponent;

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
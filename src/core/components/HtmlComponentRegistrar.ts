module jasper.core {

    export class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {

        private directive: (name: string, directiveFactory: Function) => ng.ICompileProvider;
        private utility: IUtilityService;

        constructor(compileProvider: ng.ICompileProvider) {
            this.directive = compileProvider.directive;
            this.utility = new UtilityService();
        }

        register(component: IHtmlComponentDefinition) {
            var ddo = this.createDirectiveFor(component);

            if (ddo.controller) {
                ddo.compile = () => {
                    return {
                        pre: (scope: ng.IScope, element: any, attrs: ng.IAttributes, controllers: any, tranclude: any) => {
                            var ctrls = this.utility.getComponentControllers(controllers, ddo);
                            this.passPropertiesToCtrl(component, scope, ctrls.main, attrs);

                            if (ctrls.main.initializeComponent && angular.isFunction(ctrls.main.initializeComponent))
                                ctrls.main.initializeComponent.call();

                            if (ctrls.main.disposeComponent && angular.isFunction(ctrls.main.disposeComponent)) {
                                scope.$on('$destroy', () => {
                                    ctrls.main.disposeComponent.call();
                                });
                            }
                        },
                        post: (scope: ng.IScope, element: any, attrs: ng.IAttributes, controllers: any, tranclude: any) => {
                            var ctrls = this.utility.getComponentControllers(controllers, ddo);
                            if (ctrls.main.link) {
                                ctrls.main.link(element[0], ctrls.controllersToPass, tranclude);
                            }
                        }
                    }
                };
            }

            this.directive(component.name, () => ddo);
        }

        private passPropertiesToCtrl(def: IHtmlComponentDefinition, scope: ng.IScope, ctrl: IHtmlComponent, attrs) {
            if (def.attributes) {
                var attributes = this.getPartsOf(def.attributes);
                for (var i = 0; i < attributes.length; i++) {
                    var attrName = attributes[i];
                    if (angular.isDefined(attrs[attrName])) {
                        this.setupCtrlValue(attrName, ctrl, scope, true);
                    }
                }
            }
            // pass plain text attributes
            if (def.textAttributes) {
                var textAttributes = this.getPartsOf(def.textAttributes);
                for (var i = 0; i < textAttributes.length; i++) {
                    var attrName = textAttributes[i];
                    if (angular.isDefined(attrs[attrName])) {
                        this.setupCtrlValue(attrName, ctrl, scope, false);
                    }
                }
            }

            if (def.expressions) {
                var exprs = this.getPartsOf(def.expressions);
                for (var i = 0; i < exprs.length; i++) {
                    ctrl[exprs[i]] = scope[exprs[i]];
                }
            }
        }

        private setupCtrlValue(attributeName: string
            , ctrl: IHtmlComponent
            , scope: ng.IScope
            , watch: boolean) {

            ctrl[attributeName] = scope[attributeName];
            if (watch) {
                scope.$watch(attributeName, (val, oldVal) => {
                    ctrl[attributeName] = val;
                    var methodName = attributeName + '_change';
                    if (ctrl[methodName] && angular.isFunction(ctrl[methodName])) {
                        ctrl[methodName].call(val, oldVal);
                    }
                });
                scope.$watch(() => {
                    return ctrl[attributeName];
                }, val => {
                        scope[attributeName] = val;
                    });
            }
        }

        private createDirectiveFor(def: IHtmlComponentDefinition): ng.IDirective {
            var directive: ng.IDirective = {
                restrict: 'E',
                scope: this.getScopeDefinition(def)
            };

            var ctor = def.ctor || def.component;
            if (ctor) {
                directive.controller = this.utility.getFactoryOf(ctor);
                directive.controllerAs = 'vm';
            }

            if (angular.isDefined(def.transclude))
                directive.transclude = def.transclude === 'true' ? true : def.transclude;

            if (angular.isDefined(def.templateUrl))
                directive.templateUrl = def.templateUrl;

            if (angular.isDefined(def.template))
                directive.template = def.template;

            directive.require = this.getRequirementsForComponent(def);

            return directive;
        }

        private getScopeDefinition(def: IHtmlComponentDefinition) {
            var scope = {};
            if (def.attributes) {
                var attrs = this.getPartsOf(def.attributes);
                for (var i = 0; i < attrs.length; i++) {
                    scope[attrs[i]] = '=';
                }
            }
            if (def.textAttributes) {
                var textAttrs = this.getPartsOf(def.textAttributes);
                for (var i = 0; i < textAttrs.length; i++) {
                    scope[textAttrs[i]] = '@';
                }
            }
            if (def.expressions) {
                var exprs = this.getPartsOf(def.expressions);
                for (var i = 0; i < exprs.length; i++) {
                    scope[exprs[i]] = '&';
                }
            }
            return scope;
        }

        private getRequirementsForComponent(component: IHtmlComponentDefinition) {
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

        private getPartsOf(source: string): string[] {
            var parts = source.split(' ');
            for (var i = 0; i < parts.length; i++) {
                parts[i] = this.utility.camelCaseTagName(parts[i]);
            }
            return parts;
        }

    }
} 
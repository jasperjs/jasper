module jasper.core {

    export class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {

        private directive:(name:string, directiveFactory:Function) => ng.ICompileProvider;
        private utility:IUtilityService;
        private interceptor:IDirectiveInterceptor<IHtmlComponentDefinition>;

        constructor(compileProvider:ng.ICompileProvider) {
            this.directive = compileProvider.directive;
            this.utility = new UtilityService();
        }

        register(component:IHtmlComponentDefinition) {
            if (this.interceptor) {
                this.interceptor.onRegister(component);
            }
            var ddo = this.createDirectiveFor(component);
            this.directive(component.name, () => ddo);
        }

        setInterceptor(interceptor:IDirectiveInterceptor<IHtmlComponentDefinition>) {
            this.interceptor = interceptor;
        }

        createDirectiveFor(def:IHtmlComponentDefinition):ng.IDirective {
            var directive:ng.IDirective = {
                restrict: 'E'
            };

            var ctrl = def.ctrl || def.ctor;
            if (ctrl) {
                var ctor = this.utility.getFactoryOf(ctrl);
                directive.controller = JasperDirectiveWrapperFactory(ctor, this.utility.extractAttributeBindings(def), this.utility, true);
                directive.controllerAs = 'vm';
                directive.scope = {};
            } else {
                directive.scope = this.getScopeDefinition(def);
            }

            directive.transclude = def.transclude === 'true' ? true : def.transclude;
            directive.templateUrl = def.templateUrl;
            directive.replace = def.replace;
            directive.templateNamespace = def.templateNamespace;
            if (angular.isDefined(def.template))
                directive.template = def.template;

            directive.require = this.getRequirementsForComponent(def, !!directive.controller);

            if (directive.controller || this.interceptor) {
                directive.compile = (tElement:JQuery) => {
                    if (this.interceptor) {
                        this.interceptor.onCompile(directive, tElement, def);
                    }
                    return {
                        post: (scope:ng.IScope, element:any, attrs:ng.IAttributes, controllers:any, tranclude:any) => {
                            var ctrls = this.utility.getComponentControllers(controllers, directive);
                            if (ctrls.main && ctrls.main.link) {
                                ctrls.main.link(element[0], ctrls.controllersToPass, tranclude);
                            }
                            if (this.interceptor) {
                                this.interceptor.onMount(directive, scope, element, def);
                            }
                        }
                    }
                };
            }

            return directive;
        }


        private getScopeDefinition(def:IHtmlComponentDefinition) {
            var scope = {};
            if (!def.attributes)
                return scope;

            for (var i = 0; i < def.attributes.length; i++) {
                var attr = def.attributes[i];
                if (!attr.name) {
                    throw 'Attribute name not specified of: ' + JSON.stringify(attr);
                }

                var angularBinding = '=?'; // default attribute binding
                var type = attr.type || 'data';
                switch (type) {
                    case 'expr':
                    case 'event':
                        angularBinding = '&';
                        break;
                    case 'text':
                        angularBinding = '@';
                        break;
                }
                var camelCaseAttrName = this.utility.camelCaseTagName(attr.name);
                scope[camelCaseAttrName] = angularBinding;
            }
            return scope;
        }

        private getRequirementsForComponent(component:IHtmlComponentDefinition, hasCtrl:boolean) {
            if (angular.isDefined(component.require)) {
                var req = [];
                if (hasCtrl) {
                    req.push(component.name);
                }
                if (angular.isArray(component.require))
                    req = req.concat(component.require);
                else
                    req.push(component.require);

                return <any>req;
            } else {
                return hasCtrl ? component.name : undefined;
            }
        }

    }
} 
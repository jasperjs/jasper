module jasper.core {

    export class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {

        private directive:(name:string, directiveFactory:Function) => ng.ICompileProvider;
        private utility:IUtilityService;

        constructor(compileProvider:ng.ICompileProvider) {
            this.directive = compileProvider.directive;
            this.utility = new UtilityService();
        }

        register(component:IHtmlComponentDefinition) {
            var ddo = this.createDirectiveFor(component);

            if (ddo.controller) {
                ddo.compile = () => {
                    return {
                        pre: (scope:ng.IScope, element:any, attrs:ng.IAttributes, controllers:any) => {
                            var ctrls = this.utility.getComponentControllers(controllers, ddo);

                            if (ctrls.main.initializeComponent)
                                ctrls.main.initializeComponent.call(ctrls.main);

                            if (ctrls.main.destroyComponent) {
                                scope.$on('$destroy', () => {
                                    ctrls.main.destroyComponent.call(ctrls.main);
                                    ctrls.main.$$scope = null;
                                });
                            }
                        },
                        post: (scope:ng.IScope, element:any, attrs:ng.IAttributes, controllers:any, tranclude:any) => {
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

        private createDirectiveFor(def:IHtmlComponentDefinition):ng.IDirective {
            var directive:ng.IDirective = {
                restrict: 'E'
            };

            var ctrl = def.ctrl || def.ctor;
            if (ctrl) {
                var ctor = this.utility.getFactoryOf(ctrl);
                directive.controller = JasperDirectiveWrapperFactory(ctor, this.extractAttributeBindings(def), this.utility);
                directive.controllerAs = 'vm';
                directive.scope = {};
            } else {
                directive.scope = this.getScopeDefinition(def);
            }

            directive.transclude = def.transclude === 'true' ? true : def.transclude;
            directive.templateUrl = def.templateUrl;
            directive.replace = def.replace;

            if (angular.isDefined(def.template))
                directive.template = def.template;

            directive.require = this.getRequirementsForComponent(def);

            return directive;
        }

        private extractAttributeBindings(def:IHtmlComponentDefinition):IAttributeBinding[] {
            if (def.properties || def.events) {
                var result:IAttributeBinding[] = [];
                // create properties bindings:
                if (def.properties) {
                    for (var i = 0; i < def.properties.length; i++) {
                        var propertyName = def.properties[i];
                        var ctrlName = this.utility.camelCaseTagName(propertyName);
                        result.push({
                            name: propertyName,
                            ctrlName: ctrlName,
                            type: 'text'
                        });
                        // register another binding with 'bind-' prefix
                        result.push({
                            name: 'bind-' + propertyName,
                            ctrlName: ctrlName,
                            type: 'data'
                        });
                    }
                }
                if (def.events) {
                    for (var i = 0; i < def.events.length; i++) {
                        var eventName = def.events[i];
                        result.push({
                            name: 'on-' + eventName,
                            ctrlName: eventName,
                            type: 'expr',
                            // indicates that we need to create EventEmitter class to component's property
                            $$eventEmitter: true
                        });
                    }
                }
                return result;
            } else {
                return def.attributes || [];
            }
        }

        private getRequirementsForComponent(component:IHtmlComponentDefinition) {
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

    }
} 
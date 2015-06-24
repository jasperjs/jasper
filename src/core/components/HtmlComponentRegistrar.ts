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
                        pre: (scope:ng.IScope, element:any, attrs:ng.IAttributes, controllers:any, tranclude:any) => {
                            var ctrls = this.utility.getComponentControllers(controllers, ddo);
                            this.bindController(component, scope, ctrls.main, attrs);

                            ctrls.main.$$scope = scope;

                            if (ctrls.main.initializeComponent && angular.isFunction(ctrls.main.initializeComponent))
                                ctrls.main.initializeComponent();

                            if (ctrls.main.destroyComponent && angular.isFunction(ctrls.main.destroyComponent)) {
                                scope.$on('$destroy', () => {
                                    ctrls.main.destroyComponent();
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

        private bindController(def:IHtmlComponentDefinition, scope:ng.IScope, ctrl:IHtmlComponent, attrs) {
            if (!def.attributes)
                return;

            for (var i = 0; i < def.attributes.length; i++) {
                var attrName = def.attributes[i].name;
                var attrType = def.attributes[i].type || 'data';

                var propertyName = this.utility.camelCaseTagName(attrName);

                if (angular.isDefined(attrs[propertyName])) {

                    switch (attrType.toUpperCase()) {
                        case 'DATA':
                            this.bindChangeMethod(propertyName, ctrl, scope);
                            break;
                        case 'EXPR':
                            break;
                        case 'TEXT':
                            this.bindChangeMethod(propertyName, ctrl, scope);
                            break;
                        default:
                            throw 'Unknown attribute type: ' + attrType
                    }

                }
            }

        }

        private bindChangeMethod(attributeName:string
            , ctrl:IHtmlComponent
            , scope:ng.IScope) {

            var methodName = attributeName + '_change';
            if (ctrl[methodName] && angular.isFunction(ctrl[methodName])) {
                scope.$watch(()=> ctrl[attributeName], (val, oldVal) => {
                    if (val === oldVal)
                        return; // do not pass property id it does not change
                    ctrl[methodName](val, oldVal);
                });
            }

        }

        private createDirectiveFor(def:IHtmlComponentDefinition):ng.IDirective {
            var directive:ng.IDirective = {
                restrict: 'E',
                scope: this.getScopeDefinition(def)
            };

            var ctrl = def.ctrl || def.ctor;
            if (ctrl) {
                directive.bindToController = true;
                directive.controller = this.utility.getFactoryOf(ctrl);
                directive.controllerAs = 'vm';
            }

            directive.transclude = def.transclude === 'true' ? true : def.transclude;
            directive.templateUrl = def.templateUrl;
            directive.replace = def.replace;
            directive.templateNamespace = def.templateNamespace;
            if (angular.isDefined(def.template))
                directive.template = def.template;

            directive.require = this.getRequirementsForComponent(def);

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
                switch (type.toUpperCase()) {
                    case 'EXPR':
                        angularBinding = '&';
                        break;
                    case 'TEXT':
                        angularBinding = '@';
                        break;
                }
                var camelCaseAttrName = this.utility.camelCaseTagName(attr.name);
                scope[camelCaseAttrName] = angularBinding;
            }
            return scope;
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
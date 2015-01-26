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

                            ctrls.main.$$scope = scope;

                            if (ctrls.main.initializeComponent && angular.isFunction(ctrls.main.initializeComponent))
                                ctrls.main.initializeComponent();

                            if (ctrls.main.destroyComponent && angular.isFunction(ctrls.main.destroyComponent)) {
                                scope.$on('$destroy', () => {
                                    ctrls.main.destroyComponent();
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
            if(!def.attributes)
                return;
            var attributes = this.getAttributes(def.attributes);

            for (var i = 0; i < attributes.length; i++) {
                var attrName = attributes[i].name;
                var attrType = attributes[i].type || 'data';

                var propertyName = this.utility.camelCaseTagName(attrName);

                if (angular.isDefined(attrs[propertyName])) {

                    switch (attrType.toUpperCase()){
                        case 'DATA':
                            this.setupCtrlValue(propertyName, ctrl, scope, true);
                            break;
                        case 'EXPR':
                            ctrl[propertyName] = scope[propertyName];
                            break;
                        case 'TEXT':
                            this.setupCtrlValue(propertyName, ctrl, scope, false);
                            break;
                        default:
                            throw 'Unknown attribute type: ' + attrType
                    }

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
                        ctrl[methodName](val, oldVal);
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

            if (def.ctor) {
                directive.controller = this.utility.getFactoryOf(def.ctor);
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
            if(!def.attributes)
                return scope;

            var attrs = this.getAttributes(def.attributes);
            for (var i = 0; i < attrs.length; i++) {
                if(!attrs[i].name){
                    throw 'Attribute name not specified of: ' + JSON.stringify(attrs[i]);
                }

                var angularBinding = '=';
                var type = attrs[i].type || 'data';
                switch (type.toUpperCase()) {
                    case 'EXPR':
                        angularBinding= '&';
                        break;
                    case 'TEXT':
                        angularBinding = '@';
                        break;
                }
                var camelCaseAttrName = this.utility.camelCaseTagName(attrs[i].name);
                scope[camelCaseAttrName] = angularBinding;
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

        private getAttributes(attributes: any): IAttributeBinding[] {
            var result: IAttributeBinding[] = [];

            if (angular.isString(attributes)){
                var parts = attributes.split(' ');
                for (var i = 0; i < parts.length; i++) {
                    result.push({
                        type: 'data',
                        name: parts[i]
                    })
                }
                return result;
            } else if(angular.isArray(attributes)) {
                return attributes;
            }
            throw 'Unknown format of "attributes" binding: ' + attributes;

        }

    }
} 
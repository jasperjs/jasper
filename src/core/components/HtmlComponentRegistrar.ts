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

        private createDirectiveFor(def:IHtmlComponentDefinition):ng.IDirective {
            var directive:ng.IDirective = {
                restrict: 'E'
            };

            var ctrl = def.ctrl || def.ctor;
            if (ctrl) {
                var ctor = this.utility.getFactoryOf(ctrl);
                directive.controller = JasperComponentWrapperFactory(ctor, def.attributes, this.utility);
                directive.controllerAs = 'vm';
                directive.scope= {};
            }else{
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

    function JasperComponentWrapperFactory(ctor:any, attributes:IAttributeBinding[], utility:IUtilityService) {
        var additionalInjectables = ['$scope', '$attrs', '$parse'];
        // add some injectables to the component
        var wrapperInject = additionalInjectables.concat(ctor.$inject || []);
        var wrapper = function JasperCompnentWrapper(scope:ng.IScope, attrs:any, $parse:ng.IParseService) {
            this.$$scope = scope;

            var parentScope = scope.$parent;
            if (attributes) {
                attributes.forEach(attrBinding=> {
                    var attrName = utility.camelCaseTagName(attrBinding.name);
                    var ctrlProppertyName = attrBinding.ctrlName || attrName;
                    switch (attrBinding.type) {
                        case 'text':
                            if (!attrs.hasOwnProperty(attrName)) break;
                            this[ctrlProppertyName] = attrs[attrName];
                            attrs.$observe(attrName, (val, oldVal)=> {
                                this[ctrlProppertyName] = val;
                                triggerChangeEvent(this, ctrlProppertyName, val, oldVal);
                            });
                            break;
                        case 'expr':
                            // Don't assign Object.prototype method to scope
                            if (!attrs.hasOwnProperty(attrName)) {
                                this[ctrlProppertyName] = angular.noop;
                                break;
                            }

                            var parentGet = $parse(attrs[attrName]);

                            // Don't assign noop to destination if expression is not valid
                            if (parentGet === angular.noop) {
                                this[ctrlProppertyName] = angular.noop;
                                break;
                            }

                            this[ctrlProppertyName] = function (locals) {
                                return parentGet(parentScope, locals);
                            };
                            break;
                        default:
                            var attrValue = parentScope.$eval(attrs[attrName]);
                            this[ctrlProppertyName] = attrValue;
                            parentScope.$watch(attrs[attrName], (val, oldVal) => {
                                this[ctrlProppertyName] = val;
                                triggerChangeEvent(this, ctrlProppertyName, val, oldVal);
                            });
                            break;
                    }
                });
            }
            ctor.apply(this, Array.prototype.slice.call(arguments, additionalInjectables.length, arguments.length));
            return this;
        };
        wrapper.prototype = ctor.prototype;
        wrapper.$inject = wrapperInject;
        return wrapper;
    }

    function triggerChangeEvent(ctrl:any, propertyName:string, newValue:any, oldValue:any) {
        if (newValue === oldValue)
            return; // do not pass property id it does not change
        var methodName = propertyName + '_change';
        if (ctrl[methodName] && angular.isFunction(ctrl[methodName])) {
            ctrl[methodName].call(ctrl, newValue, oldValue);
        }
    }
} 
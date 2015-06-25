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
                directive.controller = JasperComponentWrapperFactory(ctor, this.extractAttributeBindings(def), this.utility);
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
                        result.push({
                            name: propertyName,
                            ctrlName: propertyName,
                            type: 'text'
                        });
                        // register another binding with 'bind-' prefix
                        result.push({
                            name: 'bind-' + propertyName,
                            ctrlName: propertyName,
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

    function JasperComponentWrapperFactory(ctor:any, bindings:IAttributeBinding[], utility:IUtilityService) {
        var additionalInjectables = ['$scope', '$attrs', '$parse', '$interpolate'];
        // add some injectables to the component
        var wrapperInject = additionalInjectables.concat(ctor.$inject || []);
        var attributes = camelCaseBindings(bindings, utility);
        var wrapper = function JasperComponentWrapper(scope:ng.IScope, attrs:any, $parse:ng.IParseService, $interpolate:ng.IInterpolateService) {
            this.$$scope = scope;
            var parentScope = scope.$parent;
            if (attributes.length) {
                var onNewScopeDestroyed = [];
                attributes.forEach(attrBinding => {
                    var attrName = attrBinding.name;
                    var ctrlProppertyName = attrBinding.ctrlName || attrName;
                    switch (attrBinding.type) {
                        case 'text':
                            if (!attrs.hasOwnProperty(attrName)) break;
                            this[ctrlProppertyName] = $interpolate(attrs[attrName])(parentScope);
                            var unbind = attrs.$observe(attrName, (val, oldVal) => {
                                changeCtrlProperty(this, ctrlProppertyName, val, oldVal);
                            });
                            onNewScopeDestroyed.push(unbind);
                            break;
                        case 'expr':
                        case 'event':
                            // Don't assign Object.prototype method to scope
                            if (!attrs.hasOwnProperty(attrName)) {
                                this[ctrlProppertyName] = angular.noop;
                                break;
                            }

                            var parentGet = null;

                            this[ctrlProppertyName] = function (locals) {
                                if (!parentGet) {
                                    parentGet = $parse(attrs[attrName])
                                }
                                if (parentGet === angular.noop) {
                                    return;
                                }
                                return parentGet(parentScope, locals);
                            };
                            break;
                        default:
                            if (!attrs.hasOwnProperty(attrName)) break;

                            var attrValue = parentScope.$eval(attrs[attrName]);
                            this[ctrlProppertyName] = attrValue;
                            var unwatch = parentScope.$watch(attrs[attrName], (val, oldVal) => {
                                changeCtrlProperty(this, ctrlProppertyName, val, oldVal);
                            });
                            onNewScopeDestroyed.push(unwatch);
                            break;
                    }
                });
                if (onNewScopeDestroyed.length) {
                    var unbindWatchers = function () {
                        for (var i = 0; i < onNewScopeDestroyed.length; i++) {
                            onNewScopeDestroyed[i]();
                        }
                        onNewScopeDestroyed = null;
                    }
                    scope.$on('$destroy', unbindWatchers);
                }
            }
            ctor.apply(this, Array.prototype.slice.call(arguments, additionalInjectables.length, arguments.length));
            return this;
        };
        wrapper.prototype = ctor.prototype;
        wrapper.$inject = wrapperInject;
        return wrapper;
    }

    function camelCaseBindings(bindings:IAttributeBinding[], utility:IUtilityService) {
        if (!bindings.length)
            return bindings;
        var result = [];
        for (var i = 0; i < bindings.length; i++) {
            result.push({
                name: utility.camelCaseTagName(bindings[i].name),
                ctrlName: bindings[i].ctrlName,
                type: bindings[i].type
            })
        }
        return result;
    }

    function changeCtrlProperty(ctrl:any, propertyName:string, newValue:any, oldValue:any) {
        if (newValue === oldValue)
            return; // do not pass property id it does not change
        ctrl[propertyName] = newValue;
        var methodName = propertyName + '_change';
        if (ctrl[methodName]) {
            ctrl[methodName].call(ctrl, newValue, oldValue);
        }
    }
} 
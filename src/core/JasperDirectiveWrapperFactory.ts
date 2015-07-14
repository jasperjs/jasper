module jasper.core {
    export function JasperDirectiveWrapperFactory(ctor:any,
                                                  bindings:IAttributeBinding[],
                                                  utility:IUtilityService,
                                                  isolateScope:boolean) {
        var additionalInjectables = ['$scope', '$element', '$attrs', '$parse', '$interpolate'];
        // add some injectables to the component
        var wrapperInject = additionalInjectables.concat(ctor.$inject || []);
        var attributes = camelCaseBindings(bindings, utility);
        var wrapper = function JasperComponentWrapper(scope:ng.IScope, $element:any, attrs:any, $parse:ng.IParseService, $interpolate:ng.IInterpolateService) {
            var ctrl = this;
            ctrl.$$scope = scope;

            var directiveScope = isolateScope ? scope.$parent : scope;

            var onNewScopeDestroyed = [];
            // bind attributes to the component
            if (attributes.length) {
                for (var i = 0; i < attributes.length; i++) {
                    bindAttribute(ctrl, attributes[i], directiveScope, attrs, $parse, $interpolate, onNewScopeDestroyed);
                }
            }
            // component ctor invocation:
            ctor.apply(ctrl, Array.prototype.slice.call(arguments, additionalInjectables.length, arguments.length));
            if (ctrl.initializeComponent) {
                ctrl.initializeComponent.call(ctrl);
            }
            // subscribe on scope destroying:
            var onDestroy = function () {
                if (onNewScopeDestroyed.length) {
                    for (var i = 0; i < onNewScopeDestroyed.length; i++) {
                        onNewScopeDestroyed[i]();
                    }
                }
                if (angular.isDefined(ctrl.destroyComponent)) {
                    ctrl.destroyComponent();
                }
                onNewScopeDestroyed = null;
                ctrl.$$scope = null;
            };
            if (isolateScope) {
                scope.$on('$destroy', () => onDestroy());
            } else {
                $element.on('$destroy', () => onDestroy())
            }
            // #bind-to syntax
            if (isolateScope && attrs.hasOwnProperty('#bindTo')) {
                var expr = $parse(attrs['#bindTo']);
                expr.assign(directiveScope, ctrl);
                if (attrs.hasOwnProperty('#onBound')) {
                    directiveScope.$eval(attrs['#onBound']);
                }
                //remove reference after scope destroyed
                scope.$on('$destroy', ()=> {
                    expr.assign(directiveScope, undefined);
                });
            }
            return ctrl;
        };
        wrapper.prototype = ctor.prototype;
        wrapper.$inject = wrapperInject;
        return wrapper;
    }

    function bindAttribute(ctrl:any,
                           attrBinding:IAttributeBinding,
                           directiveScope:ng.IScope,
                           attrs:any,
                           $parse:ng.IParseService,
                           $interpolate:ng.IInterpolateService,
                           onDestroyPool:Function[]) {

        var attrName = attrBinding.name;
        var ctrlPropertyName = attrBinding.ctrlName || attrName, lastValue;
        var parentValueWatch = (val)=> {
            if (val !== lastValue) {
                changeCtrlProperty(ctrl, ctrlPropertyName, val);
            }
            return lastValue = val;
        };
        switch (attrBinding.type) {
            case 'text':
                if (!attrs.hasOwnProperty(attrName)) break;
                ctrl[ctrlPropertyName] = lastValue = $interpolate(attrs[attrName])(directiveScope);
                var unbind = attrs.$observe(attrName, parentValueWatch);
                onDestroyPool.push(unbind);
                break;
            case 'expr':
            case 'event':
                // Don't assign Object.prototype method to scope
                var eventFn:Function;
                if (!attrs.hasOwnProperty(attrName)) {
                    eventFn = angular.noop;
                } else {
                    var parentGet:any = null;
                    eventFn = function (locals) {
                        if (!parentGet) {
                            parentGet = $parse(attrs[attrName])
                        }
                        if (parentGet === angular.noop) {
                            return;
                        }
                        return parentGet(directiveScope, locals);
                    };
                }
                ctrl[ctrlPropertyName] = attrBinding.$$eventEmitter ?
                    new EventEmitter(eventFn) : eventFn;

                break;
            default:
                if (!attrs.hasOwnProperty(attrName)) break;
                ctrl[ctrlPropertyName] = lastValue = directiveScope.$eval(attrs[attrName]);
                var unwatch = directiveScope.$watch($parse(attrs[attrName], parentValueWatch), null);
                onDestroyPool.push(unwatch);
                break;
        }

    }

    function camelCaseBindings(bindings:IAttributeBinding[], utility:IUtilityService) {
        if (!bindings.length)
            return bindings;
        var result = [];
        for (var i = 0; i < bindings.length; i++) {
            result.push({
                name: utility.camelCaseTagName(bindings[i].name),
                ctrlName: bindings[i].ctrlName,
                type: bindings[i].type,
                $$eventEmitter: bindings[i].$$eventEmitter
            })
        }
        return result;
    }

    function changeCtrlProperty(ctrl:any, propertyName:string, newValue:any) {
        if (newValue === ctrl[propertyName])
            return; // do not pass property id it does not change
        var oldValue = ctrl[propertyName];
        ctrl[propertyName] = newValue;
        var methodName = propertyName + '_change';
        if (ctrl[methodName]) {
            ctrl[methodName].call(ctrl, newValue, oldValue);
        }
    }
}
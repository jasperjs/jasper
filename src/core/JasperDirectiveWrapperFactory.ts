module jasper.core {
    export function JasperDirectiveWrapperFactory(ctor:any,
                                                  bindings:IAttributeBinding[],
                                                  utility:IUtilityService,
                                                  isolateScope: boolean) {
        var additionalInjectables = ['$scope', '$element', '$attrs', '$parse', '$interpolate'];
        // add some injectables to the component
        var wrapperInject = additionalInjectables.concat(ctor.$inject || []);
        var attributes = camelCaseBindings(bindings, utility);
        var wrapper = function JasperComponentWrapper(scope:ng.IScope, $element: any, attrs:any, $parse:ng.IParseService, $interpolate:ng.IInterpolateService) {
            this.$$scope = scope;
            var directiveScope = isolateScope ? scope.$parent: scope;
            if (attributes.length) {
                var onNewScopeDestroyed = [];
                attributes.forEach((attrBinding:IAttributeBinding) => {
                    var attrName = attrBinding.name;
                    var ctrlProppertyName = attrBinding.ctrlName || attrName;
                    switch (attrBinding.type) {
                        case 'text':
                            if (!attrs.hasOwnProperty(attrName)) break;
                            this[ctrlProppertyName] = $interpolate(attrs[attrName])(directiveScope);
                            var unbind = attrs.$observe(attrName, (val, oldVal) => {
                                changeCtrlProperty(this, ctrlProppertyName, val, oldVal);
                            });
                            onNewScopeDestroyed.push(unbind);
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
                            this[ctrlProppertyName] = attrBinding.$$eventEmitter ?
                                new EventEmitter(eventFn) : eventFn;

                            break;
                        default:
                            if (!attrs.hasOwnProperty(attrName)) break;

                            var attrValue = directiveScope.$eval(attrs[attrName]);
                            this[ctrlProppertyName] = attrValue;
                            var unwatch = directiveScope.$watch(attrs[attrName], (val, oldVal) => {
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
                    if(isolateScope) {
                        scope.$on('$destroy', unbindWatchers);
                    }else{
                        $element.on('$destroy', unbindWatchers)
                    }
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
                type: bindings[i].type,
                $$eventEmitter: bindings[i].$$eventEmitter
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
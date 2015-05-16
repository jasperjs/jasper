var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var UtilityService = (function () {
            function UtilityService() {
            }
            //getComponentControllers(controllers, directive:ng.IDirective):IComponentControllers {
            //    var controllersToPass;
            //    var controller:IHtmlComponent;
            //
            //    if (directive.require && angular.isArray(directive.require)) {
            //
            //        controller = controllers.shift();
            //        controllersToPass = controllers;
            //        if (controllersToPass.length === 1) {
            //            controllersToPass = controllersToPass[0];
            //        }
            //
            //    } else {
            //        controller = controllers;
            //        controllersToPass = controller;
            //    }
            //    return {
            //        main: controller,
            //        controllersToPass: controllersToPass
            //    }
            //}
            UtilityService.prototype.getFactoryOf = function (component) {
                if (angular.isString(component)) {
                    var result = this.getter(window, component);
                    if (!result) {
                        throw 'Constructor defined as \"' + component + '\" not found';
                    }
                    return result;
                }
                else if (angular.isFunction(component)) {
                    return component;
                }
                else {
                    throw "Unknown component definition " + component;
                }
            };
            UtilityService.prototype.snakeCase = function (source) {
                var snakeCaseRegexp = /[A-Z]/g;
                var separator = '-';
                return source.replace(snakeCaseRegexp, function (letter, pos) { return (pos ? separator : '') + letter.toLowerCase(); });
            };
            UtilityService.prototype.camelCase = function (source) {
                var regex = /[A-Z]/g;
                return source.replace(regex, function (letter, pos) { return pos ? letter : letter.toLowerCase(); });
            };
            UtilityService.prototype.camelCaseTagName = function (tagName) {
                if (tagName.indexOf('-') < 0) {
                    return this.camelCase(tagName);
                }
                return tagName.replace(/\-(\w)/g, function (match, letter) { return letter.toUpperCase(); });
            };
            UtilityService.prototype.getter = function (obj, path) {
                var keys = path.split('.');
                var key, len = keys.length;
                for (var i = 0; i < len; i++) {
                    key = keys[i];
                    obj = obj[key];
                    if (!obj) {
                        return undefined;
                    }
                }
                return obj;
            };
            return UtilityService;
        })();
        core.UtilityService = UtilityService;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var HtmlComponentRegistrar = (function () {
            function HtmlComponentRegistrar() {
                this.utility = new core.UtilityService();
                HtmlComponentRegistrar.directives.push(angular.If);
                HtmlComponentRegistrar.directives.push(angular.For);
            }
            HtmlComponentRegistrar.prototype.register = function (component) {
                var ng2ComponentDef = {
                    selector: component.name
                };
                var ng2ViewDef = {};
                if (component.templateUrl) {
                    ng2ViewDef.templateUrl = component.templateUrl;
                }
                else if (component.template) {
                    ng2ViewDef.template = component.template;
                }
                ng2ViewDef.directives = HtmlComponentRegistrar.directives;
                //TODO process $inject field
                //TODO attributes property
                var ctrl = component.ctrl;
                ctrl['annotations'] = [new angular.ComponentAnnotation(ng2ComponentDef), new angular.ViewAnnotation(ng2ViewDef)];
                HtmlComponentRegistrar.directives.push(ctrl);
            };
            //private bindController(def:IHtmlComponentDefinition, scope:ng.IScope, ctrl:IHtmlComponent, attrs) {
            //    if (!def.attributes)
            //        return;
            //
            //    for (var i = 0; i < def.attributes.length; i++) {
            //        var attrName = def.attributes[i].name;
            //        var attrType = def.attributes[i].type || 'data';
            //
            //        var propertyName = this.utility.camelCaseTagName(attrName);
            //
            //        if (angular.isDefined(attrs[propertyName])) {
            //
            //            switch (attrType.toUpperCase()) {
            //                case 'DATA':
            //                    this.bindChangeMethod(propertyName, ctrl, scope);
            //                    break;
            //                case 'EXPR':
            //                    break;
            //                case 'TEXT':
            //                    this.bindChangeMethod(propertyName, ctrl, scope);
            //                    break;
            //                default:
            //                    throw 'Unknown attribute type: ' + attrType
            //            }
            //
            //        }
            //    }
            //
            //}
            //private bindChangeMethod(attributeName:string
            //    , ctrl:IHtmlComponent
            //    , scope:ng.IScope) {
            //
            //    var methodName = attributeName + '_change';
            //    if (ctrl[methodName] && angular.isFunction(ctrl[methodName])) {
            //        scope.$watch(()=> ctrl[attributeName], (val, oldVal) => {
            //            if (val === oldVal)
            //                return; // do not pass property id it does not change
            //            ctrl[methodName](val, oldVal);
            //        });
            //    }
            //
            //}
            HtmlComponentRegistrar.prototype.getScopeDefinition = function (def) {
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
            };
            HtmlComponentRegistrar.prototype.getRequirementsForComponent = function (component) {
                if (angular.isDefined(component.require)) {
                    var req = [component.name];
                    if (angular.isArray(component.require))
                        req = req.concat(component.require);
                    else
                        req.push(component.require);
                    return req;
                }
                else {
                    return component.name;
                }
            };
            HtmlComponentRegistrar.directives = [];
            return HtmlComponentRegistrar;
        })();
        core.HtmlComponentRegistrar = HtmlComponentRegistrar;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var ComponentProvider = (function () {
            function ComponentProvider() {
                this.componentRegistar = new core.HtmlComponentRegistrar();
            }
            ComponentProvider.prototype.register = function (component) {
                this.componentRegistar.register(component);
            };
            return ComponentProvider;
        })();
        core.ComponentProvider = ComponentProvider;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var GlobalEventsService = (function () {
            function GlobalEventsService() {
                this.events = {};
            }
            GlobalEventsService.prototype.subscribe = function (eventName, listener) {
                var _this = this;
                if (!this.events[eventName])
                    this.events[eventName] = { queue: [] };
                this.events[eventName].queue.push(listener);
                return {
                    remove: function () {
                        _this.removeSubscription(eventName, listener);
                    }
                };
            };
            GlobalEventsService.prototype.broadcast = function (eventName) {
                var _this = this;
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                if (!this.events[eventName])
                    return;
                var queue = this.events[eventName].queue;
                queue.forEach(function (listener) {
                    listener.apply(_this, args);
                });
            };
            GlobalEventsService.prototype.removeSubscription = function (eventName, listener) {
                if (!this.events[eventName])
                    return;
                var queue = this.events[eventName].queue;
                for (var i = 0; i < queue.length; i++) {
                    if (queue[i] === listener) {
                        queue.splice(i, 1);
                        break;
                    }
                }
            };
            return GlobalEventsService;
        })();
        core.GlobalEventsService = GlobalEventsService;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var JasperStatic = (function () {
        function JasperStatic() {
            this.readyQueue = [];
        }
        JasperStatic.prototype.component = function (def) {
            this.componentProvider.register(def);
        };
        JasperStatic.prototype.init = function (componentProvider) {
            this.componentProvider = componentProvider;
        };
        JasperStatic.prototype.ready = function (cb) {
            if (!cb) {
                this.readyQueue.forEach(function (subscriber) {
                    subscriber();
                });
                this.readyQueue = []; // flush subscriber queue
                this.isReady = true;
                return;
            }
            if (this.isReady) {
                cb();
            }
            else {
                this.readyQueue.push(cb);
            }
        };
        return JasperStatic;
    })();
    jasper.JasperStatic = JasperStatic;
    window['jsp'] = new JasperStatic();
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    window['jsp'].init(new jasper.core.ComponentProvider());
})(jasper || (jasper = {}));
// CORE
/// <reference path="core/IComponentControllers.ts" />
/// <reference path="core/IHtmlRegistrar.ts" />
/// <reference path="core/UtilityService.ts" />
/// <reference path="core/components/HtmlComponentRegistrar.ts" />
/// <reference path="core/components/IComponentProvider.ts" />
/// <reference path="core/components/IHtmlComponent.ts" />
/// <reference path="core/components/IAttributeBinding.ts" />
/// <reference path="core/components/IHtmlComponentDefinition.ts" />
/// <reference path="core/GlobalEvents.ts" />
/// <reference path="JasperStatic.ts" />
/// <reference path="jasper.ts" />
//# sourceMappingURL=jasper.js.map
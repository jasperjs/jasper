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
            function HtmlComponentRegistrar(svcRegistrar) {
                this.svcRegistrar = svcRegistrar;
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
                this.applyInjectables(ng2ComponentDef, component);
                this.applyAttributes(ng2ComponentDef, component);
                this.applyLifecycle(ng2ComponentDef, component);
                var ctrl = component.noWrap ? component.ctrl : JasperComponentWrapperFactory(component.ctrl, ng2ComponentDef.events);
                if (!ctrl['annotations']) {
                    ctrl['annotations'] = [];
                }
                ctrl['annotations'].push(new angular.ComponentAnnotation(ng2ComponentDef));
                ctrl['annotations'].push(new angular.ViewAnnotation(ng2ViewDef));
                HtmlComponentRegistrar.directives.push(ctrl);
            };
            HtmlComponentRegistrar.prototype.applyAttributes = function (ng2ComponentDef, def) {
                if (!def.attributes)
                    return;
                var ngProperties = {};
                var ngEvents = [];
                for (var i = 0; i < def.attributes.length; i++) {
                    var attrName = def.attributes[i].name;
                    var attrType = def.attributes[i].type || 'data';
                    switch (attrType.toUpperCase()) {
                        case 'DATA':
                        case 'TEXT':
                            ngProperties[attrName] = attrName; // one to one binding
                            break;
                        case 'EXPR':
                            ngEvents.push(this.utility.camelCaseTagName(attrName));
                            break;
                        default:
                            throw 'Unknown attribute type: ' + attrType;
                    }
                }
                ng2ComponentDef.properties = ngProperties;
                ng2ComponentDef.events = ngEvents;
            };
            HtmlComponentRegistrar.prototype.applyLifecycle = function (ng2ComponentDef, component) {
                var lifeCycles = ['onDestroy', 'onChange', 'onAllChangesDone'];
                ng2ComponentDef.lifecycle = [];
                var prototype = component.ctrl.prototype;
                for (var i = 0; i < lifeCycles.length; i++) {
                    var lf = lifeCycles[i];
                    if (prototype[lf] && typeof (prototype[lf]) === 'function' && angular[lf]) {
                        ng2ComponentDef.lifecycle.push(angular[lf]);
                    }
                }
            };
            HtmlComponentRegistrar.prototype.applyInjectables = function (ng2ComponentDef, component) {
                var legacyInjects = component.ctrl['$inject'];
                if (!legacyInjects)
                    return;
                var injectables = [];
                var parameters = [];
                for (var i = 0; i < legacyInjects.length; i++) {
                    var serviceNameToInject = legacyInjects[i];
                    var svcType = this.svcRegistrar.getTypeByName(serviceNameToInject);
                    if (!svcType) {
                        throw 'Service with name \"' + serviceNameToInject + '\" does not registred';
                    }
                    injectables.push(svcType);
                    parameters.push([svcType]);
                }
                component.ctrl['parameters'] = parameters;
                ng2ComponentDef['injectables'] = injectables;
            };
            HtmlComponentRegistrar.directives = [];
            return HtmlComponentRegistrar;
        })();
        core.HtmlComponentRegistrar = HtmlComponentRegistrar;
        function JasperComponentWrapperFactory(ctrl, events) {
            var wrapper = function JasperCompnentWrapper() {
                if (ctrl) {
                    //var obj = Object.create(ctrl.prototype);
                    // TODO event system compatibility
                    //for (var i = 0; i < events.length; i++) {
                    //    var evtName = events[i]; var evtEmitterProp = '$$jsp' + evtName];
                    //    obj[evtEmitterProp] = new angular.EventEmitter();
                    //
                    //    obj[evtName] = function(params){
                    //        obj[evtEmitterProp].next();
                    //    }
                    //}
                    ctrl.apply(this, arguments);
                    // TODO invoke initializeComponent()
                    // TODO check if link function defined - drop NotSupportException
                    return this;
                }
                return this;
            };
            if (ctrl) {
                wrapper.prototype = ctrl.prototype;
            }
            return wrapper;
        }
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var ServiceRegistrar = (function () {
            function ServiceRegistrar() {
                this.utility = new core.UtilityService();
            }
            ServiceRegistrar.prototype.register = function (def) {
                if (!def.ctor) {
                    throw new Error(def.name + ' must specify constructor');
                }
                ServiceRegistrar.allServices[def.name] = def.ctor;
            };
            ServiceRegistrar.prototype.getTypeByName = function (name) {
                return ServiceRegistrar.allServices[name];
            };
            ServiceRegistrar.allServices = {};
            return ServiceRegistrar;
        })();
        core.ServiceRegistrar = ServiceRegistrar;
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
            this.serviceRegistrar = new jasper.core.ServiceRegistrar();
            this.componentRegistrar = new jasper.core.HtmlComponentRegistrar(this.serviceRegistrar);
        }
        JasperStatic.prototype.component = function (def) {
            this.componentRegistrar.register(def);
        };
        JasperStatic.prototype.service = function (def) {
            this.serviceRegistrar.register(def);
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
// CORE
/// <reference path="core/IComponentControllers.ts" />
/// <reference path="core/IHtmlRegistrar.ts" />
/// <reference path="core/UtilityService.ts" />
/// <reference path="core/components/HtmlComponentRegistrar.ts" />
/// <reference path="core/components/IHtmlComponent.ts" />
/// <reference path="core/components/IAttributeBinding.ts" />
/// <reference path="core/components/IHtmlComponentDefinition.ts" />
// SERVICES
/// <reference path="core/services/IServiceDefinition.ts" />
/// <reference path="core/services/ServiceRegistrar.ts" />
/// <reference path="core/GlobalEvents.ts" />
/// <reference path="JasperStatic.ts" />
//# sourceMappingURL=jasper.js.map
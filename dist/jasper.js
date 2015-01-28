var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var UtilityService = (function () {
            function UtilityService() {
            }
            UtilityService.prototype.getComponentControllers = function (controllers, directive) {
                var controllersToPass;
                var controller;
                if (directive.require && angular.isArray(directive.require)) {
                    controller = controllers.shift();
                    controllersToPass = controllers;
                    if (controllersToPass.length === 1) {
                        controllersToPass = controllersToPass[0];
                    }
                }
                else {
                    controller = controllers;
                    controllersToPass = controller;
                }
                return {
                    main: controller,
                    controllersToPass: controllersToPass
                };
            };
            UtilityService.prototype.getFactoryOf = function (component) {
                if (angular.isString(component)) {
                    var result;
                    try {
                        result = eval(component);
                    }
                    catch (e) {
                        throw 'Factory defined as \"' + component + '\" not found';
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
            function HtmlComponentRegistrar(compileProvider) {
                this.directive = compileProvider.directive;
                this.utility = new core.UtilityService();
            }
            HtmlComponentRegistrar.prototype.register = function (component) {
                var _this = this;
                var ddo = this.createDirectiveFor(component);
                if (ddo.controller) {
                    ddo.compile = function () {
                        return {
                            pre: function (scope, element, attrs, controllers, tranclude) {
                                var ctrls = _this.utility.getComponentControllers(controllers, ddo);
                                _this.passPropertiesToCtrl(component, scope, ctrls.main, attrs);
                                ctrls.main.$$scope = scope;
                                if (ctrls.main.initializeComponent && angular.isFunction(ctrls.main.initializeComponent))
                                    ctrls.main.initializeComponent();
                                if (ctrls.main.destroyComponent && angular.isFunction(ctrls.main.destroyComponent)) {
                                    scope.$on('$destroy', function () {
                                        ctrls.main.destroyComponent();
                                    });
                                }
                            },
                            post: function (scope, element, attrs, controllers, tranclude) {
                                var ctrls = _this.utility.getComponentControllers(controllers, ddo);
                                if (ctrls.main.link) {
                                    ctrls.main.link(element[0], ctrls.controllersToPass, tranclude);
                                }
                            }
                        };
                    };
                }
                this.directive(component.name, function () { return ddo; });
            };
            HtmlComponentRegistrar.prototype.passPropertiesToCtrl = function (def, scope, ctrl, attrs) {
                if (!def.attributes)
                    return;
                for (var i = 0; i < def.attributes.length; i++) {
                    var attrName = def.attributes[i].name;
                    var attrType = def.attributes[i].type || 'data';
                    var propertyName = this.utility.camelCaseTagName(attrName);
                    if (angular.isDefined(attrs[propertyName])) {
                        switch (attrType.toUpperCase()) {
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
                                throw 'Unknown attribute type: ' + attrType;
                        }
                    }
                }
            };
            HtmlComponentRegistrar.prototype.setupCtrlValue = function (attributeName, ctrl, scope, watch) {
                ctrl[attributeName] = scope[attributeName];
                if (watch) {
                    scope.$watch(attributeName, function (val, oldVal) {
                        if (angular.isUndefined(val) && angular.isUndefined(oldVal))
                            return; // do not pass undefined properties to the component
                        ctrl[attributeName] = val;
                        var methodName = attributeName + '_change';
                        if (ctrl[methodName] && angular.isFunction(ctrl[methodName])) {
                            ctrl[methodName](val, oldVal);
                        }
                    });
                    scope.$watch(function () {
                        return ctrl[attributeName];
                    }, function (val) {
                        scope[attributeName] = val;
                    });
                }
            };
            HtmlComponentRegistrar.prototype.createDirectiveFor = function (def) {
                var directive = {
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
            };
            HtmlComponentRegistrar.prototype.getScopeDefinition = function (def) {
                var scope = {};
                if (!def.attributes)
                    return scope;
                for (var i = 0; i < def.attributes.length; i++) {
                    var attr = def.attributes[i];
                    if (!attr.name) {
                        throw 'Attribute name not specified of: ' + JSON.stringify(attr);
                    }
                    var angularBinding = '='; // default attribute binding
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
            function ComponentProvider($compileProvider) {
                this.componentRegistar = new core.HtmlComponentRegistrar($compileProvider);
            }
            ComponentProvider.prototype.register = function (component) {
                this.componentRegistar.register(component);
            };
            ComponentProvider.prototype.$get = function () {
                return {};
            };
            ComponentProvider.$inject = ['$compileProvider'];
            return ComponentProvider;
        })();
        core.ComponentProvider = ComponentProvider;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var DecoratorComponentProvider = (function () {
            function DecoratorComponentProvider($compileProvider) {
                this.decoratorRegistar = new jasper.core.HtmlDecoratorRegistrar($compileProvider);
            }
            DecoratorComponentProvider.prototype.register = function (decorator) {
                this.decoratorRegistar.register(decorator);
            };
            DecoratorComponentProvider.prototype.$get = function () {
                return {};
            };
            DecoratorComponentProvider.$inject = ['$compileProvider'];
            return DecoratorComponentProvider;
        })();
        core.DecoratorComponentProvider = DecoratorComponentProvider;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var HtmlDecoratorRegistrar = (function () {
            function HtmlDecoratorRegistrar(compileProvider) {
                this.directive = compileProvider.directive;
                this.utility = new core.UtilityService();
            }
            HtmlDecoratorRegistrar.prototype.register = function (component) {
                var ddo = this.createDirectiveFor(component);
                this.directive(component.name, function () { return ddo; });
            };
            HtmlDecoratorRegistrar.prototype.createDirectiveFor = function (def) {
                var _this = this;
                var directive = {
                    restrict: 'A',
                    scope: false
                };
                if (!def.ctor) {
                    throw new Error(def.name + ' must specify constructor');
                }
                directive.scope[def.name] = '=';
                directive.controller = this.utility.getFactoryOf(def.ctor);
                directive.require = this.getRequirementsForComponent(def);
                directive.link = function (scope, element, attrs, controllers) {
                    var ctrls = _this.utility.getComponentControllers(controllers, directive);
                    ctrls.main.$$scope = scope;
                    var attrExpr = attrs[def.name];
                    var eval = angular.isDefined(def.eval) ? def.eval : true;
                    var value = undefined;
                    if (angular.isDefined(attrExpr)) {
                        value = eval ? scope.$eval(attrExpr) : attrExpr;
                    }
                    if (ctrls.main.link)
                        ctrls.main.link(value, element[0], attrs, ctrls.controllersToPass);
                    if (ctrls.main.onValueChanged && attrs[def.name] && eval) {
                        scope.$watch(attrExpr, function (newValue, oldValue) {
                            ctrls.main.onValueChanged(newValue, oldValue);
                        });
                    }
                    if (ctrls.main.destroyComponent && angular.isFunction(ctrls.main.destroyComponent)) {
                        // when element is destroyed - invoke component method
                        element.on('$destroy', function () {
                            ctrls.main.destroyComponent();
                        });
                    }
                };
                return directive;
            };
            HtmlDecoratorRegistrar.prototype.getRequirementsForComponent = function (component) {
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
            HtmlDecoratorRegistrar.prototype.getComponentControllers = function (controllers, directive) {
                var controllersToPass;
                var controller;
                if (directive.require && angular.isArray(directive.require)) {
                    controller = controllers.shift();
                    controllersToPass = controllers;
                    if (controllersToPass.length === 1) {
                        controllersToPass = controllersToPass[0];
                    }
                }
                else {
                    controller = controllers;
                    controllersToPass = controller;
                }
                return {
                    main: controller,
                    controllersToPass: controllersToPass
                };
            };
            return HtmlDecoratorRegistrar;
        })();
        core.HtmlDecoratorRegistrar = HtmlDecoratorRegistrar;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var FilterProvider = (function () {
            function FilterProvider($filterProvider) {
                this.filterRegistar = new core.FilterRegistrar($filterProvider);
            }
            FilterProvider.prototype.register = function (filter) {
                this.filterRegistar.register(filter);
            };
            FilterProvider.prototype.$get = function () {
                return {};
            };
            FilterProvider.$inject = ['$filterProvider'];
            return FilterProvider;
        })();
        core.FilterProvider = FilterProvider;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var FilterRegistrar = (function () {
            function FilterRegistrar(filterProvider) {
                this.filter = filterProvider.register;
                this.utility = new core.UtilityService();
            }
            FilterRegistrar.prototype.register = function (def) {
                if (!def.ctor) {
                    throw new Error(def.name + ' must specify constructor');
                }
                var factory = this.utility.getFactoryOf(def.ctor);
                this.filter(def.name, factory);
            };
            return FilterRegistrar;
        })();
        core.FilterRegistrar = FilterRegistrar;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var ServiceProvider = (function () {
            function ServiceProvider($provide) {
                this.serviceRegistar = new jasper.core.ServiceRegistrar($provide);
            }
            ServiceProvider.prototype.register = function (serviceDef) {
                this.serviceRegistar.register(serviceDef);
            };
            ServiceProvider.prototype.$get = function () {
                return {};
            };
            ServiceProvider.$inject = ['$provide'];
            return ServiceProvider;
        })();
        core.ServiceProvider = ServiceProvider;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var ServiceRegistrar = (function () {
            function ServiceRegistrar(provide) {
                this.service = provide.service;
                this.utility = new core.UtilityService();
            }
            ServiceRegistrar.prototype.register = function (def) {
                if (!def.ctor) {
                    throw new Error(def.name + ' must specify constructor');
                }
                var factory = this.utility.getFactoryOf(def.ctor);
                this.service(def.name, factory);
            };
            return ServiceRegistrar;
        })();
        core.ServiceRegistrar = ServiceRegistrar;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var core;
    (function (core) {
        var ValueProvider = (function () {
            function ValueProvider(provide) {
                this.provide = provide;
            }
            ValueProvider.prototype.register = function (name, value) {
                this.provide.value(name, value);
            };
            ValueProvider.prototype.$get = function () {
                return this;
            };
            ValueProvider.$inject = ['$provide'];
            return ValueProvider;
        })();
        core.ValueProvider = ValueProvider;
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
    var core;
    (function (core) {
        var JasperComponent = (function () {
            function JasperComponent() {
            }
            JasperComponent.prototype.$digest = function () {
                this.ensureScope();
                this.$$scope.$digest();
            };
            JasperComponent.prototype.$apply = function () {
                this.ensureScope();
                this.$$scope.$apply();
            };
            JasperComponent.prototype.$on = function (eventName, listener) {
                this.ensureScope();
                this.$$scope.$on(eventName, listener);
            };
            JasperComponent.prototype.$watch = function (watchExpression, listener, objectEquality) {
                this.ensureScope();
                this.$$scope.$watch(watchExpression, listener, objectEquality);
            };
            JasperComponent.prototype.$watchCollection = function (watchExpression, listener) {
                this.ensureScope();
                this.$$scope.$watchCollection(watchExpression, listener);
            };
            JasperComponent.prototype.$watchGroup = function (watchExpressions, listener) {
                this.ensureScope();
                this.$$scope.$watchGroup(watchExpressions, listener);
            };
            JasperComponent.prototype.ensureScope = function () {
                if (!this.$$scope)
                    throw '$$scope not initialized';
            };
            return JasperComponent;
        })();
        core.JasperComponent = JasperComponent;
    })(core = jasper.core || (jasper.core = {}));
})(jasper || (jasper = {}));
angular.module('jasperCore', ['ng']).provider('jasperComponent', jasper.core.ComponentProvider).provider('jasperDecorator', jasper.core.DecoratorComponentProvider).provider('jasperService', jasper.core.ServiceProvider).provider('jasperFilter', jasper.core.FilterProvider).provider('jasperValue', jasper.core.ValueProvider).service('$globalEvents', jasper.core.GlobalEventsService);
var jasper;
(function (jasper) {
    var areas;
    (function (areas) {
        var JasperAreaDirective = (function () {
            function JasperAreaDirective($compile, jasperAreasService, $q) {
                var processingCssClasses = "ng-hide app-module-loading";
                var directive = {
                    priority: 1000,
                    terminal: true,
                    restrict: 'A',
                    compile: function (tElement, attrs) {
                        tElement.addClass(processingCssClasses);
                        tElement.removeAttr('data-jasper-module').removeAttr('jasper-area');
                        return {
                            pre: function (scope, element, iAttrs, controller) {
                                var moduleName = iAttrs["jasperArea"];
                                var moduleNames = moduleName.split(',');
                                var allModulesPromises = [];
                                for (var i = 0; i < moduleNames.length; i++) {
                                    allModulesPromises.push(jasperAreasService.loadAreas(moduleNames[i]));
                                }
                                $q.all(allModulesPromises).then(function () {
                                    var linkFn = element.data('$compileresult');
                                    if (!linkFn) {
                                        element.removeAttr('data-jasper-module').removeAttr('jasper-area');
                                        element.removeClass(processingCssClasses);
                                        linkFn = $compile(element);
                                        element.data('$compileresult', linkFn);
                                    }
                                    else {
                                        element.removeClass(processingCssClasses);
                                    }
                                    linkFn(scope);
                                    //element.append(clone);
                                });
                            }
                        };
                    }
                };
                return directive;
            }
            JasperAreaDirective.$inject = ['$compile', 'jasperAreasService', '$q'];
            return JasperAreaDirective;
        })();
        areas.JasperAreaDirective = JasperAreaDirective;
    })(areas = jasper.areas || (jasper.areas = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var areas;
    (function (areas) {
        // Area, downloading now...
        var AreaDefers = (function () {
            function AreaDefers(name) {
                this.name = name;
                //Waiting promises
                this.defers = [];
            }
            return AreaDefers;
        })();
        // Collection of waiting areas
        var LoadingAreasIdleCollection = (function () {
            function LoadingAreasIdleCollection(q) {
                this.q = q;
                this.loadingAreas = [];
                this.initAreas = [];
            }
            LoadingAreasIdleCollection.prototype.isLoading = function (areaname) {
                return this.getLoadingAreaByName(areaname) != null;
            };
            // Mark that area is loading
            LoadingAreasIdleCollection.prototype.startLoading = function (areaname) {
                if (this.isLoading(areaname))
                    throw areaname + ' allready loading';
                var loading = new AreaDefers(areaname);
                this.loadingAreas.push(loading);
            };
            // Mark that area is loading
            LoadingAreasIdleCollection.prototype.addInitializer = function (areaname) {
                if (!this.isLoading(areaname))
                    throw areaname + ' does not loading';
                var d = this.q.defer();
                var initDefers = this.getInitDefersByName(areaname);
                if (initDefers) {
                    initDefers.defers.push(d);
                }
                else {
                    var init = new AreaDefers(areaname);
                    init.defers.push(d);
                    this.initAreas.push(init);
                }
                return d.promise;
            };
            // Notify when area is loaded
            LoadingAreasIdleCollection.prototype.onAreaLoaded = function (areaName) {
                var loadingSection = this.getLoadingAreaByName(areaName);
                if (loadingSection == null)
                    throw areaName + ' not loading';
                var d = this.q.defer();
                loadingSection.defers.push(d);
                return d.promise;
            };
            // Notify
            LoadingAreasIdleCollection.prototype.notifyOnLoaded = function (areaName) {
                var loadingArea = this.getLoadingAreaByName(areaName);
                if (loadingArea == null)
                    throw areaName + ' not loading';
                this.resolveInitializers(areaName);
                for (var j = 0; j < loadingArea.defers.length; j++) {
                    loadingArea.defers[j].resolve();
                }
                // Remove area from loading area collection
                var i = this.loadingAreas.indexOf(loadingArea);
                if (i > -1) {
                    this.loadingAreas.splice(i, 1);
                }
            };
            LoadingAreasIdleCollection.prototype.resolveInitializers = function (areaName) {
                var initDefers = this.getInitDefersByName(areaName);
                if (initDefers && initDefers.defers.length) {
                    initDefers.defers.forEach(function (defer) {
                        defer.resolve();
                    });
                    initDefers.defers = [];
                }
            };
            LoadingAreasIdleCollection.prototype.getLoadingAreaByName = function (name) {
                return this.filterDefersByName(name, this.loadingAreas);
            };
            LoadingAreasIdleCollection.prototype.getInitDefersByName = function (name) {
                return this.filterDefersByName(name, this.initAreas);
            };
            LoadingAreasIdleCollection.prototype.filterDefersByName = function (name, collection) {
                for (var i = 0; i < collection.length; i++) {
                    if (collection[i].name === name)
                        return collection[i];
                }
                return null;
            };
            return LoadingAreasIdleCollection;
        })();
        // Object load areas
        var JasperAreasService = (function () {
            function JasperAreasService($q) {
                this.loadedAreas = [];
                this.resourceManager = new areas.JasperResourcesManager();
                this.q = $q;
                this.loadiingModules = new LoadingAreasIdleCollection(this.q);
            }
            JasperAreasService.prototype.configure = function (config) {
                this.config = config;
            };
            JasperAreasService.prototype.onAreaLoaded = function (areaName) {
                if (this.isAreaLoaded(areaName)) {
                    return this.q.when(true);
                }
                else {
                    return this.loadAreas(areaName);
                }
            };
            JasperAreasService.prototype.initArea = function (areaName) {
                return this.loadiingModules.addInitializer(areaName);
            };
            JasperAreasService.prototype.loadAreas = function (areaName, hops /* avoid loop */) {
                var _this = this;
                if (hops === void 0) { hops = 0; }
                if (!this.config)
                    throw "Resources not configure";
                var section = this.config[areaName];
                if (!section)
                    throw "Config with name '" + areaName + "' not found";
                //dependencies:
                hops++;
                if (hops > JasperAreasService.maxDependencyHops)
                    throw 'Possible cyclic dependencies found on module: ' + areaName;
                var allDependencies = []; // list of all deps of this module
                for (var i = 0; i < section.dependencies.length; i++) {
                    var depSection = section.dependencies[i]; //current section depends on it
                    allDependencies.push(this.loadAreas(depSection, hops));
                }
                var defer = this.q.defer();
                this.q.all(allDependencies).then(function () {
                    //all dependencies loaded
                    if (_this.isAreaLoaded(areaName)) {
                        defer.resolve();
                    }
                    else if (_this.loadiingModules.isLoading(areaName)) {
                        _this.loadiingModules.onAreaLoaded(areaName).then(function () { return defer.resolve(); });
                    }
                    else {
                        _this.loadiingModules.startLoading(areaName);
                        _this.resourceManager.makeAccessible(_this.prepareUrls(section.scripts), _this.prepareUrls(section.styles), function () {
                            _this.loadiingModules.notifyOnLoaded(areaName);
                            defer.resolve();
                        });
                    }
                });
                return defer.promise;
            };
            JasperAreasService.prototype.isAreaLoaded = function (areaname) {
                return this.loadedAreas.indexOf(areaname) >= 0;
            };
            JasperAreasService.prototype.prepareUrls = function (urls) {
                if (!urls)
                    return [];
                var result = [];
                for (var i = 0; i < urls.length; i++) {
                    if (urls[i].charAt(0) == '/')
                        result.push(urls[i]);
                    else
                        result.push((this.config['_rootPath'] || '') + urls[i]);
                }
                return result;
            };
            JasperAreasService.$inject = ['$q'];
            JasperAreasService.maxDependencyHops = 10;
            return JasperAreasService;
        })();
        areas.JasperAreasService = JasperAreasService;
    })(areas = jasper.areas || (jasper.areas = {}));
})(jasper || (jasper = {}));
var jasper;
(function (jasper) {
    var areas;
    (function (areas) {
        // Service reference resources to the page
        var JasperResourcesManager = (function () {
            function JasperResourcesManager() {
            }
            JasperResourcesManager.prototype.buildScripts = function (scripts) {
                if (!scripts || scripts.length == 0)
                    return [];
                var result = [];
                for (var i = 0; i < scripts.length; i++) {
                    if (this.inArray(JasperResourcesManager.loadedScriptPaths, scripts[i])) {
                        continue;
                    }
                    JasperResourcesManager.loadedScriptPaths.push(scripts[i]);
                    result.push(scripts[i]);
                }
                return result;
            };
            JasperResourcesManager.prototype.inArray = function (source, val) {
                for (var i = 0; i < source.length; i++) {
                    if (source[i] == val)
                        return true;
                }
                return false;
            };
            JasperResourcesManager.prototype.makeAccessible = function (scripts, styles, onReady) {
                var resources = this.buildScripts(scripts);
                if (resources.length > 0) {
                    $script(resources, function () { return onReady(); });
                }
                else {
                    onReady();
                }
            };
            JasperResourcesManager.loadedScriptPaths = [];
            return JasperResourcesManager;
        })();
        areas.JasperResourcesManager = JasperResourcesManager;
    })(areas = jasper.areas || (jasper.areas = {}));
})(jasper || (jasper = {}));
angular.module('jasperAreas', ['jasperCore']).service('jasperAreasService', jasper.areas.JasperAreasService).directive('jasperArea', jasper.areas.JasperAreaDirective).config(['jasperComponentProvider', function (jasperComponents) {
}]);
var jasper;
(function (jasper) {
    var routing;
    (function (routing) {
        var JasperRouteTableProvider = (function () {
            function JasperRouteTableProvider(routeProvider) {
                this.routeProvider = routeProvider;
            }
            JasperRouteTableProvider.prototype.setup = function (config) {
                var _this = this;
                angular.forEach(config.routes, function (route, path) {
                    var routeConf = { template: route.template };
                    if (route.template) {
                        routeConf['template'] = route.template;
                    }
                    if (route.templateUrl) {
                        routeConf['template'] = '<div ng-include="\'' + route.templateUrl + '\'"></div>';
                    }
                    routeConf['caseInsensitiveMatch'] = true;
                    if (angular.isDefined(route.reloadOnSearch))
                        routeConf['reloadOnSearch'] = route.reloadOnSearch;
                    else
                        routeConf['reloadOnSearch'] = false;
                    if (route.redirectTo) {
                        routeConf['redirectTo'] = route.redirectTo;
                    }
                    if (route.area) {
                        routeConf['resolve'] = {
                            _m: [
                                'jasperAreasService',
                                function (jasperAreasService) {
                                    // async load required areas before change route
                                    return jasperAreasService.loadAreas(route.area);
                                }
                            ]
                        };
                    }
                    routeConf['prerender'] = route.prerender;
                    _this.routeProvider.when(path, routeConf);
                });
                if (config.defaultRoutePath) {
                    this.routeProvider.otherwise({ redirectTo: config.defaultRoutePath });
                }
            };
            JasperRouteTableProvider.prototype.$get = function () {
                return this;
            };
            JasperRouteTableProvider.$inject = ['$routeProvider'];
            return JasperRouteTableProvider;
        })();
        routing.JasperRouteTableProvider = JasperRouteTableProvider;
    })(routing = jasper.routing || (jasper.routing = {}));
})(jasper || (jasper = {}));
angular.module('jasperRoutes', ['jasperAreas']).provider('jasperRoute', jasper.routing.JasperRouteTableProvider);
var jasper;
(function (jasper) {
    angular.module('jasper', [
        'ng',
        'ngRoute',
        'jasperCore',
        'jasperAreas',
        'jasperRoutes'
    ]).config(['jasperComponentProvider', 'jasperDecoratorProvider', 'jasperServiceProvider', 'jasperFilterProvider', 'jasperValueProvider', '$compileProvider', function (jasperComponents, jasperDecorators, jasperServices, jasperFilters, jasperValues, $compileProvider) {
        window['jsp'] = {
            component: function (def) { return jasperComponents.register(def); },
            decorator: function (def) { return jasperDecorators.register(def); },
            service: function (def) { return jasperServices.register(def); },
            filter: function (def) { return jasperFilters.register(def); },
            value: function (name, value) { return jasperValues.register(name, value); },
            directive: $compileProvider.directive
        };
    }]).run(['jasperAreasService', '$templateCache', function (jasperAreasService, $templateCache) {
        window['jsp'].areas = jasperAreasService;
        window['jsp'].template = function (name, content) {
            $templateCache.put(name, content);
        };
    }]);
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
/// <reference path="core/decorators/DecoratorComponentProvider.ts" />
/// <reference path="core/decorators/HtmlDecoratorRegistrar.ts" />
/// <reference path="core/decorators/IHtmlDecoratorComponent.ts" />
/// <reference path="core/decorators/IHtmlDecoratorDefinition.ts" />
/// <reference path="core/filters/FilterProvider.ts" />
/// <reference path="core/filters/FilterRegistrar.ts" />
/// <reference path="core/filters/IFilterDefinition.ts" />
/// <reference path="core/services/IServiceDefinition.ts" />
/// <reference path="core/services/ServiceProvider.ts" />
/// <reference path="core/services/ServiceRegistrar.ts" />
/// <reference path="core/values/ValueProvider.ts" />
/// <reference path="core/GlobalEvents.ts" />
/// <reference path="core/JasperComponent.ts" />
/// <reference path="core/module.ts" />
// AREAS
/// <reference path="areas/JasperAreaDirective.ts" />
/// <reference path="areas/JasperAreasService.ts" />
/// <reference path="areas/JasperResourcesManager.ts" />
/// <reference path="areas/module.ts" />
// ROUTES
/// <reference path="routes/JasperRouteTableProvider.ts" />
/// <reference path="routes/module.ts" />
/// <reference path="jasper.ts" />
//# sourceMappingURL=jasper.js.map
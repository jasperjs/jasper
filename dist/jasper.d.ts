declare module jasper.core {
    /**
     * Interface allow to extend jasper application
     * Uses by jDebug tools for live reloding application components
     */
    interface IDirectiveInterceptor {
        /**
         * Invokes when component is registering in the application
         * @param definition
         */
        onRegister(definition: any): any;
        /**
         * Invokes when during directive template compilation
         * @param directive     directive definition
         * @param tElement      template element
         */
        onCompile(directive: ng.IDirective, tElement: JQuery): any;
        /**
         * Invokes when application create component instance over DOM element
         * @param directive     directive definition
         * @param scope         angular scope for directive
         * @param iElement      directive DOM node
         */
        onMount(directive: ng.IDirective, scope: ng.IScope, iElement: JQuery): any;
    }
}
declare module jasper.core {
    interface IComponentControllers {
        main: any;
        controllersToPass: any[];
    }
}
declare module jasper.core {
    interface IHtmlRegistrar<T> {
        register(component: T): void;
    }
}
declare module jasper.core {
    interface IUtilityService {
        /**
         * Split requirement for two part - main directive controller and require controllers
         */
        getComponentControllers(controllers: any, directive: ng.IDirective): IComponentControllers;
        /**
         * Create instance of component
         * @param component {function|string}
         */
        getFactoryOf(component: any): Function;
        /**
         * Convert string to snake case format: sampleText --> sample-text
         * @param source - value to convert
         */
        snakeCase(source: string): string;
        /**
         * Convert to camelCase format: SampleText --> sampleText
         * @param source - value to convert
         */
        camelCase(source: string): string;
        /**
         * Convert tag-name to camelCase: some-tag --> someTag
         * @param source - value to convert
         */
        camelCaseTagName(source: string): string;
        /**
         * Create IAttributeBinding[] from properties definition object and events
         * @param properties        represent an angular2 properties binding definition. To create '=' binding use '=' before ctrl property name
         *
         * @param events            array of string. Represent events of the component: ['statusChanged']
         */
        fetchAttributeBindings(properties?: any, events?: string[]): IAttributeBinding[];
        extractAttributeBindings(def: IHtmlComponentDefinition): IAttributeBinding[];
    }
    class UtilityService implements IUtilityService {
        getComponentControllers(controllers: any, directive: ng.IDirective): IComponentControllers;
        getFactoryOf(component: any): Function;
        snakeCase(source: string): string;
        camelCase(source: string): string;
        camelCaseTagName(tagName: string): string;
        fetchAttributeBindings(properties?: any, events?: string[]): IAttributeBinding[];
        extractAttributeBindings(def: IHtmlComponentDefinition): IAttributeBinding[];
        private getter(obj, path);
    }
}
declare module jasper.core {
    class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {
        private directive;
        private utility;
        private interceptor;
        constructor(compileProvider: ng.ICompileProvider);
        register(component: IHtmlComponentDefinition): void;
        setInterceptor(interceptor: IDirectiveInterceptor): void;
        createDirectiveFor(def: IHtmlComponentDefinition): ng.IDirective;
        private getScopeDefinition(def);
        private getRequirementsForComponent(component);
    }
}
declare module jasper.core {
    interface IComponentProvider {
        register(component: IHtmlComponentDefinition): any;
    }
    class ComponentProvider implements IComponentProvider, ng.IServiceProvider {
        static $inject: string[];
        private componentRegistar;
        constructor($compileProvider: ng.ICompileProvider);
        register(component: IHtmlComponentDefinition): void;
        $get(): IHtmlRegistrar<IHtmlComponentDefinition>;
    }
}
declare module jasper {
    /**
     * Represents html component 'code-behind' instance.
     *
     * This object also can contain method of changing each attribute specified in 'attributes' property of a definition
     *
     * <attributeName>_change(newValue, oldValue) {
     *      // this method invokes, when <attributeName> changes
     * }
     *
     * Example:
     *
     * class ColorPicker {
     *
     *      selectedColor: string;
     *
     *      ...
     *
     *      selectedColor_change(newColor: string, oldColor: string) {
     *          console.log('color changed to', newColor);
     *      }
     *
     * }
     */
    interface IHtmlComponent {
        /**
         * Jasper invoke this method, during angular's link phase - when component associates with
         * own html DOM element
         *
         * @element - html element
         * @components - array or single components, that will be required by 'require' property of component definition
         */
        link?: (element?: HTMLElement, components?: any) => void;
        /**
         * Jasper invoke this method, when all attributes of current component instance are filled
         * You can place logic of initialization here
         */
        initializeComponent?(): any;
        /**
         * Jasper invoke this method, when component was removed from application
         * You can place here logic of cleanup
         */
        destroyComponent?(): any;
    }
}
declare module jasper.core {
    /**
     * Represent component's attribute binding
     */
    interface IAttributeBinding {
        /**
         * Represents attribute name, in 'snake-case' format
         */
        name: string;
        /**
         * Property name of controller to bind to. Default the same with name.
         */
        ctrlName?: string;
        /**
         * Represents attribute type: 'data'|'expr'|'text'
         */
        type?: string;
        /**
         * Bind EventEmitter instead of Function to component's controller
         */
        $$eventEmitter?: boolean;
    }
}
declare module jasper.core {
    interface IHtmlComponentDefinition {
        /**
         * Setup the name of component. Name reflects the html element tag-name
         * Need to be specified using camelCase
         */
        name: string;
        /**
         * Setup transclusing of the component.
         * boolean|string
         */
        transclude?: any;
        /**
         * (LEGACY)
         * Attributes to bind to the component. string|array
         * Each attribute can be on of three types:
         *      'data' (angular '=' binding), 'expr' ('&') and 'text' ('@')
         *
         * Attributes can be provided as space separated string, like 'one-attribute two attribute'
         * - in this case jasper adds 'data' binding for each specified attribute
         * or as array, by specifying name and type of each one:
         * - attributes: [ { name: 'one-attribute', type: 'data' }, { name: 'on-updated', type: 'expr'} ]
         */
        attributes?: IAttributeBinding[];
        /**
         * Properties it's a new way to define external component properties.
         *
         * Example: ['color', 'caption']
         *
         * You can use it in two ways:
         *
         * <component color="some text" bind-caption="someExpression"></component>
         *
         * If an attribute has 'bind-' prefix - it will bound to component's field as the result of passed expression.
         * If you use attribute name - it will bound as text.
         *
         */
        properties?: string[];
        /**
         * Events it's a new way to define component's events.
         *
         * Example: ['click', 'change']
         *
         * You can use with component with 'on-' prefix with attribute
         *
         * <component on-click="someMethod()" on-change="someMethod()"></component>
         */
        events?: string[];
        /**
         * Setup template url address of the component
         */
        templateUrl?: string;
        /**
         * Setup inline html template of the component
         */
        template?: string;
        /**
         * Setup the 'code-behind' object constructor of the component.
         * Jasper associate instance of the object with component template.
         * Instance of this object will be available as 'vm' object in the template.
         */
        ctrl?: any;
        ctor?: any;
        /**
         * Replace component custom html tag with root of the component's template?
         */
        replace?: boolean;
        /**
         * Setup that this component need a dependency of another component.
         * Referenced components will be available in the 'link' method of the component.
         */
        require?: any;
        templateNamespace?: string;
    }
}
declare module jasper.core {
    interface IDecoratorComponentProvider {
        register(decorator: IHtmlDecoratorDefinition): any;
    }
    class DecoratorComponentProvider implements IDecoratorComponentProvider, ng.IServiceProvider {
        static $inject: string[];
        private decoratorRegistar;
        constructor($compileProvider: ng.ICompileProvider);
        register(decorator: IHtmlDecoratorDefinition): void;
        $get(): IHtmlRegistrar<IHtmlDecoratorDefinition>;
    }
}
declare module jasper.core {
    class HtmlDecoratorRegistrar implements IHtmlRegistrar<IHtmlDecoratorDefinition> {
        private directive;
        private utility;
        private interceptor;
        constructor(compileProvider: ng.ICompileProvider);
        register(component: IHtmlDecoratorDefinition): void;
        setInterceptor(interceptor: IDirectiveInterceptor): void;
        private createDirectiveFor(def);
        private getRequirementsForComponent(component);
        private getComponentControllers(controllers, directive);
    }
}
declare module jasper {
    interface IHtmlDecoratorComponent {
        /**
         * Jasper invoke this method, during angular's link phase - when decorator associates with
         * own html DOM element
         *
         * @value - value, passed to the html attribute
         * @element - html element
         * @attrs - collection of all attributes of @element
         * @components - array or single components, that will be required by 'require' property of component definition
         */
        link?: (value: any, element: HTMLElement, attrs: any, components: any) => void;
        /**
         * Jasper invokes this method when associated value changes
         */
        onValueChanged?: (newValue: any, oldValue: any) => void;
        /**
         * Jasper invokes this method when associated html element is removed from DOM
         */
        destroyComponent(): any;
    }
}
declare module jasper.core {
    interface IHtmlDecoratorDefinition {
        /**
         * Setup the name of decorator. Name reflects the html element attribute name
         * Need to be specified using camelCase
         */
        name: string;
        /**
         * Setup the controller of the decorator.
         * Contains decorator logic
         * Instance of this object will be available as 'vm' object in the template.
         */
        ctrl: any;
        ctor?: any;
        /**
         * Setup that this decorator needs a dependency of another component or decorator within html element.
         * Referenced components|decorator will be available in the 'link' method of the decorator.
         */
        require?: any;
        /**
         * Setup that jasper need to evaluate associated attribute value.
         * If true jasper assign evaluated result of decorator expression
         */
        eval?: boolean;
        /**
         * Properties it's a new way to define external decorator properties.
         *
         * Example: ['caption']
         *
         * You can use it in two ways:
         *
         * <element decorator bind-decorator-caption="someExpression"></element>
         *
         * If an attribute has 'bind-' prefix - it will bound to decorator's field as the result of passed expression.
         * If you use attribute name - it will bound as text.
         *
         */
        properties?: string[];
        /**
         * Events it's a new way to define decorator's events.
         *
         * Example: ['change']
         *
         * You can use with component with 'on-' prefix with attribute
         *
         * <element decorator on-change="someMethod()"></element>
         */
        events?: string[];
    }
}
declare module jasper.core {
    interface IFilterProvider {
        register(filter: IFilterDefinition): any;
    }
    class FilterProvider implements IFilterProvider, ng.IServiceProvider {
        static $inject: string[];
        private filterRegistar;
        constructor($filterProvider: ng.IFilterProvider);
        register(filter: IFilterDefinition): void;
        $get(): {};
    }
}
declare module jasper.core {
    class FilterRegistrar implements IHtmlRegistrar<IFilterDefinition> {
        private filter;
        private utility;
        constructor(filterProvider: ng.IFilterProvider);
        register(def: IFilterDefinition): void;
    }
}
declare module jasper.core {
    interface IFilterDefinition {
        /**
         * Setup the name of filter. Filter can be used, like {{ someExpression | <name> }}
         */
        name: string;
        /**
         * Setup filter's class constructor
         */
        ctor: any;
    }
}
declare module jasper.core {
    interface IServiceDefinition {
        /**
         * Setup the name of service. Service can be injected as '<name>'
         */
        name: string;
        /**
         * Setup service constructor
         */
        ctor: any;
    }
}
declare module jasper.core {
    interface IServiceProvider {
        register(decorator: IServiceDefinition): any;
    }
    class ServiceProvider implements IServiceProvider, ng.IServiceProvider {
        static $inject: string[];
        private serviceRegistar;
        constructor($provide: any);
        register(serviceDef: IServiceDefinition): void;
        $get(): IHtmlRegistrar<IServiceDefinition>;
    }
}
declare module jasper.core {
    class ServiceRegistrar implements IHtmlRegistrar<IServiceDefinition> {
        private provide;
        private service;
        private utility;
        constructor(provide: any);
        registerFactory(name: string, factory: Function): void;
        register(def: IServiceDefinition): void;
    }
}
declare module jasper.core {
    interface IValueProvider {
        register(name: string, value: any): any;
    }
    class ValueProvider implements IValueProvider, ng.IServiceProvider {
        private provide;
        static $inject: string[];
        constructor(provide: any);
        register(name: string, value: any): void;
        $get(): ValueProvider;
    }
}
declare module jasper.core {
    interface IConstantProvider {
        register(name: string, value: any): any;
    }
    class ConstantProvider implements IConstantProvider, ng.IServiceProvider {
        private provide;
        static $inject: string[];
        constructor(provide: any);
        register(name: string, value: any): void;
        $get(): ConstantProvider;
    }
}
declare module jasper.core {
    interface ISubscription {
        remove(): any;
    }
    interface IGlobalEventsService {
        /**
         * Subscribe on event. Do not forget to call 'remove' method, when you no longer need the subscription
         *
         * @param eventName - name of the event for notification
         * @param listener - callback for notification
         */
        subscribe(eventName: string, listener: (...args: any[]) => void): ISubscription;
        /**
         * Broadcast event for all subscribers
         *
         * @param eventName - name of the event for notification
         */
        broadcast(eventName: string, ...args: any[]): any;
    }
    class GlobalEventsService implements IGlobalEventsService {
        private events;
        subscribe(eventName: string, listener: (...args: any[]) => void): ISubscription;
        broadcast(eventName: string, ...args: any[]): void;
        private removeSubscription(eventName, listener);
    }
}
declare module jasper.core {
    interface IEventEmitter {
        /**
         * Fires event emitter
         * @param eventArgs     arguments that will be allowed as '$event' variable in the expression
         */
        next(eventArgs?: any): void;
    }
    class EventEmitter implements IEventEmitter {
        private fn;
        constructor(fn: Function);
        next(eventArgs?: any): void;
    }
}
declare module jasper.core {
    class JasperComponent {
        private $$scope;
        protected $digest(): void;
        protected $apply(f?: any): void;
        protected $on(eventName: string, listener: (event: ng.IAngularEvent, ...args: any[]) => any): Function;
        protected $watch(watchExpression: string, listener?: string, objectEquality?: boolean): Function;
        protected $watch(watchExpression: string, listener?: (newValue: any, oldValue: any, scope: ng.IScope) => any, objectEquality?: boolean): Function;
        protected $watch(watchExpression: (scope: ng.IScope) => any, listener?: string, objectEquality?: boolean): Function;
        protected $watch(watchExpression: (scope: ng.IScope) => any, listener?: (newValue: any, oldValue: any, scope: ng.IScope) => any, objectEquality?: boolean): Function;
        protected $watchCollection(watchExpression: string, listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function;
        protected $watchCollection(watchExpression: (scope: ng.IScope) => any, listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function;
        protected $watchGroup(watchExpressions: any[], listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function;
        protected $eval(expression?: string, args?: Object): any;
        protected $evalAsync(expression?: string): void;
        protected $evalAsync(expression?: (scope: ng.IScope) => any): void;
        private ensureScope();
    }
}
declare module jasper.core {
    function JasperDirectiveWrapperFactory(ctor: any, bindings: IAttributeBinding[], utility: IUtilityService, isolateScope: boolean): (scope: ng.IScope, $element: any, attrs: any, $parse: ng.IParseService, $interpolate: ng.IInterpolateService) => any;
}
declare module jasper.areas {
    class JasperAreaDirective {
        static $inject: string[];
        constructor($compile: ng.ICompileService, jasperAreasService: JasperAreasService);
    }
}
declare module jasper.areas {
    class JasperAreasService {
        static $inject: string[];
        /**
         * Client-side areas configuration
         */
        private config;
        private loadiingAreas;
        static maxDependencyHops: number;
        resourceManager: IResourceManager;
        loadedAreas: string[];
        q: ng.IQService;
        constructor($q: ng.IQService);
        configure(config: any): void;
        onAreaLoaded(areaName: string): ng.IPromise<any>;
        initArea(areaName: string, cb: () => any): any;
        loadAreas(areas: string, hops?: number): ng.IPromise<any>;
        loadAreas(areas: string[], hops?: number): ng.IPromise<any>;
        /**
         * Ensures that areas exists in the configuration and return the found area config
         * @param areaName      name of area
         */
        private ensureArea(areaName);
        private isAreaLoaded(areaname);
        private prepareUrls(urls);
    }
}
declare module jasper.areas {
    interface IResourceManager {
        makeAccessible(scripts: string[], styles: string[], onReady: Function): any;
    }
    class JasperResourcesManager implements IResourceManager {
        static loadedScriptPaths: string[];
        private buildScripts(scripts);
        private inArray(source, val);
        makeAccessible(scripts: string[], styles: string[], onReady: () => void): void;
    }
}
declare var $script: any;
declare module jasper.areas {
    interface IAreaSection {
        scripts: string[];
        styles: string[];
        dependencies: string[];
    }
}
declare module jasper.routing {
    class JasperRouteTableProvider implements IRouteTableProvider {
        private routeProvider;
        static $inject: string[];
        constructor(routeProvider: any);
        setup(config: IRoutesConfiguration): void;
        $get(): JasperRouteTableProvider;
    }
}
declare module jasper.routing {
    interface IRoutesConfiguration {
        defaultRoutePath: string;
        routes: any;
    }
    interface IRouteTableProvider {
        setup(config: IRoutesConfiguration): any;
    }
}
declare module jasper {
    interface IJasperStatic {
        /**
         * Register a component
         * @param def       component definition
         */
        component(def: core.IHtmlComponentDefinition): any;
        /**
         * Register a decorator component
         * @param def       decorator definition
         */
        decorator(def: core.IHtmlDecoratorDefinition): any;
        /**
         * Register a filter
         * @param def       filter definition
         */
        filter(def: core.IFilterDefinition): any;
        /**
         * Register a service
         * @param def       service definition
         */
        service(def: core.IServiceDefinition): any;
        /**
         * Jasper areas service
         */
        areas: areas.JasperAreasService;
        /**
         * Register a template in template cache
         * @param key       key to access to template
         * @param content   html content of the template
         */
        template(key: string, content: string): any;
        /**
         * Register an AngularJS directive. Use in a case of emergency
         * @param name      directive name
         * @param ddo       directive definition object
         */
        directive(name: string, ddo: any): any;
        /**
         * Register new value
         * @param name      name of the value
         * @param value     value (string|object|array|number)
         */
        value(name: string, value: any): any;
        /**
         * Notify when jasper is ready to work
         * @param cb
         */
        ready(cb?: () => void): any;
        setup(templateCache: ng.ITemplateCacheService, areasService: areas.JasperAreasService): any;
    }
    class JasperStatic implements IJasperStatic {
        private isReady;
        private readyQueue;
        private componentProvider;
        private decoratorProvider;
        private serviceProvider;
        private filtersProvider;
        private valueProvider;
        private templateCahce;
        directive: (name: string, ddo: any) => void;
        component(def: core.IHtmlComponentDefinition): void;
        decorator(def: core.IHtmlDecoratorDefinition): void;
        filter(def: core.IFilterDefinition): void;
        service(def: core.IServiceDefinition): void;
        areas: areas.JasperAreasService;
        template(key: string, content: string): void;
        value(name: string, value: any): void;
        init(componentProvider: core.IComponentProvider, decoratorProvider: core.IDecoratorComponentProvider, serviceProvider: core.IServiceProvider, filterProvider: core.IFilterProvider, valueProvider: core.IValueProvider, directiveFactory: any): void;
        setup(templateCache: ng.ITemplateCacheService, areasService: areas.JasperAreasService): void;
        ready(cb?: () => void): void;
    }
}
declare var jsp: jasper.IJasperStatic;
declare module jasper {
}

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
    }
    class UtilityService implements IUtilityService {
        getFactoryOf(component: any): Function;
        snakeCase(source: string): string;
        camelCase(source: string): string;
        camelCaseTagName(tagName: string): string;
        private getter(obj, path);
    }
}
declare module jasper.core {
    class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {
        private svcRegistrar;
        private utility;
        private static directives;
        constructor(svcRegistrar: IServiceRegistrar);
        register(component: IHtmlComponentDefinition): void;
        private applyAttributes(ng2ComponentDef, def);
        private applyLifecycle(ng2ComponentDef, component);
        private applyInjectables(ng2ComponentDef, component);
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
    interface IAttributeBinding {
        /**
         * Represents attribute name, in 'snake-case' format
         */
        name: string;
        /**
         * Represents attribute type: 'data'|'expr'|'text'
         */
        type?: string;
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
        /**
         * If true jasper will not wrap the component's controller. (Default - false)
         */
        noWrap?: boolean;
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
    interface IServiceRegistrar extends IHtmlRegistrar<IServiceDefinition> {
        getTypeByName(name: string): any;
    }
    class ServiceRegistrar implements IServiceRegistrar {
        private utility;
        private static allServices;
        constructor();
        register(def: IServiceDefinition): void;
        getTypeByName(name: string): any;
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
declare var jsp: jasper.IJasperStatic;
declare module jasper {
    interface IJasperStatic {
        /**
         * Register a component
         * @param def       component definition
         */
        component(def: core.IHtmlComponentDefinition): any;
        service(def: core.IServiceDefinition): any;
    }
    class JasperStatic implements IJasperStatic {
        private isReady;
        private readyQueue;
        private componentRegistrar;
        private serviceRegistrar;
        constructor();
        component(def: core.IHtmlComponentDefinition): void;
        service(def: core.IServiceDefinition): void;
        ready(cb?: () => void): void;
    }
}

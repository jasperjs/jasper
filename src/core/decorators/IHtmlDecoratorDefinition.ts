module jasper.core {
    export interface IHtmlDecoratorDefinition {
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
        ctrl?: any;
        // same as ctrl
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

        priority?: number;

        /**
         * Infomation for jDebug
         */
        jDebug?: IJDebugInfo;
    }
} 
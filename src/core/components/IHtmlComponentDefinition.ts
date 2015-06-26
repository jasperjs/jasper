module jasper.core {
    export interface IHtmlComponentDefinition {
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
        // same as ctor
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
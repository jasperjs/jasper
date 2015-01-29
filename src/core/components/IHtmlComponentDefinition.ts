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
        ctor?: any;

        /**
         * Setup that this component need a dependency of another component.
         * Referenced components will be available in the 'link' method of the component.
         */
        require?: any;
    }
} 
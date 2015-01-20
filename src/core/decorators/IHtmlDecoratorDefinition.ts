module jasper.core {
    export interface IHtmlDecoratorDefinition {
        /*
         * Setup the name of decorator. Name reflects the html element attribute name
         * Need to be specified using camelCase
         **/
        name: string;
        /*
         * Setup the 'code-behind' object constructor of the decorator.
         * Contains decorator logic
         * Instance of this object will be available as 'vm' object in the template.
         **/
        ctor: any;
        /*
         * Setup that this decorator needs a dependency of another component or decorator within html element.
         * Referenced components|decorator will be available in the 'link' method of the decorator.
         **/
        require?: any;
        /*
         * Setup that jasper need to evaluate associated attribute value.
         * If true jasper assign evaluated result of decorator expression
         **/
        eval?: boolean;
    }
} 
module jasper {
    /*
     * Represent html decorator 'code-behind' instance.
     *
     **/
    export interface IHtmlDecoratorComponent {
        /*
         * Jasper invoke this method, during angular's link phase - when decorator associates with
         * own html DOM element
         *
         * @value - value, passed to the html attribute
         * @element - html element
         * @attrs - collection of all attributes of @element
         * @components - array or single components, that will be required by 'require' property of component definition
         **/
        link?: (value: any, element: HTMLElement, attrs: any, components: any) => void;

        /*
         * Jasper invokes this method when associated value changes
         **/
        onValueChanged?: (newValue: any, oldValue: any) => void;
    }

} 
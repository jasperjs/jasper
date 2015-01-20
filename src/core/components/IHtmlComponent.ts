module jasper {
    /*
     * Represent html component 'code-behind' instance.
     **/
    export interface IHtmlComponent {
        /*
         * Jasper invoke this method, during angular's link phase - when component associates with
         * own html DOM element
         *
         * @element - html element
         * @components - array or single components, that will be required by 'require' property of component definition
         **/
        link?: (element?: HTMLElement, components?: any) => void;

        /*
         * Jasper invoke this method, when all attributes of current component instance are filled
         * You can place logic of initialization here
         */
        initializeComponent?();

        /*
         * Jasper invoke this method, when component was removed from application
         * You can place here logic of cleanup
         */
        destroyComponent?();
    }
} 
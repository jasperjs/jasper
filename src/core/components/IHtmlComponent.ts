module jasper {
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
    export interface IHtmlComponent {
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
        initializeComponent?();

        /**
         * Jasper invoke this method, when component was removed from application
         * You can place here logic of cleanup
         */
        destroyComponent?();
    }
} 
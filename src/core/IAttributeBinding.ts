module jasper.core{
    /**
     * Represent component's attribute binding
     */
    export interface IAttributeBinding {
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
    }
}
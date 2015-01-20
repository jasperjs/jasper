module jasper.core{
    export interface IAttributeBinding {
        /*
         * Represents attribute name, in 'snake-case' format
         **/
        name: string;
        /*
         * Represents attribute type: 'data'|'expr'|'text'
         **/
        type: string;
    }
}
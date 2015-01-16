module jasper {
    export interface IHtmlComponent {
        link?: (element?: HTMLElement, controller?: any, transclude?: any) => void;

        onAttributeChanged?: (attrName: string, newValue: any, oldVlaue: any) => void;
    }
} 
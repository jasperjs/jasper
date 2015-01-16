module jasper {

    export interface IHtmlDecoratorComponent {
        // link decorator to the element
        link?: (value: any, element: HTMLElement, attrs: any, components: any) => void;
        // value of the attribute changed
        onValueChanged?: (newValue: any, oldValue: any) => void;
    }

} 
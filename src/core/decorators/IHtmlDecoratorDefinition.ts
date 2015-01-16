module jasper {
    export interface IHtmlDecoratorDefinition {
        // name of component
        name: string;

        ctor: any;

        // obsolete
        component?: any;

        require?: any;
        eval?: boolean;
    }
} 
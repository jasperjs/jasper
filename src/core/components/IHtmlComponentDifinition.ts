module jasper.core {
    export interface IHtmlComponentDefinition {
        // name of component
        name: string;

        // transclude content?
        transclude?: any;

        // attributes to bind to component (space separated)
        attributes?: string;

        // plain text attributes to bind to component (space separated)
        textAttributes?: string;

        // expressions to bind to component (space separated)
        expressions?: string;

        templateUrl?: string;

        template?: string;

        ctor?: any;
        component?: any;

        require?: any;
    }
} 
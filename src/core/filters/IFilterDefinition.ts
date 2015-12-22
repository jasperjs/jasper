module jasper.core {
    export interface IFilterDefinition {
        /**
         * Setup the name of filter. Filter can be used, like {{ someExpression | <name> }}
         */
        name: string;
        /**
         * Setup filter's class constructor
         */
        ctor?: any;
    }
} 
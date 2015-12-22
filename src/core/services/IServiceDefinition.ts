module jasper.core {
    export interface IServiceDefinition {
        /**
         * Setup the name of service. Service can be injected as '<name>'
         */
        name: string;
        /**
         * Setup service constructor
         */
        ctor?: any;
    }
} 
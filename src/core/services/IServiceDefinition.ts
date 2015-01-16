module jasper.core {
    export interface IServiceDefinition {
        name: string;

        ctor: any;
        component?: any;
    }
} 
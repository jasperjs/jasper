module jasper.core {
    export interface IHtmlRegistrar<T> {
        register(component: T): void;
    }
} 
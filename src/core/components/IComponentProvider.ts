module jasper.core {
    export interface IComponentProvider {
        register(component: IHtmlComponentDefinition);
    }

    export class ComponentProvider implements IComponentProvider {
        private componentRegistar: IHtmlRegistrar<IHtmlComponentDefinition>;

        constructor() {
            this.componentRegistar = new core.HtmlComponentRegistrar();
        }

        register(component: IHtmlComponentDefinition) {
            this.componentRegistar.register(component);
        }

    }
}
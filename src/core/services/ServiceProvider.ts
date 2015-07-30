module jasper.core {
    export interface IServiceProvider {
        register(decorator: IServiceDefinition);
    }

    export class ServiceProvider implements IServiceProvider, ng.IServiceProvider {

        static $inject = ['$provide'];

        private serviceRegistar: IHtmlRegistrar<IServiceDefinition>;

        constructor($provide: any) {
            this.serviceRegistar = new jasper.core.ServiceRegistrar($provide);
        }

        register(serviceDef: IServiceDefinition) {
            this.serviceRegistar.register(serviceDef);
        }

        $get() {
            return this.serviceRegistar;
        }
    }
}
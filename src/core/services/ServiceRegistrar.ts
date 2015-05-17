module jasper.core {

    interface IAllServicesCache {
        [name: string] : any;
    }

    export interface IServiceRegistrar extends IHtmlRegistrar<IServiceDefinition>{
        getTypeByName(name: string): any;
    }

    export class ServiceRegistrar implements IServiceRegistrar {

        private utility: IUtilityService;
        private static allServices: IAllServicesCache = {};

        constructor() {
            this.utility = new UtilityService();
        }

        register(def: IServiceDefinition) {
            if (!def.ctor) {
                throw new Error(def.name + ' must specify constructor');
            }

            ServiceRegistrar.allServices[def.name] = def.ctor;
        }

        getTypeByName(name: string): any{
            return ServiceRegistrar.allServices[name];
        }

    }
}
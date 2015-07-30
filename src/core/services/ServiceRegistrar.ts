module jasper.core {

    export class ServiceRegistrar implements IHtmlRegistrar<IServiceDefinition> {

        private service: (name: string, ctor: Function) => void;
        private utility: IUtilityService;

        constructor(private provide: any) {
            this.service = provide.service;
            this.utility = new UtilityService();
        }

        registerFactory(name: string, factory: Function){
            this.provide.factory(name, factory);
        }

        register(def: IServiceDefinition) {
            if (!def.ctor) {
                throw new Error(def.name + ' must specify constructor');
            }

            var factory = this.utility.getFactoryOf(def.ctor);
            this.service(def.name, factory);
        }

    }
} 
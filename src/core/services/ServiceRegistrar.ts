module jasper.core {

    export class ServiceRegistrar implements IHtmlRegistrar<IServiceDefinition> {

        private service: (name: string, ctor: Function) => void;
        private utility: IUtilityService;

        constructor(provide: any) {
            this.service = provide.service;
            this.utility = new UtilityService();
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
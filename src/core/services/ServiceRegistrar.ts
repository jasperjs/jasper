module jasper.core {

    export class ServiceRegistrar implements IHtmlRegistrar<IServiceDefinition> {

        private service: (name: string, ctor: Function) => void;
        private utility: IUtilityService;

        constructor(provide: any) {
            this.service = provide.service;
            this.utility = new UtilityService();
        }

        register(def: IServiceDefinition) {
            var ctor = def.ctor || def.component;
            if (!ctor) {
                throw new Error(def.name + ' must specify constructor');
            }

            var factory = this.utility.getFactoryOf(ctor);
            this.service(def.name, factory);
        }

    }
} 
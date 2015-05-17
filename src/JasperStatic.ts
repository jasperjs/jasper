declare var jsp: jasper.IJasperStatic;
module jasper {
    export interface IJasperStatic {
        /**
         * Register a component
         * @param def       component definition
         */
        component(def: core.IHtmlComponentDefinition);

        service(def: core.IServiceDefinition);
    }

    export class JasperStatic implements IJasperStatic {

        private isReady: boolean;
        private readyQueue: Array<() => void> = [];

        private componentRegistrar: core.IHtmlRegistrar<core.IHtmlComponentDefinition>;
        private serviceRegistrar: core.IHtmlRegistrar<core.IServiceDefinition>;

        constructor() {
            this.serviceRegistrar = new core.ServiceRegistrar();
            this.componentRegistrar = new core.HtmlComponentRegistrar(<core.IServiceRegistrar>this.serviceRegistrar);
        }

        component(def: core.IHtmlComponentDefinition) {
            this.componentRegistrar.register(def);
        }

        service(def: core.IServiceDefinition){
            this.serviceRegistrar.register(def);
        }

        ready(cb?: ()=>void) {
            if(!cb) {
                this.readyQueue.forEach(subscriber=>{
                    subscriber();
                });
                this.readyQueue = []; // flush subscriber queue
                this.isReady = true;
                return;
            }
            if(this.isReady) {
                cb();
            } else {
                this.readyQueue.push(cb);
            }
        }
    }

    window['jsp'] = new JasperStatic();
}
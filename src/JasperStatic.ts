module jasper {
    export interface IJasperStatic {
        /**
         * Register a component
         * @param def       component definition
         */
        component(def: core.IHtmlComponentDefinition);

        init(componentProvider: core.IComponentProvider);
    }

    export class JasperStatic implements IJasperStatic {

        private isReady: boolean;
        private readyQueue: Array<() => void> = [];

        private componentProvider: core.IComponentProvider;


        directive: (name: string, ddo: any) => void;

        component(def: core.IHtmlComponentDefinition) {
            this.componentProvider.register(def);
        }


        init(componentProvider: core.IComponentProvider) {
            this.componentProvider = componentProvider;
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
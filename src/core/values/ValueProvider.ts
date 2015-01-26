module jasper.core {
    export interface IValueProvider {
        register(name: string, value: any);
    }

    export class ValueProvider implements IValueProvider, ng.IServiceProvider {

        static $inject = ['$provide'];

        constructor(private provide: any) {

        }

        register(name: string, value: any){
            this.provide.value(name, value);
        }

        $get() {
            return this;
        }
    }
}
module jasper.core {
    export interface IConstantProvider {
        register(name: string, value: any);
    }

    export class ConstantProvider implements IConstantProvider, ng.IServiceProvider {

        static $inject = ['$provide'];

        constructor(private provide: any) {

        }

        register(name: string, value: any){
            this.provide.constant(name, value);
        }

        $get() {
            return this;
        }
    }
}
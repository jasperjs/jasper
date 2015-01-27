module jasper.core {
    export class JasperComponent {

        private $$scope: ng.IScope;

        protected $digest() {
            this.ensureScope();

            this.$$scope.$digest();
        }

        protected $apply() {
            this.ensureScope();

            this.$$scope.$apply();
        }

        protected $on(eventName: string, listener: (event: ng.IAngularEvent, ...args: any[]) => any){
            this.ensureScope();
            this.$$scope.$on(eventName, listener);
        }

        private ensureScope(){
            if(!this.$$scope)
                throw '$$scope not initialized';
        }

    }
}
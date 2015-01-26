module jasper.core {
    export class JasperComponent {

        private $$scope: ng.IScope;

        protected $digest() {
            if(!this.$$scope)
                throw '$$scope not initialized';
            this.$$scope.$digest();
        }

        protected $apply() {
            if(!this.$$scope)
                throw '$$scope not initialized';
            this.$$scope.$apply();
        }

    }
}
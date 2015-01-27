module jasper.core {
    export class JasperComponent {

        private $$scope:ng.IScope;

        protected $digest() {
            this.ensureScope();

            this.$$scope.$digest();
        }

        protected $apply() {
            this.ensureScope();

            this.$$scope.$apply();
        }

        protected $on(eventName:string, listener:(event:ng.IAngularEvent, ...args:any[]) => any) {
            this.ensureScope();
            this.$$scope.$on(eventName, listener);
        }

        protected $watch(watchExpression:(scope:ng.IScope) => any,
                         listener?:(newValue:any, oldValue:any, scope:ng.IScope)=>any,
                         objectEquality?:boolean) {
            this.ensureScope();
            this.$$scope.$watch(watchExpression, listener, objectEquality);
        }

        protected $watchCollection(watchExpression: (scope: ng.IScope) => any,
                                   listener: (newValue: any, oldValue: any, scope: ng.IScope) => any) {
            this.ensureScope();
            this.$$scope.$watchCollection(watchExpression, listener);
        }

        protected $watchGroup(watchExpressions: { (scope: ng.IScope): any }[],
                              listener: (newValue: any, oldValue: any, scope: ng.IScope) => any) {
            this.ensureScope();
            this.$$scope.$watchGroup(watchExpressions, listener);
        }

        private ensureScope() {
            if (!this.$$scope)
                throw '$$scope not initialized';
        }

    }
}
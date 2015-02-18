module jasper.core {
    export class JasperComponent {

        private $$scope: ng.IScope;

        protected $digest() {
            this.ensureScope();
            this.$$scope.$digest();
        }

        protected $apply(f?: any) {
            this.ensureScope();
            this.$$scope.$apply(f);
        }

        protected $on(eventName:string, listener:(event:ng.IAngularEvent, ...args:any[]) => any): Function {
            this.ensureScope();
            return this.$$scope.$on(eventName, listener);
        }

        protected $watch(watchExpression: string, listener?: string, objectEquality?: boolean): Function;
        protected $watch(watchExpression: string, listener?: (newValue: any, oldValue: any, scope: ng.IScope) => any, objectEquality?: boolean): Function;
        protected $watch(watchExpression: (scope: ng.IScope) => any, listener?: string, objectEquality?: boolean): Function;
        protected $watch(watchExpression: (scope: ng.IScope) => any, listener?: (newValue: any, oldValue: any, scope: ng.IScope) => any, objectEquality?: boolean): Function;
        protected $watch(watchExpression: any, listener?: any, objectEquality?: boolean): Function {
            this.ensureScope();
            return this.$$scope.$watch(watchExpression, listener, objectEquality);
        }

        protected $watchCollection(watchExpression: string, listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function;
        protected $watchCollection(watchExpression: (scope: ng.IScope) => any, listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function;
        protected $watchCollection(watchExpression: any, listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function {
            this.ensureScope();
            return this.$$scope.$watchCollection(watchExpression, listener);
        }

        protected $watchGroup(watchExpressions: any[], listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function;
        protected $watchGroup(watchExpressions: any, listener: (newValue: any, oldValue: any, scope: ng.IScope) => any): Function {
            this.ensureScope();
            return this.$$scope.$watchGroup(watchExpressions, listener);
        }

        protected $eval(expression?: string, args?: Object): any;
        protected $eval(expression?: any, args?: Object): any {
            this.ensureScope();
            return this.$$scope.$eval(expression, args);
        }

        protected $evalAsync(expression?: string): void;
        protected $evalAsync(expression?: (scope: ng.IScope) => any): void;
        protected $evalAsync(expression?: any): void {
            this.ensureScope();
            return this.$$scope.$evalAsync(expression);
        }

        private ensureScope() {
            if (!this.$$scope)
                throw '$$scope not initialized';
        }

    }
}
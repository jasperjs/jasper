module jasper.core {
    export interface IAppContext {
        /*
         * Run AngularJS digest loop on specified html element context
         */
        digest(element: HTMLElement);
        /*
         * Run AngularJS digest loop on root app element
         */
        apply();
    }

    export class AppContext implements IAppContext {
        static $inject = ['$rootScope'];

        constructor(private rootScope: ng.IScope) {

        }

        digest(element: HTMLElement) {
            angular.element(element).scope().$digest();
        }

        apply() {
            this.rootScope.$apply();
        }
    }

} 
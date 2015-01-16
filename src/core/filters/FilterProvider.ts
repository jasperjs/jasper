module jasper.core {
    export interface IFilterProvider {
        register(filter: IFilterDefinition);
    }

    export class FilterProvider implements IFilterProvider, ng.IServiceProvider {

        static $inject = ['$filterProvider'];

        private filterRegistar: IHtmlRegistrar<IFilterDefinition>;

        constructor($filterProvider: ng.IFilterProvider) {
            this.filterRegistar = new core.FilterRegistrar($filterProvider);
        }

        register(filter: IFilterDefinition) {
            this.filterRegistar.register(filter);
        }

        $get() {
            return {};
        }
    }
}
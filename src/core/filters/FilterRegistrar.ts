module jasper.core {

    export class FilterRegistrar implements IHtmlRegistrar<IFilterDefinition> {

        private filter: (name: string, ctor: Function) => void;
        private utility: IUtilityService;

        constructor(filterProvider: ng.IFilterProvider) {
            this.filter = filterProvider.register;
            this.utility = new UtilityService();
        }

        register(def: IFilterDefinition) {
            if (!def.ctor) {
                throw new Error(def.name + ' must specify constructor');
            }
            var factory = this.utility.getFactoryOf(def.ctor);

            this.filter(def.name, factory);
        }

    }
} 
module jasper.core {
    export interface IDecoratorComponentProvider {
        register(decorator: IHtmlDecoratorDefinition);
    }

    export class DecoratorComponentProvider implements IDecoratorComponentProvider, ng.IServiceProvider {

        static $inject = ['$compileProvider'];

        private decoratorRegistar: IHtmlRegistrar<IHtmlDecoratorDefinition>;

        constructor($compileProvider: ng.ICompileProvider) {
            this.decoratorRegistar = new jasper.core.HtmlDecoratorRegistrar($compileProvider);
        }

        register(decorator: IHtmlDecoratorDefinition) {
            this.decoratorRegistar.register(decorator);
        }

        $get() {
            return {};
        }
    }
}
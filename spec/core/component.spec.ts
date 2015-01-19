describe('Core component tests', () => {

    var registrar: jasper.core.HtmlComponentRegistrar, compileProvider: jasper.mocks.TestCompileProvider;

    beforeEach(() => {
        compileProvider = new jasper.mocks.TestCompileProvider();
    });

    it('Test correct html component registration', () => {
        var ddo, directiveName;
        compileProvider.directive = (name: string, factory) => {
            directiveName = name;
            ddo = factory();
            return compileProvider;
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement'
        }

        registrar = new jasper.core.HtmlComponentRegistrar(compileProvider);
        registrar.register(definition);

        expect(ddo).toBeDefined();
        expect(directiveName).toEqual(definition.name);

    });

});
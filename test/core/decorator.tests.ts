describe('Core decorator tests', () => {

    var registrar: jasper.core.HtmlDecoratorRegistrar, compileProvider: jasper.mocks.TestCompileProvider;

    var registerDefinitionObject = (definition: jasper.core.IHtmlDecoratorDefinition)=>{
        var ddo;
        compileProvider.directive = (name: string, factory) => {
            ddo = factory();
            if(directiveFactory){
                directiveFactory(name, factory);
            }
            return compileProvider;
        };
        registrar = new jasper.core.HtmlDecoratorRegistrar(compileProvider);
        registrar.register(definition);
        return ddo;
    };

    var directiveFactory;

    beforeEach(() => {
        module(function($compileProvider) {
            directiveFactory = $compileProvider.directive;
        });
        compileProvider = new jasper.mocks.TestCompileProvider();
    });

    it('Test correct decorator element and value bindings', inject(($compile, $rootScope) => {
        var decoratorValue, linkedElement;

        var component = function() {
            this.link = function(value, element) {
                decoratorValue = value;
                linkedElement = element;
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctor: component
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.restrict).toEqual('A');

        var element = $compile('<div my-attribute="\'test\'"></div>')($rootScope.$new());

        expect(decoratorValue).toEqual('test');
        expect(element[0]).toEqual(linkedElement);
    }));

    it('Test decorator onValueChanged method invocation', inject(($compile, $rootScope) => {
        var newVal, oldVal;

        var component = function() {
            this.onValueChanged = function(newValue, oldValue) {
                newVal = newValue;
                oldVal = oldValue;
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctor: component
        }

        registerDefinitionObject(definition);

        var scope = $rootScope.$new();
        scope['value'] = 'test';

        $compile('<div my-attribute="value"></div>')(scope);
        scope.$digest();

        scope['value'] = 'changed test';
        scope.$digest();

        expect(oldVal).toEqual('test');
        expect(newVal).toEqual('changed test');
    }));

    it('Test decorator destroyComponent method invocation', inject(($compile, $rootScope) => {
        var destroyInvoked = false;
        var component = function() {
            this.destroyComponent = function() {
                destroyInvoked = true;
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctor: component
        }
        registerDefinitionObject(definition);

        var scope = $rootScope.$new();
        var element = $compile('<div my-attribute="\'test\'"></div>')(scope);
        scope.$digest();
        expect(destroyInvoked).toBe(false);

        element.remove();
        expect(destroyInvoked).toBe(true);

    }));


    it('Test decorator component $$scope assign', inject(($compile, $rootScope) => {

        var componentScope: ng.IScope;
        // test component
        var component = function() {
            this.someAttr = '';
            this.link = function() {
                componentScope = this['$$scope'];
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctor: component
        }
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        $compile('<div my-attribute="\'test\'"></div>')(scope);
        expect(componentScope).toBeDefined();
    }));

});
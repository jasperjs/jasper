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

    it('should bind correct element', inject(($compile, $rootScope) => {
        var decoratorValue, linkedElement;

        var component = function() {
            this.link = function(value, element) {
                decoratorValue = value;
                linkedElement = element;
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctrl: component
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.restrict).toEqual('A');

        var element = $compile('<div my-attribute="\'test\'"></div>')($rootScope.$new());

        expect(decoratorValue).toEqual('test');
        expect(element[0]).toEqual(linkedElement);
    }));

    it('should invoke onValueChanged method when property changed', inject(($compile, $rootScope) => {
        var newVal, oldVal;

        var component = function() {
            this.onValueChanged = function(newValue, oldValue) {
                newVal = newValue;
                oldVal = oldValue;
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctrl: component
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

    it('should invoke destroyComponent method when component is destroying', inject(($compile, $rootScope) => {
        var destroyInvoked = false;
        var component = function() {
            this.destroyComponent = function() {
                destroyInvoked = true;
            };
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            ctrl: component
        }
        registerDefinitionObject(definition);

        var scope = $rootScope.$new();
        var element = $compile('<div my-attribute="\'test\'"></div>')(scope);
        scope.$digest();
        expect(destroyInvoked).toBe(false);

        element.remove();
        expect(destroyInvoked).toBe(true);

    }));


    it('shouls assign $$scope property', inject(($compile, $rootScope) => {
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
            ctrl: component
        }
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        $compile('<div my-attribute="\'test\'"></div>')(scope);
        expect(componentScope).toBeDefined();
    }));

    it('should bind properties to decorator controller', inject(($compile, $rootScope) => {
        var instance;
        var component = function() {
            instance = this;
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            properties: ['color', 'caption'],
            ctrl: component
        }
        registerDefinitionObject(definition);

        var scope = $rootScope.$new();
        scope.text='sample caption';
        var element = $compile('<div my-attribute bind-caption="text" color="red"></div>')(scope);

        expect(instance.color).toEqual('red');
        expect(instance.caption).toEqual(scope.text);

    }));

    it('should bind event emitter to decorator controller', inject(($compile, $rootScope) => {
        var instance;
        var component = function() {
            instance = this;
        };
        var definition: jasper.core.IHtmlDecoratorDefinition = {
            name: 'myAttribute',
            events: ['change'],
            ctrl: component
        }
        registerDefinitionObject(definition);

        var scope = $rootScope.$new();
        $compile('<div my-attribute on-change="foo()" color="red"></div>')(scope);

        expect(instance.change instanceof  jasper.core.EventEmitter).toBe(true);

    }));

});
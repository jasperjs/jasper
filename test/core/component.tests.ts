describe('Core component tests', () => {

    var registrar: jasper.core.HtmlComponentRegistrar, compileProvider: jasper.mocks.TestCompileProvider;

    var registerDefinitionObject = (definition: jasper.core.IHtmlComponentDefinition)=>{
        var ddo;
        compileProvider.directive = (name: string, factory) => {
            ddo = factory();
            if(directiveFactory){
                directiveFactory(name, factory);
            }
            return compileProvider;
        };
        registrar = new jasper.core.HtmlComponentRegistrar(compileProvider);
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

    it('Test correct restrict for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement'
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.restrict).toEqual('E');
    });

    it('Test attributes for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            attributes: 'test-attr color'
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.scope.testAttr).toEqual('=');
        expect(ddo.scope.color).toEqual('=');
    });

    it('Test text attributes for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            attributes: [{ name: 'test-attr',  type: 'text' }, { name: 'color', type:'text' }]
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.scope.testAttr).toEqual('@');
        expect(ddo.scope.color).toEqual('@');
    });

    it('Test expression attributes for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            attributes: [{ name: 'my-expr',  type: 'expr' }, { name: 'color', type:'expr' }]
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.scope.myExpr).toEqual('&');
        expect(ddo.scope.color).toEqual('&');
    });

    it('Test template for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            template: '<p>test</p>'
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.template).toEqual(definition.template);
        expect(ddo.templateUrl).toBeUndefined();
    });

    it('Test templateUrl for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            templateUrl: 'path/to/my/template.html'
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.templateUrl).toEqual(definition.templateUrl);
        expect(ddo.template).toBeUndefined();
    });

    it('Test transclude for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            transclude: 'true'
        };
        var ddo = registerDefinitionObject(definition);
        expect(ddo.transclude).toBe(true);

        definition.transclude = 'element';
        ddo = registerDefinitionObject(definition);
        expect(ddo.transclude).toBe('element');
    });


    it('Test transclude for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            transclude: 'true'
        };
        var ddo = registerDefinitionObject(definition);
        expect(ddo.transclude).toBe(true);

        definition.transclude = 'element';
        ddo = registerDefinitionObject(definition);
        expect(ddo.transclude).toBe('element');
    });


    it('Test template compilation', inject(($compile, $rootScope) => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);
        var elm  = $compile('<some-tag></some-tag>')($rootScope.$new());
        expect(elm.html()).toEqual('<p>hello</p>');
    }));

    it('Test component attributes binding', inject(($compile, $rootScope) => {

        var attrValue;
        // test component
        var component = function() {
            this.someAttr = '';
            this.initializeComponent = function() {
                attrValue = this.someAttr;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTagCtor',
            ctor: component,
            attributes:'some-attr',
            template: '<p>hello {{vm.someAttr}}</p>'
        };
        registerDefinitionObject(definition);

        $compile('<some-tag-ctor some-attr="\'test\'"></some-tag-ctor>')($rootScope.$new());

        expect(attrValue).toEqual('test');
    }));

    it('Test component $$scope assign', inject(($compile, $rootScope) => {

        var componentScope: ng.IScope;
        // test component
        var component = function() {
            this.someAttr = '';
            this.initializeComponent = function() {
                componentScope = this['$$scope'];
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTagCtor',
            ctor: component,
            attributes:'some-attr',
            template: '<p>hello {{vm.someAttr}}</p>'
        };
        registerDefinitionObject(definition);
        $compile('<some-tag-ctor></some-tag-ctor>')($rootScope.$new());

        expect(componentScope).toBeDefined();
    }));


    it('Test component text attributes binding', inject(($compile, $rootScope) => {
        var attrValue;
        // test component
        var component = function() {
            this.someAttr = '';
            this.initializeComponent = function() {
                attrValue = this.someAttr;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctor: component,
            attributes: [{
                type:'text',
                name: 'some-attr'
            }],
            template: '<p>hello {{vm.someAttr}}</p>'
        };
        registerDefinitionObject(definition);

        $compile('<some-tag some-attr="some text"></some-tag>')($rootScope.$new());

        expect(attrValue).toEqual('some text');
    }));

    it('Test component expressions binding', inject(($compile, $rootScope) => {
        var attrValue;
        // test component
        var component = function() {
            this.someExpr = '';
            this.initializeComponent = function() {
                attrValue = this.someExpr;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctor: component,
            attributes: [{
                    name: 'some-expr',
                    type: 'expr'
                }],
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);

        $compile('<some-tag some-expr="someMethod()"></some-tag>')($rootScope.$new());

        expect(attrValue).toBeDefined();
    }));

    it('Test component destroy method invocation', inject(($compile, $rootScope) => {
        var destroyInvoked;
        // test component
        var component = function() {
            this.someExpr = '';
            this.destroyComponent = function() {
                destroyInvoked = true;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctor: component,
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        $compile('<some-tag></some-tag>')(scope);

        scope.$destroy();

        expect(destroyInvoked).toBe(true);
    }));

});
describe('Jasper component', () => {

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
        module(function($compileProvider, $provide) {
            directiveFactory = $compileProvider.directive;
            console.log($provide);
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

    it('Test template for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            template: '<p>test</p>'
        };
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

    it('should have initialized fields in InitializeComponent method', inject(($compile, $rootScope) => {

        var attrValue;
        // test component
        var component = function() {
            this.initializeComponent = function() {
                attrValue = this.someAttr;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTagCtor',
            ctrl: component,
            attributes:[{name: 'some-attr'}],
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
            this.initializeComponent = function() {
                componentScope = this['$$scope'];
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTagCtor',
            ctrl: component,
            attributes:[{name: 'some-attr'}],
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
            this.initializeComponent = function() {
                attrValue = this.someAttr;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctrl: component,
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

    it('should bind function to invoke external expression', inject(($compile, $rootScope) => {
        var attrValue;
        // test component
        var component = function() {
            attrValue = this.someExpr;
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctrl: component,
            attributes: [{
                    name: 'some-expr',
                    type: 'expr'
                }],
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        scope['someMethod'] = function(){ return'called'; };
        $compile('<some-tag some-expr="someMethod()"></some-tag>')(scope);

        expect(attrValue).toBeTruthy();
        expect(attrValue()).toEqual('called');
    }));

    it('should invoke DestroyComponent method when scope is destroyed', inject(($compile, $rootScope) => {
        var destroyInvoked;
        // test component
        var component = function() {
            this.destroyComponent = function() {
                destroyInvoked = true;
            };
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctrl: component,
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        $compile('<some-tag></some-tag>')(scope);

        scope.$destroy();

        expect(destroyInvoked).toBe(true);
    }));

    it('Test that undefined attribute do not pass to the component', inject(($compile, $rootScope) => {
        // test component
        var invoked  = false;
        var component = function() {
            this.someAttr_change = function(){
                invoked = true;
            }
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctrl: component,
            attributes: [{
                name: 'some-attr'
            }],
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);

        $compile('<some-tag some-attr="undefinedProperty"></some-tag>')($rootScope.$new());

        $rootScope.$digest();

        expect(invoked).toBe(false);
    }));

    it('Test that on change method invoked when property changed', inject(($compile, $rootScope) => {
        // test component
        var invoked  = false, newValue, oldValue;
        var component = function() {
            this.someAttr_change = function(newVal, oldVal){
                invoked = true;
                newValue = newVal;
                oldValue = oldVal;
            }
        };
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'someTag',
            ctrl: component,
            attributes: [{
                name: 'some-attr'
            }],
            template: '<p>hello</p>'
        };
        registerDefinitionObject(definition);

        var scope = $rootScope.$new();
        scope['prop']='test';
        $compile('<some-tag some-attr="prop"></some-tag>')(scope);

        $rootScope.$digest();

        expect(invoked).toBe(false);

        scope['prop'] = 'test 2';
        $rootScope.$digest();

        expect(invoked).toBe(true);
        expect(newValue).toEqual('test 2');
        expect(oldValue).toEqual('test');
    }));

});
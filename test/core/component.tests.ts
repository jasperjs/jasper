///<reference path="../mocks.ts" />
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

    it('should correct restrict for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement'
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.restrict).toEqual('E');
    });

    it('should template for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            template: '<p>test</p>'
        };
        var ddo = registerDefinitionObject(definition);

        expect(ddo.template).toEqual(definition.template);
        expect(ddo.templateUrl).toBeUndefined();
    });

    it('should templateUrl for html component registration', () => {
        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myElement',
            templateUrl: 'path/to/my/template.html'
        }
        var ddo = registerDefinitionObject(definition);

        expect(ddo.templateUrl).toEqual(definition.templateUrl);
        expect(ddo.template).toBeUndefined();
    });

    it('should transclude for html component registration', () => {
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


    it('should transclude for html component registration', () => {
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


    it('should template compilation', inject(($compile, $rootScope) => {
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

    it('should component $$scope assign', inject(($compile, $rootScope) => {

        var componentScope: ng.IScope;
        // test component
        var component = function() {
            componentScope = this['$$scope'];
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


    it('should component text attributes binding', inject(($compile, $rootScope) => {
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
            this.initializeComponent = function() {
                attrValue = this['someExpr'];
            };
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

    it('should that undefined attribute do not pass to the component', inject(($compile, $rootScope) => {
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

    it('should invoke on change method when property changed', inject(($compile, $rootScope) => {
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

    it('should create bindings for properties', inject(($compile, $rootScope) => {

        var instance;
        var component = function() { instance = this; };

        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myComponent',
            ctrl: component,
            properties:['myColor','otherColor'],
            events: ['click'],
            template: '<p>hello {{vm.myColor}}</p>'
        };
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        scope.property = 'otherColorTest';
        $compile('<my-component my-color="test" on-click="someMethod()" bind-other-color="property"></my-component>')(scope);

        expect(instance.myColor).toEqual('test');
        expect(instance.otherColor).toEqual(scope.property);

        expect(instance.click).toBeDefined(); //
        expect(instance.click instanceof jasper.core.EventEmitter).toBeTruthy();
    }));

    it('should ignore attributes property if properties or events specified', inject(($compile, $rootScope) => {

        var instance;
        // test component
        var component = function() { instance = this; };

        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myComponent',
            ctrl: component,
            events:['click'],
            attributes:[{name: 'some-attr'}],
            template: '<p>hello {{vm.myColor}}</p>'
        };
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        scope.property = 'otherColorTest';
        $compile('<my-component on-click="someMethod()" some-attr="\'test\'"></my-component>')(scope);

        expect(instance.someAttr).toBeUndefined();
    }));


    it('should does not propagate changes from child components to parent (one-way binding)', inject(($compile, $rootScope) => {

        var parentInstance, childInstance;
        // test component
        var parent = function() { parentInstance = this; this.value = 'blue'; };
        var child = function() { childInstance = this; };


        var parentDefinition: jasper.core.IHtmlComponentDefinition = {
            name: 'parentCmp',
            ctrl: parent,
            template: '<child-cmp bind-color="vm.value"></child-cmp>'
        };
        registerDefinitionObject(parentDefinition);
        var childDefinition: jasper.core.IHtmlComponentDefinition = {
            name: 'childCmp',
            properties: ['color'],
            ctrl: child,
            template: '<p>{{vm.color}}</p>'
        };
        registerDefinitionObject(childDefinition);

        var scope = $rootScope.$new();
        $compile('<parent-cmp></parent-cmp>')(scope);

        expect(childInstance.color).toEqual(parentInstance.value);

        childInstance.color = 'green';
        scope.$digest();

        expect(parentInstance.value).toEqual('blue');//not changed after child

        parentInstance.value = 'red';
        scope.$digest();

        expect(childInstance.color).toEqual('red');//parent override value for child
    }));


    it('should bind a component instance to #bind-to attribute', inject(($compile, $rootScope) => {

        var component = function() { this.name='some component';  };

        var definition: jasper.core.IHtmlComponentDefinition = {
            name: 'myComponent',
            ctrl: component,
            template: '<p>hello {{vm.myColor}}</p>'
        };
        registerDefinitionObject(definition);
        var scope = $rootScope.$new();
        $compile('<my-component #bind-to="component"></my-component>')(scope);

        expect(scope.component.name).toEqual('some component');

        scope.$destroy();
        expect(scope.component).toBeUndefined();

    }));

});
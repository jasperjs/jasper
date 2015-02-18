describe('JasperComponent tests', () => {

    var component: jasper.core.JasperComponent;

    beforeEach(inject(() => {
        component = new jasper.core.JasperComponent();
    }));

    it('Test digest loop', inject(($rootScope: ng.IScope) => {
        var scope = $rootScope.$new();
        spyOn(scope,'$digest').and.callThrough();
        component['$$scope'] = scope;
        component['$digest']();
        expect(scope.$digest).toHaveBeenCalled();
    }));

    it('Test digest loop on root scope', inject(($rootScope: ng.IScope) => {
        var scope = $rootScope.$new();
        spyOn(scope,'$apply').and.callThrough();
        component['$$scope'] = scope;
        component['$apply']();
        expect(scope.$apply).toHaveBeenCalled();

    }));

    it('Test angularJs event registration', inject(($rootScope: ng.IScope) => {
        var scope = $rootScope.$new();
        spyOn(scope,'$on').and.callThrough();
        component['$$scope'] = scope;
        component['$on']('eventName', ()=>{});
        expect(scope.$on).toHaveBeenCalled();
    }));

    it('Test angularJs watch registration', inject(($rootScope: ng.IScope) => {
        var scope = $rootScope.$new();
        spyOn(scope,'$watch').and.callThrough();
        component['$$scope'] = scope;
        component['$watch']('test', ()=>{});
        expect(scope.$watch).toHaveBeenCalled();
    }));
});
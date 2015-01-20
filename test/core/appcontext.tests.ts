describe('AppContext service tests', () => {

    var service: jasper.core.AppContext;

    beforeEach(inject(($rootScope) => {
        service = new jasper.core.AppContext($rootScope);
    }));

    it('Test digest loop on specified element', inject(($rootScope: ng.IScope, $compile: ng.ICompileService) => {
        var scope = $rootScope.$new();
        spyOn(scope,'$digest').and.callThrough();

        var element = $compile('<div></div>')(scope);
        service.digest(element[0]);

        expect(scope.$digest).toHaveBeenCalled();

    }));

    it('Test digest loop on root scope', inject(($rootScope: ng.IScope, $compile: ng.ICompileService) => {
        spyOn($rootScope,'$apply').and.callThrough();

        service.apply();

        expect($rootScope.$apply).toHaveBeenCalled();

    }));
});
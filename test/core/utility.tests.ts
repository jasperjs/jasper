describe('JasperComponent tests', () => {

    var service: jasper.core.UtilityService;

    beforeEach(inject(() => {
        service = new jasper.core.UtilityService();
    }));

    it('Test factory creation from function', inject(() => {
        var func = function(){};
        expect(service.getFactoryOf(func)).toBe(func);
    }));

    it('Test factory creation from string', inject(() => {
        var obj = {
            test1: function (){}
        }
        window['test'] = obj;
        expect(service.getFactoryOf('test.test1')).toBe(obj.test1);
    }));

    it('Test factory creation from undefined', inject(() => {
        var factory;
        try{
            factory = service.getFactoryOf('test3.test4');
        }
        catch (e) {

        }
        expect(factory).toBe(undefined);
    }));

});
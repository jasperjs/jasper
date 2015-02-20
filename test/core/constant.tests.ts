describe('JasperComponent tests', () => {

    var values: jasper.core.ConstantProvider;

    beforeEach(() => {

    });

    it('Test value registration', () => {
        var obj = {
            test: 1
        };

        module(($provide)=>{
            values = new jasper.core.ConstantProvider($provide);
            values.register('test', 'value');
            values.register('testObj', obj);
        });

        inject((test, testObj) => {
            expect(test).toEqual('value');
            expect(testObj).toBe(obj);
        });
    });

});
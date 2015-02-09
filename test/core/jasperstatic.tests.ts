describe('JasperComponent tests', () => {

    var static: jasper.JasperStatic;

    beforeEach(() => {

    });

    it('Test ready queue invocation', () => {

        var test ={
            subscriber: ()=>{},
            subscriber2: ()=>{}
        };

        spyOn(test,'subscriber').and.callThrough();
        spyOn(test,'subscriber2').and.callThrough();

        jsp.ready(test.subscriber);
        jsp.ready(test.subscriber2);

        jsp.ready();

        expect(test.subscriber).toHaveBeenCalled();
        expect(test.subscriber2).toHaveBeenCalled();
    });

    it('Test ready when setup method is called', () => {
        spyOn(jsp,'ready').and.callThrough();

        jsp.setup(null,null);

        expect(jsp.ready).toHaveBeenCalled();
    });
});
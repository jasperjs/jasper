describe('JasperComponent tests', () => {

    var services: jasper.core.ServiceProvider;

    beforeEach(() => {

    });

    it('Test service registration', () => {
        var service = function(){
            this.title= 'test';
        };

        module(($provide)=>{
            services = new jasper.core.ServiceProvider($provide);
            services.register({
                name: 'myService',
                ctor: service
            });
        });

        inject((myService) => {
            expect(myService.title).toEqual('test');
        });
    });

});
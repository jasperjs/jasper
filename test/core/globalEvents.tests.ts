describe('AppContext service tests', () => {

    var service: jasper.core.GlobalEventsService;

    beforeEach(inject(() => {
        service = new jasper.core.GlobalEventsService();
    }));

    it('Test subscription invocation', () => {

        var invoked = false;

        service.subscribe('someTopic',()=>{
            invoked = true;
        });

        service.broadcast('someTopic');

        expect(invoked).toBe(true);

    });

    it('Test subscription multiple invocation', () => {

        var invoked1 = false,  invoked2 = false;;

        service.subscribe('someTopic', () => {
            invoked1 = true;
        });
        service.subscribe('someTopic',() => {
            invoked2 = true;
        });

        service.broadcast('someTopic');

        expect(invoked1).toBe(true);
        expect(invoked2).toBe(true);

    });

    it('Test subscription invoked once', () => {

        var invocationCount = 0;

        service.subscribe('someTopic', () => {
            invocationCount ++;
        });

        service.broadcast('someTopic');

        expect(invocationCount).toBe(1);

    });

    it('Test multiple subscriptions', () => {

        var invoked1 = false,  invoked2 = false;;

        service.subscribe('someTopic_one', () => {
            invoked1 = true;
        });
        service.subscribe('someTopic_two',() => {
            invoked2 = true;
        });

        service.broadcast('someTopic_one');

        expect(invoked1).toBe(true);
        expect(invoked2).toBe(false);

        service.broadcast('someTopic_two');
        expect(invoked2).toBe(true);
    });

    it('Test passing parameters to subscription', () => {

        var param1,  param2;

        service.subscribe('someTopic', (p1: string, p2: number) => {
            param1 = p1;
            param2 = p2;
        });

        service.broadcast('someTopic', 'test', 10);

        expect(param1).toEqual('test');
        expect(param2).toBe(10);

    });

    it('Test remove subscription', () => {

        var invoked = false;

        var subscription = service.subscribe('someTopic', () => {
            invoked = true;
        });

        subscription.remove();

        service.broadcast('someTopic');

        expect(invoked).toBe(false);

    });
});
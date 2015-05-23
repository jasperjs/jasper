describe('Utility', () => {

    var service: jasper.core.UtilityService;

    beforeEach(inject(() => {
        service = new jasper.core.UtilityService();
    }));

    it('should create factory creation from function', inject(() => {
        var func = function(){};
        expect(service.getFactoryOf(func)).toBe(func);
    }));

    it('should create factory creation from string', inject(() => {
        var obj = {
            test1: function (){}
        }
        window['test'] = obj;
        expect(service.getFactoryOf('test.test1')).toBe(obj.test1);
    }));

    it('should throw exception from undefined', inject(() => {
        var factory;
        try{
            factory = service.getFactoryOf('test3.test4');
        }
        catch (e) {

        }
        expect(factory).toBe(undefined);
    }));

    it('should create IAttributeBinding from properties definition object', () => {
        var properties = {
            'id': 'dependency',
            'color': 'selectedColor'
        };

        var attributes = service.fetchAttributeBindings(properties);
        expect(attributes).toEqual([
            {
                name: 'id',
                ctrlName: 'dependency',
                type: 'text'
            },
            {
                name: 'color',
                ctrlName: 'selectedColor',
                type: 'text'
            }
        ]);
    });

    it('should create "=" binding from properties definition object', () => {
        var properties = {
            'id': '=dependency'
        };

        var attributes = service.fetchAttributeBindings(properties);
        expect(attributes).toEqual([
            {
                name: 'id',
                ctrlName: 'dependency',
                type: 'data'
            }
        ]);
    });

    it('should create event bindings from events definition object', () => {
        var events = ['statusChanged', 'colorChanged'];

        var attributes = service.fetchAttributeBindings(undefined, events);
        expect(attributes).toEqual([
            {
                name: 'statusChanged',
                ctrlName: 'statusChanged',
                type: 'event'
            },
            {
                name: 'colorChanged',
                ctrlName: 'colorChanged',
                type: 'event'
            }
        ]);
    });

});
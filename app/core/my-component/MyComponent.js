var jasperApp;
(function (jasperApp) {
    var MyComponent = (function () {
        function MyComponent() {
            this.title = 'my-component';
            this.names = ['victor', 'natali'];
            this.onSelect = new angular.EventEmitter(); // EventEmitter, breaking change?
        }
        MyComponent.prototype.emit = function () {
            this.onSelect.next({ $type: 'ok' });
        };
        MyComponent.prototype.changeColor = function () {
            this.color = 'red';
        };
        MyComponent.prototype.onChange = function (changes) {
            console.log(changes);
        };
        MyComponent.prototype.onAllChangesDone = function () {
            console.log('my-component changes done');
        };
        return MyComponent;
    })();
    jasperApp.MyComponent = MyComponent;
})(jasperApp || (jasperApp = {}));

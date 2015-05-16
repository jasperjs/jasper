var jasperApp;
(function (jasperApp) {
    var MyComponent = (function () {
        function MyComponent() {
            this.title = 'my-component';
            this.names = ['victor', 'natali'];
        }
        return MyComponent;
    })();
    jasperApp.MyComponent = MyComponent;
})(jasperApp || (jasperApp = {}));

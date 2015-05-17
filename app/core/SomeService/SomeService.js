var jasperApp;
(function (jasperApp) {
    var SomeService = (function () {
        function SomeService() {
        }
        SomeService.prototype.someMethod = function () {
            return 'service string';
        };
        return SomeService;
    })();
    jasperApp.SomeService = SomeService;
})(jasperApp || (jasperApp = {}));

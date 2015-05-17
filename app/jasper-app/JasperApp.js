var jasperApp;
(function (jasperApp) {
    var JasperApp = (function () {
        function JasperApp(someService) {
            this.color = 'blue';
            this.title = someService.someMethod();
        }
        JasperApp.prototype.showAlert = function () {
            alert('jasper app');
        };
        JasperApp.prototype.changeColor = function () {
            this.color = 'green';
        };
        JasperApp.prototype.onAllChangesDone = function () {
            console.log('jasper-app changes done');
        };
        JasperApp.$inject = ['SomeService'];
        return JasperApp;
    })();
    jasperApp.JasperApp = JasperApp;
})(jasperApp || (jasperApp = {}));

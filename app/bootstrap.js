jsp.component({
    name: 'jasper-app',
    templateUrl: 'app/jasper-app/jasper-app.html',
    ctrl: jasperApp.JasperApp
});
jsp.component({
    name: 'my-component',
    templateUrl: 'app/core/my-component/my-component.html',
    ctrl: jasperApp.MyComponent
});
angular.bootstrap(jasperApp.JasperApp);

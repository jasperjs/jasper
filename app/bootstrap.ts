//TODO grunt-jasper, breaking change. Services must register first

jsp.service({
    name: 'SomeService',
    ctor: jasperApp.SomeService
});

// then components:

jsp.component({
    name: 'jasper-app',
    templateUrl: 'app/jasper-app/jasper-app.html',
    ctrl: jasperApp.JasperApp,
    noWrap: true
});

jsp.component({
    name: 'my-component',
    templateUrl: 'app/core/my-component/my-component.html',
    ctrl: jasperApp.MyComponent,
    attributes: [{name: 'color'}, {name: 'type'}, { name: 'on-select', type: 'expr' }]
});




angular.bootstrap(jasperApp.JasperApp);

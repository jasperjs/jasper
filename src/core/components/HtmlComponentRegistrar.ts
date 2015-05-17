module jasper.core {

    export class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {

        private utility:IUtilityService;

        private static directives = [];

        constructor(private svcRegistrar:IServiceRegistrar) {
            this.utility = new UtilityService();

            HtmlComponentRegistrar.directives.push(angular.If);
            HtmlComponentRegistrar.directives.push(angular.For);
        }

        register(component:IHtmlComponentDefinition) {

            var ng2ComponentDef:any = {
                selector: component.name
            };

            var ng2ViewDef:any = {};

            if (component.templateUrl) {
                ng2ViewDef.templateUrl = component.templateUrl;
            } else if (component.template) {
                ng2ViewDef.template = component.template;
            }
            ng2ViewDef.directives = HtmlComponentRegistrar.directives;

            //TODO process $inject field
            this.applyInjectables(ng2ComponentDef, component);
            this.applyAttributes(ng2ComponentDef, component);
            this.applyLifecycle(ng2ComponentDef, component);

            var ctrl = component.noWrap ? component.ctrl : JasperComponentWrapperFactory(component.ctrl, ng2ComponentDef.events);
            if (!ctrl['annotations']) {
                ctrl['annotations'] = [];
            }

            ctrl['annotations'].push(new angular.ComponentAnnotation(ng2ComponentDef));
            ctrl['annotations'].push(new angular.ViewAnnotation(ng2ViewDef));

            HtmlComponentRegistrar.directives.push(ctrl);
        }

        private applyAttributes(ng2ComponentDef:any, def:IHtmlComponentDefinition) {
            if (!def.attributes)
                return;

            var ngProperties:any = {};
            var ngEvents:any = [];

            for (var i = 0; i < def.attributes.length; i++) {
                var attrName = def.attributes[i].name;
                var attrType = def.attributes[i].type || 'data';

                switch (attrType.toUpperCase()) {
                    case 'DATA':
                    case 'TEXT': // jasper 0.x
                        ngProperties[attrName] = attrName; // one to one binding
                        break;
                    case 'EXPR': // jasper 0.x
                        ngEvents.push(this.utility.camelCaseTagName(attrName))
                        break;
                    default:
                        throw 'Unknown attribute type: ' + attrType
                }

            }
            ng2ComponentDef.properties = ngProperties;
            ng2ComponentDef.events = ngEvents;
        }


        private applyLifecycle(ng2ComponentDef:any, component:IHtmlComponentDefinition) {
            var lifeCycles = ['onDestroy', 'onChange', 'onAllChangesDone'];
            ng2ComponentDef.lifecycle = [];
            var prototype = component.ctrl.prototype;
            for (var i = 0; i < lifeCycles.length; i++) {
                var lf = lifeCycles[i];
                if (prototype[lf] && typeof(prototype[lf]) === 'function' && angular[lf]) {
                    ng2ComponentDef.lifecycle.push(angular[lf]);
                }
            }
        }

        private applyInjectables(ng2ComponentDef:any, component:IHtmlComponentDefinition) {
            var legacyInjects = component.ctrl['$inject'];
            if (!legacyInjects)
                return;

            var injectables = [];
            var parameters = [];

            for (var i = 0; i < legacyInjects.length; i++) {
                var serviceNameToInject = legacyInjects[i];
                var svcType = this.svcRegistrar.getTypeByName(serviceNameToInject);
                if (!svcType) {
                    throw 'Service with name \"' + serviceNameToInject + '\" does not registred';
                }
                injectables.push(svcType);
                parameters.push([svcType]);
            }

            component.ctrl['parameters'] = parameters;
            ng2ComponentDef['injectables'] = injectables;

        }


    }

    function JasperComponentWrapperFactory(ctrl:any, events:string[]) {
        var wrapper = function JasperCompnentWrapper() {
            if (ctrl) {
                //var obj = Object.create(ctrl.prototype);
                // TODO event system compatibility

                //for (var i = 0; i < events.length; i++) {
                //    var evtName = events[i]; var evtEmitterProp = '$$jsp' + evtName];
                //    obj[evtEmitterProp] = new angular.EventEmitter();
                //
                //    obj[evtName] = function(params){
                //        obj[evtEmitterProp].next();
                //    }
                //}

                ctrl.apply(this, arguments);

                // TODO invoke initializeComponent()
                // TODO check if link function defined - drop NotSupportException
                return this;
            }
            return this;
        }
        if (ctrl) {
            wrapper.prototype = ctrl.prototype;
        }
        return wrapper;
    }


    //private bindChangeMethod(attributeName:string
    //    , ctrl:IHtmlComponent
    //    , scope:ng.IScope) {
    //
    //    var methodName = attributeName + '_change';
    //    if (ctrl[methodName] && angular.isFunction(ctrl[methodName])) {
    //        scope.$watch(()=> ctrl[attributeName], (val, oldVal) => {
    //            if (val === oldVal)
    //                return; // do not pass property id it does not change
    //            ctrl[methodName](val, oldVal);
    //        });
    //    }
    //
    //}


}
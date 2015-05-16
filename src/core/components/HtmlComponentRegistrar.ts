module jasper.core {

    export class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {

        private utility:IUtilityService;

        private static directives = [];

        constructor() {
            this.utility = new UtilityService();

            HtmlComponentRegistrar.directives.push(angular.If);
            HtmlComponentRegistrar.directives.push(angular.For);
        }

        register(component:IHtmlComponentDefinition) {

            var ng2ComponentDef = {
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
            //TODO attributes property

            var ctrl = component.ctrl;
            ctrl['annotations'] = [new angular.ComponentAnnotation(ng2ComponentDef), new angular.ViewAnnotation(ng2ViewDef)];

            HtmlComponentRegistrar.directives.push(ctrl);
        }

        //private bindController(def:IHtmlComponentDefinition, scope:ng.IScope, ctrl:IHtmlComponent, attrs) {
        //    if (!def.attributes)
        //        return;
        //
        //    for (var i = 0; i < def.attributes.length; i++) {
        //        var attrName = def.attributes[i].name;
        //        var attrType = def.attributes[i].type || 'data';
        //
        //        var propertyName = this.utility.camelCaseTagName(attrName);
        //
        //        if (angular.isDefined(attrs[propertyName])) {
        //
        //            switch (attrType.toUpperCase()) {
        //                case 'DATA':
        //                    this.bindChangeMethod(propertyName, ctrl, scope);
        //                    break;
        //                case 'EXPR':
        //                    break;
        //                case 'TEXT':
        //                    this.bindChangeMethod(propertyName, ctrl, scope);
        //                    break;
        //                default:
        //                    throw 'Unknown attribute type: ' + attrType
        //            }
        //
        //        }
        //    }
        //
        //}

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


        private getScopeDefinition(def:IHtmlComponentDefinition) {
            var scope = {};
            if (!def.attributes)
                return scope;

            for (var i = 0; i < def.attributes.length; i++) {
                var attr = def.attributes[i];
                if (!attr.name) {
                    throw 'Attribute name not specified of: ' + JSON.stringify(attr);
                }

                var angularBinding = '=?'; // default attribute binding
                var type = attr.type || 'data';
                switch (type.toUpperCase()) {
                    case 'EXPR':
                        angularBinding = '&';
                        break;
                    case 'TEXT':
                        angularBinding = '@';
                        break;
                }
                var camelCaseAttrName = this.utility.camelCaseTagName(attr.name);
                scope[camelCaseAttrName] = angularBinding;
            }
            return scope;
        }

        private getRequirementsForComponent(component:IHtmlComponentDefinition) {
            if (angular.isDefined(component.require)) {
                var req = [component.name];
                if (angular.isArray(component.require))
                    req = req.concat(component.require);
                else
                    req.push(component.require);

                return <any>req;
            } else {
                return component.name;
            }
        }

    }
} 
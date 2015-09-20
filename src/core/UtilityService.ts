module jasper.core {

    export interface IUtilityService {
        /**
         * Split requirement for two part - main directive controller and require controllers
         */
        getComponentControllers(controllers, directive:ng.IDirective): IComponentControllers;
        /**
         * Create instance of component
         * @param component {function|string}
         */
        getFactoryOf(component:any): Function;
        /**
         * Convert string to snake case format: sampleText --> sample-text
         * @param source - value to convert
         */
        snakeCase(source:string): string;
        /**
         * Convert to camelCase format: SampleText --> sampleText
         * @param source - value to convert
         */
        camelCase(source:string): string;
        /**
         * Convert tag-name to camelCase: some-tag --> someTag
         * @param source - value to convert
         */
        camelCaseTagName(source:string): string;

        /**
         * Create IAttributeBinding[] from properties definition object and events
         * @param properties        represent an angular2 properties binding definition. To create '=' binding use '=' before ctrl property name
         *
         * @param events            array of string. Represent events of the component: ['statusChanged']
         */
        fetchAttributeBindings(properties?:any, events?:string[]):IAttributeBinding[];

        extractAttributeBindings(def:IHtmlComponentDefinition|IHtmlDecoratorDefinition):IAttributeBinding[];
    }

    export class UtilityService implements IUtilityService {
        getComponentControllers(controllers:any, directive:ng.IDirective):IComponentControllers {
            var controllersToPass;
            var controller:IHtmlComponent;

            if (directive.require && angular.isArray(directive.require)) {

                controller = controllers.shift();
                controllersToPass = controllers;
                if (controllersToPass.length === 1) {
                    controllersToPass = controllersToPass[0];
                }

            } else {
                controller = controllers;
                controllersToPass = controller;
            }
            return {
                main: controller,
                controllersToPass: controllersToPass
            }
        }

        getFactoryOf(component:any):Function {
            if (angular.isString(component)) {
                var result = this.getter(window, component);
                if (!result) {
                    throw 'Constructor defined as \"' + component + '\" not found';
                }
                return result;
            } else if (angular.isFunction(component)) {
                return component;
            } else {
                throw "Unknown component definition " + component;
            }
        }

        snakeCase(source:string):string {
            var snakeCaseRegexp = /[A-Z]/g;
            var separator = '-';
            return source.replace(snakeCaseRegexp, (letter, pos) => (pos ? separator : '') + letter.toLowerCase());
        }

        camelCase(source:string):string {
            var regex = /[A-Z]/g;
            return source.replace(regex, (letter, pos) => pos ? letter : letter.toLowerCase());
        }

        camelCaseTagName(tagName:string) {
            if (tagName.indexOf('-') < 0) {
                return this.camelCase(tagName);
            }
            return tagName.replace(/\-(\w)/g, (match, letter) => letter.toUpperCase());
        }

        fetchAttributeBindings(properties?:any, events?:string[]):IAttributeBinding[] {
            var attributes:IAttributeBinding[] = [];
            if (properties) {
                for (var prop in properties) {
                    if (!properties.hasOwnProperty(prop))
                        continue;

                    var ctrlPropertyName = properties[prop];
                    var t = 'text';
                    if (ctrlPropertyName.indexOf('=') === 0) {
                        t = 'data';
                        ctrlPropertyName = ctrlPropertyName.slice(1, ctrlPropertyName.length);
                    }
                    attributes.push({
                        name: prop,
                        ctrlName: ctrlPropertyName,
                        type: t
                    });
                }
            }
            if (events) {
                events.forEach(evt=> {
                    attributes.push({
                        name: evt,
                        ctrlName: evt,
                        type: 'event'
                    });
                });
            }
            return attributes;
        }

        extractAttributeBindings(def:IHtmlComponentDefinition|IHtmlDecoratorDefinition):IAttributeBinding[] {
            if (def.properties || def.events) {
                var result:IAttributeBinding[] = [];
                // create properties bindings:
                if (def.properties) {
                    for (var i = 0; i < def.properties.length; i++) {
                        var propertyName = def.properties[i];
                        var ctrlName = this.camelCaseTagName(propertyName);
                        result.push({
                            name: propertyName,
                            ctrlName: ctrlName,
                            type: 'text'
                        });
                        // register another binding with 'bind-' prefix
                        result.push({
                            name: 'bind-' + propertyName,
                            ctrlName: ctrlName,
                            type: 'data'
                        });
                    }
                }
                if (def.events) {
                    for (var i = 0; i < def.events.length; i++) {
                        var eventName = def.events[i];
                        var ctrlName = this.camelCaseTagName(eventName);
                        result.push({
                            name: 'on-' + eventName,
                            ctrlName: ctrlName,
                            type: 'expr',
                            // indicates that we need to create EventEmitter class to component's property
                            $$eventEmitter: true
                        });
                    }
                }
                return result;
            } else {
                return def['attributes'] || [];
            }
        }

        private getter(obj:any, path:string):any {
            var keys = path.split('.');
            var key, len = keys.length;

            for (var i = 0; i < len; i++) {
                key = keys[i];
                obj = obj[key];
                if (!obj) {
                    return undefined;
                }
            }

            return obj;
        }


    }
} 
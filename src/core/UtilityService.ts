module jasper.core {

    export interface IUtilityService {
        getComponentControllers(controllers, directive: ng.IDirective): IComponentControllers;

        getFactoryOf(component: any): Function;

        // sampleText --> sample-text
        snakeCase(source: string): string;
        // sampleText --> SampleText
        camelCase(source: string): string;
        // some-tag --> someTag
        camelCaseTagName(source: string): string;
    }

    export class UtilityService implements IUtilityService {
        getComponentControllers(controllers, directive: ng.IDirective): IComponentControllers {
            var controllersToPass;
            var controller: IHtmlComponent;

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

        getFactoryOf(component: any): Function {
            if (angular.isString(component)) {
                return eval(component);
            } else if (angular.isFunction(component)) {
                return component;
            } else {
                throw "Unknown component definition " + component;
            }
        }

        snakeCase(source: string): string {
            var snakeCaseRegexp = /[A-Z]/g;
            var separator = '-';
            return source.replace(snakeCaseRegexp, (letter, pos) => (pos ? separator : '') + letter.toLowerCase());
        }

        camelCase(source: string): string {
            var regex = /[A-Z]/g;
            return source.replace(regex, (letter, pos) => pos ? letter : letter.toLowerCase());
        }

        camelCaseTagName(tagName: string) {
            if (tagName.indexOf('-') < 0) {
                return this.camelCase(tagName);
            }
            return tagName.replace(/\-(\w)/g, (match, letter) => letter.toUpperCase());
        }
    }
} 
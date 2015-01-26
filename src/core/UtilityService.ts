module jasper.core {

    export interface IUtilityService {
        /**
         * Split requirement for two part - main directive controller and require controllers
         */
        getComponentControllers(controllers, directive: ng.IDirective): IComponentControllers;
        /**
         * Create instance of component
         * @param component {function|string}
         */
        getFactoryOf(component: any): Function;
        /**
         * Convert string to snake case format: sampleText --> sample-text
         * @param source - value to convert
         */
        snakeCase(source: string): string;
        /**
         * Convert to camelCase format: SampleText --> sampleText
         * @param source - value to convert
         */
        camelCase(source: string): string;
        /**
         * Convert tag-name to camelCase: some-tag --> someTag
         * @param source - value to convert
         */
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
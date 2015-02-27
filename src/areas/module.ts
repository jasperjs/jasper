declare var $script: any;

module jasper.areas {


    // Area representation
    export interface IAreaSection {
        scripts: string[]; // required scripts
        styles: string[]; //required styles
        dependencies: string[]; //other area dependencies
    }



}

angular.module('jasperAreas', ['jasperCore'])
    .service('jasperAreasService', jasper.areas.JasperAreasService)
    .directive('jasperArea', jasper.areas.JasperAreaDirective);
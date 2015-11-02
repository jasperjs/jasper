module jasper.core {
    /**
     * Data structure for jDebug
     */
    export interface IJDebugInfo {
        /**
         * System path to the component/service etc.
         */
        folder: string;

        scripts: string[];

        styles: string[];
    }
}
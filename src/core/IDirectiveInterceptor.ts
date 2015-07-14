module jasper.core{
    /**
     * Interface allow to extend jasper application
     * Uses by jDebug tools for live reloding application components
     */
    export interface IDirectiveInterceptor {
        /**
         * Invokes when during directive template compilation
         * @param directive     directive definition
         * @param tElement      template element
         */
        onCompile(directive:ng.IDirective, tElement:JQuery);

        /**
         * Invokes when application create component instance over DOM element
         * @param directive     directive definition
         * @param scope         angular scope for directive
         * @param iElement      directive DOM node
         */
        onMount(directive:ng.IDirective, scope:ng.IScope, iElement:JQuery);
    }
}
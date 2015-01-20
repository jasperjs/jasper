declare module jasper.core {
    interface IComponentControllers {
        main: any;
        controllersToPass: any[];
    }
}
declare module jasper.core {
    interface IHtmlRegistrar<T> {
        register(component: T): void;
    }
}
declare module jasper.core {
    interface IUtilityService {
        getComponentControllers(controllers: any, directive: ng.IDirective): IComponentControllers;
        getFactoryOf(component: any): Function;
        snakeCase(source: string): string;
        camelCase(source: string): string;
        camelCaseTagName(source: string): string;
    }
    class UtilityService implements IUtilityService {
        getComponentControllers(controllers: any, directive: ng.IDirective): IComponentControllers;
        getFactoryOf(component: any): Function;
        snakeCase(source: string): string;
        camelCase(source: string): string;
        camelCaseTagName(tagName: string): string;
    }
}
declare module jasper.core {
    class HtmlComponentRegistrar implements IHtmlRegistrar<IHtmlComponentDefinition> {
        private directive;
        private utility;
        constructor(compileProvider: ng.ICompileProvider);
        register(component: IHtmlComponentDefinition): void;
        private passPropertiesToCtrl(def, scope, ctrl, attrs);
        private setupCtrlValue(attributeName, ctrl, scope, watch);
        private createDirectiveFor(def);
        private getScopeDefinition(def);
        private getRequirementsForComponent(component);
        private getAttributes(attributes);
    }
}
declare module jasper.core {
    interface IComponentProvider {
        register(component: IHtmlComponentDefinition): any;
    }
    class ComponentProvider implements IComponentProvider, ng.IServiceProvider {
        static $inject: string[];
        private componentRegistar;
        constructor($compileProvider: ng.ICompileProvider);
        register(component: IHtmlComponentDefinition): void;
        $get(): {};
    }
}
declare module jasper {
    interface IHtmlComponent {
        link?: (element?: HTMLElement, components?: any) => void;
        initializeComponent?(): any;
        destroyComponent?(): any;
    }
}
declare module jasper.core {
    interface IAttributeBinding {
        name: string;
        type: string;
    }
}
declare module jasper.core {
    interface IHtmlComponentDefinition {
        name: string;
        transclude?: any;
        attributes?: any;
        templateUrl?: string;
        template?: string;
        ctor?: any;
        require?: any;
    }
}
declare module jasper.core {
    interface IDecoratorComponentProvider {
        register(decorator: IHtmlDecoratorDefinition): any;
    }
    class DecoratorComponentProvider implements IDecoratorComponentProvider, ng.IServiceProvider {
        static $inject: string[];
        private decoratorRegistar;
        constructor($compileProvider: ng.ICompileProvider);
        register(decorator: IHtmlDecoratorDefinition): void;
        $get(): {};
    }
}
declare module jasper.core {
    class HtmlDecoratorRegistrar implements IHtmlRegistrar<IHtmlDecoratorDefinition> {
        private directive;
        private utility;
        constructor(compileProvider: ng.ICompileProvider);
        register(component: IHtmlDecoratorDefinition): void;
        private createDirectiveFor(def);
        private getRequirementsForComponent(component);
        private getComponentControllers(controllers, directive);
    }
}
declare module jasper {
    interface IHtmlDecoratorComponent {
        link?: (value: any, element: HTMLElement, attrs: any, components: any) => void;
        onValueChanged?: (newValue: any, oldValue: any) => void;
    }
}
declare module jasper.core {
    interface IHtmlDecoratorDefinition {
        name: string;
        ctor: any;
        require?: any;
        eval?: boolean;
    }
}
declare module jasper.core {
    interface IFilterProvider {
        register(filter: IFilterDefinition): any;
    }
    class FilterProvider implements IFilterProvider, ng.IServiceProvider {
        static $inject: string[];
        private filterRegistar;
        constructor($filterProvider: ng.IFilterProvider);
        register(filter: IFilterDefinition): void;
        $get(): {};
    }
}
declare module jasper.core {
    class FilterRegistrar implements IHtmlRegistrar<IFilterDefinition> {
        private filter;
        private utility;
        constructor(filterProvider: ng.IFilterProvider);
        register(def: IFilterDefinition): void;
    }
}
declare module jasper.core {
    interface IFilterDefinition {
        name: string;
        ctor: any;
    }
}
declare module jasper.core {
    interface IServiceDefinition {
        name: string;
        ctor: any;
    }
}
declare module jasper.core {
    interface IServiceProvider {
        register(decorator: IServiceDefinition): any;
    }
    class ServiceProvider implements IServiceProvider, ng.IServiceProvider {
        static $inject: string[];
        private serviceRegistar;
        constructor($provide: any);
        register(serviceDef: IServiceDefinition): void;
        $get(): {};
    }
}
declare module jasper.core {
    class ServiceRegistrar implements IHtmlRegistrar<IServiceDefinition> {
        private service;
        private utility;
        constructor(provide: any);
        register(def: IServiceDefinition): void;
    }
}
declare module jasper.core {
    interface ISubscription {
        remove(): any;
    }
    interface IGlobalEventsService {
        subscribe(eventName: string, listener: (...args: any[]) => void): ISubscription;
        broadcast(eventName: string, ...args: any[]): any;
    }
    class GlobalEventsService implements IGlobalEventsService {
        private events;
        subscribe(eventName: string, listener: (...args: any[]) => void): ISubscription;
        broadcast(eventName: string, ...args: any[]): void;
        private removeSubscription(eventName, listener);
    }
}
declare module jasper.core {
    interface IAppContext {
        digest(element: HTMLElement): any;
        apply(): any;
    }
    class AppContext implements IAppContext {
        private rootScope;
        static $inject: string[];
        constructor(rootScope: ng.IScope);
        digest(element: HTMLElement): void;
        apply(): void;
    }
}
declare module jasper.areas {
    class JasperAreaDirective {
        static $inject: string[];
        constructor($compile: ng.ICompileService, jasperAreasService: JasperAreasService, $q: ng.IQService);
    }
}
declare module jasper.areas {
    class JasperAreasService {
        static $inject: string[];
        private config;
        private loadiingModules;
        static maxDependencyHops: number;
        resourceManager: IResourceManager;
        loadedAreas: string[];
        q: ng.IQService;
        constructor($q: ng.IQService);
        configure(config: any): void;
        onAreaLoaded(areaName: string): ng.IPromise<any>;
        initArea(areaName: string): ng.IPromise<any>;
        loadAreas(areaName: string, hops?: number): ng.IPromise<any>;
        private isAreaLoaded(areaname);
        private prepareUrls(urls);
    }
}
declare module jasper.areas {
    interface IResourceManager {
        makeAccessible(scripts: string[], styles: string[], onReady: Function): any;
    }
    class JasperResourcesManager implements IResourceManager {
        static loadedScriptPaths: string[];
        private buildScripts(scripts);
        private inArray(source, val);
        makeAccessible(scripts: string[], styles: string[], onReady: () => void): void;
    }
}
declare var $script: any;
declare module jasper.areas {
    interface IAreaSection {
        scripts: string[];
        styles: string[];
        dependencies: string[];
    }
}
declare module jasper.routing {
    class JasperRouteTableProvider implements IRouteTableProvider {
        private routeProvider;
        static $inject: string[];
        constructor(routeProvider: any);
        setup(config: IRoutesConfiguration): void;
        $get(): JasperRouteTableProvider;
    }
}
declare module jasper.routing {
    interface IRoutesConfiguration {
        defaultRoutePath: string;
        routes: any;
    }
    interface IRouteTableProvider {
        setup(config: IRoutesConfiguration): any;
    }
}
declare var jsp: jasper.IJasperStatic;
declare module jasper {
    interface IJasperStatic {
        component(def: core.IHtmlComponentDefinition): any;
        decorator(def: core.IDecoratorComponentProvider): any;
        filter(def: core.IFilterDefinition): any;
        service(def: core.IServiceDefinition): any;
        areas: areas.JasperAreasService;
        template(name: string, content: string): any;
        directive(name: string, ddo: any): any;
    }
}

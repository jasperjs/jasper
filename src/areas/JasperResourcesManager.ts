 module jasper.areas {
     export interface IResourceManager {
         makeAccessible(scripts: string[], styles: string[], onReady: Function);
     }

     // Service reference resources to the page
     export class JasperResourcesManager implements IResourceManager {

         static loadedScriptPaths: string[] = [];

         private buildScripts(scripts: string[]): string[] {
             if (!scripts || scripts.length == 0) return [];

             var result: string[] = [];
             for (var i = 0; i < scripts.length; i++) {
                 if (this.inArray(JasperResourcesManager.loadedScriptPaths, scripts[i])) {
                     continue; // allready referenced
                 }
                 JasperResourcesManager.loadedScriptPaths.push(scripts[i]);
                 result.push(scripts[i]);
             }
             return result;
         }

         private inArray(source: string[], val: string): boolean {
             for (var i = 0; i < source.length; i++) {
                 if (source[i] == val)
                     return true;
             }
             return false;
         }

         makeAccessible(scripts: string[], styles: string[], onReady: () => void) {
             var resources = this.buildScripts(scripts);
             if (resources.length > 0) {
                 $script(resources, () => onReady());
             } else {
                 onReady();
             }
         }
     }
 }
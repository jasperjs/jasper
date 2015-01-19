module jasper.mocks {
    export class TestCompileProvider implements ng.ICompileProvider {
        directive(name: string, directiveFactory: Function): ng.ICompileProvider {
            return this;
        }
        $get() {
            return this;
        }
    }
}
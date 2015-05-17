module jasperApp {
    export class JasperApp {

        static $inject = ['SomeService'];

        title: string;
        color: string = 'blue';

        constructor(someService: jasperApp.SomeService){
            this.title = someService.someMethod();
        }

        showAlert(){
            alert('jasper app');
        }

        changeColor(){
            this.color='green';
        }

        onAllChangesDone() {
            console.log('jasper-app changes done');
        }
    }
}
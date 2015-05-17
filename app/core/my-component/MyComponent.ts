module jasperApp {
    export class MyComponent {
        title = 'my-component';

        names = ['victor', 'natali'];


        // attrs
        color:string;
        type:string;

        onSelect = new angular.EventEmitter(); // EventEmitter, breaking change?

        emit() {
            this.onSelect.next({$type: 'ok'});
        }

        changeColor() {
            this.color = 'red';
        }

        onChange(changes) {
            console.log(changes);
        }


        onAllChangesDone() {
            console.log('my-component changes done');
        }
    }
}
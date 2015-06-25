module jasper.core {
    export interface IEventEmitter {
        /**
         * Fires event emitter
         * @param eventArgs     arguments that will be allowed as '$event' variable in the expression
         */
        next(eventArgs:any): void;
    }

    export class EventEmitter implements IEventEmitter {


        constructor(private fn:Function) {

        }

        next(eventArgs:any):void {
            this.fn({$event: eventArgs});
        }

    }

}

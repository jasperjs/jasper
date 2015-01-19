module jasper.core {

    export interface ISubscription {
        remove();
    }

    export interface IGlobalEventsService {
        /*
         * Subscribe on event. Do not forget to call 'remove' method, when you no longer need the subscription
         * @param eventName: name of the event for notification
         * @param listener: callback for notification
         */
        subscribe(eventName: string, listener: (...args: any[]) => void): ISubscription;
        /*
         * Broadcast event for all subscribers
         * @param eventName: name of the event for notification
         */
        broadcast(eventName: string, ...args: any[]);
    }

    interface IEventsQueue {
        queue: Array<(...args: any[]) => void>;
    }

    interface IEventsCollection {
        [eventName: string]: IEventsQueue;
    }

    export class GlobalEventsService implements IGlobalEventsService {

        private events: IEventsCollection = {};

        subscribe(eventName: string, listener: (...args: any[]) => void): ISubscription {
            if (!this.events[eventName])
                this.events[eventName] = { queue: [] };

            this.events[eventName].queue.push(listener);

            return {
                remove() {
                    this.removeSubscription(eventName, listener);
                }
            };
        }

        broadcast(eventName: string, ...args: any[]) {
            if (!this.events[eventName]) return;

            var queue = this.events[eventName].queue;

            queue.forEach((listener) => {
                listener(args);
            });
        }

        private removeSubscription(eventName: string, listener: (...args: any[]) => void) {
            if (!this.events[eventName]) return;
            var queue = this.events[eventName].queue;
            for (var i = 0; i < queue.length; i++) {
                if (queue[i] === listener) {
                    queue.splice(i, 1);
                    break;
                }
            }
        }
    }
} 
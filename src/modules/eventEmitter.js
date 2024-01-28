//Implementation of an event emitter to link events in the app.
class EventEmitter {
    constructor() {
        this.events = {};
    }

    //on event
    on(event, listener) {
        if (typeof this.events[event] !== "object") {
            this.events[event] = [];
        }
        this.events[event].push(listener);
    }

    //emit our event to whatever we use
    emit(event, ...args) {
        if (typeof this.events[event] === "object") {
            this.events[event].forEach((listener) => listener.apply(this, args));
        }
    }

    //remove the listener from our event
    removeListener(event, listener) {
        if (typeof this.events[event] === "object") {
            const idx = this.events[event].indexOf(listener);
            if (idx > -1) {
                this.events[event].splice(idx, 1);
            }
        }
    }
}

export const eventEmitter = new EventEmitter();

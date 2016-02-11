(function (global, undefined) {

    //EventLogger Contructor
    var EventLogger = function (element) {

        return new EventLogger.init(element);

    };

    //EventLog Constructor
    function EventLog(title, durationEvent) {
        this.title = title || '';
        this.durationEvent = durationEvent || false;
    }

    var dragLog,
        switchLog;

    EventLogger.prototype = {

        dragstart: function (title, clientX, clientY) {
            dragLog = new EventLog(title, true);
            dragLog.start = (new Date()).toString();
            dragLog.mousedownXY = [clientX, clientY];
        },
        dragend: function (clientX, clientY) {
            dragLog.end = (new Date()).toString();
            dragLog.mouseupXY = [clientX, clientY];
            this.save(dragLog);
        },
        getMouseDownXY: function () {
            if (dragLog.mousedownXY) {
                return dragLog.mousedownXY;
            }
        },
        save: function (eventLog) {
            //Add created eventLog to an array
            this.key.events.push(eventLog);

            console.dir(this.key.events);

            //Save JSON formatted log events to local storage
            localStorage.setItem('experiment', JSON.stringify(this.key.events));
        },
        restart: function () {
            dragLog = null;
        }

    };

    // the acutal object is created here, allowing us to 'new' an object without calling 'new'
    EventLogger.init = function (element) {

        var self = this;

        self.element = element || '';

        //key for localStorage
        self.key = {
            'events': []
        };
    }

    EventLogger.init.prototype = EventLogger.prototype;

    global.EventLogger = global.EL = EventLogger;

    //    return EventLogger;

}(window));

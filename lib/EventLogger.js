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

        dragstart: function (title, clientX, clientY, cx, cy) {
            dragLog = new EventLog(title, true);
            dragLog.start = (new Date()).toString();
            dragLog.mousedownXY = [clientX, clientY];

            if (cx && cy) {
                dragLog.eyeholeStartXY = [cx, cy];
            }
        },
        dragend: function (clientX, clientY, cx, cy) {
            dragLog.end = (new Date()).toString();
            dragLog.mouseupXY = [clientX, clientY];

            if (cx && cy) {
                dragLog.eyeholeEndXY = [cx, cy];
            }

            return this.output(dragLog);

        },
        getMouseDownXY: function () {
            if (dragLog.mousedownXY) {
                return dragLog.mousedownXY;
            }
        },
        output: function (eventLog) {
            return eventLog;
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

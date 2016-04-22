(function(global, undefined) {

    //EventLogger Contructor
    var EventLogger = function(element) {

        return new EventLogger.init(element);

    };

    //EventLog Constructor
    function EventLog(event) {
        this.event = event || '';
    }

    var dragLog,
        switchLog;

    EventLogger.prototype = {

        dragstart: function(event, clientX, clientY, cx, cy) {
            dragLog = new EventLog(event);
            dragLog.start = new Date().getTime();
            dragLog.mousedownX = clientX;
            dragLog.mousedownY = clientY;

        },
        dragend: function(clientX, clientY, cx, cy) {
            dragLog.end = new Date().getTime();
            dragLog.mouseupX = clientX;
            dragLog.mouseupY = clientY;
        },
        getMouseDownXY: function() {
            if (dragLog.mousedownX && dragLog.mousedownY) {
                var mousedownXY = [dragLog.mousedownX, dragLog.mousedownY];
                return mousedownXY;
            }
        },
        contextmenu: function(event, clientX, clientY) {
            var time = new Date().getTime(),
                x = clientX,
                y = clientY;

            switchLog = new EventLog(event);
            switchLog.start = time;
            switchLog.end = time;
            switchLog.mousedownX = x;
            switchLog.mousedownY = y;
            switchLog.mouseupX = x;
            switchLog.mouseupY = y;

        },
        outputDragLog: function() {
            return dragLog;
        },
        outputSwitchLog: function() {
            return switchLog;
        },
        dragrestart: function() {
            dragLog = null;
        }

    };

    // the acutal object is created here, allowing us to 'new' an object without calling 'new'
    EventLogger.init = function(element) {

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

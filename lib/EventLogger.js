/* 実験中のユーザ操作ログを取得するための自作ライブラリ */

(function(global, undefined) {

    //EventLogger Contructor
    var EventLogger = function(element) {

        return new EventLogger.init(element);

    };

    //EventLog Constructor
    function EventLog(event) {
        this.event = event || '';
        // this.durationEvent = durationEvent || false;
    }

    var dragLog;

    EventLogger.prototype = {

        dragstart: function(event, clientX, clientY, cx, cy) {
            dragLog = new EventLog(event);
            dragLog.start = new Date().getTime();
            dragLog.mousedownX = clientX;
            dragLog.mousedownY = clientY;
            dragLog.eyeholeStartCX = cx;
            dragLog.eyeholeStartCY = cy;

        },
        dragend: function(clientX, clientY, cx, cy) {
            dragLog.end = new Date().getTime();
            dragLog.mouseupX = clientX;
            dragLog.mouseupY = clientY;
            dragLog.eyeholeEndCX = cx;
            dragLog.eyeholeEndCY = cy;

            return this.output(dragLog);

        },
        getMouseDownXY: function() {
            if (dragLog.mousedownX && dragLog.mousedownY) {
                var mousedownXY = [dragLog.mousedownX, dragLog.mousedownY];
                return mousedownXY;
            }
        },
        output: function(eventLog) {
            return eventLog;
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

(function () {

    'use strict';

    /*-----------------------------------

       Variables

      ----------------------------------*/

    var backgroundLayer,
        frontLayer,
        svgout = document.getElementById('svgout'),
        back = document.getElementById('back'),
        front = document.getElementById('front'),
        prevX = 0,
        prevY = 0,
        isDragging = false,
        eventLogs = {
            'events': []
        };


    /*-----------------------------------

      Main program

     ----------------------------------*/

    //Settings for background layer
    var bgLayerSettings = {
        images: ["img/present.png"],
        interval: 200, //msec
        autoRotate: true
    }

    //Settings for front layer
    var frLayerSettings = {
        //        images: ["img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg", "img/5.jpg", "img/6.jpg", "img/7.jpg", "img/8.jpg", "img/9.jpg", "img/10.jpg", "img/11.jpg"],
        images: ["img/past.png"],
        interval: 200, //msec
        autoRotate: true
    }

    //Activate 2 ThetaViewers
    var backgroundLayer = activateThetaViewer(back, bgLayerSettings);
    var frontLayer = activateThetaViewer(front, frLayerSettings);

    //Event Handling
    addEventListers(svgout);

    var frlayerLog = EventLogger(svgout, eventLogs);
    var bglayerLog = EventLogger(svgout, eventLogs);


    /*-----------------------------------

      Functions

     ----------------------------------*/

    function activateThetaViewer(element, options) {

        var thetaviewer = new ThetaViewer(element);

        for (var prop in options) {
            thetaviewer[prop] = options[prop];
        }

        thetaviewer.load();

        return thetaviewer;
    }

    function addEventListers(element) {
        document.addEventListener('contextmenu', onContextMenu, false);
        element.addEventListener('mousedown', onMouseDown, false);
        element.addEventListener('mousemove', onMouseMove, false);
        element.addEventListener('mouseup', onMouseUp, false);
        element.addEventListener('mouseout', onMouseUp, false);
    }

    function onContextMenu(e) {
        e.preventDefault();

        if (front.style.display === '') {
            var log = frlayerLog.contextmenu('switchToBack', e.clientX, e.clientY);
            eventLogs.events.push(log);
            console.table(eventLogs.events);

            saveLog();
        } else if (front.style.display === 'none') {
            var log = bglayerLog.contextmenu('switchToFront', e.clientX, e.clientY);
            eventLogs.events.push(log);
            console.table(eventLogs.events);

            saveLog();
        }
        toggleVisibility("front");

        return false;
    }

    function onMouseDown(e) {
        e.preventDefault();

        if (event.button === 0) {
            isDragging = true;

            //Start recording drag event log

            if (front.style.display === '') {
                frlayerLog.dragstart('frontViewDrag', e.clientX, e.clientY);
            } else if (front.style.display === 'none') {
                bglayerLog.dragstart('backViewDrag', e.clientX, e.clientY);
            }

        } else if (event.button === 2) {
            return false;
        }

    }

    function onMouseUp(e) {
        e.preventDefault();

        if (isDragging) {

            if (front.style.display === '') {
                dragEndLog(e, frlayerLog);
            } else if (front.style.display === 'none') {
                dragEndLog(e, bglayerLog);
            }

        }

        isDragging = false;

        backgroundLayer.controls.noRotate = false;
        frontLayer.controls.noRotate = false;
    }

    function onMouseMove(e) {

        e.preventDefault();

        if (!isDragging) return false;

    }

    function toggleVisibility(id) {
     var el = document.getElementById(id);

     if (el.style.display === '') {
         el.style.display = 'none';
     } else {
         el.style.display = '';
     }
 }

    function dragEndLog(e, draglog, cx, cy) {
        //get coordinates of where dragging started
        var prevXY = draglog.getMouseDownXY();

        //figure out if mouse coordinates has changed (=dragged)
        if (e.clientX !== prevXY[0] || e.clientY !== prevXY[1]) {
            //Finish recording drag event log
            var log = draglog.dragend(e.clientX, e.clientY, cx, cy);

            eventLogs.events.push(log);
            console.table(eventLogs.events);

            saveLog();
        }
        draglog.restart();
    }

    function saveLog() {
        localStorage.setItem('eventLogs', JSON.stringify(eventLogs));
    }

    //For Debugging Purposes
    function log(value, attribute) {
        return console.log(value, attribute);
    }

}());

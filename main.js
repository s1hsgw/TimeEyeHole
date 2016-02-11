(function () {

    'use strict';

    /*-----------------------------------

       Variables

      ----------------------------------*/

    var backgroundLayer,
        frontLayer,
        svgout = document.getElementById('svgout'),
        eyehole = document.getElementById('eyehole'),
        prevX = 0,
        prevY = 0,
        cx = 0.5 * window.innerWidth,
        cy = 0.5 * window.innerHeight,
        isDragging = false,
        dx = 0,
        dy = 0,
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
    var backgroundLayer = activateThetaViewer("back", bgLayerSettings);
    var frontLayer = activateThetaViewer("front", frLayerSettings);

    // Set central coordinates of clip-path and eyehole
    updateEyeHoleXY(cx, cy);

    //Event Handling
    addEventListers(svgout);

    var eyeholeLog = EventLogger(eyehole, eventLogs);
    var layerLog = EventLogger(svgout, eventLogs);


    /*-----------------------------------

      Functions

     ----------------------------------*/

    function activateThetaViewer(id, options) {

        var thetaviewer = new ThetaViewer(document.getElementById(id));

        for (var prop in options) {
            thetaviewer[prop] = options[prop];
        }

        thetaviewer.load();

        return thetaviewer;
    }

    function addEventListers(element) {
        element.addEventListener('mousedown', onMouseDown, false);
        element.addEventListener('mousemove', onMouseMove, false);
        element.addEventListener('mouseup', onMouseUp, false);
        element.addEventListener('mouseout', onMouseUp, false);
    }

    function onMouseDown(e) {
        e.preventDefault();

        isDragging = true;

        //save previous mouse position
        prevX = e.clientX;
        prevY = e.clientY;

        //Start recording drag event log
        if (e.srcElement === eyehole) {
            eyeholeLog.dragstart('eyeholeDrag', e.clientX, e.clientY);
        } else {
            layerLog.dragstart('viewDrag', e.clientX, e.clientY);
        }

    }

    function onMouseUp(e) {
        e.preventDefault();

        if (isDragging) {

            if (e.srcElement === eyehole) {
                dragEndLog(e, eyeholeLog);
            } else {
                dragEndLog(e, layerLog);
            }
        }

        isDragging = false;

        backgroundLayer.controls.noRotate = false;
        frontLayer.controls.noRotate = false;
    }

    function onMouseMove(e) {

        e.preventDefault();

        if (!isDragging) return false;

        if (e.srcElement === eyehole) {
            backgroundLayer.controls.noRotate = true;
            frontLayer.controls.noRotate = true;

            //Get central coordinates of Time Eye-Hole
            cx = parseFloat(eyehole.getAttribute("cx"));
            cy = parseFloat(eyehole.getAttribute("cy"));

            //Calculate the difference between previous position and current position
            dx = e.clientX - prevX;
            dy = e.clientY - prevY;

            //calculate new central coordinates
            cx += dx;
            cy += dy;

            //Update previous position
            prevX = e.clientX;
            prevY = e.clientY;

            //Update view
            updateEyeHoleXY(cx, cy);
        }
    }

    function updateEyeHoleXY(cx, cy) {

        eyehole.setAttribute("cx", cx + 'px');
        eyehole.setAttribute("cy", cy + 'px');

        //Update clip-path
        frontLayer.dom.style["-webkit-clip-path"] = 'circle(' + 250 + 'px at ' + cx + 'px ' + cy + 'px)';
        frontLayer.dom.style["clip-path"] = 'circle(' + 250 + 'px at ' + cx + 'px ' + cy + 'px)';

    }

    function dragEndLog(e, draglog) {
        //get coordinates of where dragging started
        var prevXY = draglog.getMouseDownXY();

        //figure out if mouse coordinates has changed (=dragged)
        if (e.clientX !== prevXY[0] || e.clientY !== prevXY[1]) {
            //Finish recording drag event log
            var log = draglog.dragend(e.clientX, e.clientY);

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

(function() {

    'use strict';

    /*-----------------------------------

       Variables

      ----------------------------------*/

    var backgroundLayer,
        frontLayer,
        svgout = document.getElementById('svgout'),
        eyehole = document.getElementById('eyehole'),
        interval = 300,
        autoRotate = false,
        prevX = 0,
        prevY = 0,
        cx = window.innerWidth * 0.5,
        cy = window.innerHeight * 0.5,
        isDragging = false,
        dx = 0,
        dy = 0,
        eventLogs = {
            'events': []
        },
        csv;


    /*-----------------------------------

      Main program

     ----------------------------------*/

    //Settings for background layer
    var bgLayerSettings = {
        images: ["img/present.png"],
        interval: interval, //msec
        autoRotate: autoRotate
    }

    //Settings for front layer
    var frLayerSettings = {
        // images: ["img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg", "img/5.jpg", "img/6.jpg", "img/7.jpg", "img/8.jpg", "img/9.jpg", "img/10.jpg", "img/11.jpg"],
        images: ["img/past.png"],
        interval: interval, //msec
        autoRotate: autoRotate
    }

    //Activate 2 ThetaViewers
    var backgroundLayer = activateThetaViewer("back", bgLayerSettings);
    var frontLayer = activateThetaViewer("front", frLayerSettings);

    // Setup EyeHole UI
    updateEyeHole(cx, cy);

    //Event Handling
    addEventListeners(svgout);

    var eyeholeLog = EventLogger(eyehole);
    var layerLog = EventLogger(svgout);


    /*-----------------------------------

      Functions

     ----------------------------------*/

    function activateThetaViewer(id, options) {

        var thetaviewer = new ThetaViewer(document.getElementById(id));

        for (var prop in options) {
            thetaviewer[prop] = options[prop];
        }

        var test = thetaviewer.load();

        return thetaviewer;
    }

    function updateEyeHole(cx, cy) {

        //Set central coordinates of eyehole
        cx = cx;
        cy = cy;
        eyehole.setAttribute("cx", cx + 'px');
        eyehole.setAttribute("cy", cy + 'px');

        //Set radius of eyehole
        var r = calcEyeHoleRadius();
        eyehole.setAttribute("r", r + 'px');

        //Set clip-path
        frontLayer.dom.style["-webkit-clip-path"] = 'circle(' + r + 'px at ' + cx + 'px ' + cy + 'px)';
        frontLayer.dom.style["clip-path"] = 'circle(' + r + 'px at ' + cx + 'px ' + cy + 'px)';

    }

    function calcEyeHoleRadius() {
        var windowArea = window.innerWidth * window.innerHeight;
        var eyeholeArea = 0.125 * windowArea;

        var radius = Math.round(Math.sqrt(eyeholeArea / Math.PI));

        return radius;
    }


    /* Event Handling functions */

    function addEventListeners(element) {
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
            eyeholeLog.dragstart('eyeholeDrag', e.clientX, e.clientY, cx, cy);
        } else {
            layerLog.dragstart('viewDrag', e.clientX, e.clientY);
        }

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
            updateEyeHole(cx, cy);
        }
    }

    function onMouseUp(e) {
        e.preventDefault();

        if (isDragging) {

            if (e.srcElement === eyehole) {
                dragEndLog(e, eyeholeLog, cx, cy);
            } else {
                dragEndLog(e, layerLog);
            }
        }

        isDragging = false;

        backgroundLayer.controls.noRotate = false;
        frontLayer.controls.noRotate = false;
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

            csv = convertToCSV(eventLogs.events);
        }
        draglog.dragrestart();
    }

    function convertToCSV(objArray) {

        // localStorage.setItem('eventLogs', JSON.stringify(eventLogs));

        var array = objArray;
        var header = [];
        var line = [];
        var body = "";
        var output;

        // ヘッダーの取得

        //配列の先頭要素から全てのプロパティを読み取り配列に突っ込む
        for (var prop in array[0]) {
            header.push(prop);
        }
        //joinでCSV形式にして改行する
        header.join(", ");
        header += '\r\n';

        for (var i = 0; i < array.length; i++) {
            for (var index in array[i]) {
                line.push(array[i][index]);
            }
            line.join(", ");
            body += line + '\r\n';
            line = [];
        }

        output = header + body;

        return output;
    }


    document.onkeydown = function(e) {
        var shift = e.shiftKey,
            ctrl = e.ctrlKey,
            keycode = e.keyCode;

        if (shift && ctrl) {
            switch (keycode) {
                case 80:
                    var filename = prompt("ファイル名を入力", "test.csv");
                    downloadCSV(csv, filename);
                    break;
                default:
                    break;
            }
        }
    }

    function downloadCSV(csv, filename) {
        // Unicodeコードポイントの配列に変換する
        var unicode_array = str_to_unicode_array(csv);

        // 文字コード配列をTypedArrayに変換する
        var uint8_array = new Uint8Array(unicode_array);

        // 指定されたデータを保持するBlobを作成する
        var blob = new Blob([uint8_array], { type: 'text/csv' });

        // Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
        window.URL = window.URL || window.webkitURL;
        var link = document.getElementById("blob");
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;

        link.click();

    }

    // 文字列から，Unicodeコードポイントの配列を作る
    function str_to_unicode_array(str) {
        var arr = [];
        for (var i = 0; i < str.length; i++) {
            arr.push(str.charCodeAt(i));
        }
        return arr;
    };



    //For Debugging Purposes
    function log(value, attribute) {
        return console.log(value, attribute);
    }

}());
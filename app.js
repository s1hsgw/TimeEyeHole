(function() {

    'use strict';

    /*-----------------------------------

       Variables

      ----------------------------------*/

    var backgroundLayer,
        frontLayer,
        svgout = document.getElementById('svgout'),
        eyehole = document.getElementById('eyehole'),
        clip = document.getElementById('eyehole-clip'),
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
        csv,
        clippath = document.getElementById('clipPath'),
        children = clippath.children,
        child,
        outerPathCX,
        outerPathCY,
        tx,
        ty,
        baseRadius,
        currentRadius,
        radiusScaleRatio,
        outerPathPositionX,
        outerPathPositionY;


    /*-----------------------------------

      Main program

     ----------------------------------*/

    //Settings for background layer
    var bgLayerSettings = {
        images: ["img/present_mod.png"],
        interval: interval, //msec
        autoRotate: autoRotate
    }

    //Settings for front layer
    var frLayerSettings = {
        // images: ["img/1.jpg", "img/2.jpg", "img/3.jpg", "img/4.jpg", "img/5.jpg", "img/6.jpg", "img/7.jpg", "img/8.jpg", "img/9.jpg", "img/10.jpg", "img/11.jpg"],
        images: ["img/past_mod.png"],
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


    // Centering clip-path
    for (var i = 0; i < children.length; i++) {
        child = children[i];

        if (i !== 0) {

            //スケール比を円の半径から求める
            baseRadius = 215;
            currentRadius = parseFloat(clip.getAttribute("r"));
            radiusScaleRatio = currentRadius / baseRadius;

            //outerpathの中心点までの幅と高さを求める
            outerPathCX = (child.getBBox().width * radiusScaleRatio) / 2;
            outerPathCY = (child.getBBox().height  * radiusScaleRatio) / 2;

            tx = (window.innerWidth * 0.5) - outerPathCX;
            ty = (window.innerHeight * 0.5) - outerPathCY;


            //outerpathをリサイズして画面の中央に配置
            child.setAttribute('transform', 'translate(' + tx + ' ' + ty + ')' + ', scale(' + radiusScaleRatio + ')');

        }


    }

    //outerpathのx, y座標を変数に保存しておく（onmousemoveでouterpathを移動させる際に使用する）
    outerPathPositionX = child.getCTM().e;
    outerPathPositionY = child.getCTM().f;

    configureRotation();

    setInterval(repaint, 10);




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
        clip.setAttribute("cx", cx + 'px');
        clip.setAttribute("cy", cy + 'px');

        //Set radius of eyehole
        var r = calcEyeHoleRadius();

        eyehole.setAttribute("r", r + 'px');
        clip.setAttribute("r", r + 'px');

        //repaint

        $('#front').hide().show(0);

    }

    function calcEyeHoleRadius() {

        //画面の12.5%がTime Eye-Holeになるよう半径を計算する

        var windowArea = window.innerWidth * window.innerHeight;
        var eyeholeArea = 0.125 * windowArea;

        var radius = Math.round(Math.sqrt(eyeholeArea / Math.PI));

        return radius;
    }


    /* Event Handling functions */

    function repaint() {
        $('#front').hide().show(0);
    }

    function configureRotation() {
        var outerpath = document.getElementById('outer-clip');
        var rotation = document.getElementById('rotation');

        var rotateCenterX = (outerpath.getBBox().width/2);
        var rotateCenterY = (outerpath.getBBox().height/2);

        rotation.setAttribute('from', '0 ' + rotateCenterX + ' ' + rotateCenterY);
        rotation.setAttribute('to', '360 ' + rotateCenterX + ' ' + rotateCenterY);

    }

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
            layerLog.dragstart('viewDrag', e.clientX, e.clientY, cx, cy);
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

            var clippath = document.getElementById('clipPath'),
                children = clippath.children,
                child;

            for (var i = 0; i < children.length; i++) {
                child = children[i];

                if (i === 0) {
                    //calculate new central coordinates
                    cx += dx;
                    cy += dy;
                } else {
                    //マウスの移動量をsvgの座標値に加算し新しい座標を求める

                    outerPathPositionX += dx;
                    outerPathPositionY += dy;

                    child.setAttribute('transform', 'translate(' + outerPathPositionX + ' ' + outerPathPositionY + ')' + ', scale(' + radiusScaleRatio + ')');
                }


            }


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
                dragEndLog(e, layerLog, cx, cy);
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

                    var now = new Date();

                    var filename = prompt("ファイル名を入力", "EyeHole_" + dateFormat(now) + "_15tm522b.csv");
                    downloadCSV(csv, filename);

                    break;
                default:
                    break;
            }
        }
    }

    // dateFormat 関数の定義
    function dateFormat(date) {
        var y = date.getFullYear();
        var m = date.getMonth() + 1;
        var d = date.getDate();
        var w = date.getDay();
        var hrs = date.getHours();
        var min = date.getMinutes();
        var sec = date.getSeconds();

        var wNames = ['日', '月', '火', '水', '木', '金', '土'];

        if (m < 10) {
            m = '0' + m;
        }
        if (d < 10) {
            d = '0' + d;
        }

        // フォーマット整形済みの文字列を戻り値にする
        return y + '年' + m + '月' + d + '日_(' + wNames[w] + ')_' + hrs + ':' + min + ':' + sec;
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

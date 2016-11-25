(function() {

  'use strict';

  /*-----------------------------------

     Variables

    ----------------------------------*/

  var backgroundLayer,
    frontLayer,
    svgout = document.getElementById('svgout'),
    eyerect = document.getElementById('eyerect'),
    clip = document.getElementById('rect-clip'),
    interval = 300,
    autoRotate = false,
    prevX = 0,
    prevY = 0,
    cx,
    cy,
    isDragging = false,
    isPaused = false,
    dx = 0,
    dy = 0,
    eventLogs = {
      'events': []
    },
    csv,
    baseRadius,
    currentRadius,
    radiusScaleRatio,
    viewDragging = false;


  /*-----------------------------------

    Main program

   ----------------------------------*/

  //Settings for background layer
  var LayerSetting1 = {
      images: ["img/tutorial_mod.JPG"],
      interval: interval, //msec
      autoRotate: autoRotate
    }
    //Settings for front layer
  var LayerSetting2 = {
    images: ["img/tutorial.JPG"],
    interval: interval, //msec
    autoRotate: autoRotate
  }

  //Activate 2 ThetaViewers
  var backgroundLayer = activateThetaViewer("back", LayerSetting1);
  var backgroundLayer_clone = activateThetaViewer("backClone", LayerSetting2);
  var frontLayer = activateThetaViewer("front", LayerSetting1);
  var frontLayer_clone = activateThetaViewer("frontClone", LayerSetting2);

  //Set animation to both layers
  $('#front').addClass('front-anim');
  $('#back').addClass('back-anim');

  // Setup EyeHole UI
  updateEyeHole();

  //Event Handling
  addEventListeners(svgout);

  // var eyeholeLog = EventLogger(eyehole);
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

  function updateEyeHole() {

    var r = parseInt(calcEyeHoleRadius());

    cx = (window.innerWidth * 0.5) - r;
    cy = (window.innerHeight * 0.5) - (0.75 * r);

    clip.setAttribute("x", cx);
    clip.setAttribute("y", cy);
    clip.setAttribute("width", r * 2);
    clip.setAttribute("height", r * 1.5);

    eyerect.setAttribute("x", cx);
    eyerect.setAttribute("y", cy);
    eyerect.setAttribute("width", r * 2);
    eyerect.setAttribute("height", r * 1.5);

    // repaint();
  }


  //EyeHoleの半径を画面の高さと横幅から求める関数
  function calcEyeHoleRadius() {

    //画面の30%がTime Eye-Holeになるよう半径を計算する

    var windowArea = window.innerWidth * window.innerHeight;
    var eyeholeArea = 0.3 * windowArea;

    var radius = Math.round(Math.sqrt(eyeholeArea / Math.PI));

    return radius;
  }

  //画面を再描画する関数
  function repaint() {
    $('#front').hide().show(0);
    $('#frontClone').hide().show(0);
    //内部でanimation関数が呼ばれるためフェードが止まってしまう可能性あり
  }

  //outerpathの回転設定（角度・中心）
  // function configureRotation() {
  //     var outerpath = document.getElementById('outer-clip');
  //     var rotation = document.getElementById('rotation');

  //     var rotateCenterX = (outerpath.getBBox().width / 2);
  //     var rotateCenterY = (outerpath.getBBox().height / 2);

  //     rotation.setAttribute('from', '0 ' + rotateCenterX + ' ' + rotateCenterY);
  //     rotation.setAttribute('to', '360 ' + rotateCenterX + ' ' + rotateCenterY);

  // }

  /* Event Handling functions */

  function addEventListeners(element) {
    element.addEventListener('mousedown', onMouseDown, false);
    // element.addEventListener('mousemove', onMouseMove, false);
    element.addEventListener('mouseup', onMouseUp, false);
    // element.addEventListener('mouseout', onMouseUp, false);
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('dblclick', onDoubleClick, false);
  }

  function onDoubleClick(e) {
      e.preventDefault();

      var log;

      $('.front-anim').toggleClass('paused');
      $('.back-anim').toggleClass('paused');

      if ($('.front-anim').hasClass('paused')) {
        isPaused = true;
        backgroundLayer.controls.noRotate = true;
        backgroundLayer_clone.controls.noRotate = true;
        frontLayer.controls.noRotate = true;
        frontLayer_clone.controls.noRotate = true;
        layerLog.dblclick('paused', e.clientX, e.clientY, cx, cy);
    } else {
        isPaused = false;
        backgroundLayer.controls.noRotate = false;
        backgroundLayer_clone.controls.noRotate = false;
        frontLayer.controls.noRotate = false;
        frontLayer_clone.controls.noRotate = false;
        layerLog.dblclick('started', e.clientX, e.clientY, cx, cy);
    }

    eventLogs.events.push(layerLog.outputPausedLog());
    console.table(eventLogs.events);
  }

  function onMouseDown(e) {
    e.preventDefault();

    isDragging = true;

    //save previous mouse position
    prevX = e.clientX;
    prevY = e.clientY;

    //Start recording drag event log

    // for experiment
    if(!isPaused) {
      layerLog.dragstart('viewDrag', e.clientX, e.clientY, cx, cy);
      viewDragging = true;
    }

    // if (isInsideEyehole(e)) {
    //     eyeholeLog.dragstart('eyeholeDrag', e.clientX, e.clientY, cx, cy);
    //     viewDragging = false;
    // } else {
    //     layerLog.dragstart('viewDrag', e.clientX, e.clientY, cx, cy);
    //     viewDragging = true;
    // }

  }

  // function isInsideEyehole(e) {
  //     var diffX = e.clientX - cx,
  //         diffY = e.clientY - cy,
  //         diff = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)),
  //         radius = parseFloat(clip.getAttribute("r"));
  //
  //     if (diff <= radius) {
  //         return true;
  //     } else {
  //         return false;
  //     }
  // }

  // function onMouseMove(e) {
  //
  //     e.preventDefault();
  //
  //
  //     if (!isDragging) return false;
  //
  //     $('.front').css('animation-play-state', 'running');
  //
  //     if (!viewDragging) {
  //         backgroundLayer.controls.noRotate = true;
  //         backgroundLayer_clone.controls.noRotate = true;
  //         frontLayer.controls.noRotate = true;
  //         frontLayer_clone.controls.noRotate = true;
  //
  //         //Get central coordinates of Time Eye-Hole
  //         cx = parseFloat(eyehole.getAttribute("cx"));
  //         cy = parseFloat(eyehole.getAttribute("cy"));
  //
  //         //Calculate the difference between previous position and current position
  //         dx = e.clientX - prevX;
  //         dy = e.clientY - prevY;
  //
  //         var clippath = document.getElementById('clipPath'),
  //             children = clippath.children,
  //             child;
  //
  //         for (var i = 0; i < children.length; i++) {
  //             child = children[i];
  //
  //             if (i === 0) {
  //                 //calculate new central coordinates
  //                 cx += dx;
  //                 cy += dy;
  //             } else {
  //                 //マウスの移動量をsvgの座標値に加算し新しい座標を求める
  //
  //                 outerPathPositionX += dx;
  //                 outerPathPositionY += dy;
  //
  //                 child.setAttribute('transform', 'translate(' + outerPathPositionX + ' ' + outerPathPositionY + ')' + ', scale(' + radiusScaleRatio + ')');
  //             }
  //         }
  //
  //         //Update previous position
  //         prevX = e.clientX;
  //         prevY = e.clientY;
  //
  //         //Update view
  //         updateEyeHole(cx, cy);
  //     }
  // }

  function onMouseUp(e) {
    e.preventDefault();

    // $('.front').css('animation-play-state', 'running');

    if (isDragging && !isPaused) {

      if (!viewDragging) {
        // dragEndLog(e, eyeholeLog, cx, cy);
      } else {
        dragEndLog(e, layerLog, cx, cy);
      }
    }

    isDragging = false;
  }

  function onKeyDown(e) {
    var shift = e.shiftKey,
      ctrl = e.ctrlKey,
      keycode = e.keyCode;

    if (shift && ctrl) {
      switch (keycode) {
        case 80:

          var now = new Date();
          csv = convertToCSV(eventLogs.events);

          var filename = prompt("ファイル名を入力", "EyeHole_" + dateFormat(now) + "_15tm522b.csv");
          downloadCSV(csv, filename);
          localStorage.removeItem('eventLogs');

          break;
        default:
          break;
      }
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
    }
    draglog.dragrestart();
  }

  /*-----------------------------------

   functions for generating CSV File

  ----------------------------------*/

  //Convert JavaScript Object to CSV format
  function convertToCSV(objArray) {

    localStorage.setItem('eventLogs', JSON.stringify(eventLogs));

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

  // タイムスタンプを日付形式に整形する関数
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

  // 文字列から，Unicodeコードポイントの配列を作る
  function str_to_unicode_array(str) {
    var arr = [];
    for (var i = 0; i < str.length; i++) {
      arr.push(str.charCodeAt(i));
    }
    return arr;
  };

  function downloadCSV(csv, filename) {
    // Unicodeコードポイントの配列に変換する
    var unicode_array = str_to_unicode_array(csv);

    // 文字コード配列をTypedArrayに変換する
    var uint8_array = new Uint8Array(unicode_array);

    // 指定されたデータを保持するBlobを作成する
    var blob = new Blob([uint8_array], {
      type: 'text/csv'
    });

    // Aタグのhref属性にBlobオブジェクトを設定し、リンクを生成
    window.URL = window.URL || window.webkitURL;
    var link = document.getElementById("blob");
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;

    link.click();
  }


}());

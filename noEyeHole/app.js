(function() {

  'use strict';

  /*-----------------------------------

     Variables

    ----------------------------------*/

  var backgroundLayer,
    frontLayer,
    svgout = document.getElementById('svgout'),
    eyerect = document.getElementById('eyerect'),
    back = document.getElementById('back'),
    front = document.getElementById('front'),
    prevX = 0,
    prevY = 0,
    cx = 0,
    cy = 0,
    isDragging = false,
    isPaused = false,
    eventsArray = [],
    csv = "",
    frontHidden = false;


  /*-----------------------------------

    Main program

   ----------------------------------*/

  //Settings for background layer
  var backSettings = {
    images: ["img/present_mod.png"],
    autoRotate: false
  }

  //Settings for front layer
  var frontSettings = {
    images: ["img/past_mod.png"],
    autoRotate: false
  }

  //データをリセット
  localStorage.clear();

  //Activate 2 ThetaViewers
  var backgroundLayer = activateThetaViewer(back, backSettings);
  var frontLayer = activateThetaViewer(front, frontSettings);

  //Event Handling
  addEventListeners(svgout);

  var frontLog = EventLogger(svgout);
  var backLog = EventLogger(svgout);

  initEyeRect();



  /*-----------------------------------

    Functions

   ----------------------------------*/
  function initEyeRect() {

    var r = parseInt(calcEyeHoleRadius());

    cx = (window.innerWidth * 0.5) - r;
    cy = (window.innerHeight * 0.5) - (0.75 * r);

    eyerect.setAttribute("x", cx);
    eyerect.setAttribute("y", cy);
    eyerect.setAttribute("width", r * 2);
    eyerect.setAttribute("height", r * 1.5);
  }

  function calcEyeHoleRadius() {

    //画面の30%がTime Eye-Holeになるよう半径を計算する

    var windowArea = window.innerWidth * window.innerHeight;
    var eyeholeArea = 0.3 * windowArea;

    var radius = Math.round(Math.sqrt(eyeholeArea / Math.PI));

    return radius;
  }

  function activateThetaViewer(element, options) {

    var thetaviewer = new ThetaViewer(element);

    for (var prop in options) {
      thetaviewer[prop] = options[prop];
    }

    thetaviewer.load();

    return thetaviewer;
  }

  function addEventListeners(element) {
    element.addEventListener('mousedown', onMouseDown, false);
    element.addEventListener('mousemove', onMouseMove, false);
    element.addEventListener('mouseup', onMouseUp, false);
    document.addEventListener('dblclick', onDoubleClick, false);
  }

  function onDoubleClick(e) {
    $('.front').toggleClass('paused');

    if ($('.front').hasClass('paused')) {
      isPaused = true;
      backgroundLayer.controls.noRotate = true;
      frontLayer.controls.noRotate = true;
      frontLog.dblclick('paused', e.clientX, e.clientY);
      eventsArray.push(frontLog.outputPausedLog());
    } else {
      isPaused = false;
      backgroundLayer.controls.noRotate = false;
      frontLayer.controls.noRotate = false;
      frontLog.dblclick('started', e.clientX, e.clientY);
      eventsArray.push(frontLog.outputPausedLog());
    }

    console.table(eventsArray);

  }

  function onMouseDown(e) {
    e.preventDefault();

    if (event.button === 0) {
      isDragging = true;

      //Start recording drag event log

      if (!frontHidden && !isPaused) {
        frontLog.dragstart('viewDrag', e.clientX, e.clientY);
      } else if (frontHidden) {
        // backLog.dragstart('backViewDrag', e.clientX, e.clientY);
      }

    } else if (event.button === 2) {
      return false;
    }

  }

  function onMouseUp(e) {
    e.preventDefault();


    // $('.front').css('animation-play-state', 'running');

    if (isDragging) {

      if (!frontHidden && !isPaused) {
        dragEndLog(e, frontLog);
      } else if (frontHidden) {
        dragEndLog(e, backLog);
      }

    }

    isDragging = false;
  }

  function onMouseMove(e) {

    e.preventDefault();

    if (!isDragging) return false;

    // $('.front').css('animation-play-state', 'paused');

  }

  function toggleVisibility(element) {
    var el = element;

    if (frontHidden) {
      console.log("changed to front");
      el.classList.remove("frontHidden");
      frontHidden = false;
    } else {
      console.log("changed to back");
      el.classList.add('frontHidden');
      frontHidden = true;
    }
  }

  function dragEndLog(e, draglog, cx, cy) {
    //get coordinates of where dragging started
    var prevXY = draglog.getMouseDownXY();

    //figure out if mouse coordinates has changed (=dragged)
    if (e.clientX !== prevXY[0] || e.clientY !== prevXY[1]) {
      //Finish recording drag event log
      draglog.dragend(e.clientX, e.clientY, cx, cy);

      eventsArray.push(draglog.outputDragLog());
      console.table(eventsArray);
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
          var filename = prompt("ファイル名を入力", "noEyeHole_" + dateFormat(now) + "_15tm522b.csv");
          csv = convertToCSV(eventsArray);
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

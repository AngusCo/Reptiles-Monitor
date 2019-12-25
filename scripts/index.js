var div_temp = document.querySelector(".temperature");
var div_rh = document.querySelector(".humidity");


function GetRealtimeValue () {
    var requestURL = 'https://api.thingspeak.com/channels/929404/feeds.json?results=1';
    var request = new XMLHttpRequest();

    request.open('GET', requestURL, true);
    
    request.onload = function() {
        var data = JSON.parse(this.response);
        var temp = data["feeds"][0]["field1"];
        var rh= data["feeds"][0]["field2"];

        $({countNum: 0}).animate({countNum: temp}, {
            duration: 1000,
            easing: 'swing',
            step: function() {
                div_temp.innerHTML = Math.round(this.countNum);
            }
        });

        $({countNum: 0}).animate({countNum: rh}, {
            duration: 1000,
            easing: 'swing',
            step: function() {
                div_rh.innerHTML = Math.round(this.countNum);
            }
        });
    };

    request.send();
}

function GetValueList () {
    var requestURL = 'https://api.thingspeak.com/channels/929404/feeds.json?offset=8&timescale=720';
  
    var now = new Date();
    var yymm = now.getFullYear() + "-" + (now.getMonth() + 1) + "-";
    var time = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
    var start = "start=" + yymm + (now.getDate() - 4) + "T" + time;
    var end = "end=" + yymm + now.getDate() + "T" + time;

    requestURL += "&" + start + "&" + end;
    console.log(requestURL);
    
    var request = new XMLHttpRequest();

    request.open('GET', requestURL, true);
    
    request.onload = function() {
        var data = JSON.parse(this.response);
        var length = data.feeds.length; // 資料長度
        var tempList = [];              // 溫度陣列
        var rhList = [];                // 濕度陣列

        // 填入溫濕度資料
        for (var i = 0; i < length; i++) {
            tempList.push(Math.round(data["feeds"][i]["field1"]));
            rhList.push(Math.round(data["feeds"][i]["field2"]));
        }

        console.log("TEMP Before: " + tempList);
        console.log("RH Before: " + rhList);

        // 等比例放大 Y 軸
        for (var i = 0; i < length; i++) {
            tempList[i] = 300 - (tempList[i] - 10) * 10;
            rhList[i] = 300 - (rhList[i] - 40) * 5;
        }

        // 加入 X 軸座標
        var screenWidth = window.innerWidth;
        var spacing = screenWidth / (length + 1);

        for (var i = 0; i < length; i++) {
            tempList.splice(i * 2, 0, (i + 1) * spacing);
            rhList.splice(i * 2, 0, (i + 1) * spacing);
        }
        console.log("TEMP After: " + tempList);
        console.log("RH After: " + rhList);

        DrawCurve(tempList, rhList);
    };

    request.send();
}

function DrawCurve (temp, rh) {
    var tempStage = new Konva.Stage({
        container: 'div-temp-curve',
        width: window.innerWidth,
        height: 300,
        // draggable: true
    });

    var rhStage = new Konva.Stage({
        container: 'div-rh-curve',
        width: window.innerWidth,
        height: 300,
        // draggable: true
    });

    var tempLayer = new Konva.Layer();
    var rhLayer = new Konva.Layer();
    tempStage.add(tempLayer);
    rhStage.add(rhLayer);

    var tempLine = new Konva.Line({
        points: temp,
        stroke: 'white',
        strokeWidth: 5,
        lineCap: 'round',
        lineJoin: 'round'
    });

    var rhLine = new Konva.Line({
        points: rh,
        stroke: 'white',
        strokeWidth: 5,
        lineCap: 'round',
        lineJoin: 'round'
    });

    tempLayer.add(tempLine);
    rhLayer.add(rhLine);
    tempLayer.draw();
    rhLayer.draw();

    // 限制拖移軸向
    // tempStage.dragBoundFunc(function(pos){
    //     return {
    //         x: pos.x,
    //         y: this.absolutePosition().y
    //     };
    // });

    // rhStage.dragBoundFunc(function(pos){
    //     return {
    //         x: pos.x,
    //         y: this.absolutePosition().y
    //     };
    // });
}

$(document).ready(function() {
    GetRealtimeValue();
    GetValueList();

    setInterval(() => {
        GetRealtimeValue();
    }, 60000);
});
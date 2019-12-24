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
    var requestURL = 'https://api.thingspeak.com/channels/929404/feeds.json?average=daily';
    var request = new XMLHttpRequest();

    request.open('GET', requestURL, true);
    
    request.onload = function() {
        var data = JSON.parse(this.response);
        var length = data.feeds.length;
        var tempList = [];
        var rhList = [];

        for (var i = length - 1; i >= 0; i--) {
            tempList.push(Math.round(data["feeds"][i]["field1"]));
            rhList.push(Math.round(data["feeds"][i]["field2"]));
        }

        // 二次整理
        // for (var i = 0; i < 10; i++) {
        //     tempList.splice(i * 2, 0, i * 30);
        // }
        console.log(tempList);
        console.log(rhList);

        DrawCurve(tempList, rhList);
    };

    request.send();
}

function DrawCurve (temp, rh) {
    var tempStage = new Konva.Stage({
        container: 'div-temp-curve',
        width: window.innerWidth,
        height: 200,
        draggable: true
    });

    var rhStage = new Konva.Stage({
        container: 'div-rh-curve',
        width: window.innerWidth,
        height: 200,
        draggable: true
    });

    var tempLayer = new Konva.Layer();
    var rhLayer = new Konva.Layer();
    tempStage.add(tempLayer);
    rhStage.add(rhLayer);

    var tempLine = new Konva.Line({
        points: temp,
        stroke: 'white',
        strokeWidth: 3,
        lineCap: 'round',
        lineJoin: 'round'
    });

    tempLayer.add(tempLine);
    tempLayer.draw();
    rhLayer.draw();

    // 限制拖移軸向
    tempStage.dragBoundFunc(function(pos){
        return {
            x: pos.x,
            y: this.absolutePosition().y
        };
    });

    rhStage.dragBoundFunc(function(pos){
        return {
            x: pos.x,
            y: this.absolutePosition().y
        };
    });
}

$(document).ready(function() {
    GetRealtimeValue();
    GetValueList();

    setInterval(() => {
        GetRealtimeValue();
    }, 60000);
});
const sampleDays = 4;
const strokeWidth = 4;
const circleRadius = 10;
const circleOpacity = .3;
const strokeColor = "white";

var tempList = [];
var rhList = [];
var timeList = [];


$(document).ready(function() {

    GetRealtimeValue();
    GetValueList();

    // 解析度變更時更新
    window.addEventListener("resize", function(){
        GetRealtimeValue();
        GetValueList();
    });

    // 每分鐘更新
    setInterval(() => {
        GetRealtimeValue();
        GetValueList();
    }, 60000);    
});


function GetRealtimeValue () {
    var requestURL = 'https://api.thingspeak.com/channels/929404/feeds.json?offset=8&results=1';
    var request = new XMLHttpRequest();

    request.open('GET', requestURL, true);
    
    request.onload = function() {
        var data = JSON.parse(this.response);
        var realtimeTemp = data["feeds"][0]["field1"];
        var realtimeRh = data["feeds"][0]["field2"];

        $({countNum: 0}).animate({countNum: realtimeTemp}, {
            duration: 1000,
            easing: 'swing',
            step: function() {
                document.querySelector(".temperature").innerHTML = Math.round(this.countNum);
            }
        });

        $({countNum: 0}).animate({countNum: realtimeRh}, {
            duration: 1000,
            easing: 'swing',
            step: function() {
                document.querySelector(".humidity").innerHTML = Math.round(this.countNum);
            }
        });

        document.querySelector("footer").innerHTML = "Last Updated on " + data["feeds"][0]["created_at"].substring(0, 16).replace("T", " at ");
    };

    request.send();
}

function GetValueList () {
    var requestURL = 
        "https://api.thingspeak.com/channels/929404/feeds.json?offset=8&timescale=720"
        + GetQueryParameters();

    console.log(requestURL);
    
    var request = new XMLHttpRequest();
    request.open('GET', requestURL, true);
    
    request.onload = function() {
        var data = JSON.parse(this.response);
        var length = data.feeds.length;     // 資料長度
        var tempPos = [];
        var rhPos = [];

        // 清空陣列內容
        tempList = [];
        rhList = [];
        timeList = [];

        // 填入溫濕度資料
        for (var i = 0; i < length; i++) {
            tempList.push(Math.round(data["feeds"][i]["field1"]));
            rhList.push(Math.round(data["feeds"][i]["field2"]));
            timeList.push(data["feeds"][i]["created_at"].substring(8, 13).replace("T", "\n一\n"));
        }

        console.log("原始溫度資料: " + tempList);
        console.log("原始濕度資料: " + rhList);

        var maxT = Math.max(...tempList);
        var minT = Math.min(...tempList);
        var maxR = Math.max(...rhList);
        var minR = Math.min(...rhList);

        // 換算成 Y 軸座標
        for (var i = 0; i < length; i++) {
            tempPos[i] = 160 - (tempList[i] - minT) * (90 / (maxT - minT));
            rhPos[i] = 130 - (rhList[i] - minR) * (90 / (maxR - minR));
        }

        // 加入 X 軸座標
        var screenWidth = window.innerWidth;
        var spacing = screenWidth / (length + 1);

        for (var i = 0; i < length; i++) {
            tempPos.splice(i * 2, 0, (i + 1) * spacing);
            rhPos.splice(i * 2, 0, (i + 1) * spacing);
        }

        DrawCurve(tempPos, "div-temp-curve");
        DrawCurve(rhPos, "div-rh-curve");
    };

    request.send();
}

function DrawCurve (list, id) {
    
    // Define stage
    var stage = new Konva.Stage({
        container: id,
        width: window.innerWidth,
        height: 200,
    });

    // Define layer
    var layer = new Konva.Layer();

    // Draw Curve
    var line = new Konva.Line({
        points: list,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        lineCap: "round",
        lineJoin: "round"
    });
    layer.add(line);

    // Draw Points
    for (var i = 0; i < list.length; i += 2)
    {
        // 外光暈
        var alphaCircle = new Konva.Circle({
            x: list[i],
            y: list[i+1],
            radius: circleRadius,
            fill: strokeColor,
            opacity: circleOpacity
        });
        layer.add(alphaCircle);

        // 中心點
        var centerCircle = new Konva.Circle({
            x: list[i],
            y: list[i+1],
            radius: (circleRadius / 2),
            fill: strokeColor,
        });
        layer.add(centerCircle);

        // 數值
        var textList = id == "div-temp-curve" ? tempList : rhList;

        var valueText = new Konva.Text({
            x: list[i],
            y: list[i+1],
            text: textList[i/2],
            fontSize: 14,
            fontFamily: "Verdana",
            fill: strokeColor,
            align: "center"
        });
        valueText.offsetX(10);
        valueText.offsetY(id == "div-temp-curve" ? -25 : 35);
        layer.add(valueText);

        // 日期
        var dateText = new Konva.Text({
            x: list[i],
            y: list[i+1],
            text: timeList[i/2],
            fontSize: 14,
            fontFamily: "Verdana",
            fill: strokeColor,
            align: "center"
        });
        dateText.offsetX(10);
        dateText.offsetY(id == "div-temp-curve" ? 65 : -25);
        layer.add(dateText);
    }

    // Show
    stage.add(layer);
    layer.draw();
}

function GetQueryParameters () {
    // 取樣結束時間
    var now = new Date();

    var end = "&end="
        + now.getFullYear() + "-"
        + (now.getMonth() + 1) + "-"
        + now.getDate() + "T"
        + now.getHours() + ":"
        + now.getMinutes() + ":"
        + now.getSeconds();

    // 回推取樣開始時間
    var startTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() - sampleDays,
        now.getHours(),
        now.getMinutes(),
        now.getSeconds()
    );

    var start = "&start="
        + startTime.getFullYear() + "-"
        + (startTime.getMonth() + 1) + "-"
        + startTime.getDate() + "T"
        + startTime.getHours() + ":"
        + startTime.getMinutes() + ":"
        + startTime.getSeconds();

    return start + end;
}


    




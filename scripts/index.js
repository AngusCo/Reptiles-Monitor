var div_temp = document.querySelector(".temperature");
var div_rh = document.querySelector(".humidity");


function GetRealtimeValue () {
    var requestURL = 'https://api.thingspeak.com/channels/929404/feeds.json?results=1';
    var request = new XMLHttpRequest();

    request.open('GET', requestURL, true);

    request.onload = function() {
        var data = JSON.parse(this.response);

        div_temp.innerHTML = data["feeds"][0]["field1"];
        div_rh.innerHTML = data["feeds"][0]["field2"];
    };

   request.send();
}

window.onload = function () {
    GetRealtimeValue();

    setInterval(() => {
        GetRealtimeValue();
    }, 60000);
}
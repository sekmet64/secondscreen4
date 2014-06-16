/// <reference path="../../Scripts/typings/socket.io-client/socket.io-client.d.ts" />
/// <reference path="../../Scripts/typings/jquery/jquery.d.ts" />

declare var io;
declare var swfobject;
declare var Cookies;
declare var ytplayer;

var socket;
var intervalId;

$(document).ready(function () {



    var params = { allowScriptAccess: "always" };
    var atts = { id: "ytplayer" };
    swfobject.embedSWF('http://www.youtube.com/apiplayer?enablejsapi=1&version=3&playerapiid=ytplayer',
        'ytapiplayer', '100%', '100%', '8', null, null, params, atts);



    var unique_id = Cookies.get('unique_id');

    socket = io.connect('http://localhost/'); //, {resource: '/nodejs/socket.io'}

   

    socket.on('connect-failed', function (args) {
        console.log('failed to connect');
    });

    socket.on('select-video', function (message) {
        var videoId = message.videoId;

        ytplayer.loadVideoById(videoId);

        intervalId = window.setInterval(updateTime, 1000);
    });

    socket.on('play', function (message) {

        ytplayer.playVideo();

        intervalId = window.setInterval(updateTime, 1000);
    });


    socket.on('pause', function (message) {

        ytplayer.pauseVideo();

        window.clearInterval(intervalId);
    });

    socket.on('mobile-connected', function (message) {
        $('.overlay').hide();
    });

    socket.on('connect-response', function (message) {
        var uniqueId = message.uniqueId;
        $("#unique-id-link").text(uniqueId);
    });

    if (typeof unique_id == 'undefined') {
        socket.emit('connect-desktop', { product: 'Y' });
    }
    else {
        $("#unique-id-link").text(unique_id);
        socket.emit('connect-desktop', { product: 'Y', uniqueId: unique_id });
    }

   

});

function onYouTubePlayerReady(playerId) {

}

function updateTime() {
    var time = ytplayer.getCurrentTime();

    socket.emit('update-time', { timeElapsed: time });
}
var socket;
var uniqueId;
var playing;
var totalTime;

declare var googleApiClientReady;
declare var gapi;

function pad(a, b) {return (1e15 + a + "").slice(-b) }


googleApiClientReady = function () {

    gapi.client.setApiKey('AIzaSyBI3yC3MlLUclrD00j40iB6eK-hoX5lmq8');
    gapi.client.load('youtube', 'v3', function () {
        handleAPILoaded();
    });

}

function handleAPILoaded() {
    var request = gapi.client.youtube.playlistItems.list({
        playlistId: 'PLrEnWoR732-BHrPp_Pm8_VleD68f9s14-',
        part: 'snippet'
    });

    request.execute(function (response) {
        var playlistItems = response.result.items;
        $.each(playlistItems, function (index, item) {
            displayResult(item.snippet);
        });
    });

}

$(document).ready(function () {
    uniqueId = getIdFromCurrentUrl();

    socket = io.connect('http://ctrlcouch.com');

    socket.on('update-time', function (message) {
        var timeElapsed = Math.round(message.timeElapsed);
        var percentage = timeElapsed / totalTime * 100;

        var seconds = pad(timeElapsed % 60, 2);
        var minutes = pad(Math.floor(timeElapsed / 60), 2);

        $('#now-playing-time-elapsed-text').html(minutes + ':' + seconds);

        $('#now-playing-progress').css('width', percentage + '%');
    });



    socket.emit('connect-mobile', { uniqueId: uniqueId });

    $('#now-playing-thumbnail').click(playPause);

    
});




function displayResult(videoSnippet) {
    var title = videoSnippet.title;
    var videoId = videoSnippet.resourceId.videoId;
    var thumbnail = videoSnippet.thumbnails.medium.url;


    $('#videos').append('<li id="' + videoId + '"><img src="' + thumbnail + '" /><br />' + title + ' </li>');

    $('#' + videoId).click({ videoId: videoId, thumbnail: thumbnail, title: title }, selectVideo);
}

function selectVideo(e) {
    socket.emit('select-video', { uniqueId: uniqueId, videoId: e.data.videoId });

    setPlaying();

    $('.controls').show();
    $('#now-playing-thumbnail-image').attr('src', e.data.thumbnail);
    $('#now-playing-title').html(e.data.title);

    loadVideoDetails(e.data.videoId);
}

function loadVideoDetails(videoId) {
    var request = gapi.client.youtube.videos.list({
        id: videoId,
        part: 'contentDetails'
    });

    request.execute(function (response) {
        var video = response.result.items[0];

        var isoDuration = video.contentDetails.duration;




        var formattedTime = isoDuration.replace("PT", "").replace("H", ":").replace("M", ":").replace("S", "");
        if (formattedTime.length < 3) {
            formattedTime = '00:' + formattedTime;
        }
        var s = formattedTime.split(':');
        var minutes = parseInt(s[0]);
        var seconds = parseInt(s[1]);
        totalTime = minutes * 60 + seconds;

        $('#now-playing-duration-text').html(formattedTime);
    });
}

function playPause() {
    if (playing) {
        socket.emit('pause');

        setPaused();

    }
    else {
        socket.emit('play');

        setPlaying();
    }

}

function setPlaying() {
    playing = true;

    $('.now-playing-overlay').attr('src', '/images/pause64.png');
}

function setPaused() {
    playing = false;
    $('.now-playing-overlay').attr('src', '/images/play64.png');
}
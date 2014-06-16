var socket;
var useGyroscope = false;
var accelerationMultiplier = 10;

var chartx;
var chartxData = [];
var t = 0;

var Acceleration = (function () {
    function Acceleration() {
    }
    return Acceleration;
})();

var MouseMove = (function () {
    function MouseMove(x, y) {
        this.x = x;
        this.y = y;
    }
    return MouseMove;
})();

$(document).ready(function () {
    uniqueId = getIdFromCurrentUrl();

    socket = io.connect('http://' + window.location.host);

    socket.emit('connect-mobile', { uniqueId: uniqueId });

    socket.on('connect', function () {
        //if (useGyroscope)
        //window.addEventListener("deviceorientation", handleOrientation, true);
        window.addEventListener("devicemotion", handleDeviceMotion, true);
    });

    socket.on('disconnect', function () {
        stopEvents();
    });

    chartx = new CanvasJS.Chart("xchart", {
        title: {
            text: "Live Random Data"
        },
        data: [{
                type: "line",
                dataPoints: chartxData
            }],
        axisY: {
            minimum: -10,
            maximum: 10
        }
    });
});

var alphaPrevious;
var betaPrevious;

function handleOrientation(event) {
    var absolute = event.absolute;
    var alpha = event.alpha;
    var beta = event.beta;
    var gamma = event.gamma;

    //$('#abs').html(absolute);
    //$('#alpha').html(alpha);
    //$('#beta').html(beta);
    //$('#gamma').html(gamma);
    if (typeof alphaPrevious != 'undefined' && typeof betaPrevious != 'undefined') {
        var alphaDifference = alphaPrevious - alpha;
        if (alphaDifference > 350.0)
            alphaDifference = 360.0 - alphaDifference;

        var betaDifference = betaPrevious - beta;
        if (betaDifference > 350.0)
            betaDifference = 360.0 - betaDifference;

        var dx = Math.round(alphaDifference * 30);
        var dy = Math.round(betaDifference * 30);

        if (dx != 0 || dy != 0)
            socket.emit('move', { x: dx, y: dy });
    }

    alphaPrevious = alpha;
    betaPrevious = beta;
}

function handleDeviceMotion(event) {
    var acceleration = new Acceleration();
    acceleration.x = event.acceleration.x;
    acceleration.y = event.acceleration.y;
    acceleration.z = event.acceleration.z;

    var interval = event.interval;

    //$('#x').html(acceleration.x.toString());
    //$('#y').html(acceleration.y.toString());
    //$('#z').html(acceleration.z.toString());
    //var M = getRotationMatrix(event.rotationRate.alpha, event.rotationRate.beta, event.rotationRate.gamma);
    //var mx = - Math.round(acceleration.x * accelerationMultiplier);
    //var my = Math.round(acceleration.z * accelerationMultiplier);
    var alphaRate = event.rotationRate.alpha;
    var betaRate = event.rotationRate.beta;
    var gammaRate = event.rotationRate.gamma;

    var dx = Math.round(gammaRate * -3);
    var dy = Math.round(alphaRate * -3);

    //var m = new MouseMove(dx, dy);
    //if (dx != 0 || dy != 0)
    socket.emit('move', { x: dx, y: dy });
    //alphaPrevious = event.rotationRate.alpha;
    //betaPrevious = event.rotationRate.beta;
    /*
    chartxData.push({
    x: t,
    y: acceleration.x
    });
    t++;
    if (chartxData.length > 100) {
    chartxData.shift();
    }
    
    chartx.render();
    */
}

function scale(acceleration) {
    acceleration.x *= accelerationMultiplier;
    acceleration.y *= accelerationMultiplier;
    acceleration.z *= accelerationMultiplier;
}

function round(acceleration) {
    acceleration.x = Math.round(acceleration.x);
    acceleration.y = Math.round(acceleration.y);
    acceleration.z = Math.round(acceleration.z);
}

function stopEvents() {
    //if (useGyroscope)
    //window.removeEventListener("deviceorientation", handleOrientation, true);
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
}

var degtorad = Math.PI / 180;

function getRotationMatrix(alpha, beta, gamma) {
    var _x = beta ? beta * degtorad : 0;
    var _y = gamma ? gamma * degtorad : 0;
    var _z = alpha ? alpha * degtorad : 0;

    var cX = Math.cos(_x);
    var cY = Math.cos(_y);
    var cZ = Math.cos(_z);
    var sX = Math.sin(_x);
    var sY = Math.sin(_y);
    var sZ = Math.sin(_z);

    //
    // ZXY rotation matrix construction.
    //
    var m11 = cZ * cY - sZ * sX * sY;
    var m12 = -cX * sZ;
    var m13 = cY * sZ * sX + cZ * sY;

    var m21 = cY * sZ + cZ * sX * sY;
    var m22 = cZ * cX;
    var m23 = sZ * sY - cZ * cY * sX;

    var m31 = -cX * sY;
    var m32 = sX;
    var m33 = cX * cY;

    return [
        m11, m12, m13,
        m21, m22, m23,
        m31, m32, m33
    ];
}
;
//# sourceMappingURL=mouse-remote.js.map

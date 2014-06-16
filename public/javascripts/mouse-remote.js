/// <reference path="../../Scripts/typings/three/three.d.ts" />
var socket;
var useGyroscope = false;
var accelerationMultiplier = 10;

//declare var THREE;
var chartx;
var chartxData = [];

var chartAlpha;
var chartAlphaData = [];

var chartGammaRate;
var chartGammaRateData = [];

var t = 0;

var alwaysOn = false;

// around z
var alpha;

// around x
var beta;

// around y
var gamma;

var alphaRateFiltered, betaRateFiltered, gammaRateFiltered;

// settings
var sensitivity = 25.0;

var leftMouseDown, rightMouseDown;

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
        //window.addEventListener("devicemotion", handleDeviceMotion, true);
    });

    socket.on('desktop-listening', function () {
        if (alwaysOn) {
            startMoveEvents();
        }
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

    chartAlpha = new CanvasJS.Chart("chart-alpha", {
        title: {
            text: "alpha"
        },
        data: [{
                type: "line",
                dataPoints: chartAlphaData
            }],
        axisY: {
            minimum: -200,
            maximum: 200
        }
    });
    chartAlpha.render();

    chartGammaRate = new CanvasJS.Chart("chart-gamma-rate", {
        title: {
            text: "gamma-rate"
        },
        data: [{
                type: "line",
                dataPoints: chartGammaRateData
            }],
        axisY: {
            minimum: -200,
            maximum: 200
        }
    });
    chartGammaRate.render();

    $('#map-left').on('touchstart', function (e) {
        //$('#left').attr('src', 'images/left-pressed.png');
        $('#left').hide();
        $('#left-pressed').show();

        socket.emit('left-mousedown');
        leftMouseDown = true;

        // only start mouse moves after a delay to not register the shaking caused by the tapping
        setTimeout(function () {
            if (leftMouseDown) {
                startMoveEvents();
            }
        }, 50);
    });

    $('#map-left').on('touchend', function (e) {
        //$('#left').attr('src', 'images/left.png');
        $('#left').show();
        $('#left-pressed').hide();

        socket.emit('left-mouseup');
        leftMouseDown = false;
        stopEvents();
    });

    $('#map-right').on('touchstart', function (e) {
        $('#right').hide();
        $('#right-pressed').show();

        socket.emit('right-mousedown');
        rightMouseDown = true;

        // only start mouse moves after a delay to not register the shaking caused by the tapping
        setTimeout(function () {
            if (rightMouseDown) {
                startMoveEvents();
            }
        }, 50);
    });

    $('#map-right').on('touchend', function (e) {
        $('#right').show();
        $('#right-pressed').hide();

        socket.emit('right-mouseup');
        rightMouseDown = false;
    });

    $('#map-middle').on('touchstart', function (e) {
        $('#middle').hide();
        $('#middle-pressed').show();

        socket.emit('mousemovestart');
        startMoveEvents();
    });

    $('#map-middle').on('touchend', function (e) {
        $('#middle').show();
        $('#middle-pressed').hide();

        stopEvents();
        socket.emit('mousemoveend');
    });

    $(document).bind('touchmove', function (e) {
        e.preventDefault();
    });

    $('#nav-settings').click(navToSettings);
    $('#nav-gyro').click(navToGyro);

    $("#slider-sens").bind("change", function (event) {
        sensitivity = parseInt($("#slider-sens").val());
    });
});

function navToSettings() {
    $('#page-gyro').hide();
    $('#page-settings').show();
}

function navToGyro() {
    $('#page-settings').hide();
    $('#page-gyro').show();
}

function handleOrientation(event) {
    //var absolute = event.absolute;
    alpha = event.alpha;
    beta = event.beta;
    gamma = event.gamma;

    //$('#abs').html(absolute);
    $('#alpha').html(alpha);
    $('#beta').html(beta);
    $('#gamma').html(gamma);
    //if (typeof alphaPrevious != 'undefined' && typeof betaPrevious != 'undefined') {
    //    var alphaDifference = alphaPrevious - alpha;
    //    if (alphaDifference > 350.0)
    //        alphaDifference = 360.0 - alphaDifference;
    //    var betaDifference = betaPrevious - beta;
    //    if (betaDifference > 350.0)
    //        betaDifference = 360.0 - betaDifference;
    //    var dx = Math.round(alphaDifference * 30);
    //    var dy = Math.round(betaDifference * 30);
    //    if (dx != 0 || dy != 0)
    //        socket.emit('move', { x: dx, y: dy });
    //}
    //alphaPrevious = alpha;
    //betaPrevious = beta;
}

function handleDeviceMotion(event) {
    var acceleration = new Acceleration();
    acceleration.x = event.acceleration.x;
    acceleration.y = event.acceleration.y;
    acceleration.z = event.acceleration.z;

    var interval = event.interval;

    $('#x').html(event.accelerationIncludingGravity.x);
    $('#y').html(event.accelerationIncludingGravity.y);
    $('#z').html(event.accelerationIncludingGravity.z);

    // g vector
    var x = $V([x, 0, 0]);
    var y = $V([0, y, 0]);
    var z = $V([0, 0, z]);

    //gravity if not moving
    //var g = $V([x,y,z]).toUnitVector();
    //var up = g.x(-1);
    var g = $V([x, y, z]);
    var up = g.toUnitVector().x(-1);
    var z_axis = $V([0, 0, 1]);

    var xoz_n = $V([0, 1, 0]);

    // up projected to xoz plane
    var up_proj = up.subtract(xoz_n.x(up.dot(xoz_n))).toUnitVector();

    var angle = Math.acos(z_axis.dot(up_proj));

    //var mx = - Math.round(acceleration.x * accelerationMultiplier);
    //var my = Math.round(acceleration.z * accelerationMultiplier);
    if (typeof gamma == 'undefined') {
        return;
    }

    var alphaRate = event.rotationRate.alpha;
    var betaRate = event.rotationRate.beta;
    var gammaRate = event.rotationRate.gamma;
    var interval = event.interval;

    if (typeof alphaRateFiltered == 'undefined') {
        alphaRateFiltered = alphaRate;
        betaRateFiltered = betaRate;
        gammaRateFiltered = gammaRate;
    } else {
        // low-pass filter
        var filteringFactor = 0.995;

        alphaRateFiltered = alphaRate * filteringFactor + alphaRateFiltered * (1.0 - filteringFactor);
        betaRateFiltered = betaRate * filteringFactor + betaRateFiltered * (1.0 - filteringFactor);
        gammaRateFiltered = gammaRate * filteringFactor + gammaRateFiltered * (1.0 - filteringFactor);
    }

    var gyroRotationRate = $V([gammaRateFiltered, alphaRateFiltered]).x(-1.0);

    // angle to rotate
    var angle = gamma * Math.PI / 180.0;
    gyroRotationRate = gyroRotationRate.rotate(angle, $V([0, 0]));

    var dx = Math.round(gyroRotationRate.e(1) * interval * sensitivity);
    var dy = Math.round(gyroRotationRate.e(2) * interval * sensitivity);

    if (isNaN(dx)) {
        alert(gamma);
    }

    //var m = new MouseMove(dx, dy);
    //if (dx != 0 || dy != 0)
    socket.emit('move', { x: dx, y: dy, t: Date.now() });

    $('#interval').html(Math.round(interval * 1000).toString());
    $('#hz').html((Math.round(1 / interval)).toString());

    //alphaPrevious = event.rotationRate.alpha;
    //betaPrevious = event.rotationRate.beta;
    chartAlphaData.push({
        x: t,
        y: betaRate
    });

    chartGammaRateData.push({
        x: t,
        y: dx
    });

    t++;
    if (chartAlphaData.length > 100) {
        chartAlphaData.shift();
    }
    if (chartGammaRateData.length > 100) {
        chartGammaRateData.shift();
    }

    chartAlpha.render();

    chartGammaRate.render();
}

function acos(vector) {
    return $V([
        Math.acos(vector.i),
        Math.acos(vector.j),
        Math.acos(vector.k)
    ]);
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
    window.removeEventListener("deviceorientation", handleOrientation, true);
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
}

function startMoveEvents() {
    window.addEventListener("deviceorientation", handleOrientation, true);
    window.addEventListener("devicemotion", handleDeviceMotion, true);
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

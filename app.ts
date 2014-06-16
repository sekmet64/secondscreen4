/// <reference path="connections.ts" />
/// <reference path="Scripts/typings/express/express.d.ts" />
/// <reference path="Scripts/typings/node/node.d.ts" />
/// <reference path="Scripts/typings/sqlite/node-sqlite3.d.ts" />

var express = require('express.io');
import routes = require('./routes/index');
import user = require('./routes/user');
//var http = require('http');
import path = require('path');
//var socketio = require('socket.io');
//var params = require('express-params');
import c = require('./connections');
import db = require('./database');

var app = express();
app.http().io()


//params.extend(app);




// all environments
app.set('port', process.env.PORT);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);

import stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/youtube', routes.youtube);
app.get('/downloads', routes.downloads);
//app.param('id', /^\w+$/);
app.get('/:id', routes.remotes);


//var server = http.Server(app)
//  , io = socketio(server)

// db


app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});


//app.io.sockets.on('connection', function (socket) {

//    socket.on('message', function (message) {
//        console.log('Got message from a client: ' + message.command);

//    });

//    socket.on('connect-desktop', function (args) {
//        JSON.parse(args);
//        console.log('desktop connected: ' + args.product);

//        var uniqueId = makeid();
//        var ci = new c.ConnectionInfo(c.ClientType.Desktop, args.product);

//        c.connectionInfos[socket.id] = ci;
//        c.associatedProducts[uniqueId] = args.product;

//        socket.emit('connect-response', { uniqueId: uniqueId });
//    });
//});




// routes
app.io.route('connect-desktop', function (req) {

    var prod = req.data.product;
    var uniqueId;
    if (typeof req.data.uniqueId != 'undefined') {
        uniqueId = req.data.uniqueId;
    }
    else {
        uniqueId = makeid();
    }

    console.log('desktop connected: ' + prod + ' ' + uniqueId);
    var ci = new c.ConnectionInfo(c.ClientType.Desktop, prod, uniqueId);
    c.connectionInfos[req.socket.id] = ci;
    c.associatedProducts[uniqueId] = c.parseProduct(prod);
    c.desktopSockets[uniqueId] = req.socket;

    req.socket.emit('connect-response', { uniqueId: uniqueId });
});

app.io.route('connect-mobile', function (req) {
    

    var uniqueId = req.data.uniqueId;
    var prod = c.associatedProducts[uniqueId];


    var stmt = db.db.prepare("SELECT product FROM Clients WHERE uniqueId= ? LIMIT 1");
    console.log('mobile connected: ' + uniqueId);

    stmt.get(uniqueId, function (err, row) {
        console.log(row);

        if (typeof row == 'undefined') {
            var stmt = db.db.prepare("INSERT INTO Clients VALUES (?,?)");
            var prodString = c.Product[prod];
            stmt.run([uniqueId, prodString], function (err, row) {
                console.log(row);
            });

            console.log('new pair registered: ' + uniqueId);
        }
        else if (typeof prod == 'undefined') {
            prod =  c.parseProduct(row['product']);
        }

        var ci = new c.ConnectionInfo(c.ClientType.Mobile, prod, uniqueId);
        c.connectionInfos[req.socket.id] = ci;
        c.mobileSockets[uniqueId] = req.socket;
        var desktop = c.desktopSockets[uniqueId];
        if (typeof desktop != 'undefined') {
            desktop.emit('mobile-connected');
            req.socket.emit('desktop-listening');
        }
    });    
});


app.io.route('select-video', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('select-video', req.data);
});

app.io.route('pause', function (req) {
    var ci = c.connectionInfos[req.socket.id];
    c.desktopSockets[ci.uniqueId].emit('pause', req.data);
});

app.io.route('play', function (req) {
    var ci = c.connectionInfos[req.socket.id];
    c.desktopSockets[ci.uniqueId].emit('play', req.data);
});

app.io.route('update-time', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.mobileSockets[ci.uniqueId].emit('update-time', req.data);
});


app.io.route('move', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('move', req.data);
});

app.io.route('left-mousedown', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('left-mousedown', req.data);
});


app.io.route('left-mouseup', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('left-mouseup', req.data);
});

app.io.route('right-mousedown', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('right-mousedown', req.data);
});


app.io.route('right-mouseup', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('right-mouseup', req.data);
});

app.io.route('mousemovestart', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('mousemovestart', req.data);
});

app.io.route('mousemoveend', function (req) {
    var ci = c.connectionInfos[req.socket.id];

    c.desktopSockets[ci.uniqueId].emit('mousemoveend', req.data);
});



function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var i;

    for (i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
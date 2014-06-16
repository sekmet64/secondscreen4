/// <reference path="connections.ts" />
/// <reference path="Scripts/typings/express/express.d.ts" />
/// <reference path="Scripts/typings/node/node.d.ts" />
/// <reference path="Scripts/typings/sqlite/node-sqlite3.d.ts" />
var express = require('express.io');
var routes = require('./routes/index');

//var http = require('http');
var path = require('path');

//var socketio = require('socket.io');
//var params = require('express-params');
var c = require('./connections');
var sqlite = require("sqlite3");
var fs = require('fs');

var app = express();
app.http().io();

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

var stylus = require('stylus');
app.use(stylus.middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/youtube', routes.youtube);

//app.param('id', /^\w+$/);
app.get('/:id', routes.remotes);

//var server = http.Server(app)
//  , io = socketio(server)
// db
var dbFileName = "cc.db";
var dbExists = fs.existsSync(dbFileName);

var db = new sqlite.Database(dbFileName);

if (!dbExists) {
    db.run("CREATE TABLE Clients (uniqueId TEXT)");
}

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
app.io.route('connect-desktop', function (req) {
    var prod = req.data.product;
    var uniqueId;
    if (typeof req.data.uniqueId != 'undefined') {
        uniqueId = req.data.uniqueId;
    } else {
        uniqueId = makeid();
    }

    console.log('desktop connected: ' + prod + ' ' + uniqueId);
    var ci = new c.ConnectionInfo(0 /* Desktop */, prod, uniqueId);
    c.connectionInfos[req.socket.id] = ci;
    c.associatedProducts[uniqueId] = parseProduct(prod);
    c.desktopSockets[uniqueId] = req.socket;

    req.socket.emit('connect-response', { uniqueId: uniqueId });
});

app.io.route('connect-mobile', function (req) {
    var uniqueId = req.data.uniqueId;
    var isNewPair = isNewPair(uniqueId);

    if (isNewPair) {
        console.log('new mobile connected: ' + uniqueId);

        var prod = c.associatedProducts[uniqueId];
        var ci = new c.ConnectionInfo(1 /* Mobile */, prod, uniqueId);
        c.connectionInfos[req.socket.id] = ci;
        c.mobileSockets[uniqueId] = req.socket;
        c.desktopSockets[uniqueId].emit('mobile-connected');
    } else {
    }
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

function makeid() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    var i;

    for (i = 0; i < 5; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}

function parseProduct(s) {
    if (s == "Y")
        return 1 /* Y */;
    else if (s == "M")
        return 0 /* M */;
}

function isNewPair(uniqueId) {
    var stmt = db.prepare("SELECT EXISTS(SELECT 1 FROM Clients WHERE uniqueId=(?)  LIMIT 1)");
    stmt.get(uniqueId, function (err, row) {
        console.log(row);
    });
    //stmt.finalize();
}
//# sourceMappingURL=app.js.map

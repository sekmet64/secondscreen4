/// <reference path="../connections.ts" />
var c = require('./../connections');
var db = require('./../database');

function index(req, res) {
    res.render('index', { title: 'Express' });
}
exports.index = index;
;

function downloads(req, res) {
    res.render('downloads', { title: 'Express' });
}
exports.downloads = downloads;
;

function remotes(req, res) {
    var id = req.params.id;

    if (id.length != 5) {
        res.status(404);
        return;
    }

    console.log("remote opened with id: " + id);
    var prod = c.associatedProducts[id];

    if (prod == null) {
        // try offline clients
        var stmt = db.db.prepare("SELECT product FROM Clients WHERE uniqueId= ? LIMIT 1");
        stmt.get(id, function (err, row) {
            console.log(row);

            if (typeof row == 'undefined') {
                res.status(404);
            } else {
                prod = c.parseProduct(row["product"]);

                renderRemote(res, prod);
            }
        });
    } else {
        renderRemote(res, prod);
    }
}
exports.remotes = remotes;
;

function renderRemote(res, prod) {
    if (prod == 0 /* M */) {
        res.render('mouse-remote');
    } else if (prod == 1 /* Y */) {
        res.render('youtube-remote');
    }
}

function youtube(req, res) {
    res.render('youtube');
}
exports.youtube = youtube;
//# sourceMappingURL=index.js.map

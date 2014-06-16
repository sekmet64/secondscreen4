/// <reference path="../connections.ts" />
var c = require('./../connections');

function index(req, res) {
    res.render('index', { title: 'Express' });
}
exports.index = index;
;

function remotes(req, res) {
    var id = req.params.id;
    console.log("remote opened with id: " + id);
    var prod = c.associatedProducts[id];

    if (prod == null) {
        res.status(404);
    } else if (prod == 0 /* M */) {
        res.render('mouse-remote');
    } else if (prod == 1 /* Y */) {
        res.render('youtube-remote');
    }
}
exports.remotes = remotes;
;

function youtube(req, res) {
    res.render('youtube');
}
exports.youtube = youtube;
//# sourceMappingURL=index.js.map

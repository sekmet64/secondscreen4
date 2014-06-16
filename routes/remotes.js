/// <reference path="../connections.ts" />
var connections = require('../connections');

function remotes(req, res) {
    var id = req.params.id;
    console.log("remote opened with id: " + id);
    if (connections.desktops[id] != null) {
        res.render('remotes', { id: req.params.id });
    } else {
        res.status(404);
    }
}
exports.remotes = remotes;
;
//# sourceMappingURL=remotes.js.map

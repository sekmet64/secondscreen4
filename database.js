var sqlite = require("sqlite3");
var fs = require('fs');

var dbFileName = "cc.db";
var dbExists = fs.existsSync(dbFileName);

exports.db = new sqlite.Database(dbFileName);

if (!dbExists) {
    exports.db.run("CREATE TABLE Clients (uniqueId TEXT, product TEXT)");
}
//# sourceMappingURL=database.js.map

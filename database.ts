import sqlite = require("sqlite3");
import fs = require('fs');

var dbFileName = "cc.db"
var dbExists = fs.existsSync(dbFileName);

export var db = new sqlite.Database(dbFileName);

if (!dbExists) {
    db.run("CREATE TABLE Clients (uniqueId TEXT, product TEXT)");
}
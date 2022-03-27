
const sqlite3 = require('sqlite3');

const DB_FILE = 'data.db3';

exports.dbCreate = function () {
  db = new sqlite3.Database(DB_FILE);
  db.run("create table bookmarks (title text, url text)");
}

exports.dbInsert = function (title, url, cb) {
  db = new sqlite3.Database(DB_FILE);
  db.get("select * from bookmarks where url=?", url, (err, row) => {
    if (typeof row == "undefined") {
      db.run("insert into bookmarks values (?, ?)", title, url);
      cb("");
    } else {
      cb("A bookmark with the same URL already exists.");
    }
  });
}

exports.dbQuery = function (cb) {
  db = new sqlite3.Database(DB_FILE);
  db.all("select * from bookmarks", (err, rows) => cb(rows));
}

exports.dbDelete = function () {
  db = new sqlite3.Database(DB_FILE);
  db.run("delete from bookmarks");
}

exports.dbDeleteWhere = function (url) {
  db = new sqlite3.Database(DB_FILE);
  db.run("delete from bookmarks where url=?", url);
}

if (process.argv.length >= 3) {
  const cmd = process.argv[2];
  if (cmd == 'create') {
    console.log('Create data base.');
    exports.dbCreate();
  } else if (cmd == 'insert') {
    console.log('Insert into data base.');
    exports.dbInsert(process.argv[3], process.argv[4]);
  } else if (cmd == 'query') {
    exports.dbQuery((rows) => {
      for (let row of rows) {
        console.log(`${row.title}, ${row.url}`);
      }
   });
  } else if (cmd == 'delete') {
    exports.dbDeleteWhere(process.argv[3]);
  }
}

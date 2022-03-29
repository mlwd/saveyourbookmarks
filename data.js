
const { Pool } = require('pg');
const process = require('process');

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({connectionString: DATABASE_URL,
                       ssl: {rejectUnauthorized: false}});

exports.dbQueryUser = function (username, cb) {
  pool.query("select salt, password from users where username=$1", [username],
    (err, res) => {
      if (err) throw err;
      if (res.rows.length == 1) {
        cb(username, res.rows[0].salt, res.rows[0].password);
      } else {
        cb(null, null, null);
      }
    }
  );
}

exports.dbInsert = function (title, url, cb) {
  pool.query("insert into bookmarks values ($1, $2)", [title, url], (err, res) => {
    if (err) {
      cb("Bookmark could not be inserted into the data base.");
    } else {
      cb("");
    }
  });
}

exports.dbQuery = function (cb) {
  pool.query("select * from bookmarks", (err, res) => {
    if (err) throw err;
    cb(res.rows);
  });
}

exports.dbDeleteWhere = function (url, cb) {
  pool.query("delete from bookmarks where url=$1", [url], (err, res) => {
    if (err) throw err;
    cb();
  });
}

if (process.argv.length >= 3) {
  const cmd = process.argv[2];
  if (cmd == 'insert') {
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

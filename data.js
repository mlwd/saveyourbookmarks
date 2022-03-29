
const { Client } = require('pg');
const process = require('process');

const DATABASE_URL = process.env.DATABASE_URL;

function dbClient() {
  return new Client({connectionString: DATABASE_URL,
                     ssl: {rejectUnauthorized: false}});
}

exports.dbInsert = function (title, url, cb) {
  const client = dbClient();
  client.connect();
  client.query("insert into bookmarks values ($1, $2)", [title, url], (err, res) => {
    if (err) {
      cb("Bookmark could not be inserted into the data base.");
    } else {
      cb("");
    }
    client.end();
  });
}

exports.dbQuery = function (cb) {
  const client = dbClient();
  client.connect();
  client.query("select * from bookmarks", (err, res) => {
    if (err) throw err;
    cb(res.rows);
    client.end();
  });
}

exports.dbDeleteWhere = function (url, cb) {
  const client = dbClient();
  client.connect();
  client.query("delete from bookmarks where url=$1", [url], (err, res) => {
    if (err) throw err;
    cb();
    client.end();
  });
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

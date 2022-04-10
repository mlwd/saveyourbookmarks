
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

exports.insertBookmark = function (title, url, list_id, cb) {
  pool.query("insert into bookmarks (title, url, list_id) values ($1, $2, $3)",
    [title, url, list_id], (err, res) => {
    if (err) {
      cb("Bookmark could not be inserted into the data base.");
    } else {
      cb("");
    }
  });
}

exports.getBookmarks = function (cb) {
  pool.query("select id, title, url from bookmarks", (err, res) => {
    if (err) throw err;
    cb(res.rows);
  });
}

exports.getBookmarksWhere = function (listId, cb) {
  pool.query("select id, title, url from bookmarks where list_id=$1", [listId],
  (err, res) => {
    if (err) throw err;
    cb(res.rows);
  });
}

exports.dbDeleteWhere = function (id, cb) {
  pool.query("delete from bookmarks where id=$1", [id], (err, res) => {
    if (err) throw err;
    cb();
  });
}

exports.getBookmarkLists = function (cb) {
  pool.query("select id, name from bookmark_lists", (err, res) => {
    if (err) console.log(err);
    cb(res.rows);
  });
}

exports.insertBookmarkList = function (name, cb) {
  pool.query("insert into bookmark_lists (name) values ($1)", [name], (err, res) => {
    if (err) {
      cb("Bookmark list could not be inserted.");
    } else {
      cb("");
    }
  });
}

exports.deleteBookmarkList = function (id, cb) {
  pool.query("delete from bookmark_lists where id=$1", [id], (err, res) => {
    if (err) {
      cb("Bookmark list could not be deleted.");
    } else {
      cb("");
    }
  });
}

exports.dbUpdateWhere = function (title, url, id, cb) {
  pool.query("update bookmarks set title=$1, url=$2 where id=$3",
      [title, url, id], (err, res) => {if (err) throw err; cb();});
}

exports.updateBookmarkList = function(listName, listId, cb) {
  pool.query("update bookmark_lists set name=$1 where id=$2", [listName, listId],
    (err, res) => {
      if (err) cb("Bookmark list could not be updated.");
      else cb("");
    }
  );
}

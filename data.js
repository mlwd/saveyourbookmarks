
const { Pool } = require('pg');
const process = require('process');

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({connectionString: DATABASE_URL,
                       ssl: {rejectUnauthorized: false}});

exports.getUser = function (username, cb) {
  pool.query("select id, salt, password from users where username=$1", [username],
    (err, res) => {
      if (err) throw err;
      if (res.rows.length == 1) {
        cb(res.rows[0].id, res.rows[0].salt, res.rows[0].password);
      } else {
        cb(null, null, null);
      }
    }
  );
}

exports.insertUser = function (userName, salt, password, cb) {
  pool.query("insert into users (userName, salt, password) values ($1, $2, $3)",
    [userName, salt, password], (err, res) => {
    if (err) {
      cb(null);
    } else {
      pool.query("select id from users where username=$1",
        [userName], (err, res) => {
        if (err) {
          cb(null);
        } else {
          cb(res.rows[0].id);
        }
      });
    }
  });
};

exports.deleteUser = function (userId) {
  pool.query("delete from users where id=$1", [userId], (err, res) => {
    if (err) throw err;
  });
}

exports.insertBookmark = function (userId, listId, title, url, cb) {
  pool.query("insert into bookmarks (user_id, list_id, title, url) values ($1, $2, $3, $4)",
    [userId, listId, title, url], (err, res) => {
    if (err) {
      cb("bookmark could not be inserted into the data base.");
    } else {
      cb("");
    }
  });
}

exports.getBookmarks = function (userId, cb) {
  pool.query("select id, title, url from bookmarks where user_id=$1", [userId], (err, res) => {
    if (err) throw err;
    const new_cb = function(rows) {
      cb({bookmark_lists: rows, bookmarks: res.rows});
    };
    pool.query("select id, name from bookmark_lists where user_id=$1", [userId], (err, res) => {
      if (err) throw err;
      new_cb(res.rows);
    });
  });
}

exports.getBookmarksWhere = function (userId, listId, cb) {
  pool.query("select id, title, url from bookmarks where user_id=$1 and list_id=$2",
  [userId, listId], (err, res) => {
    if (err) throw err;
    cb(res.rows);
  });
}

exports.deleteBookmark = function (id, cb) {
  pool.query("delete from bookmarks where id=$1", [id], (err, res) => {
    if (err) throw err;
    cb();
  });
}

exports.getBookmarkLists = function (userId, cb) {
  pool.query("select id, name from bookmark_lists where user_id=$1",
  [userId], (err, res) => {
    if (err) console.log(err);
    cb(res.rows);
  });
}

exports.insertBookmarkList = function (userId, name, cb) {
  pool.query("insert into bookmark_lists (user_id, name) values ($1, $2)",
  [userId, name], (err, res) => {
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

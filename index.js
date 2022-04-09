
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const data = require('./data');

const app = express()
const port = process.env.PORT || 5000

app.set('trust proxy', 1);
app.set('view engine', 'ejs');

app.use(session({
  secret: process.env.DATABASE_URL,
  saveUninitialized: true,
  resave: false,
}));

// Force secure https connections so that passwords can be transferred as plain text.
if (process.env.ALLOW_HTTP == "true") {
  console.log("Allow http.");
} else {
  console.log("Force https.");
  app.use(function(request, response, next) {
    if (!request.secure) {
      return response.redirect("https://" + request.headers.host + request.url);
    }
    next();
  })
}

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
  if (!req.session.authenticated) {
    res.redirect('/login');
    return;
  }
  res.render('index.ejs');
})

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/logout', (req, res) => {
  req.session.authenticated = false;
  res.render('login.ejs');
});

app.post('/login', (req, res) => {
  data.dbQueryUser(req.body.username, (username, salt, password) => {
    req.session.authenticated = username == req.body.username &&
                                password == bcrypt.hashSync(req.body.password, salt);
    if (req.session.authenticated) {
      res.redirect('/');
    } else {
      res.redirect('/login');
    }
  });
});

app.post('/savebookmark', (req, res) => {
  const title = req.body.title;
  const url = req.body.url;
  const list_id = req.body.list_id;
  console.log(`Save bookmark (${title}, ${url}, ${list_id})`);
  data.insertBookmark(title, url, list_id, (msg) => res.send(msg));
})

app.post('/editbookmark', (req, res) => {
  data.dbUpdateWhere(req.body.title, req.body.url, req.body.id,
                     (msg) => res.send(msg));
})

app.get('/bookmarks/:listId', (req, res) => {
  console.log("Get bookmarks (list id: " + req.params.listId + ").");
  data.getBookmarksWhere(req.params.listId, (rows) => res.json(rows));
});

app.get('/exportbookmark', (req, res) => {
  data.getBookmarks(
    rows => res.attachment("bookmarks.json").send(JSON.stringify(rows, null, 4)));
});

app.post('/deletebookmarkwhere', (req, res) => {
  console.log("Delete bookmark: id=" + req.body.id);
  data.dbDeleteWhere(req.body.id, () => res.redirect('back'));
});

app.get('/bookmarklists', (req, res) => {
  console.log("Get bookmark lists.");
  data.getBookmarkLists(rows => res.json(rows));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
})

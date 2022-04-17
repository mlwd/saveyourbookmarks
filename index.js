
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

app.use(express.static("dist"));
app.use(express.static("public"));

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
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('index.ejs');
})

app.get('/login', (req, res) => {
  res.render('login.ejs');
});

app.get('/logout', (req, res) => {
  req.session.user = null;
  res.render('login.ejs');
});

app.post('/login', (req, res) => {
  const userName = req.body.username;
  data.getUser(userName, (userId, salt, password) => {
    if (userId && password == bcrypt.hashSync(req.body.password, salt)) {
      req.session.user = {userId, userName};
      res.redirect('/');
    } else {
      const message = "A user with the given name does not exist or the password is incorrect.";
      res.render('login.ejs', {message});
    }
  });
});

app.get('/signup', (req, res) => {
  res.render('signup.ejs', {message: 'Fill out the form to create a new account.'});
});

app.post('/signup', (req, res) => {
  const userName = req.body.username;
  console.log("Add user: " + userName);
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(req.body.password, salt);
  data.insertUser(userName, salt, hashedPassword, (userId) => {
    if (!userId) {
      return res.render("signup.ejs",
          {message: "Sign up failed. Please choose another user name."});
    }
    req.session.user = {userId, userName};
    res.redirect('/');
  });
});

app.get('/settings', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  res.render('settings.ejs', {userName: req.session.user.userName});
});

app.get("/deleteuser", (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login');
  }
  console.log("Delete user: " + req.session.user.userName);
  data.deleteUser(req.session.user.userId);
  req.session.user = null;
  res.redirect("/login");
});

app.post('/savebookmark', (req, res) => {
  const title = req.body.title;
  const url = req.body.url;
  const listId = req.body.listId;
  const userId = req.session.user.userId;
  console.log(`Save bookmark (${userId}, ${listId}, ${title}, ${url})`);
  data.insertBookmark(userId, listId, title, url, (msg) => res.send(msg));
})

app.post('/editbookmark', (req, res) => {
  data.dbUpdateWhere(req.body.title, req.body.url, req.body.id,
                     (msg) => res.send(msg));
})

app.get('/bookmarks/:listId', (req, res) => {
  console.log("Get bookmarks (list id: " + req.params.listId + ").");
  data.getBookmarksWhere(req.session.user.userId, req.params.listId, (rows) => res.json(rows));
});

app.get('/export', (req, res) => {
  data.getBookmarks(req.session.user.userId,
    rows => res.attachment("bookmarks.json").send(JSON.stringify(rows, null, 4)));
});

app.post('/deletebookmark', (req, res) => {
  console.log("Delete bookmark: id=" + req.body.id);
  data.deleteBookmark(req.body.id, () => res.redirect('back'));
});

app.get('/bookmarklists', (req, res) => {
  console.log("Get bookmark lists.");
  data.getBookmarkLists(req.session.user.userId, rows => res.json(rows));
});

app.post('/savebookmarklist', (req, res) => {
  const name = req.body.name;
  console.log('Save bookmark list: name=' + name);
  data.insertBookmarkList(req.session.user.userId, name, (msg) => res.send(msg));
})

app.post('/deletebookmarklist', (req, res) => {
  const listId = req.body.listId;
  console.log('Delete bookmark list: listId=' + listId);
  data.deleteBookmarkList(listId, (msg) => res.send(msg));
})

app.post('/editbookmarklist', (req, res) => {
  console.log("Update bookmark list: name=" + req.body.listName + ", id=" + req.body.listId);
  data.updateBookmarkList(req.body.listName, req.body.listId, msg => res.send(msg));
})

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
})

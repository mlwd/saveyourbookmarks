
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const bcrypt = require('bcrypt');
const path = require('path');
const data = require('./data');

const app = express()
const port = process.env.PORT || 5000

app.set('trust proxy', 1);
app.use(session({
  secret: process.env.DATABASE_URL,
  saveUninitialized: false,
  resave: false,
  cookie: {secure: true},
}));

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

// Force secure https connections so that passwords can be transferred as plain text.
if (process.env.ALLOW_HTPP != "true") {
  console.log("Force https.");
  app.get('*', function(req, res) {
    res.redirect('https://' + req.headers.host + req.url);
  });
}

app.get('/', (req, res) => {
  if (!req.session.authenticated) {
    res.redirect('/login');
    return;
  }
  res.sendFile(path.join(__dirname, 'index.html'));
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
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
  console.log(`Save bookmark (${title}, ${url})`);
  data.dbInsert(title, url, (msg) => res.json({'message': msg}));
})

app.get('/loadbookmark', (req, res) => {
  console.log("Load bookmarks.");
  data.dbQuery((rows) => res.json(rows));
});

app.post('/deletebookmarkwhere', (req, res) => {
  console.log('Delete bookmark: ' + req.body.url);
  data.dbDeleteWhere(req.body.url, () => res.redirect('back'));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
})

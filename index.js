
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const data = require('./data');

const app = express()
const port = process.env.PORT || 5000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

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

app.post('/deletebookmark', (req, res) => {
  console.log('Delete all bookmarks');
  data.dbDelete();
  res.redirect('back');
});

app.post('/deletebookmarkwhere', (req, res) => {
  console.log('Delete bookmark: ' + req.body.url);
  data.dbDeleteWhere(req.body.url, () => res.redirect('back'));
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
})

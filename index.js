
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const data = require('./data');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.post('/savebookmark', (req, res) => {
  const title = req.body.title;
  const url = req.body.url;
  console.log(`Save bookmark (${title}, ${url})`);
  data.dbInsert(title, url);
  res.redirect('back');
})

app.get('/loadbookmark', (req, res) => {
  console.log("Load bookmarks.");
  data.dbQuery((rows) => res.json(rows));
});

app.get('/clearbookmark', (req, res) => {
  console.log("Clear bookmarks.");
  data.dbDelete();
  res.redirect('back');
});

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
})

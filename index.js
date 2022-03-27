
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'));
})

app.post('/savebookmark', (req, res) => {
  const bookmark = {'title': req.body.title, 'url': req.body.url};
  console.log('Save bookmark:', bookmark);
  res.redirect('back');
})

app.listen(port, () => {
  console.log(`Listening on port ${port}.`);
})

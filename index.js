require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let i = 0
const shortenedURls = []

app.post('/api/shorturl', function(req,res) {
  let url = req.body.url
  const regex = /^https?:\/\/\w+\.\w+$/
  if (!regex.test(url)) {
    res.json({ error: 'invalid url' })
    return
  } else {
    let found = shortenedURls.find(route => route.original_url === url)
    if (found) {
      res.json(found)
    } else {
      const route = {original_url: url, short_url: ++i}
      console.log(route, req.body)
      shortenedURls.push(route)
      res.json(route)
    }
  }
});

app.get(`/api/shorturl/:id`, function (req, res) {
  let id = parseInt(req.params.id)
  let route = shortenedURls.find(route => route.short_url === id)
  if (route) {
      res.redirect(route.original_url)
  } else {
    res.status(404).json({error: 'URL not found!'})
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

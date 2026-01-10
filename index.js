require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dns = require('dns');
const fs = require('fs');
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

let i = 1;

async function saveUrl(newEntry) {
  fs.readFile('data.json', 'utf8', (err, data) => {
    let json = [];
    if (!err && data) {
      json = JSON.parse(data);
    }
    json.push(newEntry);
    fs.writeFile('data.json', JSON.stringify(json), (err) => {
      if (err) {
        console.error("Save failed:", err)
      } else { console.log('successfully saved new route') }
    });
  });
}

app.post('/api/shorturl', async function (req, res) {
  let url = req.body.url;
  let urlObj = new URL(url)
  dns.lookup(urlObj.hostname, async function (err) {
    if (err) {
      res.json({ error: 'invalid url' })
      return
    } else {
      let fileContent = await fs.promises.readFile('data.json', 'utf8');
      let data = await JSON.parse(fileContent || "[]");
      let found = data.find(route => route.original_url === url)
      if (found) {
        console.log('URL already registered, responding with saved value.')
        res.json(found)
      } else {
        while (true) {
          let foundId = data.find(route => route.short_url === i)
          if (foundId) {
            i++
          } else {
            break
          }
        }
        console.log('new URL, creating new record.')
        const route = { original_url: url, short_url: i }
        await saveUrl(route)
        res.json(route)
      }
    }
  })
}
);

app.get(`/api/shorturl/:id`, async function (req, res) {
  let data = await fs.promises.readFile('data.json', 'utf8');
  let id = parseInt(req.params.id)
  data = data.length > 0 ? JSON.parse(data) : []
  let found = data.find(route => route.short_url === id)
  if (found) {
    res.redirect(found.original_url)
  } else {
    res.status(404).json({ error: 'URL not found' })
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
}); 

require('dotenv').config()
const fs = require('fs')
const path = require('path')
const http = require('http')
const qs = require('querystring')
const url = require('url')
const argon2 = require('argon2')
const MongoClient = require('mongodb').MongoClient

let db = null;

(async () => {
  const client = await MongoClient.connect(process.env.DB_URL)
  db = client.db(process.env.DB_NAME)
})()

const port = process.env.PORT || 1900
const mime = {
  '.html': 'text/html',
  '.css': 'text/css'
}

http.createServer(onrequest).listen(port)

function onrequest(req, res) {
  function onread(err, buf) {
    res.setHeader('Content-Type', 'text/html')

    if (err) {
      res.statusCode = 404
      res.end('Not found\n')
    } else {
      var extension = path.extname(route)
      var type = mime[extension] || 'text/plain'
      res.statusCode = 200
      res.setHeader('Content-Type', type)
      res.end(buf)
    }
  }

  if (req.method === 'GET') {
    var route = req.url

    if (route === '/') {
      route = 'index.html'
    } else {
      route = route.slice(1)
      route += '.html'
    }

    fs.readFile(path.join('static', route), onread)
  } else if (req.method === 'POST') {
    let buf = ''
    const route = url.parse(req.url).pathname

    req.on('data', data => (buf += data))
    req.on('end', () => {
      if (route === '/register') {
        try {
          const collection = db.collection('users')
          const { username, password } = qs.parse(buf)

          collection.findOne({ username }, async (err, result) => {
            if (err) {
              res.statusCode = 500
              res.end('Internal server error')
            } else if (result) {
              res.statusCode = 412
              res.end('Username taken\n')
            } else {
              const hash = await argon2.hash(password)
              collection.insertOne({ username, password: hash })

              res.statusCode = 302
              res.setHeader('Location', '/')
              res.end()
            }
          })
        } catch (err) {
          throw err
        }
      }
    })
  }
}

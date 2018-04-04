require('dotenv').config()
const fs = require('fs')
const path = require('path')
const http = require('http')
const qs = require('querystring')
const MongoClient = require('mongodb').MongoClient

const port = process.env.PORT || 1900

http.createServer(onrequest).listen(port)

const mime = {
  '.html': 'text/html',
  '.css': 'text/css'
}

function onrequest (req, res) {
  if (req.method === 'GET') {
    var route = req.url

    if (route === '/') {
      route = 'index.html'
    }

    fs.readFile(path.join('static', route), onread)

    function onread (err, buf) {
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
  } else if (req.method === 'POST') {
    let buf = ''
    req.on('data', data => (buf += data))
    req.on('end', () => console.log(qs.parse(buf)))

    MongoClient.connect(process.env.DB_URL, (err, client) => {
      const db = client.db('backend')
      const collection = db.collection('users')
      const user = qs.parse(buf)
      collection.insertOne(user)
      client.close()
    })

    res.statusCode = 302
    res.setHeader('Location', '/')
    res.end()
  }
}

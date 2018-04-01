const fs = require('fs');
const path = require('path');
const http = require('http');

const port = process.env.PORT || 1900;

http.createServer(onrequest).listen(port);

const mime = {
  '.html': 'text/html',
  '.css': 'text/css'
};

function onrequest(req, res) {
  var route = req.url;

  if (route === '/') {
    route = 'index.html';
  }

  fs.readFile(path.join('static', route), onread);

  function onread(err, buf) {
    res.setHeader('Content-Type', 'text/html');

    if (err) {
      res.statusCode = 404;
      res.end('Not found\n');
    } else {
      var extension = path.extname(route);
      var type = mime[extension] || 'text/plain';
      res.statusCode = 200;
      res.setHeader('Content-Type', type);
      res.end(buf);
    }
  }
}

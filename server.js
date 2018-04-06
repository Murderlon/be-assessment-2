require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const status = require('node-status-codes')

const port = process.env.PORT || 1900

express()
  .set('view engine', 'ejs')
  .set('views', 'views')
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(express.static('static'))
  .get('/', index)
  .get('*', error)
  .listen(port)

function index (req, res, next) {
  req.code = 404
  next()
}

function error (req, res) {
  const code = req.code || 404
  res.format({
    json: () => res.status(code).json(status[code]),
    html: () => res.status(code).render('error', {
      id: code,
      title: status[code],
      detail: status[code]
    })
  })
}

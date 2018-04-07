const fs = require('fs')
const express = require('express')

const router = express.Router()

router.get('/', (req, res, next) => {
  fs.readdir('./static/img', (err, images) =>
    err ? next(err) : res.render('index', { images }))
})

module.exports = router

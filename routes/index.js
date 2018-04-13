const fs = require('fs')
const path = require('path')
const express = require('express')
const multer = require('multer')
const delve = require('dlv')
const shortid = require('shortid')

const Image = require('../models/image')
const createError = require('../lib/createError')

const router = express.Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'static/img'),
  filename: (req, { originalname }, cb) =>
    cb(null, shortid.generate() + path.extname(originalname))
})
const upload = multer({ storage })

router.get('/', (req, res, next) =>
  Image.find(
    {},
    (err, images) =>
      err
        ? next(createError(500))
        : res.render('index', {
          images,
          // delve returns the username if it exists
          user: delve(req, 'user.username')
        })
  )
)

router.get(
  '/upload',
  (req, res) => (!req.user ? res.redirect('/') : res.render('upload'))
)

router.get('/post/:id', (req, res, next) =>
  Image.findOne({ _id: req.params.id }, (err, image) => {
    if (err) {
      return next(createError(500))
    }
    if (!image) {
      return next()
    }
    res.render('detail', {
      image,
      isAuthor: delve(req, 'user.username') === delve(image, 'author')
    })
  })
)

router.get('/edit/:id', (req, res, next) =>
  Image.findOne({ _id: req.params.id }, (err, image) => {
    const isAllowed = delve(req, 'user.username') === delve(image, 'author')
    if (!isAllowed) {
      return res.redirect('/')
    }
    if (err) {
      return next(createError(500))
    }
    if (!image) {
      return next()
    }
    res.render('edit', { image, err: null })
  })
)

router.post('/upload', upload.single('image'), (req, res, next) => {
  if (!req.user) {
    return next(createError(401))
  }
  try {
    const { filename, mimetype } = req.file
    const { title, description } = req.body
    const { username } = req.user
    const image = new Image()

    image.file = { name: filename, mimetype }
    image.title = title
    image.description = description
    image.author = username
    image.save()

    res.redirect('/')
  } catch (err) {
    next(createError(500))
  }
})

router.post('/edit/:id', (req, res, next) =>
  Image.findOne({ _id: req.params.id }, (err, image) => {
    const isAllowed = delve(req, 'user.username') === delve(image, 'author')
    const { title, description } = req.body
    if (!isAllowed) {
      return next(createError(401))
    }
    if (err) {
      return next(createError(500))
    }
    if (!image) {
      return next()
    }
    if (title.length === 0 || description.length === 0) {
      return res
        .status(422)
        .render('edit', { image, err: 'Title or description is empty' })
    }

    image.title = title
    image.description = description
    image.save(
      err =>
        err ? next(createError(500)) : res.redirect(`/post/${req.params.id}`)
    )
  })
)

router.post('/delete/:id', (req, res, next) =>
  Image.findOne({ _id: req.params.id }, (err, image) => {
    const isAllowed = delve(req, 'user.username') === delve(image, 'author')
    if (!isAllowed) {
      return next(createError(401))
    }
    if (err) {
      return next(createError(500))
    }
    if (!image) {
      return next()
    }
    image.remove(
      err =>
        err
          ? next(createError(500))
          : fs.unlink(
            path.resolve(__dirname, `../static/img/${image.file.name}`),
            err => (err ? next(createError(500)) : res.redirect('/'))
          )
    )
  })
)

module.exports = router

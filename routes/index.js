const fs = require('fs')
const path = require('path')
const express = require('express')
const passport = require('passport')
const multer = require('multer')
const delve = require('dlv')
const shortid = require('shortid')

const User = require('../models/user')
const Image = require('../models/image')
const createError = require('../lib/createError')

const router = express.Router()
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'static/img'),
  filename: (req, { originalname }, cb) =>
    cb(null, shortid.generate() + path.extname(originalname))
})
const upload = multer({ storage })

router.get('/', (req, res, next) => {
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
})

router.get(
  '/upload',
  (req, res) => (!req.user ? res.redirect('/') : res.render('upload'))
)

router.get('/register', (req, res) => res.render('register', { err: null }))

router.get('/login', (req, res) => res.render('login', { err: null }))

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

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

router.get('/edit/:id', (req, res, next) => {
  Image.findOne({ _id: req.params.id }, (err, image) => {
    const isAllowed = delve(req, 'user.username') === delve(image, 'author')
    if (!isAllowed) {
      return res.status(401).redirect('/')
    }
    if (err) {
      return next(createError(500))
    }
    if (!image) {
      return next()
    }
    res.render('edit', { image })
  })
})

router.post('/upload', upload.single('image'), (req, res, next) => {
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

    res.status(201).redirect('/')
  } catch (err) {
    next(createError(500))
  }
})

router.post(
  '/login',
  passport.authenticate('local', { failWithError: true }),
  (req, res) => res.redirect('/'),
  ({ status, message }, req, res, next) =>
    res.status(status).render('login', { err: message })
)

router.post('/register', (req, res, next) => {
  const { username, password } = req.body
  User.register(
    new User({ username }),
    password,
    (err, account) =>
      err
        ? res.status(422).render('register', { err: err.message })
        : passport.authenticate('local')(req, res, () =>
          req.session.save(
            err => (err ? next(createError(500)) : res.redirect('/'))
          )
        )
  )
})

router.post('/edit/:id', (req, res, next) => {
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
    image.title = req.body.title
    image.description = req.body.description
    image.save(err => err && next(createError(500)))
    res.redirect(`/post/${req.params.id}`)
  })
})

router.post('/:id', (req, res, next) => {
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
    image.remove(err => err && next(createError(500)))
    fs.unlink(
      path.resolve(__dirname, `../static/img/${image.file.name}`),
      err => (err ? next(createError(500)) : res.redirect('/'))
    )
  })
})

module.exports = router

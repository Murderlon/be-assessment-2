const express = require('express')
const passport = require('passport')
const multer = require('multer')
const delve = require('dlv')

const User = require('../models/user')
const Image = require('../models/image')
const createError = require('../lib/createError')

const router = express.Router()
const upload = multer({ dest: 'static/img/' })

router.get('/', (req, res, next) =>
  Image.find({}, (err, images) =>
    err
      ? next(createError(500))
      : res.render('index', {
        images,
        // delve returns the username if it exists
        username: delve(req, 'user.username')
      })
  )
)

router.get('/upload', (req, res) => res.render('upload', { err: null }))

router.get('/register', (req, res) => res.render('register', { err: null }))

router.get('/login', (req, res) => res.render('login', { err: null }))

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

router.post('/upload', upload.single('image'), (req, res, next) => {
  try {
    const { filename, mimetype } = req.file
    const { title, description } = req.body
    const image = new Image()

    image.file = { name: filename, mimetype }
    image.title = title
    image.description = description
    image.save()

    res.redirect('/')
  } catch (err) {
    next(createError(500))
  }
})

router.post(
  '/login',
  passport.authenticate('local', { failWithError: true }),
  (req, res) => res.redirect('/'),
  (err, req, res, next) =>
    res
      .status(err.status)
      .render('login', { err: 'Username or password is incorrect' })
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

module.exports = router

const fs = require('fs')
const express = require('express')
const passport = require('passport')
const delve = require('dlv')

const User = require('../models/user')
const createError = require('../lib/createError')

const router = express.Router()

router.get('/', (req, res, next) =>
  fs.readdir(
    './static/img',
    (err, images) =>
      err
        ? next(createError(500))
        : res.render('index', {
          images,
          // delve returns the username if it exists
          username: delve(req, 'user.username')
        })
  )
)

router.get('/register', (req, res) => res.render('register', { err: null }))

router.get('/login', (req, res) => res.render('login', { err: null }))

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

router.post(
  '/login',
  passport.authenticate('local', { failWithError: true }),
  (req, res) => res.redirect('/'),
  (err, req, res, next) =>
    res.status(err.status).render('login', { err: 'Username or password is incorrect' })
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

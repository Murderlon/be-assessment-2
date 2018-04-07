const fs = require('fs')
const express = require('express')
const passport = require('passport')

const User = require('../models/user')
const createError = require('../lib/createError')

const router = express.Router()

router.get('/', (req, res, next) => {
  console.log(req.user)
  fs.readdir('./static/img', (err, images) =>
    err ? next(createError(500)) : res.render('index', { images }))
})

router.get('/register', (req, res) => res.render('register', { error: null }))

router.get('/login', (req, res) => res.render('login', {error: null}))

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

router.post('/login', passport.authenticate('local'), (req, res) => {
  res.redirect('/')
})

router.post('/register', (req, res, next) => {
  const { username, password } = req.body
  User.register(
    new User({ username }),
    password,
    (err, account) =>
      err
        ? res.render('register', { error: err.message })
        : passport.authenticate('local')(req, res, () =>
          req.session.save(
            err => (err ? next(createError(500)) : res.redirect('/'))
          )
        )
  )
})

module.exports = router

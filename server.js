require('dotenv').config()
const crypto = require('crypto')
const express = require('express')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const logger = require('morgan')

const routes = require('./routes')
const notFound = require('./routes/notFound')
const error = require('./routes/error')
const User = require('./models/user')

const port = process.env.PORT || 1900

mongoose.connect(process.env.DB_URL)

express()
  .set('view engine', 'ejs')
  .set('views', 'views')
  .use(logger('dev'))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(cookieParser())
  .use(session({
    secret: crypto.randomBytes(64).toString('hex'),
    resave: false,
    saveUninitialized: false}))
  .use(passport.initialize())
  .use(passport.session())
  .use(express.static('static'))
  .use('/', routes)
  .use(notFound)
  .use(error)
  .listen(port)

passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

require('dotenv').config()
const express = require('express')
const compression = require('compression')
const helmet = require('helmet')
const session = require('express-session')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const passport = require('passport')
const mongoose = require('mongoose')
const MongoStore = require('connect-mongo')(session)
const logger = require('morgan')

const routes = require('./routes')
const notFound = require('./routes/notFound')
const error = require('./routes/error')

const port = process.env.PORT || 1900

require('./lib/passport')(passport)
mongoose.connect(process.env.DB_URL)

express()
  .set('view engine', 'ejs')
  .set('views', 'views')
  .use(logger('dev'))
  .use(helmet())
  .use(compression({ threshold: 0, filter: () => true }))
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json())
  .use(cookieParser())
  .use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({ mongooseConnection: mongoose.connection })
    })
  )
  .use(passport.initialize())
  .use(passport.session())
  .use(express.static('static'))
  .use('/', routes)
  .use(notFound)
  .use(error)
  .listen(port)

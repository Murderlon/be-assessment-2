const status = require('node-status-codes')

// catch 404 and forward to error handler
module.exports = (req, res, next) => {
  const err = new Error(status[404])
  err.status = 404
  next(err)
}

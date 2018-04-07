const status = require('node-status-codes')

module.exports = (err, req, res, next) => {
  const code = err.status || 500
  res.status(code)
  res.render('error', {
    id: code,
    title: status[code],
    detail: status[code]
  })
}

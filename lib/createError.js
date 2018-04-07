const status = require('node-status-codes')

module.exports = code => {
  const err = new Error(status[code])
  err.status = code
  return err
}

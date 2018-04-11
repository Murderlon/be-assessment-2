module.exports = (err, req, res, next) => {
  const code = err.status || 500
  res.format({
    json: () => res.status(code).json(err),
    html: () =>
      res.status(code).render('error', { id: code, title: err, detail: err })
  })
}

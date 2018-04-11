const mongoose = require('mongoose')

const Schema = mongoose.Schema
const Image = new Schema({
  file: { name: String, mimetype: String },
  title: String,
  description: String,
  author: String,
  date: { type: Date, default: Date.now }
})

module.exports = mongoose.model('Image', Image)

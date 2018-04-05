require('dotenv').config()
const MongoClient = require('mongodb').MongoClient

module.exports = async (cb) => {
  const client = await MongoClient.connect(process.env.DB_URL);
  const db = client.db('backend')
  cb(db, client) 
}

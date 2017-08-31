var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/photos";

module.exports = {
  MongoClient: MongoClient,
  url: url
};
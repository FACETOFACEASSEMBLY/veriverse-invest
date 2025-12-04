// utils/mongo.js
const { MongoClient } = require('mongodb');
const uri = process.env.MONGODB_URI;

let client;
let clientPromise;

if (!uri) throw new Error('MONGODB_URI not set');

if (!clientPromise) {
  client = new MongoClient(uri);
  clientPromise = client.connect();
}

module.exports = clientPromise;

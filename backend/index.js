const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());

const cors = require('cors');
app.use(cors());

const url = process.env.MONGODB_URI || 'mongodb://mongodb:27017';
const dbName = 'testdb';

let client, collection;
MongoClient.connect(url, { useUnifiedTopology: true })
  .then(c => {
    client = c;
    collection = client.db(dbName).collection('items');
     // Only start the server if not in test mode
    if (process.env.NODE_ENV !== 'test') {
      app.listen(4000, () => console.log('Backend listening on 4000'));
    }
  })
  .catch(err => console.error(err));

app.get('/item/:id', async (req, res) => {
  const item = await collection.findOne({ _id: ObjectId(req.params.id) });
  res.json(item || {});
  console.log("get item " + req.params);
});

app.put('/item', async (req, res) => {
  const { name } = req.body;
  const result = await collection.insertOne({ name });
  res.json({ insertedId: result.insertedId });
  console.log("put item " + req.body)
});

app.get('/', async (req, res) => {
  res.json("It worked");
});



module.exports = app;

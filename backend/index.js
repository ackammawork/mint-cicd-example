const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017';
const dbName = process.env.NODE_ENV === 'test' ? 'testdb' : 'todoapp';

let collection;

// Export a promise that resolves when the DB connection is established
const dbConnectPromise = MongoClient.connect(url, { useUnifiedTopology: true })
  .then(client => {
    clientInstance = client; // Store client instance
    collection = client.db(dbName).collection('todos');
    if (process.env.NODE_ENV !== 'test') {
      app.listen(4000, () => console.log('Backend listening on port 4000'));
    }
    console.log('MongoDB connected successfully!'); // For debugging
    return { client, collection }; // can be used by tests to interact with db
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    throw err; 
  });

// Middleware to ensure DB connection is ready before handling requests
app.use(async (req, res, next) => {
  if (!collection) {
    try {
      await dbConnectPromise; // Wait for the connection to be established
      next();
    } catch (error) {
      res.status(500).json({ error: 'Database connection failed' });
    }
  } else {
    next();
  }
});


// Get all todos
app.get('/todos', async (req, res) => {
  const todos = await collection.find().toArray();
  res.json(todos);
});

// Add new todo
app.post('/todos', async (req, res) => {
  const { text } = req.body;
  const result = await collection.insertOne({ text, completed: false });
  res.json({ insertedId: result.insertedId });
});

// Toggle completion
app.put('/todos/:id', async (req, res) => {
  const { id } = req.params;
  const todo = await collection.findOne({ _id: new ObjectId(id) });
  if (todo) {
    const updated = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { completed: !todo.completed } }
    );
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

// Delete a todo
app.delete('/todos/:id', async (req, res) => {
  await collection.deleteOne({ _id: new ObjectId(req.params.id) });
  res.json({ success: true });
});

module.exports = { app, dbConnectPromise }; // Export both app and the promise
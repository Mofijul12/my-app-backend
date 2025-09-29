const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://my-app-frontend-beta.vercel.app/'  // Replace with your actual frontend URL
  ],
  credentials: true
}));
app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB Error:', err);
  process.exit(1); // Exit if can't connect
});

// Item Schema
const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Item = mongoose.model('Item', itemSchema);

// Routes

// CREATE - Add new item
app.post('/api/items', async (req, res) => {
  try {
    const newItem = new Item({
      name: req.body.name,
      description: req.body.description
    });
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// READ - Get all items
app.get('/api/items', async (req, res) => {
  try {
    const items = await Item.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// READ - Get single item
app.get('/api/items/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// UPDATE - Update item
app.put('/api/items/:id', async (req, res) => {
  try {
    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        description: req.body.description
      },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json(updatedItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - Delete item
app.delete('/api/items/:id', async (req, res) => {
  try {
    const deletedItem = await Item.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'API is running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
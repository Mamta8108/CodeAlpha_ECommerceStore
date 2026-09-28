const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Database Schemas ---
const Product = mongoose.model('Product', new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String
}));

const Order = mongoose.model('Order', new mongoose.Schema({
  customerEmail: String,
  items: Array,
  totalAmount: Number,
  shippingAddress: String,
  createdAt: { type: Date, default: Date.now }
}));

// --- API Routes ---

// Get all products
app.get('/api/products', async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// Get single product details
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: 'Invalid Product ID' });
  }
});

// Process Order
app.post('/api/orders', async (req, res) => {
  try {
    const { customerEmail, items, totalAmount, shippingAddress } = req.body;
    const order = new Order({ customerEmail, items, totalAmount, shippingAddress });
    await order.save();
    res.status(201).json({ message: 'Order processed successfully!', orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: 'Failed to process order' });
  }
});

// Seed Initial Products (Hit this route once in your browser to load demo items)
app.get('/api/seed', async (req, res) => {
  await Product.deleteMany({});
  await Product.insertMany([
    { title: 'Classic White T-Shirt', description: '100% Cotton casual wear t-shirt.', price: 499, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=500', category: 'Apparel' },
    { title: 'Wireless Headphones', description: 'Noise-canceling over-ear headphones.', price: 2499, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', category: 'Electronics' },
    { title: 'Minimalist Watch', description: 'Stainless steel analog leather watch.', price: 1299, imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500', category: 'Accessories' }
  ]);
  res.send('Database Seeded Successfully!');
});

// --- Connect & Run ---
mongoose.connect('mongodb://127.0.0.1:27017/codealpha_ecommerce')
  .then(() => {
    app.listen(5000, () => console.log('Server running on http://localhost:5000'));
  })
  .catch(err => console.error(err));
/* ===================================================
   GALERI YUDI — Vercel Serverless Function
   Express app exported for Vercel (no app.listen)
   MongoDB Atlas + JWT Auth + Multer Memory Storage
   =================================================== */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();

// ─────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────────────
// MULTER CONFIG — Memory Storage (Vercel has read-only FS)
// ─────────────────────────────────────────────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, GIF, atau WEBP.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

// ─────────────────────────────────────────────────────
// MONGODB CONNECTION & SCHEMA
// ─────────────────────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/galeriyudi';

// Reuse existing connection in serverless environment
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB Atlas');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    throw err;
  }
}

// Ensure DB connection on every request
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ error: 'Database connection failed.' });
  }
});

// Product Schema — imageData stores Base64-encoded image in MongoDB
const productSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
    enum: ['paket', 'pot'],
  },
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  stock: {
    type: Number,
    default: 0,
  },
  description: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    default: '',
  },
  // Base64 image data (for uploaded images stored in MongoDB)
  imageData: {
    type: String,
    default: '',
  },
  imageMimeType: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      // Don't send raw imageData in JSON responses (too large)
      // Instead, set image to the API endpoint if imageData exists
      if (ret.imageData) {
        ret.image = `/api/image/${ret._id}`;
        delete ret.imageData;
        delete ret.imageMimeType;
      }
      return ret;
    },
  },
});

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// ─────────────────────────────────────────────────────
// AUTH MIDDLEWARE
// ─────────────────────────────────────────────────────
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token tidak ditemukan. Silakan login.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}

// ─────────────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────────────

// Login
app.post('/api/login', (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username dan password wajib diisi.' });
    }

    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    const token = jwt.sign(
      { username, role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil!',
      token,
      user: { username, role: 'admin' },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Terjadi kesalahan server.' });
  }
});

// Verify token
app.post('/api/auth/verify', authMiddleware, (req, res) => {
  res.json({ valid: true, user: req.user });
});

// ─────────────────────────────────────────────────────
// IMAGE ROUTE — Serve images from MongoDB
// ─────────────────────────────────────────────────────
app.get('/api/image/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).select('imageData imageMimeType');
    if (!product || !product.imageData) {
      return res.status(404).json({ error: 'Gambar tidak ditemukan.' });
    }

    const buffer = Buffer.from(product.imageData, 'base64');
    res.set({
      'Content-Type': product.imageMimeType || 'image/png',
      'Content-Length': buffer.length,
      'Cache-Control': 'public, max-age=31536000, immutable',
    });
    res.send(buffer);
  } catch (err) {
    console.error('Get image error:', err);
    res.status(500).json({ error: 'Gagal mengambil gambar.' });
  }
});

// ─────────────────────────────────────────────────────
// PRODUCT ROUTES (Public)
// ─────────────────────────────────────────────────────

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Gagal mengambil data produk.' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }
    res.json(product);
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({ error: 'Gagal mengambil data produk.' });
  }
});

// ─────────────────────────────────────────────────────
// PRODUCT ROUTES (Admin — Protected)
// ─────────────────────────────────────────────────────

// Create product
app.post('/api/products', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { category, name, price, stock, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Nama dan kategori produk wajib diisi.' });
    }

    const productData = {
      category,
      name,
      price: parseInt(price) || 0,
      stock: parseInt(stock) || 0,
      description: description || '',
      image: '',
    };

    // Store image as Base64 in MongoDB
    if (req.file) {
      productData.imageData = req.file.buffer.toString('base64');
      productData.imageMimeType = req.file.mimetype;
    }

    const product = await Product.create(productData);

    res.status(201).json({ message: 'Produk berhasil ditambahkan!', product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Gagal menambahkan produk.' });
  }
});

// Update product
app.put('/api/products/:id', authMiddleware, upload.single('image'), async (req, res) => {
  try {
    const { category, name, price, stock, description } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    // Update fields
    product.category = category || product.category;
    product.name = name || product.name;
    product.price = parseInt(price) || product.price;
    product.stock = parseInt(stock) ?? product.stock;
    product.description = description ?? product.description;

    // Handle new image upload — store as Base64
    if (req.file) {
      product.imageData = req.file.buffer.toString('base64');
      product.imageMimeType = req.file.mimetype;
      product.image = ''; // Clear old path, toJSON will set API URL
    }

    await product.save();

    res.json({ message: 'Produk berhasil diperbarui!', product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Gagal memperbarui produk.' });
  }
});

// Delete product
app.delete('/api/products/:id', authMiddleware, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Gagal menghapus produk.' });
  }
});

// Update stock only
app.patch('/api/products/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { delta } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    product.stock = Math.max(0, product.stock + (delta || 0));
    await product.save();

    res.json({ message: `Stok diperbarui: ${product.stock}`, product });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: 'Gagal memperbarui stok.' });
  }
});

// ─────────────────────────────────────────────────────
// SEED DEFAULT PRODUCTS (on first request if empty)
// ─────────────────────────────────────────────────────
app.post('/api/seed', authMiddleware, async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.json({ message: `Database sudah berisi ${count} produk.` });
    }

    const defaults = [
      {
        category: 'paket',
        name: 'Paket Serenity — Bonsai Beringin + Pot Keramik Putih',
        price: 850000,
        stock: 5,
        description: 'Bonsai beringin dewasa dengan akar gantung eksotis, dipadukan pot keramik putih minimalis berglaze halus.',
        image: '/assets/images/product-beringin.png',
      },
      {
        category: 'paket',
        name: 'Paket Zen Garden — Bonsai Maple Jepang + Pot Tanah Liat',
        price: 1250000,
        stock: 3,
        description: 'Maple Jepang dengan dedaunan merah-hijau yang memukau. Pot tanah liat cokelat tua dengan aksen klasik.',
        image: '/assets/images/product-maple.png',
      },
      {
        category: 'paket',
        name: 'Paket Harmony — Bonsai Serut + Pot Keramik Abu-abu',
        price: 650000,
        stock: 8,
        description: 'Bonsai serut dengan daun kecil rapat yang mudah dirawat. Pot keramik abu-abu elegant dengan finishing matte.',
        image: '/assets/images/product-serut.png',
      },
      {
        category: 'paket',
        name: 'Paket Evergreen — Bonsai Juniper + Pot Keramik Cokelat',
        price: 950000,
        stock: 4,
        description: 'Juniper cascading klasik dengan karakter batang berpilin. Pot keramik rectangular cokelat tua yang kokoh.',
        image: '/assets/images/product-juniper.png',
      },
      {
        category: 'paket',
        name: 'Paket Skyline — Bonsai Cemara + Pot Keramik Biru-Abu',
        price: 750000,
        stock: 6,
        description: 'Bonsai cemara tegak dengan cabang berlapis indah. Pot keramik glazed biru-abu yang menambah kesan tenang.',
        image: '/assets/images/product-cemara.png',
      },
      {
        category: 'pot',
        name: 'Pot Keramik Putih Minimalis — Round',
        price: 185000,
        stock: 15,
        description: 'Pot keramik bulat berwarna putih polos dengan finishing glaze halus. Cocok untuk bonsai berukuran kecil-sedang.',
        image: '/assets/images/product-beringin.png',
      },
      {
        category: 'pot',
        name: 'Pot Tanah Liat Klasik — Oval',
        price: 150000,
        stock: 20,
        description: 'Pot tanah liat oval dengan warna cokelat natural. Material tebal dan kokoh, desain tradisional Jepang.',
        image: '/assets/images/product-maple.png',
      },
      {
        category: 'pot',
        name: 'Pot Keramik Abu-abu Matte — Rectangular',
        price: 220000,
        stock: 10,
        description: 'Pot keramik persegi panjang berwarna abu-abu dengan finishing matte premium. Elegan untuk bonsai formal.',
        image: '/assets/images/product-serut.png',
      },
      {
        category: 'pot',
        name: 'Pot Keramik Biru-Abu Glazed — Round',
        price: 200000,
        stock: 12,
        description: 'Pot keramik bulat dengan glazed biru-abu yang unik. Memberikan kesan tenang dan natural.',
        image: '/assets/images/product-cemara.png',
      },
    ];

    await Product.insertMany(defaults);
    res.json({ message: '✅ Default products seeded successfully!' });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: 'Gagal melakukan seed data.' });
  }
});

// ─────────────────────────────────────────────────────
// EXPORT FOR VERCEL (no app.listen)
// ─────────────────────────────────────────────────────
module.exports = app;

/* ===================================================
   GALERI YUDI — Express Server
   MongoDB Atlas + JWT Auth + Multer Image Upload
   =================================================== */

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// ─────────────────────────────────────────────────────
// MIDDLEWARE
// ─────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// ─────────────────────────────────────────────────────
// MULTER CONFIG (Image Upload)
// ─────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'product-' + uniqueSuffix + ext);
  },
});

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

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });

// Product Schema
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
}, {
  timestamps: true, // auto createdAt & updatedAt
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret.__v;
      return ret;
    },
  },
});

const Product = mongoose.model('Product', productSchema);

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

    // Check credentials against .env
    if (username !== process.env.ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Username atau password salah.' });
    }

    // Generate JWT
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

    const product = await Product.create({
      category,
      name,
      price: parseInt(price) || 0,
      stock: parseInt(stock) || 0,
      description: description || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
    });

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

    // Handle new image upload
    if (req.file) {
      // Delete old image
      if (product.image && product.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, product.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      product.image = `/uploads/${req.file.filename}`;
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

    // Delete associated image
    if (product.image && product.image.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, product.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
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
// SEED DEFAULT PRODUCTS (on first run)
// ─────────────────────────────────────────────────────
async function seedProducts() {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Seeding default products...');
      const defaults = [
        {
          category: 'paket',
          name: 'Paket Serenity — Bonsai Beringin + Pot Keramik Putih',
          price: 850000,
          stock: 5,
          description: 'Bonsai beringin dewasa dengan akar gantung eksotis, dipadukan pot keramik putih minimalis berglaze halus.',
          image: 'assets/images/product-beringin.png',
        },
        {
          category: 'paket',
          name: 'Paket Zen Garden — Bonsai Maple Jepang + Pot Tanah Liat',
          price: 1250000,
          stock: 3,
          description: 'Maple Jepang dengan dedaunan merah-hijau yang memukau. Pot tanah liat cokelat tua dengan aksen klasik.',
          image: 'assets/images/product-maple.png',
        },
        {
          category: 'paket',
          name: 'Paket Harmony — Bonsai Serut + Pot Keramik Abu-abu',
          price: 650000,
          stock: 8,
          description: 'Bonsai serut dengan daun kecil rapat yang mudah dirawat. Pot keramik abu-abu elegant dengan finishing matte.',
          image: 'assets/images/product-serut.png',
        },
        {
          category: 'paket',
          name: 'Paket Evergreen — Bonsai Juniper + Pot Keramik Cokelat',
          price: 950000,
          stock: 4,
          description: 'Juniper cascading klasik dengan karakter batang berpilin. Pot keramik rectangular cokelat tua yang kokoh.',
          image: 'assets/images/product-juniper.png',
        },
        {
          category: 'paket',
          name: 'Paket Skyline — Bonsai Cemara + Pot Keramik Biru-Abu',
          price: 750000,
          stock: 6,
          description: 'Bonsai cemara tegak dengan cabang berlapis indah. Pot keramik glazed biru-abu yang menambah kesan tenang.',
          image: 'assets/images/product-cemara.png',
        },
        {
          category: 'pot',
          name: 'Pot Keramik Putih Minimalis — Round',
          price: 185000,
          stock: 15,
          description: 'Pot keramik bulat berwarna putih polos dengan finishing glaze halus. Cocok untuk bonsai berukuran kecil-sedang.',
          image: 'assets/images/product-beringin.png',
        },
        {
          category: 'pot',
          name: 'Pot Tanah Liat Klasik — Oval',
          price: 150000,
          stock: 20,
          description: 'Pot tanah liat oval dengan warna cokelat natural. Material tebal dan kokoh, desain tradisional Jepang.',
          image: 'assets/images/product-maple.png',
        },
        {
          category: 'pot',
          name: 'Pot Keramik Abu-abu Matte — Rectangular',
          price: 220000,
          stock: 10,
          description: 'Pot keramik persegi panjang berwarna abu-abu dengan finishing matte premium. Elegan untuk bonsai formal.',
          image: 'assets/images/product-serut.png',
        },
        {
          category: 'pot',
          name: 'Pot Keramik Biru-Abu Glazed — Round',
          price: 200000,
          stock: 12,
          description: 'Pot keramik bulat dengan glazed biru-abu yang unik. Memberikan kesan tenang dan natural.',
          image: 'assets/images/product-cemara.png',
        },
      ];

      await Product.insertMany(defaults);
      console.log('✅ Default products seeded successfully!');
    }
  } catch (err) {
    console.error('Seed error:', err);
  }
}

// ─────────────────────────────────────────────────────
// SERVE REACT BUILD (production) + SPA fallback
// ─────────────────────────────────────────────────────
const frontendDist = path.join(__dirname, 'frontend', 'dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback: any non-API route → index.html
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).send('Galeri Yudi API is running. Frontend not built yet — run: cd frontend && npm run build');
  });
}

// ─────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN
// ─────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// ─────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 Galeri Yudi Server running at http://localhost:${PORT}\n`);
  seedProducts();
});

/* ===================================================
   GALERI YUDI — Express Server
   SQLite + JWT Auth + Multer Image Upload
   =================================================== */

require('dotenv').config();
const express = require('express');
const Database = require('better-sqlite3');
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
// SQLITE CONNECTION & SCHEMA
// ─────────────────────────────────────────────────────
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, 'galeriyudi.db');
const db = new Database(DB_PATH);

// Enable WAL mode for better performance
db.pragma('journal_mode = WAL');

// Create products table if not exists
db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category TEXT NOT NULL CHECK(category IN ('paket', 'pot')),
    name TEXT NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT DEFAULT '',
    image TEXT DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT (datetime('now')),
    updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

console.log('✅ Connected to SQLite database:', DB_PATH);

// ─────────────────────────────────────────────────────
// PREPARED STATEMENTS (for performance)
// ─────────────────────────────────────────────────────
const stmts = {
  getAll: db.prepare('SELECT * FROM products ORDER BY createdAt DESC'),
  getById: db.prepare('SELECT * FROM products WHERE id = ?'),
  insert: db.prepare(`
    INSERT INTO products (category, name, price, stock, description, image, createdAt, updatedAt)
    VALUES (@category, @name, @price, @stock, @description, @image, @createdAt, @updatedAt)
  `),
  update: db.prepare(`
    UPDATE products 
    SET category = @category, name = @name, price = @price, stock = @stock, 
        description = @description, updatedAt = @updatedAt
    WHERE id = @id
  `),
  updateWithImage: db.prepare(`
    UPDATE products 
    SET category = @category, name = @name, price = @price, stock = @stock, 
        description = @description, image = @image, updatedAt = @updatedAt
    WHERE id = @id
  `),
  updateStock: db.prepare('UPDATE products SET stock = ?, updatedAt = ? WHERE id = ?'),
  deleteById: db.prepare('DELETE FROM products WHERE id = ?'),
  count: db.prepare('SELECT COUNT(*) as count FROM products'),
};

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

    // Compare password (plain text comparison since stored in .env)
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

// Get all products (public — for landing page)
app.get('/api/products', (req, res) => {
  try {
    const products = stmts.getAll.all();
    res.json(products);
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({ error: 'Gagal mengambil data produk.' });
  }
});

// Get single product
app.get('/api/products/:id', (req, res) => {
  try {
    const product = stmts.getById.get(req.params.id);
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

// Create product (with image upload)
app.post('/api/products', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { category, name, price, stock, description } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Nama dan kategori produk wajib diisi.' });
    }

    const now = new Date().toISOString();
    const productData = {
      category,
      name,
      price: parseInt(price) || 0,
      stock: parseInt(stock) || 0,
      description: description || '',
      image: req.file ? `/uploads/${req.file.filename}` : '',
      createdAt: now,
      updatedAt: now,
    };

    const result = stmts.insert.run(productData);
    const product = stmts.getById.get(result.lastInsertRowid);

    res.status(201).json({ message: 'Produk berhasil ditambahkan!', product });
  } catch (err) {
    console.error('Create product error:', err);
    res.status(500).json({ error: 'Gagal menambahkan produk.' });
  }
});

// Update product
app.put('/api/products/:id', authMiddleware, upload.single('image'), (req, res) => {
  try {
    const { category, name, price, stock, description } = req.body;
    const now = new Date().toISOString();

    const updateData = {
      id: parseInt(req.params.id),
      category,
      name,
      price: parseInt(price) || 0,
      stock: parseInt(stock) || 0,
      description: description || '',
      updatedAt: now,
    };

    // Only update image if new file uploaded
    if (req.file) {
      // Delete old image if it's in uploads folder
      const oldProduct = stmts.getById.get(req.params.id);
      if (oldProduct && oldProduct.image && oldProduct.image.startsWith('/uploads/')) {
        const oldPath = path.join(__dirname, oldProduct.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.image = `/uploads/${req.file.filename}`;
      stmts.updateWithImage.run(updateData);
    } else {
      stmts.update.run(updateData);
    }

    const product = stmts.getById.get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    res.json({ message: 'Produk berhasil diperbarui!', product });
  } catch (err) {
    console.error('Update product error:', err);
    res.status(500).json({ error: 'Gagal memperbarui produk.' });
  }
});

// Delete product
app.delete('/api/products/:id', authMiddleware, (req, res) => {
  try {
    const product = stmts.getById.get(req.params.id);
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

    stmts.deleteById.run(req.params.id);
    res.json({ message: 'Produk berhasil dihapus.' });
  } catch (err) {
    console.error('Delete product error:', err);
    res.status(500).json({ error: 'Gagal menghapus produk.' });
  }
});

// Update stock only
app.patch('/api/products/:id/stock', authMiddleware, (req, res) => {
  try {
    const { delta } = req.body;
    const product = stmts.getById.get(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Produk tidak ditemukan.' });
    }

    const newStock = Math.max(0, product.stock + (delta || 0));
    const now = new Date().toISOString();
    stmts.updateStock.run(newStock, now, req.params.id);

    const updated = stmts.getById.get(req.params.id);
    res.json({ message: `Stok diperbarui: ${updated.stock}`, product: updated });
  } catch (err) {
    console.error('Update stock error:', err);
    res.status(500).json({ error: 'Gagal memperbarui stok.' });
  }
});

// ─────────────────────────────────────────────────────
// SEED DEFAULT PRODUCTS (on first run)
// ─────────────────────────────────────────────────────
function seedProducts() {
  try {
    const { count } = stmts.count.get();
    if (count === 0) {
      console.log('📦 Seeding default products...');
      const now = new Date().toISOString();
      const defaults = [
        {
          category: 'paket',
          name: 'Paket Serenity — Bonsai Beringin + Pot Keramik Putih',
          price: 850000,
          stock: 5,
          description: 'Bonsai beringin dewasa dengan akar gantung eksotis, dipadukan pot keramik putih minimalis berglaze halus.',
          image: 'assets/images/product-beringin.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'paket',
          name: 'Paket Zen Garden — Bonsai Maple Jepang + Pot Tanah Liat',
          price: 1250000,
          stock: 3,
          description: 'Maple Jepang dengan dedaunan merah-hijau yang memukau. Pot tanah liat cokelat tua dengan aksen klasik.',
          image: 'assets/images/product-maple.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'paket',
          name: 'Paket Harmony — Bonsai Serut + Pot Keramik Abu-abu',
          price: 650000,
          stock: 8,
          description: 'Bonsai serut dengan daun kecil rapat yang mudah dirawat. Pot keramik abu-abu elegant dengan finishing matte.',
          image: 'assets/images/product-serut.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'paket',
          name: 'Paket Evergreen — Bonsai Juniper + Pot Keramik Cokelat',
          price: 950000,
          stock: 4,
          description: 'Juniper cascading klasik dengan karakter batang berpilin. Pot keramik rectangular cokelat tua yang kokoh.',
          image: 'assets/images/product-juniper.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'paket',
          name: 'Paket Skyline — Bonsai Cemara + Pot Keramik Biru-Abu',
          price: 750000,
          stock: 6,
          description: 'Bonsai cemara tegak dengan cabang berlapis indah. Pot keramik glazed biru-abu yang menambah kesan tenang.',
          image: 'assets/images/product-cemara.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'pot',
          name: 'Pot Keramik Putih Minimalis — Round',
          price: 185000,
          stock: 15,
          description: 'Pot keramik bulat berwarna putih polos dengan finishing glaze halus. Cocok untuk bonsai berukuran kecil-sedang.',
          image: 'assets/images/product-beringin.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'pot',
          name: 'Pot Tanah Liat Klasik — Oval',
          price: 150000,
          stock: 20,
          description: 'Pot tanah liat oval dengan warna cokelat natural. Material tebal dan kokoh, desain tradisional Jepang.',
          image: 'assets/images/product-maple.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'pot',
          name: 'Pot Keramik Abu-abu Matte — Rectangular',
          price: 220000,
          stock: 10,
          description: 'Pot keramik persegi panjang berwarna abu-abu dengan finishing matte premium. Elegan untuk bonsai formal.',
          image: 'assets/images/product-serut.png',
          createdAt: now,
          updatedAt: now,
        },
        {
          category: 'pot',
          name: 'Pot Keramik Biru-Abu Glazed — Round',
          price: 200000,
          stock: 12,
          description: 'Pot keramik bulat dengan glazed biru-abu yang unik. Memberikan kesan tenang dan natural.',
          image: 'assets/images/product-cemara.png',
          createdAt: now,
          updatedAt: now,
        },
      ];

      const insertMany = db.transaction((products) => {
        for (const p of products) {
          stmts.insert.run(p);
        }
      });

      insertMany(defaults);
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
  // Fallback to old HTML files during development
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
  });
}

// ─────────────────────────────────────────────────────
// GRACEFUL SHUTDOWN — close SQLite connection
// ─────────────────────────────────────────────────────
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  db.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  db.close();
  process.exit(0);
});

// ─────────────────────────────────────────────────────
// START SERVER
// ─────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🌿 Galeri Yudi Server running at http://localhost:${PORT}\n`);
  seedProducts();
});

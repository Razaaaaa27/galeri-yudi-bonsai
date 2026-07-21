# 🌿 Galeri Yudi — Paket Bonsai Premium Siap Pajang

Website galeri bonsai premium dengan admin panel untuk mengelola produk. Dibangun dengan React + Express + MongoDB Atlas.

![Status](https://img.shields.io/badge/Status-Live-brightgreen) ![Node](https://img.shields.io/badge/Node-%3E%3D18-green) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Fitur

- 🏠 **Landing Page** — Hero, koleksi produk, about, tips perawatan, testimonials
- 🔐 **Admin Login** — Autentikasi JWT
- ⚙️ **Dashboard Admin** — CRUD produk, manage stok, upload gambar
- 📱 **Full Responsive** — Desktop, tablet, & mobile
- 💬 **Order via WhatsApp** — Redirect langsung ke chat
- 🌿 **Desain Premium** — Apple-inspired minimalism dengan glassmorphism

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | React 19 + Vite |
| Backend | Express.js |
| Database | MongoDB Atlas |
| Auth | JWT + bcryptjs |
| Upload | Multer |
| Styling | Vanilla CSS (mobile-first) |

## 📂 Struktur Project

```
galeri-yudi-bonsai/
├── server.js              ← Express backend + API
├── package.json           ← Dependencies + scripts
├── .env.example           ← Template environment
├── assets/images/         ← Gambar produk default
├── uploads/               ← Gambar upload dari admin
└── frontend/              ← React SPA
    ├── src/
    │   ├── pages/         ← HomePage, LoginPage, AdminPage
    │   ├── components/    ← Navbar, Footer, ProductCard, Toast
    │   └── utils/         ← API helper, auth, format
    ├── vite.config.js
    └── index.html
```

## 🚀 Cara Menjalankan

### 1. Clone & Install

```bash
git clone https://github.com/USERNAME/galeri-yudi-bonsai.git
cd galeri-yudi-bonsai
npm install
cd frontend && npm install && cd ..
```

### 2. Setup Environment

```bash
cp .env.example .env
```

Edit `.env` dan isi `MONGODB_URI` dengan connection string dari MongoDB Atlas:

```env
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/galeriyudi?retryWrites=true&w=majority
JWT_SECRET=your_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
PORT=3000
```

### 3. Development

Buka **2 terminal**:

```bash
# Terminal 1 — Backend (port 3000)
node server.js

# Terminal 2 — Frontend (port 5173)
cd frontend && npm run dev
```

Buka: **http://localhost:5173**

### 4. Production Build

```bash
npm run build     # Build React ke frontend/dist
npm start         # Jalankan Express (serve React + API)
```

Buka: **http://localhost:3000**

## 🔑 Login Admin

| Field | Value |
|---|---|
| URL | `/login` |
| Username | `admin` |
| Password | `admin123` |

## 🌐 Deploy

Project ini siap deploy ke **Railway**:

1. Push ke GitHub
2. Connect ke Railway
3. Set environment variables
4. Deploy!

Lihat panduan lengkap di dokumentasi project.

## 📄 License

MIT © Galeri Yudi

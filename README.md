# 🌿 Galeri Yudi — Bonsai Premium Website

Website katalog bonsai premium lengkap dengan admin panel untuk manajemen produk.  
Stack: **Node.js + Express + SQLite + JWT Auth + Multer Upload**

---

## 📋 Daftar Isi

1. [Tentang Project](#-tentang-project)
2. [Prasyarat](#-prasyarat)
3. [Instalasi & Setup](#-instalasi--setup)
4. [Menjalankan Website](#-menjalankan-website)
5. [Panduan Penggunaan](#-panduan-penggunaan)
6. [Database SQLite](#-database-sqlite)
7. [Konfigurasi Environment](#-konfigurasi-environment)
8. [API Endpoints](#-api-endpoints)
9. [Struktur Folder](#-struktur-folder)
10. [Deploy ke Internet (Opsional)](#-deploy-ke-internet-opsional)
11. [Troubleshooting](#-troubleshooting)

---

## 🌿 Tentang Project

**Galeri Yudi** adalah website katalog bonsai premium yang terdiri dari:

- **Landing Page** — Halaman utama untuk menampilkan katalog produk bonsai & pot kepada pelanggan
- **Admin Panel** — Dashboard khusus admin untuk mengelola produk (tambah, edit, hapus, atur stok)
- **Sistem Login** — Autentikasi admin menggunakan JWT (JSON Web Token)
- **Upload Gambar** — Admin bisa upload gambar produk langsung dari browser (maks 5MB)

### Fitur Lengkap:
| Fitur | Keterangan |
|-------|-----------|
| 🏠 Katalog Produk | Tampilan produk dengan kategori, harga, stok, deskripsi |
| 🔍 Filter Kategori | Filter berdasarkan Paket Bonsai atau Pot Kosong |
| 📱 Responsive Design | Tampilan optimal di desktop, tablet, dan HP |
| 💬 WhatsApp Integration | Tombol "Pesan Sekarang" langsung ke WhatsApp |
| 🔐 Admin Login | Login aman dengan JWT token (berlaku 24 jam) |
| ➕ CRUD Produk | Tambah, lihat, edit, hapus produk |
| 📷 Upload Gambar | Upload foto produk (JPG, PNG, GIF, WEBP) |
| 📦 Manajemen Stok | Tambah/kurangi stok produk dengan 1 klik |
| 🌱 Seed Data | 9 produk contoh otomatis saat pertama kali dijalankan |

---

## 🔧 Prasyarat

Yang dibutuhkan **hanya 1 software saja**:

| Software | Versi Minimum | Cara Cek | Download |
|----------|--------------|----------|----------|
| **Node.js** | v18+ | `node -v` | [nodejs.org](https://nodejs.org/) |

> 💡 **npm** otomatis terinstall bersama Node.js. Cek dengan `npm -v` (minimal v9+).

> ✅ **Tidak perlu install database!** Project ini menggunakan SQLite yang sudah built-in — database otomatis dibuat saat server dijalankan.

### Cara Install Node.js (jika belum):

1. Buka [nodejs.org](https://nodejs.org/)
2. Download versi **LTS** (Long Term Support)
3. Jalankan installer, klik **Next** terus sampai selesai
4. Restart terminal / Command Prompt
5. Verifikasi:
   ```bash
   node -v    # Contoh output: v20.15.0
   npm -v     # Contoh output: 10.7.0
   ```

---

## 📥 Instalasi & Setup

### Langkah 1 — Buka Folder Project

Buka terminal (Command Prompt / PowerShell / Terminal) dan navigasi ke folder project:

```bash
cd "D:\PROJECT KERJA\bonsai"
```

> 💡 Atau di VS Code: **File → Open Folder** → pilih folder `bonsai`

---

### Langkah 2 — Install Dependencies

Jalankan perintah ini untuk menginstall semua library yang dibutuhkan:

```bash
npm install
```

**Output yang diharapkan:**
```
added XX packages, and audited XXX packages in Xs
found 0 vulnerabilities
```

Library yang terinstall:

| Package | Fungsi |
|---------|--------|
| `express` | Web framework untuk menjalankan server |
| `better-sqlite3` | Database SQLite embedded (tanpa perlu install terpisah) |
| `multer` | Menangani upload gambar produk |
| `jsonwebtoken` | Membuat & verifikasi token login admin |
| `bcryptjs` | Hashing password (tersedia untuk production) |
| `cors` | Mengizinkan akses cross-origin |
| `dotenv` | Membaca konfigurasi dari file `.env` |

---

### Langkah 3 — Cek Konfigurasi (Opsional)

File `.env` sudah tersedia dan siap pakai. Anda **tidak perlu mengubah apapun** untuk development:

```env
# SQLite database path (auto-created)
DATABASE_PATH=galeriyudi.db

# JWT Secret key for authentication
JWT_SECRET=galeriyudi_secret_key_2026_bonsai_premium

# Admin credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Server port
PORT=3000
```

> ⚠️ **Untuk production**, ganti `ADMIN_PASSWORD` dan `JWT_SECRET` dengan nilai yang lebih kuat.

---

## 🚀 Menjalankan Website

### Langkah 4 — Start Server

```bash
npm start
```

**Output yang diharapkan (pertama kali):**
```
✅ Connected to SQLite database: galeriyudi.db

🌿 Galeri Yudi Server running at http://localhost:3000

📦 Seeding default products...
✅ Default products seeded successfully!
```

> ℹ️ Pesan "Seeding default products" hanya muncul pada run pertama. Data 9 produk contoh otomatis masuk ke database.

---

### Langkah 5 — Buka di Browser

Buka browser (Chrome/Firefox/Edge) dan akses:

| Halaman | URL | Keterangan |
|---------|-----|-----------|
| 🏠 **Landing Page** | [http://localhost:3000](http://localhost:3000) | Halaman utama yang dilihat pelanggan |
| 🔐 **Login Admin** | [http://localhost:3000/login.html](http://localhost:3000/login.html) | Halaman login untuk masuk admin panel |
| ⚙️ **Admin Panel** | [http://localhost:3000/admin.html](http://localhost:3000/admin.html) | Dashboard untuk kelola produk |

---

### Langkah 6 — Menghentikan Server

Tekan `Ctrl + C` di terminal untuk menghentikan server.

---

## 👨‍💼 Panduan Penggunaan

### A. Landing Page (Untuk Pelanggan)

Halaman ini menampilkan semua produk bonsai & pot. Pelanggan bisa:
- Melihat katalog produk lengkap dengan foto, harga, stok
- Filter berdasarkan kategori: **Semua**, **Paket Bonsai**, **Pot Kosong**
- Klik tombol **"Pesan Sekarang"** untuk langsung chat WhatsApp

---

### B. Login Admin

1. Buka [http://localhost:3000/login.html](http://localhost:3000/login.html)
2. Masukkan:
   - **Username:** `admin`
   - **Password:** `admin123`
3. Klik **Login**
4. Anda akan diarahkan ke Admin Panel

> 💡 Kredensial bisa diubah di file `.env`

---

### C. Admin Panel

Setelah login, Anda bisa melakukan:

#### ➕ Tambah Produk Baru
1. Klik menu **"Tambah Produk"** di sidebar
2. Isi form:
   - Pilih kategori (Paket Bonsai / Pot Kosong)
   - Nama produk
   - Harga
   - Stok
   - Deskripsi
   - Upload gambar (klik atau drag & drop, maks 5MB)
3. Klik **"Simpan Produk"**

#### ✏️ Edit Produk
1. Di tabel produk, klik ikon **pensil** (✏️) pada produk yang ingin diedit
2. Form akan terisi dengan data produk tersebut
3. Ubah data yang diinginkan
4. Klik **"Simpan Perubahan"**

#### 🗑️ Hapus Produk
1. Di tabel produk, klik ikon **tempat sampah** (🗑️)
2. Konfirmasi penghapusan di modal yang muncul
3. Produk dan gambarnya akan dihapus permanen

#### 📦 Atur Stok
- Klik tombol **+** atau **−** langsung di kolom stok pada tabel
- Stok akan langsung terupdate tanpa perlu buka form edit

#### 🔍 Cari & Filter
- Gunakan kotak pencarian untuk cari produk berdasarkan nama/deskripsi
- Gunakan tab filter untuk menampilkan kategori tertentu

#### 🚪 Logout
- Klik tombol **Logout** di sidebar bawah
- Konfirmasi di modal yang muncul

---

## 🗄️ Database SQLite

### Apa itu SQLite?
SQLite adalah database yang tersimpan dalam **1 file** di komputer Anda. Tidak perlu install server database terpisah seperti MongoDB atau MySQL.

### File Database
- **Lokasi:** `galeriyudi.db` di folder project (otomatis dibuat saat server pertama kali jalan)
- **Tidak perlu koneksi internet** — semua data tersimpan lokal

### Tabel `products`
| Kolom | Tipe | Keterangan |
|-------|------|-----------|
| `id` | INTEGER | Primary key, auto-increment |
| `category` | TEXT | `paket` atau `pot` |
| `name` | TEXT | Nama produk |
| `price` | INTEGER | Harga dalam Rupiah |
| `stock` | INTEGER | Jumlah stok |
| `description` | TEXT | Deskripsi produk |
| `image` | TEXT | Path gambar produk |
| `createdAt` | TEXT | Tanggal dibuat (ISO 8601) |
| `updatedAt` | TEXT | Tanggal terakhir diubah (ISO 8601) |

### Backup Database
```bash
# Windows (Command Prompt)
copy galeriyudi.db galeriyudi-backup.db

# Windows (PowerShell)
Copy-Item galeriyudi.db galeriyudi-backup.db
```

### Reset Database (Hapus Semua Data & Mulai Ulang)
```bash
# 1. Stop server (Ctrl+C)

# 2. Hapus file database
del galeriyudi.db        # Command Prompt
Remove-Item galeriyudi.db  # PowerShell

# 3. Jalankan ulang server — seed data otomatis dibuat kembali
npm start
```

---

## ⚙️ Konfigurasi Environment

Semua konfigurasi ada di file `.env`:

| Variable | Default | Keterangan |
|----------|---------|-----------|
| `DATABASE_PATH` | `galeriyudi.db` | Nama/path file database SQLite |
| `JWT_SECRET` | `galeriyudi_secret_key_...` | Secret key untuk enkripsi token JWT |
| `ADMIN_USERNAME` | `admin` | Username login admin |
| `ADMIN_PASSWORD` | `admin123` | Password login admin |
| `PORT` | `3000` | Port server (bisa diganti kalau bentrok) |

### Yang Wajib Diganti untuk Production:

```env
# Ganti dengan password yang kuat
ADMIN_PASSWORD=P@ssw0rd_Kuat_123!

# Ganti dengan string random panjang
JWT_SECRET=random_string_yang_sangat_panjang_dan_unik_2026

# Ganti dengan nomor WhatsApp asli di script.js
# whatsappNumber: '628XXXXXXXXXX'
```

---

## 🔌 API Endpoints

### Public (Tanpa Login)

| Method | URL | Deskripsi | Contoh Response |
|--------|-----|-----------|----------------|
| `GET` | `/api/products` | Ambil semua produk | `[{id: 1, name: "...", ...}]` |
| `GET` | `/api/products/:id` | Ambil 1 produk | `{id: 1, name: "...", ...}` |
| `POST` | `/api/login` | Login admin | `{token: "eyJ...", user: {...}}` |

### Protected (Butuh Login — Kirim Header `Authorization: Bearer <token>`)

| Method | URL | Deskripsi |
|--------|-----|-----------|
| `POST` | `/api/products` | Tambah produk baru (+ upload gambar) |
| `PUT` | `/api/products/:id` | Edit produk (+ ganti gambar) |
| `DELETE` | `/api/products/:id` | Hapus produk + gambarnya |
| `PATCH` | `/api/products/:id/stock` | Tambah/kurangi stok |
| `POST` | `/api/auth/verify` | Cek apakah token masih valid |

---

## 📁 Struktur Folder

```
bonsai/
│
├── .env                    # ⚙️ Konfigurasi (database, JWT, admin, port)
├── .gitignore              # 📋 File yang tidak masuk git
├── package.json            # 📦 Daftar dependencies & scripts
├── server.js               # 🖥️ Server utama (Express + SQLite + API routes)
├── galeriyudi.db           # 🗄️ Database SQLite (auto-generated)
│
├── index.html              # 🏠 Landing page (katalog produk)
├── style.css               # 🎨 Styling landing page
├── script.js               # ⚡ JavaScript landing page
│
├── login.html              # 🔐 Halaman login admin
├── login.css               # 🎨 Styling login
├── login.js                # ⚡ JavaScript login
│
├── admin.html              # ⚙️ Admin panel (CRUD produk)
├── admin.css               # 🎨 Styling admin panel
├── admin.js                # ⚡ JavaScript admin panel
│
├── assets/
│   └── images/             # 🖼️ Gambar default produk
│       ├── hero-bonsai.png
│       ├── product-beringin.png
│       ├── product-cemara.png
│       ├── product-juniper.png
│       ├── product-maple.png
│       └── product-serut.png
│
├── uploads/                # 📤 Gambar yang diupload admin
│   └── .gitkeep
│
└── node_modules/           # 📦 Dependencies (auto-generated)
```

---

## 🌐 Deploy ke Internet (Opsional)

Jika ingin website bisa diakses dari mana saja (online), ada beberapa opsi:

### Opsi A: Railway (Gratis — Recommended)
1. Buka [railway.app](https://railway.app/) dan buat akun
2. Klik **"New Project"** → **"Deploy from GitHub Repo"**
3. Connect repository Anda
4. Railway otomatis detect Node.js dan menjalankan `npm start`
5. Set environment variables di Railway dashboard (sama seperti `.env`)
6. Website Anda akan mendapat URL publik

### Opsi B: Render (Gratis)
1. Buka [render.com](https://render.com/) dan buat akun
2. Klik **"New Web Service"**
3. Connect repository
4. Build Command: `npm install`
5. Start Command: `npm start`
6. Tambahkan environment variables

### Opsi C: VPS (Rp 50-100rb/bulan)
1. Sewa VPS dari IDCloudHost, DigitalOcean, atau Contabo
2. Install Node.js di VPS
3. Upload project ke VPS
4. Jalankan dengan process manager seperti PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name galeriyudi
   ```

---

## 🔥 Troubleshooting

### ❌ `node -v` tidak dikenali
```
Penyebab: Node.js belum terinstall atau belum masuk PATH
Solusi: 
1. Download & install dari nodejs.org
2. Restart terminal setelah install
```

### ❌ `npm install` gagal / error
```
Penyebab: Koneksi internet bermasalah atau versi Node.js terlalu lama
Solusi:
1. Pastikan koneksi internet stabil
2. Cek versi Node.js: node -v (minimal v18)
3. Coba: npm cache clean --force, lalu npm install lagi
```

### ❌ `Cannot find module 'better-sqlite3'`
```
Penyebab: Dependencies belum terinstall
Solusi: Jalankan npm install di folder project
```

### ❌ `EADDRINUSE: port 3000`
```
Penyebab: Port 3000 sudah dipakai aplikasi lain
Solusi:
1. Ubah PORT di file .env (misal: PORT=3001)
2. Atau matikan aplikasi yang memakai port 3000
```

### ❌ Halaman tidak menampilkan produk
```
Penyebab: Server belum berjalan
Solusi:
1. Buka terminal di folder project
2. Jalankan: npm start
3. Buka http://localhost:3000
```

### ❌ Login gagal terus
```
Penyebab: Kredensial tidak sesuai dengan .env
Solusi:
1. Cek username & password di file .env
2. Default: admin / admin123
3. Pastikan tidak ada spasi di awal/akhir
```

### ❌ Upload gambar gagal
```
Penyebab: File terlalu besar atau format tidak didukung
Solusi:
1. Maksimal ukuran file: 5MB
2. Format yang didukung: JPG, PNG, GIF, WEBP
3. Pastikan folder uploads/ ada di project
```

### ❌ Database corrupt / ingin reset
```
Solusi:
1. Stop server (Ctrl+C)
2. Hapus file galeriyudi.db
3. Jalankan ulang: npm start
4. Seed data 9 produk akan otomatis dibuat kembali
```

---

## 🚀 Quick Start (Ringkasan 3 Langkah)

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server
npm start

# 3. Buka browser → http://localhost:3000
#    Admin login → http://localhost:3000/login.html
#    Username: admin | Password: admin123
```

**Selesai! 🎉** Website Anda sudah berjalan.

---

## 📝 Catatan Penting

- 🗄️ Database (`galeriyudi.db`) otomatis dibuat saat pertama kali server dijalankan
- 🌱 9 produk contoh otomatis di-seed saat database kosong
- 🖼️ Gambar yang diupload disimpan di folder `uploads/`
- 🔒 Token login berlaku 24 jam, setelah itu harus login ulang
- 💾 Untuk backup data, cukup copy file `galeriyudi.db`

---

**Dibuat dengan 🌿 oleh Galeri Yudi**

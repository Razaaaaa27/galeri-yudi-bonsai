# 🌿 Galeri Yudi — Bonsai Premium Website

Website galeri bonsai premium dengan admin panel untuk mengelola produk.

## Tech Stack

- **Frontend**: React + Vite (SPA)
- **Backend**: Express.js
- **Database**: SQLite (better-sqlite3)
- **Auth**: JWT + bcryptjs

## Cara Menjalankan (Lokal)

### 1. Install dependencies
```bash
npm install
cd frontend && npm install
```

### 2. Setup environment
```bash
cp .env.example .env
```

### 3. Development (2 terminal)
```bash
# Terminal 1 - Backend
node server.js

# Terminal 2 - Frontend
cd frontend && npm run dev
```

Buka: http://localhost:5173

### 4. Production
```bash
npm run build     # Build React
npm start         # Jalankan server
```

Buka: http://localhost:3000

## Login Admin

- **URL**: `/login`
- **Username**: `admin`
- **Password**: `admin123`

# Giorgio Armani - Sistem Manajemen Anggota

Sistem manajemen anggota, deposit, dan penarikan untuk bisnis Giorgio Armani.

## Fitur

- **Multi-level User**: Master Admin, Admin, Agent, Customer
- **Manajemen Anggota**: Pendaftaran, approval, lock/unlock akun
- **Deposit & Withdrawal**: Proses deposit dan penarikan saldo
- **Dashboard Responsif**: Tampilan optimal untuk desktop dan mobile
- **Dual Portal**: Pemisahan akses pelanggan dan admin panel

## Persyaratan

- Node.js 18+
- PostgreSQL database (Neon, Supabase, atau PostgreSQL lokal)
- npm atau yarn

## Installasi

```bash
npm install
```

## Konfigurasi

Buat file `.env` di root folder:

```env
DATABASE_URL=postgresql://user:password@host:port/dbname?sslmode=require
PORT=5000
NODE_ENV=production
```

## Menjalankan Aplikasi

### Mode Development

**Pelanggan (Port 5000):**
```bash
npm run dev:customer
```

**Admin Panel (Port 5001):**
```bash
npm run dev:admin
```

Atau jalankan keduanya sekaligus:
```bash
npm run dev:both
```

### Mode Production

```bash
npm run build
npm run start
```

## URL Akses

| Portal | URL | Port |
|--------|-----|------|
| Pelanggan | http://localhost:5000 | 5000 |
| Admin Panel | http://localhost:5001 | 5001 |

### Path Rahasia

- **Pelanggan**: `/wk-panel-2210`
- **Master Admin**: `/ms-panel-9921`
- **Admin**: `/ad-panel-4432`
- **Agent**: `/ag-panel-7781`

## Deploy ke Render

1. Push ke GitHub
2. Buat project baru di Render
3. Connect ke GitHub repo
4. Setting environment:
   - `DATABASE_URL`: PostgreSQL connection string
   - `PORT`: 5000
5. Build Command: `npm run build`
6. Start Command: `npm run start`

## Tech Stack

- **Backend**: Express.js, TypeScript
- **Frontend**: React, Vite, TailwindCSS
- **Database**: PostgreSQL (Drizzle ORM)
- **Deployment**: Render

## Struktur Folder

```
/
├── client/           # Frontend React
├── server/          # Backend Express
├── shared/          # Schema dan tipe data
├── script/          # Build scripts
├── .env             # Environment variables
├── package.json     # Dependencies
└── render.yaml     # Konfigurasi Render
```

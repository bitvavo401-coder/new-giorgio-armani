# Multi-Location Setup Guide

Panduan lengkap untuk setup arsitektur multi-lokasi aplikasi Anda dengan:
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2 atau AWS S3
- **Hosting**: Render.com
- **Deploy Pipeline**: GitHub Actions

---

## 📋 Checklist Setup

### 1. Database - Supabase ✅

**Step 1: Buat Akun Supabase**
- Buka: https://supabase.com
- Sign up dengan GitHub/Email
- Buat project baru (nama: "giorgio-armani-app")
- Pilih region terdekat dengan users Anda

**Step 2: Dapatkan DATABASE_URL**
```
Di Supabase Dashboard:
1. Pilih project Anda
2. Settings → Database → Connection Strings
3. Copy URI (PostgreSQL)
4. Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].db.supabase.co:5432/postgres
```

**Step 3: Setup Database Schema**
```bash
npm run db:push
```
(Jika perlu, backup database terlebih dahulu)

---

### 2. Storage - Cloudflare R2 ✅

**Step 1: Setup Cloudflare R2 (Rekomendasi - lebih murah)**

```
A. Buka: https://dash.cloudflare.com
B. Navigate ke: R2 → Create bucket
C. Nama bucket: "giorgio-armani-storage"
D. Jangan set CORS dulu
E. Create bucket

F. Generate API Token:
   - Settings → R2 API Tokens
   - Create API Token
   - Edit custom token:
     * Permissions: Object Write, Read
     * Resources: All buckets
     * TTL: 1 tahun (atau custom)
   - Copy Access Key ID & Secret Access Key

G. Dapatkan R2 URL:
   - Di bucket settings, cari "S3 API" section
   - Copy endpoint URL: https://[account-id].r2.cloudflarestorage.com
```

**Atau AWS S3 (Alternatif):**

```
A. Buka: https://aws.amazon.com
B. Login → Console → S3
C. Create Bucket:
   - Bucket name: "giorgio-armani-storage"
   - Region: us-east-1 (atau terdekat)
D. Generate Access Keys:
   - IAM → Users → Create User
   - Attach Policy: AmazonS3FullAccess
   - Create Access Key
   - Copy Access Key ID & Secret Access Key
```

---

### 3. Environment Variables - Render Dashboard ✅

**Step 1: Login ke Render.com**
- https://dashboard.render.com
- Pilih service "giorgio-armani-app"

**Step 2: Tambahkan Environment Variables**

Klik: Settings → Environment
Tambahkan:

```
DATABASE_URL = postgresql://... (dari Supabase)

AWS_S3_BUCKET = giorgio-armani-storage
AWS_ACCESS_KEY_ID = (dari R2/S3)
AWS_SECRET_ACCESS_KEY = (dari R2/S3)
AWS_REGION = auto (untuk R2) atau us-east-1 (untuk S3)
AWS_S3_ENDPOINT = https://[account-id].r2.cloudflarestorage.com (hanya untuk R2)
```

**Step 3: Deploy**
- Klik: Manual Deploy → Deploy Latest Commit
- Tunggu sampai build selesai

---

### 4. GitHub Actions Secrets ✅

**Step 1: Setup GitHub Secrets**

Di GitHub Repo Settings → Secrets and variables → Actions:

Tambahkan secrets:
```
DATABASE_URL = (dari Supabase)

AWS_ACCESS_KEY_ID = (dari R2/S3)
AWS_SECRET_ACCESS_KEY = (dari R2/S3)
AWS_S3_BUCKET = giorgio-armani-storage
AWS_REGION = auto atau us-east-1
AWS_S3_ENDPOINT = https://[account-id].r2.cloudflarestorage.com (opsional, untuk R2)

RENDER_API_KEY = (dari Render API Token)
RENDER_SERVICE_ID = srv-xxxxxxx (lihat di URL render.com)
RENDER_APP_URL = https://giorgio-armani-app.onrender.com
```

**Step 2: Generate Render API Token**
- Render Dashboard → Settings → API Key
- Copy API Key

**Step 3: Cari Service ID**
- Buka service di Render
- Lihat URL: render.com/services/web/srv-[SERVICE_ID]
- Copy hanya bagian `srv-xxxxxxx`

---

## 🚀 Deploy Workflow

### Automatic Deploy (GitHub Actions)
```
1. Push ke branch main
2. GitHub Actions automatically:
   ✓ Build aplikasi
   ✓ Run tests
   ✓ Upload build artifacts ke S3/R2
   ✓ Trigger deploy ke Render
   ✓ Verify aplikasi healthy
   ✓ Create deployment summary
```

### Manual Deploy
```bash
# Build locally
npm run build

# Push ke GitHub (trigger CI/CD)
git add .
git commit -m "Update: Add multi-location setup"
git push origin main

# Atau trigger Render deployment langsung
curl -X POST https://api.render.com/deploy/srv-[SERVICE_ID]?key=[API_KEY]
```

---

## 📁 Arsitektur File

```
├── server/
│   ├── s3-storage.ts          # ← S3/R2 Storage Manager
│   ├── db.ts                  # Database connection
│   ├── routes.ts              # API routes
│   ├── index.ts               # Main server
│   └── ...
│
├── .github/workflows/
│   └── deploy.yml             # ← CI/CD Pipeline
│
├── .env.example               # ← Template env variables
├── render.yaml                # ← Render deployment config
├── package.json               # ← Dependencies
└── ...
```

---

## 🔧 API Routes untuk File Upload

Tambahkan endpoint untuk upload file:

```typescript
// server/routes.ts

app.post("/api/deposits/:id/upload-proof", async (req, res) => {
  try {
    const { id } = req.params;
    const file = req.file; // Dari multer middleware
    
    if (!file) {
      return res.status(400).json({ error: "File required" });
    }
    
    // Upload ke S3/R2
    const fileUrl = await s3Storage.uploadDepositProof(
      file.buffer,
      id,
      file.originalname
    );
    
    // Update deposit dengan URL
    const deposit = await storage.updateDeposit(id, {
      proofUrl: fileUrl,
    });
    
    res.json(deposit);
  } catch (error) {
    res.status(500).json({ error: "Upload failed" });
  }
});
```

---

## 🔒 Security Tips

### Best Practices:
1. **Jangan commit .env** - Sudah ada di .gitignore
2. **Use GitHub Secrets** - Semua sensitive data di GitHub Secrets, bukan di repo
3. **Rotate Keys Regularly** - Ganti API keys setiap 3-6 bulan
4. **Enable 2FA** - Di Supabase, Cloudflare, GitHub, Render
5. **Monitor Costs** - Set billing alerts di AWS/Cloudflare
6. **Backup Database** - Supabase auto-backup daily

### Environment Isolation:
```
Development:  Local .env file (manual config)
Staging:      Dev branch → dev Render service (jika ada)
Production:   Main branch → main Render service + Secrets
```

---

## 🐛 Troubleshooting

### Database Connection Error
```bash
# Test connection
psql $DATABASE_URL

# Or dari Node.js
npm run db:push
```

### S3/R2 Upload Failed
```
1. Check AWS_ACCESS_KEY_ID & AWS_SECRET_ACCESS_KEY
2. Verify bucket name (AWS_S3_BUCKET)
3. For R2: Check AWS_S3_ENDPOINT format
4. Check IAM permissions (untuk AWS S3)
```

### GitHub Actions Failed
```
1. Check GitHub Secrets - pastikan semua ada
2. Check Render API Key & Service ID
3. View logs: GitHub Repo → Actions → Latest run
```

### Render Deploy Failed
```
1. Check logs: Render Dashboard → Service → Logs
2. Verify DATABASE_URL is correct
3. Check build command: npm run build
4. Verify start command: npm run start
```

---

## 📊 Monitoring & Health

### Render Health Check
- Endpoint: `/` (root)
- Interval: 30 detik
- Timeout: 30 detik

### Custom Health Check (Optional)
```typescript
app.get("/api/health", async (req, res) => {
  try {
    // Check database
    const result = await db.execute(sql`SELECT 1`);
    
    // Check S3/R2 connection
    // const files = await s3Storage.listFiles("health-check");
    
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: "connected",
      storage: "connected",
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      error: error.message,
    });
  }
});
```

---

## 💰 Cost Estimation (Per Bulan)

| Service | Plan | Cost |
|---------|------|------|
| Supabase | Free (up to 500MB) | $0 |
| Cloudflare R2 | 10GB free + $0.015/GB | $0-2 |
| Render | Free tier | $0 |
| GitHub Actions | Free tier (2000 min/bulan) | $0 |
| **Total** | **Minimal setup** | **~$0/month** |

Upgrade untuk production:
- Supabase Pro: $25/month
- Render Standard: $12/month
- Cloudflare R2: ~$5-10/month
- **Total Production**: ~$42/month

---

## 📚 Resources

- Supabase Docs: https://supabase.com/docs
- Cloudflare R2: https://developers.cloudflare.com/r2/
- AWS S3: https://docs.aws.amazon.com/s3/
- Render Docs: https://render.com/docs
- GitHub Actions: https://docs.github.com/en/actions

---

**Selesai! Aplikasi Anda sekarang deploy di multi-lokasi dengan resilience maksimal.**

# 🚀 Multi-Location Deployment Checklist

## Pre-Deployment

- [ ] Semua dependencies ter-install (`npm install`)
- [ ] Tests passing (`npm run check`)
- [ ] Build berhasil locally (`npm run build`)
- [ ] `.env` file tidak ter-commit (di `.gitignore`)
- [ ] Database backup sudah dibuat (untuk production)

---

## Supabase Setup

- [ ] Buat akun di https://supabase.com
- [ ] Buat project baru
- [ ] Copy CONNECTION STRING (PostgreSQL URL)
- [ ] Set `DATABASE_URL` environment variable

**Verifikasi:**
```bash
psql $DATABASE_URL -c "SELECT version();"
```

---

## Cloudflare R2 Setup (Recommended)

- [ ] Buat akun di https://cloudflare.com
- [ ] Navigate ke R2
- [ ] Create bucket: `giorgio-armani-storage`
- [ ] Generate API Token dengan permissions:
  - [ ] Object Read
  - [ ] Object Write
- [ ] Copy:
  - [ ] Access Key ID
  - [ ] Secret Access Key
  - [ ] S3 API Endpoint

**Atau AWS S3 Setup:**
- [ ] Buat akun AWS
- [ ] Create S3 bucket: `giorgio-armani-storage`
- [ ] Generate IAM Access Keys
- [ ] Copy:
  - [ ] Access Key ID
  - [ ] Secret Access Key

---

## Render.com Setup

- [ ] Sign up di https://render.com
- [ ] Connect GitHub account
- [ ] Deploy aplikasi:
  ```
  https://github.com/[your-username]/[repo] → Web Service
  ```
- [ ] Runtime: Node
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm run start`

**Environment Variables di Render Dashboard:**
- [ ] `DATABASE_URL` = (dari Supabase)
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `5000`
- [ ] `AWS_S3_BUCKET` = `giorgio-armani-storage`
- [ ] `AWS_ACCESS_KEY_ID` = (dari R2/S3)
- [ ] `AWS_SECRET_ACCESS_KEY` = (dari R2/S3)
- [ ] `AWS_REGION` = `auto` (R2) atau `us-east-1` (S3)
- [ ] `AWS_S3_ENDPOINT` = (untuk R2 saja)

**Trigger Deploy:**
- [ ] Push ke main branch, atau
- [ ] Manual deploy dari Render dashboard

---

## GitHub Actions Setup

- [ ] Go to: GitHub Repo → Settings → Secrets and variables → Actions

**Add Secrets:**
- [ ] `DATABASE_URL`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_S3_BUCKET`
- [ ] `AWS_REGION`
- [ ] `AWS_S3_ENDPOINT` (opsional, untuk R2)
- [ ] `RENDER_API_KEY`
- [ ] `RENDER_SERVICE_ID`
- [ ] `RENDER_APP_URL`

**Verifikasi GitHub Actions:**
- [ ] `.github/workflows/deploy.yml` ada di repo
- [ ] Push ke main branch
- [ ] Check: GitHub Repo → Actions → Latest workflow run

---

## Post-Deployment Verification

### 1. Check Render Deployment
```
- [ ] Buka: https://[app-name].onrender.com
- [ ] Verify: Home page loads
- [ ] Check status: Render dashboard shows "Live"
```

### 2. Check Application Health
```bash
- [ ] GET / → 200 OK
- [ ] GET /api/health → 200 OK (jika ada)
- [ ] GET /api/users → 200 OK (test auth jika perlu)
```

### 3. Check Database Connection
```
- [ ] Login: bisa access dashboard
- [ ] Query: data sudah sync dari seed database
- [ ] Update: coba create/update record
```

### 4. Check S3/R2 Upload
```
- [ ] Upload test file via API
- [ ] Verify: file ada di S3/R2 bucket
- [ ] URL: file bisa diakses public (jika set public)
```

### 5. Check GitHub Actions CI/CD
```
- [ ] Push ke main
- [ ] GitHub Actions workflow run otomatis
- [ ] Build success, deploy success
- [ ] Render automatically updated
```

---

## Traffic & Performance

### Monitor Render
- Buka: Render Dashboard → Service → Logs
- Filter: Liat access logs dan error logs
- Check: Response times, error rates

### Monitor Supabase
- Buka: Supabase Dashboard → Logs
- Filter: Database logs, API activity
- Check: Slow queries, connection issues

### Monitor S3/R2
- **CloudFlare R2**: Buka Dashboard → R2 → Storage → Analytics
- **AWS S3**: CloudWatch → S3 metrics

---

## Scaling & Optimization

### If traffic increasing:
1. **Render**: Upgrade plan dari Free → Starter ($7/month)
2. **Supabase**: Upgrade plan untuk compute power
3. **R2/S3**: Optimize dengan CDN (Cloudflare CDN)

### Add CDN:
```
1. Render: Bisa ubah URL ke custom domain
2. Cloudflare: CNAME pointing ke Render
3. Benefits: Global caching, DDoS protection
```

---

## Troubleshooting

### Build Failed
```
1. Check logs: Render → Logs
2. Verify: DATABASE_URL adalah valid
3. Verify: All dependencies di package.json
4. Try: npm run check (TypeScript errors)
5. Try: npm run build (locally)
```

### Application Crashed
```
1. Check logs: Render → Logs (red messages)
2. Common causes:
   - Missing env variable
   - Database connection error
   - Port already in use
   - Out of memory
3. Restart: Render dashboard → Manual restart
```

### S3/R2 Upload Failed
```
1. Verify: AWS credentials (access key, secret key)
2. Verify: Bucket name correct
3. Verify: Bucket permissions (public or private)
4. Verify: File size < 10MB
5. Check IAM policy (untuk AWS S3)
```

### GitHub Actions Failed
```
1. Check: GitHub Actions logs
2. Verify: All secrets ada
3. Verify: Render API Key valid
4. Verify: Service ID correct
5. Try: Manual trigger workflow
```

---

## Security Checklist

- [ ] `.env` file di `.gitignore`
- [ ] No secrets dalam Git history
- [ ] GitHub Secrets setup untuk semua credentials
- [ ] 2FA enabled pada: GitHub, Render, Supabase, Cloudflare, AWS
- [ ] Database backup enabled (Supabase auto-backup)
- [ ] IP whitelisting (jika diperlukan)
- [ ] HTTPS/SSL enabled (Render auto-SSL)
- [ ] CORS configured properly
- [ ] API rate limiting implemented (optional)
- [ ] Input validation implemented

---

## Monitoring & Alerts

### Setup Alerting (Optional):
- [ ] Render: Email notifications untuk service crashes
- [ ] Supabase: Email alerts untuk quota limits
- [ ] Cloudflare: Alert untuk high bandwidth usage

### Daily Checks:
- [ ] Application is running (`curl https://app-url`)
- [ ] Database responsive (check query logs)
- [ ] S3/R2 storage accessible
- [ ] No error spikes in logs

---

## Backup & Disaster Recovery

### Database Backup:
- Supabase: Auto-backup setiap hari
- Manual backup:
  ```bash
  pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
  ```

### Application Rollback:
- Render: Keep previous build (3 most recent)
- GitHub: Revert commit → automatic re-deploy
- Manual: `git revert <commit-hash>`

---

## Success Criteria ✅

Deployment sukses jika:
- ✅ Application running di Render
- ✅ Database connected ke Supabase
- ✅ File uploads working ke S3/R2
- ✅ GitHub Actions CI/CD automated
- ✅ All API endpoints responding
- ✅ No errors in logs
- ✅ Team can access dashboard
- ✅ Backup strategy in place

---

**Deployment selesai! Aplikasi Anda sudah live dengan multi-location architecture. 🎉**

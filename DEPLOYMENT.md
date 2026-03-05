# Deployment Pipeline Guide

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- GitHub account with Actions enabled
- Render.com account (for backend deployment)
- Vercel account (optional, for frontend preview)
- kubectl (for Kubernetes deployment)

## Environment Setup

### 1. Local Development
```bash
# Copy environment template
cp .env.example .env.local

# Start with Docker Compose
docker compose up -d

# Run migrations
npm run db:push

# Start development
npm run dev
```

### 2. GitHub Actions Secrets

Add these secrets to your GitHub repository (Settings → Secrets and variables → Actions):

**Required:**
- `RENDER_API_KEY` - Your Render API key
- `RENDER_SERVICE_ID` - Your Render service ID

**Optional:**
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_ORG_ID` - Vercel organization ID
- `VERCEL_PROJECT_ID` - Vercel project ID
- `SLACK_WEBHOOK` - For deployment notifications

## Deployment Targets

### Option 1: Render (Recommended for Simplicity)
- Configuration: `render.yaml`
- Deployment: Automatic on push to main
- Environment variables set in Render dashboard

Steps:
1. Connect GitHub repository to Render
2. Create Web Service from repository
3. Set DATABASE_URL and other env vars
4. Enable auto-deploy on push

### Option 2: Docker & Docker Compose
- Configuration: `Dockerfile` and `docker-compose.yml`
- Use for staging or self-hosted deployments

```bash
# Build and deploy
docker compose up -d

# View logs
docker compose logs -f app

# Stop
docker compose down
```

### Option 3: Kubernetes (Production-Grade)
- Configuration: `k8s/deployment.yaml`
- Recommended for large-scale deployments

Steps:
1. Create Docker image: `docker build -t app:latest .`
2. Push to registry: `docker push ghcr.io/your-org/app:latest`
3. Create secrets: `kubectl create secret generic app-secrets --from-literal=database-url=$DATABASE_URL`
4. Deploy: `kubectl apply -f k8s/deployment.yaml`

## CI/CD Pipeline Flow

```
GitHub Push (main branch)
    ↓
[Test Stage] - Run tests, type check, build
    ↓
[Build Stage] - Build Docker image, push to registry
    ↓
[Deploy to Render] - Trigger Render deployment
    ↓
[Deploy to Vercel] - Optional frontend deployment
    ↓
[Notify] - Send deployment status
```

## Branch Strategy

- **main**: Production-ready code, auto-deploys
- **develop**: Staging/testing, manual review
- **feature/***: Feature branches, run tests only

## Health Checks

Both Docker and Kubernetes configurations include health checks:

```bash
# Check if app is running
curl http://localhost:5000/health

# Check if app is ready to serve traffic
curl http://localhost:5000/ready
```

Make sure your Express app implements these endpoints:

```typescript
// server/index.ts
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/ready', (req, res) => {
  // Check database connection, etc.
  res.json({ status: 'ready' });
});
```

## Monitoring & Logs

### Render
```bash
# View logs in Render dashboard
# Settings → Logs
```

### Docker Compose
```bash
docker compose logs -f app
docker compose logs -f postgres
```

### Kubernetes
```bash
# View pod logs
kubectl logs -f deployment/app-deployment

# Check pod status
kubectl get pods -l app=app

# Describe deployment
kubectl describe deployment app-deployment
```

## Scaling

### Docker Compose
```bash
# Scale to 3 instances
docker compose up -d --scale app=3
```

### Kubernetes
```bash
# Scale manually
kubectl scale deployment app-deployment --replicas=5

# Auto-scaling is configured via HPA (3-10 replicas)
kubectl get hpa
```

## Rollback

### Render
- Use Render dashboard to select previous deployment

### Kubernetes
```bash
# View rollout history
kubectl rollout history deployment/app-deployment

# Rollback to previous version
kubectl rollout undo deployment/app-deployment
```

## Database Migrations

### Before Deployment
```bash
npm run db:push
```

### In Render
- Add `npm run db:push` as pre-deploy hook in settings

### In Kubernetes
```bash
# Run migration as init container or job before deployment
kubectl create job db-migration --image=your-image -- npm run db:push
```

## Troubleshooting

### Container won't start
```bash
docker compose logs app
# Check DATABASE_URL and NODE_ENV are set
```

### Database connection fails
```bash
# Verify postgres is running
docker compose ps postgres

# Test connection
docker compose exec postgres psql -U user -d app_db
```

### Deployment stuck
```bash
# Render: Check deployment logs in dashboard
# Kubernetes: kubectl describe pod <pod-name>
# Docker: docker compose down && docker compose up -d
```

## Security Best Practices

1. **Environment Variables**: Never commit `.env` files
2. **Secrets Management**: Use service provider secrets UI
3. **Images**: Use minimal base images (node:20-slim, alpine)
4. **Health Checks**: Implement /health and /ready endpoints
5. **Resource Limits**: Set CPU/memory limits in Kubernetes
6. **Non-root User**: Run containers as non-root user
7. **Read-only Filesystem**: Use read-only root filesystem where possible

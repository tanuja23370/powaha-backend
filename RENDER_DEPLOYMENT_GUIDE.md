# Render Deployment Configuration Guide

## ✅ Configuration Checklist

### 1. Environment Configuration (Render Dashboard)

#### DATABASE_URL Format
Your `DATABASE_URL` environment variable in Render **must** follow this exact format:

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public
```

**Important Notes:**
- Use the **External Connection String** from your Render PostgreSQL database dashboard
- Do NOT use the Internal Connection String (that's only for services within Render's network)
- The connection string should look like: `postgresql://mydb_user:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/mydb_xxxx?schema=public`

**Steps to Configure:**
1. Go to your Render Dashboard → PostgreSQL Database
2. Copy the **External Database URL**
3. Navigate to your Web Service → Environment
4. Add/Update environment variable: `DATABASE_URL` = [paste the External URL]
5. Append `?schema=public` if not already present
6. **Optional but Recommended:** Add `&connection_limit=5` for better connection management

**Recommended DATABASE_URL with connection pooling:**
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&connection_limit=5
```

---

### 2. ✅ Prisma Schema Verification

Your `prisma/schema.prisma` is **correctly configured**:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

✅ This correctly pulls from the environment variable, not a local `.env` file.

---

### 3. ✅ Deployment Scripts (package.json)

The following scripts have been added to automatically sync Prisma on deployment:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && prisma migrate deploy"
  }
}
```

**What they do:**
- `postinstall`: Automatically runs after `npm install` to generate Prisma Client
- `build`: Generates Prisma Client and applies pending migrations to production database

**Render Build Command:**
Set your Render build command to:
```
npm install && npm run build
```

**Render Start Command:**
```
npm start
```

---

### 4. Connection Pooling & Timeout Prevention

#### Option A: Connection Limit Parameter (Recommended)
Add to your `DATABASE_URL`:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&connection_limit=5
```

#### Option B: PgBouncer (Advanced)
If you have a paid Render PostgreSQL plan with PgBouncer enabled:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public&pgbouncer=true&connection_limit=1
```

**Note:** Free tier Render databases don't support PgBouncer. Use connection_limit instead.

#### Additional Prisma Configuration (Optional)
Create a `prisma/schema.prisma` with connection pooling settings:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL") // Optional for development
}
```

---

### 5. ✅ Health Check Endpoint

A health check endpoint has been created at:
```
GET /health
```

**Responses:**

**Success (200):**
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2026-01-23T10:30:00.000Z",
  "message": "Server and database are operational"
}
```

**Failure (503):**
```json
{
  "status": "unhealthy",
  "database": "disconnected",
  "timestamp": "2026-01-23T10:30:00.000Z",
  "message": "Database connection failed. Server is under maintenance.",
  "error": "Error message details"
}
```

#### Using Health Check in Frontend

Add this to your mobile app's API service:

```typescript
// services/api.ts
export const checkServerHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.status !== 'healthy') {
      return {
        isHealthy: false,
        message: data.message || 'Server is under maintenance'
      };
    }
    
    return { isHealthy: true };
  } catch (error) {
    return {
      isHealthy: false,
      message: 'Unable to reach server. Please check your connection.'
    };
  }
};
```

---

## 🚀 Deployment Steps

### First Time Deployment

1. **Create PostgreSQL Database on Render**
   - Go to Render Dashboard → New → PostgreSQL
   - Note down the External Connection String

2. **Create Web Service on Render**
   - Connect your GitHub repository
   - Select `powaha-backend` as root directory
   - Set **Build Command**: `npm install && npm run build`
   - Set **Start Command**: `npm start`

3. **Configure Environment Variables**
   - Add `DATABASE_URL` with your PostgreSQL External Connection String
   - Add any other required variables (PORT is auto-set by Render)

4. **Deploy**
   - Click "Create Web Service"
   - Render will automatically build and deploy

### Subsequent Deployments

Every git push to your main branch will:
1. Trigger automatic rebuild
2. Run `npm install`
3. Execute `npm run build` (generates Prisma Client + runs migrations)
4. Start the server with `npm start`

---

## 🧪 Testing Your Deployment

### 1. Test Health Endpoint
```bash
curl https://your-app.onrender.com/health
```

Expected: `{"status":"healthy","database":"connected",...}`

### 2. Test Basic Route
```bash
curl https://your-app.onrender.com/
```

Expected: `Backend is running 🚀`

### 3. Check Render Logs
- Go to Render Dashboard → Your Service → Logs
- Look for: "Server running on port XXXX"
- Check for any Prisma connection errors

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"

**Solutions:**
1. Verify DATABASE_URL is the **External** connection string
2. Ensure database is not paused (free tier databases pause after inactivity)
3. Check connection limit: Add `?connection_limit=5` to DATABASE_URL
4. Verify schema exists: Add `?schema=public` to DATABASE_URL

### Issue: "Prisma Client not generated"

**Solutions:**
1. Ensure `postinstall` script is in package.json
2. Check Render build logs for errors during `prisma generate`
3. Manually trigger: Add `prisma generate` to your build command

### Issue: "Migrations not applied"

**Solutions:**
1. Run build command: `npm run build`
2. Check Render build logs for migration errors
3. Verify migrations folder is committed to git
4. For first deployment, you may need to run `prisma db push` manually

### Issue: Free Database Pauses

**Solutions:**
1. Keep database active with health checks every 5-10 minutes (use a service like UptimeRobot)
2. Upgrade to paid plan for persistent database
3. Accept 30-60 second cold start on first request

---

## 📋 Environment Variables Summary

Required in Render:
- `DATABASE_URL`: PostgreSQL connection string with `?schema=public&connection_limit=5`

Optional (auto-set by Render):
- `PORT`: Automatically set by Render
- `NODE_ENV`: Set to "production" for production builds

---

## 🎯 Best Practices

1. **Always use External Connection String** for DATABASE_URL
2. **Add connection_limit=5** to prevent connection exhaustion
3. **Monitor health endpoint** from frontend before making requests
4. **Use Render's auto-deploy** feature for CI/CD
5. **Check logs regularly** for database connection issues
6. **Commit migrations** to version control before deploying

---

## 📱 Frontend Integration

To display maintenance messages in your mobile app:

```typescript
// Before making API calls
const health = await checkServerHealth();

if (!health.isHealthy) {
  Alert.alert(
    'Server Maintenance',
    health.message,
    [{ text: 'OK' }]
  );
  return;
}

// Proceed with normal API calls
```

---

## ✅ Verification Checklist

- [ ] DATABASE_URL set in Render environment variables
- [ ] DATABASE_URL uses External Connection String
- [ ] DATABASE_URL includes `?schema=public`
- [ ] DATABASE_URL includes `&connection_limit=5`
- [ ] Build command: `npm install && npm run build`
- [ ] Start command: `npm start`
- [ ] Migrations folder committed to git
- [ ] Health endpoint returns 200 status
- [ ] Frontend can call `/health` endpoint

---

Your backend is now configured for production deployment on Render! 🎉

# Vercel Environment Variables Setup

## Required Environment Variables

Add these environment variables in your Vercel project settings:

### 1. MongoDB Connection (Required)
```
MONGODB_URI=mongodb+srv://pawan:tfiqYEbtHnS58mSv@cluster0.mdvnyxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```
**OR** use:
```
MONGODB_URI_TEST=mongodb+srv://pawan:tfiqYEbtHnS58mSv@cluster0.mdvnyxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

### 2. Database Name (Optional)
```
MONGODB_DB_NAME=test
```

### 3. Node Environment (Recommended)
```
NODE_ENV=production
```

## Optional Environment Variables

### CORS Configuration (if needed for frontend)
```
CORS_ORIGIN=https://your-frontend-domain.com
```
**OR** for multiple origins:
```
CORS_ORIGINS=https://domain1.com,https://domain2.com
```

## How to Add in Vercel

1. Go to your Vercel project dashboard
2. Click on **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - **Environment**: Select `Production`, `Preview`, and `Development` as needed
4. Click **Save**
5. Redeploy your application

## Important Notes

- **PORT**: Vercel automatically sets the PORT variable - you don't need to set it
- **NODE_ENV**: Vercel sets this to "production" automatically, but you can override it
- Make sure to add the MongoDB URI for all environments (Production, Preview, Development) if you want them to work in all environments
- Never commit your `.env` file with real credentials to Git

## Quick Setup Checklist

- [ ] Add `MONGODB_URI` with your MongoDB connection string
- [ ] Add `MONGODB_DB_NAME` if you want to specify a database name
- [ ] Add `CORS_ORIGIN` if you have a frontend that needs to access the API
- [ ] Redeploy after adding environment variables


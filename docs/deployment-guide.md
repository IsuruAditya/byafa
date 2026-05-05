# Deployment Guide

## Overview

The project supports two deployment targets:

| Target | Backend | Frontend |
|--------|---------|----------|
| **Render** (recommended) | Node.js Web Service | Static Site |
| **Vercel** | Serverless Functions | Static Site |

---

## Render Deployment (Recommended)

Render is recommended because it supports persistent connections, which enables Socket.io real-time features in a future upgrade.

### Prerequisites

1. A [Render](https://render.com) account
2. Your repository pushed to GitHub

### Steps

1. **Connect repository** — In Render dashboard, click "New" → "Blueprint" and connect your GitHub repo. Render will detect `render.yaml` automatically.

2. **Set environment variables** — After the services are created, set these in the Render dashboard for the backend service:

   | Variable | Description |
   |----------|-------------|
   | `MONGO_URI` | MongoDB Atlas connection string |
   | `JWT_SECRET` | Random 64-char string |
   | `JWT_REFRESH_SECRET` | Different random 64-char string |
   | `CLIENT_URL` | Your frontend Render URL (e.g. `https://byafa.onrender.com`) |
   | `STRIPE_SECRET_KEY` | Stripe secret key (`sk_test_...` or `sk_live_...`) |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret (`whsec_...`) |
   | `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | Cloudinary API secret |
   | `EMAIL_USER` | Gmail address |
   | `EMAIL_PASS` | Gmail App Password |

   For the frontend service:

   | Variable | Description |
   |----------|-------------|
   | `VITE_API_URL` | Backend URL + `/api/v1` (e.g. `https://byafa-api.onrender.com/api/v1`) |
   | `VITE_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key (`pk_test_...`) |

3. **Configure Stripe webhook** — In the Stripe dashboard:
   - Go to Developers → Webhooks → Add endpoint
   - URL: `https://your-backend.onrender.com/api/v1/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`
   - Copy the signing secret and set it as `STRIPE_WEBHOOK_SECRET`

4. **Deploy** — Push to `main` branch. Render auto-deploys on every push.

---

## Vercel Deployment

### Prerequisites

1. [Vercel CLI](https://vercel.com/cli): `npm i -g vercel`
2. Vercel account

### Steps

1. **Deploy from project root:**
   ```bash
   vercel
   ```

2. **Set environment variables** in Vercel dashboard (same as Render above).

3. **Configure `vercel.json`** — The backend's `vercel.json` routes all `/api/*` requests to the serverless function. The `api/index.ts` file is the entry point.

> **Note:** Vercel serverless functions have a 10-second timeout on the free plan. Socket.io real-time features require a persistent server — use Render for those.

---

## MongoDB Atlas Setup

1. Create a free M0 cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a database user with read/write access
3. Whitelist `0.0.0.0/0` (all IPs) for Render/Vercel deployments
4. Copy the connection string and set it as `MONGO_URI`

---

## Cloudinary Setup

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Copy your Cloud Name, API Key, and API Secret from the dashboard
3. Set the three `CLOUDINARY_*` environment variables

---

## Gmail SMTP Setup

1. Enable 2-Factor Authentication on your Google account
2. Go to Google Account → Security → App Passwords
3. Create an App Password for "Mail"
4. Use your Gmail address as `EMAIL_USER` and the App Password as `EMAIL_PASS`

---

## Seeding Production Data

After deploying, run the seed script to populate products and create the admin user:

```bash
# Set MONGO_URI to your production Atlas URI first
cd backend
MONGO_URI=mongodb+srv://... npm run seed
```

**Default admin credentials:**
- Email: `admin@simple-ecommerce.dev`
- Password: `Admin1234!`

> **Important:** Change the admin password immediately after first login in production.

---

## Health Check

Verify the deployment is working:

```bash
curl https://your-backend.onrender.com/api/v1/health
# Expected: { "success": true, "message": "OK" }
```

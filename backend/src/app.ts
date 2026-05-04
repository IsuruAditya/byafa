import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { connectDB } from './config/db'
import { errorMiddleware } from './api/middleware/error.middleware'
import authRouter from './api/routes/auth.routes'
import adminRouter from './api/routes/admin.routes'
import productRouter from './api/routes/product.routes'
import orderRouter from './api/routes/order.routes'
import reviewRouter from './api/routes/review.routes'
import webhookRouter from './api/routes/webhook.routes'

const app = express()

// Security middleware
app.use(helmet())

// CORS — in dev accept both :5173 and :5174 (Vite picks whichever is free)
// In production only the configured CLIENT_URL is allowed
const devOrigins = ['http://localhost:5173', 'http://localhost:5174']

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. curl, Postman)
      if (!origin) return callback(null, true)
      if (env.NODE_ENV === 'development' && devOrigins.includes(origin)) {
        return callback(null, true)
      }
      if (origin === env.CLIENT_URL) return callback(null, true)
      callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  })
)

// ── Webhook routes — MUST be before express.json() ──────────────────────────
// Stripe signature verification requires the raw request body.
// express.json() would parse and discard it before we can verify.
app.use('/api/v1/webhooks', webhookRouter)

// Body parsers — applied after webhook routes
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Cookie parser — needed for httpOnly refresh token
app.use(cookieParser())

// Health check — also verifies DB connectivity
app.get('/api/v1/health', async (_req, res) => {
  try {
    await connectDB()
    res.json({ success: true, message: 'OK' })
  } catch {
    res.status(503).json({ success: false, message: 'Database unavailable' })
  }
})

// ── SEO ──────────────────────────────────────────────────────────────────────

app.get('/robots.txt', (_req, res) => {
  res.type('text/plain')
  res.send(
    `User-agent: *\nAllow: /\nSitemap: ${env.CLIENT_URL}/sitemap.xml`
  )
})

app.get('/sitemap.xml', async (_req, res) => {
  try {
    const { Product } = await import('./models/Product.model')
    const products = await Product.find({}, '_id updatedAt').lean()

    const productUrls = products
      .map(
        (p) =>
          `  <url>\n    <loc>${env.CLIENT_URL}/products/${p._id as string}</loc>\n    <lastmod>${new Date(p.updatedAt).toISOString().split('T')[0]}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>`
      )
      .join('\n')

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${env.CLIENT_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${env.CLIENT_URL}/products</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${productUrls}
</urlset>`

    res.type('application/xml')
    res.send(xml)
  } catch {
    res.status(500).send('Failed to generate sitemap')
  }
})

// Feature routers
app.use('/api/v1/auth', authRouter)
app.use('/api/v1/admin', adminRouter)
app.use('/api/v1/products', productRouter)
app.use('/api/v1/orders', orderRouter)
app.use('/api/v1/reviews', reviewRouter)

// Centralized error handler — must be last
app.use(errorMiddleware)

export default app

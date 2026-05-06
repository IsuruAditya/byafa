import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    // In test mode, mongodb-memory-server provides the URI at runtime —
    // don't exit, just warn. In production/development, exit immediately.
    if (process.env['NODE_ENV'] === 'test') {
      console.warn(`⚠️  Test env: ${envVar} not set — will be provided at runtime`)
    } else {
      console.error(`❌ Missing required environment variable: ${envVar}`)
      process.exit(1)
    }
  }
}

// Warn about optional but important env vars that affect functionality
const optionalEnvVars: Array<{ key: string; feature: string }> = [
  { key: 'STRIPE_SECRET_KEY',      feature: 'Stripe payments' },
  { key: 'STRIPE_WEBHOOK_SECRET',  feature: 'Stripe webhook verification' },
  { key: 'CLOUDINARY_CLOUD_NAME',  feature: 'Cloudinary image uploads' },
  { key: 'CLOUDINARY_API_KEY',     feature: 'Cloudinary image uploads' },
  { key: 'CLOUDINARY_API_SECRET',  feature: 'Cloudinary image uploads' },
  { key: 'EMAIL_USER',             feature: 'Transactional emails' },
  { key: 'EMAIL_PASS',             feature: 'Transactional emails' },
]

for (const { key, feature } of optionalEnvVars) {
  if (!process.env[key]) {
    console.warn(`⚠️  Missing optional env var: ${key} — ${feature} will be disabled`)
  }
}

export const env = {
  NODE_ENV: process.env['NODE_ENV'] ?? 'development',
  PORT: parseInt(process.env['PORT'] ?? '5000', 10),
  MONGO_URI: process.env['MONGO_URI'] as string,
  JWT_SECRET: process.env['JWT_SECRET'] as string,
  JWT_REFRESH_SECRET: process.env['JWT_REFRESH_SECRET'] as string,
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] ?? '15m',
  JWT_REFRESH_EXPIRES_IN: process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d',
  CLIENT_URL: process.env['CLIENT_URL'] ?? 'http://localhost:5173',
  STRIPE_SECRET_KEY: process.env['STRIPE_SECRET_KEY'] ?? '',
  STRIPE_WEBHOOK_SECRET: process.env['STRIPE_WEBHOOK_SECRET'] ?? '',
  CLOUDINARY_CLOUD_NAME: process.env['CLOUDINARY_CLOUD_NAME'] ?? '',
  CLOUDINARY_API_KEY: process.env['CLOUDINARY_API_KEY'] ?? '',
  CLOUDINARY_API_SECRET: process.env['CLOUDINARY_API_SECRET'] ?? '',
  EMAIL_USER: process.env['EMAIL_USER'] ?? '',
  EMAIL_PASS: process.env['EMAIL_PASS'] ?? '',
  // Derived
  IS_PRODUCTION: process.env['NODE_ENV'] === 'production',
  IS_DEVELOPMENT: process.env['NODE_ENV'] === 'development',
  IS_TEST: process.env['NODE_ENV'] === 'test',
}

import dotenv from 'dotenv'

dotenv.config()

const requiredEnvVars = ['MONGO_URI', 'JWT_SECRET', 'JWT_REFRESH_SECRET'] as const

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`)
    process.exit(1)
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
}

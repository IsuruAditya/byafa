import mongoose from 'mongoose'
import dns from 'dns'
import { env } from './env'

// On Windows, the default DNS resolver often fails to resolve MongoDB Atlas
// SRV records. Force Node to use Google's public DNS as a fallback.
dns.setDefaultResultOrder('ipv4first')
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])

// Cache the connection across serverless function invocations.
// On a persistent server this is a no-op; on Vercel it prevents
// a new connection being opened on every cold-start request.
let cached: typeof mongoose | null = null

export async function connectDB(): Promise<typeof mongoose> {
  if (cached) {
    return cached
  }

  try {
    const connection = await mongoose.connect(env.MONGO_URI, {
      // Recommended settings for serverless environments
      bufferCommands: false,
      maxPoolSize: 10,
    })

    cached = connection
    console.log(`✅ MongoDB connected: ${connection.connection.host}`)
    return connection
  } catch (error) {
    console.error('❌ MongoDB connection error:', error)
    process.exit(1)
  }
}

/**
 * Seed script — fetches real-world product data from dummyjson.com
 * and populates the database with it, plus creates an admin user.
 *
 * Usage (from backend/):
 *   npm run seed
 *
 * Safe to re-run: clears existing products and admin user before inserting.
 */

import dotenv from 'dotenv'
dotenv.config()

import mongoose from 'mongoose'
import https from 'https'
import { connectDB } from '../config/db'
import { Product } from '../models/Product.model'
import { User } from '../models/User.model'

const ADMIN_EMAIL    = 'admin@simple-ecommerce.dev'
const ADMIN_PASSWORD = 'Admin1234!'

// Map dummyjson categories to our simplified category set
const CATEGORY_MAP: Record<string, string> = {
  'smartphones':            'electronics',
  'laptops':                'electronics',
  'tablets':                'electronics',
  'mobile-accessories':     'electronics',
  'mens-shirts':            'clothing',
  'mens-shoes':             'clothing',
  'mens-watches':           'clothing',
  'womens-bags':            'clothing',
  'womens-dresses':         'clothing',
  'womens-jewellery':       'clothing',
  'womens-shoes':           'clothing',
  'womens-watches':         'clothing',
  'sunglasses':             'clothing',
  'tops':                   'clothing',
  'skin-care':              'home',
  'fragrances':             'home',
  'home-decoration':        'home',
  'furniture':              'home',
  'kitchen-accessories':    'home',
  'groceries':              'home',
  'sports-accessories':     'sports',
  'vehicle':                'sports',
  'motorcycle':             'sports',
  'beauty':                 'home',
  'books':                  'books',
}

interface DummyProduct {
  id: number
  title: string
  description: string
  price: number
  discountPercentage: number
  rating: number
  stock: number
  category: string
  thumbnail: string
  images: string[]
  reviews?: Array<{ rating: number }>
}

function fetchJson<T>(url: string): Promise<T> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk: string) => { data += chunk })
      res.on('end', () => {
        try { resolve(JSON.parse(data) as T) }
        catch (e) { reject(e) }
      })
    }).on('error', reject)
  })
}

async function seed() {
  try {
    await connectDB()
    console.log('🌱 Starting seed...')

    // ── Fetch from dummyjson ──────────────────────────────────────────────
    console.log('  ⬇  Fetching products from dummyjson.com...')
    const { products: raw } = await fetchJson<{ products: DummyProduct[] }>(
      'https://dummyjson.com/products?limit=100&select=id,title,description,price,rating,stock,category,thumbnail,images'
    )
    console.log(`  ✓ Fetched ${raw.length} products`)

    // ── Clear existing data ───────────────────────────────────────────────
    await Product.deleteMany({})
    console.log('  ✓ Cleared products')

    await User.deleteOne({ email: ADMIN_EMAIL })
    console.log('  ✓ Cleared existing admin user')

    // ── Transform and insert products ─────────────────────────────────────
    const docs = raw.map((p) => ({
      name:          p.title,
      description:   p.description,
      price:         Math.round(p.price * 100) / 100,
      images:        p.images.length > 0 ? p.images : [p.thumbnail],
      category:      CATEGORY_MAP[p.category] ?? 'home',
      stockQuantity: p.stock,
      ratings: {
        average: Math.round(p.rating * 10) / 10,
        count:   p.reviews?.length ?? Math.floor(Math.random() * 200) + 10,
      },
    }))

    const inserted = await Product.insertMany(docs)
    console.log(`  ✓ Inserted ${inserted.length} products`)

    // ── Create admin user ─────────────────────────────────────────────────
    await User.create({
      name:     'Admin',
      email:    ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role:     'admin',
    })
    console.log(`  ✓ Created admin user: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`)

    console.log('✅ Seed complete')
  } catch (err) {
    console.error('❌ Seed failed:', err)
    process.exit(1)
  } finally {
    await mongoose.disconnect()
  }
}

void seed()

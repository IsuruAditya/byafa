import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env'

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key:    env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
})

/**
 * Uploads a file buffer to Cloudinary under the products/ folder.
 * Returns the secure HTTPS URL of the uploaded image.
 */
export async function uploadProductImage(
  buffer: Buffer,
  originalName: string
): Promise<string> {
  return new Promise((resolve, reject) => {
    const publicId = `products/${Date.now()}-${originalName.replace(/\.[^.]+$/, '')}`

    cloudinary.uploader
      .upload_stream(
        {
          public_id: publicId,
          folder: 'simple-ecommerce',
          transformation: [
            { width: 800, height: 600, crop: 'limit' }, // cap dimensions
            { fetch_format: 'auto', quality: 'auto' },   // WebP + auto quality
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error ?? new Error('Upload failed'))
          resolve(result.secure_url)
        }
      )
      .end(buffer)
  })
}

/**
 * Deletes an image from Cloudinary by its URL.
 * Extracts the public_id from the URL — safe to call even if URL is invalid.
 */
export async function deleteProductImage(url: string): Promise<void> {
  try {
    // Extract public_id from URL: .../simple-ecommerce/products/123-name
    const match = url.match(/\/simple-ecommerce\/(.+?)(?:\.[a-z]+)?$/)
    if (!match) return
    await cloudinary.uploader.destroy(`simple-ecommerce/${match[1]}`)
  } catch {
    // Non-critical — log but don't throw
    console.warn('Failed to delete Cloudinary image:', url)
  }
}

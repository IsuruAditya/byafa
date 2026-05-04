/**
 * Transforms a Cloudinary URL to serve an optimised variant.
 * If the URL is not from Cloudinary, returns it unchanged.
 *
 * Cloudinary transformation docs:
 * https://cloudinary.com/documentation/transformation_reference
 */
export function cloudinaryThumb(url: string, width = 400, height = 300): string {
  if (!url.includes('res.cloudinary.com')) return url
  // Insert transformation before /upload/
  return url.replace(
    '/upload/',
    `/upload/w_${width},h_${height},c_fill,f_auto,q_auto/`
  )
}

export function cloudinaryFull(url: string, width = 800): string {
  if (!url.includes('res.cloudinary.com')) return url
  return url.replace(
    '/upload/',
    `/upload/w_${width},c_limit,f_auto,q_auto/`
  )
}

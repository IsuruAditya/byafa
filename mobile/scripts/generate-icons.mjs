import sharp from 'sharp'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root       = path.join(__dirname, '..')
const LOGO_SRC   = path.join(root, '../frontend/public/logo.png')
const ASSETS_DIR = path.join(root, 'assets')

const GREEN = { r: 5,   g: 150, b: 105, alpha: 1 }  // #059669
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 }

/**
 * Convert a transparent-background logo to solid white pixels (keep alpha).
 * Works by: fill a white rect, then use the original logo as a mask.
 * Result: every visible pixel becomes white, transparent stays transparent.
 */
async function makeWhiteLogo(src, size) {
  const logoSize = size

  // Resize original to get the alpha mask
  const original = await sharp(src)
    .resize(logoSize, logoSize, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true })

  const { width, height, channels } = original.info
  const data = original.data

  // Replace every RGB value with 255 (white), keep alpha unchanged
  for (let i = 0; i < data.length; i += channels) {
    if (data[i + 3] > 0) {   // only touch non-transparent pixels
      data[i]     = 255       // R
      data[i + 1] = 255       // G
      data[i + 2] = 255       // B
      // alpha (data[i+3]) stays as-is
    }
  }

  return { buffer: await sharp(data, { raw: { width, height, channels } }).png().toBuffer(), width, height }
}

/**
 * Composite a logo centered on a solid-color canvas.
 */
async function makeIcon(src, canvasSize, scale, bg, whiteLogoMode, outputPath) {
  const logoMaxSize = Math.round(canvasSize * scale)

  let logoBuffer, lw, lh

  if (whiteLogoMode) {
    // Make logo white first, then resize
    const resized = await sharp(src)
      .resize(logoMaxSize, logoMaxSize, { fit: 'inside' })
      .toBuffer()
    const { buffer, width, height } = await makeWhiteLogo(resized, logoMaxSize)
    logoBuffer = buffer
    lw = width
    lh = height
  } else {
    // Natural logo colors
    logoBuffer = await sharp(src)
      .resize(logoMaxSize, logoMaxSize, { fit: 'inside' })
      .toBuffer()
    const meta = await sharp(logoBuffer).metadata()
    lw = meta.width
    lh = meta.height
  }

  const left = Math.round((canvasSize - lw) / 2)
  const top  = Math.round((canvasSize - lh) / 2)

  await sharp({ create: { width: canvasSize, height: canvasSize, channels: 4, background: bg } })
    .composite([{ input: logoBuffer, left, top }])
    .png()
    .toFile(outputPath)

  console.log(`  ✓  ${path.basename(outputPath).padEnd(22)} ${canvasSize}×${canvasSize}`)
}

async function main() {
  console.log('\n🎨  Generating Byafa app icons\n')

  // App icon — white background, natural logo colors
  await makeIcon(LOGO_SRC, 1024, 0.58, WHITE, false,
    path.join(ASSETS_DIR, 'icon.png'))

  // Android adaptive icon — white bg, smaller (Android crops to circle/squircle)
  await makeIcon(LOGO_SRC, 1024, 0.46, WHITE, false,
    path.join(ASSETS_DIR, 'adaptive-icon.png'))

  // Splash screen — brand green bg, TRUE WHITE logo (pixel-level replacement)
  await makeIcon(LOGO_SRC, 512, 0.52, GREEN, true,
    path.join(ASSETS_DIR, 'splash-icon.png'))

  // Web favicon — white bg
  await makeIcon(LOGO_SRC, 48, 0.72, WHITE, false,
    path.join(ASSETS_DIR, 'favicon.png'))

  console.log('\n  App icon:    white background + natural logo colors')
  console.log('  Splash:      emerald green background + pure white logo')
  console.log('\n✅  Done — mobile/assets/ updated\n')
}

main().catch(err => { console.error('❌', err.message); process.exit(1) })

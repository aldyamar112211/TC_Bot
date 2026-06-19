import sharp from 'sharp'
import { createHash } from 'crypto'
import { readdirSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCAM_DIR = join(__dirname, '../assets/scam')
const THRESHOLD = 10 // makin kecil makin ketat

// Generate pHash dari buffer gambar
async function pHash(buffer) {
  // Resize ke 8x8 grayscale, flatten ke array pixel
  const resized = await sharp(buffer)
    .resize(8, 8, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer()

  const pixels = [...resized]
  const avg = pixels.reduce((a, b) => a + b, 0) / pixels.length
  return pixels.map(p => p > avg ? '1' : '0').join('')
}

function hammingDistance(a, b) {
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) dist++
  }
  return dist
}

// Load semua hash dari folder scam saat startup
let scamHashes = []

export async function loadScamHashes() {
  const files = readdirSync(SCAM_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  scamHashes = []
  for (const file of files) {
    const buf = readFileSync(join(SCAM_DIR, file))
    const hash = await pHash(buf).catch(() => null)
    if (hash) scamHashes.push({ file, hash })
  }
}

export async function isScamImage(url) {
  if (scamHashes.length === 0) return false

  try {
    const res = await fetch(url)
    const buf = Buffer.from(await res.arrayBuffer())
    const hash = await pHash(buf)

    for (const ref of scamHashes) {
      const dist = hammingDistance(hash, ref.hash)
      if (dist <= THRESHOLD) return true
    }
  } catch {
    return false
  }

  return false
}

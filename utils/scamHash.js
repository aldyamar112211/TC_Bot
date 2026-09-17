import imghash from 'imghash'
import { readdirSync, readFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SCAM_DIR = join(__dirname, '../assets/scam')

// pHash DCT 16x16 = 256 bit. Jarak duplikat asli biasanya 0-10,
// gambar tak berhubungan 100+. Ambang 32 memberi margin lebar.
const HASH_BITS = 16
const THRESHOLD = Number(process.env.SCAM_HASH_THRESHOLD) || 32

function hammingHex(a, b) {
  if (a.length !== b.length) return Number.MAX_SAFE_INTEGER
  let dist = 0
  for (let i = 0; i < a.length; i++) {
    let x = parseInt(a[i], 16) ^ parseInt(b[i], 16)
    while (x) {
      dist += x & 1
      x >>= 1
    }
  }
  return dist
}

let scamHashes = []

export async function loadScamHashes() {
  scamHashes = []
  if (!existsSync(SCAM_DIR)) {
    console.log('[scamHash] Folder assets/scam tidak ada, deteksi gambar scam dilewati.')
    return
  }
  const files = readdirSync(SCAM_DIR).filter(f => /\.(jpe?g|png|webp)$/i.test(f))
  for (const file of files) {
    try {
      const hash = await imghash.hash(readFileSync(join(SCAM_DIR, file)), HASH_BITS, 'hex')
      scamHashes.push({ file, hash })
    } catch (err) {
      console.error(`[scamHash] Gagal memproses ${file}:`, err.message)
    }
  }
  console.log(`[scamHash] ${scamHashes.length} acuan dimuat, ambang ${THRESHOLD}/${HASH_BITS * HASH_BITS} bit.`)
}

export async function isScamImage(url) {
  if (scamHashes.length === 0) return false

  try {
    const res = await fetch(url)
    if (!res.ok) return false
    const buf = Buffer.from(await res.arrayBuffer())
    const hash = await imghash.hash(buf, HASH_BITS, 'hex')

    let best = { dist: Number.MAX_SAFE_INTEGER, file: null }
    for (const ref of scamHashes) {
      const dist = hammingHex(hash, ref.hash)
      if (dist < best.dist) best = { dist, file: ref.file }
    }

    if (best.dist <= THRESHOLD) {
      console.log(`[scamHash] Cocok dengan ${best.file}, jarak ${best.dist} (ambang ${THRESHOLD}).`)
      return true
    }
    return false
  } catch {
    return false
  }
}

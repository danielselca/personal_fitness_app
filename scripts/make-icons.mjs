// Erzeugt die PWA-Icons als PNG ohne Zusatzpakete (gleiches Motiv wie public/icon.svg).
// Aufruf: npm run icons
import { deflateSync } from 'node:zlib'
import { writeFileSync } from 'node:fs'

const BG = [0x15, 0x15, 0x17]
const WHITE = [0xff, 0xff, 0xff]
const GRAY = [0xc7, 0xc7, 0xcc]

// Formen im 512er-Koordinatensystem: [x0, y0, x1, y1, radius, farbe]
const SHAPES = [
  [88, 236, 424, 276, 8, WHITE],
  [104, 168, 152, 344, 14, WHITE],
  [360, 168, 408, 344, 14, WHITE],
  [152, 192, 190, 320, 12, GRAY],
  [322, 192, 360, 320, 12, GRAY],
]

function insideRoundedRect(px, py, x0, y0, x1, y1, r) {
  const cx = Math.max(x0 + r, Math.min(px, x1 - r))
  const cy = Math.max(y0 + r, Math.min(py, y1 - r))
  const dx = px - cx
  const dy = py - cy
  return dx * dx + dy * dy <= r * r
}

function render(size, cornerRadius) {
  const SS = 4
  const out = new Uint8Array(size * size * 4)
  const scale = 512 / size
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) * scale
          const py = (y + (sy + 0.5) / SS) * scale
          let color = null
          if (insideRoundedRect(px, py, 0, 0, 512, 512, cornerRadius)) {
            color = BG
            for (const [x0, y0, x1, y1, rad, c] of SHAPES) {
              if (insideRoundedRect(px, py, x0, y0, x1, y1, rad)) color = c
            }
          }
          const c = color ?? BG
          r += c[0]; g += c[1]; b += c[2]; a += color ? 255 : 0
        }
      }
      const n = SS * SS
      const i = (y * size + x) * 4
      out[i] = Math.round(r / n)
      out[i + 1] = Math.round(g / n)
      out[i + 2] = Math.round(b / n)
      out[i + 3] = Math.round(a / n)
    }
  }
  return out
}

const CRC_TABLE = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})
function crc32(buf) {
  let c = 0xffffffff
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}
function encodePng(size, rgba) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y++) {
    raw[y * stride] = 0 // Filter: none
    raw.set(rgba.subarray(y * size * 4, (y + 1) * size * 4), y * stride + 1)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8  // Bittiefe
  ihdr[9] = 6  // RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const targets = [
  ['public/icon-512.png', 512, 96],
  ['public/icon-192.png', 192, 96],
  ['public/icon-maskable-512.png', 512, 0],
  ['public/apple-touch-icon-180.png', 180, 0],
]
for (const [file, size, radius] of targets) {
  writeFileSync(file, encodePng(size, render(size, radius)))
  console.log(`${file} (${size}px)`)
}

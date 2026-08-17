import sharp from 'sharp'
import { writeFileSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

function makeSvg(size) {
  const fontSize = Math.round(size * 0.22)
  const subFontSize = Math.round(size * 0.10)
  const radius = Math.round(size * 0.22)
  const cx = size / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="#0a7ea4"/>
  <text
    x="${cx}" y="${Math.round(size * 0.52)}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="800"
    font-size="${fontSize}"
    fill="white"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="${Math.round(size * 0.015)}"
  >FA PN</text>
  <text
    x="${cx}" y="${Math.round(size * 0.72)}"
    font-family="Arial, Helvetica, sans-serif"
    font-weight="500"
    font-size="${subFontSize}"
    fill="rgba(255,255,255,0.65)"
    text-anchor="middle"
    dominant-baseline="middle"
    letter-spacing="${Math.round(size * 0.02)}"
  >CONNECT</text>
</svg>`
}

for (const size of [192, 512]) {
  const svg = Buffer.from(makeSvg(size))
  const outPath = path.join(publicDir, `icon-${size}.png`)
  await sharp(svg).png().toFile(outPath)
  console.log(`✓ icon-${size}.png`)
}

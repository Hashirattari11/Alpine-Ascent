// Downloads the curated Unsplash photography into client/images,
// producing a full-size and a small WebP per image plus tiny blur-up placeholders (LQIP).
// Usage: npm run images
import fs from 'node:fs'
import sharp from 'sharp'

const OUT = 'client/images'
const photos = {
  'hero-matterhorn': '1491555103944-7c647fd857e6',
  'everest-ama': '1533130061792-64b345e4a833',
  'ama-closeup': '1486911278844-a81c5267e227',
  'himalaya-snow': '1454496522488-7a8e488e8606',
  'karakoram-dawn': '1585409677983-0f6c41ca9c3b',
  'patagonia-torres': '1544198365-f5d60b6d8190',
  'patagonia-lake': '1478827387698-1527781a4887',
  'above-clouds': '1506905925346-21bda4d32df4',
  'milky-way': '1519681393784-d120267933ba',
  'night-camp': '1517824806704-9040b037703b',
  'tent-view': '1504280390367-361c6d9f38f4',
  'rock-climber': '1522163182402-834f871fd851',
  'ridge-hiker': '1519904981063-b0cf448d479e',
  'trekkers': '1551632811-561732d1e306',
  'ski-jump': '1551524559-8af4e6624178',
  'ski-air': '1565992441121-4367c2967103',
  'snow-forest': '1520962922320-2038eebab146',
  'peak-dark': '1486870591958-9b9d0d1dda99',
  'peak-teal': '1483728642387-6c3bdd6c93e5',
  'winter-lake': '1455156218388-5e61b526818b',
  'aurora': '1531366936337-7c912a4589a7',
  'larch': '1508264165352-258db2ebd59b',
  'moraine': '1503614472-8c93d56e92ce',
  'dolomites': '1501785888041-af3ef285b470',
  'canada-lake': '1502786129293-79981df4e689',
  'fuji': '1589308078059-be1415eab4c3',
  'teal-range': '1605649487212-47bdab064df7',
  'nz-peaks': '1464822759023-fed622ff2c3b',
  'nz-lake': '1465056836041-7f43ac27dcb5',
  'campfire': '1478131143081-80f7f84ca84d',
  'summit-sunrise': '1476611338391-6f395a0ebc7b',
  'sunset-ridges': '1500964757637-c85e8a162699',
  'sunrise-clouds': '1470071459604-3b5ec3a7fe05',
  'valley-light': '1439853949127-fa647821eba0',
  'red-tent': '1445308394109-4ec2920981b1',
  'snow-aerial': '1548777123-e216912df7d8',
  'red-peaks': '1464278533981-50106e6176b1',
}
const HERO = new Set(['hero-matterhorn', 'everest-ama', 'patagonia-torres'])
fs.mkdirSync(OUT, { recursive: true })
const meta = {}
const entries = Object.entries(photos)
let i = 0
async function work() {
  while (i < entries.length) {
    const [name, id] = entries[i++]
    const w = HERO.has(name) ? 2200 : 1600
    const full = `${OUT}/${name}.webp`
    const small = `${OUT}/${name}-sm.webp`
    try {
      let src
      if (fs.existsSync(full) && fs.existsSync(small) && !process.env.FORCE) {
        src = fs.readFileSync(full)
      } else {
        const r = await fetch(`https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`)
        if (!r.ok) throw new Error('HTTP ' + r.status)
        src = Buffer.from(await r.arrayBuffer())
        await sharp(src).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(full)
        await sharp(src).resize({ width: 720, withoutEnlargement: true }).webp({ quality: 68 }).toFile(small)
      }
      const info = await sharp(src).metadata()
      const tiny = await sharp(src).resize(20).blur(1).webp({ quality: 40 }).toBuffer()
      meta[name] = { w: info.width, h: info.height, lqip: 'data:image/webp;base64,' + tiny.toString('base64') }
      console.log('ok  ', name)
    } catch (e) { console.log('FAIL', name, e.message) }
  }
}
await Promise.all([work(), work(), work(), work(), work()])
fs.mkdirSync('client/data', { recursive: true })
fs.writeFileSync('client/data/images.json', JSON.stringify(meta))
console.log('done', Object.keys(meta).length, 'images')


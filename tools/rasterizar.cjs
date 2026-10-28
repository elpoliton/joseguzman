// Convierte favicon.svg en los PNG que piden los navegadores y teléfonos: node tools/rasterizar.cjs
const sharp = require('sharp'); const fs = require('fs'); const path = require('path');
const R = path.join(__dirname, '..'); const svg = fs.readFileSync(path.join(R, 'favicon.svg'));
(async () => {
  for (const [n, s] of [['favicon-32.png', 32], ['favicon-48.png', 48], ['apple-touch-icon.png', 180], ['icono-192.png', 192], ['icono-512.png', 512]])
    await sharp(svg, { density: 384 }).resize(s, s).png().toFile(path.join(R, 'assets', 'img', n));
  // favicon.ico (PNG de 48 px dentro de un ICO, compatible con todos los navegadores)
  const png = await sharp(svg, { density: 384 }).resize(48, 48).png().toBuffer();
  const h = Buffer.alloc(22); h.writeUInt16LE(0, 0); h.writeUInt16LE(1, 2); h.writeUInt16LE(1, 4);
  h.writeUInt8(48, 6); h.writeUInt8(48, 7); h.writeUInt8(0, 8); h.writeUInt8(0, 9); h.writeUInt16LE(1, 10); h.writeUInt16LE(32, 12);
  h.writeUInt32LE(png.length, 14); h.writeUInt32LE(22, 18);
  fs.writeFileSync(path.join(R, 'favicon.ico'), Buffer.concat([h, png]));
  console.log('ok');
})();

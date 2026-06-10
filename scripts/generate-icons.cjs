const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const logoPath = path.join(__dirname, '..', 'src', 'assets', 'logotipo.png');
const publicDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

async function generate() {
  const meta = await sharp(logoPath).metadata();
  console.log('Logotipo:', meta.width, 'x', meta.height);

  const sizes = [
    { name: 'pwa-192x192.png', size: 192 },
    { name: 'pwa-512x512.png', size: 512 },
    { name: 'pwa-512x512-maskable.png', size: 512 },
  ];

  for (const { name, size } of sizes) {
    const padding = Math.round(size * 0.18);
    const logoSize = size - padding * 2;
    const radius = Math.round(size * 0.18);

    const bgSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect width="${size}" height="${size}" rx="${radius}" fill="#0F0A1E"/></svg>`;

    const icon = await sharp(Buffer.from(bgSvg))
      .resize(size, size)
      .composite([
        {
          input: await sharp(logoPath)
            .resize(logoSize, logoSize, { fit: 'contain' })
            .png()
            .toBuffer(),
          top: padding,
          left: padding,
        }
      ])
      .png()
      .toFile(path.join(publicDir, name));

    console.log('  Created:', name, '-', icon.width, 'x', icon.height, '-', Math.round(icon.size / 1024) + 'KB');
  }

  console.log('✅ All icons generated');
}

generate().catch(console.error);

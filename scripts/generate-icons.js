const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// MealTime app icon: emerald background with fork & knife silhouette
const iconSvg = `<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="80" fill="#10b981"/>
  <!-- Fork -->
  <line x1="168" y1="120" x2="168" y2="240" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <line x1="140" y1="120" x2="140" y2="180" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <line x1="196" y1="120" x2="196" y2="180" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <path d="M140,180 Q168,210 196,180" fill="none" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <line x1="168" y1="240" x2="168" y2="390" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <!-- Knife -->
  <line x1="344" y1="120" x2="344" y2="390" stroke="white" stroke-width="20" stroke-linecap="round"/>
  <path d="M344,120 Q380,160 380,220 L344,240" fill="white" stroke="white" stroke-width="4" stroke-linejoin="round"/>
</svg>`;

const iconsDir = path.join(__dirname, '../public/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

async function generateIcons() {
  const svgBuffer = Buffer.from(iconSvg);

  const regularSizes = [48, 72, 96, 128, 144, 152, 192, 384, 512];
  for (const size of regularSizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`  icon-${size}x${size}.png`);
  }

  // Maskable icons: icon sits within 80% of canvas, rest is background colour
  for (const size of [192, 512]) {
    const inner = Math.round(size * 0.8);
    const pad = Math.round((size - inner) / 2);
    await sharp(svgBuffer)
      .resize(inner, inner)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 16, g: 185, b: 129, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}-maskable.png`));
    console.log(`  icon-${size}x${size}-maskable.png`);
  }

  // Apple touch icon (180×180)
  await sharp(svgBuffer).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  console.log('  apple-touch-icon.png');

  // Shortcut icons (96×96)
  await sharp(svgBuffer).resize(96, 96).png().toFile(path.join(iconsDir, 'shortcut-plan.png'));
  console.log('  shortcut-plan.png');
  await sharp(svgBuffer).resize(96, 96).png().toFile(path.join(iconsDir, 'shortcut-meals.png'));
  console.log('  shortcut-meals.png');

  console.log('\nAll icons generated in public/icons/');
}

generateIcons().catch((err) => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});

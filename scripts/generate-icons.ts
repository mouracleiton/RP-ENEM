/**
 * PWA Icon Generator
 * Generates PNG icons from SVG for PWA manifest
 */

import sharp from 'sharp';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

const ICON_SIZES = [72, 96, 128, 144, 152, 192, 384, 512];
const SVG_PATH = join(rootDir, 'apps/web-app/public/icons/icon.svg');
const OUTPUT_DIR = join(rootDir, 'apps/web-app/public/icons');

async function generateIcons() {
  console.log('🎨 Generating PWA icons from SVG...\n');

  // Read SVG file
  const svgBuffer = readFileSync(SVG_PATH);
  console.log(`📄 Source: ${SVG_PATH}`);
  console.log(`📁 Output: ${OUTPUT_DIR}\n`);

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Generate icons for each size
  for (const size of ICON_SIZES) {
    const outputPath = join(OUTPUT_DIR, `icon-${size}x${size}.png`);

    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(outputPath);

    console.log(`✅ Generated: icon-${size}x${size}.png`);
  }

  // Generate favicon
  const faviconPath = join(rootDir, 'apps/web-app/public/favicon.png');
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(faviconPath);
  console.log(`✅ Generated: favicon.png (32x32)`);

  // Generate Apple touch icon
  const appleTouchIconPath = join(OUTPUT_DIR, 'apple-touch-icon.png');
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(appleTouchIconPath);
  console.log(`✅ Generated: apple-touch-icon.png (180x180)`);

  // Generate study shortcut icon
  const studyIconPath = join(OUTPUT_DIR, 'study-icon.png');
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(studyIconPath);
  console.log(`✅ Generated: study-icon.png (96x96)`);

  // Generate challenge shortcut icon
  const challengeIconPath = join(OUTPUT_DIR, 'challenge-icon.png');
  await sharp(svgBuffer)
    .resize(96, 96)
    .png()
    .toFile(challengeIconPath);
  console.log(`✅ Generated: challenge-icon.png (96x96)`);

  console.log('\n🎉 All icons generated successfully!');
}

generateIcons().catch(console.error);

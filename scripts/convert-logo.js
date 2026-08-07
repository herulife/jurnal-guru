#!/usr/bin/env node
// Konversi SVG ke PNG untuk media sosial
// Cara pakai: node scripts/convert-logo.js

const fs = require('fs');
const path = require('path');

const svgContent = fs.readFileSync(path.join(__dirname, '..', 'public', 'logo.svg'), 'utf8');

const sizes = [
  { name: 'logo-124x124.png', width: 124, height: 124 },  // Product Hunt
  { name: 'logo-400x400.png', width: 400, height: 400 },  // Instagram/Facebook
  { name: 'logo-800x800.png', width: 800, height: 800 },  // High-res
  { name: 'og-image-1200x630.png', width: 1200, height: 630 },  // OG Image
];

// Create output directory
const outputDir = path.join(__dirname, '..', 'public', 'social-images');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Generate HTML files for each size
sizes.forEach(size => {
  const html = `<!DOCTYPE html>
<html>
<head>
<style>
  body { margin: 0; padding: 0; width: ${size.width}px; height: ${size.height}px; display: flex; align-items: center; justify-content: center; background: white; }
  img { max-width: 100%; max-height: 100%; }
</style>
</head>
<body>
${svgContent.replace('width="400" height="120"', `width="${size.width}" height="${size.height}"`)}
</body>
</html>`;
  
  const htmlPath = path.join(outputDir, `${size.name.replace('.png', '.html')}`);
  fs.writeFileSync(htmlPath, html);
  console.log(`✅ ${htmlPath}`);
});

console.log('\n📁 File HTML tersimpan di: public/social-images/');
console.log('\nUntuk konversi ke PNG, buka file HTML di browser lalu screenshot.');
console.log('Atau gunakan tool online: https://svgtopng.com/');

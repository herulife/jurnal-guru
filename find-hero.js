const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto('https://id-preview--8cd7bf34-786a-4630-a47b-dceb3f3629eb.lovable.app');
  await page.waitForTimeout(3000);
  
  // Find all img tags
  const imgs = await page.$$eval('img', els => els.map(e => ({ src: e.src, alt: e.alt })));
  console.log('Images found:', JSON.stringify(imgs, null, 2));
  
  // Try to get hero image with full URL
  const heroImg = await page.$('img[alt*="teacher"], img[src*="hero"]');
  if (heroImg) {
    const src = await heroImg.getAttribute('src');
    console.log('Hero src attribute:', src);
    
    // Get the natural URL from network requests
    const fullUrl = new URL(src, page.url()).href;
    console.log('Full hero URL:', fullUrl);
  }
  
  await browser.close();
})();

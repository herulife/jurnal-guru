#!/usr/bin/env node
// Script untuk mengambil screenshot landing page
// Cara pakai: node scripts/take-screenshots.js

const { chromium } = require('playwright');

const BASE_URL = 'https://teacher-dashboard-next.teacher-dashboard-app.workers.dev';

const pages = [
  { name: 'landing-hero', url: '/', width: 1920, height: 1080 },
  { name: 'landing-fitur', url: '/#fitur', width: 1920, height: 1080 },
  { name: 'landing-full', url: '/', width: 1920, height: 4000, fullPage: true },
  { name: 'login', url: '/login', width: 1920, height: 1080 },
  { name: 'mobile-landing', url: '/', width: 390, height: 844 },
  { name: 'mobile-login', url: '/login', width: 390, height: 844 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  
  for (const p of pages) {
    const page = await context.newPage();
    await page.setViewportSize({ width: p.width, height: p.height });
    await page.goto(BASE_URL + p.url, { waitUntil: 'networkidle' });
    
    const filename = `screenshots/${p.name}-${p.width}x${p.height}.png`;
    await page.screenshot({ 
      path: filename, 
      fullPage: p.fullPage || false 
    });
    console.log(`✅ ${filename}`);
    await page.close();
  }
  
  await browser.close();
  console.log('\n🎉 Semua screenshot tersimpan di folder screenshots/');
})();

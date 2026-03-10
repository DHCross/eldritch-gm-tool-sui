const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/character-builder');

  await page.selectOption('select#race', 'Human');
  await page.selectOption('select#class', 'Warrior');
  await page.waitForTimeout(500);

  await page.click('button:has-text("Continue →")');
  await page.waitForTimeout(500);

  await page.click('button:has-text("Continue →")');
  await page.waitForTimeout(500);

  await page.click('button:has-text("Continue →")');
  await page.waitForTimeout(500);

  // Take screenshot
  await page.screenshot({ path: 'step4.png', fullPage: true });

  await browser.close();
})();

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000/character-builder');

  // Choose Race: Human
  await page.selectOption('select#race', 'Human');

  // Choose Class: Warrior
  await page.selectOption('select#class', 'Warrior');

  // Wait a bit
  await page.waitForTimeout(1000);

  for (let i = 0; i < 3; i++) {
      const continueButtons = await page.$$('text=Continue →');
      if (continueButtons.length > 0) {
        await continueButtons[0].click();
        await page.waitForTimeout(500);
      }
  }

  const html = await page.content();
  fs.writeFileSync('page.html', html);

  await browser.close();
})();

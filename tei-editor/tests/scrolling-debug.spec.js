import { test, expect } from '@playwright/test';

test('TEI Editor Page Block Scrolling Test', async ({ page }) => {
  console.log('🔍 Starting TEI Editor test...');
  
  // Navigate to the application
  await page.goto('http://localhost:5173/');
  
  // Wait for the page to load
  await page.waitForSelector('[data-testid="file-drop-zone"]', { timeout: 10000 });
  console.log('✅ File drop zone loaded');
  
  // Load the sample TEI file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('./public/doc_2e0b9b6c9a1d.xml');
  console.log('✅ TEI file uploaded');
  
  // Wait for the document to load and three-pane layout to appear
  await page.waitForSelector('.h-full.flex.relative', { timeout: 10000 });
  console.log('✅ Three-pane layout appeared');
  
  // Check if page indicator is visible
  const pageIndicator = page.locator('.fixed.top-4.right-4');
  if (await pageIndicator.isVisible()) {
    const pageText = await pageIndicator.textContent();
    console.log('✅ Page indicator visible:', pageText);
  } else {
    console.log('❌ Page indicator not visible');
  }
  
  // Check console logs for our debug messages
  page.on('console', msg => {
    if (msg.text().includes('🔍')) {
      console.log('Debug:', msg.text());
    }
  });
  
  // Try clicking next page button if it exists
  const nextButton = page.locator('button').filter({ hasText: '→' });
  if (await nextButton.isVisible()) {
    console.log('✅ Next button visible, clicking...');
    await nextButton.click();
    await page.waitForTimeout(1000); // Wait for animation
  } else {
    console.log('❌ Next button not visible');
  }
  
  // Check if keyboard navigation works
  console.log('🔍 Testing keyboard navigation...');
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(1000);
  
  // Take screenshot for debugging
  await page.screenshot({ path: 'debug-screenshot.png', fullPage: true });
  console.log('✅ Screenshot saved as debug-screenshot.png');
});
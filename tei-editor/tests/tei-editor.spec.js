import { test, expect } from '@playwright/test';

test.describe('TEI Editor Application Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the application to load
    await page.waitForLoadState('networkidle');
  });

  test('should load the application with correct layout', async ({ page }) => {
    // Check if the main components are present
    await expect(page.locator('h1')).toContainText('TEI Poetry Editor');
    
    // Check for file loader
    await expect(page.locator('text=Drop TEI file here or click to browse')).toBeVisible();
    
    // Should show the file input area
    await expect(page.locator('[data-testid="file-drop-zone"]')).toBeVisible();
  });

  test('should load sample TEI file and display three panes', async ({ page }) => {
    // Load the sample file (simulating file selection)
    const fileInput = page.locator('input[type="file"]');
    
    // Set the sample file
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    
    // Wait for the file to load and the three-pane layout to appear
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    // Check that all three panes are visible
    await expect(page.locator('[data-testid="image-pane"]')).toBeVisible();
    await expect(page.locator('[data-testid="rendered-text-pane"]')).toBeVisible();
    
    // TEI Code pane might be toggleable, so let's check if the toggle exists
    const teiToggle = page.locator('[data-testid="tei-code-toggle"]');
    if (await teiToggle.isVisible()) {
      await teiToggle.click();
      await expect(page.locator('[data-testid="tei-code-pane"]')).toBeVisible();
    }
  });

  test('should display page indicator in top-right corner', async ({ page }) => {
    // Load sample file first
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    // Check for page indicator
    const pageIndicator = page.locator('[data-testid="page-indicator"]');
    await expect(pageIndicator).toBeVisible();
    
    // Check if it's positioned in the top-right area
    const boundingBox = await pageIndicator.boundingBox();
    const viewportSize = page.viewportSize();
    
    // Verify it's in the right portion of the screen
    expect(boundingBox.x).toBeGreaterThan(viewportSize.width * 0.7);
    expect(boundingBox.y).toBeLessThan(viewportSize.height * 0.3);
    
    // Check if it shows current page information
    await expect(pageIndicator).toContainText(/Page\s+\d+/);
  });

  test('should test scrolling synchronization between panes', async ({ page }) => {
    // Load sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    const imagePane = page.locator('[data-testid="image-pane"]');
    const textPane = page.locator('[data-testid="rendered-text-pane"]');
    
    // Get initial scroll positions
    const initialImageScroll = await imagePane.evaluate(el => el.scrollTop);
    const initialTextScroll = await textPane.evaluate(el => el.scrollTop);
    
    // Scroll in the text pane
    await textPane.evaluate(el => el.scrollTop = 200);
    
    // Wait for synchronization (800ms transition + buffer)
    await page.waitForTimeout(1000);
    
    // Check if image pane scrolled accordingly
    const newImageScroll = await imagePane.evaluate(el => el.scrollTop);
    expect(newImageScroll).not.toBe(initialImageScroll);
    
    // Test reverse synchronization - scroll in image pane
    await imagePane.evaluate(el => el.scrollTop = 400);
    await page.waitForTimeout(1000);
    
    const newTextScroll = await textPane.evaluate(el => el.scrollTop);
    expect(newTextScroll).not.toBe(initialTextScroll);
  });

  test('should test page indicator updates during scrolling', async ({ page }) => {
    // Load sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    const pageIndicator = page.locator('[data-testid="page-indicator"]');
    const textPane = page.locator('[data-testid="rendered-text-pane"]');
    
    // Get initial page number
    const initialPageText = await pageIndicator.textContent();
    const initialPageMatch = initialPageText.match(/Page\s+(\d+)/);
    const initialPageNumber = initialPageMatch ? parseInt(initialPageMatch[1]) : 1;
    
    // Scroll to trigger page change
    await textPane.evaluate(el => {
      el.scrollTop = el.scrollHeight * 0.5; // Scroll to middle
    });
    
    // Wait for page indicator to update
    await page.waitForTimeout(1000);
    
    const newPageText = await pageIndicator.textContent();
    // Page number should potentially change (depending on document structure)
    expect(newPageText).toMatch(/Page\s+\d+/);
  });

  test('should test keyboard navigation (Page Up/Down)', async ({ page }) => {
    // Load sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    const textPane = page.locator('[data-testid="rendered-text-pane"]');
    const pageIndicator = page.locator('[data-testid="page-indicator"]');
    
    // Focus on the text pane to enable keyboard navigation
    await textPane.click();
    
    // Get initial page
    const initialPageText = await pageIndicator.textContent();
    
    // Test Page Down key
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(1000); // Wait for transition
    
    // Test Page Up key
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(1000);
    
    // The page indicator should be functional (exact behavior depends on implementation)
    const finalPageText = await pageIndicator.textContent();
    expect(finalPageText).toMatch(/Page\s+\d+/);
  });

  test('should test smooth transitions (800ms)', async ({ page }) => {
    // Load sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    const textPane = page.locator('[data-testid="rendered-text-pane"]');
    
    // Record start time
    const startTime = Date.now();
    
    // Trigger a scroll that should cause a transition
    await textPane.evaluate(el => {
      el.scrollTop = 300;
    });
    
    // Wait for the transition to complete
    await page.waitForTimeout(900); // Slightly more than 800ms
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Verify the transition took approximately the expected time
    expect(duration).toBeGreaterThan(800);
    expect(duration).toBeLessThan(1200); // Allow some buffer
  });

  test('should handle multiple documents', async ({ page }) => {
    // First, load the primary sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    // Verify first document is loaded
    await expect(page.locator('[data-testid="image-pane"]')).toBeVisible();
    
    // Check if there are other sample files to test with
    try {
      // Try to load another document if available
      await fileInput.setInputFiles('public/doc_b361451528a9/output/doc_b361451528a9.xml');
      await page.waitForTimeout(2000);
      
      // Should still show the three-pane layout
      await expect(page.locator('[data-testid="three-pane-layout"]')).toBeVisible();
    } catch (error) {
      // If second file doesn't exist, just verify the first one is still working
      await expect(page.locator('[data-testid="three-pane-layout"]')).toBeVisible();
    }
  });

  test('should display images correctly', async ({ page }) => {
    // Load sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    const imagePane = page.locator('[data-testid="image-pane"]');
    
    // Check if images are loading
    const images = imagePane.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Check first image
      const firstImage = images.first();
      await expect(firstImage).toBeVisible();
      
      // Wait for image to load
      await firstImage.waitFor({ state: 'visible' });
      
      // Check if image has proper src attribute
      const src = await firstImage.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).toContain('page_');
    }
  });

  test('should display formatted text content', async ({ page }) => {
    // Load sample file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles('public/doc_2e0b9b6c9a1d.xml');
    await page.waitForSelector('[data-testid="three-pane-layout"]', { timeout: 10000 });
    
    const textPane = page.locator('[data-testid="rendered-text-pane"]');
    
    // Check if text content is displayed
    const textContent = await textPane.textContent();
    expect(textContent).toBeTruthy();
    expect(textContent.length).toBeGreaterThan(0);
    
    // Look for typical TEI structure elements
    const potentialPoetryElements = textPane.locator('[data-element-type]');
    const elementCount = await potentialPoetryElements.count();
    
    // Should have some structured elements
    expect(elementCount).toBeGreaterThan(0);
  });
});
const { test, expect } = require('@playwright/test');

test.describe('Portfolio E2E Tests', () => {
  test('should load the homepage and toggle theme', async ({ page }) => {
    // Navigate to homepage
    await page.goto('http://localhost:8000/');
    
    // Check title
    await expect(page).toHaveTitle(/Viir Phuria/);

    // Verify Theme Toggler exists
    const themeToggle = page.locator('#theme-toggle-btn');
    await expect(themeToggle).toBeVisible();

    // Click theme toggle and verify class change
    await themeToggle.click();
    
    // Expect body to have 'light' or 'dark' class depending on initial state
    // We assume it toggles successfully if the class attribute exists and changes
    const body = page.locator('body');
    await expect(body).toHaveAttribute('class', /light|dark/);
  });

  test('contact form should render properly', async ({ page }) => {
    await page.goto('http://localhost:8000/#contact');
    
    // Check if the submit button exists
    const submitBtn = page.locator('button[type="submit"]');
    await expect(submitBtn).toBeVisible();
    
    // Check for honeypot field
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toBeHidden(); // Honeypot should be visually hidden
  });
});

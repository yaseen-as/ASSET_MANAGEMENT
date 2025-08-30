import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should register a new user successfully', async ({ page }) => {
    // Navigate to register page
    await page.click('text=Sign Up');
    
    // Fill registration form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.fill('[data-testid="confirmPassword"]', 'TestPassword123!');
    
    // Submit form
    await page.click('[data-testid="register-button"]');
    
    // Verify registration success
    await expect(page.locator('text=Registration successful')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign In');
    
    // Fill login form
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify login success
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    // Navigate to login page
    await page.click('text=Sign In');
    
    // Fill login form with invalid credentials
    await page.fill('[data-testid="email"]', 'invalid@example.com');
    await page.fill('[data-testid="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('[data-testid="login-button"]');
    
    // Verify error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('text=Logout');
    
    // Verify logout
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should handle token refresh', async ({ page }) => {
    // Login
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    
    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
    
    // Simulate token expiry by waiting and making an API call
    await page.waitForTimeout(2000);
    await page.click('[data-testid="portfolio-link"]');
    
    // Should still be authenticated (token refreshed)
    await expect(page).toHaveURL('/portfolio');
  });
});

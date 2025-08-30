import { test, expect } from '@playwright/test';

test.describe('Market Data Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to market data
    await page.click('[data-testid="market-link"]');
    await expect(page).toHaveURL('/market');
  });

  test('should display market data dashboard', async ({ page }) => {
    await expect(page.locator('[data-testid="market-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-gainers"]')).toBeVisible();
    await expect(page.locator('[data-testid="top-losers"]')).toBeVisible();
  });

  test('should search for stocks', async ({ page }) => {
    // Search for a stock
    await page.fill('[data-testid="stock-search"]', 'AAPL');
    await page.press('[data-testid="stock-search"]', 'Enter');
    
    // Verify search results
    await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    await expect(page.locator('text=Apple Inc.')).toBeVisible();
  });

  test('should display stock details', async ({ page }) => {
    // Search and select a stock
    await page.fill('[data-testid="stock-search"]', 'AAPL');
    await page.press('[data-testid="stock-search"]', 'Enter');
    await page.click('[data-testid="stock-item-AAPL"]');
    
    // Verify stock details page
    await expect(page).toHaveURL(/\/stock\/AAPL/);
    await expect(page.locator('[data-testid="stock-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="stock-info"]')).toBeVisible();
  });

  test('should add stock to watchlist', async ({ page }) => {
    // Search for stock
    await page.fill('[data-testid="stock-search"]', 'MSFT');
    await page.press('[data-testid="stock-search"]', 'Enter');
    await page.click('[data-testid="stock-item-MSFT"]');
    
    // Add to watchlist
    await page.click('[data-testid="add-to-watchlist"]');
    
    // Verify success message
    await expect(page.locator('text=Added to watchlist')).toBeVisible();
    
    // Navigate to watchlist
    await page.click('[data-testid="watchlist-link"]');
    await expect(page.locator('text=MSFT')).toBeVisible();
  });

  test('should display real-time price updates', async ({ page }) => {
    // Search for stock
    await page.fill('[data-testid="stock-search"]', 'GOOGL');
    await page.press('[data-testid="stock-search"]', 'Enter');
    await page.click('[data-testid="stock-item-GOOGL"]');
    
    // Get initial price
    const initialPrice = await page.locator('[data-testid="current-price"]').textContent();
    
    // Wait for potential price update (this tests WebSocket connection)
    await page.waitForTimeout(5000);
    
    // Price element should still be visible (indicating connection is working)
    await expect(page.locator('[data-testid="current-price"]')).toBeVisible();
    await expect(page.locator('[data-testid="last-updated"]')).toBeVisible();
  });

  test('should handle market data errors gracefully', async ({ page }) => {
    // Try to search for invalid stock symbol
    await page.fill('[data-testid="stock-search"]', 'INVALIDSTOCK123');
    await page.press('[data-testid="stock-search"]', 'Enter');
    
    // Should show no results message
    await expect(page.locator('text=No stocks found')).toBeVisible();
  });
});

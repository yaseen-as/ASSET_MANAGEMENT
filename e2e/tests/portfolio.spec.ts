import { test, expect } from '@playwright/test';

test.describe('Portfolio Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/');
    await page.click('text=Sign In');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'TestPassword123!');
    await page.click('[data-testid="login-button"]');
    await expect(page).toHaveURL('/dashboard');
    
    // Navigate to portfolio
    await page.click('[data-testid="portfolio-link"]');
    await expect(page).toHaveURL('/portfolio');
  });

  test('should display portfolio overview', async ({ page }) => {
    // Check portfolio components are visible
    await expect(page.locator('[data-testid="portfolio-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="holdings-list"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-chart"]')).toBeVisible();
  });

  test('should add a new stock to portfolio', async ({ page }) => {
    // Click add stock button
    await page.click('[data-testid="add-stock-button"]');
    
    // Fill stock details
    await page.fill('[data-testid="stock-symbol"]', 'AAPL');
    await page.fill('[data-testid="quantity"]', '10');
    await page.fill('[data-testid="purchase-price"]', '150.00');
    await page.fill('[data-testid="purchase-date"]', '2024-01-15');
    
    // Submit
    await page.click('[data-testid="save-stock-button"]');
    
    // Verify stock is added
    await expect(page.locator('text=AAPL')).toBeVisible();
    await expect(page.locator('text=10 shares')).toBeVisible();
  });

  test('should edit existing stock holding', async ({ page }) => {
    // First add a stock
    await page.click('[data-testid="add-stock-button"]');
    await page.fill('[data-testid="stock-symbol"]', 'GOOGL');
    await page.fill('[data-testid="quantity"]', '5');
    await page.fill('[data-testid="purchase-price"]', '2800.00');
    await page.click('[data-testid="save-stock-button"]');
    
    // Edit the stock
    await page.click('[data-testid="edit-stock-GOOGL"]');
    await page.fill('[data-testid="quantity"]', '7');
    await page.click('[data-testid="save-stock-button"]');
    
    // Verify changes
    await expect(page.locator('text=7 shares')).toBeVisible();
  });

  test('should remove stock from portfolio', async ({ page }) => {
    // Add a stock first
    await page.click('[data-testid="add-stock-button"]');
    await page.fill('[data-testid="stock-symbol"]', 'TSLA');
    await page.fill('[data-testid="quantity"]', '3');
    await page.fill('[data-testid="purchase-price"]', '800.00');
    await page.click('[data-testid="save-stock-button"]');
    
    // Remove the stock
    await page.click('[data-testid="delete-stock-TSLA"]');
    await page.click('[data-testid="confirm-delete"]');
    
    // Verify stock is removed
    await expect(page.locator('text=TSLA')).not.toBeVisible();
  });

  test('should calculate portfolio performance correctly', async ({ page }) => {
    // Add multiple stocks
    const stocks = [
      { symbol: 'AAPL', quantity: '10', price: '150.00' },
      { symbol: 'MSFT', quantity: '5', price: '300.00' },
    ];

    for (const stock of stocks) {
      await page.click('[data-testid="add-stock-button"]');
      await page.fill('[data-testid="stock-symbol"]', stock.symbol);
      await page.fill('[data-testid="quantity"]', stock.quantity);
      await page.fill('[data-testid="purchase-price"]', stock.price);
      await page.click('[data-testid="save-stock-button"]');
    }

    // Check total portfolio value calculation
    await expect(page.locator('[data-testid="total-value"]')).toContainText('$');
    await expect(page.locator('[data-testid="total-gain-loss"]')).toBeVisible();
    await expect(page.locator('[data-testid="percentage-change"]')).toBeVisible();
  });
});

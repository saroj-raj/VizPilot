import { test, expect } from '@playwright/test';

test('onboarding → upload → proposals → save → dashboard', async ({ page }) => {
  // 1) landing → get started
  await page.goto('/');
  await page.getByRole('button', { name: /get started/i }).click();

  // 2) mock login (test mode: page should have a test login shortcut or accepts test creds)
  await page.getByLabel(/email/i).fill('test@elas.local');
  await page.getByLabel(/password/i).fill('password');
  await page.getByRole('button', { name: /sign in/i }).click();

  // 3) business form
  await expect(page.getByText(/Fill out this form/i)).toBeVisible();
  await page.getByLabel(/Business Name/i).fill('Acme');
  await page.getByLabel(/Business Type/i).fill('Retail');
  await page.getByRole('button', { name: /continue/i }).click();

  // 4) documents → upload CSV
  await expect(page.getByText(/Upload Business Files/i)).toBeVisible();
  const filePath = 'tests/fixtures/tiny_sales.csv';
  await page.setInputFiles('input[type="file"]', filePath);

  // 5) trigger proposals
  await page.getByRole('button', { name: /generate proposals/i }).click();

  // 6) proposals render (mock Groq)
  await expect(page.getByText(/Proposed Charts/i)).toBeVisible();
  await expect(page.locator('[data-test="vega-chart"]')).toHaveCount(3, { timeout: 10000 });

  // 7) save dashboard and open role dashboard
  await page.getByRole('button', { name: /save dashboard/i }).click();
  await page.goto('/dashboard/finance');
  await expect(page.locator('[data-test="widget-card"]')).toHaveCountGreaterThan(0);
});

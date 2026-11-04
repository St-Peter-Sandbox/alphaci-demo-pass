import { expect, test } from '@playwright/test';

test('standard order includes the delivery charge', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Calculate quote' }).click();
  await expect(page.getByLabel('Order total')).toHaveText(/550\.00/);
});
test('exactly ten items receive the bulk discount and free delivery', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Quantity', { exact: true }).fill('10');
  await page.getByRole('button', { name: 'Calculate quote' }).click();
  await expect(page.getByLabel('Order total')).toHaveText(/2,250\.00/);
});
test('invalid orders cannot be submitted', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Quantity', { exact: true }).fill('0');
  await page.getByRole('button', { name: 'Calculate quote' }).click();
  await expect(page.getByLabel('Order total')).toHaveCount(0);
});

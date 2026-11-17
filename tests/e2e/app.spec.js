// The workflows that matter most, driven through the real interface.
import { test, expect } from '@playwright/test';

const ROUTES = ['', 'learn', 'learn/why-techniques', 'learn/pao-idea', 'train', 'train/c2i', 'train/i2c', 'train/rapid',
  'train/digits', 'train/pao-decode', 'systems/palaces', 'systems/cards', 'systems/pao', 'systems/numbers',
  'systems/data', 'speed', 'progress', 'handbook'];

test.beforeEach(async ({ page }) => {
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error') page.errors.push(m.text()); });
});
test.afterEach(async ({ page }) => { expect(page.errors).toEqual([]); });

/** Page through a sequence in the arena and return the cards in the order shown. */
async function memorise(page, n) {
  await page.getByRole('button', { name: /Shuffle and start/ }).click();
  const seen = [];
  for (let i = 0; i < n; i++) {
    seen.push(await page.locator('.deck-stage [data-card]').first().getAttribute('data-card'));
    await page.keyboard.press('ArrowRight');
  }
  return seen;
}

/** Fill the recall slots by typing each card as rank then suit. */
async function recall(page, order) {
  for (const c of order) await page.keyboard.type(c.toLowerCase());
}

test('every page renders without errors', async ({ page }) => {
  for (const r of ROUTES) {
    await page.goto(`#/${r}`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('main h1')).not.toHaveText(/went wrong|not found/i);
  }
});

test('a short sequence: memorise, recall, compare', async ({ page }) => {
  await page.goto('#/train/seq?n=5');
  const seen = await memorise(page, 5);
  expect(new Set(seen).size).toBe(5);
  await page.keyboard.press('Enter');
  // The original order must not be anywhere in the page during recall.
  await expect(page.locator('.deck-stage')).toHaveCount(0);
  expect(await page.locator('.slots [data-card]').count()).toBe(0);
  await recall(page, seen);
  // A card already placed cannot be chosen again.
  await expect(page.locator(`[data-pick="${seen[0]}"]`)).toBeDisabled();
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.big-score')).toHaveText('5/5');
});

test('Enter starts recall even after clicking Next with the mouse', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'keyboard flow');
  await page.goto('#/train/seq?n=5');
  await page.getByRole('button', { name: /Shuffle and start/ }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  await expect(page.locator('[data-pos]')).toHaveText('Card 2 of 5');
  await page.keyboard.press('Enter');
  await expect(page.locator('.slots')).toBeVisible();
});

test('a fast deck with errors earns nothing; a perfect deck earns its milestones', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'keyboard flow');
  test.setTimeout(60000);
  await page.goto('#/speed');
  let seen = await memorise(page, 52);
  expect(new Set(seen).size).toBe(52);
  await page.keyboard.press('Enter');
  const wrong = seen.slice();
  [wrong[3], wrong[4]] = [wrong[4], wrong[3]];
  await recall(page, wrong);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.big-score')).toHaveText('50/52');
  await expect(page.locator('.milestone')).toHaveCount(0);
  await expect(page.getByText('Not a milestone attempt')).toBeVisible();

  await page.getByRole('button', { name: 'New attempt' }).click();
  seen = await memorise(page, 52);
  await page.keyboard.press('Enter');
  await recall(page, seen);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.big-score')).toHaveText('52/52');
  await expect(page.locator('.milestone')).toContainText(/first perfect deck/i);
  await expect(page.locator('.milestone')).toContainText(/under 2 minutes/i);

  // Survives a reload and shows on the dashboard.
  await page.goto('#/');
  await page.reload();
  await expect(page.locator('.tile', { hasText: 'Best perfect deck' })).not.toContainText('—');
});

test('hinted attempts are recorded as assisted and earn no milestone', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'keyboard flow');
  test.setTimeout(60000);
  await page.goto('#/speed');
  await page.getByLabel(/Show my images/).check();
  const seen = await memorise(page, 52);
  await page.keyboard.press('Enter');
  await recall(page, seen);
  await page.getByRole('button', { name: 'Submit' }).click();
  await expect(page.locator('.big-score')).toHaveText('52/52');
  await expect(page.locator('.result-meta .tag')).toHaveText(/assisted/i);
  await expect(page.locator('.milestone')).toHaveCount(0);
});

test('a lesson is completed by its exercise and stays completed', async ({ page }) => {
  await page.goto('#/learn/recall-spacing');
  for (let i = 0; i < 4; i++) {
    await page.locator('.opt').nth(1).click();
    await page.locator('[data-ex] [data-next]').click();
  }
  await expect(page.locator('.outcome.pass')).toBeVisible();
  await page.reload();
  await expect(page.locator('.objective .tag')).toHaveText(/completed/i);
});

test('saved card images are never replaced by suggestions', async ({ page }) => {
  await page.goto('#/systems/cards?card=9S');
  await page.getByLabel('Your image').fill('Soup');
  await page.getByRole('button', { name: /Save and go to next/ }).click();
  await page.getByRole('button', { name: /Save the suggestions/ }).click();
  await page.goto('#/systems/cards?card=9S');
  await page.reload();
  await expect(page.getByLabel('Your image')).toHaveValue('Soup');
  await page.goto('#/systems/cards?card=TS');
  await page.reload();
  await expect(page.getByLabel('Your image')).toHaveValue('Sauce');
});

test('a palace can be built and walked', async ({ page }) => {
  await page.goto('#/systems/palaces');
  await page.getByRole('button', { name: /Start from a template/ }).click();
  await page.getByLabel('Palace name').fill('Flat');
  await page.getByLabel('Palace name').press('Tab');
  await expect(page.locator('.chip.on')).toContainText('Flat');
  await expect(page.locator('.route li li')).toHaveCount(15);
  await page.getByRole('link', { name: 'Practise the walk' }).click();
  await page.getByRole('button', { name: 'Start the walk' }).click();
  await page.getByRole('button', { name: /Reveal/ }).click();
  await expect(page.locator('[data-ans]')).toHaveText('Doormat');
});

test('Ledger is the default style; style and light/dark can be changed', async ({ page }) => {
  await page.goto('#/systems/data');
  await expect(page.locator('html')).toHaveAttribute('data-ui', 'ledger');
  await page.locator('[data-theme-seg] button', { hasText: 'Dark' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe('rgb(18, 18, 18)');
  await page.locator('[data-style-seg] button', { hasText: 'Notebook' }).click();
  await expect(page.locator('html')).not.toHaveAttribute('data-ui', /./);
  await page.reload();
  await expect(page.locator('html')).not.toHaveAttribute('data-ui', /./);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});

test('in dark mode the Data tab buttons still do their own jobs', async ({ page }) => {
  await page.goto('#/systems/data');
  await page.locator('[data-theme-seg] button', { hasText: 'Dark' }).click();
  await page.reload();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Download a backup' }).click();
  expect((await download).suggestedFilename()).toMatch(/^cachet-backup-/);
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'night');
});

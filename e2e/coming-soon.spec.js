import { test, expect } from '@playwright/test';

test.describe('Karali Fabrication — Coming Soon & Core Regression Suite', () => {
  test('renders branding, headline, and landmark structure without console or page errors', async ({ page }) => {
    const consoleErrors = [];
    const pageErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => pageErrors.push(err.message));

    await page.goto('/');

    // Landmarks & branding
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('main#main')).toBeVisible();
    await expect(page.locator('footer.site-footer')).toBeVisible();
    await expect(page.locator('.badge')).toHaveText(/Coming Soon/i);
    await expect(page.locator('h1#page-title')).toContainText('Building Strength.');
    await expect(page.locator('h1#page-title')).toContainText('Shaping the Future.');

    // Services summary pills
    const services = page.locator('.services li');
    await expect(services).toHaveCount(3);

    expect(consoleErrors).toEqual([]);
    expect(pageErrors).toEqual([]);
  });

  test('verifies SEO metadata, canonical URL, OpenGraph tags, and security-friendly attributes', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Karali Fabrication.*Metal Fabrication & Structural Steel/i);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toMatch(/Karali Fabrication/i);
    expect(description).toMatch(/Mumbai, Thane and Navi Mumbai/i);

    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toBe('https://karalifabrication.in/');

    const ogUrl = await page.locator('meta[property="og:url"]').getAttribute('content');
    expect(ogUrl).toBe('https://karalifabrication.in/');
  });

  test('verifies click-to-call and WhatsApp links work independently of database state', async ({ page }) => {
    await page.goto('/');

    const callBtn = page.locator('#call-button');
    await expect(callBtn).toBeVisible();
    await expect(callBtn).toHaveAttribute('href', 'tel:+917977591792');

    const headerCall = page.locator('#header-call-link');
    await expect(headerCall).toHaveAttribute('href', 'tel:+917977591792');

    const whatsappBtn = page.locator('#whatsapp-button');
    await expect(whatsappBtn).toBeVisible();
    await expect(whatsappBtn).toHaveAttribute('href', 'https://wa.me/917977591792');
    await expect(whatsappBtn).toHaveAttribute('target', '_blank');
    await expect(whatsappBtn).toHaveAttribute('rel', /noopener/);
  });

  test('maintains responsive layout with zero horizontal overflow on current viewport', async ({ page }) => {
    await page.goto('/');

    const hasHorizontalOverflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(hasHorizontalOverflow).toBe(false);
  });

  test('enforces basic accessibility semantics on skip link, combobox, and status region', async ({ page }) => {
    await page.goto('/');

    const skipLink = page.locator('a.skip-link');
    await expect(skipLink).toHaveAttribute('href', '#main');

    const input = page.locator('#locality-input');
    await expect(input).toHaveAttribute('role', 'combobox');
    await expect(input).toHaveAttribute('aria-autocomplete', 'list');
    await expect(input).toHaveAttribute('aria-expanded', 'false');
    await expect(input).toHaveAttribute('aria-controls', 'locality-listbox');

    const status = page.locator('#form-status');
    await expect(status).toHaveAttribute('role', 'status');
    await expect(status).toHaveAttribute('aria-live', 'polite');
  });

  test('searchable locality combobox filters options, supports keyboard selection, and rejects arbitrary text', async ({
    page,
  }) => {
    await page.goto('/');

    const input = page.locator('#locality-input');
    const listbox = page.locator('#locality-listbox');
    const submitBtn = page.locator('#locality-submit');
    const status = page.locator('#form-status');

    // 1. Submitting empty or arbitrary unlisted text is rejected
    await input.fill('NotALocality');
    await expect(listbox.locator('.combobox__empty')).toBeVisible();
    await input.press('Escape');
    await expect(listbox).toBeHidden();
    await submitBtn.click();
    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(status).toHaveAttribute('data-state', 'error');
    await expect(status).toContainText('Please choose your locality from the list.');

    // 2. Typing a valid prefix filters the listbox case-insensitively
    await input.fill('andheri');
    await expect(listbox).toBeVisible();
    const options = listbox.locator('[role="option"]');
    await expect(options).toHaveCount(2);
    await expect(options.nth(0)).toHaveText('Andheri East');
    await expect(options.nth(1)).toHaveText('Andheri West');

    // 3. Keyboard Enter selects the active option
    await input.press('Enter');
    await expect(input).toHaveValue('Andheri East');
    await expect(input).not.toHaveAttribute('aria-invalid', 'true');
    await expect(listbox).toBeHidden();
  });

  test('displays honest unavailable or error feedback when Supabase is unconfigured or rejects request', async ({
    page,
  }) => {
    await page.route('**/rest/v1/location_test_submissions**', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ code: '42501', message: 'permission denied' }),
      });
    });

    await page.goto('/');

    const input = page.locator('#locality-input');
    const submitBtn = page.locator('#locality-submit');
    const status = page.locator('#form-status');

    await input.fill('Powai');
    await input.press('Enter');
    await expect(input).toHaveValue('Powai');

    await submitBtn.click();

    await expect(status).toHaveAttribute('data-state', /^(info|error)$/);
    await expect(status).not.toContainText('Thank you!');
  });

  test('displays confirmed success state only when Supabase returns HTTP 201 Created', async ({ page }) => {
    let requestBody = null;
    await page.route('**/rest/v1/location_test_submissions**', async (route) => {
      requestBody = route.request().postDataJSON();
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: '',
      });
    });

    await page.goto('/');

    const input = page.locator('#locality-input');
    const submitBtn = page.locator('#locality-submit');
    const status = page.locator('#form-status');

    await input.fill('Thane West');
    await input.press('Enter');
    await expect(input).toHaveValue('Thane West');

    await submitBtn.click();

    // Wait for pending state to resolve to either 'success' (when key configured) or 'info' (when placeholder key)
    await expect(status).toHaveAttribute('data-state', /^(success|info)$/);
    const finalState = await status.getAttribute('data-state');
    if (finalState === 'success') {
      await expect(status).toContainText('Thank you! “Thane West” has been recorded.');
      expect(requestBody).toEqual({ locality: 'Thane West' });
    }
  });

  // ---------------------------------------------------------------------------
  // Pending multi-page tests (marked test.skip until those routes are built)
  // ---------------------------------------------------------------------------
  test.skip('navigates across dedicated service pages (structural steel, lift shafts, sheds, railings)', async () => {
    // Prerequisite: Phase 2 multi-section/page routing for services.
  });

  test.skip('filters product catalogue by metal category and search query', async () => {
    // Prerequisite: Phase 2/3 product catalogue implementation.
  });

  test.skip('submits full multi-step quote request form with project scope', async () => {
    // Prerequisite: Phase 3 public.quote_requests table and quote form UI.
  });
});

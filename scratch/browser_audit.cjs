const { chromium } = require('playwright');
const path = require('path');

const baseUrl = 'http://127.0.0.1:8000';
const outputDir = path.join(__dirname, 'audit-output');

async function inspectPage(page, route, label) {
  const consoleErrors = [];
  const pageErrors = [];

  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto(`${baseUrl}${route}`, {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });
  await page.waitForTimeout(1800);

  const metrics = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0;
    };

    const ids = [...document.querySelectorAll('[id]')].map((element) => element.id);
    const duplicateIds = [...new Set(ids.filter((id, index) => ids.indexOf(id) !== index))];
    const images = [...document.images];
    const controls = [...document.querySelectorAll('button, input, textarea, select')].filter(visible);

    return {
      title: document.title,
      h1: [...document.querySelectorAll('h1')].filter(visible).map((element) => element.textContent.trim()),
      h2: [...document.querySelectorAll('h2')].filter(visible).map((element) => element.textContent.trim()),
      sectionCount: document.querySelectorAll('main, section').length,
      bodyTextLength: document.body.innerText.trim().length,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      missingAltImages: images
        .filter((image) => !image.hasAttribute('alt') || !image.alt.trim())
        .map((image) => image.currentSrc || image.src),
      brokenImages: images
        .filter((image) => image.complete && image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      lazyImages: images.filter((image) => image.loading === 'lazy').length,
      totalImages: images.length,
      duplicateIds,
      unlabeledControls: controls
        .filter((control) => {
          if (control.type === 'hidden') return false;
          const label = control.labels && control.labels.length;
          const name = control.getAttribute('aria-label') || control.getAttribute('aria-labelledby');
          const text = control.tagName === 'BUTTON' ? control.textContent.trim() : '';
          const title = control.getAttribute('title');
          return !label && !name && !text && !title;
        })
        .map((control) => `${control.tagName.toLowerCase()}#${control.id || ''}.${control.className || ''}`),
      emptyLinks: [...document.querySelectorAll('a')]
        .filter(visible)
        .filter((link) => !link.textContent.trim() && !link.getAttribute('aria-label') && !link.getAttribute('title'))
        .length,
      navLinks: [...document.querySelectorAll('nav a, header a')]
        .filter(visible)
        .map((link) => link.textContent.trim() || link.getAttribute('aria-label') || link.href),
      primaryActions: [...document.querySelectorAll('a, button')]
        .filter(visible)
        .map((element) => element.textContent.trim())
        .filter((text) => /contact|hire|resume|cv|project|blog|subscribe|submit/i.test(text))
        .slice(0, 30),
    };
  });

  await page.screenshot({
    path: path.join(outputDir, `${label}.png`),
    fullPage: true,
  });

  return {
    route,
    status: response ? response.status() : null,
    consoleErrors,
    pageErrors,
    ...metrics,
  };
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const desktopPage = await desktop.newPage();
  results.push(await inspectPage(desktopPage, '/', 'home-desktop'));
  results.push(await inspectPage(desktopPage, '/blogspace/', 'blog-desktop'));
  await desktop.close();

  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
    isMobile: true,
  });
  const mobilePage = await mobile.newPage();
  results.push(await inspectPage(mobilePage, '/', 'home-mobile'));
  results.push(await inspectPage(mobilePage, '/blogspace/', 'blog-mobile'));
  await mobile.close();

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

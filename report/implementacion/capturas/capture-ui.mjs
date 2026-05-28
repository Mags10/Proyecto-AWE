import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = 'http://127.0.0.1:4200/awe';
const outDir = path.resolve('report/implementacion/capturas');
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(1500);
}

async function shot(page, name) {
  await page.screenshot({ path: path.join(outDir, name), fullPage: false });
}

const loginPage = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 2 });
await loginPage.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
await settle(loginPage);
await shot(loginPage, 'login.png');
await loginPage.close();

const page = await browser.newPage({ viewport: { width: 1440, height: 1024 }, deviceScaleFactor: 2 });
await page.goto(`${baseUrl}/login`, { waitUntil: 'domcontentloaded' });
await settle(page);
await page.getByRole('button', { name: 'Admin' }).click();
await page.getByRole('button', { name: 'Entrar' }).click();
await settle(page);

const captures = [
  ['dashboard', `${baseUrl}/dashboard`],
  ['usuarios', `${baseUrl}/usuarios`],
  ['abastecimiento', `${baseUrl}/abastecimiento`],
  ['recetas', `${baseUrl}/recetas`],
  ['produccion', `${baseUrl}/produccion`],
  ['ventas', `${baseUrl}/ventas`],
];

for (const [file, url] of captures) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await settle(page);
  await shot(page, `${file}.png`);
}

await browser.close();
console.log('captures ok');

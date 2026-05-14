import puppeteer from "puppeteer";
import { mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "output");
mkdirSync(OUT, { recursive: true });

const PAGES = [
  { name: "agenci-home",        url: "https://www.agenci.no" },
  { name: "agenci-login",       url: "https://www.agenci.no/sign-in" },
  { name: "agenci-dashboard",   url: "https://www.agenci.no/agents" },
  { name: "triodelab-home",     url: "https://www.triodelab.no" },
];

const VIEWPORT = { width: 1440, height: 900 };

async function shoot(browser, { name, url }) {
  console.log(`📸  ${name}  →  ${url}`);
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 30_000 });
    // Let animations settle
    await new Promise((r) => setTimeout(r, 1500));

    const file = join(OUT, `${name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(`   ✅  saved  →  ${file}`);
  } catch (err) {
    console.error(`   ❌  ${name}:`, err.message);
  } finally {
    await page.close();
  }
}

const browser = await puppeteer.launch({
  headless: "new",
  args: ["--no-sandbox", "--disable-setuid-sandbox"],
});

for (const page of PAGES) {
  await shoot(browser, page);
}

await browser.close();
console.log("\nFerdig! Bilder ligger i screenshots/output/");

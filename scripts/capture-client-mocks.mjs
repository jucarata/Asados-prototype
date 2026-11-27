import { chromium, devices } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, "../client-mocks");
const baseURL = process.env.BASE_URL || "http://127.0.0.1:4321";

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const phone = devices["iPhone 14"];
const context = await browser.newContext({
  ...phone,
  locale: "es-CO",
  colorScheme: "dark",
});
const page = await context.newPage();

async function shot(name, fullPage = false) {
  const file = path.join(outDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage, animations: "disabled" });
  console.log("saved", path.basename(file));
  return file;
}

async function waitSettled() {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(400);
}

// 1. Home
await page.goto(`${baseURL}/`, { waitUntil: "networkidle" });
await waitSettled();
await shot("01-inicio");

// 2. Menu empty
await page.goto(`${baseURL}/menu`, { waitUntil: "networkidle" });
await waitSettled();
await shot("02-menu");

// 3. Deep category (Res) — shows variety beyond breakfast
await page.evaluate(() => {
  const section = document.getElementById("cat-res");
  section?.scrollIntoView({ behavior: "instant", block: "start" });
  document.querySelectorAll("[data-chip]").forEach((chip) => {
    const active = chip.getAttribute("data-chip") === "res";
    chip.classList.toggle("is-active", active);
    if (active) chip.setAttribute("aria-current", "true");
    else chip.removeAttribute("aria-current");
  });
  document.querySelector('[data-chip="res"]')?.scrollIntoView({
    inline: "center",
    block: "nearest",
  });
});
await waitSettled();
await shot("03-menu-categoria");

// 4. Add items + cart bar visible (back to top)
await page.evaluate(() => window.scrollTo(0, 0));
await waitSettled();
await page.locator('[data-add-item="des-arroz-huevo"]').click();
await page.waitForTimeout(150);
await page.locator('[data-qty-inc="des-arroz-huevo"]').click();
await page.waitForTimeout(150);
await page.locator('[data-add-item="des-omelette"]').click();
await waitSettled();
await shot("04-menu-con-carrito");

// 5. Open cart sheet
await page.locator("#cart-bar").click();
await page.waitForSelector("#cart-sheet.is-open", { timeout: 5000 }).catch(() => {});
await waitSettled();
await shot("05-carrito");

// 6. Order preview
await page.goto(`${baseURL}/orden`, { waitUntil: "networkidle" });
await waitSettled();
await shot("06-orden");

// Expand WhatsApp preview if present
const details = page.locator("details.order-whatsapp");
if (await details.count()) {
  await details.evaluate((el) => {
    el.open = true;
  });
  await waitSettled();
  await shot("07-orden-mensaje-whatsapp");
}

// 7. Empty order state (clear cart)
await page.evaluate(() => {
  localStorage.clear();
  sessionStorage.clear();
});
await page.goto(`${baseURL}/orden`, { waitUntil: "networkidle" });
await waitSettled();
await shot("08-orden-vacia");

await context.close();

// Desktop reinforcement shots
const desk = await browser.newContext({
  viewport: { width: 1280, height: 800 },
  deviceScaleFactor: 1.5,
  locale: "es-CO",
});
const deskPage = await desk.newPage();

await deskPage.goto(`${baseURL}/`, { waitUntil: "networkidle" });
await deskPage.waitForTimeout(400);
await deskPage.screenshot({
  path: path.join(outDir, "09-inicio-desktop.png"),
  animations: "disabled",
});
console.log("saved 09-inicio-desktop.png");

await deskPage.goto(`${baseURL}/menu`, { waitUntil: "networkidle" });
await deskPage.waitForTimeout(400);
await deskPage.screenshot({
  path: path.join(outDir, "10-menu-desktop.png"),
  animations: "disabled",
  fullPage: true,
});
console.log("saved 10-menu-desktop.png");

await desk.close();
await browser.close();

const index = `# ASADOS 24/7 — Mocks para cliente

Capturas del menú digital (mock de ventas). Vista principal pensada para móvil (~iPhone 14).

## Flujo móvil

| # | Archivo | Pantalla |
|---|---------|----------|
| 1 | \`01-inicio.png\` | Portada con mascota y CTA |
| 2 | \`02-menu.png\` | Menú por categorías |
| 3 | \`03-menu-categoria.png\` | Navegación entre categorías |
| 4 | \`04-menu-con-carrito.png\` | Ítems agregados + barra de carrito |
| 5 | \`05-carrito.png\` | Sheet del carrito |
| 6 | \`06-orden.png\` | Resumen de orden |
| 7 | \`07-orden-mensaje-whatsapp.png\` | Vista previa del mensaje WhatsApp |
| 8 | \`08-orden-vacia.png\` | Estado vacío de orden |

## Desktop (refuerzo)

| # | Archivo | Pantalla |
|---|---------|----------|
| 9 | \`09-inicio-desktop.png\` | Portada |
| 10 | \`10-menu-desktop.png\` | Menú completo |

## Nota

Datos y fotos de platos son placeholder. En el producto final se conectan precios/fotos reales y el envío a WhatsApp.
`;

await writeFile(path.join(outDir, "README.md"), index, "utf8");
console.log("done →", outDir);

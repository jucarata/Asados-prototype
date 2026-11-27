import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const BASE = process.env.ORDER_URL ?? "http://127.0.0.1:4321";
const OUT = path.resolve("tmp/order-flow");

const cartSeed = [
  { id: "desayuno-arroz-huevo", name: "Arroz o calentado con huevo", price: 15000, qty: 2 },
  { id: "entrada-patacon", name: "Patacón con hogao", price: 12000, qty: 1 },
  { id: "bebida-limonada", name: "Limonada natural", price: 6000, qty: 1 },
];

/** @param {import('playwright').Page} page */
async function measure(page, label) {
  return page.evaluate((stepLabel) => {
    const footer = document.querySelector("[data-order-footer]");
    const activePanel = document.querySelector("[data-order-step]:not([hidden])");
    const title = activePanel?.querySelector(".order-page__title");
    const lastContent =
      activePanel?.querySelector(".order-add-more, .order-form, .order-confirm, .order-whatsapp") ??
      activePanel?.lastElementChild;
    const footerRect = footer?.getBoundingClientRect();
    const lastRect = lastContent?.getBoundingClientRect();
    const titleRect = title?.getBoundingClientRect();
    const doc = document.documentElement;

    const overlapping =
      footerRect && lastRect
        ? lastRect.bottom > footerRect.top + 4
        : false;

    return {
      label: stepLabel,
      scrollY: Math.round(window.scrollY),
      scrollHeight: doc.scrollHeight,
      clientHeight: doc.clientHeight,
      maxScroll: doc.scrollHeight - doc.clientHeight,
      bodyOverflow: getComputedStyle(document.body).overflow,
      footerHeight: footerRect ? Math.round(footerRect.height) : null,
      titleTop: titleRect ? Math.round(titleRect.top) : null,
      lastBottom: lastRect ? Math.round(lastRect.bottom) : null,
      footerTop: footerRect ? Math.round(footerRect.top) : null,
      contentBehindFooter: overlapping,
      visibleStep: activePanel?.getAttribute("data-order-step") ?? null,
      hiddenPanels: [...document.querySelectorAll("[data-order-step][hidden]")].map((el) =>
        el.getAttribute("data-order-step"),
      ),
      exitHref: document.querySelector("[data-order-exit]")?.getAttribute("href") ?? null,
      exitRole: document.querySelector("[data-order-exit]")?.getAttribute("role") ?? null,
      focused: document.activeElement?.id || document.activeElement?.tagName || null,
    };
  }, label);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const findings = [];

  const scrollEvents = [];
  await page.exposeFunction("reportScroll", (payload) => {
    scrollEvents.push(payload);
  });
  await page.addInitScript(() => {
    let last = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        // @ts-expect-error bridge
        window.reportScroll?.({ y, delta: y - last, t: performance.now() });
        last = y;
      },
      { passive: true },
    );
  });

  await page.goto(`${BASE}/menu`, { waitUntil: "networkidle" });
  await page.evaluate((cart) => {
    localStorage.setItem("asados247-cart", JSON.stringify(cart));
    sessionStorage.removeItem("asados247-order-details");
  }, cartSeed);

  await page.goto(`${BASE}/orden`, { waitUntil: "networkidle" });
  await page.waitForTimeout(400);
  findings.push({ phase: "step1-load", ...(await measure(page, "1-load")) });
  await page.screenshot({ path: path.join(OUT, "01-pedido.png"), fullPage: true });

  // Scroll down then continue — catches jump-to-top fights
  await page.evaluate(() => window.scrollTo(0, 220));
  await page.waitForTimeout(200);
  scrollEvents.length = 0;
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(700);
  findings.push({
    phase: "step2-after-continue",
    scrollBurst: scrollEvents.slice(-12),
    ...(await measure(page, "2")),
  });
  await page.screenshot({ path: path.join(OUT, "02-datos.png"), fullPage: true });

  // Fill and continue
  await page.getByLabel("Nombre").fill("Carlos Pérez");
  await page.getByLabel("Número de mesa").fill("12");

  // Focus last field then continue — common mobile pain
  await page.getByLabel("Número de mesa").focus();
  await page.waitForTimeout(200);
  scrollEvents.length = 0;
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(700);
  findings.push({
    phase: "step3-after-continue",
    scrollBurst: scrollEvents.slice(-12),
    ...(await measure(page, "3")),
  });
  await page.screenshot({ path: path.join(OUT, "03-confirmar.png"), fullPage: true });

  // Check footer overlap after scrolling to bottom
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  findings.push({ phase: "step3-bottom", ...(await measure(page, "3-bottom")) });
  await page.screenshot({ path: path.join(OUT, "04-confirmar-bottom.png"), fullPage: false });

  // Ensure preview clears footer after scrolling to end
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await page.waitForTimeout(300);
  const previewClearance = await page.evaluate(() => {
    const preview = document.querySelector(".order-whatsapp");
    const footer = document.querySelector("[data-order-footer]");
    const pageEl = document.querySelector(".order-page");
    if (!preview || !footer || !pageEl) return null;
    const p = preview.getBoundingClientRect();
    const f = footer.getBoundingClientRect();
    return {
      previewBottom: Math.round(p.bottom),
      footerTop: Math.round(f.top),
      gap: Math.round(f.top - p.bottom),
      contentBehindFooter: p.bottom > f.top + 4,
      footerSpace: getComputedStyle(pageEl).getPropertyValue("--order-footer-space").trim(),
      maxScroll: document.documentElement.scrollHeight - document.documentElement.clientHeight,
    };
  });
  findings.push({ phase: "preview-clearance", previewClearance });
  await page.screenshot({ path: path.join(OUT, "04b-preview-clear.png"), fullPage: false });

  // Back via footer to edit delivery
  scrollEvents.length = 0;
  await page.getByRole("button", { name: "Atrás" }).click();
  await page.waitForTimeout(400);
  findings.push({
    phase: "back-to-datos",
    scrollBurst: scrollEvents.slice(-12),
    ...(await measure(page, "back-2")),
  });

  // Radio inputs are visually hidden — click the option label text
  await page.locator(".order-choice__option", { hasText: "Domicilio" }).click();
  await page.waitForTimeout(150);
  const domicilioVisible = await page.getByLabel("Dirección").isVisible();
  const mesaHidden = await page.getByLabel("Número de mesa").isHidden();
  findings.push({ phase: "delivery-toggle", domicilioVisible, mesaHidden });

  await page.getByLabel("Dirección").fill("Calle 10 #5-20, El Poblado");
  await page.getByRole("button", { name: "Continuar" }).click();
  await page.waitForTimeout(500);
  const confirmText = await page.locator("[data-confirm-facts]").innerText();
  findings.push({ phase: "confirm-domicilio", confirmText });
  await page.screenshot({ path: path.join(OUT, "05-confirmar-domicilio.png"), fullPage: true });

  // Intercept WhatsApp navigation
  let whatsappUrl = "";
  await page.route("**/wa.me/**", (route) => {
    whatsappUrl = route.request().url();
    return route.abort();
  });
  await page.route("**/api.whatsapp.com/**", (route) => {
    whatsappUrl = route.request().url();
    return route.abort();
  });
  await page.getByRole("button", { name: "Enviar por WhatsApp" }).click();
  await page.waitForTimeout(400);
  findings.push({
    phase: "whatsapp",
    url: whatsappUrl || page.url(),
    stayedOnOrder: page.url().includes("/orden"),
  });

  console.log(JSON.stringify({ out: OUT, findings }, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

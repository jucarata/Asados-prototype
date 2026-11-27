const STORAGE_KEY = "asados247-cart";

/** @typedef {{ id: string, name: string, price: number, qty: number }} CartLine */

/**
 * Swipe / drag horizontal nativo sobre la franja de chips (touch + mouse + trackpad).
 * @param {HTMLElement | null} strip
 */
function enableChipStripSwipe(strip) {
  if (!strip) return;

  let pointerId = /** @type {number | null} */ (null);
  let startX = 0;
  let startScroll = 0;
  let lastX = 0;
  let lastT = 0;
  let velocity = 0;
  let dragged = false;
  let momentumId = 0;
  const DRAG_THRESHOLD = 6;

  const stopMomentum = () => {
    if (momentumId) cancelAnimationFrame(momentumId);
    momentumId = 0;
  };

  /** @param {number} initialVelocity */
  const glide = (initialVelocity) => {
    let v = initialVelocity;
    const step = () => {
      if (Math.abs(v) < 0.15) {
        momentumId = 0;
        return;
      }
      strip.scrollLeft -= v;
      v *= 0.95;
      const max = strip.scrollWidth - strip.clientWidth;
      if (strip.scrollLeft <= 0 || strip.scrollLeft >= max) {
        momentumId = 0;
        return;
      }
      momentumId = requestAnimationFrame(step);
    };
    stopMomentum();
    momentumId = requestAnimationFrame(step);
  };

  strip.addEventListener(
    "wheel",
    (event) => {
      if (strip.scrollWidth <= strip.clientWidth) return;
      // Trackpad horizontal or vertical wheel → pan the strip.
      const delta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
      if (!delta) return;
      event.preventDefault();
      stopMomentum();
      strip.scrollLeft += delta;
    },
    { passive: false }
  );

  strip.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (strip.scrollWidth <= strip.clientWidth) return;
    stopMomentum();
    pointerId = event.pointerId;
    startX = event.clientX;
    lastX = event.clientX;
    lastT = performance.now();
    startScroll = strip.scrollLeft;
    velocity = 0;
    dragged = false;
    strip.classList.add("is-dragging");
    strip.setPointerCapture(event.pointerId);
  });

  strip.addEventListener("pointermove", (event) => {
    if (pointerId !== event.pointerId) return;
    const dx = event.clientX - startX;
    if (!dragged && Math.abs(dx) < DRAG_THRESHOLD) return;
    dragged = true;
    const now = performance.now();
    const dt = Math.max(now - lastT, 1);
    velocity = ((event.clientX - lastX) / dt) * 16;
    lastX = event.clientX;
    lastT = now;
    strip.scrollLeft = startScroll - dx;
  });

  const endPointer = (event) => {
    if (pointerId !== event.pointerId) return;
    pointerId = null;
    strip.classList.remove("is-dragging");
    try {
      strip.releasePointerCapture(event.pointerId);
    } catch {
      /* already released */
    }
    if (dragged) {
      glide(velocity);
      // Evita que el tap del chip dispare navegación tras un swipe.
      const suppress = (clickEvent) => {
        clickEvent.preventDefault();
        clickEvent.stopPropagation();
        strip.removeEventListener("click", suppress, true);
      };
      strip.addEventListener("click", suppress, true);
      window.setTimeout(() => strip.removeEventListener("click", suppress, true), 0);
    }
  };

  strip.addEventListener("pointerup", endPointer);
  strip.addEventListener("pointercancel", endPointer);
}

function readCatalog() {
  const node = document.getElementById("menu-catalog");
  if (!node?.textContent) return [];
  try {
    return JSON.parse(node.textContent);
  } catch {
    return [];
  }
}

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return /** @type {CartLine[]} */ ([]);
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @param {CartLine[]} cart */
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent("asados:cart", { detail: cart }));
}

function formatPrice(value) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);
}

/** @param {CartLine[]} cart */
function cartCount(cart) {
  return cart.reduce((sum, line) => sum + line.qty, 0);
}

/** @param {CartLine[]} cart */
function cartTotal(cart) {
  return cart.reduce((sum, line) => sum + line.price * line.qty, 0);
}

function initMenuPage() {
  const catalog = readCatalog();
  /** @type {CartLine[]} */
  let cart = loadCart();

  const bar = document.getElementById("cart-bar");
  const sheet = document.getElementById("cart-sheet");
  const backdrop = document.getElementById("cart-backdrop");
  const closeBtn = document.getElementById("cart-close");
  const linesEl = document.querySelector("[data-cart-lines]");
  const emptyEl = document.querySelector("[data-cart-empty]");
  const footEl = document.querySelector("[data-cart-foot]");
  const chipsNav = document.querySelector(".chips");
  const chips = [...document.querySelectorAll("[data-chip]")];
  const sections = [...document.querySelectorAll("[data-section]")];
  const menuTop = document.querySelector(".menu-top");
  let activeChipId = chips[0]?.getAttribute("data-chip") ?? null;
  let chipScrollLock = false;

  function syncBar() {
    if (!bar) return;
    const count = cartCount(cart);
    const total = cartTotal(cart);
    const countEl = bar.querySelector("[data-cart-count]");
    const totalEl = bar.querySelector("[data-cart-total]");
    const metaEl = bar.querySelector("[data-cart-meta]");
    if (countEl) countEl.textContent = String(count);
    if (totalEl) totalEl.textContent = formatPrice(total);
    if (metaEl) {
      metaEl.textContent = count === 1 ? "1 plato" : `${count} platos`;
    }
    bar.hidden = false;
    bar.classList.toggle("is-visible", count > 0);
    bar.setAttribute("aria-hidden", count > 0 ? "false" : "true");
    bar.setAttribute(
      "aria-label",
      count > 0
        ? `Ver carrito, ${count === 1 ? "1 plato" : `${count} platos`}, total ${formatPrice(total)}`
        : "Ver carrito",
    );
  }

  function syncItemControls() {
    const minusSvg =
      '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
    const plusSvg =
      '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

    document.querySelectorAll("[data-item-controls]").forEach((node) => {
      const id = node.getAttribute("data-item-controls");
      if (!id) return;
      const line = cart.find((entry) => entry.id === id);
      const row = node.closest(".menu-item");
      row?.classList.toggle("is-in-cart", Boolean(line));

      if (!line) {
        node.innerHTML = `<button type="button" class="btn--icon menu-item__add" data-add-item="${id}" aria-label="Agregar al carrito">${plusSvg}</button>`;
        return;
      }

      node.innerHTML = `
        <div class="menu-item__stepper" role="group" aria-label="Cantidad">
          <button type="button" class="menu-item__step" data-qty-dec="${id}" aria-label="Quitar uno">${minusSvg}</button>
          <span class="menu-item__qty" data-item-qty>${line.qty}</span>
          <button type="button" class="menu-item__step" data-qty-inc="${id}" aria-label="Agregar uno">${plusSvg}</button>
        </div>`;
    });
  }

  function renderSheet() {
    if (!linesEl || !emptyEl || !footEl) return;
    const sheetTotal = document.querySelector("[data-cart-sheet-total]");

    if (cart.length === 0) {
      emptyEl.hidden = false;
      linesEl.hidden = true;
      footEl.hidden = true;
      linesEl.innerHTML = "";
      return;
    }

    emptyEl.hidden = true;
    linesEl.hidden = false;
    footEl.hidden = false;
    if (sheetTotal) sheetTotal.textContent = formatPrice(cartTotal(cart));

    const minusSvg =
      '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
    const plusSvg =
      '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

    linesEl.innerHTML = cart
      .map(
        (line) => `
      <li class="cart-line" data-line-id="${line.id}">
        <div>
          <p class="cart-line__name">${line.name}</p>
          <p class="cart-line__price">${formatPrice(line.price * line.qty)}</p>
        </div>
        <div class="cart-line__qty">
          <button type="button" class="btn--icon btn--qty" data-qty-dec="${line.id}" aria-label="Quitar uno">${minusSvg}</button>
          <span class="cart-line__qty-value">${line.qty}</span>
          <button type="button" class="btn--icon btn--qty" data-qty-inc="${line.id}" aria-label="Agregar uno">${plusSvg}</button>
        </div>
      </li>`
      )
      .join("");
  }

  function openSheet() {
    if (!sheet || !backdrop) return;
    sheet.hidden = false;
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      sheet.classList.add("is-open");
      backdrop.classList.add("is-open");
    });
    document.body.style.overflow = "hidden";
  }

  function closeSheet() {
    if (!sheet || !backdrop) return;
    sheet.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    document.body.style.overflow = "";
    window.setTimeout(() => {
      if (!sheet.classList.contains("is-open")) {
        sheet.hidden = true;
        backdrop.hidden = true;
      }
    }, 300);
  }

  /** @param {string} id */
  function addItem(id) {
    const product = catalog.find((item) => item.id === id);
    if (!product) return;
    const existing = cart.find((line) => line.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        qty: 1,
      });
    }
    saveCart(cart);
    syncBar();
    syncItemControls();
    renderSheet();
  }

  /** @param {string} id @param {number} delta */
  function changeQty(id, delta) {
    const line = cart.find((entry) => entry.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart = cart.filter((entry) => entry.id !== id);
    }
    saveCart(cart);
    syncBar();
    syncItemControls();
    renderSheet();
  }

  document.addEventListener("click", (event) => {
    const target = /** @type {HTMLElement | null} */ (event.target instanceof Element ? event.target.closest("[data-add-item], [data-qty-inc], [data-qty-dec], [data-chip]") : null);
    if (!target) return;

    const addId = target.getAttribute("data-add-item");
    if (addId) {
      addItem(addId);
      return;
    }

    const incId = target.getAttribute("data-qty-inc");
    if (incId) {
      changeQty(incId, 1);
      return;
    }

    const decId = target.getAttribute("data-qty-dec");
    if (decId) {
      changeQty(decId, -1);
      return;
    }

    const chipId = target.getAttribute("data-chip");
    if (chipId) {
      chipScrollLock = true;
      const section = document.getElementById(`cat-${chipId}`);
      section?.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveChip(chipId, true);
      window.setTimeout(() => {
        chipScrollLock = false;
        syncActiveChipFromScroll();
      }, 450);
    }
  });

  /** @param {string | null} id @param {boolean} [scrollChip] */
  function setActiveChip(id, scrollChip = true) {
    if (!id || id === activeChipId) {
      if (scrollChip && id) scrollChipIntoView(id);
      return;
    }
    activeChipId = id;
    chips.forEach((chip) => {
      const active = chip.getAttribute("data-chip") === id;
      chip.classList.toggle("is-active", active);
      if (active) chip.setAttribute("aria-current", "true");
      else chip.removeAttribute("aria-current");
    });
    if (scrollChip) scrollChipIntoView(id);
  }

  /** @param {string} id */
  function scrollChipIntoView(id) {
    const chip = chips.find((node) => node.getAttribute("data-chip") === id);
    chip?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }

  function syncActiveChipFromScroll() {
    if (chipScrollLock || !sections.length) return;
    const headerBottom = (menuTop?.getBoundingClientRect().bottom ?? 0) + 12;
    let current = sections[0];
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= headerBottom) current = section;
    }
    setActiveChip(current.getAttribute("data-section"), true);
  }

  bar?.addEventListener("click", openSheet);
  closeBtn?.addEventListener("click", closeSheet);
  backdrop?.addEventListener("click", closeSheet);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && sheet?.classList.contains("is-open")) {
      closeSheet();
    }
  });

  enableChipStripSwipe(chipsNav);

  window.addEventListener("scroll", syncActiveChipFromScroll, { passive: true });
  syncActiveChipFromScroll();

  syncBar();
  syncItemControls();
  renderSheet();
}

const WHATSAPP_NUMBER = String(import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? "").replace(/\D/g, "");
const ORDER_DETAILS_KEY = "asados247-order-details";

/** @typedef {{ name: string, payment: "transferencia" | "efectivo" | "", delivery: "domicilio" | "mesa" | "", address: string, table: string }} OrderDetails */

/** @returns {OrderDetails} */
function emptyDetails() {
  return {
    name: "",
    payment: "transferencia",
    delivery: "mesa",
    address: "",
    table: "",
  };
}

/** @returns {OrderDetails} */
function loadDetails() {
  try {
    const raw = sessionStorage.getItem(ORDER_DETAILS_KEY);
    if (!raw) return emptyDetails();
    const parsed = JSON.parse(raw);
    return {
      name: typeof parsed.name === "string" ? parsed.name : "",
      payment:
        parsed.payment === "efectivo" || parsed.payment === "transferencia"
          ? parsed.payment
          : "transferencia",
      delivery:
        parsed.delivery === "domicilio" || parsed.delivery === "mesa"
          ? parsed.delivery
          : "mesa",
      address: typeof parsed.address === "string" ? parsed.address : "",
      table: typeof parsed.table === "string" ? parsed.table : "",
    };
  } catch {
    return emptyDetails();
  }
}

/** @param {OrderDetails} details */
function saveDetails(details) {
  sessionStorage.setItem(ORDER_DETAILS_KEY, JSON.stringify(details));
}

/** @param {OrderDetails} details */
function paymentLabel(details) {
  if (details.payment === "efectivo") return "Efectivo";
  if (details.payment === "transferencia") return "Transferencia";
  return "—";
}

/** @param {OrderDetails} details */
function deliveryLabel(details) {
  if (details.delivery === "domicilio") return "Domicilio";
  if (details.delivery === "mesa") return "Mesa";
  return "—";
}

/**
 * @param {CartLine[]} cart
 * @param {OrderDetails} details
 */
function buildOrderMessage(cart, details) {
  const lines = cart
    .map((line) => `• ${line.qty}× ${line.name} — ${formatPrice(line.price * line.qty)}`)
    .join("\n");
  const total = formatPrice(cartTotal(cart));

  const parts = [
    "Hola, quiero hacer este pedido en ASADOS 24/7:",
    "",
    lines,
    "",
    `Total: ${total}`,
    "",
    `Nombre: ${details.name.trim() || "—"}`,
    `Pago: ${paymentLabel(details)}`,
    `Entrega: ${deliveryLabel(details)}`,
  ];

  if (details.delivery === "domicilio") {
    parts.push(`Dirección: ${details.address.trim() || "—"}`);
  } else if (details.delivery === "mesa") {
    parts.push(`Mesa: ${details.table.trim() || "—"}`);
  }

  return parts.join("\n");
}

function initOrderPage() {
  /** @type {CartLine[]} */
  let cart = loadCart();
  let step = 1;
  let details = loadDetails();

  const preview = document.querySelector("[data-order-preview]");
  const summary = document.querySelector("[data-order-summary]");
  const confirmSummary = document.querySelector("[data-confirm-summary]");
  const confirmFacts = document.querySelector("[data-confirm-facts]");
  const totalEl = document.querySelector("[data-order-total]");
  const form = /** @type {HTMLFormElement | null} */ (document.getElementById("order-form"));
  const errorEl = document.querySelector("[data-order-error]");
  const emptyState = document.querySelector("[data-order-empty]");
  const filledState = document.querySelector("[data-order-filled]");
  const domicilioField = document.querySelector('[data-delivery-field="domicilio"]');
  const mesaField = document.querySelector('[data-delivery-field="mesa"]');
  const addressInput = /** @type {HTMLInputElement | null} */ (document.getElementById("order-address"));
  const tableInput = /** @type {HTMLInputElement | null} */ (document.getElementById("order-table"));
  const nameInput = /** @type {HTMLInputElement | null} */ (document.getElementById("order-name"));
  const backBtn = document.querySelector("[data-order-back]");
  const nextBtn = document.querySelector("[data-order-next]");
  const sendBtn = document.querySelector("[data-order-send]");
  const footer = document.querySelector("[data-order-footer]");
  const orderPage = document.querySelector(".order-page");
  const stepPanels = [...document.querySelectorAll("[data-order-step]")];
  const stepIndicators = [...document.querySelectorAll("[data-step-indicator]")];

  const minusSvg =
    '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/></svg>';
  const plusSvg =
    '<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';

  function showEmpty() {
    if (emptyState) {
      emptyState.hidden = false;
      emptyState.setAttribute("aria-hidden", "false");
    }
    if (filledState) {
      filledState.hidden = true;
      filledState.setAttribute("aria-hidden", "true");
    }
  }

  function showFilled() {
    if (emptyState) {
      emptyState.hidden = true;
      emptyState.setAttribute("aria-hidden", "true");
    }
    if (filledState) {
      filledState.hidden = false;
      filledState.setAttribute("aria-hidden", "false");
    }
  }

  if (cart.length === 0) {
    showEmpty();
    return;
  }

  showFilled();

  function readDetailsFromForm() {
    if (!form) return { ...details };
    const data = new FormData(form);
    return {
      name: String(data.get("name") ?? ""),
      payment: /** @type {OrderDetails["payment"]} */ (String(data.get("payment") ?? "")),
      delivery: /** @type {OrderDetails["delivery"]} */ (String(data.get("delivery") ?? "")),
      address: String(data.get("address") ?? ""),
      table: String(data.get("table") ?? ""),
    };
  }

  function applyDetailsToForm() {
    if (!form) return;
    if (nameInput) nameInput.value = details.name;

    form.querySelectorAll('input[name="payment"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = input.value === details.payment;
      }
    });
    form.querySelectorAll('input[name="delivery"]').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        input.checked = input.value === details.delivery;
      }
    });

    if (addressInput) addressInput.value = details.address;
    if (tableInput) tableInput.value = details.table;
    syncDeliveryFields();
  }

  function syncDeliveryFields() {
    const current = readDetailsFromForm();
    const isDomicilio = current.delivery === "domicilio";
    const isMesa = current.delivery === "mesa";

    if (domicilioField instanceof HTMLElement) domicilioField.hidden = !isDomicilio;
    if (mesaField instanceof HTMLElement) mesaField.hidden = !isMesa;

    if (addressInput) {
      addressInput.required = isDomicilio;
      if (!isDomicilio) addressInput.value = "";
    }
    if (tableInput) {
      tableInput.required = isMesa;
      if (!isMesa) tableInput.value = "";
    }
  }

  function persistFormDetails() {
    details = readDetailsFromForm();
    if (details.delivery === "domicilio") details.table = "";
    if (details.delivery === "mesa") details.address = "";
    saveDetails(details);
  }

  /**
   * @param {string} message
   * @param {HTMLElement | null} [focusTarget]
   */
  function showError(message, focusTarget) {
    if (!(errorEl instanceof HTMLElement)) return;
    errorEl.textContent = message;
    errorEl.hidden = !message;
    if (message && focusTarget) {
      focusTarget.focus({ preventScroll: false });
      focusTarget.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function renderCartSummary() {
    if (!summary) return;

    if (cart.length === 0) {
      summary.innerHTML = "";
      return;
    }

    summary.innerHTML = cart
      .map(
        (line) => `
      <li class="order-summary__line order-summary__line--editable" data-line-id="${line.id}">
        <div class="order-summary__copy">
          <span class="order-summary__name">${line.name}</span>
          <span class="order-summary__price">${formatPrice(line.price * line.qty)}</span>
        </div>
        <div class="order-summary__stepper" role="group" aria-label="Cantidad de ${line.name}">
          <button type="button" class="btn--icon btn--qty" data-order-qty-dec="${line.id}" aria-label="Quitar uno">${minusSvg}</button>
          <span class="order-summary__qty-value">${line.qty}</span>
          <button type="button" class="btn--icon btn--qty" data-order-qty-inc="${line.id}" aria-label="Agregar uno">${plusSvg}</button>
        </div>
      </li>`
      )
      .join("");
  }

  function renderConfirm() {
    if (confirmSummary) {
      confirmSummary.innerHTML = cart
        .map(
          (line) => `
        <li class="order-summary__line">
          <span class="order-summary__qty">${line.qty}×</span>
          <span class="order-summary__name">${line.name}</span>
          <span class="order-summary__price">${formatPrice(line.price * line.qty)}</span>
        </li>`
        )
        .join("");
    }

    if (confirmFacts) {
      const place =
        details.delivery === "domicilio"
          ? details.address.trim() || "—"
          : details.table.trim() || "—";
      const placeLabel = details.delivery === "domicilio" ? "Dirección" : "Mesa";

      confirmFacts.innerHTML = `
        <div class="order-confirm__fact">
          <dt>Nombre</dt>
          <dd>${details.name.trim() || "—"}</dd>
        </div>
        <div class="order-confirm__fact">
          <dt>Pago</dt>
          <dd>${paymentLabel(details)}</dd>
        </div>
        <div class="order-confirm__fact">
          <dt>Entrega</dt>
          <dd>${deliveryLabel(details)}</dd>
        </div>
        <div class="order-confirm__fact">
          <dt>${placeLabel}</dt>
          <dd>${place}</dd>
        </div>`;
    }

    if (preview) preview.textContent = buildOrderMessage(cart, details);
  }

  function syncTotal() {
    if (totalEl) totalEl.textContent = formatPrice(cartTotal(cart));
  }

  function syncFooterSpace() {
    if (!(footer instanceof HTMLElement) || !(orderPage instanceof HTMLElement)) return;
    const height = Math.ceil(footer.getBoundingClientRect().height);
    if (!height) return;
    // Extra room so focused fields / last blocks clear the sticky bar.
    const space = `${height + 24}px`;
    orderPage.style.setProperty("--order-footer-space", space);
    // Window scrolling uses the viewport; padding on .order-page alone would not help.
    document.documentElement.style.scrollPaddingBottom = `calc(${space} + var(--safe-bottom))`;
  }

  /** @param {number} nextStep */
  function goToStep(nextStep) {
    step = nextStep;

    stepPanels.forEach((panel) => {
      const id = Number(panel.getAttribute("data-order-step"));
      const active = id === step;
      panel.hidden = !active;
      panel.setAttribute("aria-hidden", active ? "false" : "true");
    });

    stepIndicators.forEach((item) => {
      const id = Number(item.getAttribute("data-step-indicator"));
      item.classList.toggle("is-current", id === step);
      item.classList.toggle("is-done", id < step);
      if (id === step) item.setAttribute("aria-current", "step");
      else item.removeAttribute("aria-current");
    });

    if (backBtn instanceof HTMLElement) backBtn.hidden = step === 1;
    if (nextBtn instanceof HTMLElement) nextBtn.hidden = step === 3;
    if (sendBtn instanceof HTMLElement) sendBtn.hidden = step !== 3;

    if (step === 2) {
      applyDetailsToForm();
      showError("");
    }

    if (step === 3) renderConfirm();

    // Instant jump avoids fighting focus/keyboard smooth-scroll on mobile.
    window.scrollTo(0, 0);
    syncFooterSpace();
  }

  /** @returns {boolean} */
  function validateDetails() {
    persistFormDetails();

    if (!details.name.trim()) {
      showError("Escribe tu nombre para continuar.", nameInput);
      return false;
    }
    if (!details.payment) {
      showError("Elige un medio de pago.");
      return false;
    }
    if (!details.delivery) {
      showError("Elige el tipo de entrega.");
      return false;
    }
    if (details.delivery === "domicilio" && !details.address.trim()) {
      showError("Escribe la dirección de domicilio.", addressInput);
      return false;
    }
    if (details.delivery === "mesa" && !details.table.trim()) {
      showError("Escribe el número de mesa.", tableInput);
      return false;
    }

    showError("");
    return true;
  }

  /** @param {string} id @param {number} delta */
  function changeOrderQty(id, delta) {
    const line = cart.find((entry) => entry.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) {
      cart = cart.filter((entry) => entry.id !== id);
    }
    saveCart(cart);
    syncTotal();
    renderCartSummary();

    if (cart.length === 0) {
      showEmpty();
    }
  }

  summary?.addEventListener("click", (event) => {
    const target =
      event.target instanceof Element
        ? event.target.closest("[data-order-qty-inc], [data-order-qty-dec]")
        : null;
    if (!target) return;

    const incId = target.getAttribute("data-order-qty-inc");
    if (incId) {
      changeOrderQty(incId, 1);
      return;
    }

    const decId = target.getAttribute("data-order-qty-dec");
    if (decId) changeOrderQty(decId, -1);
  });

  form?.addEventListener("input", () => {
    showError("");
    persistFormDetails();
  });
  form?.addEventListener("change", () => {
    syncDeliveryFields();
    showError("");
    persistFormDetails();
  });
  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateDetails()) goToStep(3);
  });

  nextBtn?.addEventListener("click", () => {
    if (step === 1) {
      if (cart.length === 0) {
        showEmpty();
        return;
      }
      goToStep(2);
      return;
    }
    if (step === 2 && validateDetails()) goToStep(3);
  });

  backBtn?.addEventListener("click", () => {
    if (step === 3) {
      goToStep(2);
      return;
    }
    if (step === 2) {
      persistFormDetails();
      goToStep(1);
    }
  });

  sendBtn?.addEventListener("click", () => {
    if (cart.length === 0) {
      showEmpty();
      return;
    }
    if (!validateDetails()) {
      goToStep(2);
      return;
    }
    if (!WHATSAPP_NUMBER) {
      showError("Falta configurar el número de WhatsApp.");
      return;
    }
    const message = buildOrderMessage(cart, details);
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  });

  applyDetailsToForm();
  renderCartSummary();
  syncTotal();
  goToStep(1);

  if (footer instanceof HTMLElement && "ResizeObserver" in window) {
    const footerObserver = new ResizeObserver(() => syncFooterSpace());
    footerObserver.observe(footer);
  }
  window.addEventListener("resize", syncFooterSpace, { passive: true });
  syncFooterSpace();
}

const page = document.body.dataset.page;
if (page === "menu") initMenuPage();
if (page === "orden") initOrderPage();

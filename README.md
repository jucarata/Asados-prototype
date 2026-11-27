# ASADOS 24/7 — Menú digital (mock)

Mock de venta: menú digital mobile-first con carrito y preview de orden a WhatsApp.

## Desarrollo

```bash
npm install
npm run dev
```

Abre `http://localhost:4321` (mejor en viewport ~390px).

## Build

```bash
npm run build
npm run preview
```

Copia `.env.example` a `.env` y define `PUBLIC_WHATSAPP_NUMBER` (solo dígitos, con código de país).

## GitHub Pages

El workflow `.github/workflows/deploy-pages.yml` publica en push a `main`.

1. Repo → **Settings → Secrets and variables → Actions** → secret `WHATSAPP_NUMBER` (ej. `573001234567`)
2. Repo → **Settings → Pages** → Source: **GitHub Actions**
3. Tras el deploy: `https://jucarata.github.io/Asados-prototype/`

## Rutas

- `/` — Home con mascota
- `/menu` — Menú + carrito
- `/orden` — Checkout y envío por WhatsApp

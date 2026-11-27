# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Astro (static-first). Cart interactivity via minimal vanilla JS island. No CMS or backend in the sales mock.

## Users

- Primary: diner at the table (QR) or on their phone ordering from the digital menu.
- Secondary (this mock): restaurant owner evaluating the product to replace PDF/physical menus.

## Product Purpose

Digital menu for ASADOS 24/7 where guests browse dishes, add them to a cart, and generate an order destined for WhatsApp. Success for the mock: the flow feels like a real order on a phone, the brand and mascot are unmistakable, and the owner sees clear value versus a PDF menu.

## Positioning

Grill house menu-to-WhatsApp ordering tied to the ASADOS 24/7 bull-chef mascot—not a generic food-delivery template.

## Operating Context

Guests currently order from a PDF or physical menu. The digital menu is reached via QR at the table or the restaurant website. Orders are composed on-device and handed off to WhatsApp (mock shows the preview only; no live send in this build).

## Capabilities and Constraints

- Browse categorized menu, add/remove quantities, view cart total, preview WhatsApp order message.
- Sales mock only: no real WhatsApp number, no CMS, no kitchen backend.
- Mobile-first (~390px primary); desktop as reinforcement.
- Placeholder menu data until real item photos and prices are wired.

## Brand Commitments

- Name: ASADOS 24/7
- Mascot: `Asados pet.png` (bull chef with burger tray)
- Palette (binding): Carbón `#1C1A19`, Naranja brasa `#E8642C`, Ámbar `#F2A541`, Crema `#F5EBDD`, Café madera `#6B4226`, Vino de chorizo `#7D1D1F`
- Type (binding for this build): Oswald (display/brand), Barlow (UI/body)

## Evidence on Hand

- Mascot asset: `Asados pet.png`
- Existing PDF menu: `carta menu asados  nuevas septiembre 2026 curvas.pdf` (reference for categories; mock may use representative placeholders)

## Product Principles

1. Order path beats marketing length—this is a menu app, not an 8-section landing.
2. Brand and mascot lead the first viewport; food leads the menu.
3. Every tap toward “Generar orden” must feel real, even when WhatsApp is mocked.
4. Performance via static Astro; interactivity only where the cart needs it.
5. Preserve the pinned charcoal-grill palette and condensed grill typography.

## Accessibility & Inclusion

Tap targets usable on phone; cream text on charcoal for body contrast; focus states themed to the palette.

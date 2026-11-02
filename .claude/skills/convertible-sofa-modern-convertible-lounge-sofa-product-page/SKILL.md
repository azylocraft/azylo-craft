---
name: convertible-sofa-modern-convertible-lounge-sofa-product-page
description: Build a complete AZYLO product the way the "Modern Convertible Lounge Sofa" (Convertible Sofa Beds) was built — 6 colours × 6 materials, per-colour photo folders, colour cards in the collection, material-index pricing with a genuine MRP, overview/delivery copy, price comparison, free-gift slot machine and reviews. Use when adding a new product to any category (sofa beds, recliners, sofas, tables…), or when asked to make a product "like the modern convertible lounge sofa".
---

# AZYLO product page — the Modern Convertible Lounge Sofa pattern

Reference product: **Modern Convertible Lounge Sofa** — `/products/convertible-lounge-sofa-expandable-frame`,
category **Convertible Sofa Beds** (`convertible-sofa-beds`). Every new product follows the same structure.

## 1. Photo folders (source of truth)

```
D:\Azylocraft\furnitures in my shop\
  <Category name>\                      e.g. Convertible Sofa Beds, Power Reclining Sofas
    <Product name>\                     e.g. Modern Convertible Lounge Sofa
      1-white\  2-grey\  3-olive-green\  4-orange\  5-wheat\  6-beige\
```

- One folder per colour, `<n>-<colour>`; `n` = colour order on the site (default White → Grey → Olive Green → Orange → Wheat → Beige).
- Files are named `NN-<category>-<what>.jpg` and **numbered in website gallery order**:

| # | File | Category on site |
|---|---|---|
| 01 | `studio-front` | Studio — **main photo / card image** (front-facing, like the reference) |
| 02 | `studio-angle` | Studio |
| 03 | `studio-bed-mode` | Studio — **card hover image** (opened / bed view) |
| 04 | `swatch-colour` | Swatch — labelled colour photo (Swatch tab shows all colours) |
| 05+ | `live-…` (in-home sofa, in-home bed, slide-out frame…) | Live (room photos; logo band auto-cropped) |
| next | `detail-armrest`, `detail-fabric-close-up`, `detail-materials`, `detail-dimensions-sofa`, `detail-dimensions-bed`, `detail-spec-sheet-1`, `detail-spec-sheet-2` | Detail |

- Missing photos are fine (e.g. Grey/Beige have no live photos) — just keep the order.
- Photos 1080×1350 (4:5); spec sheets may be near-square. The first photo's shape sets the gallery frame.
- The fabric colour in every photo must match the swatch colour. If a supplier photo is off (the orange set was brown), recolour only the upholstery (see `scratchpad` recolour approach: shift hue/saturation of upholstery pixels, leave background/legs) and save the corrected files in the folder.
- Never use photos copied from other brands' websites (copyright). Use the supplier's/own photos.

## 2. Import to the website (one command)

From `D:\Azylocraft\azylo-store`:

```bash
node scripts/import-colour-product.mjs "../furnitures in my shop/<Category>/<Product>" \
  --slug <url-slug> --name "<Product Name>" --collection <collection-slug> \
  [--price <Performance Fabric price>] [--mrp <genuine PF MRP>]
```

It creates/updates the product (new ones start **unpublished**), uploads every photo tagged with colour +
category (crops the logo band from live photos), links the collection, turns on **"Show each colour as its
own card"**, and creates all **6 materials × N colours** variants with prices from the material price index.
Re-runnable — photos are replaced, variants kept. Collection slugs: `power-reclining-sofas`,
`convertible-sofa-beds`, `small-space-sofas`, `compressed-sofas`, `modular-sectional-sofas`,
`rolling-side-table-with-storage` (smart tables), `new-arrivals`, `best-selling-sofas`.

## 3. Materials & pricing

- Materials (Admin → Settings index, shared by all products), cheapest first:
  Performance Fabric (PF) 100% · Linen 115% · Half Leather (Leather Match) 145% · Velvet 160% · Bouclé 180% · Full Leather 250%.
- Set **one** price (PF) in Admin → Products → product → **Variants & pricing**; every material/colour follows the index. Bulk: Admin → Products list → select → **Set base price** (+ optional MRP).
- **MRP (struck price) must be a genuine price** the product has been listed/sold at (CCPA dark-patterns guidelines). Never invent an MRP by marking up the price; confirm with the owner before entering one. Display: `↓30% ~~₹71,430~~ ₹50,000`.
- Keep test-mode Razorpay orders under the account limit (≈₹15,000) when test-paying.

## 4. Product copy (Admin → Products → product)

- **Name**: short, title case (e.g. "Modern Convertible Lounge Sofa") — the card shows the part before any " — ".
- **01 Product overview** (Markdown; paste plain text and press *Format pasted text*): intro, feature sections, **Choose Your Upholstery** (the 6 materials, one line each), **Six Colours**, comfort options (Foam / Latex / **Super Soft Foam**), Product Details (bold labels), Why You'll Love It, **Before Ordering** (Material / Colour / Comfort only — no manufacturer size lists), closing line.
- **02 Delivery & access**: measuring checklist, recommended clearance callout, delivery service list, "Contact us before ordering" callout.
- **03 Shipping, payment & returns** comes from Admin → FAQs (shared).
- Sections 01–03 start **open**; FAQ questions inside 03 start closed.
- Eyebrow/card tag, short description, lead time 45–55 days.

## 5. Page features that must be present

- Colour picker (6 swatches) → gallery shows that colour's photos; `?colour=<slug>` links preselect a colour; the selected colour shows under the name.
- Material picker cards (texture tinted with the colour, badge, tagline, "Included" / "+₹…") + "Why <material>?" panel — copy in `src/lib/material-info.ts`.
- Gallery tabs All / Studio / Live / Swatch / Detail (only non-empty tabs), sticky on desktop.
- Free-gift **slot machine** in the gift box (Gifts page uses the clock wheel) — gifts in Admin → Settings.
- **Price comparison** (Admin → product → Price comparison → *Save comparison*): real competitor link, price, taxes/delivery flags, notes when it's only a similar product. Shows "you save ₹X" under the price.
- **Reviews**: only genuine customer reviews (Admin → product → Reviews). Never fabricate reviews or tick "Verified" without a real purchase. 3+ published reviews → scrolling top-5 strip.
- Collection page: one card per colour (front photo, bed-mode on hover, colour dot, ↓% MRP when set). Optionally use a bright room photo as the collection banner (Admin → Collections).

## 6. Finish

1. Check the product page (each colour, each gallery tab, mobile + desktop) and the collection cards.
2. Publish the product in Admin (Visibility → Published).
3. Commit + push any code changes (secret scan first — see project memory "push every change").

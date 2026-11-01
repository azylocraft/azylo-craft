# AZYLO store — build plan

## Context
You want a working premium furniture store (web only, responsive on phones) built to match the AZYLO Claude Design screens, with Supabase as the backend, **Razorpay (test mode) instead of Stripe** everywhere, and an admin panel where you upload product photos, product videos and live/real-space photos without editing code. The workspace is empty of code right now. It has the design export, PROJECT_SPEC.md and reference screenshots.

## Confirmed decisions
- Web only (responsive for mobile browsers), built with **Next.js App Router**.
- GitHub repo **`azylo-store`, private**.
- "Live photos" are a separate `live` image type (factory/production photos) with their own gallery group on the product page.
- Razorpay replaces Stripe everywhere.

## Step 0 result: design import
- **The claude_design MCP isn't connected in this session.** The only design tool available is DesignSync, and it's reserved for syncing design systems. **I used the local copy in `AZYLO website design/azylo/`**, which you said holds the same files: `AZYLO Screens.html` plus az-kit, az-a-c, az-d-e, az-f-h, az-i-k, az-l-o and az-canvas.
- The canvas holds **98 screens** in sections A–O (desktop 1440 wide, mobile 390×844). It also traces 4 flows: Purchase 9→12→20→31→39→44, Journal 9→62→64→20, Account 9→46→51→53→55→57→58, Wishlist 12→37→20.

### Screen list (98)
- **A First visit:** 1 Home + cookie preferences · 2 Language & currency selector
- **B Global nav:** 3 Categories dropdown · 4 Discover dropdown · 5 Search overlay (empty) · 6 Live suggestions · 7 Search results · 8 No results
- **C Home:** 9 Home, full length · 10 Explore by Type, Sofa Beds tab · 11 Footer, newsletter subscribed
- **D Collections:** 12 Power Reclining · 13 Compressed (7) · 14 Small-Space (16) · 15 Sort open · 16 Filter drawer · 17 Active filter chips · 18 No matches · 19 Grid loading
- **E Product:** 20 PDP top · 21 Custom colour · 22 Video modal · 23a Real spaces · 23b Real-spaces lightbox · 24 Accordion: overview · 25 Accordion: delivery & access · 26 Accordion: shipping/payment/returns · 27a Ask a question form · 27b Question sent · 28 Share, link copied · 29 Sticky mini bar · 30 PDP loading
- **F Cart & wishlist:** 31 Cart drawer, 2 items · 32 Note open · 33a Discount applied · 33b Invalid code · 34 Empty cart · 35 Full cart page · 36 Remove confirmation · 37 Wishlist, 3 saved · 38 Wishlist empty
- **G Checkout:** 39 Contact & delivery · 40 Shipping method · 41 Payment · 42 Processing · 43 Declined · 44 Confirmation
- **H Account:** 45 Sign up · 46 Log in · 47 Wrong password · 48 Forgot password · 49 Reset link sent · 50 Set new password · 51 Account drawer · 52 Orders empty · 53 Orders list · 54 Order detail + tracking · 55 Profile · 56 Edit name · 57 Add address · 58 Saved addresses · 59 Delete address confirm · 60 Log out confirm · 61 Sign out of all devices
- **I Journal:** 62 Guides landing · 63 Guide article + sticky Contents · 64 Product-review article + CTA · 65 Article footer
- **J Materials:** 66 Materials Guide, full length · 67 Velvet tab selected
- **K Help & company:** 68 About · 69 Contact · 70 Contact validation errors · 71 Message sent · 72 FAQ · 73 FAQ no results · 74 Shipping policy · 75 Return & Refund · 76 Privacy · 77 Terms · 78 Chat panel open
- **L Settings:** 79 Cookie prefs reopened · 80 Marketing toggled off · 81 Français / EUR applied
- **M System:** 82 No internet · 83 404 · 84 Something went wrong
- **N Admin:** 85 Products list · 86 Product editor · 87 Orders list · 88 Order detail & status · 89 Inbox
- **O Mobile web:** 90 Home · 91 Menu drawer · 92 Collection · 93 Product · 94 Cart drawer · 95 Checkout

### Theme tokens (from az-kit.jsx → `src/theme/tokens.ts`)
- **Colours:** bg #F7F4EE, bg2 #FBF9F5, card #FFFFFF, ink #151412, ink2 #2B2926, muted #6E685F, faint #A19A8F, line #E7E1D6, line2 #EFEAE1, gold #A57A36, goldSoft #F5EEE1, goldLine #DCC79F, cream #EEE6D7, dark #1A1917, dark2 #25231F, green #2E7D57, blue #2F6FE4, red #B93A2B, redSoft #FBEDEA. Footer greys: #B8B1A6, #8E877C, #34312C, #D9D3C8.
- **Fonts:** Manrope 400–800 (UI and headings), Instrument Serif italic (gold accents), JetBrains Mono (labels).
- **Type:** H = weight 800, letter-spacing −0.035em, line-height 1.04, sizes 26–110. P = 15 px, line-height 1.65, muted. Eyebrow = 11 px, weight 700, tracking .18em, uppercase, gold, with a 28 px rule before it.
- **Radii:** pills 999, cards 20–24, modals 28, fields 14, footer block 28.
- **Shadows:** card `0 1px 2px rgba(26,25,23,.04), 0 12px 32px -14px rgba(26,25,23,.14)`; float `0 30px 80px -20px rgba(26,25,23,.35)`; soft `0 8px 24px -12px rgba(26,25,23,.18)`.
- **Controls:** buttons sm/md/lg = 36/46/54 high, in kinds dark/outline/light/gold/ghostW/white/disabled. Chip 36. Round icon button 44. Badge 22. Toggle 44×26. Stepper 48 (36 small). Field 52 (textarea 140).
- **Icons:** Lucide.
- **Mock data I won't ship:** AZP product names and prices, hello@azylo.ca, +1 514 555-0182, the Montréal address, review counts, the EUR 0.66 rate, and "Daniel".

## Findings and blockers (please read)
1. **`.secret` is empty (0 bytes).** I don't have the Supabase access token, so I can't create the project until you paste it in (see SETUP.md).
2. **I didn't find a GitHub PAT** anywhere in the workspace. **The `gh` CLI isn't installed**, and neither is the Supabase CLI. Node 26.13 and git 2.56 are installed. I'll run the Supabase CLI through `npx supabase`. I'll create the repo through the GitHub REST API, reading the token from an environment variable. Android tooling isn't needed (web only).
3. **`/assets/` and `/reference/` don't exist.** The reference screenshots and the product PDF are in `images/` and `images/New folder/`, and I'll use them for comparison. The `chatgpt prompt_Claude_Code_Pack/catalog` folder holds data scraped from the reference site (androf.shop URLs). Per your content rules, **I will not import it**. Products come only from your `assets/products/<slug>/` folders or the admin panel.
4. `prompt.txt` says to "reproduce the reference website". That conflicts with your current rules (no reference brand, text or photos). I'll follow your current message.

### Razorpay in place of Stripe: what changes (closest equivalents)
- **Checkout UI:**
  - Stripe Payment Element → Razorpay Standard Checkout (`checkout.js`). The PaymentSheet is dropped (web only).
  - **Approximation:** screen 41 draws inline card fields. Razorpay's standard flow opens its own secure modal, and inline card fields need Razorpay "custom checkout" approval. The Payment section will match the design's card and copy, and Pay now opens the Razorpay modal.
- **Express pay:** Razorpay has no Apple Pay. I'll hide the Google Pay / Apple Pay express row. Razorpay's modal shows the wallets and methods it supports for your account.
- **Server flow:**
  - `create-payment-intent` becomes `create-razorpay-order`. It recalculates the total in CAD on the server and creates a Razorpay Order (amount in cents).
  - A new `verify-payment` function checks the HMAC signature the client receives.
  - `razorpay-webhook` (events `order.paid` and `payment.captured`, X-Razorpay-Signature check) is the source of truth. It marks the order paid, writes orders and order_items, decrements stock, sends the email and clears the cart.
  - The confirmation page polls by `razorpay_order_id`.
- **CAD:** Razorpay charges CAD only when International Payments are enabled on your account, and Razorpay accounts generally need an Indian business. Test mode usually allows it. If CAD is refused, I'll stop and tell you.
- **Test card:** 4242 4242 4242 4242 is a Stripe card and won't work with Razorpay. The Playwright test will use Razorpay's documented test card plus the test-mode Success page. The requirement becomes: **a Razorpay test card creates an order.**

## Scope change (your mid-planning message): web only
- No Android or native app. Everything Android-specific is out: Expo dev build, PaymentSheet, react-native-razorpay, expo-video, AsyncStorage, the `azylo://` deep link and the Android test steps.
- The site must be fully responsive and touch-friendly in mobile browsers. Screens 90–95 are the mobile reference.
- The design's "AZYLO App" / Google Play items stay as website content with a "Coming soon" badge, since they're in the design. This isn't app development.
- **Stack change:** Expo was only chosen for the Android build. For web only I recommend **Next.js (App Router)**:
  - Real server rendering gives per-page SEO and Open Graph tags.
  - New products added in admin get SEO-ready pages right away, which removes the static-export gotcha below.
  - `sitemap.xml` can be generated from Supabase as a route.
  - Accessible primitives and the design's CSS (blur, `color-mix`, masks) work natively, so fewer effects need approximating.

## Stack and libraries
| Need | Choice | Why |
|---|---|---|
| App | **Next.js (latest, App Router) + TypeScript** | SSR/ISR, `generateMetadata` for SEO/OG, a sitemap route, code splitting by route |
| Styling | **Tailwind CSS v4**, with tokens defined in `src/theme/tokens.ts` and exposed as CSS variables | Typed theme used everywhere, no hardcoded values |
| Data | `@supabase/supabase-js` + `@supabase/ssr` (cookie sessions) + **TanStack Query** on the client | Sessions persist across browser restarts; per-section loading, error and Retry |
| Local state | **Zustand** + persist (localStorage) | Guest cart, wishlist, recently viewed, language/currency, cookie choice |
| Forms | **react-hook-form + zod** | Same zod schemas reused in edge functions |
| i18n | **next-intl** with en.json / fr.json | Language applies instantly and persists |
| UI primitives | **Radix UI** (Dialog, Tabs, DropdownMenu, Accordion, Toast) | Keyboard and ARIA support built in (Materials tabs, menus, modals) |
| Carousels | **Embla Carousel** | Arrows, progress bar, touch swipe |
| Icons and fonts | **lucide-react**; `next/font/google` for Manrope, Instrument Serif, JetBrains Mono | Same icons and fonts as the design |
| Images | `next/image` (lazy, responsive) with Supabase Storage as the source | Performance |
| Markdown | react-markdown | Articles and policies |
| Admin | @dnd-kit (reorder), **tus-js-client** (resumable video uploads) | Large videos upload reliably |
| Payments | Razorpay `checkout.js` | Web Standard Checkout |
| Email | Resend (REST from `send-email`) | Skipped quietly until a key exists |
| Tests | Playwright (desktop 1440 and mobile 390 viewports) | Web E2E for each feature |

## Project structure (new folder `D:\Azylocraft\azylo-store\`, which becomes the git repo)
```
src/app/                Next.js routes: page (home), collections/[slug], products/[slug], search,
                        cart, checkout, checkout/confirmation, account/*, auth/*, pages/[slug]
                        (policies, about, contact, faq, blogs, sofa-materials-guide, gift-cards),
                        blogs/[slug], admin/*, not-found, error, sitemap.ts
src/theme/              tokens.ts (colours, type, radii, shadows, spacing), fonts.ts
src/components/ui/      Btn, Chip, Round, Badge, Card, Field, Toggle, Check, Radio, Stepper, Skel,
                        Eyebrow, H, P, Serif, Logo, Crumb, Overlay, Drawer, Modal, Confirm, Missing
src/components/shop/    Header, CategoriesPanel, DiscoverMenu, LocaleMenu, MobileMenu, Footer, AppStrip,
                        ChatPill, PCard, GCard, Carousel, SearchOverlay, CartDrawer, WishDrawer…
src/features/           cart, wishlist, auth, checkout, catalog, journal, materials, admin (hooks + queries)
src/lib/                supabase (browser/server), money.ts (CAD → currency), i18n, storage, razorpay.ts
src/i18n/               en.json, fr.json
supabase/migrations/    schema, RLS, rate_limits, seed (no mock data)
supabase/functions/     contact, newsletter, product-question, validate-discount,
                        create-razorpay-order, verify-payment, razorpay-webhook, send-email, _shared/
scripts/                import-products.ts
assets/products/<slug>/ your product.json + media (media gitignored; Storage is the store)
e2e/                    Playwright specs
README.md, SETUP.md, .env.example
```
`MISSING: <field>` is a single `<Missing field=…/>` component used everywhere data is absent.

## Admin media (your request)
- In the product editor (screen 86), drag-drop or browse uploads for:
  - **Photos**, with an image type per photo: studio / real_space / **live** / swatch / detail / dimension.
  - **Product videos**: mp4/webm, resumable upload with a progress bar, and an optional poster frame.
  - **Live photos**.
- Each photo gets alt text, can be dragged to reorder, and has delete with confirmation.
- Files go to the `product-media` bucket (public read, admin write) under `products/<slug>/…`.
- The free Supabase plan limits each file to 50 MB. I'll show a clear error above that.
- The same uploader handles collection, article and material images.

## Database and backend
- Migrations create all the tables you listed: products, product_variants, product_images (image_type enum, sort_order, alt), product_videos, collections, product_collections (sort_order), swatches, materials, product_materials, articles, pages, faqs, store_settings, profiles (role), addresses, carts, cart_items, wishlists, orders (razorpay_order_id, razorpay_payment_id, status, tracking), order_items, discounts, newsletter_subscribers, contact_messages, product_questions, reviews, exchange_rates, tax_rates. I'm adding a `rate_limits` table.
- Per-language fields are `*_en` / `*_fr` columns.
- RLS on every table:
  - Catalogue and content: public read.
  - Owners only: carts, wishlist, addresses, orders, messages.
  - Writes to content/catalogue tables: admins only, via an `is_admin()` SQL function.
- **Seed contents:**
  - 9 collections (slugs only, other fields MISSING).
  - The 12 Journal titles with body `MISSING: article content`.
  - Policy and About page shells.
  - FAQ groups.
  - The 6 upholstery material rows (MISSING content).
  - CAD = 1 exchange rate. The other rates stay MISSING until you enter them.
  - The current Canadian GST/HST/PST rates. Please verify these in admin.
- **No products** are seeded.
- Auth uses email + password. Redirect URLs cover localhost:3000, your LAN URL and your production domain (added later).
- When you register your first account, I'll run the SQL that makes it admin.

## Build order (spec §17, Stripe → Razorpay)
1. Repo, secrets hygiene, Next.js, tokens and fonts, Supabase project + schema + RLS + seed, Header (all menus), Footer. **Stop here.** The Home page header, hero and footer will be running at localhost so you can confirm hot reload. Then I create the GitHub repo and make the first push.
2. Home (all sections, carousels, type tabs).
3. Collections, cards, filters, sort, pagination, search overlay and results.
4. Product page (gallery, video modal, real spaces, variants, buy box, concierge, accordions, sticky bar, recommendations).
5. Cart drawer and page, wishlist, chat pill, auth, account drawer and portal.
6. Checkout with **Razorpay** test mode, webhook, orders, confirmation.
7. Journal, both article templates, Materials Guide, About, Contact, FAQ, policies, cookie banner, system screens.
8. i18n EN/FR and currency switching.
9. Admin panel (products + media uploads, collections, inventory, orders, editors, inbox) and `npm run import:products`.
10. Responsive 360/768/1280 and the mobile-browser touch pass (screens 90–95), accessibility, performance, SEO/OG, sitemap.

After each feature: run its Playwright tests, compare screenshots with the design and `images/`, list the differences and fix them. Then I tell you what to test, wait for your OK, and commit and push. Before every push I scan for secrets (`git diff --cached` checked against key patterns, with .env/.secret ignored).

## Dev server and testing
- `npm run dev` runs `next dev -H 0.0.0.0` with hot reload. Open http://localhost:3000 on this PC, and http://<your-LAN-IP>:3000 in your phone's browser on the same Wi-Fi. Windows Firewall may ask once; allow Private networks.

## SETUP.md (I'll create this at `azylo-store/SETUP.md`)
1. **Supabase token:** open `D:\Azylocraft\.secret` and paste your Supabase personal access token (supabase.com → Account → Access Tokens). It goes on one line with nothing else, and you save the file. I'll create the project in region `ca-central-1` and store the URL, anon key, service-role key and DB password in `azylo-store/.env` myself.
2. **GitHub PAT:** create a fine-grained token (github.com → Settings → Developer settings → Fine-grained tokens) with Repository access "All repositories", Administration: Read & write, and Contents: Read & write. Save it as a user environment variable named `GITHUB_TOKEN`. In PowerShell, run `[Environment]::SetEnvironmentVariable('GITHUB_TOKEN','<token>','User')`, then restart VS Code. Don't paste it into chat.
3. **Razorpay test keys:**
   - At dashboard.razorpay.com, switch to Test Mode, then Account & Settings → API Keys → Generate Test Key. Put the **Key ID** (`rzp_test_…`, which is safe to ship) in `.env` as `NEXT_PUBLIC_RAZORPAY_KEY_ID`, and the **Key Secret** as `RAZORPAY_KEY_SECRET`.
   - Under Settings → International Payments, request or enable international payments so CAD works.
   - Webhooks: I'll give you the URL and a secret to paste, or set it via API if your plan allows.
4. **Resend (optional for now):** sign up at resend.com, verify your sending domain, create an API key and put it in `.env` as `RESEND_API_KEY`. Until then, these emails are skipped and listed as pending: order confirmation, contact notification to the store, and product-question notification. Supabase auth emails (confirm, reset) on the default sender only reach a few addresses per hour, so I'll switch Supabase Auth SMTP to Resend once the key exists.
5. **Your content:** put each product in `azylo-store/assets/products/<slug>/` with `product.json` (I'll provide a template), plus images/ and videos/. Or upload everything in /admin. Also send the store email, phone, address, policies and About copy whenever they're ready; until then they show MISSING.
6. **First admin:** open http://localhost:3000/auth/sign-up, register, and tell me. I'll make that account admin.
7. **Phone testing:** connect the phone to the same Wi-Fi and open the LAN URL I give you in Chrome.
8. **Never commit** `.env` or `.secret`. Both are already in `.gitignore`.

## Verification
- Phase 1: the dev server runs, Home renders with the design fonts and tokens, an edit hot-reloads in your browser, and the LAN URL opens on your phone.
- Each phase: the Playwright specs from spec §18 pass (`npx playwright test`) in desktop and mobile viewports, and screenshots at 360/768/1440 are compared with the design screens.
- End-to-end flows 1–4 from the design canvas.
- Checkout: a Razorpay test card creates a paid order through the webhook, the order shows in /account and /admin, and stock decrements.
- Security: RLS tests (anon user can't read another user's cart or orders, non-admin can't write products), and a secret scan before every push.

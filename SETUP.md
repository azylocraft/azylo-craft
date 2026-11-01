# AZYLO — what you need to do

Everything else I do myself. These are the only steps that need you, in order of when I need them.

## Right now — check the first screen

1. Open **http://localhost:3000** on this PC. The dev server is already running. To start it again later, open a terminal in `D:\Azylocraft\azylo-store` and run `npm run dev`.
2. On your phone, join the same Wi-Fi and open **http://192.168.1.183:3000** in Chrome.
   - If it doesn't load, Windows Firewall is blocking it. Allow "Node.js" on **Private networks**: Windows Security → Firewall → Allow an app.
3. Tell me whether the page looks right and whether my next change shows up without you refreshing.

## Before the database step

### 1. Supabase access token
1. Sign in at https://supabase.com and click your avatar → **Account preferences → Access Tokens → Generate new token**. Name it `azylo-claude`.
2. Open `D:\Azylocraft\.secret`, paste **only the token** on the first line, and save. The file is outside the repo and is never committed.
3. Tell me "token added".

With the token I create the project (region **ca-central-1**, Canada), the database, tables, security rules, storage bucket, auth settings and server functions. The project keys go into `azylo-store/.env.local` automatically, and you never open the Supabase dashboard.

> Free plan note: Supabase pauses free projects after a week without visits, and each uploaded file must be 50 MB or smaller. Compress long product videos, or upgrade to Pro later.

## Before the first GitHub push

### 2. GitHub token (never paste it into the chat)
1. Go to https://github.com/settings/personal-access-tokens/new (fine-grained token).
2. Set **Repository access** to **All repositories**. Under **Permissions → Repository**, set **Administration** to Read and write and **Contents** to Read and write.
3. Generate the token and copy it.
4. In PowerShell, run this, replacing the placeholder (the token is stored only in your Windows user environment):
   ```powershell
   [Environment]::SetEnvironmentVariable('GITHUB_TOKEN','paste-token-here','User')
   ```
5. **Fully close and reopen VS Code** so the new variable is picked up, then tell me "GitHub token set".

I'll create the private repo **azylo-store** and push. The token is passed to git through a credential helper that reads the environment variable. It is never written to the remote URL, a file or a log.

## Before checkout (phase 6)

### 3. Razorpay test keys
1. Sign in at https://dashboard.razorpay.com and switch the toggle at the top to **Test Mode**.
2. Go to **Account & Settings → API Keys → Generate Test Key**.
3. Open `azylo-store/.env.local` and add:
   ```
   NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxx
   RAZORPAY_KEY_SECRET=xxxxxxxx
   ```
   The Key ID is safe in the browser. The secret only goes into Supabase function secrets, and I copy it there for you.
4. Enable **International Payments**: **Account & Settings → International payments**. Without it, Razorpay may refuse to charge in **CAD**. If it refuses, I'll tell you rather than switch currencies.
5. When checkout is built, I'll give you a webhook URL and secret to paste under **Account & Settings → Webhooks** (events `order.paid` and `payment.captured`).

Testing: `4242 4242 4242 4242` is a Stripe card and **does not work on Razorpay**. Use a test card from Razorpay's docs (https://razorpay.com/docs/payments/payments/test-card-details/). In test mode, Razorpay shows a page where you click **Success** or **Failure**.

## Optional, whenever you like

### 4. Email (Resend)
1. Sign up at https://resend.com, add and verify your sending domain, then create an API key.
2. Add `RESEND_API_KEY=re_xxxxxxxx` to `azylo-store/.env.local` and tell me which address to send from and which store inbox receives messages.

Until then these emails are **skipped, not failed**: order confirmation, the new-contact-message notification and the new-product-question notification. The customer's action still succeeds. Supabase's built-in sender for sign-up confirmation and password reset is limited to a few emails per hour. I'll move it to Resend once the key exists.

### 5. Your content
- **Products:** create one folder per product at `azylo-store/assets/products/<product-slug>/` containing `product.json`, `images/` and `videos/`. I'll add a `product.json` template in phase 9, then you run `npm run import:products`. You can also do everything in **/admin**: photos (studio / real space / live / swatch / detail / dimension), product videos, variants, prices and stock.
- **Store details:** email, phone, address and opening hours go in Admin → Store settings.
- **Words:** About-us copy, the four policies, FAQ answers and articles go in the admin editors. Until you add them, the site shows a red `MISSING: …` label instead of made-up text.

### 6. Become admin
After the database exists, register at http://localhost:3000/auth/sign-up and tell me. I'll make that first account an admin, and then **/admin** opens for you.

## Never commit secrets
`.env`, `.env.*` and `.secret` are git-ignored, and I scan staged files for keys before every push. If you ever paste a key somewhere by mistake, tell me and we'll rotate it.

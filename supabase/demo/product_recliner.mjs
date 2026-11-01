// Rich overview / delivery copy for the Electric Recliner Sofa Bed, built from the
// supplier's product sheet (PDF). Usage: node supabase/demo/product_recliner.mjs
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1).replace(/^"|"$/g, "")]),
);
const db = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const img = (name) => `${env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-media/demo/${name}.webp`;

const overview = `**If you choose the Custom colour option, we'll contact you after you order to confirm your colour before production starts.**

### Important information
- Every piece is **made to order** in your chosen model and colour. Production and delivery take **45–55 days**.
- Soft furniture can vary by **3–5 cm** from the listed measurements. Please refer to the actual product.
- Fabric samples and leather samples are available free of charge — ask us through the contact page.

### Key features
- **Electric recline** — a handle switch moves the backrest smoothly from upright to fully flat.
- **Silent motor** — powerful and durable, quiet enough for late-night use.
- **Sofa to bed in seconds** — extends to about 210 cm for lounging or sleeping.
- **Pet-friendly fabric** — cat-scratch resistant, water-repellent, stain-resistant, snag-proof, anti-hair and anti-pilling.
- **Built to last** — export-grade reinforced steel bracket, solid wood frame, serpentine springs plus webbing.

### Dimensions & sizing
| Measurement | Size |
|---|---|
| Overall width | ≈ 110 cm |
| Overall height | ≈ 100 cm |
| Full extension | ≈ 210 cm |
| Seat width | 105 cm |
| Seat depth | ≈ 50 cm |
| Length (seated / extended base) | 165 cm / 105 cm |

![Dimensions of the electric recliner sofa bed](${img("p007")})

### Available colours
**Cat-claw fabric:** Khaki Beige (main display), Champagne Orange, Dark Green, plus 10 numbered fabric shades.

![Cat-claw fabric colour options](${img("p001")})

**Fabric options:** Cream White, Sand Rice, Pink, Coral Orange, Dark Brown, Dark Green, Graphite Gray, Black.

![Fabric colour options](${img("p002")})

**Imported thick leather (17 colours):** Cream White, Rice, Beige White, Mist Beige, Ivory, Taupe, Light Khaki, Dark Beige, Biscuit, Ash Brown, Cognac, Hazel Brown, Charcoal Gray, Coffee Brown, Wine Red, Dark Gray, Midnight Black.

![Imported leather colour options](${img("p003")})

### Quality revealed in every detail
1. **Handle switch** — electric recline handle
2. **Armrest & back cushion** — 3A plush cotton, soft and cosy
3. **Upholstery fabric** — claw-resistant tech fabric, water-repellent and wear-resistant
4. **Functional bracket** — export-grade reinforced steel frame
5. **Silent motor** — powerful and durable
6. **Base structure** — serpentine springs plus webbing for long-lasting support
7. **Frame structure** — solid wood, crack-resistant, strong load-bearing, no squeaks

![Materials and mechanism overview](${img("p013")})
![Support frame, motor, base and solid wood frame](${img("p015")})
![Pet-friendly fabric](${img("p009")})
![Solid wood frame](${img("p010")})
![High-resilience plush cotton filling](${img("p011")})

### Why choose this sofa bed?
- **Stylish look** — creamy neutral tones that suit modern rooms
- **Ergonomic support** — the adjustable backrest contours to your spine
- **Compact size** — good for small homes and apartments
- **Convertible bed** — switch from sofa to bed effortlessly

### Perfect for
Living rooms, studio apartments, guest rooms and anyone who wants a recliner by day and a comfortable bed at night.

### Live photos
![Champagne orange fabric](${img("p004")})
![Dark green fabric](${img("p005")})
![Dark green, side view](${img("p006")})
![Cream leather](${img("p016")})
![Motor control detail](${img("p014")})`;

const delivery = `### Access & delivery requirements
Before ordering, please measure every point the sofa must pass through:
- **Doors** — width and height of the building and apartment doors
- **Hallways** — width, and any tight turns
- **Stairs** — width, ceiling height and landings
- **Elevator** — door width, cabin depth and diagonal height
- **Corners** — the turning space where hallways meet

As a guide, allow at least **10 cm of clearance** beyond the sofa's smallest packed dimension.

### Delivery service
**Included:** free delivery to your building entrance, tracking details by email, and delivery-day coordination.

**Not included:** carrying upstairs or into the room, assembly, and removal of packaging or old furniture — contact us before ordering if you need help with these.`;

const { error } = await db
  .from("products")
  .update({ overview_en: overview, delivery_access_en: delivery, short_description_en: "An electric recliner that becomes a full bed in seconds — silent motor, solid wood frame and pet-friendly fabric." })
  .eq("slug", "electric-recliner-sofa-bed");
console.log(error ? error.message : "updated electric-recliner-sofa-bed");

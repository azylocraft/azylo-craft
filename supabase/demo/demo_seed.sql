-- DEMO DATA (from the Claude Design mock-ups). Safe to re-run.
-- Remove everything with: npm run demo:remove  (runs demo_remove.sql)

do $$
declare
  p jsonb;
  pid uuid;
  i int := 0;
  m int;
  c int;
  colors jsonb := '[["Khaki Beige","Beige kaki","#C9B48F"],["Champagne Orange","Orange champagne","#D9A066"],["Dark Green","Vert foncé","#3F5446"]]';
  products jsonb := '[
    {"slug":"electric-recliner-sofa-bed","name":"Electric Recliner Sofa Bed – Comfort, Design & Innovation","price":2820,"tone":"#E4DACA","eyebrow":"Power comfort","fn":["electric","convertible"],"cols":["power-reclining-sofas","convertible-sofa-beds","best-selling-sofas"],"rev":3,"new":false,"best":true,"featured":false},
    {"slug":"modular-corduroy-sofa-bed-storage-arms","name":"Modular Corduroy Sofa Bed with Storage Arms","price":1961.5,"tone":"#CDBEA6","eyebrow":"Convertible sofa bed","fn":["modular","convertible","storage"],"cols":["convertible-sofa-beds","modular-sectional-sofas","new-arrivals"],"rev":0,"new":true,"best":false,"featured":false},
    {"slug":"compressed-sofa-bed-3-in-1","name":"Compressed Sofa Bed 3-in-1, Box-Delivered","price":1320,"tone":"#D9D3C8","eyebrow":"Compact solution","fn":["convertible"],"cols":["compressed-sofas","small-space-sofas"],"rev":0,"new":false,"best":false,"featured":false},
    {"slug":"zero-wall-power-recliner-chair","name":"Zero-Wall Power Recliner Chair with Lay-Flat Bed","price":2520,"tone":"#EAE3D6","eyebrow":"Power comfort","fn":["electric"],"cols":["power-reclining-sofas"],"rev":5,"new":false,"best":false,"featured":false},
    {"slug":"modular-zero-wall-power-sectional","name":"Modular Zero-Wall Power Sectional with Console","price":4760,"tone":"#BFA488","eyebrow":"Modular configuration","fn":["electric","modular","storage"],"cols":["power-reclining-sofas","modular-sectional-sofas","new-arrivals","best-selling-sofas"],"rev":0,"new":true,"best":true,"featured":false},
    {"slug":"electric-sofa-bed-remote-control","name":"Electric Sofa Bed with Remote Control","price":3080,"tone":"#C8CBBF","eyebrow":"Power comfort","fn":["electric","convertible"],"cols":["power-reclining-sofas","convertible-sofa-beds"],"rev":2,"new":false,"best":false,"featured":false},
    {"slug":"modern-convertible-lounge-sofa-deep-seat","name":"Modern Convertible Lounge Sofa – Deep Seat","price":2630,"tone":"#DCD0BE","eyebrow":"Customizable sofa","fn":["convertible","modular"],"cols":["convertible-sofa-beds","modular-sectional-sofas","best-selling-sofas"],"rev":0,"new":false,"best":true,"featured":false},
    {"slug":"convertible-striped-sofa-bed","name":"Convertible Striped Sofa Bed with Adjustable Recline","price":1320,"tone":"#B7A58E","eyebrow":"Convertible sofa bed","fn":["convertible"],"cols":["convertible-sofa-beds","best-selling-sofas"],"rev":0,"new":false,"best":true,"featured":false},
    {"slug":"japanese-vintage-foldable-sofa-bed","name":"Japanese Vintage Foldable Sofa Bed","price":3060,"tone":"#E8E1D3","eyebrow":"Convertible sofa bed","fn":["convertible"],"cols":["convertible-sofa-beds","compressed-sofas"],"rev":4,"new":false,"best":false,"featured":false},
    {"slug":"zero-gravity-chaise-lounge-massage-heat","name":"Zero Gravity Chaise Lounge with Massage & Heat","price":2270,"tone":"#A9A08E","eyebrow":"Power comfort","fn":["electric","massage"],"cols":["power-reclining-sofas","new-arrivals"],"rev":0,"new":true,"best":false,"featured":false},
    {"slug":"cloud-boucle-two-seat-loveseat","name":"Cloud Bouclé Two-Seat Loveseat","price":1890,"tone":"#D3C2AB","eyebrow":"Compact solution","fn":[],"cols":["small-space-sofas","modular-sectional-sofas","new-arrivals"],"rev":0,"new":true,"best":false,"featured":false},
    {"slug":"smart-lift-coffee-table-wireless-charging","name":"Smart Lift Coffee Table with Wireless Charging","price":1140,"tone":"#E0D8CC","eyebrow":"Smart table","fn":["storage"],"cols":["rolling-side-table-with-storage"],"rev":0,"new":false,"best":false,"featured":false},
    {"slug":"5-position-convertible-sofa-bed-side-table","name":"5-Position Convertible Sofa Bed with 360° Swivel Side Table","price":2060,"tone":"#E2D7C4","eyebrow":"Convertible sofa bed","fn":["convertible","storage"],"cols":["convertible-sofa-beds"],"rev":1,"new":false,"best":false,"featured":true},
    {"slug":"compact-chenille-apartment-sofa","name":"Compact Chenille Apartment Sofa","price":1740,"tone":"#CDBEA6","eyebrow":"Compact solution","fn":[],"cols":["small-space-sofas","new-arrivals"],"rev":0,"new":true,"best":false,"featured":false},
    {"slug":"folding-floor-sofa-lounger","name":"Folding Floor Sofa Lounger","price":890,"tone":"#D9D3C8","eyebrow":"Compact solution","fn":["convertible"],"cols":["small-space-sofas","compressed-sofas"],"rev":0,"new":false,"best":false,"featured":false},
    {"slug":"slim-arm-velvet-sofa-72","name":"Slim-Arm Velvet Sofa, 72\"","price":2180,"tone":"#EAE3D6","eyebrow":"Compact solution","fn":[],"cols":["small-space-sofas"],"rev":0,"new":false,"best":false,"featured":false}
  ]';
  col text;
  base numeric;
begin
  for p in select * from jsonb_array_elements(products) loop
    i := i + 1;
    insert into public.products (
      slug, name_en, name_fr, eyebrow_en, eyebrow_fr, short_description_en, overview_en, delivery_access_en,
      specs, chips, functions, lead_time_min_days, lead_time_max_days,
      is_featured, is_best_seller, is_new, sort_order, is_demo, placeholder_tone
    ) values (
      p->>'slug', p->>'name', null, p->>'eyebrow', null,
      'Demo product — replace this description in Admin → Products.',
      E'### Important information\nDemo overview text. Replace in Admin.\n\n### Key features\n- Made to order in your chosen model and colour\n- Free delivery, duties included\n- Customisable on request',
      E'### Access & delivery requirements\nMeasure doors, hallways, stairs, elevators and corners before ordering.\n\n### Delivery service\nStandard delivery brings the order to your building entrance.',
      '[{"label_en":"Overall width","value_en":"≈ 110 cm"},{"label_en":"Overall height","value_en":"≈ 100 cm"},{"label_en":"Seat depth","value_en":"≈ 50 cm"},{"label_en":"Frame","value_en":"Solid wood"}]',
      case when (p->'fn') ? 'electric' then array['Customizable','Power'] else array['Customizable'] end,
      array(select jsonb_array_elements_text(p->'fn')),
      45, 55,
      (p->>'featured')::boolean, (p->>'best')::boolean, (p->>'new')::boolean, i, true, p->>'tone'
    )
    on conflict (slug) do update set name_en = excluded.name_en, is_demo = true
    returning id into pid;

    delete from public.product_variants where product_id = pid;
    base := round((p->>'price')::numeric * 18 / 100) * 100;  -- demo prices in INR (all under ₹1,00,000)
    if p->>'slug' = 'electric-recliner-sofa-bed' then
      -- Matches PROJECT_SPEC §8, including the two variants with no price.
      for c in 0..2 loop
        insert into public.product_variants (product_id, model_en, color_en, color_fr, color_hex, material, price_inr, sort_order) values
          (pid, 'Cat-claw fabric · Chaise lounge / Electric', colors->c->>0, colors->c->>1, colors->c->>2, 'fabric', 50800, c),
          (pid, 'Cat-claw fabric · Chaise lounge / Electric / Massage', colors->c->>0, colors->c->>1, colors->c->>2, 'fabric', null, 10 + c),
          (pid, 'Imported leather · Chaise lounge / Electric', colors->c->>0, colors->c->>1, colors->c->>2, 'leather', null, 20 + c),
          (pid, 'Imported leather · Chaise lounge / Electric / Massage', colors->c->>0, colors->c->>1, colors->c->>2, 'leather', 63200, 30 + c);
      end loop;
    else
      for m in 0..1 loop
        for c in 0..2 loop
          insert into public.product_variants (product_id, model_en, color_en, color_fr, color_hex, material, price_inr, stock, sort_order)
          values (
            pid,
            case m when 0 then 'Standard fabric' else 'Performance fabric' end,
            colors->c->>0, colors->c->>1, colors->c->>2,
            'fabric',
            round(base * (1 + m * 0.15) / 100) * 100,
            case when i = 15 and c = 2 then 0 else null end,   -- one out-of-stock demo variant
            m * 10 + c
          );
        end loop;
      end loop;
    end if;

    delete from public.product_collections where product_id = pid;
    for col in select jsonb_array_elements_text(p->'cols') loop
      insert into public.product_collections (product_id, collection_id, sort_order)
      select pid, id, i from public.collections where slug = col;
    end loop;

    delete from public.reviews where product_id = pid and is_demo;
    for c in 1..coalesce((p->>'rev')::int, 0) loop
      insert into public.reviews (product_id, rating, title, body, author_name, is_published, is_demo)
      values (pid, 5, 'Demo review', 'Demo customer experience text.', 'Demo customer', true, true);
    end loop;
  end loop;
end $$;

-- Collection hero copy
update public.collections set description_en = 'Demo collection description — replace in Admin → Collections.'
where description_en is null or description_en like 'Demo collection description%';

-- Store details from the design mock-ups
update public.store_settings set
  store_email = 'azylocraft@gmail.com',
  phone = null,
  address = null,
  opening_hours_en = 'Mon–Fri 9:00–18:00 · Sat 10:00–16:00',
  shipping_methods = '[{"code":"standard","label_en":"Free standard delivery","label_fr":"Livraison standard gratuite","price_inr":0,"days_min":45,"days_max":55}]',
  is_demo = true
where id = 1;

-- Exchange rates (demo values; EUR rate from the design)
update public.exchange_rates set rate_from_cad = case currency
  when 'USD' then 0.73 when 'EUR' then 0.66 when 'GBP' then 0.57 when 'AUD' then 1.10 else rate_from_cad end
where currency in ('USD','EUR','GBP','AUD');

-- Journal excerpts / cover info from the design
update public.articles a set
  excerpt_en = v.excerpt, read_minutes = v.mins, author_name = 'AZYLO Editorial', is_demo_copy = true
from (values
  ('moving-a-sofa-in-montreal', 'Practical checks for stairs, elevators, parking and upholstery protection before delivery day.', 5),
  ('deep-seat-vs-standard-seat-sofa', 'Seat depth changes how you sit, read and nap. Here is how to choose the right one for your body.', 11),
  ('why-some-sofas-look-good-online', 'Photos flatten proportion and fabric. Six details reveal what a listing can’t show.', 11),
  ('how-to-tell-if-a-sofa-will-sag', 'Softness on day one is not support on day 900. What to check in the frame, springs and foam.', 11),
  ('compressed-vs-modular-sofa', 'Box delivery or piece-by-piece flexibility — two ways to solve a tight entrance.', 9),
  ('modular-corduroy-sofa-bed-review', 'A full review: dimensions, fabric wear, recline angles and how it sleeps.', 8)
) as v(slug, excerpt, mins)
where a.slug = v.slug;

update public.articles set linked_product_id = (select id from public.products where slug = 'modular-corduroy-sofa-bed-storage-arms')
where slug = 'modular-corduroy-sofa-bed-review';
update public.articles set linked_product_id = (select id from public.products where slug = 'electric-recliner-sofa-bed')
where slug = 'ultimate-electric-recliner-bed-review';

-- FAQs
delete from public.faqs where is_demo;
insert into public.faqs (slug, faq_group, question_en, answer_en, sort_order, is_demo) values
  ('how-long-does-delivery-take', 'shipping', 'How long does delivery take?', 'Demo answer: made-to-order pieces ship in 45–55 days. See the [shipping policy](/pages/shipping-policy).', 1, true),
  ('is-delivery-free', 'shipping', 'Is delivery really free?', 'Demo answer: yes, standard delivery to your building entrance is included.', 2, true),
  ('can-i-change-my-order', 'orders', 'Can I change my order after placing it?', 'Demo answer: contact us within 24 hours and we will do our best.', 1, true),
  ('how-do-i-track-my-order', 'orders', 'How do I track my order?', 'Demo answer: the tracking link appears in your account once the order ships.', 2, true),
  ('can-i-return-a-made-to-order-sofa', 'returns', 'Can I return a made-to-order sofa?', 'Demo answer: see the [return & refund policy](/pages/refund-policy).', 1, true),
  ('can-i-get-fabric-samples', 'products', 'Can I get fabric samples?', 'Demo answer: yes, ask us through the [contact page](/pages/contact).', 1, true),
  ('can-i-choose-a-custom-colour', 'products', 'Can I choose a custom colour?', 'Demo answer: choose "Custom color" on the product page and we will contact you after ordering.', 2, true);

-- Discount code for testing
delete from public.discounts where is_demo;
insert into public.discounts (code, kind, value, min_subtotal_inr, is_demo) values ('WELCOME10', 'percent', 10, 10000, true);

-- Demo policy bodies (replace with your own text in Admin → Pages)
update public.pages set body_en = E'**Demo policy text — replace this in Admin → Pages before launch.**\n\n## Overview\nThis placeholder shows how a policy page is laid out: a lead sentence, then sections separated by dividers.\n\n## Section one\nDemo paragraph. Contact us at [the contact page](/pages/contact) with any question.\n\n## Section two\n- Demo point one\n- Demo point two\n- Demo point three'
where slug in ('shipping-policy', 'refund-policy', 'privacy-policy', 'terms-of-service') and (body_en is null or body_en like '**Demo policy text%');

-- Demo About-us copy
update public.pages set blocks = '{
  "hero": {"en": "Demo text: AZYLO designs space-conscious sofas and smart tables, made to order and delivered to your door."},
  "statement": {"en": "Demo statement: furniture that solves a real problem in a real home."},
  "problems": {"en": "Demo text: small apartments, guests who stay over, rooms that do two jobs — good design starts there."},
  "imageCaption": {"en": "Demo caption for the brand image."},
  "pillar_purpose": {"en": "Demo text for this principle."},
  "pillar_understand": {"en": "Demo text for this principle."},
  "pillar_manufacturing": {"en": "Demo text for this principle."},
  "pillar_journey": {"en": "Demo text for this principle."},
  "step_problem": {"en": "Demo text for this step."},
  "step_study": {"en": "Demo text for this step."},
  "step_manufacturer": {"en": "Demo text for this step."},
  "step_journey": {"en": "Demo text for this step."},
  "considered": {"en": "Demo text: we publish dimensions, materials and delivery details so you can decide with confidence."},
  "quote": {"en": "“Demo quote — replace with your own words.”"},
  "demo": {"en": "1"}
}'::jsonb
where slug = 'about-us' and (blocks = '{}'::jsonb or blocks ? 'demo');

-- Demo article bodies with H2 sections (so the Contents box has entries)
update public.articles set body_en = E'**Demo article — replace this text in Admin → Articles.**\n\n## Measure before you shop\nDemo paragraph about measuring the room, doors and hallways.\n\n- Width of every door on the way in\n- Turning space in hallways and stairwells\n- Elevator depth and height\n\n## Check the access route\nDemo paragraph about stairs, elevators and parking.\n\n### What to do instead\nDemo tip text.\n\n## Protect the piece on delivery day\nDemo paragraph about covers and floor protection.\n\n## Final thoughts\nDemo closing paragraph.'
where is_demo_copy or body_en = 'MISSING: article content';

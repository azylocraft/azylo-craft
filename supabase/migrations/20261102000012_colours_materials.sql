-- Colour-tagged photos, per-colour collection cards and a material price index.

-- A photo can belong to one colour (e.g. the grey sofa photo); selecting that colour shows it first.
alter table public.product_images add column if not exists color_en text;

-- Show each colour of this product as its own card on collection pages.
alter table public.products add column if not exists list_by_colour boolean not null default false;

-- Material price index (percent of the base material). Typing one material's price in Admin
-- fills the others from this index. Order = display order (cheapest first).
alter table public.store_settings add column if not exists material_price_index jsonb not null default
  '[{"name":"Performance Fabric (PF)","index":100},{"name":"Linen","index":115},{"name":"Half Leather (Leather Match)","index":145},{"name":"Velvet","index":160},{"name":"Bouclé","index":180},{"name":"Full Leather","index":250}]'::jsonb;

-- Flags for temporary demo data (removed with `npm run demo:remove`).
alter table public.products add column is_demo boolean not null default false;
alter table public.reviews add column is_demo boolean not null default false;
alter table public.faqs add column is_demo boolean not null default false;
alter table public.discounts add column is_demo boolean not null default false;
alter table public.articles add column is_demo_copy boolean not null default false;
alter table public.store_settings add column is_demo boolean not null default false;

-- Placeholder swatch tone for products without photos yet.
alter table public.products add column placeholder_tone text check (placeholder_tone ~ '^#[0-9A-Fa-f]{6}$');

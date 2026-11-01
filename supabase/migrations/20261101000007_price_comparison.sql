-- Admin-managed price comparison against other sellers (no scraping; every row is entered and dated by the owner).
create table public.product_comparisons (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  seller_name text not null,
  url text,
  price_inr numeric(10, 2) not null check (price_inr >= 0),
  includes_delivery boolean not null default false,
  includes_gst boolean not null default true,
  notes text,
  checked_on date not null default current_date,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.product_comparisons (product_id, sort_order);

alter table public.product_comparisons enable row level security;
create policy "public read" on public.product_comparisons for select using (true);
create policy "admin write" on public.product_comparisons for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- "Why AZYLO is the better buy" — one point per line.
alter table public.products add column comparison_points_en text;

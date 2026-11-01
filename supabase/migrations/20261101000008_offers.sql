-- Conversion features. Everything here is driven by real data the owner controls:
-- bonuses/guarantee per product, a dated campaign, a real bundle rule, real stock and real orders.

-- Per-product offer stack: [{ "title": "...", "value_inr": 1500 | null }]
alter table public.products add column bonuses jsonb not null default '[]'::jsonb;
alter table public.products add column guarantee_days int check (guarantee_days > 0);
alter table public.products add column guarantee_text text;

-- Store-wide campaign + bundle rule + display thresholds
alter table public.store_settings add column campaign_title text;          -- e.g. "Launch offer: 10% off"
alter table public.store_settings add column campaign_code citext;         -- must exist in discounts
alter table public.store_settings add column campaign_ends_at timestamptz; -- countdown target; hidden after
alter table public.store_settings add column bonuses_default jsonb not null default '[]'::jsonb; -- shown on every product
alter table public.store_settings add column bundle_min_items int not null default 2 check (bundle_min_items >= 2);
alter table public.store_settings add column bundle_percent numeric(5, 2) not null default 0 check (bundle_percent >= 0 and bundle_percent <= 50);
alter table public.store_settings add column low_stock_threshold int not null default 5;
alter table public.store_settings add column emi_months int not null default 12 check (emi_months between 3 and 36);
alter table public.store_settings add column email_popup_enabled boolean not null default true;
alter table public.store_settings add column email_popup_code citext;

-- Real social proof: paid orders containing this product in the last N days (no personal data exposed).
create or replace function public.product_recent_orders(p_product uuid, p_days int default 30)
returns int language sql stable security definer set search_path = public as $$
  select count(distinct o.id)::int
  from public.orders o join public.order_items i on i.order_id = o.id
  where i.product_id = p_product
    and o.status not in ('pending', 'cancelled', 'refunded')
    and o.created_at > now() - make_interval(days => p_days);
$$;
grant execute on function public.product_recent_orders(uuid, int) to anon, authenticated;

-- Free gift with purchase: the customer picks one gift (e.g. tea table, bean bag, ottoman,
-- cushion set) on eligible products; it is added to the order as a ₹0 line item.

-- [{ "key": "ottoman", "title": "Bouclé ottoman", "value_inr": 4999, "image_path": "gifts/ottoman.webp" }]
alter table public.store_settings add column free_gifts jsonb not null default '[]'::jsonb;
alter table public.products add column free_gift_enabled boolean not null default true;

-- Gift lines have no variant; mark them so they are easy to spot when packing.
alter table public.order_items add column is_gift boolean not null default false;

-- The store now sells in INR only. Money columns are renamed *_cad -> *_inr.
alter table public.product_variants rename column price_cad to price_inr;
alter table public.orders rename column subtotal_cad to subtotal_inr;
alter table public.orders rename column discount_cad to discount_inr;
alter table public.orders rename column shipping_cad to shipping_inr;
alter table public.orders rename column tax_cad to tax_inr;
alter table public.orders rename column total_cad to total_inr;
alter table public.orders alter column currency set default 'INR';
alter table public.order_items rename column unit_price_cad to unit_price_inr;
alter table public.discounts rename column min_subtotal_cad to min_subtotal_inr;

-- shipping_methods JSON: price_cad -> price_inr
update public.store_settings
set shipping_methods = coalesce((
  select jsonb_agg((m - 'price_cad') || jsonb_build_object('price_inr', coalesce(m -> 'price_cad', m -> 'price_inr', '0'::jsonb)))
  from jsonb_array_elements(shipping_methods) m), '[]'::jsonb);

alter table public.addresses alter column country set default 'IN';

-- Removes every demo row added by demo_seed.sql.
delete from public.products where is_demo;          -- cascades to variants, images, reviews, links
delete from public.reviews where is_demo;
delete from public.faqs where is_demo;
delete from public.discounts where is_demo;
update public.collections set description_en = null
  where description_en like 'Demo collection description%';
update public.articles set excerpt_en = null, read_minutes = null, author_name = null, linked_product_id = null, is_demo_copy = false
  where is_demo_copy;
update public.store_settings set store_email = null, phone = null, address = null, opening_hours_en = null,
  shipping_methods = '[]'::jsonb, is_demo = false where is_demo;
update public.exchange_rates set rate_from_cad = null where currency <> 'CAD';
update public.pages set body_en = null where body_en like '**Demo policy text%';
update public.pages set blocks = '{}'::jsonb where blocks ? 'demo';
update public.articles set body_en = 'MISSING: article content' where body_en like '**Demo article%';
update public.store_settings set campaign_title = null, campaign_code = null, campaign_ends_at = null, bundle_percent = 0,
  email_popup_enabled = false, email_popup_code = null, bonuses_default = '[]'::jsonb where id = 1;

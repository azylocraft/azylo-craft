-- Offers v2: compare-at (MRP) prices, tiered quantity discounts, no-cost EMI flag,
-- and a real review system (photos, reason for buying, verified purchases, moderation).

-- Compare-at / MRP per variant. Must be a genuine earlier or regular selling price.
alter table public.product_variants add column compare_at_inr numeric(10, 2) check (compare_at_inr >= 0);

-- Tiered quantity discount: [{ "min": 2, "pct": 10 }, { "min": 3, "pct": 15 }]
alter table public.store_settings add column bundle_tiers jsonb not null default '[]'::jsonb;
-- No-cost EMI is shown only when switched on here AND enabled in Razorpay (merchant bears interest).
alter table public.store_settings add column emi_no_cost boolean not null default false;

-- Reviews: richer content + moderation
alter table public.reviews add column reason text;                         -- "why I bought it"
alter table public.reviews add column photos text[] not null default '{}'; -- storage paths in review-media
alter table public.reviews add column verified boolean not null default false;
alter table public.reviews add column order_id uuid references public.orders (id) on delete set null;
alter table public.reviews add column location text;                      -- e.g. "Bengaluru"
alter table public.reviews add column status text not null default 'pending' check (status in ('pending', 'published', 'hidden'));
update public.reviews set status = case when is_published then 'published' else 'pending' end;

-- Customers may submit a review for a product they have a paid order for (moderated before showing).
create or replace function public.has_purchased(p_product uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.orders o join public.order_items i on i.order_id = o.id
    where o.user_id = auth.uid() and i.product_id = p_product and o.status not in ('pending', 'cancelled', 'refunded')
  );
$$;
grant execute on function public.has_purchased(uuid) to authenticated;

create policy "buyer submit" on public.reviews for insert to authenticated
  with check (user_id = auth.uid() and status = 'pending' and is_published = false and public.has_purchased(product_id));
create policy "own read" on public.reviews for select to authenticated using (user_id = auth.uid());

-- Review photos: public read; customers upload into their own folder; admins manage everything.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-media', 'review-media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/heic'])
on conflict (id) do nothing;

create policy "review-media public read" on storage.objects for select using (bucket_id = 'review-media');
create policy "review-media own upload" on storage.objects for insert to authenticated
  with check (bucket_id = 'review-media' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "review-media admin manage" on storage.objects for all to authenticated
  using (bucket_id = 'review-media' and public.is_admin()) with check (bucket_id = 'review-media' and public.is_admin());

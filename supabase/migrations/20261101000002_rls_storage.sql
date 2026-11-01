-- Row Level Security on every table + the product-media storage bucket.

do $$
declare t text;
begin
  foreach t in array array[
    'profiles','products','product_variants','product_images','product_videos','collections',
    'product_collections','swatches','materials','product_materials','reviews','articles','pages',
    'faqs','store_settings','exchange_rates','tax_rates','discounts','addresses','carts','cart_items',
    'wishlists','orders','order_items','order_status_events','newsletter_subscribers',
    'contact_messages','product_questions','rate_limits'
  ] loop
    execute format('alter table public.%I enable row level security', t);
  end loop;
end $$;

-- Catalogue + content: public read, admin write ----------------------------
do $$
declare t text;
begin
  foreach t in array array[
    'product_variants','product_images','product_videos','product_collections','swatches',
    'materials','product_materials','pages','faqs','store_settings','exchange_rates','tax_rates'
  ] loop
    execute format('create policy "public read" on public.%I for select using (true)', t);
    execute format('create policy "admin write" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "public read published" on public.products for select using (is_published or public.is_admin());
create policy "admin write" on public.products for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read published" on public.collections for select using (is_published or public.is_admin());
create policy "admin write" on public.collections for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read published" on public.articles for select using (is_published or public.is_admin());
create policy "admin write" on public.articles for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "public read published" on public.reviews for select using (is_published or public.is_admin());
create policy "admin write" on public.reviews for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Discounts are checked by the validate-discount function (service role).
create policy "admin all" on public.discounts for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Profiles ------------------------------------------------------------------
create policy "own read" on public.profiles for select to authenticated using (id = auth.uid() or public.is_admin());
create policy "own update" on public.profiles for update to authenticated
  using (id = auth.uid() or public.is_admin()) with check (id = auth.uid() or public.is_admin());

-- Owner-only customer data --------------------------------------------------
create policy "own all" on public.addresses for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "admin read" on public.addresses for select to authenticated using (public.is_admin());

create policy "own all" on public.carts for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own all" on public.cart_items for all to authenticated
  using (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from public.carts c where c.id = cart_id and c.user_id = auth.uid()));

create policy "own all" on public.wishlists for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Orders are written only by edge functions (service role); customers read their own.
create policy "own read" on public.orders for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin update" on public.orders for update to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "own read" on public.order_items for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

create policy "own read" on public.order_status_events for select to authenticated
  using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())));

-- Inbox: inserts go through edge functions; owners read their own, admins manage.
create policy "own read" on public.contact_messages for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin manage" on public.contact_messages for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.contact_messages for delete to authenticated using (public.is_admin());

create policy "own read" on public.product_questions for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin manage" on public.product_questions for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin delete" on public.product_questions for delete to authenticated using (public.is_admin());

create policy "own read" on public.newsletter_subscribers for select to authenticated using (user_id = auth.uid() or public.is_admin());
create policy "admin manage" on public.newsletter_subscribers for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- rate_limits: RLS on, no policies -> service role only.

-- Storage: public-read, admin-write bucket ----------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-media', 'product-media', true, 52428800,
  array['image/jpeg','image/png','image/webp','image/avif','image/gif','video/mp4','video/webm','video/quicktime','application/pdf']
)
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "product-media public read" on storage.objects for select using (bucket_id = 'product-media');
create policy "product-media admin insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'product-media' and public.is_admin());
create policy "product-media admin update" on storage.objects for update to authenticated
  using (bucket_id = 'product-media' and public.is_admin()) with check (bucket_id = 'product-media' and public.is_admin());
create policy "product-media admin delete" on storage.objects for delete to authenticated
  using (bucket_id = 'product-media' and public.is_admin());

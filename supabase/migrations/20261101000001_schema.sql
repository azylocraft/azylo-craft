-- AZYLO core schema. Per-language content uses *_en / *_fr columns; NULL means
-- "not supplied yet" and the UI shows a MISSING placeholder. Money is CAD.

create extension if not exists citext;
create extension if not exists pg_trgm;

-- Enums ---------------------------------------------------------------------
create type public.user_role as enum ('customer', 'admin');
create type public.image_type as enum ('studio', 'real_space', 'live', 'swatch', 'detail', 'dimension');
create type public.order_status as enum ('pending', 'paid', 'confirmed', 'in_production', 'shipped', 'delivered', 'cancelled', 'refunded');
create type public.message_status as enum ('new', 'read', 'replied', 'archived');
create type public.article_template as enum ('guide', 'product_review');
create type public.article_category as enum ('sofa_guides', 'home_decor');
create type public.material_category as enum ('upholstery', 'wood', 'support', 'foam');
create type public.faq_group as enum ('shipping', 'orders', 'returns', 'products');
create type public.discount_kind as enum ('percent', 'fixed');

-- Helpers -------------------------------------------------------------------
create or replace function public.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Profiles ------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text,
  last_name text,
  role public.user_role not null default 'customer',
  lang text not null default 'en' check (lang in ('en', 'fr')),
  currency text not null default 'CAD',
  marketing_opt_in boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    nullif(new.raw_user_meta_data ->> 'first_name', ''),
    nullif(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customers may not promote themselves.
create or replace function public.guard_profile_role() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- auth.uid() is NULL for the service role and SQL console, which may change roles.
  if new.role is distinct from old.role and auth.uid() is not null and not public.is_admin() then
    raise exception 'Only admins can change roles';
  end if;
  return new;
end $$;

create trigger profiles_guard_role before update on public.profiles
  for each row execute function public.guard_profile_role();
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Catalogue -----------------------------------------------------------------
create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_en text,
  name_fr text,
  eyebrow_en text,              -- card category tag, e.g. "Power comfort"
  eyebrow_fr text,
  short_description_en text,
  short_description_fr text,
  overview_en text,             -- accordion 01 (markdown)
  overview_fr text,
  delivery_access_en text,      -- accordion 02 (markdown)
  delivery_access_fr text,
  specs jsonb not null default '[]'::jsonb,   -- [{label_en,label_fr,value_en,value_fr}]
  chips text[] not null default '{}',          -- e.g. {Customizable, Power}
  functions text[] not null default '{}' check (functions <@ array['electric','massage','storage','convertible','modular']),
  lead_time_min_days int check (lead_time_min_days >= 0),
  lead_time_max_days int check (lead_time_max_days >= lead_time_min_days),
  is_featured boolean not null default false,
  is_best_seller boolean not null default false,
  is_new boolean not null default false,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_name_trgm on public.products using gin ((coalesce(name_en, '') || ' ' || coalesce(name_fr, '')) gin_trgm_ops);
create trigger products_touch before update on public.products for each row execute function public.touch_updated_at();

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  model_en text,
  model_fr text,
  color_en text,
  color_fr text,
  color_hex text check (color_hex ~ '^#[0-9A-Fa-f]{6}$'),
  material text,
  price_cad numeric(10, 2) check (price_cad >= 0),   -- NULL = MISSING: price
  stock int check (stock >= 0),                        -- NULL = made to order (unlimited)
  sku text unique,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.product_variants (product_id);
create trigger variants_touch before update on public.product_variants for each row execute function public.touch_updated_at();

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  storage_path text not null,
  image_type public.image_type not null default 'studio',
  alt_en text,
  alt_fr text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.product_images (product_id, image_type, sort_order);

create table public.product_videos (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  storage_path text not null,
  poster_path text,
  title_en text,
  title_fr text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index on public.product_videos (product_id, sort_order);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text,
  title_fr text,
  description_en text,
  description_fr text,
  hero_image_path text,
  is_published boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger collections_touch before update on public.collections for each row execute function public.touch_updated_at();

create table public.product_collections (
  product_id uuid not null references public.products (id) on delete cascade,
  collection_id uuid not null references public.collections (id) on delete cascade,
  sort_order int not null default 0,
  primary key (product_id, collection_id)
);
create index on public.product_collections (collection_id, sort_order);

create table public.swatches (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  swatch_group text not null default 'fabric',   -- fabric | leather | other
  name_en text,
  name_fr text,
  color_hex text,
  image_path text,
  sort_order int not null default 0
);
create index on public.swatches (product_id, sort_order);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  category public.material_category not null,
  name_en text,
  name_fr text,
  description_en text,
  description_fr text,
  specs jsonb not null default '{}'::jsonb,      -- {surface:{en,fr}, light:{en,fr}, visual_feel:{en,fr}}
  verify_note_en text,
  verify_note_fr text,
  sofa_image_path text,
  swatch_image_path text,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
create trigger materials_touch before update on public.materials for each row execute function public.touch_updated_at();

create table public.product_materials (
  product_id uuid not null references public.products (id) on delete cascade,
  material_id uuid not null references public.materials (id) on delete cascade,
  primary key (product_id, material_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid references auth.users (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  title text,
  body text,
  author_name text,
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.reviews (product_id) where is_published;

-- Content -------------------------------------------------------------------
create table public.articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  template public.article_template not null default 'guide',
  category public.article_category not null default 'sofa_guides',
  title_en text,
  title_fr text,
  excerpt_en text,
  excerpt_fr text,
  body_en text,          -- markdown; H2s build the Contents box
  body_fr text,
  cover_image_path text,
  author_name text,
  author_bio_en text,
  author_bio_fr text,
  author_avatar_path text,
  read_minutes int,
  linked_product_id uuid references public.products (id) on delete set null,
  is_published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.articles (is_published, published_at desc);
create trigger articles_touch before update on public.articles for each row execute function public.touch_updated_at();

create table public.pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title_en text,
  title_fr text,
  body_en text,          -- markdown (policies)
  body_fr text,
  blocks jsonb not null default '{}'::jsonb,   -- structured copy for designed pages (about, home…)
  last_updated timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create or replace function public.pages_touch() returns trigger
language plpgsql as $$
begin
  new.last_updated := now();
  return new;
end $$;
create trigger pages_touch before update on public.pages for each row execute function public.pages_touch();

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  faq_group public.faq_group not null,
  question_en text,
  question_fr text,
  answer_en text,        -- markdown, links allowed
  answer_fr text,
  show_on_product boolean not null default true,
  sort_order int not null default 0,
  updated_at timestamptz not null default now()
);
create trigger faqs_touch before update on public.faqs for each row execute function public.touch_updated_at();

create table public.store_settings (
  id int primary key default 1 check (id = 1),
  store_email text,
  phone text,
  address text,
  map_url text,
  opening_hours_en text,
  opening_hours_fr text,
  play_store_url text,
  catalog_pdf_path text,
  shipping_methods jsonb not null default '[]'::jsonb,  -- [{code,label_en,label_fr,price_cad,days_min,days_max}]
  updated_at timestamptz not null default now()
);
create trigger store_settings_touch before update on public.store_settings for each row execute function public.touch_updated_at();

create table public.exchange_rates (
  currency text primary key check (currency ~ '^[A-Z]{3}$'),
  rate_from_cad numeric(12, 6) check (rate_from_cad > 0),   -- NULL = MISSING
  updated_at timestamptz not null default now()
);
create trigger exchange_rates_touch before update on public.exchange_rates for each row execute function public.touch_updated_at();

create table public.tax_rates (
  province text primary key check (province ~ '^[A-Z]{2}$'),
  name text not null,
  gst numeric(6, 3) not null default 0,
  pst numeric(6, 3) not null default 0,     -- PST / QST / RST
  hst numeric(6, 3) not null default 0,
  pst_label text,
  updated_at timestamptz not null default now()
);
create trigger tax_rates_touch before update on public.tax_rates for each row execute function public.touch_updated_at();

create table public.discounts (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  kind public.discount_kind not null default 'percent',
  value numeric(10, 2) not null check (value > 0),
  min_subtotal_cad numeric(10, 2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit int check (usage_limit > 0),
  used_count int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Customer data -------------------------------------------------------------
create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  province text,
  postal_code text not null,
  country text not null default 'CA',
  phone text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index on public.addresses (user_id);
create unique index addresses_one_default on public.addresses (user_id) where is_default;

create table public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  note text,
  discount_code citext,
  updated_at timestamptz not null default now()
);
create trigger carts_touch before update on public.carts for each row execute function public.touch_updated_at();

create table public.cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts (id) on delete cascade,
  variant_id uuid not null references public.product_variants (id) on delete cascade,
  quantity int not null check (quantity between 1 and 10),
  custom_color boolean not null default false,
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id, custom_color)
);

create table public.wishlists (
  user_id uuid not null references auth.users (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create sequence public.order_number_seq start 1001;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint not null unique default nextval('public.order_number_seq'),
  user_id uuid references auth.users (id) on delete set null,
  email citext not null,
  status public.order_status not null default 'pending',
  currency text not null default 'CAD',
  subtotal_cad numeric(10, 2) not null,
  discount_cad numeric(10, 2) not null default 0,
  shipping_cad numeric(10, 2) not null default 0,
  tax_cad numeric(10, 2) not null default 0,
  total_cad numeric(10, 2) not null,
  tax_breakdown jsonb not null default '[]'::jsonb,
  discount_code citext,
  shipping_method text,
  shipping_address jsonb not null,
  billing_address jsonb,
  note text,
  marketing_opt_in boolean not null default false,
  razorpay_order_id text unique,
  razorpay_payment_id text,
  tracking_number text,
  tracking_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.orders (user_id, created_at desc);
create index on public.orders (status, created_at desc);
create trigger orders_touch before update on public.orders for each row execute function public.touch_updated_at();

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  variant_label text,
  image_path text,
  unit_price_cad numeric(10, 2) not null,
  quantity int not null check (quantity between 1 and 10),
  custom_color boolean not null default false
);
create index on public.order_items (order_id);

create table public.order_status_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  status public.order_status not null,
  created_at timestamptz not null default now()
);
create index on public.order_status_events (order_id, created_at);

create or replace function public.log_order_status() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.order_status_events (order_id, status) values (new.id, new.status);
  end if;
  return new;
end $$;
create trigger orders_status_log after insert or update of status on public.orders
  for each row execute function public.log_order_status();

-- Inbox ---------------------------------------------------------------------
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  user_id uuid references auth.users (id) on delete set null,
  source text not null default 'footer',
  subscribed boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger newsletter_touch before update on public.newsletter_subscribers for each row execute function public.touch_updated_at();

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete set null,
  source text not null default 'contact' check (source in ('contact', 'chat')),
  name text not null,
  email citext not null,
  phone text,
  order_number text,
  topic text,
  message text not null,
  status public.message_status not null default 'new',
  created_at timestamptz not null default now()
);
create index on public.contact_messages (status, created_at desc);

create table public.product_questions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  user_id uuid references auth.users (id) on delete set null,
  name text not null,
  email citext not null,
  question text not null,
  status public.message_status not null default 'new',
  created_at timestamptz not null default now()
);

-- Edge-function rate limiting (service role only).
create table public.rate_limits (
  bucket text not null,          -- e.g. "contact:<ip-hash>"
  window_start timestamptz not null,
  hits int not null default 0,
  primary key (bucket, window_start)
);

create or replace function public.hit_rate_limit(p_bucket text, p_window_seconds int, p_max int) returns boolean
language plpgsql security definer set search_path = public as $$
declare
  w timestamptz := to_timestamp(floor(extract(epoch from now()) / p_window_seconds) * p_window_seconds);
  n int;
begin
  insert into public.rate_limits (bucket, window_start, hits) values (p_bucket, w, 1)
  on conflict (bucket, window_start) do update set hits = public.rate_limits.hits + 1
  returning hits into n;
  delete from public.rate_limits where window_start < now() - interval '1 day';
  return n <= p_max;
end $$;
revoke all on function public.hit_rate_limit(text, int, int) from public, anon, authenticated;

-- Structural seed only. No products, prices, contact details or copy are
-- invented: NULL fields render as MISSING placeholders until filled in admin.

insert into public.store_settings (id) values (1) on conflict do nothing;

-- Collections (routes from PROJECT_SPEC §6). Titles are navigation labels.
insert into public.collections (slug, title_en, title_fr, sort_order) values
  ('power-reclining-sofas', 'Power Reclining Sofas', 'Canapés inclinables', 1),
  ('convertible-sofa-beds', 'Convertible Sofa Beds', 'Canapés-lits', 2),
  ('small-space-sofas', 'Small-Space Sofas', 'Petits espaces', 3),
  ('compressed-sofas', 'Compressed Sofas', 'Canapés compressés', 4),
  ('modular-sectional-sofas', 'Modular Sofas', 'Canapés modulaires', 5),
  ('rolling-side-table-with-storage', 'Smart Tables', 'Tables connectées', 6),
  ('new-arrivals', 'New Arrivals', 'Nouveautés', 7),
  ('best-selling-sofas', 'Best-Selling Sofas', 'Canapés les plus vendus', 8),
  ('all', 'All products', 'Tous les produits', 9)
on conflict (slug) do nothing;

-- Pages: shells only. Bodies stay NULL -> "MISSING: policy text".
insert into public.pages (slug, title_en, title_fr) values
  ('shipping-policy', 'Shipping policy', 'Politique de livraison'),
  ('refund-policy', 'Return & refund policy', 'Politique de retour et de remboursement'),
  ('privacy-policy', 'Privacy policy', 'Politique de confidentialité'),
  ('terms-of-service', 'Terms of service', 'Conditions d’utilisation'),
  ('about-us', 'About us', 'À propos'),
  ('home', 'Home', 'Accueil')
on conflict (slug) do nothing;

-- The 12 working titles from PROJECT_SPEC §9.5. Body = MISSING until supplied.
insert into public.articles (slug, template, category, title_en, body_en, is_published, published_at) values
  ('moving-a-sofa-in-montreal', 'guide', 'sofa_guides', 'Moving a sofa in Montreal: measurements, access and protection', 'MISSING: article content', true, now()),
  ('deep-seat-vs-standard-seat-sofa', 'guide', 'sofa_guides', 'Deep Seat vs Standard Seat Sofa: Which One Is Better for Everyday Life?', 'MISSING: article content', true, now() - interval '1 day'),
  ('why-some-sofas-look-good-online', 'guide', 'sofa_guides', 'Why Some Sofas Look Good Online but Feel Disappointing in Real Life', 'MISSING: article content', true, now() - interval '2 days'),
  ('how-to-tell-if-a-sofa-will-sag', 'guide', 'sofa_guides', 'How to Tell if a Sofa Will Sag Too Fast Before You Buy', 'MISSING: article content', true, now() - interval '3 days'),
  ('how-to-choose-sofa-depth', 'guide', 'sofa_guides', 'How to Choose the Right Sofa Depth for the Way You Actually Sit', 'MISSING: article content', true, now() - interval '4 days'),
  ('what-makes-a-sofa-comfortable', 'guide', 'sofa_guides', 'What Makes a Sofa Comfortable for Everyday Use?', 'MISSING: article content', true, now() - interval '5 days'),
  ('7-mistakes-buying-a-sofa-online', 'guide', 'sofa_guides', '7 Mistakes to Avoid Before Buying a Sofa Online', 'MISSING: article content', true, now() - interval '6 days'),
  ('compressed-vs-modular-sofa', 'guide', 'home_decor', 'Compressed Sofa vs Modular Sofa: Which One Is Better for Your Home?', 'MISSING: article content', true, now() - interval '7 days'),
  ('modular-corduroy-sofa-bed-review', 'product_review', 'sofa_guides', 'Modular Corduroy Sofa Bed – Comfort, Style & No Assembly', 'MISSING: article content', true, now() - interval '8 days'),
  ('ultimate-electric-recliner-bed-review', 'product_review', 'sofa_guides', 'The Ultimate Electric Recliner Bed', 'MISSING: article content', true, now() - interval '9 days'),
  ('modern-swivel-lounge-chair-review', 'product_review', 'home_decor', 'Modern Swivel Lounge Chair', 'MISSING: article content', true, now() - interval '10 days'),
  ('best-sofa-beds-for-space-saving', 'product_review', 'home_decor', 'Best Sofa Beds for Space Saving', 'MISSING: article content', true, now() - interval '11 days')
on conflict (slug) do nothing;

-- The six upholstery tabs of the Materials Guide (names only; the rest is MISSING).
insert into public.materials (slug, category, name_en, name_fr, sort_order) values
  ('boucle', 'upholstery', 'Bouclé', 'Bouclé', 1),
  ('chenille', 'upholstery', 'Chenille', 'Chenille', 2),
  ('velvet', 'upholstery', 'Velvet', 'Velours', 3),
  ('woven', 'upholstery', 'Woven', 'Tissé', 4),
  ('tight-weave', 'upholstery', 'Tight weave', 'Tissage serré', 5),
  ('vegan-leather', 'upholstery', 'Vegan leather', 'Cuir végane', 6)
on conflict (slug) do nothing;

-- Exchange rates: CAD is the base. Other rates must be entered in admin.
insert into public.exchange_rates (currency, rate_from_cad) values
  ('CAD', 1), ('USD', null), ('EUR', null), ('GBP', null), ('AUD', null)
on conflict (currency) do nothing;

-- Canadian sales tax by province (%). Public rates as of 2026 — verify in admin.
insert into public.tax_rates (province, name, gst, pst, hst, pst_label) values
  ('AB', 'Alberta', 5, 0, 0, null),
  ('BC', 'British Columbia', 5, 7, 0, 'PST'),
  ('MB', 'Manitoba', 5, 7, 0, 'RST'),
  ('NB', 'New Brunswick', 0, 0, 15, null),
  ('NL', 'Newfoundland and Labrador', 0, 0, 15, null),
  ('NS', 'Nova Scotia', 0, 0, 14, null),
  ('NT', 'Northwest Territories', 5, 0, 0, null),
  ('NU', 'Nunavut', 5, 0, 0, null),
  ('ON', 'Ontario', 0, 0, 13, null),
  ('PE', 'Prince Edward Island', 0, 0, 15, null),
  ('QC', 'Quebec', 5, 9.975, 0, 'QST'),
  ('SK', 'Saskatchewan', 5, 6, 0, 'PST'),
  ('YT', 'Yukon', 5, 0, 0, null)
on conflict (province) do nothing;

-- Retire the "live" and "dimension" image types: live photos become real-space photos,
-- dimension drawings become detail images, and the two values can no longer be saved.
-- (Postgres can't drop enum values in place, so a check constraint enforces it.)
update public.product_images set image_type = 'real_space' where image_type = 'live';
update public.product_images set image_type = 'detail' where image_type = 'dimension';

alter table public.product_images
  add constraint product_images_type_allowed check (image_type in ('studio', 'real_space', 'swatch', 'detail'));

-- The convertible lounge sofa's in-home photos (04, 05) are real-space photos.
update public.product_images set image_type = 'real_space'
where storage_path in (
  'products/convertible-lounge-sofa-expandable-frame/gallery/04-in-home-sofa.webp',
  'products/convertible-lounge-sofa-expandable-frame/gallery/05-in-home-bed.webp'
);

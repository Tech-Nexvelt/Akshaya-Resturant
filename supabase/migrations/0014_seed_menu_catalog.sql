-- Migration 0014: seed the restaurant catalog with FIXED ids
-- ===========================================================================
-- WHY: `create_order()` resolves cart lines with
--   JOIN menu_items m ON m.id = (elem->>'menu_item_id')::UUID AND m.available
-- The storefront keys everything by slug ("chicken-biryani"), so before this
-- migration existed there were no menu_items rows at all to join against and
-- every real checkout raised 'One or more items are unavailable or invalid'.
--
-- The ids below are UUIDv5 of `menu_item:<slug>` (categories: `category:<slug>`)
-- under the fixed namespace 6f0c9a2e-1c3b-4f7a-9c2d-3a5b7e9d1f40. They are
-- reproducible, not arbitrary, and are mirrored byte-for-byte in
-- `lib/restaurant-data.ts` (MENU_ITEM_IDS). `scripts/check-menu-seed.mjs` fails
-- the build if the two ever drift.
--
-- Idempotent: safe to re-run. Prices/names are re-asserted on conflict so this
-- file stays the source of truth until menu CRUD goes live in /admin/menu.
-- NOTE: once staff edit prices through the admin UI, re-running this migration
-- would stomp those edits — at that point drop the DO UPDATE and keep DO NOTHING.

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
INSERT INTO menu_categories (id, name, slug, sort_order, active) VALUES
  ('c95cac1e-83da-53dc-8792-88f20349a8d2', 'Biryani',      'biryani',      1, true),
  ('fbe7e6bf-bd65-5832-be85-0263aa2bfe20', 'Starters',     'starters',     2, true),
  ('d6903ff7-f4d9-534d-a4b9-e38f860a96a5', 'Main Course',  'main-course',  3, true),
  ('46518a19-0e68-5a5f-86c0-76cbba2f40a6', 'South Indian', 'south-indian', 4, true),
  ('826f3ed1-a63e-5758-a221-a2b5168e8433', 'Chinese',      'chinese',      5, true),
  ('7dfc18f5-9840-59dc-badc-25a84f969e04', 'Breads',       'breads',       6, true),
  ('2cd9ff4b-18d4-5dd9-9386-79df544bcd7a', 'Desserts',     'desserts',     7, true),
  ('151b551b-2e46-5ea0-a5eb-dc6f986f1729', 'Beverages',    'beverages',    8, true)
ON CONFLICT (id) DO UPDATE
  SET name       = EXCLUDED.name,
      slug       = EXCLUDED.slug,
      sort_order = EXCLUDED.sort_order,
      active     = EXCLUDED.active;

-- ---------------------------------------------------------------------------
-- Items. Prices here are AUTHORITATIVE — create_order re-prices every line from
-- this table and ignores whatever the client sent.
-- ---------------------------------------------------------------------------
INSERT INTO menu_items
  (id, category_id, name, description, price, image_url, is_veg, spice_level, available, sort_order)
VALUES
  ('f3621d29-c5ca-5832-89f1-ac29474de50e', 'c95cac1e-83da-53dc-8792-88f20349a8d2',
   'Hyderabadi Chicken Biryani', 'Dum-cooked basmati layered with marinated chicken and saffron.',
   349.00, '/Images/chicken-biryani.jpg', false, 2, true, 1),

  ('2187026e-f64d-5ac3-9c23-302e6314d488', 'd6903ff7-f4d9-534d-a4b9-e38f860a96a5',
   'Paneer Butter Masala', 'Cottage cheese in a silky tomato-cashew gravy.',
   269.00, '/Images/paneer-butter-masala.jpg', true, 0, true, 2),

  ('b125fa68-8efd-56a1-a4c8-48523d9d46e2', 'fbe7e6bf-bd65-5832-be85-0263aa2bfe20',
   'Chicken 65', 'Fiery South Indian fried chicken with curry leaf and chilli.',
   249.00, '/Images/chicken-65.jpg', false, 3, true, 3),

  ('05f4f089-3565-53bc-af10-de2b70bc4f5c', '826f3ed1-a63e-5758-a221-a2b5168e8433',
   'Gobi Manchurian', 'Crisp cauliflower florets tossed in a tangy Indo-Chinese glaze.',
   199.00, '/Images/veg-manchurian.jpg', true, 1, true, 4),

  ('45d3a480-59ae-5fd5-bb98-9ab4b95bdeda', '7dfc18f5-9840-59dc-badc-25a84f969e04',
   'Butter Naan', 'Tandoor-baked leavened bread brushed with butter.',
   49.00, '/Images/butter-naan.jpg', true, 0, true, 5),

  ('3c1b4c7f-d408-5739-a3cb-e1ce0a25c4be', '826f3ed1-a63e-5758-a221-a2b5168e8433',
   'Veg Hakka Noodles', 'Wok-tossed noodles with cabbage, carrot and spring onion.',
   219.00, '/Images/veg-hakka-noodles.jpg', true, 1, true, 6),

  ('afc4fc32-b4ca-538f-9555-37918a7c37d5', 'fbe7e6bf-bd65-5832-be85-0263aa2bfe20',
   'Chicken Tikka', 'Char-grilled chicken skewers marinated in yoghurt and spice.',
   289.00, '/Images/chicken-tikka.jpg', false, 1, true, 7),

  ('08cf2cd3-eef2-5bc4-81ec-55a70ebe03d6', '46518a19-0e68-5a5f-86c0-76cbba2f40a6',
   'Masala Dosa', 'Crisp rice crepe with spiced potato, chutney and sambar.',
   149.00, '/Images/masala-dosa.jpg', true, 0, true, 8),

  ('85968fb0-bea5-51fe-afd9-1f45c4d3c826', 'c95cac1e-83da-53dc-8792-88f20349a8d2',
   'Special Mutton Biryani', 'Slow-cooked mutton with a whisper of saffron and fried onion.',
   450.00, '/Images/mutton-biryani.jpg', false, 2, true, 9),

  ('ef0439d8-abe4-5a46-b7ee-e0f62726c148', 'c95cac1e-83da-53dc-8792-88f20349a8d2',
   'Veg Pulao', 'Fragrant rice tossed with garden vegetables and whole spice.',
   159.00, '/Images/veg-pulao.jpg', true, 0, true, 10),

  ('37c9d721-12fc-5948-8d9d-3989df205ea8', 'fbe7e6bf-bd65-5832-be85-0263aa2bfe20',
   'Paneer Tikka', 'Char-grilled cottage cheese with capsicum and onion.',
   219.00, '/Images/paneer-tikka.jpg', true, 1, true, 11),

  ('107666f8-a162-5c67-aba6-5287d0231be3', 'd6903ff7-f4d9-534d-a4b9-e38f860a96a5',
   'Butter Chicken', 'Tandoori chicken simmered in a buttery makhani gravy.',
   279.00, '/Images/butter-chicken.jpg', false, 1, true, 12),

  ('2ab5d740-6051-5550-8886-aa4b27e91cdf', 'd6903ff7-f4d9-534d-a4b9-e38f860a96a5',
   'Dal Tadka', 'Yellow lentils finished with a ghee and cumin tempering.',
   149.00, '/Images/dal-tadka.jpg', true, 0, true, 13),

  ('23eeb2b8-f03f-5202-89ac-25ed3ee804dd', '7dfc18f5-9840-59dc-badc-25a84f969e04',
   'Garlic Naan', 'Naan studded with fresh garlic and coriander.',
   69.00, '/Images/garlic-naan.jpg', true, 0, true, 14),

  ('7ca08d81-8c0d-502a-a823-a04ab8972e3e', '2cd9ff4b-18d4-5dd9-9386-79df544bcd7a',
   'Gulab Jamun', 'Warm milk dumplings soaked in cardamom sugar syrup.',
   79.00, '/Images/gulab-jamun.jpg', true, 0, true, 15),

  ('76838cfd-b312-552b-96cc-12faf53052ca', '2cd9ff4b-18d4-5dd9-9386-79df544bcd7a',
   'Rasmalai', 'Soft paneer discs in saffron-infused thickened milk.',
   99.00, '/Images/rasmalai.jpg', true, 0, true, 16),

  ('4b3073cb-cbe0-5f9a-ab3f-f11e0ffeb828', '151b551b-2e46-5ea0-a5eb-dc6f986f1729',
   'Masala Coke', 'Chilled cola with a house masala and lime kick.',
   49.00, '/Images/masala-coke.jpg', true, 0, true, 17)
ON CONFLICT (id) DO UPDATE
  SET category_id = EXCLUDED.category_id,
      name        = EXCLUDED.name,
      description = EXCLUDED.description,
      price       = EXCLUDED.price,
      image_url   = EXCLUDED.image_url,
      is_veg      = EXCLUDED.is_veg,
      spice_level = EXCLUDED.spice_level,
      available   = EXCLUDED.available,
      sort_order  = EXCLUDED.sort_order;

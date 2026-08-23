-- Seed script for Akshaya Restaurant Platform
-- Initial categories & authentic items from Akshaya Family Restaurant menu

-- Clean existing seed data if re-running
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE menu_categories CASCADE;

-- Insert Categories
INSERT INTO menu_categories (id, name, slug, sort_order, active) VALUES
('c1000000-0000-0000-0000-000000000001', 'Starters & Appetizers', 'starters', 1, true),
('c1000000-0000-0000-0000-000000000002', 'Biryani & Rice Specialties', 'biryani', 2, true),
('c1000000-0000-0000-0000-000000000003', 'Curries & Gravies', 'curries', 3, true),
('c1000000-0000-0000-0000-000000000004', 'Tandoori Roti & Breads', 'breads', 4, true),
('c1000000-0000-0000-0000-000000000005', 'Desserts & Beverages', 'desserts-beverages', 5, true);

-- Insert Menu Items
-- Starters
INSERT INTO menu_items (category_id, name, description, price, is_veg, spice_level, available, sort_order) VALUES
('c1000000-0000-0000-0000-000000000001', 'Telangana Chicken 65', 'Deep-fried marinated chicken tossed with curry leaves, red chillies and house spices.', 320.00, false, 2, true, 1),
('c1000000-0000-0000-0000-000000000001', 'Apollo Fish Fry', 'Crispy boneless fish fingers tossed in spicy yogurt-garlic sauce.', 380.00, false, 2, true, 2),
('c1000000-0000-0000-0000-000000000001', 'Paneer Majestic', 'Crispy cottage cheese strips sautéed with green chillies, garlic and royal herbs.', 290.00, true, 1, true, 3),
('c1000000-0000-0000-0000-000000000001', 'Crispy Corn Pepper Salt', 'Sweet corn kernels fried crisp and tossed with crushed black pepper and spring onion.', 250.00, true, 1, true, 4);

-- Biryani & Rice
INSERT INTO menu_items (category_id, name, description, price, is_veg, spice_level, available, sort_order) VALUES
('c1000000-0000-0000-0000-000000000002', 'Akshaya Special Chicken Dum Biryani', 'Slow-cooked aromatic basmati rice with tender marinated chicken, saffron and authentic Siddipet masala.', 360.00, false, 2, true, 1),
('c1000000-0000-0000-0000-000000000002', 'Mutton Dum Biryani', 'Fragrant long-grain rice dum cooked with fresh succulent lamb and secret spices.', 450.00, false, 3, true, 2),
('c1000000-0000-0000-0000-000000000002', 'Special Paneer Biryani', 'Layered basmati rice cooked with marinated paneer cubes and whole spices.', 310.00, true, 1, true, 3),
('c1000000-0000-0000-0000-000000000002', 'Jeera Rice', 'Aromatic basmati rice tempered with ghee, cumin seeds and coriander.', 190.00, true, 0, true, 4);

-- Curries & Gravies
INSERT INTO menu_items (category_id, name, description, price, is_veg, spice_level, available, sort_order) VALUES
('c1000000-0000-0000-0000-000000000003', 'Butter Chicken Masala', 'Tandoori chicken tikka cooked in rich tomato butter gravy topped with fresh cream.', 340.00, false, 1, true, 1),
('c1000000-0000-0000-0000-000000000003', 'Telangana Mutton Curry', 'Traditional country-style spicy lamb curry cooked in onion-tomato gravy with roasted spices.', 460.00, false, 3, true, 2),
('c1000000-0000-0000-0000-000000000003', 'Paneer Butter Masala', 'Cottage cheese cubes simmered in creamy tomato onion gravy with cashew paste.', 300.00, true, 1, true, 3),
('c1000000-0000-0000-0000-000000000003', 'Dal Tadka', 'Yellow lentils cooked with turmeric and tempered with garlic, ghee, cumin and dry chillies.', 210.00, true, 1, true, 4);

-- Breads
INSERT INTO menu_items (category_id, name, description, price, is_veg, spice_level, available, sort_order) VALUES
('c1000000-0000-0000-0000-000000000004', 'Butter Naan', 'Leavened clay oven bread brushed with rich dairy butter.', 55.00, true, 0, true, 1),
('c1000000-0000-0000-0000-000000000004', 'Garlic Naan', 'Freshly baked tandoori naan infused with minced garlic and butter.', 65.00, true, 0, true, 2),
('c1000000-0000-0000-0000-000000000004', 'Tandoori Roti', 'Whole wheat flatbread baked in traditional clay tandoor.', 35.00, true, 0, true, 3);

-- Desserts & Beverages
INSERT INTO menu_items (category_id, name, description, price, is_veg, spice_level, available, sort_order) VALUES
('c1000000-0000-0000-0000-000000000005', 'Gulab Jamun (2 pcs)', 'Golden fried milk solids soaked in cardamom rose sugar syrup.', 110.00, true, 0, true, 1),
('c1000000-0000-0000-0000-000000000005', 'Double Ka Meetha', 'Traditional Hyderabadi fried bread pudding soaked in saffron milk and dry fruits.', 140.00, true, 0, true, 2),
('c1000000-0000-0000-0000-000000000005', 'Fresh Lime Soda (Sweet/Salt)', 'Chilled sparkling soda with fresh mint, lime juice and spices.', 80.00, true, 0, true, 3);

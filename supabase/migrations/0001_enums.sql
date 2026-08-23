-- Migration 0001: Enums
-- Defines domain enums for user roles, order statuses, payment statuses, enquiry statuses, lead sources, and invoice types.

CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'success', 'failed', 'refunded');
CREATE TYPE enquiry_status AS ENUM ('new', 'contacted', 'quoted', 'confirmed', 'lost');
CREATE TYPE lead_source AS ENUM ('restaurant_order', 'banquet_enquiry', 'catering_enquiry', 'button_click', 'contact_form');
CREATE TYPE invoice_type AS ENUM ('proforma', 'tax');

-- Migration 0018: add the `super_admin` role to the user_role enum
-- ===========================================================================
-- The platform dashboard (app/super-admin/, currently an empty directory) is
-- specified for a platform-wide role that does not exist in the schema:
--
--   CREATE TYPE user_role AS ENUM ('owner', 'admin', 'staff');   -- 0001
--
-- Until this lands, `role = 'super_admin'` is not a value the column can hold,
-- and any policy or helper referencing it fails.
--
-- WHY THIS MIGRATION CONTAINS NOTHING ELSE:
-- A new enum label cannot be USED in the same transaction that adds it
-- (Postgres restriction — the label is not visible to other statements until
-- the adding transaction commits). Supabase runs each migration file in a
-- transaction, so the ADD VALUE must sit alone and everything that references
-- 'super_admin' goes in 0019. Do not merge these two files.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

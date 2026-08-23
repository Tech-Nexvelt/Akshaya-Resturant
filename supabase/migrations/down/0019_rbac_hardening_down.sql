-- Migration 0019 Down: Rollback RBAC hardening functions and policies
DROP FUNCTION IF EXISTS is_super_admin();
DROP FUNCTION IF EXISTS auth_role();

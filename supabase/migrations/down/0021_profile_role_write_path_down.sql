-- Migration 0021 Down: Revert profile role write grants
GRANT UPDATE ON profiles TO authenticated;

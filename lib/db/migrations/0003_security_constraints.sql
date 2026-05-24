-- Migration: digest_hour CHECK constraint
-- Only adds the CHECK constraint that can run with the app's database user.
--
-- NOTE: The following must be applied MANUALLY via Supabase SQL Editor
-- (requires superuser / postgres role — see docs/supabase-manual.sql):
--   • FK user_subscriptions.user_id → auth.users(id) ON DELETE CASCADE
--   • FK user_profiles.user_id      → auth.users(id) ON DELETE CASCADE
--   • RLS ENABLE + policies on user_subscriptions and user_profiles

--> statement-breakpoint
ALTER TABLE "user_profiles"
  ADD CONSTRAINT "digest_hour_range" CHECK (digest_hour >= 0 AND digest_hour <= 23);

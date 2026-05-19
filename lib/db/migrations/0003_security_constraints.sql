-- Migration: security constraints + RLS
-- Adds:
--   1. CHECK constraint on user_profiles.digest_hour (0-23)
--   2. FK from user_subscriptions.user_id → auth.users(id) ON DELETE CASCADE
--   3. FK from user_profiles.user_id       → auth.users(id) ON DELETE CASCADE
--   4. RLS on user_subscriptions (users can only read/write their own rows)
--   5. RLS on user_profiles      (users can only read/write their own row)

--> statement-breakpoint
ALTER TABLE "user_profiles"
  ADD CONSTRAINT "digest_hour_range" CHECK (digest_hour >= 0 AND digest_hour <= 23);

--> statement-breakpoint
ALTER TABLE "user_subscriptions"
  ADD CONSTRAINT "user_subscriptions_user_id_fk"
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

--> statement-breakpoint
ALTER TABLE "user_profiles"
  ADD CONSTRAINT "user_profiles_user_id_fk"
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

--> statement-breakpoint
ALTER TABLE "user_subscriptions" ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
CREATE POLICY "users_own_subscriptions" ON "user_subscriptions"
  USING (user_id = auth.uid());

--> statement-breakpoint
ALTER TABLE "user_profiles" ENABLE ROW LEVEL SECURITY;

--> statement-breakpoint
CREATE POLICY "users_own_profile" ON "user_profiles"
  USING (user_id = auth.uid());

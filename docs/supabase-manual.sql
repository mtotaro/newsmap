-- ============================================================
-- Run this ONCE via Supabase Dashboard → SQL Editor
-- (requires postgres / superuser role)
-- ============================================================

-- 1. FK: user_subscriptions.user_id → auth.users (cascade delete)
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_user_id_fk
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. FK: user_profiles.user_id → auth.users (cascade delete)
ALTER TABLE public.user_profiles
  ADD CONSTRAINT user_profiles_user_id_fk
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Enable RLS on user_subscriptions
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_subscriptions"
  ON public.user_subscriptions
  USING (user_id = auth.uid());

-- 4. Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_profile"
  ON public.user_profiles
  USING (user_id = auth.uid());

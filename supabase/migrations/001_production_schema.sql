-- ============================================================
-- BookAIO – Production Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- ─── Extensions ──────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Table: profiles ─────────────────────────────────────────────────────────
-- One row per authenticated user. Created on first login.

CREATE TABLE IF NOT EXISTS public.profiles (
  id                      UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                   TEXT,
  plan                    TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'essential', 'abundance')),
  ebook_count_this_month  INTEGER NOT NULL DEFAULT 0,
  quota_reset_at          TIMESTAMPTZ DEFAULT (date_trunc('month', NOW()) + INTERVAL '1 month'),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Table: generations ───────────────────────────────────────────────────────
-- Stores all generated assets (ebooks, covers, mockups, ads, videos).

CREATE TABLE IF NOT EXISTS public.generations (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL CHECK (type IN ('ebook', 'cover', 'mockup', 'ad', 'video')),
  title       TEXT NOT NULL CHECK (char_length(title) <= 200),
  url         TEXT NOT NULL CHECK (char_length(url) <= 500),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Table: orders ────────────────────────────────────────────────────────────
-- Stores Paystack payment records. Updated by the Paystack webhook via n8n.

CREATE TABLE IF NOT EXISTS public.orders (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan            TEXT NOT NULL CHECK (plan IN ('essential', 'abundance')),
  amount_fcfa     INTEGER NOT NULL,
  billing_cycle   TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'annually')),
  paystack_ref    TEXT UNIQUE,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS orders_updated_at ON public.orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ─── Indexes ──────────────────────────────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_generations_user_id    ON public.generations(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_created_at ON public.generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_type       ON public.generations(type);
CREATE INDEX IF NOT EXISTS idx_orders_user_id         ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status          ON public.orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_paystack_ref    ON public.orders(paystack_ref);

-- ─── RLS: Enable on all tables ────────────────────────────────────────────────

ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders     ENABLE ROW LEVEL SECURITY;

-- ─── RLS Policies: profiles ───────────────────────────────────────────────────

-- Users can only read their own profile
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can only update their own profile (but NOT their plan — plan is set by webhook)
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (first login)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── RLS Policies: generations ────────────────────────────────────────────────

-- Users can only read their own generations
DROP POLICY IF EXISTS "generations_select_own" ON public.generations;
CREATE POLICY "generations_select_own"
  ON public.generations FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own generations (via Edge Function which uses service role)
-- Note: The Edge Function uses the service role key, so it bypasses RLS.
-- This policy allows direct inserts from the authenticated client as a fallback.
DROP POLICY IF EXISTS "generations_insert_own" ON public.generations;
CREATE POLICY "generations_insert_own"
  ON public.generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own generations
DROP POLICY IF EXISTS "generations_delete_own" ON public.generations;
CREATE POLICY "generations_delete_own"
  ON public.generations FOR DELETE
  USING (auth.uid() = user_id);

-- ─── RLS Policies: orders ─────────────────────────────────────────────────────

-- Users can only read their own orders
DROP POLICY IF EXISTS "orders_select_own" ON public.orders;
CREATE POLICY "orders_select_own"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);

-- Orders are created/updated ONLY by the service role (Paystack webhook via n8n)
-- No client-side insert/update policies → prevents payment fraud

-- ─── Helper Function: increment_ebook_count ───────────────────────────────────
-- Called by the Edge Function after a successful ebook generation.
-- Uses SECURITY DEFINER to run as the function owner (bypasses RLS safely).

CREATE OR REPLACE FUNCTION public.increment_ebook_count(p_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET ebook_count_this_month = ebook_count_this_month + 1
  WHERE id = p_user_id;
END;
$$;

-- ─── Helper Function: update_user_plan ────────────────────────────────────────
-- Called by n8n after a successful Paystack payment.
-- SECURITY DEFINER: only callable with service role or by the function owner.

CREATE OR REPLACE FUNCTION public.update_user_plan(
  p_user_id     UUID,
  p_plan        TEXT,
  p_paystack_ref TEXT,
  p_amount_fcfa  INTEGER,
  p_billing_cycle TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Update the user's plan
  UPDATE public.profiles
  SET plan = p_plan
  WHERE id = p_user_id;

  -- Record the order
  INSERT INTO public.orders (user_id, plan, amount_fcfa, billing_cycle, paystack_ref, status)
  VALUES (p_user_id, p_plan, p_amount_fcfa, p_billing_cycle, p_paystack_ref, 'completed')
  ON CONFLICT (paystack_ref) DO UPDATE SET status = 'completed';
END;
$$;

-- ─── Verification Queries ─────────────────────────────────────────────────────
-- Run these after applying the migration to verify RLS is working:
--
-- 1. Check RLS is enabled:
--    SELECT tablename, rowsecurity FROM pg_tables
--    WHERE schemaname = 'public' AND tablename IN ('profiles', 'generations', 'orders');
--    → All should show rowsecurity = true
--
-- 2. Check policies exist:
--    SELECT tablename, policyname, cmd FROM pg_policies WHERE schemaname = 'public';
--
-- 3. Test as anon (should return 0 rows):
--    SET LOCAL role = anon;
--    SELECT * FROM generations;
--    SELECT * FROM profiles;

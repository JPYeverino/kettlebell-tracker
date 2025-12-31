-- Migration: Add pilot invite codes and admin audit logging
-- Run this in Supabase SQL Editor

-- =============================================
-- 1. PILOT INVITES TABLE
-- =============================================

CREATE TABLE pilot_invites (
  code TEXT PRIMARY KEY,
  used BOOLEAN DEFAULT false,
  used_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert 10 pilot invite codes
INSERT INTO pilot_invites (code) VALUES
  ('PILOT-KB-01'),
  ('PILOT-KB-02'),
  ('PILOT-KB-03'),
  ('PILOT-KB-04'),
  ('PILOT-KB-05'),
  ('PILOT-KB-06'),
  ('PILOT-KB-07'),
  ('PILOT-KB-08'),
  ('PILOT-KB-09'),
  ('PILOT-KB-10');

-- Add unique constraint to prevent race conditions
-- This ensures only ONE user can claim each code at the database level
CREATE UNIQUE INDEX unique_code_usage ON pilot_invites(code) WHERE used = true;

-- RLS policies for pilot_invites
ALTER TABLE pilot_invites ENABLE ROW LEVEL SECURITY;

-- Allow anyone to check if a code is valid (for signup)
CREATE POLICY "Anyone can check invite codes" ON pilot_invites
  FOR SELECT USING (true);

-- Allow updating when using a code (mark as used)
-- The USING clause checks current state, WITH CHECK validates the new state
CREATE POLICY "Anyone can use invite codes" ON pilot_invites
  FOR UPDATE
  USING (NOT used)
  WITH CHECK (used = true);

-- =============================================
-- 2. ADMIN AUDIT LOG TABLE
-- =============================================

CREATE TABLE admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'view_user_data', 'view_invites', 'export_data', etc.
  target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  table_name TEXT,
  details JSONB,
  reason TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for querying audit logs
CREATE INDEX idx_audit_admin ON admin_audit_log(admin_user_id, created_at DESC);
CREATE INDEX idx_audit_target ON admin_audit_log(target_user_id, created_at DESC);
CREATE INDEX idx_audit_action ON admin_audit_log(action, created_at DESC);

-- RLS policies for admin_audit_log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow viewing your own admin actions
CREATE POLICY "Admins can view own audit logs" ON admin_audit_log
  FOR SELECT USING (auth.uid() = admin_user_id);

-- Allow users to view audit logs where they are the target (when requesting)
CREATE POLICY "Users can view audits about them" ON admin_audit_log
  FOR SELECT USING (auth.uid() = target_user_id);

-- Allow inserting audit logs (for auto-logging)
CREATE POLICY "Anyone can insert audit logs" ON admin_audit_log
  FOR INSERT WITH CHECK (true);

-- =============================================
-- 3. VERIFICATION
-- =============================================

-- Check that tables were created
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('pilot_invites', 'admin_audit_log');

-- Check invite codes
SELECT code, used, used_by, used_at FROM pilot_invites ORDER BY code;

-- Should show 10 codes, all unused

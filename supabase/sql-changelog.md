# Supabase SQL Changelog

This file tracks all SQL changes applied to the Supabase database. Each entry documents when changes were made, what they do, and how to re-apply them.

## Format

Each entry should include:
- **Date**: When the change was applied
- **Description**: What the change does
- **File**: Path to the SQL script (if stored as a file)
- **How to re-apply**: Instructions for running the SQL again

---

## 2025-01-15: Auth-first setup for entries table

**Description**: Initial auth-first configuration for the `entries` table with owner-based row-level security.

**File**: `supabase/auth-setup.sql`

**Changes**:
- Created `entries` table with columns: id, created_at, type, title, value, notes
- Added `owner` column (uuid) for user ownership
- Created trigger function `set_entry_owner()` to auto-set owner from `auth.uid()` on insert
- Added indexes on owner, created_at, and type
- Enabled Row Level Security (RLS)
- Created authenticated policies for select, insert, update, and delete operations scoped to owner

**How to re-apply**:
1. Open Supabase SQL Editor
2. Copy and paste the contents of `supabase/auth-setup.sql`
3. Replace the placeholder UUID in the backfill section (line 40) with your user UUID from Auth → Users
4. Execute the script
5. Verify policies are created: `SELECT * FROM pg_policies WHERE tablename = 'entries';`

**Notes**:
- The script is idempotent (safe to run multiple times) due to `IF NOT EXISTS` clauses
- Policies use `DROP POLICY IF EXISTS` before creating, so re-running is safe
- Remember to backfill existing rows with your user UUID before setting `owner` to NOT NULL


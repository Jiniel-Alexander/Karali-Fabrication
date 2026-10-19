-- ===========================================================================
-- Migration: create location_test_submissions
--
-- STATUS: PROPOSED — NOT APPLIED. Review before running `npx supabase db push`.
--
-- Purpose: store the locality a visitor selects on the Coming Soon page, to
-- test the browser -> Supabase write path. No personal data is stored.
--
-- Security model:
--   * RLS enabled; the only policy is INSERT for the `anon` role.
--   * `anon` has NO select / update / delete privileges.
--   * `anon` may insert ONLY the `locality` column (column-level grant), so the
--     browser cannot choose `id` or `created_at`.
--   * Allowed localities are enforced twice: CHECK constraint (all writers)
--     and the RLS policy (anon writers).
--
-- The locality list MUST match src/data/localities.js (enforced by tests).
-- ===========================================================================

-- Private schema: not exposed through the Data API (PostgREST).
create schema if not exists private;
revoke all on schema private from public;

create or replace function private.is_allowed_locality(value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select value = any (array[
    -- Mumbai
    'Andheri East', 'Andheri West', 'Bandra East', 'Bandra West', 'Bhandup',
    'Borivali East', 'Borivali West', 'Byculla', 'Chembur', 'Colaba',
    'Dadar', 'Dahisar', 'Fort', 'Ghatkopar', 'Goregaon East',
    'Goregaon West', 'Jogeshwari', 'Kandivali East', 'Kandivali West', 'Kurla',
    'Lower Parel', 'Malad East', 'Malad West', 'Mulund', 'Parel',
    'Powai', 'Santacruz', 'Vikhroli', 'Vile Parle', 'Wadala',
    'Worli',
    -- Thane
    'Ambernath', 'Badlapur', 'Bhayandar East', 'Bhayandar West', 'Dombivli East',
    'Dombivli West', 'Kalwa', 'Kalyan East', 'Kalyan West', 'Mira Road',
    'Mumbra', 'Thane East', 'Thane West', 'Ulhasnagar',
    -- Navi Mumbai
    'Airoli', 'Belapur', 'Ghansoli', 'Kamothe', 'Kharghar',
    'Koparkhairane', 'Nerul', 'Panvel', 'Sanpada', 'Seawoods',
    'Taloja', 'Vashi'
  ]::text[]);
$$;

comment on function private.is_allowed_locality(text)
  is 'True when value is one of the approved Coming Soon test localities.';

-- The RLS policy is evaluated as the calling role, so anon needs USAGE on the
-- schema and EXECUTE on this one function (nothing else in `private`).
revoke all on function private.is_allowed_locality(text) from public;
grant usage on schema private to anon, authenticated, service_role;
grant execute on function private.is_allowed_locality(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Table
-- ---------------------------------------------------------------------------
create table public.location_test_submissions (
  id         uuid        primary key default gen_random_uuid(),
  locality   text        not null
             constraint location_test_submissions_locality_allowed
             check (private.is_allowed_locality(locality)),
  created_at timestamptz not null default now()
);

comment on table public.location_test_submissions
  is 'Coming Soon page test: visitor-selected locality only. No personal data.';

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.location_test_submissions enable row level security;

-- Supabase grants ALL on new public tables to anon/authenticated by default.
-- Remove that, then grant back only what the browser needs.
revoke all on table public.location_test_submissions from anon, authenticated;

-- Column-level grant: anon may supply `locality` and nothing else.
grant insert (locality) on table public.location_test_submissions to anon;

create policy "anon can insert allowed localities"
  on public.location_test_submissions
  for insert
  to anon
  with check (private.is_allowed_locality(locality));

-- No SELECT / UPDATE / DELETE policies or grants for anon or authenticated.
-- Read the data from the Supabase dashboard (Table Editor / SQL editor) or
-- with the service_role key from a trusted server — never from the browser.

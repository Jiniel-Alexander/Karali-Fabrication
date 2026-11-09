-- ===========================================================================
-- Migration: create quote_requests
--
-- STATUS: PROPOSED — NOT APPLIED. Review before running in Supabase SQL Editor.
--
-- Purpose: Store commercial and industrial project quote requests submitted
-- exclusively via the Cloudflare Pages Function (/api/quote) after server-side
-- Turnstile bot verification.
--
-- Migration History & Live Database Findings:
--   * Catalog inspection confirmed:
--       - public.location_test_submissions exists.
--       - private.is_allowed_locality(text) exists.
--       - anon & service_role already have USAGE on `private` and EXECUTE on
--         `private.is_allowed_locality(text)`.
--       - public.quote_requests returned NULL from to_regclass().
--       - private.is_allowed_service_slug(text) returned NULL from to_regprocedure().
--   * Live migration tracking schema: No schema matching '%migration%' was found
--     in information_schema.schemata. Migration history therefore could not be
--     independently verified through the database engine.
--   * Existing repository migration filename is retained to maintain consistency
--     with local repository history and automated tests.
--
-- Compatibility & Security Model:
--   * public.location_test_submissions is completely untouched.
--   * private.is_allowed_locality(text) and its existing permissions
--     (anon & service_role EXECUTE) are NOT redefined, replaced, revoked, or modified.
--   * Only the new private.is_allowed_service_slug(text) helper is created in `private`.
--   * public.quote_requests contains exactly seven business fields plus `id` and `created_at`.
--   * Phone numbers are strictly constrained to normalized 10-digit Indian mobile numbers
--     ('^[6-9][0-9]{9}$'), matching the serverless endpoint normalization.
--   * RLS is enabled and forced on public.quote_requests.
--   * No policies or table privileges are granted to `anon` or `authenticated`,
--     blocking all direct client-side PostgREST access.
--   * service_role receives ONLY column-level INSERT on the seven business fields.
--   * Cloudflare endpoint sends `Prefer: return=minimal` so no SELECT privilege is required.
--   * Turnstile tokens are verification artifacts and are never stored in the database.
-- ===========================================================================

-- Atomic migration: any failure (including pre-existing objects) rolls back
-- every statement, so a partially applied migration cannot occur.
begin;

-- ---------------------------------------------------------------------------
-- 1. Service Slug Validation Helper (schema `private` already exists live)
-- ---------------------------------------------------------------------------
-- Plain CREATE (no OR REPLACE): fails clearly if an unexpected function exists.
create function private.is_allowed_service_slug(value text)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select value = any (array[
    'structural-steel-fabrication',
    'lift-shaft-steelwork-crash-decks',
    'industrial-sheds-mezzanines',
    'staircases-railings-gates',
    'custom-metal-fabrication',
    'roofing-sheets-cladding',
    'industrial-racking-storage',
    'unipole-structures-hoardings',
    'pergolas-gazebos',
    'commercial-rolling-shutters',
    'security-window-grills',
    'animal-farm-sheds'
  ]::text[]);
$$;

comment on function private.is_allowed_service_slug(text)
  is 'True when value matches one of the 12 approved Karali Fabrication core service slugs.';

-- Restrict function execution: service_role only (used during CHECK constraint validation)
revoke all on function private.is_allowed_service_slug(text) from public, anon, authenticated;
grant execute on function private.is_allowed_service_slug(text) to service_role;

-- ---------------------------------------------------------------------------
-- 2. Table: public.quote_requests
-- ---------------------------------------------------------------------------
-- Plain CREATE (no IF NOT EXISTS): fails clearly if an unexpected table exists.
create table public.quote_requests (
  id              uuid        primary key default gen_random_uuid(),
  full_name       text        not null
                  constraint quote_requests_name_len
                  check (char_length(trim(full_name)) >= 2 and char_length(trim(full_name)) <= 120),
  phone           text        not null
                  constraint quote_requests_phone_format
                  check (phone ~ '^[6-9][0-9]{9}$'),
  service_slug    text        not null
                  constraint quote_requests_service_slug_allowed
                  check (private.is_allowed_service_slug(service_slug)),
  locality        text        not null
                  constraint quote_requests_locality_allowed
                  check (private.is_allowed_locality(locality)),
  project_details text        not null
                  constraint quote_requests_details_len
                  check (char_length(trim(project_details)) >= 10 and char_length(trim(project_details)) <= 2000),
  drawings_status text        not null default 'none'
                  constraint quote_requests_drawings_status_check
                  check (drawings_status in ('yes', 'in_progress', 'none')),
  consent         boolean     not null
                  constraint quote_requests_consent_check
                  check (consent = true),
  created_at      timestamptz not null default now()
);

comment on table public.quote_requests
  is 'Phase 4 industrial quotation requests submitted exclusively via Cloudflare Pages Function (/api/quote).';

-- ---------------------------------------------------------------------------
-- 3. Row Level Security & Least-Privilege Grants
-- ---------------------------------------------------------------------------
alter table public.quote_requests enable row level security;
alter table public.quote_requests force row level security;

-- Defensive cleanup in case an older draft policy was ever created
drop policy if exists "anon can submit quote requests" on public.quote_requests;

-- Revoke all default table privileges from all roles
revoke all on table public.quote_requests from public, anon, authenticated, service_role;

-- Ensure service_role can resolve table in schema public
grant usage on schema public to service_role;

-- Grant service_role ONLY column-level INSERT on the seven user-submitted fields
grant insert (
  full_name,
  phone,
  service_slug,
  locality,
  project_details,
  drawings_status,
  consent
) on table public.quote_requests to service_role;

-- No SELECT, UPDATE, or DELETE privileges are granted to any role.
-- No policies exist for anon or authenticated (all direct client PostgREST access rejected).

commit;

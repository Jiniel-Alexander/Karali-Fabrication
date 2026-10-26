-- ===========================================================================
-- Migration: create quote_requests
--
-- STATUS: PROPOSED — NOT APPLIED. Review before running `npx supabase db push`.
--
-- Purpose: Store commercial and industrial project quote requests submitted via
-- the Phase 4 Karali Fabrication quote form.
--
-- Security model:
--   * Self-contained: ensures schema `private` exists and is revoked from public.
--   * RLS enabled and forced; the only policy is INSERT for the `anon` role.
--   * `anon` has NO select / update / delete privileges (commercial lead confidentiality).
--   * `anon` may insert ONLY validated form columns (column-level grant), so the
--     browser cannot forge `id` or `created_at`.
--   * Input constraints strictly enforced at database level (name length, phone format,
--     12 allowed service slugs, 57 MMR localities via private.is_allowed_locality).
--   * Consent must be explicitly provided (no default true).
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1. Private Schema & Security Setup
-- ---------------------------------------------------------------------------
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 2. Validation Helper: Allowed Service Slugs
-- ---------------------------------------------------------------------------
create or replace function private.is_allowed_service_slug(value text)
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
  is 'True when value matches one of the 12 approved Karali Fabrication service slugs.';

grant execute on function private.is_allowed_service_slug(text) to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 3. Table: quote_requests
-- ---------------------------------------------------------------------------
create table if not exists public.quote_requests (
  id              uuid        primary key default gen_random_uuid(),
  full_name       text        not null
                  constraint quote_requests_name_len
                  check (char_length(trim(full_name)) >= 2 and char_length(trim(full_name)) <= 120),
  phone           text        not null
                  constraint quote_requests_phone_format
                  check (phone ~ '^[6-9][0-9]{9}$' or phone ~ '^\+91[6-9][0-9]{9}$'),
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
  is 'Phase 4 industrial quote enquiries with zero-storage drawing bridge reference.';

-- ---------------------------------------------------------------------------
-- 4. Row Level Security & Column-Level Grants
-- ---------------------------------------------------------------------------
alter table public.quote_requests enable row level security;
alter table public.quote_requests force row level security;

-- Revoke default grants from PUBLIC, anon, and authenticated
revoke all on table public.quote_requests from public, anon, authenticated;
grant usage on schema public to anon;

-- Grant back ONLY column-level INSERT for client fields
grant insert (
  full_name,
  phone,
  service_slug,
  locality,
  project_details,
  drawings_status,
  consent
) on table public.quote_requests to anon;

drop policy if exists "anon can submit quote requests" on public.quote_requests;
create policy "anon can submit quote requests"
  on public.quote_requests
  for insert
  to anon
  with check (
    char_length(trim(full_name)) >= 2 and
    char_length(trim(full_name)) <= 120 and
    (phone ~ '^[6-9][0-9]{9}$' or phone ~ '^\+91[6-9][0-9]{9}$') and
    private.is_allowed_service_slug(service_slug) and
    private.is_allowed_locality(locality) and
    char_length(trim(project_details)) >= 10 and
    char_length(trim(project_details)) <= 2000 and
    drawings_status in ('yes', 'in_progress', 'none') and
    consent = true
  );

-- No SELECT / UPDATE / DELETE policies or grants for anon or authenticated.
-- Commercial quote requests are private to Karali Fabrication management.

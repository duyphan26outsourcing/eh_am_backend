-- =============================================================================
-- MIGRATION 02o: ĐƠN VỊ SỬA CHỮA (UC-MDM-06)
-- Chạy sau 02n. Chạy 02p ngay sau file này.
-- =============================================================================

alter table public.locations
  add column if not exists deactivated_reason_code_id uuid null references public.reason_codes(id),
  add column if not exists deactivated_note text null,
  add column if not exists deactivated_at timestamptz null,
  add column if not exists deactivated_by uuid null references public.user_profiles(id) on delete set null;

create table if not exists public.repair_vendors (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 200),
  contact_name text null check (contact_name = btrim(contact_name) and char_length(contact_name) between 1 and 100),
  contact_phone text null check (contact_phone ~ '^0[0-9]{9}$'),
  contact_email text null check (
    contact_email = lower(btrim(contact_email)) and char_length(contact_email) between 3 and 254
  ),
  service_types text[] not null check (
    cardinality(service_types) between 1 and 2
    and service_types <@ array['REPAIR','WARRANTY']::text[]
    and (cardinality(service_types) = 1 or service_types[1] <> service_types[2])
  ),
  external_location_id uuid not null references public.locations(id),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  deactivated_reason_code_id uuid null references public.reason_codes(id),
  deactivated_note text null,
  deactivated_at timestamptz null,
  deactivated_by uuid null references public.user_profiles(id) on delete set null,
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references public.user_profiles(id) on delete set null,
  updated_by uuid null references public.user_profiles(id) on delete set null,
  constraint repair_vendors_external_location_uq unique (external_location_id)
);

create index if not exists repair_vendors_status_created_idx
  on public.repair_vendors (status, created_at desc);
create index if not exists repair_vendors_name_search_idx
  on public.repair_vendors using gin (to_tsvector('simple', name));

drop trigger if exists repair_vendors_set_updated_at on public.repair_vendors;
create trigger repair_vendors_set_updated_at
before update on public.repair_vendors
for each row execute function public.tg_set_updated_at();

alter table public.repair_vendors enable row level security;
revoke all on table public.repair_vendors from anon, authenticated;

create table if not exists public.repair_vendor_command_receipts (
  command_key uuid primary key,
  operation text not null check (operation in ('CREATE', 'UPDATE', 'DEACTIVATE')),
  repair_vendor_id uuid null references public.repair_vendors(id),
  actor_id uuid not null,
  result_row jsonb null,
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists repair_vendor_receipts_vendor_idx
  on public.repair_vendor_command_receipts (repair_vendor_id);
alter table public.repair_vendor_command_receipts enable row level security;
revoke all on table public.repair_vendor_command_receipts from anon, authenticated;

comment on table public.repair_vendor_command_receipts is
  'Biên nhận idempotency nội bộ cho UC-MDM-06; không mở qua REST/RLS.';

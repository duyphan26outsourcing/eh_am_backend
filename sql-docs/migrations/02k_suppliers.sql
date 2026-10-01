-- =============================================================================
-- MIGRATION 02k: NHÀ CUNG CẤP (UC-MDM-05)
-- Chạy sau 02g_reason_codes.sql. Chạy 02l_supplier_rpc.sql ngay sau file này.
-- =============================================================================

create table if not exists public.suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null check (name = btrim(name) and char_length(name) between 1 and 200),
  tax_id text null check (tax_id ~ '^[0-9]{10}(-[0-9]{3})?$'),
  contact_name text null check (contact_name = btrim(contact_name) and char_length(contact_name) between 1 and 100),
  contact_phone text null check (contact_phone ~ '^0[0-9]{9}$'),
  contact_email text null check (
    contact_email = lower(btrim(contact_email)) and char_length(contact_email) between 3 and 254
  ),
  status text not null default 'ACTIVE' check (status in ('ACTIVE', 'INACTIVE')),
  version integer not null default 1 check (version > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid null references public.user_profiles(id) on delete set null,
  updated_by uuid null references public.user_profiles(id) on delete set null
);

create unique index if not exists suppliers_tax_id_uq
  on public.suppliers (tax_id) where tax_id is not null;
create index if not exists suppliers_status_created_idx
  on public.suppliers (status, created_at desc);
create index if not exists suppliers_name_search_idx
  on public.suppliers using gin (to_tsvector('simple', name));

drop trigger if exists suppliers_set_updated_at on public.suppliers;
create trigger suppliers_set_updated_at
before update on public.suppliers
for each row execute function public.tg_set_updated_at();

alter table public.suppliers enable row level security;
revoke all on table public.suppliers from anon, authenticated;

-- Biên nhận lệnh bảo đảm retry cùng Idempotency-Key không tạo/sửa/ngừng hai lần.
create table if not exists public.supplier_command_receipts (
  command_key uuid primary key,
  operation text not null check (operation in ('CREATE', 'UPDATE', 'DEACTIVATE')),
  supplier_id uuid null references public.suppliers(id),
  actor_id uuid not null,
  result_row jsonb null,
  created_at timestamptz not null default now(),
  completed_at timestamptz null
);

create index if not exists supplier_command_receipts_supplier_idx
  on public.supplier_command_receipts (supplier_id);

alter table public.supplier_command_receipts enable row level security;
revoke all on table public.supplier_command_receipts from anon, authenticated;

comment on table public.supplier_command_receipts is
  'Biên nhận idempotency nội bộ cho lệnh ghi UC-MDM-05; không mở qua REST/RLS.';

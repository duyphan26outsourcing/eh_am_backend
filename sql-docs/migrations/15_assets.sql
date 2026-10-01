-- =============================================================================
-- 15 — Hồ sơ tài sản (M03, UC-AST-01). Chạy sau 14.
-- Bảng nghiệp vụ ĐẦU TIÊN của M03. KHÔNG sửa migration 01–14 đã chạy.
-- =============================================================================
--
-- ⚠️ VÌ SAO
--   · Asset ID (`asset_code`) do dãy cấp, duy nhất, KHÔNG tái dùng kể cả sau thanh lý (BR-AST-01)
--     → dùng sequence (cho phép khoảng trống khi một lệnh bị hoàn tác).
--   · Serial không trùng trong cùng loại, hồ sơ Hủy không tính (BR-AST-03) → partial unique index.
--   · Hồ sơ + QR + audit lưu trong MỘT transaction (HO-01, BR-AUD-04) → gói trong RPC create_asset.
--   · Biên dữ liệu theo location do code tự thực thi (service_role bỏ qua RLS) — RLS ở đây chỉ là
--     lưới chặn anon/authenticated gọi thẳng PostgREST.

create sequence if not exists public.asset_code_seq;

create table if not exists public.assets (
  id                   uuid primary key default gen_random_uuid(),
  asset_code           text not null unique,
  name                 text not null,
  asset_type_id        uuid not null references public.asset_types(id),
  serial               text,
  note                 text,
  purchase_date        date,
  supplier_id          uuid references public.suppliers(id),
  invoice_no           text,
  primary_location_id  uuid not null references public.locations(id),
  cost_center_id       uuid not null references public.cost_centers(id),
  responsible_user_id  uuid not null references public.user_profiles(id),
  lifecycle_status     text not null
                         check (lifecycle_status in
                           ('IN_STORAGE','IN_USE','UNDER_REPAIR','PENDING_DISPOSAL','DISPOSED','CANCELLED')),
  physical_condition   text not null default 'GOOD'
                         check (physical_condition in ('GOOD','NEEDS_REPAIR','BROKEN')),
  qr_token             text not null unique,
  profile_version      integer not null default 1,
  created_by           uuid,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

-- BR-AST-03: serial duy nhất trong một loại; hồ sơ CANCELLED không tính.
create unique index if not exists uq_asset_serial_per_type
  on public.assets (asset_type_id, serial)
  where serial is not null and lifecycle_status <> 'CANCELLED';
create index if not exists idx_assets_location on public.assets (primary_location_id);
create index if not exists idx_assets_type on public.assets (asset_type_id);

alter table public.assets enable row level security;

create table if not exists public.asset_command_receipts (
  command_key uuid primary key,
  actor_id uuid not null,
  operation text not null check (operation in ('CREATE')),
  payload jsonb not null,
  result_row jsonb,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.asset_command_receipts enable row level security;

create or replace function public.create_asset(
  p_command_key uuid,
  p_name text,
  p_asset_type_id uuid,
  p_serial text,
  p_note text,
  p_purchase_date date,
  p_supplier_id uuid,
  p_invoice_no text,
  p_primary_location_id uuid,
  p_responsible_user_id uuid,
  p_lifecycle_status text,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_receipt public.asset_command_receipts;
  v_type public.asset_types;
  v_loc public.locations;
  v_resp public.user_profiles;
  v_asset public.assets;
  v_payload jsonb;
  v_serial text := nullif(btrim(p_serial), '');
  v_name text := btrim(p_name);
  v_code text;
  v_existing text;
  v_constraint text;
  v_result jsonb;
begin
  v_payload := jsonb_build_object(
    'name', v_name, 'type', p_asset_type_id, 'serial', v_serial,
    'note', nullif(btrim(p_note), ''), 'purchase_date', p_purchase_date,
    'supplier', p_supplier_id, 'invoice', nullif(btrim(p_invoice_no), ''),
    'location', p_primary_location_id, 'responsible', p_responsible_user_id,
    'status', p_lifecycle_status);

  insert into public.asset_command_receipts(command_key, actor_id, operation, payload)
    values (p_command_key, p_actor_id, 'CREATE', v_payload) on conflict do nothing;
  if not found then
    select * into v_receipt from public.asset_command_receipts where command_key = p_command_key;
    if v_receipt.actor_id <> p_actor_id or v_receipt.operation <> 'CREATE'
       or v_receipt.payload <> v_payload then
      raise exception 'IDEMPOTENCY_KEY_REUSED';
    end if;
    if v_receipt.completed_at is null or v_receipt.result_row is null then
      raise exception 'IDEMPOTENCY_IN_PROGRESS';
    end if;
    return v_receipt.result_row || jsonb_build_object('is_replay', true);
  end if;

  -- BR-AST-02: tên bắt buộc.
  if coalesce(char_length(v_name), 0) < 1 or char_length(v_name) > 200 then
    raise exception 'ASSET_NAME_INVALID';
  end if;
  if p_lifecycle_status is null or p_lifecycle_status not in ('IN_STORAGE', 'IN_USE') then
    raise exception 'ASSET_STATUS_INVALID';
  end if;

  -- Loại tài sản: phải là LOẠI LÁ (parent_id not null, asset_kind not null) và ACTIVE.
  select * into v_type from public.asset_types where id = p_asset_type_id for share;
  if not found or v_type.status <> 'ACTIVE'
     or v_type.parent_id is null or v_type.asset_kind is null then
    raise exception 'ASSET_TYPE_INVALID';
  end if;
  if v_type.serial_required and v_serial is null then
    raise exception 'ASSET_SERIAL_REQUIRED';
  end if;

  -- Location ACTIVE + có cost center mặc định (BR-MDM-04).
  select * into v_loc from public.locations where id = p_primary_location_id for share;
  if not found or v_loc.status <> 'ACTIVE' then raise exception 'LOCATION_INVALID'; end if;
  if v_loc.default_cost_center_id is null then raise exception 'LOCATION_COST_CENTER_MISSING'; end if;

  -- Nhà cung cấp (nếu nhập) phải có thật và đang hoạt động — nếu không, insert sẽ ném FK 500 khó hiểu.
  if p_supplier_id is not null and not exists (
    select 1 from public.suppliers where id = p_supplier_id and status = 'ACTIVE' for share
  ) then
    raise exception 'SUPPLIER_INVALID';
  end if;

  -- Người chịu trách nhiệm ACTIVE (BR-AST-09). FOR SHARE: chốt trạng thái, chặn đua với
  -- terminate_employee/khóa tài khoản đang đóng vai trò của người này.
  select * into v_resp from public.user_profiles where id = p_responsible_user_id for share;
  if not found or v_resp.status <> 'ACTIVE' then raise exception 'RESPONSIBLE_INVALID'; end if;
  -- ⚠️ BR-AST-09: phải có vai trò LOCATION trên đúng location đó, HOẶC là Quản lý tài sản (platform)
  -- — Quản lý tài sản chịu trách nhiệm được cả location bên ngoài (EXTERNAL).
  if not exists (
    select 1 from public.context_role_assignments cra
    where cra.subject_type = 'USER' and cra.subject_id = p_responsible_user_id
      and cra.effective_from <= now() and (cra.effective_to is null or cra.effective_to > now())
      and (
        (cra.context_type = 'LOCATION' and cra.context_id = p_primary_location_id
          and cra.role_code in ('LOCATION_MANAGER','LOCATION_STAFF'))
        or (cra.context_type = 'PLATFORM' and cra.role_code = 'ASSET_MANAGER')
      )
  ) then
    raise exception 'RESPONSIBLE_NOT_ON_LOCATION';
  end if;

  v_code := 'TS' || lpad(nextval('public.asset_code_seq')::text, 6, '0');

  begin
    insert into public.assets(
      asset_code, name, asset_type_id, serial, note, purchase_date, supplier_id, invoice_no,
      primary_location_id, cost_center_id, responsible_user_id, lifecycle_status, physical_condition,
      qr_token, created_by
    ) values (
      v_code, v_name, p_asset_type_id, v_serial, nullif(btrim(p_note), ''), p_purchase_date,
      p_supplier_id, nullif(btrim(p_invoice_no), ''), p_primary_location_id, v_loc.default_cost_center_id,
      p_responsible_user_id, p_lifecycle_status, 'GOOD',
      -- QR token: 2× uuid bỏ gạch (không cần pgcrypto). Ảnh QR render ở M04 từ token này.
      replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
      p_actor_id
    ) returning * into v_asset;
  exception when unique_violation then
    -- ⚠️ Chỉ coi là trùng serial khi đúng index serial. asset_code/qr_token là dãy/ngẫu nhiên, nếu
    -- đụng (reseed sequence, insert tay) thì KHÔNG được báo "trùng serial" — re-raise → 500 (lỗi hệ thống thật).
    get stacked diagnostics v_constraint = constraint_name;
    if v_constraint <> 'uq_asset_serial_per_type' then raise; end if;
    select asset_code into v_existing from public.assets
      where asset_type_id = p_asset_type_id and serial = v_serial and lifecycle_status <> 'CANCELLED'
      limit 1;
    raise exception 'DUPLICATE_RECORD:%', coalesce(v_existing, '');
  end;

  begin
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata, request_id, ip_address, user_agent
    ) values (
      'asset.asset.created', p_actor_id, nullif(p_actor_label, ''), 'Asset', v_asset.id,
      'LOCATION', p_primary_location_id, null,
      jsonb_build_object(
        'name', jsonb_build_object('before', null, 'after', v_asset.name),
        'asset_type_id', jsonb_build_object('before', null, 'after', v_asset.asset_type_id),
        'serial', jsonb_build_object('before', null, 'after', v_asset.serial),
        'primary_location_id', jsonb_build_object('before', null, 'after', v_asset.primary_location_id),
        'cost_center_id', jsonb_build_object('before', null, 'after', v_asset.cost_center_id),
        'responsible_user_id', jsonb_build_object('before', null, 'after', v_asset.responsible_user_id),
        'lifecycle_status', jsonb_build_object('before', null, 'after', v_asset.lifecycle_status)
      ),
      jsonb_build_object('asset_code', v_asset.asset_code, 'qr_generated', true),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  v_result := jsonb_build_object(
    'id', v_asset.id, 'asset_code', v_asset.asset_code, 'name', v_asset.name,
    'asset_type_id', v_asset.asset_type_id, 'serial', v_asset.serial,
    'primary_location_id', v_asset.primary_location_id, 'cost_center_id', v_asset.cost_center_id,
    'responsible_user_id', v_asset.responsible_user_id, 'lifecycle_status', v_asset.lifecycle_status,
    'physical_condition', v_asset.physical_condition, 'qr_token', v_asset.qr_token,
    'profile_version', v_asset.profile_version, 'created_at', v_asset.created_at, 'is_replay', false);

  update public.asset_command_receipts set result_row = v_result, completed_at = now()
    where command_key = p_command_key;
  return v_result;
end $$;

revoke all on table public.assets from public, anon, authenticated;
grant all on table public.assets to service_role;
revoke all on table public.asset_command_receipts from public, anon, authenticated;
grant all on table public.asset_command_receipts to service_role;
revoke all on function public.create_asset(
  uuid,text,uuid,text,text,date,uuid,text,uuid,uuid,text,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.create_asset(
  uuid,text,uuid,text,text,date,uuid,text,uuid,uuid,text,uuid,text,text,inet,text
) to service_role;

-- ⚠️ Sequence: Supabase cấp sẵn ALL cho anon/authenticated theo mặc định. PostgREST không phơi
-- nextval() nhưng vẫn siết cho đúng kỷ luật (chỉ service_role dùng, qua RPC).
revoke all on sequence public.asset_code_seq from public, anon, authenticated;
grant usage on sequence public.asset_code_seq to service_role;

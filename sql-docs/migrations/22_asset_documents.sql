-- =============================================================================
-- 22 — Đính kèm chứng từ tài sản (M03, UC-AST-06). Chạy sau 21.
-- Kho tệp RIÊNG TƯ + bảng gắn chứng từ + RPC gắn nguyên tử. Không sửa migration 01–21.
-- =============================================================================

-- (a) Bucket riêng tư cho chứng từ. Không public → chỉ truy cập qua signed URL / service_role.
--     Idempotent. (RLS của storage.objects mặc định bật; không tạo policy = deny-by-default cho
--     anon/authenticated; backend dùng service_role + signed URL.)
insert into storage.buckets (id, name, public)
values ('asset-documents', 'asset-documents', false)
on conflict (id) do nothing;

-- (b) Bảng gắn chứng từ vào hồ sơ tài sản. Không xoá cứng (TBD-3).
create table if not exists public.asset_documents (
  id            uuid primary key default gen_random_uuid(),
  asset_id      uuid not null references public.assets(id),
  doc_type      text not null
                  check (doc_type in ('INVOICE', 'PO', 'HANDOVER', 'WARRANTY', 'PHOTO')),
  file_name     text not null check (length(btrim(file_name)) >= 1),
  storage_path  text not null unique,
  content_type  text not null,
  size_bytes    bigint not null check (size_bytes >= 0),
  uploaded_by   uuid not null references public.user_profiles(id),
  uploaded_at   timestamptz not null default now(),
  created_at    timestamptz not null default now()
);
create index if not exists idx_asset_documents_asset
  on public.asset_documents (asset_id, uploaded_at);
alter table public.asset_documents enable row level security;

-- (c) RPC gắn chứng từ: insert dòng + audit nguyên tử. Idempotent theo storage_path (retry không
--     tạo bản ghi/audit lần hai). KHÔNG ghi signed URL vào audit (BR-AUD-02).
create or replace function public.attach_asset_document(
  p_asset_id uuid,
  p_doc_type text,
  p_file_name text,
  p_storage_path text,
  p_content_type text,
  p_size_bytes bigint,
  p_actor_id uuid,
  p_actor_label text,
  p_request_id text,
  p_ip inet,
  p_user_agent text
) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  v_asset public.assets;
  v_doc public.asset_documents;
begin
  if p_doc_type not in ('INVOICE', 'PO', 'HANDOVER', 'WARRANTY', 'PHOTO') then
    raise exception 'DOCUMENT_TYPE_INVALID';
  end if;
  select * into v_asset from public.assets where id = p_asset_id for share;
  if not found then raise exception 'ASSET_NOT_FOUND'; end if;
  -- EX.6: hồ sơ kết thúc chỉ còn xem.
  if v_asset.lifecycle_status in ('DISPOSED', 'LOST', 'CANCELLED') then
    raise exception 'ASSET_READ_ONLY';
  end if;

  insert into public.asset_documents(
    asset_id, doc_type, file_name, storage_path, content_type, size_bytes, uploaded_by)
    values (p_asset_id, p_doc_type, p_file_name, p_storage_path, p_content_type,
            p_size_bytes, p_actor_id)
    on conflict (storage_path) do nothing
    returning * into v_doc;
  if not found then
    -- Retry cùng tệp → trả dòng cũ, không ghi audit lần hai.
    select * into v_doc from public.asset_documents where storage_path = p_storage_path;
    return jsonb_build_object('id', v_doc.id, 'doc_type', v_doc.doc_type,
      'file_name', v_doc.file_name, 'uploaded_at', v_doc.uploaded_at, 'is_replay', true);
  end if;

  begin
    insert into public.audit_events(
      event_code, actor_id, actor_label, subject_type, subject_id,
      context_type, context_id, reason, changes, metadata,
      request_id, ip_address, user_agent
    ) values (
      'asset.document.attached', p_actor_id, nullif(p_actor_label, ''),
      'Asset', p_asset_id, 'LOCATION', v_asset.primary_location_id, null,
      jsonb_build_object('document', jsonb_build_object('before', null, 'after', p_doc_type)),
      jsonb_build_object('asset_code', v_asset.asset_code, 'document_id', v_doc.id,
        'doc_type', p_doc_type, 'file_name', p_file_name),
      nullif(p_request_id, ''), p_ip, nullif(p_user_agent, '')
    );
  exception when others then
    raise exception 'AUDIT_WRITE_FAILED' using detail = sqlerrm;
  end;

  return jsonb_build_object('id', v_doc.id, 'doc_type', v_doc.doc_type,
    'file_name', v_doc.file_name, 'uploaded_at', v_doc.uploaded_at, 'is_replay', false);
end $$;

revoke all on function public.attach_asset_document(
  uuid,text,text,text,text,bigint,uuid,text,text,inet,text
) from public, anon, authenticated;
grant execute on function public.attach_asset_document(
  uuid,text,text,text,text,bigint,uuid,text,text,inet,text
) to service_role;

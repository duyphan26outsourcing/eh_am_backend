-- =============================================================================
-- EVERY HALF · ASSET MANAGEMENT — MIGRATION 01: NGƯỜI DÙNG, PHÂN QUYỀN, AUDIT
-- =============================================================================
--
-- Đây là tầng nền. Mọi module nghiệp vụ (danh mục nền, tài sản, QR & kiểm kê, điều
-- chuyển, bảo trì, thanh lý, khấu hao, đồng bộ FAST) đều dựa vào các bảng ở đây, nên
-- migration này phải chạy trước.
--
-- Nguồn yêu cầu (brief gốc của Every Half):
--   · "Không bao giờ xóa lịch sử. Mọi thay đổi phải lưu: Ai – Khi nào – Thay đổi gì –
--      Trước/Sau – Lý do."                                       → §3, §6, §7
--   · "Phân quyền chặt chẽ: Phân quyền theo vai trò và theo location." → §2
--
-- Chạy: dán toàn bộ file vào Supabase → SQL Editor → Run. File idempotent (`if not
-- exists`, `create or replace`), chạy lại không hỏng dữ liệu đã có.
--
-- =============================================================================
-- ⚠️ QUYẾT ĐỊNH KIẾN TRÚC: BIÊN BẢO MẬT LÀ PHẠM VI LOCATION, KHÔNG PHẢI RLS
-- =============================================================================
--
-- Every Half là MỘT doanh nghiệp (không đa tenant). Dữ liệu được chia theo location:
-- cửa hàng, kho, xưởng rang, văn phòng. Một người thấy/thao tác được gì phụ thuộc vai
-- trò của họ trên từng location (bảng `context_role_assignments`, §2).
--
-- ⚠️ HỆ QUẢ PHẢI NHỚ: backend dùng `service_role` key nên RLS không chặn nó. Mọi truy
-- vấn đọc dữ liệu theo location PHẢI tự lọc theo phạm vi của người gọi
-- (`AccessScopeService` + `applyLocationScope()` ở backend). Thiếu một điều kiện là nhân
-- viên cửa hàng này thấy tài sản cửa hàng khác — và Postgres trả 200 OK.
--
-- RLS vẫn BẬT trên mọi bảng (§8) như lớp phòng tuyến cho anon key: frontend không bao
-- giờ nói chuyện trực tiếp với Supabase, nên mặc định nó không đọc được gì.
-- =============================================================================

-- Cần cho gen_random_uuid()
create extension if not exists "pgcrypto";
-- Cần cho unaccent() dùng ở tìm kiếm tiếng Việt (module sau dùng, khai sẵn ở đây)
create extension if not exists "unaccent";


-- =============================================================================
-- 1. USER_PROFILES — hồ sơ người dùng Every Half (1-1 với auth.users)
-- =============================================================================
--
-- `id` = `auth.users.id` của Supabase Auth. Bảng này KHÔNG chứa mật khẩu, email hay
-- session — những thứ đó thuộc `auth.users` và do Supabase quản lý.
--
-- ⚠️ VÌ SAO CẦN BẢNG NÀY DÙ ĐÃ CÓ `auth.users`
--
-- `auth.users.raw_app_meta_data` là JSONB tự do. Đặt `status` hay mã nhân viên vào đó
-- nghĩa là: không có kiểu, không có ràng buộc, không index được, không join được. Guard
-- của backend (`JwtAuthGuard`) đọc bảng này làm nguồn chuẩn trên MỖI request, không đọc
-- metadata trong JWT — nên khoá một tài khoản có tác dụng ngay, không đợi token hết hạn.
create table if not exists public.user_profiles (
  id                  uuid primary key
                        references auth.users (id) on delete cascade,

  -- Mã nhân viên do Every Half cấp (khớp hệ thống nhân sự). Tuỳ chọn: nhân viên mới có
  -- thể chưa có mã.
  --
  -- ⚠️ CHECK buộc giá trị đã chuẩn hoá (in hoa, không khoảng trắng hai đầu) — backend
  -- chuẩn hoá bằng `normalizeEmployeeCode()`. Không có CHECK thì `eh0123` và `EH0123`
  -- lọt qua ràng buộc UNIQUE thành hai người khác nhau.
  employee_code       text
                        check (employee_code is null
                               or (employee_code = upper(btrim(employee_code))
                                   and length(employee_code) between 2 and 30)),

  -- Họ tên — giữ nguyên dấu tiếng Việt. Hiện trên biên bản bàn giao và lịch sử tài sản.
  display_name        text not null check (length(btrim(display_name)) >= 2),
  phone               text,
  job_title           text,

  -- Ngôn ngữ HIỂN THỊ mà người này chọn. Backend dùng nó để dịch thông báo.
  --
  -- ⚠️ CHECK giới hạn đúng các giá trị mà `SUPPORTED_LOCALES` trong code khai. Thêm ngôn
  -- ngữ mới phải sửa CẢ hai chỗ (và cả frontend).
  preferred_locale    text not null default 'vi'
                        check (preferred_locale in ('vi', 'en')),

  -- ACTIVE: dùng được · SUSPENDED: tạm khoá · DEACTIVATED: nghỉ việc.
  --
  -- ⚠️ Nhân viên nghỉ việc → DEACTIVATED, KHÔNG xoá hồ sơ: tên họ vẫn phải đọc được trên
  -- lịch sử tài sản, biên bản kiểm kê và phiếu điều chuyển đã ký.
  status              text not null default 'ACTIVE'
                        check (status in ('ACTIVE', 'SUSPENDED', 'DEACTIVATED')),

  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  -- Người tạo hồ sơ (quản trị tạo hộ). NULL khi người dùng tự đăng ký.
  created_by          uuid references public.user_profiles (id) on delete set null
);

create unique index if not exists uq_user_profiles_employee_code
  on public.user_profiles (employee_code)
  where employee_code is not null;
create index if not exists idx_user_profiles_status
  on public.user_profiles (status);


-- =============================================================================
-- 2. CONTEXT_ROLE_ASSIGNMENTS — phân quyền theo vai trò × phạm vi
-- =============================================================================
--
-- Một vai trò luôn gắn với MỘT phạm vi cụ thể:
--   · `PLATFORM` + UUID nil  → toàn hệ thống (ví dụ quản lý tài sản trung tâm)
--   · `LOCATION` + id        → một cửa hàng / kho / xưởng rang / văn phòng
--
-- ⚠️ `role_code` là TEXT ở tầng database — không có bảng danh mục nào ràng buộc nó.
-- Danh mục canonical nằm trong code (`src/utils/enums/role.enum.ts`): mã vai trò là khoá
-- bảo mật, phải bất biến và review được qua git, không phải dữ liệu ai cũng thêm được
-- bằng một câu INSERT.
--
-- ⚠️ `context_id` KHÔNG có khoá ngoại tới bảng location: bảng đó thuộc module danh mục
-- nền (chưa có), và một dòng phân quyền là SỰ KIỆN LỊCH SỬ ("người này đã là quản lý cửa
-- hàng X từ ngày A tới ngày B") — nó phải còn đúng kể cả khi location đó ngừng hoạt động.
--
-- ⚠️ "KHÔNG BAO GIỜ XOÁ LỊCH SỬ": dòng phân quyền không bị xoá và không bị sửa. Thu hồi
-- = ĐÓNG HIỆU LỰC (`effective_to`, `revoked_by`, `revoke_reason`) đúng một lần — xem
-- trigger ở §7. Nhờ vậy câu hỏi "ai là cửa hàng trưởng Q1 vào ngày kiểm kê 30/11" luôn có
-- câu trả lời.
create table if not exists public.context_role_assignments (
  id                  uuid primary key default gen_random_uuid(),

  -- Every Half chỉ có `USER`. Cột được giữ để mở rộng (nhóm/phòng ban) bằng cách nới
  -- CHECK, không phải đổi cấu trúc bảng. Backend luôn lọc theo CẢ `subject_type` VÀ
  -- `subject_id`.
  subject_type        text not null default 'USER' check (subject_type in ('USER')),
  subject_id          uuid not null,

  context_type        text not null check (context_type in ('PLATFORM', 'LOCATION')),
  -- Với PLATFORM thì bằng UUID nil (xem role.enum.ts — vì sao không dùng NULL).
  context_id          uuid not null,

  role_code           text not null,

  effective_from      timestamptz not null default now(),
  -- NULL = còn hiệu lực. Có thể đặt sẵn khi cấp (phân công tạm thời có thời hạn).
  effective_to        timestamptz,

  -- ⚠️ `granted_by` / `revoked_by` CỐ Ý KHÔNG CÓ KHOÁ NGOẠI.
  --
  -- Bảng này bị trigger chặn sửa (§7). Một khoá ngoại `on delete set null` sẽ làm việc xoá
  -- tài khoản người cấp quyền kích hoạt một câu UPDATE → bị trigger chặn → xoá tài khoản
  -- thất bại. Đó đúng là lỗi codebase gốc (Avantily) đã phải vá bằng một migration riêng.
  -- Ở đây chúng là sự kiện lịch sử; truy vấn sang `user_profiles` dùng LEFT JOIN.
  granted_by          uuid,
  grant_reason        text,
  revoked_by          uuid,
  revoke_reason       text,

  created_at          timestamptz not null default now(),

  constraint ck_cra_effective_window
    check (effective_to is null or effective_to >= effective_from),
  constraint ck_cra_revoked_has_end
    check (revoked_by is null or effective_to is not null),
  -- Vai trò PLATFORM chỉ được gắn với UUID nil — chặn dữ liệu "nửa nọ nửa kia".
  constraint ck_cra_platform_context
    check (context_type <> 'PLATFORM'
           or context_id = '00000000-0000-0000-0000-000000000000')
);

-- Chống cấp trùng một vai trò đang hiệu lực (không đặt thời hạn) trên cùng phạm vi.
create unique index if not exists uq_context_role_active
  on public.context_role_assignments
     (subject_type, subject_id, context_type, context_id, role_code)
  where effective_to is null;
create index if not exists idx_context_role_lookup
  on public.context_role_assignments
     (subject_type, subject_id, context_type, context_id);
-- "Ai đang có vai trò ở location X" — dùng khi hiển thị người chịu trách nhiệm một điểm.
create index if not exists idx_context_role_by_context
  on public.context_role_assignments (context_type, context_id, role_code);


-- =============================================================================
-- 3. AUDIT_EVENTS — nhật ký hành động, CHỈ GHI THÊM
-- =============================================================================
--
-- Hiện thực nguyên tắc số 1 của brief, từng cột một:
--
--   AI           → actor_id + actor_label (bản chụp tên lúc hành động)
--   KHI NÀO      → created_at (đồng hồ server, KHÔNG nhận từ client)
--   THAY ĐỔI GÌ  → event_code + subject_type/subject_id (+ context_type/context_id)
--   TRƯỚC/SAU    → changes  { "field": { "from": …, "to": … } }
--   LÝ DO        → reason   (do người dùng nhập, không do hệ thống bịa)
--
-- Danh mục mã sự kiện nằm ở `src/utils/enums/audit-event.enum.ts` — không dùng chuỗi rời
-- rạc ở từng service.
create table if not exists public.audit_events (
  id                  bigserial primary key,

  -- Mã canonical, ví dụ 'auth.session.login_succeeded'.
  event_code          text not null,

  -- ⚠️ CỐ Ý KHÔNG CÓ KHOÁ NGOẠI — xem chú thích ở §2 và COMMENT bên dưới.
  actor_id            uuid,
  -- "Nguyễn Văn A (EH0123)" tại thời điểm hành động. Hồ sơ có thể đổi tên hoặc bị xoá;
  -- dòng audit vẫn phải trả lời được "ai".
  actor_label         text,

  -- Đối tượng bị tác động. `subject_type` là tên domain entity, không phải tên bảng.
  subject_type        text,
  subject_id          uuid,

  -- Phạm vi xảy ra hành động — thường là LOCATION + id của cửa hàng/kho.
  context_type        text,
  context_id          uuid,

  -- Lý do do người dùng nhập.
  reason              text,

  -- Trước/Sau theo từng trường. Backend dựng bằng `diffFields()` với danh sách trường cho
  -- phép — không bao giờ đổ nguyên object vào đây.
  changes             jsonb check (changes is null or jsonb_typeof(changes) = 'object'),

  -- Dữ liệu bổ sung. KHÔNG được chứa dữ liệu nhạy cảm hay bí mật — audit log lưu lâu hơn
  -- mọi bảng khác và không xoá được, nên nó là chỗ tệ nhất để rò rỉ.
  metadata            jsonb not null default '{}'::jsonb
                        check (jsonb_typeof(metadata) = 'object'),

  -- Mã tương quan của request — nối dòng audit với dòng log HTTP tương ứng.
  request_id          text,
  ip_address          inet,
  user_agent          text,

  created_at          timestamptz not null default now()
);

create index if not exists idx_audit_events_actor
  on public.audit_events (actor_id, created_at desc);
create index if not exists idx_audit_events_subject
  on public.audit_events (subject_type, subject_id, created_at desc);
create index if not exists idx_audit_events_context
  on public.audit_events (context_type, context_id, created_at desc);
create index if not exists idx_audit_events_code
  on public.audit_events (event_code, created_at desc);

comment on column public.audit_events.actor_id is
  'auth.users.id / user_profiles.id của người thực hiện, ghi lại như một SỰ KIỆN LỊCH SỬ. '
  'CỐ Ý KHÔNG CÓ KHOÁ NGOẠI: bảng này chỉ-ghi-thêm nên `on delete set null` sẽ bị trigger '
  'tg_append_only chặn, làm không xoá được tài khoản nào. Truy vấn sang user_profiles phải '
  'dùng LEFT JOIN — hồ sơ có thể đã bị xoá; khi đó đọc actor_label.';
comment on column public.audit_events.changes is
  'Trước/Sau theo từng trường: {"field": {"from": ..., "to": ...}}. Dựng bằng diffFields() '
  'với allow-list trường — không đổ nguyên bản ghi.';
comment on column public.audit_events.reason is
  'Lý do do NGƯỜI DÙNG nhập cho thay đổi. Không được điền lý do do hệ thống tự bịa.';


-- =============================================================================
-- 4. TRIGGER — `updated_at` tự cập nhật
-- =============================================================================
--
-- Để ở database chứ không ở tầng ứng dụng: một lệnh UPDATE viết tay lúc vận hành,
-- hay một service tương lai quên set, đều vẫn phải đúng.
create or replace function public.tg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute function public.tg_set_updated_at();


-- =============================================================================
-- 5. TRIGGER — chặn UPDATE/DELETE trên bảng chỉ-ghi-thêm
-- =============================================================================
--
-- ⚠️ Không dựa vào "quy ước là không ai sửa". Service role bỏ qua RLS, và một câu
-- UPDATE gõ tay trong SQL Editor lúc 2 giờ sáng là đủ để một nhật ký mất toàn bộ giá trị
-- đối chiếu. Trigger thì không bỏ qua được.
--
-- Hàm dùng chung: các bảng nhật ký của module sau (lịch sử tài sản, lượt quét kiểm kê,
-- nhật ký đồng bộ FAST…) gắn cùng trigger này.
create or replace function public.tg_append_only()
returns trigger
language plpgsql
as $$
begin
  raise exception
    'APPEND_ONLY_TABLE: bảng %.% chỉ cho phép INSERT. Hành động % bị chặn.',
    tg_table_schema, tg_table_name, tg_op;
end;
$$;

drop trigger if exists trg_audit_events_append_only on public.audit_events;
create trigger trg_audit_events_append_only
  before update or delete on public.audit_events
  for each row execute function public.tg_append_only();


-- =============================================================================
-- 6. ⚠️ BÀI HỌC TỪ CODEBASE GỐC: KHÔNG CÓ KHOÁ NGOẠI `on delete` TRÊN BẢNG LỊCH SỬ
-- =============================================================================
--
-- Codebase gốc (Avantily) khai `audit_events.actor_id references member_profiles(id)
-- on delete set null` rồi gắn trigger append-only lên cùng bảng. Hai điều đó xung đột:
--
--     DELETE auth.users → cascade DELETE hồ sơ → FK thực hiện UPDATE audit_events
--       → tg_append_only CHẶN → toàn bộ lệnh xoá tài khoản THẤT BẠI
--
-- Hệ quả đo được: không xoá được tài khoản nào đã từng có một dòng audit (tức mọi tài
-- khoản), và dọn tài khoản test thất bại im lặng. Họ phải vá bằng migration 02.
--
-- Ở đây: `audit_events.actor_id`, `context_role_assignments.granted_by/revoked_by` không
-- có khoá ngoại ngay từ đầu. ⚠️ Mọi bảng lịch sử thêm sau này tuân theo cùng quy tắc.


-- =============================================================================
-- 7. TRIGGER — `context_role_assignments` chỉ được ĐÓNG HIỆU LỰC, một lần
-- =============================================================================
--
-- Quy tắc:
--   · DELETE: cấm.
--   · UPDATE: chỉ được đặt `effective_to` + `revoked_by` + `revoke_reason` (có nội dung),
--     chỉ khi dòng chưa bị thu hồi, và chỉ được RÚT NGẮN hiệu lực (không kéo dài).
--     Mọi cột khác giữ nguyên.
--
-- ⚠️ VÌ SAO KHÔNG CHO KÉO DÀI: gia hạn một phân công tạm thời bằng cách sửa `effective_to`
-- làm mất dấu vết "ai gia hạn, khi nào, vì sao". Gia hạn = cấp một dòng mới có lý do.
create or replace function public.tg_role_assignment_close_only()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'DELETE' then
    raise exception
      'HISTORY_IMMUTABLE: không được xoá dòng phân quyền % — chỉ được đóng hiệu lực.', old.id;
  end if;

  if old.revoked_by is not null then
    raise exception
      'HISTORY_IMMUTABLE: dòng phân quyền % đã bị thu hồi, không sửa được nữa.', old.id;
  end if;

  if new.id             is distinct from old.id
     or new.subject_type   is distinct from old.subject_type
     or new.subject_id     is distinct from old.subject_id
     or new.context_type   is distinct from old.context_type
     or new.context_id     is distinct from old.context_id
     or new.role_code      is distinct from old.role_code
     or new.effective_from is distinct from old.effective_from
     or new.granted_by     is distinct from old.granted_by
     or new.grant_reason   is distinct from old.grant_reason
     or new.created_at     is distinct from old.created_at then
    raise exception
      'HISTORY_IMMUTABLE: chỉ được đóng hiệu lực (effective_to, revoked_by, revoke_reason) của dòng %.', old.id;
  end if;

  if new.effective_to is null
     or new.revoked_by is null
     or coalesce(btrim(new.revoke_reason), '') = '' then
    raise exception
      'HISTORY_IMMUTABLE: thu hồi phải có đủ effective_to, revoked_by và revoke_reason (dòng %).', old.id;
  end if;

  if old.effective_to is not null and new.effective_to > old.effective_to then
    raise exception
      'HISTORY_IMMUTABLE: không được kéo dài hiệu lực của dòng % — hãy cấp một dòng mới.', old.id;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_context_role_assignments_close_only
  on public.context_role_assignments;
create trigger trg_context_role_assignments_close_only
  before update or delete on public.context_role_assignments
  for each row execute function public.tg_role_assignment_close_only();


-- =============================================================================
-- 8. ROW LEVEL SECURITY
-- =============================================================================
--
-- Bật RLS và KHÔNG tạo policy nào = deny-by-default cho mọi client dùng anon key.
--
-- ⚠️ Backend dùng service_role key nên nó bỏ qua RLS hoàn toàn — quyền được quyết định
-- ở tầng guard của NestJS. RLS ở đây là lớp phòng tuyến cho trường hợp anon key gọi trực
-- tiếp Supabase: mặc định không đọc được gì.
alter table public.user_profiles             enable row level security;
alter table public.context_role_assignments  enable row level security;
alter table public.audit_events              enable row level security;

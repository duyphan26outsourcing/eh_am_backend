/**
 * Seed dữ liệu M03 trực tiếp qua các RPC nghiệp vụ có audit.
 * Dùng SUPABASE_URL + SUPABASE_SECRET_KEY từ .env; không cần/hardcode mật khẩu.
 * Idempotent theo mã loại và serial seed, không xoá dữ liệu.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) {
  console.error('Thiếu SUPABASE_URL hoặc SUPABASE_SECRET_KEY trong .env.');
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });
const now = new Date().toISOString();

function fail(message, error) {
  console.error(`✗ ${message}${error ? `: ${error.message ?? error}` : ''}`);
  process.exit(1);
}

async function activeAssignments() {
  const { data, error } = await db
    .from('context_role_assignments')
    .select('subject_id,role_code,context_type,context_id')
    .lte('effective_from', now)
    .or(`effective_to.is.null,effective_to.gt."${now}"`);
  if (error) fail('Không đọc được vai trò hiệu lực', error);
  return data ?? [];
}

async function ensureAssetTypes(actor) {
  const { data: existing, error } = await db
    .from('asset_types')
    .select('id,code,name,asset_kind,serial_required,parent_id')
    .in('code', ['SEED_EQUIPMENT', 'SEED_TOOLS', 'SEED_COFFEE_MACHINE', 'SEED_LAPTOP', 'SEED_BAR_TOOL']);
  if (error) fail('Không đọc được loại tài sản', error);
  const byCode = new Map((existing ?? []).map((row) => [row.code, row]));

  for (const group of [
    { code: 'SEED_EQUIPMENT', name: 'Thiết bị vận hành (dữ liệu mẫu)' },
    { code: 'SEED_TOOLS', name: 'Công cụ dụng cụ (dữ liệu mẫu)' },
  ]) {
    if (byCode.has(group.code)) continue;
    const { data, error: rpcError } = await db.rpc('create_asset_type_group', {
      p_code: group.code,
      p_name: group.name,
      p_actor_id: actor.id,
      p_actor_label: actor.display_name,
      p_changes: { code: { before: null, after: group.code }, name: { before: null, after: group.name } },
      p_reason: 'Tạo dữ liệu mẫu phục vụ kiểm thử M03',
      p_request_id: `seed-m03-${randomUUID()}`,
      p_ip: null,
      p_user_agent: 'tools/seed-m03-assets.mjs',
    });
    if (rpcError) fail(`Không tạo được nhóm ${group.code}`, rpcError);
    byCode.set(group.code, data);
    console.log(`✓ Tạo nhóm ${group.code}`);
  }

  const leaves = [
    { parent: 'SEED_EQUIPMENT', code: 'SEED_COFFEE_MACHINE', name: 'Máy pha cà phê', kind: 'FIXED_ASSET', serial: true, life: 60 },
    { parent: 'SEED_EQUIPMENT', code: 'SEED_LAPTOP', name: 'Máy tính xách tay', kind: 'FIXED_ASSET', serial: true, life: 36 },
    { parent: 'SEED_TOOLS', code: 'SEED_BAR_TOOL', name: 'Bộ dụng cụ quầy bar', kind: 'TOOL', serial: false, life: 24 },
  ];
  for (const leaf of leaves) {
    if (byCode.has(leaf.code)) continue;
    const { data, error: rpcError } = await db.rpc('create_asset_type', {
      p_parent_id: byCode.get(leaf.parent).id,
      p_code: leaf.code,
      p_name: leaf.name,
      p_asset_kind: leaf.kind,
      p_serial_required: leaf.serial,
      p_useful_life_months: leaf.life,
      p_fast_group_code: '',
      p_actor_id: actor.id,
      p_actor_label: actor.display_name,
      p_changes: { code: { before: null, after: leaf.code }, name: { before: null, after: leaf.name }, asset_kind: { before: null, after: leaf.kind } },
      p_reason: 'Tạo dữ liệu mẫu phục vụ kiểm thử M03',
      p_request_id: `seed-m03-${randomUUID()}`,
      p_ip: null,
      p_user_agent: 'tools/seed-m03-assets.mjs',
    });
    if (rpcError) fail(`Không tạo được loại ${leaf.code}`, rpcError);
    byCode.set(leaf.code, data);
    console.log(`✓ Tạo loại ${leaf.code}`);
  }
  return leaves.map((leaf) => byCode.get(leaf.code)).sort((a, b) => a.code.localeCompare(b.code));
}

// ⚠️ UC-AST-03/05 bắt buộc một lý do nhóm PROFILE_EDIT ACTIVE. Seed hệ thống chỉ có mục 'Khác'
// (is_freetext=true), nên dialog bàn giao/sửa hồ sơ không có preset có nghĩa. Thêm vài lý do
// non-freetext để manual test và để smoke dùng nhánh không cần ghi chú. Idempotent theo (nhóm, mã).
async function ensureReasonCodes(actor) {
  // PROFILE_EDIT: UC-AST-03/05. USE_STATUS_CHANGE (có sẵn từ 02g): UC-AST-11.
  const wanted = [
    { group: 'PROFILE_EDIT', code: 'HANDOVER_RESIGNATION', label: 'Nhân sự nghỉ việc hoặc chuyển công tác' },
    { group: 'PROFILE_EDIT', code: 'HANDOVER_REASSIGN', label: 'Điều chỉnh phân công quản lý tài sản' },
    { group: 'PROFILE_EDIT', code: 'PROFILE_CORRECTION', label: 'Sửa thông tin hồ sơ bị sai sót' },
    { group: 'USE_STATUS_CHANGE', code: 'PUT_INTO_USE', label: 'Đưa tài sản ra sử dụng' },
    { group: 'USE_STATUS_CHANGE', code: 'RETURN_TO_STORAGE', label: 'Cất tài sản về kho' },
    { group: 'ASSET_CANCEL', code: 'DUPLICATE_RECORD', label: 'Hồ sơ trùng lặp' },
    { group: 'ASSET_CANCEL', code: 'WRONG_ENTRY', label: 'Nhập sai thông tin' },
  ];
  const groups = [...new Set(wanted.map((item) => item.group))];
  const { data: existing, error } = await db
    .from('reason_codes')
    .select('reason_group,code')
    .in('reason_group', groups)
    .in('code', wanted.map((item) => item.code));
  if (error) fail('Không đọc được danh mục lý do', error);
  const have = new Set((existing ?? []).map((row) => `${row.reason_group}:${row.code}`));
  for (const item of wanted) {
    if (have.has(`${item.group}:${item.code}`)) continue;
    const { error: rpcError } = await db.rpc('create_reason_code', {
      p_reason_group: item.group,
      p_code: item.code,
      p_label: item.label,
      p_actor_id: actor.id,
      p_actor_label: actor.display_name,
      p_changes: {
        code: { before: null, after: item.code },
        label: { before: null, after: item.label },
      },
      p_reason: 'Seed lý do phục vụ kiểm thử M03',
      p_request_id: `seed-m03-${randomUUID()}`,
      p_ip: null,
      p_user_agent: 'tools/seed-m03-assets.mjs',
    });
    // Trùng (nhóm, mã) → 23505/DUPLICATE_RECORD: coi như đã seed, không phải lỗi.
    if (rpcError && !/23505|duplicate|DUPLICATE_RECORD/i.test(rpcError.message ?? '')) {
      fail(`Không tạo được lý do ${item.group}/${item.code}`, rpcError);
    }
    console.log(`✓ Lý do ${item.group} ${item.code}`);
  }
}

// UC-AST-06: gắn một chứng từ mẫu (HANDOVER, không phải tài chính nên mọi vai trò xem được) vào tài
// sản seed đầu tiên để manual test danh sách chứng từ + nút Xem. Idempotent theo storage_path.
async function ensureSampleDocument(actor) {
  const { data: assets } = await db
    .from('assets')
    .select('id,asset_code')
    .eq('serial', 'SMOKE-M03-001')
    .limit(1);
  const asset = assets?.[0];
  if (!asset) return;
  const path = `assets/${asset.id}/seed-handover.pdf`;
  const { data: existing } = await db
    .from('asset_documents')
    .select('id')
    .eq('storage_path', path)
    .maybeSingle();
  if (existing) {
    console.log(`• Chứng từ mẫu đã có trên ${asset.asset_code}`);
    return;
  }
  const bytes = Buffer.from('%PDF-1.4\n% EH-AM seed sample document\n', 'utf8');
  const up = await db.storage
    .from('asset-documents')
    .upload(path, bytes, { contentType: 'application/pdf', upsert: true });
  if (up.error) {
    console.warn(`• Không upload được chứng từ mẫu: ${up.error.message}`);
    return;
  }
  const { error } = await db.rpc('attach_asset_document', {
    p_asset_id: asset.id,
    p_doc_type: 'HANDOVER',
    p_file_name: 'bien-ban-ban-giao-mau.pdf',
    p_storage_path: path,
    p_content_type: 'application/pdf',
    p_size_bytes: bytes.length,
    p_actor_id: actor.id,
    p_actor_label: actor.display_name,
    p_request_id: `seed-m03-${randomUUID()}`,
    p_ip: null,
    p_user_agent: 'tools/seed-m03-assets.mjs',
  });
  if (error && !/duplicate|23505/i.test(error.message ?? '')) {
    console.warn(`• Không gắn được chứng từ mẫu: ${error.message}`);
    return;
  }
  console.log(`✓ Chứng từ mẫu (HANDOVER) gắn vào ${asset.asset_code}`);
}

async function main() {
  const [{ data: profiles, error: profileError }, assignments] = await Promise.all([
    db.from('user_profiles').select('id,display_name,status').eq('status', 'ACTIVE').order('created_at'),
    activeAssignments(),
  ]);
  if (profileError) fail('Không đọc được hồ sơ người dùng', profileError);
  if (!profiles?.length) fail('Chưa có người dùng ACTIVE để ghi actor audit.');
  const actor =
    profiles.find((person) =>
      assignments.some((role) => role.subject_id === person.id && role.role_code === 'ASSET_MANAGER'),
    ) ?? profiles[0];
  const assetTypes = await ensureAssetTypes(actor);
  await ensureReasonCodes(actor);

  const { data: locations, error: locationError } = await db
    .from('locations')
    .select('id,code,name,default_cost_center_id,type')
    .eq('status', 'ACTIVE')
    .neq('type', 'EXTERNAL')
    .not('default_cost_center_id', 'is', null)
    .order('code');
  if (locationError) fail('Không đọc được location', locationError);
  if (!locations?.length) fail('Chưa có location nội bộ ACTIVE với cost center mặc định.');

  const platformManagers = new Set(
    assignments
      .filter((role) => role.context_type === 'PLATFORM' && role.role_code === 'ASSET_MANAGER')
      .map((role) => role.subject_id),
  );
  const responsibleFor = (locationId) =>
    profiles.find((person) =>
      platformManagers.has(person.id) ||
      assignments.some(
        (role) =>
          role.subject_id === person.id &&
          role.context_type === 'LOCATION' &&
          role.context_id === locationId &&
          ['LOCATION_MANAGER', 'LOCATION_STAFF'].includes(role.role_code),
      ),
    );

  const eligibleLocations = locations.filter((location) => responsibleFor(location.id));
  if (eligibleLocations.length === 0) {
    fail('Chưa có location nội bộ nào có người ACTIVE đủ vai trò nhận tài sản.');
  }

  let created = 0;
  let reused = 0;
  for (let index = 0; index < 3; index += 1) {
    const type = assetTypes[index % assetTypes.length];
    const location = eligibleLocations[index % eligibleLocations.length];
    const responsible = responsibleFor(location.id);
    if (!responsible) {
      console.warn(`• Bỏ qua ${location.code}: chưa có người ACTIVE đủ vai trò tại location.`);
      continue;
    }
    const serial = `SMOKE-M03-${String(index + 1).padStart(3, '0')}`;
    const { data: existing, error: findError } = await db
      .from('assets')
      .select('id,asset_code')
      .eq('asset_type_id', type.id)
      .eq('serial', serial)
      .maybeSingle();
    if (findError) fail(`Không kiểm tra được serial ${serial}`, findError);
    if (existing) {
      reused += 1;
      console.log(`• Đã có ${existing.asset_code} (${serial}), tái sử dụng`);
      continue;
    }
    const { data, error } = await db.rpc('create_asset', {
      p_command_key: randomUUID(),
      p_name: `SMOKE M03 ${String(index + 1).padStart(2, '0')} · ${type.name}`,
      p_asset_type_id: type.id,
      p_serial: serial,
      p_note: 'Dữ liệu mẫu M03; giữ lại để manual test trên /assets.',
      p_purchase_date: '2026-10-01',
      p_supplier_id: null,
      p_invoice_no: `SMOKE-HD-${String(index + 1).padStart(3, '0')}`,
      p_primary_location_id: location.id,
      p_responsible_user_id: responsible.id,
      p_lifecycle_status: index % 2 === 0 ? 'IN_USE' : 'IN_STORAGE',
      p_actor_id: actor.id,
      p_actor_label: actor.display_name,
      p_request_id: `seed-m03-${randomUUID()}`,
      p_ip: null,
      p_user_agent: 'tools/seed-m03-assets.mjs',
    });
    if (error) fail(`Không tạo được tài sản ${serial}`, error);
    created += 1;
    console.log(`✓ Tạo ${data.asset_code} · ${type.name} · ${location.name}`);
  }
  await ensureSampleDocument(actor);
  const { count } = await db.from('assets').select('*', { count: 'exact', head: true });
  console.log(`✓ Seed M03 hoàn tất: tạo ${created}, tái sử dụng ${reused}, tổng assets=${count ?? 0}.`);
}

main().catch((error) => fail('Seed M03 lỗi không mong đợi', error));

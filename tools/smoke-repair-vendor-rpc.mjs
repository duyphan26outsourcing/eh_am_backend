/**
 * Smoke DB cho UC-MDM-06 trên schema thật.
 * Chỉ đọc credential từ môi trường/.env; giữ lại dữ liệu smoke ở trạng thái INACTIVE
 * để bảo toàn audit trail, không xoá lịch sử.
 */
import 'dotenv/config';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SECRET_KEY;
if (!url || !key) throw new Error('Thiếu SUPABASE_URL/SUPABASE_SECRET_KEY');

const db = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const [
  { data: actors, error: actorError },
  { data: reasons, error: reasonError },
] = await Promise.all([
  db.from('user_profiles').select('id,display_name').limit(1),
  db
    .from('reason_codes')
    .select('id,is_freetext')
    .eq('reason_group', 'CATALOG_DEACTIVATE')
    .eq('status', 'ACTIVE')
    .limit(1),
]);
if (actorError || !actors?.[0]) throw actorError ?? new Error('Thiếu actor');
if (reasonError || !reasons?.[0]) throw reasonError ?? new Error('Thiếu lý do');

const actor = actors[0];
const reason = reasons[0];
const stamp = Date.now().toString();
const requestId = `smoke-repair-vendor-${stamp}`;
const common = {
  p_actor_id: actor.id,
  p_actor_label: actor.display_name ?? 'DB smoke',
  p_request_id: requestId,
  p_ip: '127.0.0.1',
  p_user_agent: 'tools/smoke-repair-vendor-rpc.mjs',
};

const location = await db.rpc('create_location', {
  ...common,
  p_command_key: randomUUID(),
  p_code: `SMK${stamp.slice(-7)}`,
  p_name: `SMOKE External repair ${stamp}`,
  p_type: 'EXTERNAL',
  p_province_code: '79',
  p_province_name: 'Thành phố Hồ Chí Minh',
  p_ward_name: 'Phường Sài Gòn',
  p_address_detail: 'DB smoke test',
  p_cost_center_id: null,
  p_changes: { smoke: { before: null, after: true } },
  p_reason: 'DB smoke UC-MDM-06',
});
if (location.error || !location.data) {
  throw location.error ?? new Error('Không tạo được location smoke');
}

const createKey = randomUUID();
const createArgs = {
  ...common,
  p_command_key: createKey,
  p_name: `SMOKE Repair Vendor ${stamp}`,
  p_contact_name: 'Smoke Contact',
  p_contact_phone: '0901234567',
  p_contact_email: `smoke-${stamp}@example.com`,
  p_service_types: ['REPAIR', 'WARRANTY'],
  p_external_location_id: location.data.id,
  p_changes: { smoke: { before: null, after: true } },
};
const created = await db.rpc('create_repair_vendor', createArgs);
if (created.error || !created.data)
  throw created.error ?? new Error('Create failed');
const createReplay = await db.rpc('create_repair_vendor', createArgs);
if (createReplay.error || createReplay.data?.id !== created.data.id) {
  throw createReplay.error ?? new Error('Create replay failed');
}

const duplicate = await db.rpc('create_repair_vendor', {
  ...createArgs,
  p_command_key: randomUUID(),
  p_name: `${createArgs.p_name} duplicate`,
});
if (
  !duplicate.error ||
  !duplicate.error.message.includes('EXTERNAL_LOCATION_TAKEN')
) {
  throw new Error('Location đã gắn không bị từ chối');
}

const updateKey = randomUUID();
const updateArgs = {
  ...common,
  p_command_key: updateKey,
  p_id: created.data.id,
  p_expected_version: created.data.version,
  p_name: `${created.data.name} updated`,
  p_contact_name: '',
  p_contact_phone: '',
  p_contact_email: '',
  p_service_types: ['REPAIR'],
  p_changes: {
    name: { before: created.data.name, after: `${created.data.name} updated` },
  },
};
const updated = await db.rpc('update_repair_vendor', updateArgs);
if (updated.error || !updated.data)
  throw updated.error ?? new Error('Update failed');
const updateReplay = await db.rpc('update_repair_vendor', updateArgs);
if (updateReplay.error || updateReplay.data?.version !== updated.data.version) {
  throw updateReplay.error ?? new Error('Update replay failed');
}
const stale = await db.rpc('update_repair_vendor', {
  ...updateArgs,
  p_command_key: randomUUID(),
  p_name: `${updateArgs.p_name} stale`,
});
if (!stale.error || !stale.error.message.includes('VERSION_CONFLICT')) {
  throw new Error('Stale update không bị từ chối');
}

const deactivateArgs = {
  ...common,
  p_command_key: randomUUID(),
  p_id: updated.data.id,
  p_expected_version: updated.data.version,
  p_reason_code_id: reason.id,
  p_note: reason.is_freetext ? 'DB smoke verification' : '',
  p_vendor_changes: { status: { before: 'ACTIVE', after: 'INACTIVE' } },
  p_location_changes: { status: { before: 'ACTIVE', after: 'INACTIVE' } },
};
const deactivated = await db.rpc('deactivate_repair_vendor', deactivateArgs);
if (deactivated.error || deactivated.data?.status !== 'INACTIVE') {
  throw deactivated.error ?? new Error('Deactivate failed');
}
const deactivateReplay = await db.rpc(
  'deactivate_repair_vendor',
  deactivateArgs,
);
if (
  deactivateReplay.error ||
  deactivateReplay.data?.version !== deactivated.data.version
) {
  throw deactivateReplay.error ?? new Error('Deactivate replay failed');
}

const [
  { data: closedLocation },
  { count: vendorAuditCount },
  { count: locationAuditCount },
] = await Promise.all([
  db.from('locations').select('status').eq('id', location.data.id).single(),
  db
    .from('audit_events')
    .select('id', { count: 'exact', head: true })
    .eq('subject_type', 'RepairVendor')
    .eq('subject_id', created.data.id),
  db
    .from('audit_events')
    .select('id', { count: 'exact', head: true })
    .eq('subject_type', 'Location')
    .eq('subject_id', location.data.id),
]);
if (closedLocation?.status !== 'INACTIVE')
  throw new Error('Location chưa được ngừng');
if (vendorAuditCount !== 3 || locationAuditCount !== 2) {
  throw new Error(
    `Audit count sai: vendor=${vendorAuditCount}, location=${locationAuditCount}`,
  );
}

console.log(
  JSON.stringify({
    createReplay: true,
    duplicateLocationRejected: true,
    updateReplay: true,
    staleVersionRejected: true,
    deactivateReplay: true,
    vendorInactive: true,
    locationInactive: true,
    vendorAuditCount,
    locationAuditCount,
  }),
);

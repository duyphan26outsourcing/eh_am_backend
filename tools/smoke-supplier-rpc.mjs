/**
 * Smoke DB cho UC-MDM-05 khi không có tài khoản API test.
 * Chỉ đọc SUPABASE_URL/SUPABASE_SECRET_KEY từ môi trường hoặc .env; không in secret.
 * Giữ lại một supplier INACTIVE làm bằng chứng audit, không xoá lịch sử.
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

const { data: actors, error: actorError } = await db
  .from('user_profiles')
  .select('id,display_name')
  .limit(1);
if (actorError || !actors?.[0]) throw actorError ?? new Error('Thiếu actor');

const { data: reasons, error: reasonError } = await db
  .from('reason_codes')
  .select('id,is_freetext')
  .eq('reason_group', 'CATALOG_DEACTIVATE')
  .eq('status', 'ACTIVE')
  .limit(1);
if (reasonError || !reasons?.[0]) throw reasonError ?? new Error('Thiếu lý do');

const actor = actors[0];
const stamp = Date.now().toString();
const common = {
  p_actor_id: actor.id,
  p_actor_label: actor.display_name ?? 'DB smoke',
  p_request_id: `smoke-supplier-${stamp}`,
  p_ip: '127.0.0.1',
  p_user_agent: 'tools/smoke-supplier-rpc.mjs',
};

const { data: unfinished, error: unfinishedError } = await db
  .from('suppliers')
  .select('id,version')
  .like('name', 'SMOKE Supplier %')
  .eq('status', 'ACTIVE');
if (unfinishedError) throw unfinishedError;
for (const supplier of unfinished ?? []) {
  const cleanup = await db.rpc('deactivate_supplier', {
    ...common,
    p_command_key: randomUUID(),
    p_id: supplier.id,
    p_expected_version: supplier.version,
    p_reason_code_id: reasons[0].id,
    p_note: reasons[0].is_freetext ? 'DB smoke cleanup' : '',
    p_changes: { status: { before: 'ACTIVE', after: 'INACTIVE' } },
  });
  if (cleanup.error) throw cleanup.error;
}

const createKey = randomUUID();
const taxId = stamp.slice(-10).padStart(10, '0');
const createArgs = {
  ...common,
  p_command_key: createKey,
  p_name: `SMOKE Supplier ${stamp}`,
  p_tax_id: taxId,
  p_contact_name: '',
  p_contact_phone: '',
  p_contact_email: '',
  p_changes: { smoke: { before: null, after: true } },
};
const first = await db.rpc('create_supplier', createArgs);
if (first.error || !first.data) throw first.error ?? new Error('Create failed');
const replay = await db.rpc('create_supplier', createArgs);
if (replay.error || replay.data?.id !== first.data.id) {
  throw replay.error ?? new Error('Create replay failed');
}
const duplicate = await db.rpc('create_supplier', {
  ...createArgs,
  p_command_key: randomUUID(),
  p_name: `${createArgs.p_name} duplicate`,
});
if (!duplicate.error || duplicate.error.code !== '23505') {
  throw new Error('Duplicate tax ID không bị từ chối');
}

const updateKey = randomUUID();
const updateArgs = {
  ...common,
  p_command_key: updateKey,
  p_id: first.data.id,
  p_expected_version: first.data.version,
  p_name: `${first.data.name} updated`,
  p_tax_id: '',
  p_contact_name: '',
  p_contact_phone: '',
  p_contact_email: '',
  p_changes: {
    name: { before: first.data.name, after: `${first.data.name} updated` },
  },
};
const updated = await db.rpc('update_supplier', updateArgs);
if (updated.error || !updated.data)
  throw updated.error ?? new Error('Update failed');
const updateReplay = await db.rpc('update_supplier', updateArgs);
if (updateReplay.error || updateReplay.data?.version !== updated.data.version) {
  throw updateReplay.error ?? new Error('Update replay failed');
}
const stale = await db.rpc('update_supplier', {
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
  p_reason_code_id: reasons[0].id,
  p_note: reasons[0].is_freetext ? 'DB smoke verification' : '',
  p_changes: { status: { before: 'ACTIVE', after: 'INACTIVE' } },
};
const deactivated = await db.rpc('deactivate_supplier', deactivateArgs);
if (deactivated.error || deactivated.data?.status !== 'INACTIVE') {
  throw deactivated.error ?? new Error('Deactivate failed');
}
const deactivateReplay = await db.rpc('deactivate_supplier', deactivateArgs);
if (
  deactivateReplay.error ||
  deactivateReplay.data?.version !== deactivated.data.version
) {
  throw deactivateReplay.error ?? new Error('Deactivate replay failed');
}

const { count, error: auditError } = await db
  .from('audit_events')
  .select('id', { count: 'exact', head: true })
  .eq('subject_type', 'Supplier')
  .eq('subject_id', first.data.id);
if (auditError || count !== 3) {
  throw auditError ?? new Error(`Audit count sai: ${count}`);
}

console.log(
  JSON.stringify({
    createReplay: true,
    duplicateTaxRejected: true,
    updateReplay: true,
    staleVersionRejected: true,
    deactivateReplay: true,
    inactive: true,
    auditCount: count,
  }),
);

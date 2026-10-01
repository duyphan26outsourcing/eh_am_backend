/**
 * Smoke DB cho UC-IAM-05 sau migration 03.
 * Credential chỉ đọc từ môi trường/.env. Auth/profile smoke được dọn sau phép thử;
 * audit event và idempotency receipt được giữ lại làm bằng chứng.
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
const createdAuthIds = [];
let receiptKey;

try {
  const [{ data: actors, error: actorError }, { data: locations, error: locationError }] =
    await Promise.all([
      db.from('user_profiles').select('id,display_name').eq('status', 'ACTIVE').limit(1),
      db
        .from('locations')
        .select('id')
        .eq('status', 'ACTIVE')
        .neq('type', 'EXTERNAL')
        .neq('type', 'OFFICE')
        .limit(1),
    ]);
  if (actorError || !actors?.[0]) throw actorError ?? new Error('Thiếu actor ACTIVE');
  if (locationError || !locations?.[0]) {
    throw locationError ?? new Error('Thiếu location nội bộ ACTIVE không phải OFFICE');
  }

  const stamp = Date.now().toString();
  const workEmail = `smoke.employee.${stamp}@example.com`;
  const authResult = await db.auth.admin.createUser({
    email: workEmail,
    password: `Smoke!${stamp}aA`,
    email_confirm: true,
  });
  if (authResult.error || !authResult.data.user) {
    throw authResult.error ?? new Error('Không tạo được auth user smoke');
  }
  createdAuthIds.push(authResult.data.user.id);
  receiptKey = randomUUID();
  const common = {
    p_actor_id: actors[0].id,
    p_actor_label: actors[0].display_name ?? 'DB smoke',
    p_request_id: `smoke-employee-${stamp}`,
    p_ip: '127.0.0.1',
    p_user_agent: 'tools/smoke-employee-rpc.mjs',
  };
  const args = {
    ...common,
    p_command_key: receiptKey,
    p_user_id: authResult.data.user.id,
    p_work_email: workEmail,
    p_display_name: `SMOKE Employee ${stamp}`,
    p_phone: '0901234567',
    p_preferred_locale: 'vi',
    p_employee_code: `SMK${stamp.slice(-8)}`,
    p_job_title: '',
    p_primary_location_id: locations[0].id,
    p_department_id: null,
    p_manager_id: null,
    p_employment_type: null,
    p_start_date: null,
    p_must_change_password: true,
    p_activation_method: 'TEMPORARY_PASSWORD',
    p_invite_token_hash: null,
    p_invite_expires_at: null,
    p_role_code: null,
    p_role_context_type: null,
    p_role_context_id: null,
    p_effective_from: null,
    p_effective_to: null,
    p_reason_code_id: null,
    p_reason_note: '',
    p_changes: { smoke: { before: null, after: true } },
  };

  const first = await db.rpc('create_employee', args);
  if (first.error || !first.data) throw first.error ?? new Error('Create employee failed');
  const replay = await db.rpc('create_employee', args);
  if (replay.error || replay.data?.id !== first.data.id) {
    throw replay.error ?? new Error('Replay không trả cùng nhân viên');
  }

  const duplicateAuth = await db.auth.admin.createUser({
    email: `smoke.employee.duplicate.${stamp}@example.com`,
    password: `Smoke!${stamp}bB`,
    email_confirm: true,
  });
  if (duplicateAuth.error || !duplicateAuth.data.user) throw duplicateAuth.error;
  createdAuthIds.push(duplicateAuth.data.user.id);
  const duplicate = await db.rpc('create_employee', {
    ...args,
    p_command_key: randomUUID(),
    p_user_id: duplicateAuth.data.user.id,
    p_employee_code: `DUP${stamp.slice(-8)}`,
  });
  if (!duplicate.error || !duplicate.error.message.includes('EMAIL_ALREADY_REGISTERED')) {
    throw new Error('Email trùng không bị từ chối đúng mã');
  }

  const [{ data: profile }, { count: auditCount }] = await Promise.all([
    db
      .from('user_profiles')
      .select('status,must_change_password,work_email')
      .eq('id', first.data.id)
      .single(),
    db
      .from('audit_events')
      .select('id', { count: 'exact', head: true })
      .eq('event_code', 'iam.employee.created')
      .eq('subject_id', first.data.id),
  ]);
  if (
    profile?.status !== 'PENDING_ACTIVATION' ||
    profile.must_change_password !== true ||
    profile.work_email !== workEmail
  ) {
    throw new Error('Profile sau create không đúng trạng thái/normalization');
  }
  if (auditCount !== 1) throw new Error(`Audit count sai: ${auditCount}`);

  console.log(
    JSON.stringify({
      createReplay: true,
      duplicateEmailRejected: true,
      pendingActivation: true,
      mustChangePassword: true,
      auditCount,
    }),
  );
} finally {
  if (receiptKey) {
    await db
      .from('employee_command_receipts')
      .update({ employee_id: null })
      .eq('command_key', receiptKey);
  }
  for (const userId of createdAuthIds.reverse()) {
    const cleanup = await db.auth.admin.deleteUser(userId);
    if (cleanup.error) {
      console.error(`Cần dọn auth user smoke thủ công: ${userId}`);
    }
  }
}

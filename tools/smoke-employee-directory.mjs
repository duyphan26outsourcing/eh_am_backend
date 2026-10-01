/**
 * SMOKE TEST + SEED cho M01 (nhân sự & phân quyền) — các UC đã dev xong:
 *   UC-IAM-05  Tạo nhân viên            POST   /v1/employees
 *   UC-IAM-15  Danh sách nhân viên      GET    /v1/employees  (+ bộ lọc)
 *   UC-IAM-07  Gửi lại lời mời          POST   /v1/employees/:id/resend-invite  (gửi email → có cổng)
 *   UC-IAM-09  Sơ đồ tổ chức            GET    /v1/org-chart
 *   UC-IAM-10  Phân quyền theo phạm vi  GET/POST /v1/employees/:id/access, /role-assignments
 *
 * ⚠️ MỘT CÔNG ĐÔI VIỆC (như smoke-master-data): vừa kiểm nhanh các endpoint chạy đúng, vừa tạo sẵn
 * một bộ nhân viên mẫu để manual test màn Danh sách / Phân quyền dễ hơn.
 *
 * ⚠️ Chạy với server đang chạy (cổng 3006) và một tài khoản Quản trị hệ thống. KHÔNG hardcode mật
 * khẩu — đọc từ biến môi trường:
 *   SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD   (bắt buộc)
 *   API_BASE                                   (mặc định http://localhost:3006/v1)
 *   SUPABASE_URL, SUPABASE_SECRET_KEY          (tùy chọn, từ .env) — bật nhánh cấp quyền happy-path:
 *                                              kích hoạt 1 nhân viên mẫu sang ACTIVE rồi gán vai trò thật.
 *   SMOKE_ALLOW_INVITE_EMAILS=true             (tùy chọn) — mới cho phép tạo nhân viên EMAIL_INVITE và
 *                                              chạy smoke UC-IAM-07 (vì cả hai GỬI EMAIL thật qua Supabase).
 *
 * PowerShell:
 *   $env:SMOKE_ADMIN_EMAIL='admintaisan@everyhalf.vn'; $env:SMOKE_ADMIN_PASSWORD='...'; node tools/smoke-employee-directory.mjs
 *
 * Idempotent: email mẫu cố định, chạy lại gặp 409 EMAIL_ALREADY_REGISTERED / ROLE_ASSIGNMENT_EXISTS
 * coi như "đã seed", không phải lỗi. Dữ liệu mẫu được GIỮ LẠI để manual test (không dọn).
 */

import 'dotenv/config';
import { randomUUID } from 'node:crypto';

const API = process.env.API_BASE ?? 'http://localhost:3006/v1';
const EMAIL = process.env.SMOKE_ADMIN_EMAIL;
const PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;
const ALLOW_EMAILS = process.env.SMOKE_ALLOW_INVITE_EMAILS === 'true';
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_SECRET_KEY;

if (!EMAIL || !PASSWORD) {
  console.error(
    'Thiếu SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD. Xem chú thích đầu file.',
  );
  process.exit(1);
}

// Mật khẩu tạm cố định cho nhân viên mẫu (đủ hoa/thường/số/ký tự đặc biệt, ≥12). In ra để Duy
// đăng nhập thử bằng tài khoản ACTIVE không-phải-admin khi test phân quyền theo phạm vi.
const SEED_PASSWORD = 'SmokeEH#2026aA';

let token = '';
const failures = [];

async function call(method, path, body, extraHeaders) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(extraHeaders ?? {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, json };
}

function check(label, ok, detail) {
  if (ok) {
    console.log(`  ✓ ${label}`);
  } else {
    console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
    failures.push(label);
  }
}

// --- Seed một nhân viên (TEMPORARY_PASSWORD → không gửi email). 409 email trùng = đã seed. ---
async function seedEmployee(emp, locationId, departmentId) {
  const body = {
    primaryLocationId: locationId,
    displayName: emp.displayName,
    workEmail: emp.email,
    preferredLocale: 'vi',
    employeeCode: emp.employeeCode,
    employmentType: emp.employmentType,
    activationMethod: 'TEMPORARY_PASSWORD',
    temporaryPassword: SEED_PASSWORD,
    ...(departmentId ? { departmentId } : {}),
  };
  const { status, json } = await call('POST', '/employees', body, {
    'Idempotency-Key': randomUUID(),
  });
  if (status === 201 || status === 200) {
    console.log(`  ✓ tạo nhân viên ${emp.email}`);
    return json.id;
  }
  if (status === 409 && json.code === 'EMAIL_ALREADY_REGISTERED') {
    console.log(`  • ${emp.email} đã tồn tại, bỏ qua`);
    return null;
  }
  console.error(`  ✗ tạo ${emp.email} lỗi ${status}:`, json.code ?? json);
  failures.push(`seed ${emp.email}`);
  return null;
}

async function main() {
  console.log(`API: ${API}`);

  const login = await call('POST', '/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  });
  if (!login.json?.session?.access_token) {
    console.error('Đăng nhập thất bại:', login.status, login.json);
    process.exit(1);
  }
  token = login.json.session.access_token;
  console.log('Đăng nhập OK.\n');

  // --- Lấy options: cần location nội bộ (không EXTERNAL) + 1 phòng ban cho OFFICE. ---
  const opts = await call('GET', '/employees/create-options');
  const locations = opts.json?.locations ?? [];
  const departments = opts.json?.departments ?? [];
  const internal = locations.filter((l) => l.type !== 'EXTERNAL');
  const nonOffice = internal.filter((l) => l.type !== 'OFFICE');
  const office = internal.find((l) => l.type === 'OFFICE');
  if (nonOffice.length === 0) {
    console.error(
      'Chưa có location nội bộ (STORE/WAREHOUSE/ROASTERY) ACTIVE. Chạy tools/smoke-master-data.mjs trước.',
    );
    process.exit(1);
  }
  const locA = nonOffice[0];
  const locB = nonOffice[1] ?? nonOffice[0];
  const dept = departments[0];

  console.log('[Seed nhân viên mẫu]');
  const seeds = [
    {
      email: 'smoke.dir.an@example.com',
      displayName: 'SMOKE Nguyễn Văn An',
      employeeCode: 'SMK-AN',
      employmentType: 'FULL_TIME',
      loc: locA.id,
    },
    {
      email: 'smoke.dir.binh@example.com',
      displayName: 'SMOKE Trần Thị Bình',
      employeeCode: 'SMK-BINH',
      employmentType: 'PART_TIME',
      loc: locB.id,
    },
    {
      email: 'smoke.dir.cuong@example.com',
      displayName: 'SMOKE Lê Cường',
      employeeCode: 'SMK-CUONG',
      employmentType: 'CONTRACT',
      loc: locA.id,
    },
  ];
  // Một nhân viên văn phòng (cần phòng ban) nếu có OFFICE + department.
  if (office && dept) {
    seeds.push({
      email: 'smoke.dir.dung@example.com',
      displayName: 'SMOKE Phạm Dung',
      employeeCode: 'SMK-DUNG',
      employmentType: 'FULL_TIME',
      loc: office.id,
      dept: dept.id,
    });
  }
  for (const s of seeds) {
    await seedEmployee(s, s.loc, s.dept);
  }

  // =========================================================================
  // UC-IAM-15 — Danh sách nhân viên + bộ lọc
  // =========================================================================
  console.log('\n[UC-IAM-15] Danh sách nhân viên');
  const all = await call('GET', '/employees?pageSize=100');
  check(
    'GET /employees trả danh sách',
    all.status === 200 && Array.isArray(all.json?.items),
    `status=${all.status}`,
  );
  const items = all.json?.items ?? [];
  console.log(`    tổng: ${all.json?.total ?? '?'} nhân viên`);
  check(
    'mỗi dòng có trường inviteStatus (chuẩn mapper theo người xem)',
    items.length === 0 || 'inviteStatus' in items[0],
  );

  const pending = await call(
    'GET',
    '/employees?status=PENDING_ACTIVATION&pageSize=100',
  );
  check(
    'lọc status=PENDING_ACTIVATION chỉ trả PENDING',
    pending.status === 200 &&
      (pending.json.items ?? []).every(
        (i) => i.status === 'PENDING_ACTIVATION',
      ),
  );

  const fullTime = await call(
    'GET',
    '/employees?employmentType=FULL_TIME&pageSize=100',
  );
  check(
    'lọc employmentType=FULL_TIME đồng nhất',
    fullTime.status === 200 &&
      (fullTime.json.items ?? []).every((i) => i.employmentType === 'FULL_TIME'),
  );

  const search = await call('GET', '/employees?search=smoke.dir&pageSize=100');
  const seeded = (search.json.items ?? []).filter((i) =>
    (i.workEmail ?? '').startsWith('smoke.dir.'),
  );
  check(
    'tìm theo từ khoá "smoke.dir" thấy nhân viên mẫu',
    seeded.length > 0,
    `thấy ${seeded.length}`,
  );

  const badStatus = await call('GET', '/employees?status=KHONG_CO');
  check(
    'status ngoài miền → 400 VALUE_OUT_OF_DOMAIN',
    badStatus.status === 400 && badStatus.json.code === 'VALUE_OUT_OF_DOMAIN',
    `status=${badStatus.status} code=${badStatus.json.code}`,
  );

  const byEmail = new Map(seeded.map((i) => [i.workEmail, i]));
  const anEmp = byEmail.get('smoke.dir.an@example.com') ?? seeded[0];

  // =========================================================================
  // UC-IAM-09 — Sơ đồ tổ chức
  // =========================================================================
  console.log('\n[UC-IAM-09] Sơ đồ tổ chức');
  const chart = await call('GET', '/org-chart');
  const chartSize = Array.isArray(chart.json)
    ? chart.json.length
    : Array.isArray(chart.json?.nodes)
      ? chart.json.nodes.length
      : Array.isArray(chart.json?.locations)
        ? chart.json.locations.length
        : null;
  check(
    'GET /org-chart trả 200',
    chart.status === 200,
    `status=${chart.status}`,
  );
  console.log(`    kích thước sơ đồ: ${chartSize ?? 'xem JSON'}`);

  // =========================================================================
  // UC-IAM-10 — Phân quyền theo phạm vi (đọc options + guard)
  // =========================================================================
  console.log('\n[UC-IAM-10] Phân quyền theo phạm vi');
  if (anEmp) {
    const access = await call('GET', `/employees/${anEmp.id}/access`);
    check(
      'GET /employees/:id/access trả 200',
      access.status === 200,
      `status=${access.status}`,
    );
    const roles = access.json?.options?.roles ?? [];
    check(
      'options.roles không chứa SYSTEM_ADMIN (BR-IAM-05)',
      roles.length > 0 && roles.every((r) => r.code !== 'SYSTEM_ADMIN'),
    );
    check(
      'options.locations có dữ liệu',
      (access.json?.options?.locations ?? []).length > 0,
    );
    check('assignments là mảng', Array.isArray(access.json?.assignments));

    // Guard EX.2: nhân viên PENDING_ACTIVATION không được gán vai trò.
    const grantPending = await call(
      'POST',
      `/employees/${anEmp.id}/role-assignments`,
      {
        roleCode: 'LOCATION_MANAGER',
        contextIds: [anEmp.location?.id ?? locA.id],
        effectiveFrom: new Date().toISOString().slice(0, 10),
        reason: 'Smoke guard: nhân viên chưa kích hoạt',
      },
      { 'Idempotency-Key': randomUUID() },
    );
    check(
      'gán vai trò cho nhân viên PENDING → chặn ACCOUNT_INACTIVE',
      grantPending.json?.code === 'ACCOUNT_INACTIVE',
      `status=${grantPending.status} code=${grantPending.json?.code}`,
    );
  } else {
    console.log('  • chưa gom được nhân viên mẫu để test access, bỏ qua');
  }

  // --- Happy-path cấp quyền: cần service key để kích hoạt 1 nhân viên ACTIVE thật. ---
  console.log('\n[UC-IAM-10] Cấp quyền happy-path (nhân viên ACTIVE)');
  if (!SUPA_URL || !SUPA_KEY) {
    console.log(
      '  • Thiếu SUPABASE_URL/SUPABASE_SECRET_KEY → bỏ qua nhánh cấp quyền thật (chỉ chạy guard ở trên).',
    );
  } else {
    const { createClient } = await import('@supabase/supabase-js');
    const db = createClient(SUPA_URL, SUPA_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    // Tài khoản @example.com do script tạo là dữ liệu DEV/TEST, không có hộp thư thật.
    // Xác nhận email bằng Admin API, tuyệt đối không áp dụng quy tắc này cho email ngoài namespace smoke.dir.*.
    const { data: authPage, error: authListError } =
      await db.auth.admin.listUsers({ page: 1, perPage: 1000 });
    if (authListError) {
      check('đọc tài khoản Auth mẫu để xác nhận email', false, authListError.message);
    } else {
      const dummyUsers = authPage.users.filter((user) =>
        user.email?.startsWith('smoke.dir.'),
      );
      for (const user of dummyUsers) {
        if (!user.email_confirmed_at) {
          const { error: confirmError } =
            await db.auth.admin.updateUserById(user.id, {
              email_confirm: true,
            });
          if (confirmError) {
            check(`xác nhận email dummy ${user.email}`, false, confirmError.message);
          }
        }
      }
      check(
        'email của tài khoản dummy được xác nhận không cần hộp thư thật',
        dummyUsers.length > 0,
      );
    }
    const activeEmail = 'smoke.dir.active@example.com';
    await seedEmployee(
      {
        email: activeEmail,
        displayName: 'SMOKE Quản lý ACTIVE',
        employeeCode: 'SMK-ACTIVE',
        employmentType: 'FULL_TIME',
      },
      locA.id,
    );
    // Tìm id + kích hoạt sang ACTIVE (lối tắt chỉ cho DEV smoke; luồng thật qua kích hoạt tài khoản).
    const { data: prof } = await db
      .from('user_profiles')
      .select('id,status')
      .eq('work_email', activeEmail)
      .maybeSingle();
    if (!prof) {
      check('tìm thấy hồ sơ nhân viên ACTIVE mẫu', false);
    } else {
      if (prof.status !== 'ACTIVE') {
        await db
          .from('user_profiles')
          .update({ status: 'ACTIVE' })
          .eq('id', prof.id);
      }
      const grant = await call(
        'POST',
        `/employees/${prof.id}/role-assignments`,
        {
          roleCode: 'LOCATION_MANAGER',
          contextIds: [locA.id],
          effectiveFrom: new Date().toISOString().slice(0, 10),
          reason: 'Smoke cấp quyền quản lý điểm',
        },
        { 'Idempotency-Key': randomUUID() },
      );
      const granted =
        (grant.status === 201 || grant.status === 200) &&
        Array.isArray(grant.json) &&
        grant.json[0]?.roleCode === 'LOCATION_MANAGER';
      const alreadyThere =
        grant.status === 409 && grant.json?.code === 'ROLE_ASSIGNMENT_EXISTS';
      check(
        'cấp LOCATION_MANAGER cho nhân viên ACTIVE (RPC migration 10)',
        granted || alreadyThere,
        `status=${grant.status} code=${grant.json?.code ?? ''}`,
      );
      const access2 = await call('GET', `/employees/${prof.id}/access`);
      check(
        'access sau khi cấp có ít nhất 1 vai trò LOCATION_MANAGER',
        (access2.json?.assignments ?? []).some(
          (a) => a.roleCode === 'LOCATION_MANAGER',
        ),
      );
      console.log(
        `    → Tài khoản ACTIVE mẫu để đăng nhập test phạm vi: ${activeEmail} / ${SEED_PASSWORD}`,
      );
    }
  }

  // =========================================================================
  // UC-IAM-07 — Gửi lại lời mời (GỬI EMAIL → mặc định bỏ qua)
  // =========================================================================
  console.log('\n[UC-IAM-07] Gửi lại lời mời kích hoạt');
  if (!ALLOW_EMAILS) {
    console.log(
      '  • SMOKE_ALLOW_INVITE_EMAILS != true → bỏ qua (tránh gửi email thật qua Supabase).',
    );
  } else {
    const inviteEmail = 'smoke.dir.invite@example.com';
    const { status: cStatus, json: cJson } = await call(
      'POST',
      '/employees',
      {
        primaryLocationId: locA.id,
        displayName: 'SMOKE Mời Email',
        workEmail: inviteEmail,
        preferredLocale: 'vi',
        employeeCode: 'SMK-INVITE',
        activationMethod: 'EMAIL_INVITE',
      },
      { 'Idempotency-Key': randomUUID() },
    );
    let inviteId = cJson?.id;
    if (cStatus === 409 && cJson.code === 'EMAIL_ALREADY_REGISTERED') {
      const found = await call(
        'GET',
        '/employees?search=smoke.dir.invite&pageSize=10',
      );
      inviteId = (found.json.items ?? [])[0]?.id;
    }
    if (!inviteId) {
      check('chuẩn bị nhân viên EMAIL_INVITE', false, `status=${cStatus}`);
    } else {
      const resend = await call(
        'POST',
        `/employees/${inviteId}/resend-invite`,
        undefined,
        { 'Idempotency-Key': randomUUID() },
      );
      check(
        'POST /resend-invite thành công hoặc trả mã đã biết',
        resend.status === 200 ||
          resend.status === 201 ||
          ['EMAIL_SEND_FAILED', 'RATE_LIMIT_EXCEEDED'].includes(
            resend.json?.code,
          ),
        `status=${resend.status} code=${resend.json?.code ?? ''}`,
      );
    }
  }

  // =========================================================================
  console.log('\n[Kết quả]');
  if (failures.length === 0) {
    console.log('✓ Tất cả smoke PASS. Dữ liệu mẫu đã seed (giữ lại để manual test).');
  } else {
    console.error(`✗ ${failures.length} mục FAIL:`, failures.join(', '));
    process.exit(1);
  }
}

main().catch((e) => {
  console.error('Lỗi không mong đợi:', e);
  process.exit(1);
});

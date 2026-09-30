/**
 * SMOKE TEST + SEED cho M02 (danh mục nền): cost center → phòng ban → location.
 *
 * ⚠️ MỘT CÔNG ĐÔI VIỆC: vừa kiểm nhanh các endpoint `/v1/master-data/*` chạy đúng, vừa tạo sẵn
 * dữ liệu mẫu để manual test màn listing dễ hơn (UC-MDM-01/03/08).
 *
 * ⚠️ Chạy với server đang chạy (cổng 3006) và một tài khoản Quản trị hệ thống. KHÔNG hardcode mật
 * khẩu — đọc từ biến môi trường:
 *   SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD  (bắt buộc)
 *   API_BASE                                  (mặc định http://localhost:3006/v1)
 *
 * PowerShell:  $env:SMOKE_ADMIN_EMAIL='admintaisan@everyhalf.vn'; $env:SMOKE_ADMIN_PASSWORD='...'; node tools/smoke-master-data.mjs
 *
 * Idempotent: mã đã tồn tại (409 DUPLICATE_RECORD) coi như bỏ qua, không phải lỗi.
 */

const API = process.env.API_BASE ?? 'http://localhost:3006/v1';
const EMAIL = process.env.SMOKE_ADMIN_EMAIL;
const PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;

if (!EMAIL || !PASSWORD) {
  console.error(
    'Thiếu SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD. Xem chú thích đầu file.',
  );
  process.exit(1);
}

let token = '';

async function call(method, path, body) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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

/** Tạo một bản ghi; 409 DUPLICATE_RECORD coi như đã có (bỏ qua). */
async function seed(label, path, body) {
  const { status, json } = await call('POST', path, body);
  if (status === 201 || status === 200) {
    console.log(`  ✓ tạo ${label}: ${body.code}`);
    return json;
  }
  if (status === 409 && json.code === 'DUPLICATE_RECORD') {
    console.log(`  • ${label} ${body.code} đã tồn tại, bỏ qua`);
    return null;
  }
  console.error(
    `  ✗ tạo ${label} ${body.code} lỗi ${status}:`,
    json.code ?? json,
  );
  return null;
}

async function main() {
  console.log(`API: ${API}`);

  const login = await call('POST', '/auth/login', {
    email: EMAIL,
    password: PASSWORD,
  });
  // Đăng nhập trả 201 (tạo phiên mới). Chấp nhận cả 200/201, miễn có access_token.
  if (!login.json?.session?.access_token) {
    console.error('Đăng nhập thất bại:', login.status, login.json);
    process.exit(1);
  }
  token = login.json.session.access_token;
  console.log('Đăng nhập OK.');

  console.log('\n[Cost center]');
  const costCenters = [
    { code: 'CC-STORE-01', name: 'Chi phí cửa hàng Quận 1' },
    { code: 'CC-WH-01', name: 'Chi phí kho trung tâm' },
    { code: 'CC-ROAST-01', name: 'Chi phí xưởng rang' },
    { code: 'CC-OFFICE-01', name: 'Chi phí văn phòng hội sở' },
    { code: 'CC-EXT-01', name: 'Chi phí đối tác bên ngoài' },
  ];
  for (const cc of costCenters) {
    await seed('cost center', '/master-data/cost-centers', cc);
  }

  const ccList = await call(
    'GET',
    '/master-data/cost-centers?status=ACTIVE&pageSize=100',
  );
  const ccByCode = new Map(
    (ccList.json.items ?? []).map((c) => [c.code, c.id]),
  );

  console.log('\n[Phòng ban]');
  const departments = [
    { code: 'VP-KT', name: 'Phòng Kế toán' },
    { code: 'VP-NS', name: 'Phòng Nhân sự' },
    { code: 'VP-IT', name: 'Phòng Công nghệ thông tin' },
    { code: 'VP-VH', name: 'Phòng Vận hành' },
  ];
  for (const d of departments) {
    await seed('phòng ban', '/master-data/departments', d);
  }

  console.log('\n[Location]');
  const locations = [
    { code: 'Q1', name: 'Cửa hàng Quận 1', type: 'STORE', cc: 'CC-STORE-01' },
    {
      code: 'KHO-HCM',
      name: 'Kho trung tâm HCM',
      type: 'WAREHOUSE',
      cc: 'CC-WH-01',
    },
    {
      code: 'XR-TD',
      name: 'Xưởng rang Thủ Đức',
      type: 'ROASTERY',
      cc: 'CC-ROAST-01',
    },
    {
      code: 'VP-HO',
      name: 'Văn phòng Hội sở',
      type: 'OFFICE',
      cc: 'CC-OFFICE-01',
    },
    {
      code: 'SC-ABC',
      name: 'Đơn vị sửa chữa ABC',
      type: 'EXTERNAL',
      cc: 'CC-EXT-01',
    },
  ];
  for (const l of locations) {
    const ccId = ccByCode.get(l.cc);
    if (!ccId) {
      console.error(
        `  ✗ location ${l.code}: chưa có cost center ${l.cc} ACTIVE`,
      );
      continue;
    }
    await seed('location', '/master-data/locations', {
      code: l.code,
      name: l.name,
      type: l.type,
      address: `Địa chỉ mẫu cho ${l.name}`,
      defaultCostCenterId: ccId,
    });
  }

  console.log('\n[Lý do]');
  const reasons = [
    { reasonGroup: 'DISPOSAL', code: 'BROKEN', label: 'Hư hỏng không sửa được' },
    {
      reasonGroup: 'DISPOSAL',
      code: 'OBSOLETE',
      label: 'Lỗi thời / hết nhu cầu',
    },
    {
      reasonGroup: 'TRANSFER',
      code: 'REBALANCE',
      label: 'Điều phối lại giữa điểm',
    },
    {
      reasonGroup: 'ACCOUNT_LOCK',
      code: 'SUSPECT',
      label: 'Nghi ngờ truy cập trái phép',
    },
    // Nhóm 'Ngừng mục danh mục' (CATALOG_DEACTIVATE): để dropdown chọn lý do khi Ngừng có mục
    // thật, không chỉ "Khác" (UC-MDM-03/07.AC.2). Cần migration 02g + 02h.
    {
      reasonGroup: 'CATALOG_DEACTIVATE',
      code: 'MERGED',
      label: 'Gộp vào mục khác',
    },
    {
      reasonGroup: 'CATALOG_DEACTIVATE',
      code: 'UNUSED',
      label: 'Không còn sử dụng',
    },
  ];
  for (const r of reasons) {
    await seed('lý do', '/master-data/reason-codes', r);
  }

  // Demo luồng NGỪNG (AC.2): tạo cost center + lý do "dùng một lần" rồi ngừng, để listing có dòng
  // INACTIVE cho manual test. Idempotent: tạo trùng bỏ qua; ngừng trên bản đã ngừng → 409 bỏ qua.
  console.log('\n[Demo ngừng]');
  const rcList = await call(
    'GET',
    '/master-data/reason-codes?reasonGroup=CATALOG_DEACTIVATE&status=ACTIVE&pageSize=100',
  );
  const deactivateReasonId = (rcList.json.items ?? []).find(
    (r) => r.code === 'MERGED',
  )?.id;

  if (!deactivateReasonId) {
    console.log(
      '  • chưa có lý do CATALOG_DEACTIVATE (cần chạy 02g/02h), bỏ qua demo',
    );
  } else {
    // (a) Ngừng một cost center demo (không location nào dùng nên qua được kiểm "còn dùng").
    const demoCc = await seed('cost center demo', '/master-data/cost-centers', {
      code: 'CC-DEMO-OFF',
      name: 'Cost center demo sẽ ngừng',
    });
    const demoCcId =
      demoCc?.id ??
      (
        await call(
          'GET',
          '/master-data/cost-centers?status=ACTIVE&pageSize=100',
        )
      ).json.items?.find((c) => c.code === 'CC-DEMO-OFF')?.id;
    if (demoCcId) {
      const { status, json } = await call(
        'POST',
        `/master-data/cost-centers/${demoCcId}/deactivate`,
        { reasonCodeId: deactivateReasonId, version: 1 },
      );
      if (status === 200 || status === 201)
        console.log('  ✓ đã ngừng cost center CC-DEMO-OFF');
      else console.log(`  • ngừng CC-DEMO-OFF: ${status} ${json.code ?? ''}`);
    }

    // (b) Ngừng một lý do demo.
    const demoReason = await seed('lý do demo', '/master-data/reason-codes', {
      reasonGroup: 'PROFILE_EDIT',
      code: 'DEMO-OFF',
      label: 'Lý do demo sẽ ngừng',
    });
    const demoReasonId =
      demoReason?.id ??
      (
        await call(
          'GET',
          '/master-data/reason-codes?reasonGroup=PROFILE_EDIT&pageSize=100',
        )
      ).json.items?.find((r) => r.code === 'DEMO-OFF')?.id;
    if (demoReasonId) {
      const { status, json } = await call(
        'POST',
        `/master-data/reason-codes/${demoReasonId}/deactivate`,
        { reasonCodeId: deactivateReasonId, version: 1 },
      );
      if (status === 200 || status === 201)
        console.log('  ✓ đã ngừng lý do DEMO-OFF');
      else console.log(`  • ngừng DEMO-OFF: ${status} ${json.code ?? ''}`);
    }
  }

  console.log('\n[Cây loại tài sản]');
  const atGroups = [
    { code: 'IT-EQ', name: 'Thiết bị IT' },
    { code: 'FURNITURE', name: 'Nội thất' },
  ];
  for (const g of atGroups) {
    await seed('nhóm loại', '/master-data/asset-types/groups', g);
  }
  const atList = await call(
    'GET',
    '/master-data/asset-types?status=ACTIVE&pageSize=500',
  );
  const groupByCode = new Map(
    (atList.json.items ?? [])
      .filter((x) => x.parentId === null)
      .map((x) => [x.code, x.id]),
  );
  const atTypes = [
    {
      group: 'IT-EQ',
      code: 'LAPTOP',
      name: 'Máy tính xách tay',
      assetKind: 'FIXED_ASSET',
      serialRequired: true,
      usefulLifeMonths: 36,
      fastGroupCode: 'FA-IT',
    },
    { group: 'IT-EQ', code: 'MOUSE', name: 'Chuột', assetKind: 'TOOL' },
    {
      group: 'FURNITURE',
      code: 'CHAIR',
      name: 'Ghế văn phòng',
      assetKind: 'TOOL',
    },
  ];
  for (const ty of atTypes) {
    const parentId = groupByCode.get(ty.group);
    if (!parentId) {
      console.error(`  ✗ loại ${ty.code}: chưa có nhóm ${ty.group} ACTIVE`);
      continue;
    }
    const { group: _g, ...rest } = ty;
    await seed('loại tài sản', '/master-data/asset-types', {
      ...rest,
      parentId,
    });
  }

  console.log('\n[Kết quả listing]');
  const lists = [
    ['cost center', '/master-data/cost-centers?pageSize=100'],
    ['phòng ban', '/master-data/departments?pageSize=100'],
    ['location', '/master-data/locations?pageSize=100'],
    ['lý do', '/master-data/reason-codes?pageSize=200'],
    ['loại tài sản', '/master-data/asset-types?pageSize=500'],
  ];
  for (const [label, path] of lists) {
    const { json } = await call('GET', path);
    console.log(
      `  ${label}: ${json.total ?? json.items?.length ?? '?'} bản ghi`,
    );
  }
  console.log(
    '\nXong. Mở web (Danh mục nền) để manual test với dữ liệu vừa tạo.',
  );
}

main().catch((e) => {
  console.error('Lỗi không mong đợi:', e);
  process.exit(1);
});

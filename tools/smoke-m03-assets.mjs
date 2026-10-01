/**
 * SMOKE TEST + SEED cho các UC M03 đã triển khai:
 *   UC-AST-01  Tạo hồ sơ tài sản          POST /v1/assets
 *   UC-AST-07  Tra cứu danh sách tài sản GET  /v1/assets
 *   UC-AST-08  Xem hồ sơ chi tiết        GET  /v1/assets/:id
 *   UC-AST-03  Sửa thông tin mô tả       PATCH /v1/assets/:id/description
 *   UC-AST-05  Đổi người chịu trách nhiệm GET  /v1/assets/:id/responsibility-options
 *                                         PATCH /v1/assets/:id/responsible
 *   UC-AST-11  Đưa vào / ngừng sử dụng   GET  /v1/assets/:id/lifecycle-options
 *                                         PATCH /v1/assets/:id/lifecycle
 *   UC-AST-09  Đề nghị huỷ hồ sơ         POST /v1/assets/:id/cancellation-request
 *   UC-AST-10  Duyệt/từ chối huỷ         GET  /v1/asset-cancellations, POST :id/decision
 *
 * Script giữ lại dữ liệu mẫu để manual test trên http://localhost:5175/assets.
 * Không hardcode tài khoản/mật khẩu và không xoá dữ liệu nghiệp vụ.
 *
 * Biến môi trường bắt buộc:
 *   SMOKE_ADMIN_EMAIL, SMOKE_ADMIN_PASSWORD
 *
 * Tùy chọn:
 *   API_BASE                 mặc định http://localhost:3006/v1
 *   SMOKE_LOCATION_EMAIL     tài khoản LOCATION_MANAGER để kiểm scope AST-07/08
 *   SMOKE_LOCATION_PASSWORD  mật khẩu của tài khoản trên
 *
 * PowerShell:
 *   $env:SMOKE_ADMIN_EMAIL='...'; $env:SMOKE_ADMIN_PASSWORD='...'; npm run smoke:m03
 *
 * Idempotent theo dữ liệu: chạy lại sẽ tìm tài sản seed theo tên/serial và tái sử dụng.
 */

import 'dotenv/config';
import { randomUUID } from 'node:crypto';

const API = process.env.API_BASE ?? 'http://localhost:3006/v1';
const ADMIN_EMAIL = process.env.SMOKE_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.SMOKE_ADMIN_PASSWORD;
const LOCATION_EMAIL = process.env.SMOKE_LOCATION_EMAIL;
const LOCATION_PASSWORD = process.env.SMOKE_LOCATION_PASSWORD;
const SEED_PREFIX = 'SMOKE M03';

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error(
    'Thiếu SMOKE_ADMIN_EMAIL / SMOKE_ADMIN_PASSWORD. Xem hướng dẫn đầu file.',
  );
  process.exit(1);
}

const failures = [];

async function call(method, path, { token, body, headers } = {}) {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: response.status, json };
}

function check(label, ok, detail) {
  if (ok) {
    console.log(`  ✓ ${label}`);
    return;
  }
  console.error(`  ✗ ${label}${detail ? ` — ${detail}` : ''}`);
  failures.push(label);
}

async function login(email, password, label) {
  const result = await call('POST', '/auth/login', {
    body: { email, password },
  });
  const token = result.json?.session?.access_token;
  check(
    `đăng nhập ${label}`,
    Boolean(token),
    `status=${result.status} code=${result.json?.code ?? ''}`,
  );
  return token
    ? { token, userId: result.json?.user?.id, user: result.json?.user }
    : null;
}

function queryPath(params) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }
  return `/assets?${search.toString()}`;
}

async function findSeedAsset(token, seed) {
  const byName = await call(
    'GET',
    queryPath({ search: seed.name, pageSize: 100 }),
    {
      token,
    },
  );
  const exactName = (byName.json?.items ?? []).find(
    (asset) => asset.name === seed.name,
  );
  if (exactName) return exactName;

  const bySerial = await call(
    'GET',
    queryPath({ search: seed.serial, pageSize: 100 }),
    { token },
  );
  return (bySerial.json?.items ?? []).find(
    (asset) => asset.serial === seed.serial,
  );
}

async function createSeedAsset(token, seed, responsibleCandidates) {
  const existing = await findSeedAsset(token, seed);
  if (existing) {
    console.log(
      `  • ${seed.name} đã tồn tại (${existing.assetCode}), tái sử dụng`,
    );
    return existing;
  }

  for (const responsible of responsibleCandidates) {
    const result = await call('POST', '/assets', {
      token,
      headers: { 'Idempotency-Key': randomUUID() },
      body: {
        name: seed.name,
        assetTypeId: seed.assetType.id,
        serial: seed.serial,
        note: seed.note,
        purchaseDate: '2026-10-01',
        ...(seed.supplierId ? { supplierId: seed.supplierId } : {}),
        invoiceNo: seed.invoiceNo,
        primaryLocationId: seed.location.id,
        responsibleUserId: responsible.id,
        initialStatus: seed.status,
      },
    });

    if (result.status === 200 || result.status === 201) {
      console.log(
        `  ✓ tạo ${seed.name}: ${result.json.assetCode} · ${seed.location.code}`,
      );
      check('response tạo có QR token', Boolean(result.json?.qrToken));
      return result.json;
    }

    if (result.json?.code === 'RESPONSIBLE_NOT_ON_LOCATION') continue;

    if (result.json?.code === 'DUPLICATE_RECORD') {
      const duplicate = await findSeedAsset(token, seed);
      if (duplicate) {
        console.log(
          `  • serial ${seed.serial} đã có, tái sử dụng ${duplicate.assetCode}`,
        );
        return duplicate;
      }
    }

    check(
      `tạo ${seed.name}`,
      false,
      `status=${result.status} code=${result.json?.code ?? ''}`,
    );
    return null;
  }

  check(
    `tạo ${seed.name}`,
    false,
    `không có người ACTIVE phù hợp tại location ${seed.location.code}`,
  );
  return null;
}

async function main() {
  console.log(`API: ${API}`);
  const admin = await login(ADMIN_EMAIL, ADMIN_PASSWORD, 'tài khoản smoke M03');
  if (!admin) process.exit(1);

  console.log('\n[Chuẩn bị dữ liệu tham chiếu]');
  const options = await call('GET', '/assets/create-options', {
    token: admin.token,
  });
  check(
    'GET /assets/create-options trả 200',
    options.status === 200,
    `status=${options.status} code=${options.json?.code ?? ''}`,
  );

  const assetTypes = options.json?.assetTypes ?? [];
  const locations = options.json?.locations ?? [];
  const suppliers = options.json?.suppliers ?? [];
  const responsibles = options.json?.responsibleCandidates ?? [];
  check('có ít nhất một loại tài sản lá ACTIVE', assetTypes.length > 0);
  check('có ít nhất một location nội bộ ACTIVE', locations.length > 0);
  check(
    'có ít nhất một người chịu trách nhiệm ACTIVE',
    responsibles.length > 0,
  );
  if (
    assetTypes.length === 0 ||
    locations.length === 0 ||
    responsibles.length === 0
  ) {
    console.error(
      'Thiếu dữ liệu nền. Chạy smoke M02 và M01 trước, sau đó chạy lại smoke M03.',
    );
    process.exit(1);
  }

  // Ưu tiên chính tài khoản đang chạy smoke: Asset Manager hợp lệ ở mọi location theo BR-AST-09.
  const orderedResponsibles = [
    ...responsibles.filter((person) => person.id === admin.userId),
    ...responsibles.filter((person) => person.id !== admin.userId),
  ];
  const supplierId = suppliers[0]?.id;
  const seeds = Array.from({ length: 3 }, (_, index) => {
    const number = index + 1;
    const assetType = assetTypes[index % assetTypes.length];
    // Bộ dữ liệu nền có thể mới chỉ gán Location Manager cho location đầu tiên.
    // Dùng cùng một location hợp lệ để tạo đủ bộ smoke; kiểm scope đa-location là nhánh tùy chọn phía dưới.
    const location = locations[0];
    return {
      name: `${SEED_PREFIX} ${String(number).padStart(2, '0')} · ${assetType.name}`,
      serial: `SMOKE-M03-${String(number).padStart(3, '0')}`,
      note: `Dữ liệu mẫu UC-AST-01/07/08 tại ${location.name}; giữ lại để manual test.`,
      invoiceNo: `SMOKE-HD-${String(number).padStart(3, '0')}`,
      status: index % 2 === 0 ? 'IN_USE' : 'IN_STORAGE',
      assetType,
      location,
      supplierId,
    };
  });

  console.log('\n[UC-AST-01] Seed hồ sơ tài sản');
  const seededAssets = [];
  for (const seed of seeds) {
    const asset = await createSeedAsset(admin.token, seed, orderedResponsibles);
    if (asset) seededAssets.push({ ...asset, seed });
  }
  check('có dữ liệu tài sản mẫu để manual test', seededAssets.length > 0);

  console.log('\n[UC-AST-07] Danh sách, tìm kiếm và bộ lọc');
  const directory = await call(
    'GET',
    queryPath({ search: SEED_PREFIX, pageSize: 100 }),
    { token: admin.token },
  );
  const directoryItems = directory.json?.items ?? [];
  check('tìm theo tên seed trả 200', directory.status === 200);
  check(
    'danh sách tìm thấy tài sản seed',
    directoryItems.length >= seededAssets.length && directoryItems.length > 0,
    `thấy ${directoryItems.length}`,
  );
  check(
    'danh sách không phơi QR token/tài chính',
    directoryItems.every(
      (item) =>
        !Object.hasOwn(item, 'qrToken') &&
        !Object.hasOwn(item, 'financial') &&
        !Object.hasOwn(item, 'costCenterId'),
    ),
  );

  const first = seededAssets[0];
  if (first) {
    const byCode = await call(
      'GET',
      queryPath({ search: first.assetCode, pageSize: 20 }),
      { token: admin.token },
    );
    check(
      'tìm theo Asset ID',
      (byCode.json?.items ?? []).some((item) => item.id === first.id),
    );

    const bySerial = await call(
      'GET',
      queryPath({ search: first.seed.serial, pageSize: 20 }),
      { token: admin.token },
    );
    check(
      'tìm theo serial',
      (bySerial.json?.items ?? []).some((item) => item.id === first.id),
    );

    const filtered = await call(
      'GET',
      queryPath({
        assetTypeId: first.seed.assetType.id,
        status: first.seed.status,
        physicalCondition: 'GOOD',
        locationId: first.seed.location.id,
        pageSize: 100,
      }),
      { token: admin.token },
    );
    check(
      'lọc loại + trạng thái + tình trạng + location',
      filtered.status === 200 &&
        (filtered.json?.items ?? []).some((item) => item.id === first.id),
      `status=${filtered.status}`,
    );
  }

  const invalidStatus = await call(
    'GET',
    queryPath({ status: 'KHONG_HOP_LE' }),
    { token: admin.token },
  );
  check(
    'status ngoài miền → 400 VALUE_OUT_OF_DOMAIN',
    invalidStatus.status === 400 &&
      invalidStatus.json?.code === 'VALUE_OUT_OF_DOMAIN',
    `status=${invalidStatus.status} code=${invalidStatus.json?.code ?? ''}`,
  );

  console.log('\n[UC-AST-03] Sửa thông tin mô tả');
  if (first) {
    const beforeUpdate = await call('GET', `/assets/${first.id}`, {
      token: admin.token,
    });
    const targetNote =
      'Dữ liệu mẫu UC-AST-01/03/07/08; giữ lại để manual test M03.';
    if (beforeUpdate.status === 200 && beforeUpdate.json?.note !== targetNote) {
      const updateKey = randomUUID();
      const updateBody = {
        name: beforeUpdate.json.name,
        assetTypeId: beforeUpdate.json.assetType.id,
        serial: beforeUpdate.json.serial ?? undefined,
        note: targetNote,
        profileVersion: beforeUpdate.json.profileVersion,
      };
      const updated = await call(
        'PATCH',
        `/assets/${first.id}/description`,
        {
          token: admin.token,
          headers: { 'Idempotency-Key': updateKey },
          body: updateBody,
        },
      );
      check(
        'cập nhật ghi chú và tăng phiên bản',
        updated.status === 200 &&
          updated.json?.note === targetNote &&
          updated.json?.profileVersion === beforeUpdate.json.profileVersion + 1,
        `status=${updated.status} code=${updated.json?.code ?? ''}`,
      );
      const replay = await call(
        'PATCH',
        `/assets/${first.id}/description`,
        {
          token: admin.token,
          headers: { 'Idempotency-Key': updateKey },
          body: updateBody,
        },
      );
      check(
        'gửi lại cùng khóa trả đúng kết quả, không cập nhật lần hai',
        replay.status === 200 &&
          replay.json?.profileVersion === updated.json?.profileVersion,
        `status=${replay.status} code=${replay.json?.code ?? ''}`,
      );
    } else {
      check(
        'tải hồ sơ trước khi sửa',
        beforeUpdate.status === 200,
        `status=${beforeUpdate.status}`,
      );
      console.log('  • ghi chú AST-03 đã đúng, bỏ qua lần ghi mới');
    }
  }

  console.log('\n[UC-AST-05] Đổi người chịu trách nhiệm');
  if (first) {
    const detailBefore = await call('GET', `/assets/${first.id}`, {
      token: admin.token,
    });
    const optionsResult = await call(
      'GET',
      `/assets/${first.id}/responsibility-options`,
      { token: admin.token },
    );
    check(
      'GET responsibility-options trả 200 + candidates + reasons',
      optionsResult.status === 200 &&
        Array.isArray(optionsResult.json?.candidates) &&
        Array.isArray(optionsResult.json?.reasons),
      `status=${optionsResult.status} code=${optionsResult.json?.code ?? ''}`,
    );
    const currentResponsibleId =
      optionsResult.json?.currentResponsibleUserId ??
      detailBefore.json?.responsible?.id;
    const version = detailBefore.json?.profileVersion;
    // Ưu tiên lý do preset (non-freetext) để không phải nhập ghi chú; fallback mục 'Khác'.
    const reason =
      (optionsResult.json?.reasons ?? []).find((item) => !item.isFreetext) ??
      (optionsResult.json?.reasons ?? [])[0];
    const otherCandidate = (optionsResult.json?.candidates ?? []).find(
      (candidate) => candidate.id !== currentResponsibleId,
    );
    const reasonNoteFor = (r) =>
      r?.isFreetext ? 'Smoke M03: bàn giao người chịu trách nhiệm' : undefined;

    if (detailBefore.status === 200 && reason && version != null) {
      // Guard: khóa lạc quan — version cũ → 409 RECORD_VERSION_CONFLICT.
      const stale = await call('PATCH', `/assets/${first.id}/responsible`, {
        token: admin.token,
        headers: { 'Idempotency-Key': randomUUID() },
        body: {
          responsibleUserId: (otherCandidate ?? { id: currentResponsibleId }).id,
          reasonCodeId: reason.id,
          reasonNote: reasonNoteFor(reason),
          profileVersion: version + 999,
        },
      });
      check(
        'version cũ → 409 RECORD_VERSION_CONFLICT',
        stale.status === 409 && stale.json?.code === 'RECORD_VERSION_CONFLICT',
        `status=${stale.status} code=${stale.json?.code ?? ''}`,
      );

      // Guard: chọn lại chính người hiện tại → 400 (RESPONSIBLE_UNCHANGED → VALIDATION_FAILED).
      const unchanged = await call('PATCH', `/assets/${first.id}/responsible`, {
        token: admin.token,
        headers: { 'Idempotency-Key': randomUUID() },
        body: {
          responsibleUserId: currentResponsibleId,
          reasonCodeId: reason.id,
          reasonNote: reasonNoteFor(reason),
          profileVersion: version,
        },
      });
      check(
        'chọn lại người hiện tại → 400 VALIDATION_FAILED',
        unchanged.status === 400 && unchanged.json?.code === 'VALIDATION_FAILED',
        `status=${unchanged.status} code=${unchanged.json?.code ?? ''}`,
      );

      // Happy path: đổi sang người khác nếu location có ứng viên thứ hai đủ vai trò.
      if (otherCandidate) {
        const changeKey = randomUUID();
        const changeBody = {
          responsibleUserId: otherCandidate.id,
          reasonCodeId: reason.id,
          reasonNote: reasonNoteFor(reason),
          profileVersion: version,
        };
        const changed = await call('PATCH', `/assets/${first.id}/responsible`, {
          token: admin.token,
          headers: { 'Idempotency-Key': changeKey },
          body: changeBody,
        });
        check(
          'đổi người chịu trách nhiệm: 200 + đúng người + tăng version',
          changed.status === 200 &&
            changed.json?.responsibleUserId === otherCandidate.id &&
            changed.json?.profileVersion === version + 1,
          `status=${changed.status} code=${changed.json?.code ?? ''}`,
        );
        const replay = await call('PATCH', `/assets/${first.id}/responsible`, {
          token: admin.token,
          headers: { 'Idempotency-Key': changeKey },
          body: changeBody,
        });
        check(
          'gửi lại cùng khóa: không tăng version lần hai',
          replay.status === 200 &&
            replay.json?.profileVersion === changed.json?.profileVersion,
          `status=${replay.status} code=${replay.json?.code ?? ''}`,
        );
        const afterDetail = await call('GET', `/assets/${first.id}`, {
          token: admin.token,
        });
        check(
          'timeline có sự kiện asset.responsible.changed',
          (afterDetail.json?.timeline ?? []).some(
            (event) => event.eventCode === 'asset.responsible.changed',
          ),
        );
      } else {
        console.log(
          '  • location của tài sản seed chỉ có một người đủ vai trò → đã kiểm 2 guard, bỏ qua happy-path. Seed thêm Location Manager cùng location để test bàn giao đầy đủ.',
        );
      }
    } else {
      check(
        'chuẩn bị dữ liệu AST-05 (reason PROFILE_EDIT + version)',
        false,
        `reasons=${(optionsResult.json?.reasons ?? []).length} version=${version}`,
      );
    }
  }

  console.log('\n[UC-AST-11] Đưa vào / ngừng sử dụng');
  if (first) {
    const lcOptions = await call(
      'GET',
      `/assets/${first.id}/lifecycle-options`,
      { token: admin.token },
    );
    check(
      'GET lifecycle-options trả 200 + reasons',
      lcOptions.status === 200 && Array.isArray(lcOptions.json?.reasons),
      `status=${lcOptions.status} code=${lcOptions.json?.code ?? ''}`,
    );
    const lcReason =
      (lcOptions.json?.reasons ?? []).find((item) => !item.isFreetext) ??
      (lcOptions.json?.reasons ?? [])[0];
    const detail0 = await call('GET', `/assets/${first.id}`, {
      token: admin.token,
    });
    const status0 = detail0.json?.lifecycleStatus;
    const version0 = detail0.json?.profileVersion;
    const toggle = (status) => (status === 'IN_STORAGE' ? 'IN_USE' : 'IN_STORAGE');

    if (
      lcReason &&
      version0 != null &&
      (status0 === 'IN_STORAGE' || status0 === 'IN_USE')
    ) {
      const noteFor = (r) =>
        r.isFreetext ? 'Smoke M03: đổi trạng thái sử dụng' : undefined;
      // Guard EX.4: version cũ → 409.
      const stale = await call('PATCH', `/assets/${first.id}/lifecycle`, {
        token: admin.token,
        headers: { 'Idempotency-Key': randomUUID() },
        body: {
          targetStatus: toggle(status0),
          reasonCodeId: lcReason.id,
          reasonNote: noteFor(lcReason),
          profileVersion: version0 + 999,
        },
      });
      check(
        'version cũ → 409 RECORD_VERSION_CONFLICT',
        stale.status === 409 && stale.json?.code === 'RECORD_VERSION_CONFLICT',
        `status=${stale.status} code=${stale.json?.code ?? ''}`,
      );

      // Happy path: đổi sang trạng thái đối + replay, rồi đổi lại để giữ dữ liệu ổn định.
      const key1 = randomUUID();
      const body1 = {
        targetStatus: toggle(status0),
        reasonCodeId: lcReason.id,
        reasonNote: noteFor(lcReason),
        profileVersion: version0,
      };
      const flip = await call('PATCH', `/assets/${first.id}/lifecycle`, {
        token: admin.token,
        headers: { 'Idempotency-Key': key1 },
        body: body1,
      });
      check(
        'đổi trạng thái: 200 + đúng trạng thái đích + tăng version',
        flip.status === 200 &&
          flip.json?.lifecycleStatus === toggle(status0) &&
          flip.json?.profileVersion === version0 + 1,
        `status=${flip.status} code=${flip.json?.code ?? ''}`,
      );
      const replay = await call('PATCH', `/assets/${first.id}/lifecycle`, {
        token: admin.token,
        headers: { 'Idempotency-Key': key1 },
        body: body1,
      });
      check(
        'gửi lại cùng khóa: không tăng version lần hai',
        replay.status === 200 &&
          replay.json?.profileVersion === flip.json?.profileVersion,
        `status=${replay.status} code=${replay.json?.code ?? ''}`,
      );
      check(
        'timeline có sự kiện asset.lifecycle.changed',
        await call('GET', `/assets/${first.id}`, { token: admin.token }).then(
          (d) =>
            (d.json?.timeline ?? []).some(
              (e) => e.eventCode === 'asset.lifecycle.changed',
            ),
        ),
      );
      // Khôi phục trạng thái ban đầu (giữ dữ liệu seed ổn định cho lần chạy sau).
      const restore = await call('PATCH', `/assets/${first.id}/lifecycle`, {
        token: admin.token,
        headers: { 'Idempotency-Key': randomUUID() },
        body: {
          targetStatus: status0,
          reasonCodeId: lcReason.id,
          reasonNote: noteFor(lcReason),
          profileVersion: (flip.json?.profileVersion ?? version0 + 1),
        },
      });
      check(
        'đổi lại trạng thái ban đầu để giữ dữ liệu ổn định',
        restore.status === 200 && restore.json?.lifecycleStatus === status0,
        `status=${restore.status} code=${restore.json?.code ?? ''}`,
      );
    } else {
      check(
        'chuẩn bị dữ liệu AST-11 (reason USE_STATUS_CHANGE + trạng thái đổi tay được)',
        false,
        `reasons=${(lcOptions.json?.reasons ?? []).length} status=${status0}`,
      );
    }
  }

  console.log('\n[UC-AST-08] Hồ sơ chi tiết và timeline');
  for (const asset of seededAssets) {
    const detail = await call('GET', `/assets/${asset.id}`, {
      token: admin.token,
    });
    check(
      `${asset.assetCode}: tải chi tiết`,
      detail.status === 200 && detail.json?.id === asset.id,
      `status=${detail.status}`,
    );
    check(
      `${asset.assetCode}: có timeline tạo hồ sơ`,
      Array.isArray(detail.json?.timeline) &&
        detail.json.timeline.some(
          (event) => event.eventCode === 'asset.asset.created',
        ),
    );
    if (asset.id === first?.id) {
      check(
        `${asset.assetCode}: timeline có lần sửa mô tả`,
        detail.json.timeline.some(
          (event) => event.eventCode === 'asset.description.updated',
        ),
      );
    }
    check(
      `${asset.assetCode}: có financial cho vai trò platform`,
      detail.json?.financial !== null &&
        detail.json?.financial?.invoiceNo === asset.seed.invoiceNo,
    );
    check(
      `${asset.assetCode}: không phơi trường nội bộ`,
      !Object.hasOwn(detail.json ?? {}, 'qrToken') &&
        (detail.json?.timeline ?? []).every(
          (event) =>
            !Object.hasOwn(event.actor ?? {}, 'id') &&
            !Object.hasOwn(event, 'requestId') &&
            !Object.hasOwn(event, 'metadata'),
        ),
    );
    check(
      `${asset.assetCode}: documents có contract mảng`,
      Array.isArray(detail.json?.documents),
    );
  }

  const missingId = randomUUID();
  const missing = await call('GET', `/assets/${missingId}`, {
    token: admin.token,
  });
  check(
    'UUID không tồn tại → 404 NOT_FOUND',
    missing.status === 404 && missing.json?.code === 'NOT_FOUND',
    `status=${missing.status} code=${missing.json?.code ?? ''}`,
  );

  const malformed = await call('GET', '/assets/khong-phai-uuid', {
    token: admin.token,
  });
  check(
    'ID sai định dạng → 400 VALIDATION_FAILED',
    malformed.status === 400 && malformed.json?.code === 'VALIDATION_FAILED',
    `status=${malformed.status} code=${malformed.json?.code ?? ''}`,
  );

  console.log('\n[UC-AST-09/10] Đề nghị + duyệt huỷ hồ sơ');
  const cancelTarget = seededAssets[seededAssets.length - 1];
  if (cancelTarget) {
    const copts = await call(
      'GET',
      `/assets/${cancelTarget.id}/cancellation-options`,
      { token: admin.token },
    );
    check(
      'GET cancellation-options 200 + reasons',
      copts.status === 200 && Array.isArray(copts.json?.reasons),
      `status=${copts.status}`,
    );
    const cancelReason =
      (copts.json?.reasons ?? []).find((r) => !r.isFreetext) ??
      (copts.json?.reasons ?? [])[0];
    const queue = await call(
      'GET',
      '/asset-cancellations?status=PENDING&pageSize=100',
      { token: admin.token },
    );
    check(
      'GET asset-cancellations (hàng đợi) 200',
      queue.status === 200 && Array.isArray(queue.json?.items),
      `status=${queue.status}`,
    );

    if (cancelReason) {
      const existing = (queue.json?.items ?? []).find(
        (it) => it.assetId === cancelTarget.id,
      );
      if (existing) {
        console.log(
          `  • ${cancelTarget.assetCode} đã có đề nghị PENDING, bỏ qua tạo mới.`,
        );
      } else {
        const reqRes = await call(
          'POST',
          `/assets/${cancelTarget.id}/cancellation-request`,
          {
            token: admin.token,
            headers: { 'Idempotency-Key': randomUUID() },
            body: {
              reasonCodeId: cancelReason.id,
              reasonNote: cancelReason.isFreetext
                ? 'Smoke M03: hồ sơ trùng'
                : undefined,
            },
          },
        );
        if (reqRes.json?.code === 'NO_APPROVER_AVAILABLE') {
          check(
            'đề nghị huỷ: chặn NO_APPROVER_AVAILABLE khi chỉ có 1 Quản lý tài sản',
            reqRes.status === 409,
          );
          console.log(
            '  • Chỉ có 1 Quản lý tài sản → không test được duyệt chéo. Seed thêm 1 ASSET_MANAGER (platform) để test duyệt/từ chối đầy đủ.',
          );
        } else if (reqRes.status === 200 || reqRes.status === 201) {
          check('đề nghị huỷ tạo PENDING', reqRes.json?.status === 'PENDING');
          const self = await call(
            'POST',
            `/asset-cancellations/${reqRes.json.id}/decision`,
            {
              token: admin.token,
              headers: { 'Idempotency-Key': randomUUID() },
              body: { decision: 'APPROVE', expectedVersion: reqRes.json.version },
            },
          );
          check(
            'tự duyệt đề nghị của mình → 403 SELF_APPROVAL_FORBIDDEN',
            self.status === 403 && self.json?.code === 'SELF_APPROVAL_FORBIDDEN',
            `status=${self.status} code=${self.json?.code ?? ''}`,
          );
          console.log(
            `  • Đã tạo đề nghị PENDING cho ${cancelTarget.assetCode}; cần Quản lý tài sản KHÁC duyệt/từ chối trên /asset-cancellations.`,
          );
        } else {
          check(
            'đề nghị huỷ',
            false,
            `status=${reqRes.status} code=${reqRes.json?.code ?? ''}`,
          );
        }
      }
    }

    const badDecision = await call(
      'POST',
      `/asset-cancellations/${randomUUID()}/decision`,
      {
        token: admin.token,
        headers: { 'Idempotency-Key': randomUUID() },
        body: { decision: 'MAYBE', expectedVersion: 1 },
      },
    );
    check(
      'decision ngoài miền → 400',
      badDecision.status === 400,
      `status=${badDecision.status} code=${badDecision.json?.code ?? ''}`,
    );
  }

  console.log('\n[Scope Location Manager — tùy chọn]');
  if (!LOCATION_EMAIL || !LOCATION_PASSWORD) {
    console.log(
      '  • thiếu SMOKE_LOCATION_EMAIL/SMOKE_LOCATION_PASSWORD → bỏ qua nhánh scope; phần platform vẫn đã chạy.',
    );
  } else {
    const locationUser = await login(
      LOCATION_EMAIL,
      LOCATION_PASSWORD,
      'Location Manager',
    );
    if (locationUser) {
      const scopedList = await call(
        'GET',
        queryPath({ search: SEED_PREFIX, pageSize: 100 }),
        { token: locationUser.token },
      );
      check(
        'Location Manager gọi danh sách thành công',
        scopedList.status === 200,
        `status=${scopedList.status} code=${scopedList.json?.code ?? ''}`,
      );
      const scopedItems = scopedList.json?.items ?? [];
      if (scopedItems[0]) {
        const scopedDetail = await call('GET', `/assets/${scopedItems[0].id}`, {
          token: locationUser.token,
        });
        check(
          'Location Manager xem tài sản trong scope nhưng không thấy financial',
          scopedDetail.status === 200 && scopedDetail.json?.financial === null,
          `status=${scopedDetail.status}`,
        );
      } else {
        console.log(
          '  • tài khoản Location Manager không trùng location của seed → không có asset trong scope để kiểm financial.',
        );
      }

      const visibleIds = new Set(scopedItems.map((item) => item.id));
      const outside = seededAssets.find((asset) => !visibleIds.has(asset.id));
      if (outside) {
        const outsideDetail = await call('GET', `/assets/${outside.id}`, {
          token: locationUser.token,
        });
        check(
          'tài sản ngoài scope → 404 NOT_FOUND, không lộ hồ sơ',
          outsideDetail.status === 404 &&
            outsideDetail.json?.code === 'NOT_FOUND',
          `status=${outsideDetail.status} code=${outsideDetail.json?.code ?? ''}`,
        );
      } else {
        console.log(
          '  • Location Manager thấy toàn bộ seed hiện có → chưa có mẫu ngoài scope để kiểm 404.',
        );
      }
    }
  }

  console.log('\n[Kết quả]');
  if (failures.length > 0) {
    console.error(`✗ ${failures.length} mục FAIL: ${failures.join(', ')}`);
    process.exit(1);
  }

  console.log(
    `✓ Smoke M03 PASS. Đã giữ lại ${seededAssets.length} tài sản mẫu; mở http://localhost:5175/assets để manual test.`,
  );
  for (const asset of seededAssets) {
    console.log(
      `  • ${asset.assetCode} — ${asset.name} — ${asset.seed.location.name}`,
    );
  }
}

main().catch((error) => {
  console.error('Lỗi không mong đợi:', error);
  process.exit(1);
});

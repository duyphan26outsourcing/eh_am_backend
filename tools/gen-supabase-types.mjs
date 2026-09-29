/**
 * Sinh lại `src/supabase/database.types.ts` từ schema Supabase.
 *
 * Chạy: `npm run gen:types`
 * Đối chiếu (không ghi): `npm run kiem:types -- --project=<ref>`
 *
 * ============================================================================
 * VÌ SAO PHẢI QUA SCRIPT NÀY, KHÔNG DÙNG `>` TRỰC TIẾP
 * ============================================================================
 * Supabase CLI xuất UTF-8 ra stdout. Nhưng toán tử `>` của **PowerShell 5.1**
 * (shell mặc định trên máy Windows của đội này) ghi file ở **UTF-16LE**, nên câu
 * lệnh quen dùng:
 *
 *     npx supabase gen types typescript --project-id <id> --schema public \
 *       > src/supabase/database.types.ts
 *
 * luôn cho ra file UTF-16LE. Hệ quả: ESLint coi file là nhị phân ("File appears to
 * be binary"), `type Database` không parse được, và mọi service dùng Supabase bị
 * báo hàng loạt lỗi giả "unsafe error typed value" — một triệu chứng không hề trỏ
 * về nguyên nhân.
 *
 * `Out-File -Encoding utf8` và `Set-Content -Encoding utf8` của PS 5.1 cũng không
 * đúng: chúng thêm BOM, trong khi mọi file .ts khác của repo là UTF-8 **không BOM**,
 * kết thúc dòng **LF**.
 *
 * Node ghi UTF-8 không BOM nên chạy qua đây là hết phụ thuộc vào shell: cmd,
 * PowerShell hay git bash đều cho cùng một kết quả byte-for-byte.
 * ============================================================================
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const OUT_FILE = resolve('src/supabase/database.types.ts');

/**
 * ⚠️ VÌ SAO VIẾT BỘ ĐỌC `.env` RIÊNG, KHÔNG DÙNG `dotenv`
 *
 * `dotenv` **có** trong `node_modules` nhưng chỉ là dependency **gián tiếp** (qua
 * `@nestjs/config`), không khai trực tiếp trong `package.json`. Một công cụ build
 * dựa vào dep gián tiếp là chỗ hỏng chờ sẵn: `npm dedupe` hay một lần nâng
 * `@nestjs/config` có thể làm nó biến mất, và lúc đó script chết vì một lý do
 * chẳng liên quan gì tới nó.
 *
 * ⚠️ VÀ BỘ ĐỌC PHẢI CHỊU ĐƯỢC `KHOÁ ="giá trị"` — CÓ DẤU CÁCH TRƯỚC `=`
 *
 * Một bộ đọc cắt theo `=` mà không `trim()` khoá sẽ tạo ra biến tên
 * `"SUPABASE_URL "` — tra `SUPABASE_URL` thì không thấy, và **không lỗi nào xuất
 * hiện**. Nên `trim()` cả khoá lẫn giá trị, và bỏ cặp nháy bọc ngoài.
 */
function docEnv(duong) {
  if (!existsSync(duong)) return {};
  const ra = {};
  for (const dong of readFileSync(duong, 'utf8').split(/\r?\n/)) {
    const t = dong.trim();
    if (t === '' || t.startsWith('#')) continue;
    const i = t.indexOf('=');
    if (i < 0) continue;
    const khoa = t.slice(0, i).trim();
    let gia = t.slice(i + 1).trim();
    if (
      (gia.startsWith('"') && gia.endsWith('"')) ||
      (gia.startsWith("'") && gia.endsWith("'"))
    ) {
      gia = gia.slice(1, -1);
    }
    if (khoa) ra[khoa] = gia;
  }
  return ra;
}

const argEnv = process.argv
  .find((a) => a.startsWith('--env='))
  ?.slice('--env='.length);
const ENV_FILE = resolve(argEnv || '.env');
const envLocal = docEnv(ENV_FILE);

/**
 * Thứ tự ưu tiên: `--project=<ref>` → biến của shell → `.env` → dừng có báo lỗi.
 *
 * ⚠️ Cờ `--project=` đứng **trên** `.env`, và đó là chủ ý: một phép đối chiếu mà
 * đích của nó phụ thuộc tệp cấu hình đang có trên máy thì không đối chiếu được gì.
 *
 * ⚠️ Cờ `--project=` cũng có vì **PowerShell không nhận `VAR=x cmd`** — cú pháp đó
 * chỉ chạy ở bash.
 */
const argProject = process.argv
  .find((a) => a.startsWith('--project='))
  ?.slice('--project='.length);

/**
 * ⚠️ NGUỒN CHÍNH TỪ `.env` LÀ **`SUPABASE_URL`**, KHÔNG PHẢI `SUPABASE_PROJECT_ID`
 *
 * `SUPABASE_URL` có dạng `https://<ref>.supabase.co` và là thứ app **thật sự nối
 * tới**. Suy `<ref>` từ nó nghĩa là: types luôn mô tả schema của **đúng database mà
 * app sẽ nối tới**, và không còn giá trị nào phải nhớ đồng bộ ở hai chỗ.
 *
 * Nếu thay vào đó đọc một biến `SUPABASE_PROJECT_ID` riêng, thì mỗi lần copy `.env`
 * giữa các môi trường là một cơ hội để hai giá trị lệch nhau — và khi lệch, types
 * mô tả schema của project KHÁC với project app nối tới, không có gì báo lỗi lúc chạy.
 */
const urlRef = /https?:\/\/([a-z0-9]+)\.supabase\./.exec(
  envLocal.SUPABASE_URL ?? '',
)?.[1];

/**
 * ⚠️ NẾU `SUPABASE_PROJECT_ID` VẪN CÒN MÀ **LỆCH** `SUPABASE_URL` THÌ DỪNG,
 * KHÔNG TỰ CHỌN MỘT BÊN
 *
 * Tự chọn bên nào cũng là đoán ý người viết `.env`. Hai giá trị mâu thuẫn nghĩa là
 * tệp đó **đang sai** — và cách đúng là nói ra, không phải chọn hộ rồi đi tiếp.
 */
if (
  !argProject &&
  !process.env.SUPABASE_PROJECT_ID &&
  urlRef &&
  envLocal.SUPABASE_PROJECT_ID &&
  envLocal.SUPABASE_PROJECT_ID !== urlRef
) {
  console.error(
    `\n✖ LỆCH PROJECT trong ${relative(process.cwd(), ENV_FILE)}:\n` +
      `    SUPABASE_URL        → ${urlRef}\n` +
      `    SUPABASE_PROJECT_ID → ${envLocal.SUPABASE_PROJECT_ID}\n\n` +
      '  Hai giá trị này phải cùng một project. Lệch nghĩa là types sẽ mô tả schema của project KHÁC với project\n' +
      '  mà app nối tới — và không có gì báo lỗi lúc chạy.\n\n' +
      `  Cách sửa gọn nhất: XOÁ dòng SUPABASE_PROJECT_ID khỏi ${relative(process.cwd(), ENV_FILE)}.\n` +
      '  Script tự suy từ SUPABASE_URL, nên không cần khai lại.\n',
  );
  process.exit(1);
}

/**
 * Ưu tiên 5 — project development, dùng khi máy chưa có `.env`.
 *
 * ⚠️ ĐANG RỖNG VÌ PROJECT SUPABASE CỦA EVERY HALF CHƯA ĐƯỢC TẠO.
 *
 * Điền `<project-ref>` của project development vào đây sau khi tạo (lấy từ
 * `SUPABASE_URL`: `https://<project-ref>.supabase.co`). Để rỗng thì ưu tiên 5 không
 * áp dụng và script dừng có báo lỗi — an toàn hơn là đoán một project bất kỳ.
 */
const DEV_PROJECT_REF_MAC_DINH = '';

const NGUON = argProject
  ? { id: argProject, tu: 'cờ --project=' }
  : process.env.SUPABASE_PROJECT_ID
    ? {
        id: process.env.SUPABASE_PROJECT_ID,
        tu: 'biến shell SUPABASE_PROJECT_ID',
      }
    : urlRef
      ? { id: urlRef, tu: `${relative(process.cwd(), ENV_FILE)} → SUPABASE_URL` }
      : envLocal.SUPABASE_PROJECT_ID
        ? {
            id: envLocal.SUPABASE_PROJECT_ID,
            tu: `${relative(process.cwd(), ENV_FILE)} → SUPABASE_PROJECT_ID`,
          }
        : DEV_PROJECT_REF_MAC_DINH
          ? {
              id: DEV_PROJECT_REF_MAC_DINH,
              tu: 'mặc định trong tools/gen-supabase-types.mjs (development)',
            }
          : null;

/**
 * ⚠️ THÀ DỪNG HƠN LÀ ĐOÁN
 *
 * Khi không nguồn nào cho ra project ref, một mặc định "cho chạy được" sẽ sinh types
 * từ một database mà người chạy không hề chọn — và không có gì báo lỗi cho tới lúc
 * mã gọi một cột không tồn tại trên production.
 */
if (!NGUON) {
  console.error(
    `\n✖ KHÔNG XÁC ĐỊNH ĐƯỢC PROJECT SUPABASE.\n\n` +
      `  Đã tìm theo 5 mức ưu tiên: cờ --project= → biến shell SUPABASE_PROJECT_ID →\n` +
      `  ${relative(process.cwd(), ENV_FILE)} → SUPABASE_URL → SUPABASE_PROJECT_ID → mặc định trong script.\n\n` +
      '  Cách sửa (chọn một):\n' +
      '    · điền SUPABASE_URL vào .env  (copy từ .env.example) ← đường dùng hằng ngày\n' +
      '    · npm run gen:types -- --project=<project-ref>\n' +
      '    · điền DEV_PROJECT_REF_MAC_DINH ở đầu tools/gen-supabase-types.mjs\n',
  );
  process.exit(1);
}

const PROJECT_ID = NGUON.id;
const SCHEMA =
  process.env.SUPABASE_TYPES_SCHEMA ??
  envLocal.SUPABASE_TYPES_SCHEMA ??
  'public';

/** Chuỗi bắt buộc phải có trong output hợp lệ. */
const REQUIRED_MARKERS = ['export type Json', 'Database', 'public:'];
/**
 * Ngưỡng tối thiểu, chống ghi đè file thật bằng một output cụt (lỗi xác thực hoặc
 * mất mạng thường cho ra output gần như rỗng).
 *
 * ⚠️ ĐÂY LÀ ĐIỂM KHÁC CÁC BẢN GỐC (FDI.Today 50.000, Avantily 8.000), VÀ LÀ CHỦ Ý.
 *
 * Schema Every Half lúc khởi tạo chỉ có 3 bảng (migration 01) — bản sinh ra khoảng 7–8 KB,
 * tức NGAY SÁT ngưỡng 8 KB của Avantily. Giữ 8 KB thì **lần chạy hợp lệ đầu tiên** có thể
 * thất bại — một phép kiểm chặn đúng thứ nó phải cho qua. 4 KB vẫn đủ phân biệt với output
 * cụt của lỗi xác thực/mất mạng (thường dưới 1 KB).
 *
 * 👉 NÂNG LÊN khi schema đã có đủ các module nghiệp vụ (ví dụ 30_000). Lúc đó một output
 *    vài KB chắc chắn là lỗi, không phải schema thật.
 */
const MINIMUM_BYTES = 4_000;

function fail(message) {
  console.error(`\n✖ ${message}`);
  console.error('  Không ghi file — bản types hiện tại được giữ nguyên.\n');
  process.exit(1);
}

/**
 * ⚠️ IN RÕ **NGUỒN** CỦA `PROJECT_ID`
 *
 * `.env` do NestJS nạp lúc **app chạy** (`ConfigModule.forRoot`). Một script
 * `node tools/*.mjs` là tiến trình rời — nó tự đọc `.env` ở trên, nhưng người chạy
 * không có cách nào biết giá trị cuối cùng đến từ đâu nếu không in ra. Một dòng
 * log, và nó biến một sai lệch im lặng thành thứ đọc được ngay.
 */
console.log(
  `Sinh types từ project ${PROJECT_ID}, schema ${SCHEMA}\n` +
    `  nguồn project id : ${NGUON.tu}\n` +
    `  tệp env đã đọc   : ${existsSync(ENV_FILE) ? relative(process.cwd(), ENV_FILE) : '(không có)'}\n` +
    (urlRef ? `  SUPABASE_URL trỏ : ${urlRef}\n` : '') +
    'Cần đăng nhập trước: npx supabase login, hoặc đặt SUPABASE_ACCESS_TOKEN.',
);

const result = spawnSync(
  'npx',
  [
    '--yes',
    'supabase',
    'gen',
    'types',
    'typescript',
    '--project-id',
    PROJECT_ID,
    '--schema',
    SCHEMA,
  ],
  {
    encoding: 'utf8',
    maxBuffer: 128 * 1024 * 1024,
    // Windows cần shell để phân giải `npx`; stdout vẫn được Node đọc trực tiếp nên
    // shell không can thiệp vào encoding.
    shell: true,
  },
);

if (result.error) {
  fail(`Không chạy được Supabase CLI: ${result.error.message}`);
}
if (result.status !== 0) {
  fail(
    `Supabase CLI thoát với mã ${result.status}.\n` +
      `  stderr: ${(result.stderr || '').trim() || '(rỗng)'}`,
  );
}

// Chuẩn hóa về LF cho khớp phần còn lại của repo.
const types = (result.stdout ?? '').replace(/\r\n/g, '\n');

if (Buffer.byteLength(types, 'utf8') < MINIMUM_BYTES) {
  fail(
    `Output chỉ ${Buffer.byteLength(types, 'utf8')} byte, ngắn bất thường ` +
      `(ngưỡng ${MINIMUM_BYTES}). Thường là lỗi xác thực hoặc mất mạng.`,
  );
}
const missing = REQUIRED_MARKERS.filter((marker) => !types.includes(marker));
if (missing.length > 0) {
  fail(`Output thiếu dấu hiệu của types hợp lệ: ${missing.join(', ')}.`);
}

/**
 * ============================================================================
 * CHẾ ĐỘ `--check`: SO SÁNH, KHÔNG GHI
 * ============================================================================
 *
 * Dùng trước khi deploy: sinh types từ **project đích** rồi so với
 * `src/supabase/database.types.ts` đang commit. Cùng một bộ sinh cho hai bên, nên
 * khác nhau **chỉ có thể** là schema khác nhau. Nó phủ rộng hơn mọi ảnh chụp schema
 * gõ tay: types file mang cả bảng, cột, kiểu, **nullability**, enum, view và chữ ký
 * hàm — và không có ảnh chụp nào để lỗi thời.
 *
 * ⚠️ KHÔNG GHI FILE. Đây là điểm quan trọng nhất.
 *
 * `database.types.ts` là **đầu vào type-check cho mã đang deploy**, và mã đó được
 * viết + test trên schema của development. Ghi đè nó bằng bản sinh từ production là
 * đóng băng sai nguồn: nếu production chậm hơn dev một migration thì types mất cột
 * mới, và mã mới không compile — hoặc tệ hơn, compile với lỗ hổng kiểu.
 *
 * Nên: sinh → so → in ra chỗ lệch → **giữ nguyên** file đang commit.
 * ============================================================================
 */
if (process.argv.includes('--check')) {
  const dangCo = existsSync(OUT_FILE)
    ? readFileSync(OUT_FILE, 'utf8').replace(/\r\n/g, '\n')
    : null;

  if (dangCo === null) {
    fail(
      `Chưa có ${relative(process.cwd(), OUT_FILE)} để so. Chạy \`npm run gen:types\` trước.`,
    );
  }

  if (dangCo === types) {
    console.log(
      `\n✔ KHỚP — schema của project ${PROJECT_ID} giống hệt bản types đang commit.\n` +
        `  ${types.split('\n').length} dòng · ${Buffer.byteLength(types, 'utf8')} byte\n` +
        '  Không ghi file nào.\n',
    );
    process.exit(0);
  }

  /**
   * In **chỗ lệch**, không in cả file.
   *
   * ⚠️ Neo theo `bảng.cột`, không theo số dòng. Số dòng lệch một chỗ sẽ làm mọi dòng
   * sau đó trông như đã đổi — và lúc đó người đọc không tìm ra thứ thật sự khác. Một
   * phép kiểm ồn thì bị bỏ qua, và lúc đó một cột thiếu thật cũng trôi qua cùng.
   */
  const cotCuaFile = (noiDung) => {
    const ra = new Map();
    let bang = null;
    let trongRow = false;
    for (const dong of noiDung.split('\n')) {
      const mBang = /^ {6}([a-z_][a-z0-9_]*): \{$/.exec(dong);
      if (mBang) {
        bang = mBang[1];
        trongRow = false;
        continue;
      }
      if (/^ {8}Row: \{$/.test(dong)) {
        trongRow = true;
        continue;
      }
      if (/^ {8}(Insert|Update|Relationships):/.test(dong)) {
        trongRow = false;
        continue;
      }
      const mCot = /^ {10}([a-z_][a-z0-9_]*)\??: (.+)$/.exec(dong);
      if (trongRow && bang && mCot) {
        ra.set(`${bang}.${mCot[1]}`, mCot[2].trim());
      }
    }
    return ra;
  };

  const dev = cotCuaFile(dangCo);
  const dich = cotCuaFile(types);
  const thieuODich = [];
  const thuaODich = [];
  const lechKieu = [];

  for (const [khoa, kieu] of dev) {
    if (!dich.has(khoa)) thieuODich.push(khoa);
    else if (dich.get(khoa) !== kieu) {
      lechKieu.push(
        `${khoa}: commit=${kieu} / ${PROJECT_ID}=${dich.get(khoa)}`,
      );
    }
  }
  for (const khoa of dich.keys()) if (!dev.has(khoa)) thuaODich.push(khoa);

  const in_ = (nhan, ds) => {
    if (ds.length === 0) return;
    console.error(`\n${nhan} (${ds.length}):`);
    for (const x of ds.slice(0, 40)) console.error(`  ${x}`);
    if (ds.length > 40) console.error(`  … và ${ds.length - 40} dòng nữa`);
  };

  console.error(`\n✖ LỆCH — project ${PROJECT_ID} khác bản types đang commit.`);

  /**
   * ⚠️ HAI LOẠI LỆCH, VÀ CHỈ MỘT LOẠI CHẶN
   *
   * Cột **thừa** ở project đích là chuyện **bình thường** ngay sau một đợt migration
   * chưa kịp sinh lại types. Coi nó là FAIL ngang với cột thiếu sẽ làm cả bộ kiểm ồn
   * tới mức người vận hành học cách bỏ qua.
   */
  in_('❌ THIẾU ở project đích — mã sẽ gọi cột không tồn tại', thieuODich);
  in_('❌ LỆCH KIỂU / NULLABLE — mã hiểu sai dữ liệu', lechKieu);
  in_(
    '⚠️  THỪA ở project đích (ghi chú, KHÔNG chặn) — thường là types chưa sinh lại',
    thuaODich,
  );

  const chan = thieuODich.length + lechKieu.length;
  console.error(
    `\n${chan === 0 ? '✔' : '✖'} Kết luận: ${chan} lệch chặn · ${thuaODich.length} lệch chỉ ghi chú.\n` +
      (chan === 0
        ? '  Không có gì chặn deploy. Chạy `npm run gen:types` rồi commit để hết cả phần ghi chú.\n'
        : '  ⛔ Không deploy. Chạy migration còn thiếu trên project đích trước.\n'),
  );
  process.exit(chan === 0 ? 0 : 1);
}

// `writeFileSync` với utf8 KHÔNG thêm BOM — đúng quy ước của repo.
writeFileSync(OUT_FILE, types, { encoding: 'utf8' });

console.log(
  `\n✔ Đã ghi ${relative(process.cwd(), OUT_FILE)}\n` +
    `  ${types.split('\n').length} dòng · ` +
    `${Buffer.byteLength(types, 'utf8')} byte · UTF-8 không BOM · LF\n\n` +
    'Bước tiếp theo: npx tsc --noEmit && npx eslint src\n',
);

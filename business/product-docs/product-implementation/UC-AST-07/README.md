# UC-AST-07 — Tra cứu danh sách tài sản (kế hoạch kỹ thuật backend)

> UC đọc đầu tiên áp **biên phạm vi location**. Không ghi, không audit. Xuất Excel (AC.1) HOÃN
> (chờ hạ tầng kho tệp riêng tư, như ảnh tài sản).

## 1. Phạm vi

- RPC **`list_assets`** (migration 16): tìm không dấu (unaccent) trên name + asset_code + serial;
  lọc loại/trạng thái/tình trạng/location; phạm vi location vào dưới dạng mảng; `count(*) over()`.
- Route `GET /v1/assets` (controller riêng `AssetsDirectoryController`, chỉ `JwtAuthGuard`).
- Model/DTO/repository/service cho danh sách; phân trang `PaginatedResult`.

## 2. Phân quyền + biên dữ liệu (điểm cốt lõi)

- **Vì sao không `@RequireContext`:** endpoint danh sách không có location trong URL; guard không
  diễn tả được "có vai trò LOCATION trên bất kỳ location nào". Theo `access-scope.service.ts`, phân
  quyền + biên dữ liệu nằm ở service.
- `ASSET_LIST_SCOPE = { platformRoles: [ASSET_MANAGER, ASSET_ACCOUNTANT], locationRoles: [LOCATION_MANAGER] }`.
- `service.list`: `resolveLocationScope(user, rule)` →
  - platform → `allLocations=true` → truyền `p_location_ids = null` (mọi location).
  - location → `locationIds` → truyền mảng đó.
  - **rỗng** (không vai trò nào) → `throw ROLE_REQUIRED` (403, EX.1). Quản lý điểm luôn có ≥1 location
    nên "phạm vi rỗng ⟺ không đủ vai trò".
- **EX.2:** bộ lọc `locationId` do client chọn được GIAO với scope trong RPC
  (`primary_location_id = any(p_location_ids)` **và** `= p_location_id`) → lọc ngoài phạm vi trả rỗng,
  không lộ sự tồn tại. Phạm vi KHÔNG bao giờ nhận từ client.

## 3. Mapper theo người xem (BR-CMN-06)

`toAssetListItemModel`: phơi asset_code/name/serial/loại/location/người chịu trách nhiệm/trạng thái/
tình trạng. **Chưa phơi cột giá trị** (nguyên giá) ở GĐ1 (chưa có tài chính) — khi thêm phải tách
mapper cho vai trò được xem. Không phơi qr_token/cột nội bộ.

## 4. Test (TDD)

- Service: phạm vi rỗng → ROLE_REQUIRED (không gọi repo); platform → `locationIds=null` + map rows +
  sanitize keyword; location manager → truyền đúng mảng location.
- DTO: status/physicalCondition ngoài miền → VALUE_OUT_OF_DOMAIN; locationId sai UUID → INVALID_REFERENCE_ID.

## 5. Ngoài phạm vi

- Xuất Excel (AC.1) — chờ kho tệp riêng tư (§18) + audit `dsh.export` (BR-DSH-04).
- [TBD-2] cột mặc định / sắp xếp / số dòng mỗi trang — tạm: sắp theo created_at desc, pageSize 20.
- [TBD-3] EXECUTIVE/AUDITOR có được xem danh sách không — hiện CHƯA nằm trong allow-set (chờ chốt Q-16).

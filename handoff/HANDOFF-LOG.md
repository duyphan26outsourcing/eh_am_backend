# Sổ chuyển giao Codex ⇄ Claude Code

> Nơi hai bên bàn giao qua lại khi đổi agent (hết quota). **Luật:** trước khi dừng phiên, agent đang làm ghi **một entry mới lên ĐẦU** danh sách dưới (mới nhất trên cùng). Agent tiếp nhận đọc entry trên cùng + [HANDOFF-CODEX.md](../HANDOFF-CODEX.md) rồi làm tiếp.
>
> **Mẫu entry:**
> ```
> ## <ngày> — <Codex|Claude> → <bên nhận>
> - Vừa xong: <UC/việc + trạng thái tsc/eslint/test>
> - Duy đã manual test: <có/chưa, kết quả>
> - Migration cần Duy chạy: <file .sql hoặc "không">
> - Đang dở / chưa xong: <mô tả + file>
> - Làm tiếp: <UC/việc kế + gợi ý mẫu để copy>
> - Bẫy/lưu ý: <nếu có>
> ```

---

## 2026-09-30 — Claude → Codex
- Vừa xong: M02 UC-MDM-01/03/04/07/08 (BE code + FE), đều tsc/eslint/test xanh. Luồng NGỪNG (AC.2) cho cost center + lý do. Chi tiết trong [HANDOFF-CODEX.md](../HANDOFF-CODEX.md) mục 8.
- Duy đã manual test: 01/03/07/08 OK; 04 (cây loại tài sản) chờ xác nhận runtime.
- Migration cần Duy chạy/xác nhận: `02i_asset_types.sql` + `02j_asset_type_rpc.sql` + `npm run gen:types`, rồi chạy lại `tools/smoke-master-data.mjs` (lần trước phần cây loại tài sản trả 500 vì chưa chạy).
- Đang dở: không có UC nào code dở.
- Làm tiếp: **UC-MDM-05 (nhà cung cấp)** theo công thức mục 9 của HANDOFF-CODEX (copy mẫu `cost-centers`). Rồi UC-MDM-06, UC-IAM-05.
- Bẫy/lưu ý: đọc kỹ mục 7 (ràng buộc cứng): không sửa migration đã chạy, không hardcode creds, được sửa tay `database.types.ts` khi migration chưa chạy.

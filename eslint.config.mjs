// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      'eslint.config.mjs',
      // File sinh tự động bằng `npm run gen:types` — không sửa tay nên không lint.
      //
      // ⚠️ Giữ ignore này kể cả khi file trông "sạch": toán tử `>` của PowerShell 5.1
      // ghi ra UTF-16LE, và ESLint sẽ báo "File appears to be binary" — kéo theo hàng
      // trăm lỗi giả "unsafe error typed value" ở mọi service dùng Supabase, vì
      // `type Database` không parse được. `tools/gen-supabase-types.mjs` ghi bằng Node
      // (UTF-8 không BOM, LF) chính là để tránh chuyện đó; ignore ở đây là lớp thứ hai.
      'src/supabase/database.types.ts',
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        // ⚠️ KHÔNG khai `allowDefaultProject`.
        //
        // `tsconfig.json` đã `include: ["src/**/*", "test/**/*", "tools/**/*"]`, nên
        // `projectService` tìm thấy mọi file trong chính project. Khai thêm
        // `allowDefaultProject` cho những file **đã** nằm trong project làm ESLint báo
        // `was included by allowDefaultProject but also was found in the project service`
        // và **không lint được file nào** trong danh sách đó.
        //
        // Nếu sau này có file .ts nằm ngoài `include` mà vẫn cần lint thì thêm nó vào
        // `include` của tsconfig, đừng thêm vào `allowDefaultProject` — cách đó cho ESLint
        // và tsc cùng một cái nhìn về project.
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
    },
  },
  {
    // ========================================================================
    // TEST E2E — nới hai quy tắc về `any`
    // ========================================================================
    //
    // `supertest` khai `response.body` là `any`, nên mọi `expect(res.body.code)` bị
    // `no-unsafe-member-access` chặn.
    //
    // ⚠️ Vì sao nới thay vì ép kiểu ở từng chỗ: ép kiểu `res.body as ErrorResponse` trong
    // test là **nói với TypeScript điều mà test đang đi kiểm chứng**. Nếu backend trả sai hình
    // dạng thì ép kiểu che mất chính lỗi đó, và test vẫn xanh. Test phải nhìn phản hồi như
    // dữ liệu thô không tin trước — đúng cách frontend nhìn nó.
    //
    // ⚠️ Chỉ nới cho `test/`. Trong `src/` hai quy tắc này vẫn là lỗi.
    files: ['test/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
    },
  },
);

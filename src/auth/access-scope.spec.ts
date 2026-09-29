import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/supabase/database.types';
import {
  ContextType,
  PLATFORM_CONTEXT_ID,
  Role,
} from '@/utils/enums/role.enum';
import {
  LocationScopeRule,
  applyLocationScope,
  computeLocationScope,
} from './access-scope.service';

/**
 * Phạm vi location là biên bảo mật dữ liệu thay cho `tenant_id` — một lỗi ở đây là nhân viên
 * cửa hàng này thấy tài sản cửa hàng khác. Nên các nhánh "đọc lỏng" đều có phép thử riêng.
 */
describe('computeLocationScope', () => {
  const rule: LocationScopeRule = {
    platformRoles: [Role.ASSET_MANAGER],
    locationRoles: [Role.LOCATION_MANAGER, Role.LOCATION_STAFF],
  };

  const Q1 = '11111111-1111-4111-8111-111111111111';
  const Q3 = '33333333-3333-4333-8333-333333333333';

  it('vai trò toàn hệ thống phù hợp → thấy mọi location', () => {
    const scope = computeLocationScope(
      [
        {
          role_code: Role.ASSET_MANAGER,
          context_type: ContextType.PLATFORM,
          context_id: PLATFORM_CONTEXT_ID,
        },
      ],
      rule,
    );
    expect(scope).toEqual({ allLocations: true, locationIds: [] });
  });

  it('vai trò theo location → chỉ thấy đúng các location đó, không trùng lặp', () => {
    const scope = computeLocationScope(
      [
        {
          role_code: Role.LOCATION_MANAGER,
          context_type: ContextType.LOCATION,
          context_id: Q3,
        },
        {
          role_code: Role.LOCATION_STAFF,
          context_type: ContextType.LOCATION,
          context_id: Q1,
        },
        {
          role_code: Role.LOCATION_STAFF,
          context_type: ContextType.LOCATION,
          context_id: Q3,
        },
      ],
      rule,
    );
    expect(scope).toEqual({ allLocations: false, locationIds: [Q1, Q3] });
  });

  it('⚠️ không có vai trò nào → danh sách RỖNG (không thấy gì), không phải "thấy tất cả"', () => {
    expect(computeLocationScope([], rule)).toEqual({
      allLocations: false,
      locationIds: [],
    });
  });

  it('⚠️ vai trò location ghi nhầm lên PLATFORM → KHÔNG được hiểu thành "mọi location"', () => {
    const scope = computeLocationScope(
      [
        {
          role_code: Role.LOCATION_MANAGER,
          context_type: ContextType.PLATFORM,
          context_id: PLATFORM_CONTEXT_ID,
        },
      ],
      rule,
    );
    expect(scope).toEqual({ allLocations: false, locationIds: [] });
  });

  it('⚠️ vai trò không nằm trong quy tắc của loại dữ liệu này → bị bỏ qua', () => {
    const scope = computeLocationScope(
      [
        {
          role_code: Role.SYSTEM_ADMIN,
          context_type: ContextType.PLATFORM,
          context_id: PLATFORM_CONTEXT_ID,
        },
      ],
      rule,
    );
    expect(scope.allLocations).toBe(false);
  });
});

describe('applyLocationScope', () => {
  function fakeQuery() {
    const calls: Array<{ column: string; values: readonly string[] }> = [];
    const query = {
      in(column: string, values: readonly string[]) {
        calls.push({ column, values });
        return query;
      },
    };
    return { query, calls };
  }

  it('allLocations → không thêm bộ lọc', () => {
    const { query, calls } = fakeQuery();
    applyLocationScope(
      query,
      { allLocations: true, locationIds: [] },
      'location_id',
    );
    expect(calls).toEqual([]);
  });

  it('⚠️ danh sách rỗng VẪN áp `.in(col, [])` — không được bỏ qua bộ lọc', () => {
    const { query, calls } = fakeQuery();
    applyLocationScope(
      query,
      { allLocations: false, locationIds: [] },
      'location_id',
    );
    expect(calls).toEqual([{ column: 'location_id', values: [] }]);
  });

  it('kiểu dữ liệu tương thích với query builder thật của supabase-js', () => {
    // Chỉ dựng query, KHÔNG await — query builder của supabase-js chỉ gọi mạng khi được await,
    // nên phép thử này kiểm được kiểu mà không cần project Supabase.
    const client = createClient<Database>(
      'https://khong-ton-tai.supabase.co',
      'test-anon-key-khong-dung-that',
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    const query = client.from('audit_events').select('id, context_id');
    const scoped = applyLocationScope(
      query,
      { allLocations: false, locationIds: [] },
      'context_id',
    );
    expect(scoped).toBe(query);
  });
});

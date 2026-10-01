import { ErrorCode } from '@/common/i18n/error-code.const';
import {
  resolveGrantRoleInput,
  roleAssignmentStatus,
} from './employee-role-assignment';

describe('employee role assignment', () => {
  it('derives platform scope and Vietnam day boundaries on the server', () => {
    expect(
      resolveGrantRoleInput({
        roleCode: 'EXECUTIVE',
        contextIds: ['11111111-1111-4111-8111-111111111111'],
        effectiveFrom: '2026-10-03',
        effectiveTo: '2026-10-04',
      }),
    ).toMatchObject({
      contextIds: ['00000000-0000-0000-0000-000000000000'],
      effectiveFrom: '2026-10-03T00:00:00.000+07:00',
      effectiveTo: '2026-10-04T23:59:59.999+07:00',
    });
  });

  it('rejects system admin and more than one location for location staff', () => {
    expect(() =>
      resolveGrantRoleInput({
        roleCode: 'SYSTEM_ADMIN',
        contextIds: [],
        effectiveFrom: '2026-10-03',
      }),
    ).toThrow(
      expect.objectContaining({ code: ErrorCode.ROLE_NOT_ASSIGNABLE }) as Error,
    );
    expect(() =>
      resolveGrantRoleInput({
        roleCode: 'LOCATION_STAFF',
        contextIds: ['a', 'b'],
        effectiveFrom: '2026-10-03',
      }),
    ).toThrow(
      expect.objectContaining({ code: ErrorCode.VALIDATION_FAILED }) as Error,
    );
  });

  it('calculates assignment state using server time', () => {
    const now = new Date('2026-10-03T12:00:00.000Z');
    expect(
      roleAssignmentStatus(
        {
          effective_from: '2026-10-04T00:00:00Z',
          effective_to: null,
          revoked_by: null,
        },
        now,
      ),
    ).toBe('UPCOMING');
    expect(
      roleAssignmentStatus(
        {
          effective_from: '2026-10-01T00:00:00Z',
          effective_to: null,
          revoked_by: null,
        },
        now,
      ),
    ).toBe('ACTIVE');
    expect(
      roleAssignmentStatus(
        {
          effective_from: '2026-10-01T00:00:00Z',
          effective_to: '2026-10-02T00:00:00Z',
          revoked_by: null,
        },
        now,
      ),
    ).toBe('EXPIRED');
  });
});

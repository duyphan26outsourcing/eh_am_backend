import {
  normalizeEmployeeCode,
  normalizeEmployeeEmail,
  normalizeEmployeePhone,
  resolveInitialRoleContext,
} from './employee-normalization';

describe('employee normalization', () => {
  it('normalizes email, employee code and Vietnamese phone', () => {
    expect(normalizeEmployeeEmail('  A@Example.COM ')).toBe('a@example.com');
    expect(normalizeEmployeeCode(' eh_01 ')).toBe('EH_01');
    expect(normalizeEmployeePhone('+84 901-234-567')).toBe('0901234567');
    expect(normalizeEmployeePhone('84901234567')).toBe('0901234567');
  });

  it('maps location and platform roles to the only valid context', () => {
    expect(resolveInitialRoleContext('LOCATION_STAFF', 'location-id')).toEqual({
      contextType: 'LOCATION',
      contextId: 'location-id',
    });
    expect(resolveInitialRoleContext('AUDITOR', 'location-id')).toEqual({
      contextType: 'PLATFORM',
      contextId: '00000000-0000-0000-0000-000000000000',
    });
  });

  it('rejects SYSTEM_ADMIN and unknown roles', () => {
    expect(() =>
      resolveInitialRoleContext('SYSTEM_ADMIN', 'location-id'),
    ).toThrow();
    expect(() => resolveInitialRoleContext('OWNER', 'location-id')).toThrow();
  });
});

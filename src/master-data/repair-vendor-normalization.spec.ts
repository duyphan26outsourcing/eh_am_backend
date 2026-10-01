import {
  normalizeRepairVendorPhone,
  normalizeServiceTypes,
} from './repair-vendor-normalization';

describe('repair vendor normalization', () => {
  it('chuẩn hoá số +84 và bỏ ký tự trình bày', () => {
    expect(normalizeRepairVendorPhone('+84 901-234-567')).toBe('0901234567');
  });

  it('loại service type trùng và giữ thứ tự nghiệp vụ', () => {
    expect(normalizeServiceTypes(['WARRANTY', 'REPAIR', 'REPAIR'])).toEqual([
      'REPAIR',
      'WARRANTY',
    ]);
  });
});

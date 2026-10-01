import { AppException } from '@/common/exceptions/app.exception';
import { requireIdempotencyKey } from './idempotency-key';

describe('requireIdempotencyKey', () => {
  it('trả nguyên UUID v4 hợp lệ', () => {
    const key = '11111111-1111-4111-8111-111111111111';
    expect(requireIdempotencyKey(key)).toBe(key);
  });

  it.each([
    undefined,
    '',
    'not-a-uuid',
    '11111111-1111-1111-8111-111111111111',
  ])('từ chối Idempotency-Key không hợp lệ: %s', (value) => {
    expect(() => requireIdempotencyKey(value)).toThrow(AppException);
  });
});

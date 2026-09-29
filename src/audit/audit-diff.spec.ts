import { diffFields } from './audit-diff';

/**
 * `diffFields` là phần "Trước/Sau" của nguyên tắc "không bao giờ xoá lịch sử". Nó ghi vào
 * một bảng không sửa được, nên mọi sai sót của nó là sai sót vĩnh viễn — đáng một bộ test
 * riêng dù hàm ngắn.
 */
describe('diffFields', () => {
  type AssetLike = {
    status: string;
    location_id: string | null;
    note?: string | null;
    meta?: Record<string, unknown>;
    received_at?: Date | string | null;
    secret_path?: string;
  };

  it('tạo mới (before = null): mọi trường có giá trị hiện from = null', () => {
    const changes = diffFields<AssetLike>(
      null,
      { status: 'IN_STOCK', location_id: 'kho-1' },
      ['status', 'location_id'],
    );

    expect(changes).toEqual({
      status: { from: null, to: 'IN_STOCK' },
      location_id: { from: null, to: 'kho-1' },
    });
  });

  it('chỉ ghi trường thật sự đổi', () => {
    const changes = diffFields<AssetLike>(
      { status: 'IN_TRANSIT', location_id: 'kho-1' },
      { status: 'IN_USE', location_id: 'kho-1' },
      ['status', 'location_id'],
    );

    expect(changes).toEqual({ status: { from: 'IN_TRANSIT', to: 'IN_USE' } });
  });

  it('⚠️ không đổi gì → null (không phải {}), để service chặn được dòng audit rỗng', () => {
    const changes = diffFields<AssetLike>(
      { status: 'IN_USE', location_id: 'q1' },
      { status: 'IN_USE', location_id: 'q1' },
      ['status', 'location_id'],
    );

    expect(changes).toBeNull();
  });

  it('⚠️ undefined và null coi là bằng nhau (cập nhật một phần không sinh thay đổi giả)', () => {
    const changes = diffFields<AssetLike>(
      { status: 'IN_USE', location_id: 'q1', note: null },
      { status: 'IN_USE', location_id: 'q1', note: undefined },
      ['status', 'location_id', 'note'],
    );

    expect(changes).toBeNull();
  });

  it('⚠️ object cùng giá trị nhưng khác thứ tự khoá → không phải thay đổi', () => {
    const changes = diffFields<AssetLike>(
      {
        status: 'IN_USE',
        location_id: 'q1',
        meta: { a: 1, b: { x: 1, y: 2 } },
      },
      {
        status: 'IN_USE',
        location_id: 'q1',
        meta: { b: { y: 2, x: 1 }, a: 1 },
      },
      ['meta'],
    );

    expect(changes).toBeNull();
  });

  it('Date được ghi dưới dạng chuỗi ISO', () => {
    const changes = diffFields<AssetLike>(
      { status: 'IN_TRANSIT', location_id: 'q1', received_at: null },
      {
        status: 'IN_TRANSIT',
        location_id: 'q1',
        received_at: new Date('2026-10-01T02:30:00.000Z'),
      },
      ['received_at'],
    );

    expect(changes).toEqual({
      received_at: { from: null, to: '2026-10-01T02:30:00.000Z' },
    });
  });

  it('⚠️ trường KHÔNG có trong allow-list thì không bao giờ vào lịch sử', () => {
    const changes = diffFields<AssetLike>(
      { status: 'IN_USE', location_id: 'q1', secret_path: 'a' },
      { status: 'IN_USE', location_id: 'q1', secret_path: 'b' },
      ['status', 'location_id'],
    );

    expect(changes).toBeNull();
  });
});

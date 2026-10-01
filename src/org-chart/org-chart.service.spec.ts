import { OrgChartService } from './org-chart.service';

describe('OrgChartService', () => {
  const base = {
    id: 'a',
    display_name: 'An',
    employee_code: 'EH001',
    job_title: 'Quản lý',
    status: 'ACTIVE',
    manager_id: null,
    primary_location_id: 'loc-1',
    location_code: 'OFFICE',
    location_name: 'Văn phòng',
    location_type: 'OFFICE',
    department_id: 'dep-1',
    department_code: 'OPS',
    department_name: 'Vận hành',
  };

  const setup = (rows: Record<string, unknown>[]) =>
    new OrgChartService({
      findVisibleProfiles: jest.fn().mockResolvedValue(rows),
    } as never);

  it('builds the reporting tree and preserves non-active visible statuses', async () => {
    const service = setup([
      base,
      {
        ...base,
        id: 'b',
        display_name: 'Bình',
        employee_code: 'EH002',
        manager_id: 'a',
        status: 'SUSPENDED',
      },
      {
        ...base,
        id: 'c',
        display_name: 'Chi',
        employee_code: 'EH003',
        manager_id: 'b',
        status: 'PENDING_ACTIVATION',
      },
    ]);

    const result = await service.getChart();

    expect(result.root.children[0]).toMatchObject({
      id: 'a',
      children: [
        {
          id: 'b',
          status: 'SUSPENDED',
          children: [{ id: 'c', status: 'PENDING_ACTIVATION' }],
        },
      ],
    });
    expect(JSON.stringify(result)).not.toContain('work_email');
    expect(JSON.stringify(result)).not.toContain('phone');
  });

  it('moves every cycle member to issues and keeps the healthy tree', async () => {
    const service = setup([
      base,
      { ...base, id: 'b', display_name: 'Bình', manager_id: 'c' },
      { ...base, id: 'c', display_name: 'Chi', manager_id: 'b' },
    ]);

    const result = await service.getChart();

    expect(result.root.children.map((node) => node.id)).toEqual(['a']);
    expect(result.issues.find((item) => item.id === 'b')?.reasons).toContain(
      'MANAGER_CYCLE',
    );
    expect(result.issues.find((item) => item.id === 'c')?.reasons).toContain(
      'MANAGER_CYCLE',
    );
  });

  it('flags active profiles missing manager or a valid work unit', async () => {
    const service = setup([
      {
        ...base,
        department_id: null,
        department_code: null,
        department_name: null,
      },
      { ...base, id: 'b', display_name: 'Bình', manager_id: 'missing' },
      {
        ...base,
        id: 'c',
        display_name: 'Chi',
        status: 'SUSPENDED',
        manager_id: null,
        primary_location_id: null,
      },
    ]);

    const result = await service.getChart();

    expect(result.issues.find((item) => item.id === 'a')?.reasons).toEqual(
      expect.arrayContaining(['MANAGER_MISSING', 'WORK_UNIT_MISSING']),
    );
    expect(result.issues.find((item) => item.id === 'b')?.reasons).toContain(
      'MANAGER_UNAVAILABLE',
    );
    expect(result.issues.some((item) => item.id === 'c')).toBe(false);
  });
});

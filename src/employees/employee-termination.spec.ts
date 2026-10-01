import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TerminateEmployeeDto } from './dto/terminate-employee.dto';

describe('TerminateEmployeeDto (UC-IAM-13)', () => {
  it('accepts the current no-asset handover contract', () => {
    const dto = plainToInstance(TerminateEmployeeDto, {
      profileVersion: 4,
      newManagerId: '11111111-1111-4111-8111-111111111111',
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
      reasonNote: 'Nghỉ theo nguyện vọng',
      assetTransfers: [],
    });
    expect(validateSync(dto)).toHaveLength(0);
  });

  it('rejects malformed references and missing assetTransfers', () => {
    const dto = plainToInstance(TerminateEmployeeDto, {
      profileVersion: 0,
      newManagerId: 'bad',
      reasonCodeId: 'bad',
    });
    expect(validateSync(dto).length).toBeGreaterThanOrEqual(4);
  });
});

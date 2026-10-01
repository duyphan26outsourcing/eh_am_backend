import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { TerminateEmployeeDto } from './dto/terminate-employee.dto';

describe('TerminateEmployeeDto (UC-IAM-13)', () => {
  it('accepts asset handovers with valid references', () => {
    const dto = plainToInstance(TerminateEmployeeDto, {
      profileVersion: 4,
      newManagerId: '11111111-1111-4111-8111-111111111111',
      reasonCodeId: '22222222-2222-4222-8222-222222222222',
      reasonNote: 'Nghỉ theo nguyện vọng',
      assetTransfers: [
        {
          assetId: '33333333-3333-4333-8333-333333333333',
          newResponsibleUserId: '44444444-4444-4444-8444-444444444444',
        },
      ],
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

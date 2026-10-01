import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseAuthService } from '@/supabase/supabase-auth.service';
import { AuditService } from '@/audit/audit.service';
import { I18nService } from '@/common/i18n/i18n.service';
import { AccessScopeService } from './access-scope.service';
import { AuthService } from './auth.service';
import { UpdatePreferredLocaleDto } from './dto/update-preferred-locale.dto';
import { EncryptionService } from './encryption.service';
import { SupabaseJwtService } from './supabase-jwt/supabase-jwt.service';

jest.mock('./supabase-jwt/supabase-jwt.service', () => ({
  SupabaseJwtService: class {},
}));

describe('UpdatePreferredLocaleDto', () => {
  it.each(['vi', 'en'])('chấp nhận ngôn ngữ hỗ trợ: %s', async (locale) => {
    const dto = plainToInstance(UpdatePreferredLocaleDto, {
      preferredLocale: locale,
    });
    await expect(validate(dto)).resolves.toHaveLength(0);
  });

  it('từ chối ngôn ngữ ngoài miền hỗ trợ', async () => {
    const dto = plainToInstance(UpdatePreferredLocaleDto, {
      preferredLocale: 'fr',
    });
    expect(await validate(dto)).not.toHaveLength(0);
  });
});

describe('AuthService.updatePreferredLocale', () => {
  it('chỉ cập nhật preferred_locale của người trong phiên', async () => {
    const eq = jest.fn(() => Promise.resolve({ error: null }));
    const update = jest.fn(() => ({ eq }));
    const from = jest.fn(() => ({ update }));
    const auditRecord = jest.fn();
    const service = new AuthService(
      {} as SupabaseAuthService,
      { client: { from } } as unknown as SupabaseAdminService,
      {} as EncryptionService,
      {} as SupabaseJwtService,
      {} as never,
      { record: auditRecord } as unknown as AuditService,
      {} as AccessScopeService,
      {} as I18nService,
    );

    await expect(
      service.updatePreferredLocale('user-1', { preferredLocale: 'en' }),
    ).resolves.toEqual({ preferredLocale: 'en' });
    expect(update).toHaveBeenCalledWith({ preferred_locale: 'en' });
    expect(eq).toHaveBeenCalledWith('id', 'user-1');
    expect(auditRecord).not.toHaveBeenCalled();
  });
});

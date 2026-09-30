import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import type { Session } from '@supabase/supabase-js';
import { mapSupabaseAuthError } from '@/error/supabase-auth.mapper';
import { mapSupabasePostgrestError } from '@/error/supabase-postgres.mapper';
import { SupabaseAdminService } from '@/supabase/supabase-admin.service';
import { SupabaseAuthService } from '@/supabase/supabase-auth.service';
import { UserProfileTableName } from '@/supabase/supabase.define';
import { AuditEvent } from '@/utils/enums/audit-event.enum';
import { ContextType } from '@/utils/enums/role.enum';
import {
  accessTokenFromAuthReq,
  clientIp,
  clientUserAgent,
  isSuperAdmin,
  normalizeEmployeeCode,
} from '@/utils/utils';
import { AuditService, auditContextOf } from '@/audit/audit.service';
import { diffFields } from '@/audit/audit-diff';
import { I18nService } from '@/common/i18n/i18n.service';
import { resolveLocale } from '@/common/i18n/locale.const';
import { MessageCode } from '@/common/i18n/message-code.const';
import { AuthRequest } from './auth.interface';
import { EncryptionService } from './encryption.service';
import { AccessScopeService } from './access-scope.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password.dto';
import { SupabaseJwtService } from './supabase-jwt/supabase-jwt.service';
import { AppException } from '@/common/exceptions/app.exception';
import { ErrorCode } from '@/common/i18n/error-code.const';

/**
 * Phiên trả về cho client.
 *
 * ⚠️ KHAI TƯỜNG MINH, KHÔNG SPREAD `...session` CỦA SUPABASE
 *
 * `Session` của Supabase còn mang `user` (đầy đủ `app_metadata`, `identities`,
 * `user_metadata`) và — khi có đăng nhập qua nhà cung cấp ngoài — cả `provider_token` với
 * `provider_refresh_token`. Hai trường cuối là **thông tin đăng nhập của bên thứ ba**
 * (Google, Microsoft); đẩy chúng ra trình duyệt là phát tán một credential không thuộc về
 * hệ thống này, và không có cách nào thu hồi lại.
 *
 * Spread thì hôm nay có thể vô hại, nhưng nó biến mọi trường Supabase thêm vào phiên bản
 * sau thành trường tự động lộ ra API công khai. Khai tường minh làm điều ngược lại: trường
 * mới chỉ lộ ra khi có người cố ý thêm vào đây.
 */
export interface SessionPayload {
  access_token: string;
  refresh_token: string;
  token_type: string;
  /** Số giây còn lại của access token. Frontend dùng để hẹn giờ làm mới trước khi hết hạn. */
  expires_in: number;
  /** Mốc hết hạn tính theo Unix epoch (giây). */
  expires_at: number | null;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseAuthService: SupabaseAuthService,
    private readonly supabaseAdminService: SupabaseAdminService,
    private readonly encryptionService: EncryptionService,
    private readonly jwtService: SupabaseJwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
    private readonly accessScope: AccessScopeService,
    private readonly i18n: I18nService,
  ) {}

  // =========================================================================
  // ĐĂNG KÝ
  // =========================================================================

  /**
   * Tạo tài khoản Supabase Auth **và** hồ sơ người dùng Every Half.
   *
   * ⚠️ HAI BƯỚC NÀY KHÔNG NGUYÊN TỬ ĐƯỢC, VÀ ĐÂY LÀ CÁCH XỬ LÝ.
   *
   * `auth.users` do Supabase quản lý, `user_profiles` là bảng của mình — không có
   * transaction nào bao được cả hai. Nếu bước 2 thất bại thì tồn tại một tài khoản đăng
   * nhập được nhưng không có hồ sơ, và người đó sẽ nhận 403 `PROFILE_NOT_INITIALIZED`
   * ở mọi request (xem `JwtAuthGuard`).
   *
   * Xử lý: bước 2 lỗi thì **xoá luôn** tài khoản vừa tạo ở bước 1 và báo lỗi rõ. Thà bắt
   * người dùng đăng ký lại còn hơn để họ có một tài khoản hỏng mà không hiểu vì sao.
   *
   * ⚠️ Tài khoản mới KHÔNG có vai trò nào — đăng nhập được nhưng chưa thấy dữ liệu của location
   * nào cho tới khi quản trị gán vai trò.
   */
  async register(dto: RegisterDto, req: Request) {
    const email = dto.email.trim().toLowerCase();
    const displayName = dto.displayName.trim();
    const employeeCode = dto.employeeCode
      ? normalizeEmployeeCode(dto.employeeCode)
      : null;

    // Kiểm mã nhân viên trước khi tạo tài khoản: phát hiện trùng ở đây thì chưa có gì phải
    // dọn, còn phát hiện sau bước 1 thì đã phải xoá tài khoản.
    if (employeeCode) {
      await this.assertEmployeeCodeAvailable(employeeCode);
    }

    const { data, error } =
      await this.supabaseAdminService.client.auth.admin.createUser({
        email,
        password: dto.password,
        // ⚠️ `email_confirm: false` = người dùng phải xác nhận email trước khi dùng.
        // Đặt `true` để bỏ qua bước xác nhận là mở đường cho tài khoản rác hàng loạt, và cho
        // phép ai đó đăng ký bằng email của người khác (ví dụ email của cửa hàng trưởng).
        email_confirm: false,
        user_metadata: { display_name: displayName },
      });

    if (error) mapSupabaseAuthError(error);
    if (!data.user) {
      throw new AppException(ErrorCode.ACCOUNT_CREATE_FAILED);
    }

    const userId = data.user.id;

    const { error: profileError } = await this.supabaseAdminService.client
      .from(UserProfileTableName)
      .insert({
        id: userId,
        display_name: displayName,
        employee_code: employeeCode,
      });

    if (profileError) {
      // Dọn tài khoản mồ côi. Nếu chính bước dọn cũng lỗi thì ghi log ở mức error: lúc
      // đó cần người vào xử lý tay, và đây là dấu vết duy nhất để tìm ra bản ghi nào.
      const { error: cleanupError } =
        await this.supabaseAdminService.client.auth.admin.deleteUser(userId);
      if (cleanupError) {
        this.logger.error(
          `Tài khoản mồ côi cần xử lý tay: auth.users.id=${userId}, ` +
            `tạo hồ sơ lỗi="${profileError.message}", xoá lỗi="${cleanupError.message}"`,
        );
      }
      mapSupabasePostgrestError(profileError);
    }

    // =====================================================================
    // ⚠️ GỬI EMAIL XÁC NHẬN — BƯỚC NÀY BẮT BUỘC PHẢI CÓ RIÊNG
    // =====================================================================
    //
    // `auth.admin.createUser()` **KHÔNG gửi email nào**. Nó tạo bản ghi trong `auth.users`
    // với `email_confirmed_at = NULL` rồi thôi. Đây là điểm khác `signUp()` — hàm đó có gửi.
    //
    // ⚠️ Không có bước này thì luồng đăng ký **hỏng hoàn toàn nhưng im lặng**:
    //   · endpoint trả 201 "kiểm tra email để xác nhận",
    //   · người dùng không bao giờ nhận được thư,
    //   · nên họ không xác nhận được email,
    //   · nên họ **không đăng nhập được** (`email_confirm: false` ở trên chặn),
    //   · nên họ đăng ký lại — và lần này nhận lỗi email đã tồn tại.
    //
    // ⚠️ VÌ SAO KHÔNG DÙNG `signUp()` CHO CẢ LUỒNG
    //
    // `signUp()` tự gửi thư, nhưng với email đã tồn tại nó trả về một `user` **đã làm mờ**
    // (chống dò danh sách người dùng) — có thể mang đúng `id` của người dùng thật với
    // `identities: []`. Bước dọn tài khoản mồ côi ở trên gọi `admin.deleteUser(id)`, nên nếu
    // dùng `signUp()` thì một lần đăng ký trùng email + lỗi tạo hồ sơ sẽ **xoá tài khoản
    // thật của người khác**. `admin.createUser()` trả lỗi trùng rõ ràng nên không có rủi ro đó.
    //
    // ⚠️ Lỗi ở đây **không** rollback tài khoản. Tài khoản và hồ sơ đã tạo đúng; chỉ có thư
    // chưa đi. Người dùng còn đường ra: bấm "gửi lại thư xác nhận".
    const { error: mailError } = await this.supabaseAuthService
      .createEphemeralClient()
      .auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${this.resolveAppUrl()}/auth/confirm` },
      });

    if (mailError) {
      this.logger.error(
        `[register] Không gửi được email xác nhận cho ${userId}: ${mailError.message}. ` +
          'Người dùng phải dùng chức năng gửi lại thư xác nhận.',
      );
    }

    await this.auditService.record({
      eventCode: AuditEvent.IDENTITY_PROFILE_CREATED,
      actorId: userId,
      actorLabel: employeeCode
        ? `${displayName} (${employeeCode})`
        : displayName,
      subjectType: 'UserProfile',
      subjectId: userId,
      changes: diffFields(
        null,
        { display_name: displayName, employee_code: employeeCode },
        ['display_name', 'employee_code'],
      ),
      metadata: {
        source: 'self_register',
        confirmation_email_sent: !mailError,
      },
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
      requestId: req.requestId ?? null,
    });

    const locale = resolveLocale(req);
    return {
      message: this.i18n.translateMessage(
        mailError
          ? MessageCode.AUTH_REGISTERED_EMAIL_PENDING
          : MessageCode.AUTH_REGISTERED,
        locale,
      ),
      userId,
      employeeCode,
      confirmationEmailSent: !mailError,
    };
  }

  /**
   * Gửi lại email xác nhận.
   *
   * Cần thiết vì ba lý do có thật, và lý do thứ ba là lý do bắt buộc phải có endpoint này:
   *
   *   1. Thư vào hộp thư rác và người dùng xoá mất.
   *   2. Liên kết xác nhận của Supabase có thời hạn.
   *   3. ⚠️ Bước gửi thư trong `register()` có thể thất bại mà **không** rollback tài khoản.
   *
   * ⚠️ LUÔN TRẢ VỀ CÙNG MỘT CÂU, KỂ CẢ KHI EMAIL KHÔNG TỒN TẠI HOẶC ĐÃ XÁC NHẬN.
   *
   * Cùng lý do với `forgotPassword()`: phân biệt hai trường hợp biến endpoint này thành công
   * cụ dò danh sách người dùng — gõ thử một loạt email và đọc phản hồi là biết ai có tài
   * khoản, và ai đã xác nhận.
   */
  async resendConfirmationEmail(dto: ForgotPasswordDto, req: Request) {
    const email = dto.email.trim().toLowerCase();

    const { error } = await this.supabaseAuthService
      .createEphemeralClient()
      .auth.resend({
        type: 'signup',
        email,
        options: { emailRedirectTo: `${this.resolveAppUrl()}/auth/confirm` },
      });

    if (error) {
      // Không đẩy ra ngoài — xem chú thích trên về chống dò danh sách người dùng.
      this.logger.error(
        `[resendConfirmation] Supabase error: ${error.message}`,
      );
    }

    // Ghi audit dù không biết email có tồn tại: số lần gọi từ cùng một IP là tín hiệu duy
    // nhất phát hiện endpoint này bị dùng để spam hộp thư người khác.
    await this.auditService.record({
      eventCode: AuditEvent.AUTH_CONFIRMATION_EMAIL_RESENT,
      actorId: null,
      subjectType: 'AuthSession',
      subjectId: null,
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
      requestId: req.requestId ?? null,
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_CONFIRMATION_RESENT,
        resolveLocale(req),
      ),
    };
  }

  // =========================================================================
  // ĐĂNG NHẬP / ĐĂNG XUẤT
  // =========================================================================

  async login(dto: LoginDto, req: Request) {
    // ⚠️ Client dùng một lần, KHÔNG dùng singleton `supabaseAuthService.client`. Singleton
    // được tạo với tuỳ chọn mặc định (`persistSession: true`), nên mỗi lần đăng nhập thành
    // công là nó ghi session vừa nhận vào trạng thái trong bộ nhớ của cả tiến trình. Với
    // nhiều request đồng thời, "session hiện hành" của singleton là của người đăng nhập gần
    // nhất — vô hại ở đây vì ta chỉ đọc `data`, nhưng nó là một trạng thái dùng chung không
    // ai cần, và là loại trạng thái mà một đoạn code sau này sẽ vô tình đọc.
    const { data, error } = await this.supabaseAuthService
      .createEphemeralClient()
      .auth.signInWithPassword({
        email: dto.email.trim().toLowerCase(),
        password: dto.password,
      });

    if (error) {
      // ⚠️ Ghi audit **trước khi** ném lỗi, và KHÔNG ghi email vào metadata.
      //
      // Email của một lần đăng nhập thất bại có thể là email của người không có tài khoản
      // (ai đó gõ sai). Lưu nó là đưa dữ liệu cá nhân của người ngoài hệ thống vào một bảng
      // chỉ-ghi-thêm, tức không xoá được kể cả khi có yêu cầu hợp lệ.
      //
      // Dùng `record()` chứ không `recordOrThrow()`: audit lỗi không được che mất lỗi đăng
      // nhập thật, vì lỗi đăng nhập là thứ người dùng cần biết.
      await this.auditService.record({
        eventCode: AuditEvent.AUTH_LOGIN_FAILED,
        actorId: null,
        subjectType: 'AuthSession',
        subjectId: null,
        ipAddress: clientIp(req),
        userAgent: clientUserAgent(req),
        requestId: req.requestId ?? null,
        metadata: { reason: error.code ?? 'unknown' },
      });
      mapSupabaseAuthError(error);
    }

    const { user, session } = data;
    if (!session) {
      throw new AppException(ErrorCode.SESSION_CREATE_FAILED);
    }

    // Hồ sơ phải tồn tại và đang hoạt động trước khi trả session.
    //
    // ⚠️ Không bỏ bước này để "đăng nhập nhanh hơn". Trả session cho một tài khoản chưa
    // có hồ sơ nghĩa là frontend nhận 200, lưu token, rồi mọi request tiếp theo nhận 403
    // — và người dùng thấy một ứng dụng đăng nhập được nhưng không dùng được gì.
    const { data: profile } = await this.supabaseAdminService.client
      .from(UserProfileTableName)
      .select('display_name, employee_code, status')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      throw new AppException(ErrorCode.PROFILE_NOT_INITIALIZED);
    }
    if (profile.status !== 'ACTIVE') {
      // ⚠️ UC-IAM-01.EX.3: thu hồi phiên vừa tạo ở Dịch vụ xác thực.
      //
      // `signInWithPassword` ở trên đã tạo một phiên thật tại Supabase. Token không được trả
      // ra trình duyệt, nhưng nếu không thu hồi thì refresh token đó vẫn sống tới lúc hết hạn
      // tự nhiên — đúng lỗ hổng mà `refreshSession` đã đóng ở nhánh tài khoản không hoạt động.
      // Lỗi thu hồi chỉ log mức `error`, không ném: đăng nhập đã bị từ chối, không được để một
      // lỗi phụ che mất lý do thật (ACCOUNT_INACTIVE) mà người dùng cần biết.
      const { error: revokeError } =
        await this.supabaseAdminService.client.auth.admin.signOut(
          session.access_token,
          'global',
        );
      if (revokeError) {
        this.logger.error(
          `[login] Không thu hồi được phiên của tài khoản ${profile.status}: ` +
            `user=${user.id} lỗi="${revokeError.message}"`,
        );
      }

      throw new AppException(ErrorCode.ACCOUNT_INACTIVE, {
        status: profile.status,
      });
    }

    await this.auditService.record({
      eventCode: AuditEvent.AUTH_LOGIN_SUCCEEDED,
      actorId: user.id,
      actorLabel: profile.employee_code
        ? `${profile.display_name} (${profile.employee_code})`
        : profile.display_name,
      subjectType: 'AuthSession',
      subjectId: user.id,
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
      requestId: req.requestId ?? null,
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_LOGGED_IN,
        resolveLocale(req),
      ),
      user: {
        id: user.id,
        email: user.email,
        displayName: profile.display_name,
        employeeCode: profile.employee_code,
      },
      session: this.buildSessionPayload(session),
    };
  }

  /**
   * Đăng xuất — **thu hồi phiên ở phía Supabase**, không chỉ xoá token ở client.
   *
   * ⚠️ ĐÂY LÀ MỘT SỬA LỖI SO VỚI CÁCH LÀM THÔNG THƯỜNG, VÀ LÝ DO QUAN TRỌNG
   *
   * Cách hay thấy là gọi `client.auth.signOut()` trên client dùng chung của server. Việc đó
   * **không thu hồi gì cả**: client đó được tạo bằng anon key và không giữ phiên của ai, nên
   * `signOut()` chỉ xoá một session rỗng trong bộ nhớ. Kết quả là endpoint trả 200 "đã đăng
   * xuất" trong khi refresh token vẫn còn sống nguyên và vẫn làm mới được phiên nhiều ngày.
   *
   * Với Every Half, hệ quả cụ thể: nhân viên đăng xuất trên máy tính quầy dùng chung, người
   * ca sau lấy được refresh token còn trong trình duyệt vẫn vào được tài khoản.
   *
   * Nên phải dùng `admin.signOut(jwt, scope)` — nó gọi tới Supabase và **vô hiệu hoá refresh
   * token thật**.
   *
   * ⚠️ `scope: 'local'` chứ không `'global'`: đăng xuất trên máy quầy **không nên** đăng xuất
   * luôn điện thoại của người đó. Thu hồi toàn bộ là một hành động riêng (`logoutAllSessions`).
   */
  async logout(req: AuthRequest) {
    // Guard đã thay header bằng JWT đã giải mã (xem `JwtAuthGuard` bước 4), nên giá trị này
    // là JWT thật — không phải chuỗi đã mã hoá.
    const accessToken = accessTokenFromAuthReq(req);

    const { error } = await this.supabaseAdminService.client.auth.admin.signOut(
      accessToken,
      'local',
    );

    // ⚠️ Lỗi ở đây **không** ném ra ngoài.
    //
    // Nếu token đã hết hạn hoặc đã bị thu hồi, Supabase trả lỗi — nhưng ý định của người
    // dùng đã được thoả mãn: phiên đó không dùng được nữa. Trả lỗi cho một lần đăng xuất
    // làm frontend không dám xoá token cục bộ, và người dùng bị mắc ở trạng thái "không
    // đăng xuất được".
    if (error) {
      this.logger.warn(
        `[logout] Thu hồi phiên ở Supabase không thành công (vẫn coi là đã đăng xuất): ${error.message}`,
      );
    }

    await this.auditService.record({
      eventCode: AuditEvent.AUTH_LOGOUT,
      ...auditContextOf(req),
      subjectType: 'AuthSession',
      subjectId: req.user.authSessionId ?? req.user.sub,
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_LOGGED_OUT,
        resolveLocale(req),
      ),
    };
  }

  /**
   * Thu hồi **mọi** phiên của người đang đăng nhập, kể cả phiên đang gọi.
   *
   * Dùng cho nút "Đăng xuất khỏi tất cả thiết bị" — thứ cần có khi người dùng nghi ngờ tài
   * khoản bị truy cập trái phép (điện thoại mất, lộ mật khẩu cho đồng nghiệp ca trước).
   */
  async logoutAllSessions(req: AuthRequest) {
    const accessToken = accessTokenFromAuthReq(req);

    const { error } = await this.supabaseAdminService.client.auth.admin.signOut(
      accessToken,
      'global',
    );
    if (error) mapSupabaseAuthError(error);

    await this.auditService.record({
      eventCode: AuditEvent.AUTH_ALL_SESSIONS_REVOKED,
      ...auditContextOf(req),
      subjectType: 'AuthSession',
      subjectId: req.user.sub,
      metadata: { trigger: 'user_requested' },
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_ALL_SESSIONS_REVOKED,
        resolveLocale(req),
      ),
    };
  }

  // =========================================================================
  // LÀM MỚI PHIÊN
  // =========================================================================

  /**
   * Đổi refresh token thành một cặp token mới.
   *
   * =========================================================================
   * BỐN BƯỚC, VÀ VÌ SAO KHÔNG BỎ ĐƯỢC BƯỚC NÀO
   * =========================================================================
   *
   *   1. Giải mã lớp AES  → chuỗi client giữ không dùng trực tiếp được với Supabase
   *   2. Đổi token ở Supabase → nhận cặp mới
   *   3. **Đọc lại `user_profiles`** → tài khoản bị khoá/nghỉ việc thì không làm mới được
   *   4. Mã hoá cặp mới rồi trả về
   *
   * ⚠️ BƯỚC 3 LÀ LÝ DO CHÍNH ĐỂ ENDPOINT NÀY TỒN TẠI
   *
   * Nếu chỉ cần đổi token thì frontend gọi thẳng Supabase được, không cần backend. Nhưng
   * Supabase **không biết** `user_profiles.status`, nên nó sẽ cấp token mới cho một nhân viên
   * vừa nghỉ việc. `JwtAuthGuard` sẽ chặn ở request sau đó, nhưng người đó vẫn giữ được một
   * phiên sống — và mỗi lần hết hạn lại gia hạn thêm được.
   *
   * =========================================================================
   * ⚠️ XOAY VÒNG REFRESH TOKEN: CLIENT PHẢI THAY THẾ, KHÔNG PHẢI GIỮ THÊM
   * =========================================================================
   *
   * Supabase xoay vòng refresh token: mỗi lần làm mới, một token mới được cấp. Client bắt
   * buộc lưu đè token mới. Và nhiều request làm mới đồng thời phải được **gộp** ở frontend
   * thành một promise dùng chung (xem `eh_am_frontend/src/lib/api/client.ts` §Gộp) — backend
   * không giải quyết được việc đó.
   */
  async refreshSession(dto: RefreshTokenDto, req: Request) {
    // --- Bước 1: giải mã ---
    let refreshToken: string;
    try {
      refreshToken = this.encryptionService.decrypt(dto.refreshToken.trim());
    } catch {
      await this.recordRefreshRejected(req, 'decrypt_failed');
      throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    // --- Bước 2: đổi token ở Supabase ---
    //
    // ⚠️ Client dùng một lần: `refreshSession()` ghi phiên vừa nhận vào trạng thái trong bộ
    // nhớ của client. Trên singleton dùng chung, đó là phiên của người làm mới gần nhất —
    // một trạng thái dùng chung giữa các người dùng khác nhau, tức đúng loại lỗi rò rỉ
    // phiên mà không test nào bắt được vì nó chỉ xuất hiện khi có tải đồng thời.
    const { data, error } = await this.supabaseAuthService
      .createEphemeralClient()
      .auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session || !data.user) {
      await this.recordRefreshRejected(req, error?.code ?? 'no_session');
      // ⚠️ Không đẩy thông báo của Supabase ra ngoài: nó phân biệt được "token đã dùng rồi"
      // với "token không tồn tại", và sự phân biệt đó nói cho kẻ tấn công biết chuỗi họ đang
      // thử có thật hay không.
      throw new AppException(ErrorCode.REFRESH_TOKEN_INVALID);
    }

    const { session, user } = data;

    // --- Bước 3: trạng thái tài khoản hiện tại ---
    const { data: profile } = await this.supabaseAdminService.client
      .from(UserProfileTableName)
      .select('display_name, status')
      .eq('id', user.id)
      .maybeSingle();

    if (!profile) {
      await this.recordRefreshRejected(req, 'profile_missing', user.id);
      throw new AppException(ErrorCode.PROFILE_NOT_INITIALIZED);
    }
    if (profile.status !== 'ACTIVE') {
      // ⚠️ Thu hồi luôn mọi phiên của tài khoản không còn hoạt động.
      //
      // Không có bước này thì mỗi lần token hết hạn họ lại gọi vào đây, bị từ chối, rồi
      // refresh token cũ vẫn còn sống tới ngày hết hạn tự nhiên. Thu hồi ngay biến một lần
      // khoá tài khoản thành một lần dứt điểm.
      const { error: revokeError } =
        await this.supabaseAdminService.client.auth.admin.signOut(
          session.access_token,
          'global',
        );
      if (revokeError) {
        this.logger.error(
          `[refreshSession] Không thu hồi được phiên của tài khoản ${profile.status}: ` +
            `user=${user.id} lỗi="${revokeError.message}"`,
        );
      }

      await this.recordRefreshRejected(
        req,
        `account_${profile.status.toLowerCase()}`,
        user.id,
      );
      throw new AppException(ErrorCode.ACCOUNT_INACTIVE, {
        status: profile.status,
      });
    }

    // --- Bước 4: trả cặp token mới ---
    //
    // ⚠️ KHÔNG ghi audit cho mỗi lần làm mới **thành công**: mỗi người dùng hoạt động làm mới
    // mỗi giờ — hàng nghìn dòng mỗi ngày trên một bảng không xoá được, làm loãng những dòng
    // thật sự cần đọc khi điều tra. Chỉ ghi lần **thất bại** — đó mới là tín hiệu.
    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_SESSION_REFRESHED,
        resolveLocale(req),
      ),
      user: {
        id: user.id,
        displayName: profile.display_name,
      },
      session: this.buildSessionPayload(session),
    };
  }

  // =========================================================================
  // MẬT KHẨU
  // =========================================================================

  /**
   * Gửi email đặt lại mật khẩu.
   *
   * ⚠️ LUÔN TRẢ VỀ CÙNG MỘT CÂU, KỂ CẢ KHI EMAIL KHÔNG TỒN TẠI.
   *
   * Phân biệt hai trường hợp biến endpoint này thành công cụ dò danh sách người dùng:
   * gõ thử một loạt email và đọc phản hồi là biết ai có tài khoản — tức một danh sách mục
   * tiêu cho tấn công lừa đảo nhắm vào nhân viên (giả danh kế toán xin chuyển khoản…).
   *
   * Lỗi từ Supabase cũng không đẩy ra ngoài vì cùng lý do; chỉ ghi log.
   */
  async forgotPassword(dto: ForgotPasswordDto, req: Request) {
    const redirectTo = `${this.resolveAppUrl()}/reset-password`;

    const { error } =
      await this.supabaseAuthService.client.auth.resetPasswordForEmail(
        dto.email.trim().toLowerCase(),
        { redirectTo },
      );

    if (error) {
      this.logger.error(`[forgotPassword] Supabase error: ${error.message}`);
    }

    // ⚠️ Ghi audit **không** kèm email, nhưng vẫn ghi **một dòng cho mỗi lần gọi**: số lần gọi
    // từ cùng một IP là tín hiệu duy nhất phát hiện endpoint này bị dùng để spam.
    await this.auditService.record({
      eventCode: AuditEvent.AUTH_PASSWORD_RESET_REQUESTED,
      actorId: null,
      subjectType: 'AuthSession',
      subjectId: null,
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
      requestId: req.requestId ?? null,
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_RESET_LINK_SENT,
        resolveLocale(req),
      ),
    };
  }

  /**
   * Đặt lại mật khẩu bằng mã khôi phục trong email.
   *
   * Xác minh mã bằng chính `SupabaseJwtService` mà `JwtAuthGuard` dùng, rồi đổi mật khẩu
   * qua service role. Mã khôi phục do Supabase phát nên đã ngắn hạn và một lần dùng.
   */
  async resetPassword(dto: ResetPasswordDto, req: Request) {
    const recoveryToken = dto.accessToken.trim();
    const payload = await this.jwtService.verify(recoveryToken);
    if (!payload.sub) {
      throw new AppException(ErrorCode.RECOVERY_TOKEN_INVALID);
    }

    // ⚠️ UC-IAM-03.EX.8 (bước 9): chỉ đặt lại mật khẩu cho tài khoản đang hoạt động. Nếu hồ sơ
    // đã chuyển Tạm khoá/Đã ngừng giữa lúc gửi thư và đặt lại thì từ chối, không đổi mật khẩu —
    // mã khôi phục không mở lại được đường vào cho một tài khoản đã bị chặn.
    const { data: profile } = await this.supabaseAdminService.client
      .from(UserProfileTableName)
      .select('status')
      .eq('id', payload.sub)
      .maybeSingle();
    if (!profile) {
      throw new AppException(ErrorCode.PROFILE_NOT_INITIALIZED);
    }
    if (profile.status !== 'ACTIVE') {
      throw new AppException(ErrorCode.ACCOUNT_INACTIVE, {
        status: profile.status,
      });
    }

    const { error } =
      await this.supabaseAdminService.client.auth.admin.updateUserById(
        payload.sub,
        { password: dto.newPassword },
      );
    if (error) mapSupabaseAuthError(error);

    // ⚠️ THU HỒI MỌI PHIÊN SAU KHI ĐẶT LẠI MẬT KHẨU — KHÔNG BỎ ĐƯỢC
    //
    // Người dùng đi vào luồng "quên mật khẩu" trong hai hoàn cảnh, và hoàn cảnh thứ hai là
    // lý do bước này bắt buộc: (1) họ quên mật khẩu, (2) họ nghi tài khoản bị người khác
    // truy cập. Ở trường hợp 2, đổi mật khẩu mà không thu hồi phiên là **không giải quyết
    // gì**: kẻ kia vẫn giữ refresh token còn hiệu lực. Người dùng thì tin mình đã xử lý xong.
    const { error: revokeError } =
      await this.supabaseAdminService.client.auth.admin.signOut(
        recoveryToken,
        'global',
      );
    if (revokeError) {
      // Không ném lỗi: mật khẩu **đã** đổi thành công. Nhưng phải log ở mức `error` — một
      // phiên không thu hồi được là một lỗ hổng còn mở.
      this.logger.error(
        `[resetPassword] Không thu hồi được phiên cũ sau khi đặt lại mật khẩu: ` +
          `user=${payload.sub} lỗi="${revokeError.message}"`,
      );
    }

    await this.auditService.record({
      eventCode: AuditEvent.AUTH_PASSWORD_RESET_COMPLETED,
      actorId: payload.sub,
      subjectType: 'UserProfile',
      subjectId: payload.sub,
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
      requestId: req.requestId ?? null,
      metadata: { all_sessions_revoked: !revokeError },
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_PASSWORD_RESET,
        resolveLocale(req),
      ),
    };
  }

  /**
   * Đổi mật khẩu khi đang đăng nhập.
   *
   * Kiểm mật khẩu hiện tại bằng cách **đăng nhập thử** với nó — xem chú thích ở
   * `ChangePasswordDto` về lý do bước này không bỏ được.
   *
   * Cũng chặn trường hợp mật khẩu mới trùng mật khẩu cũ: Supabase chấp nhận nó và trả về
   * thành công, khiến người dùng tưởng mình đã đổi trong khi thực tế thì không.
   */
  async changePassword(req: AuthRequest, dto: ChangePasswordDto) {
    const userId = req.user.sub;

    const { data: current, error: readError } =
      await this.supabaseAdminService.client.auth.admin.getUserById(userId);
    if (readError || !current?.user?.email) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }
    const email = current.user.email;

    // ⚠️ Client dùng một lần, KHÔNG dùng `supabaseAuthService.client`: singleton kia có
    // `persistSession: true` nên đăng nhập thử trên nó sẽ ghi session của người này vào
    // trạng thái dùng chung của cả tiến trình — mà ở đây chỉ cần biết đúng/sai mật khẩu.
    const { error: signInError } = await this.supabaseAuthService
      .createEphemeralClient()
      .auth.signInWithPassword({ email, password: dto.currentPassword });
    if (signInError) {
      throw new AppException(ErrorCode.CURRENT_PASSWORD_INCORRECT);
    }

    // ⚠️ QĐ-18 / UC-IAM-04.EX.2: chỉ báo "mật khẩu mới trùng mật khẩu hiện tại" SAU khi đã xác
    // minh mật khẩu hiện tại, để không lộ thông tin cho người chưa chứng minh biết mật khẩu cũ.
    // Supabase chấp nhận mật khẩu mới trùng cũ và trả thành công, làm người dùng tưởng đã đổi.
    if (dto.currentPassword === dto.newPassword) {
      throw new AppException(ErrorCode.NEW_PASSWORD_SAME_AS_CURRENT);
    }

    const { error: updateError } =
      await this.supabaseAdminService.client.auth.admin.updateUserById(userId, {
        password: dto.newPassword,
      });
    if (updateError) mapSupabaseAuthError(updateError);

    // =====================================================================
    // ⚠️ KHÔNG GỌI `admin.signOut()` Ở ĐÂY — SUPABASE ĐÃ THU HỒI SẴN
    // =====================================================================
    //
    // Đo trên Supabase thật (dự án Avantily, cùng phiên bản supabase-js):
    //
    //     admin.updateUserById(id, { password })
    //       → MỌI phiên của tài khoản đó bị thu hồi, KỂ CẢ phiên đang gọi
    //       → getUser(jwt cũ)                 → 400 "Auth session missing!"
    //       → admin.signOut(jwt cũ, 'others') → 400 "Auth session missing!"
    //
    // Nên lời gọi "cắt phiên khác, giữ phiên đang dùng" luôn thất bại và làm dòng audit nói
    // sai sự thật. Về mặt bảo mật, hành vi của Supabase mạnh hơn: người đổi mật khẩu thường
    // vì nghi có người khác đang ở trong tài khoản.
    //
    // ⚠️ ĐIỀU KIỆN VỚI FRONTEND: sau khi đổi mật khẩu thành công, **phải** xoá token cục bộ và
    // chuyển về trang đăng nhập (phản hồi có `sessionsRevoked: true`).

    await this.auditService.record({
      eventCode: AuditEvent.AUTH_PASSWORD_CHANGED,
      ...auditContextOf(req),
      subjectType: 'UserProfile',
      subjectId: userId,
      // Supabase thu hồi mọi phiên khi đổi mật khẩu (xem chú thích ở trên), nên đây là hằng
      // số chứ không phải kết quả của một lời gọi có thể thất bại.
      metadata: { all_sessions_revoked: true },
    });

    return {
      message: this.i18n.translateMessage(
        MessageCode.AUTH_PASSWORD_CHANGED,
        resolveLocale(req),
      ),
      /** Cờ cho frontend biết phải xoá token cục bộ và chuyển về trang đăng nhập. */
      sessionsRevoked: true,
    };
  }

  // =========================================================================
  // THÔNG TIN PHIÊN
  // =========================================================================

  /**
   * Người đang đăng nhập — kèm vai trò còn hiệu lực theo từng phạm vi.
   *
   * ⚠️ KHÁC CODEBASE GỐC: TRẢ LUÔN VAI TRÒ VÀ NGÔN NGỮ
   *
   * Ở Avantily, `/auth/me` chỉ trả `isPlatformAdmin`, nên web quản trị không phân biệt được
   * vai trò để dựng menu (nợ kỹ thuật N1) và phải đoán ngôn ngữ (N2). Every Half phân quyền
   * theo location ngay từ đầu, nên frontend cần biết người này là quản lý ở cửa hàng nào — trả
   * luôn ở đây, cùng một lời gọi.
   *
   * ⚠️ VAI TRÒ Ở ĐÂY CHỈ ĐỂ HIỂN THỊ. Quyền thật được `PermissionsGuard` / `AccessScopeService`
   * kiểm lại ở **mọi** request — sửa phản hồi này trong DevTools không mở được quyền nào.
   */
  async getAuthUser(req: AuthRequest) {
    const accessToken = accessTokenFromAuthReq(req);
    const { data, error } =
      await this.supabaseAuthService.client.auth.getUser(accessToken);

    if (error) mapSupabaseAuthError(error);
    if (!data.user) {
      throw new AppException(ErrorCode.UNAUTHORIZED);
    }

    const assignments = await this.accessScope.findActiveAssignments(
      req.user.sub,
    );

    return {
      id: data.user.id,
      email: data.user.email ?? null,
      displayName: req.user.displayName,
      employeeCode: req.user.employeeCode,
      preferredLocale: req.user.preferredLocale ?? null,
      isSuperAdmin: isSuperAdmin(req.user),
      platformRoles: assignments
        .filter((a) => a.context_type === ContextType.PLATFORM)
        .map((a) => a.role_code),
      locationRoles: assignments
        .filter((a) => a.context_type === ContextType.LOCATION)
        .map((a) => ({ locationId: a.context_id, roleCode: a.role_code })),
      aal: req.user.aal ?? null,
    };
  }

  // =========================================================================
  // HỖ TRỢ
  // =========================================================================

  /**
   * Dựng phần `session` trả về client — **mã hoá cả hai token**.
   *
   * ⚠️ VÌ SAO MÃ HOÁ CẢ REFRESH TOKEN, KHÔNG CHỈ ACCESS TOKEN
   *
   * Refresh token gốc của Supabase dùng được **trực tiếp** với endpoint công khai
   * `/auth/v1/token?grant_type=refresh_token`, chỉ cần thêm anon key — thứ vốn công khai.
   * Nghĩa là ai lấy được nó thì không cần đi qua backend này, và ba lớp bảo vệ ở đây đều
   * mất tác dụng: giới hạn tần suất, `audit_events`, và kiểm `user_profiles.status`.
   *
   * ⚠️ HỆ QUẢ PHẢI BIẾT TRƯỚC KHI XOAY `ENCRYPTION_SECRET_KEY`: toàn bộ token đang lưu ở client
   * không giải mã được → mọi người dùng bị đăng xuất cùng lúc. Phải là việc có kế hoạch
   * (thông báo trước, tránh kỳ kiểm kê), không phải phát hiện sau khi đã xoay khoá.
   *
   * ⚠️ `expires_in` VÀ `expires_at` KHÔNG MÃ HOÁ, VÀ ĐÓ LÀ CHỦ Ý: frontend cần hai giá trị
   * này để hẹn giờ làm mới **trước** khi token hết hạn.
   */
  private buildSessionPayload(session: Session): SessionPayload {
    return {
      access_token: this.encryptionService.encrypt(session.access_token),
      refresh_token: this.encryptionService.encrypt(session.refresh_token),
      token_type: session.token_type,
      expires_in: session.expires_in,
      expires_at: session.expires_at ?? null,
    };
  }

  /**
   * Ghi một lần làm mới phiên bị từ chối.
   *
   * ⚠️ ĐÂY LÀ TÍN HIỆU BẢO MẬT, KHÔNG PHẢI LOG GỠ LỖI: một cụm `refresh_rejected` từ cùng một
   * IP nghĩa là có người đang thử refresh token, hoặc một token đã bị đánh cắp đang bị dùng
   * lại.
   *
   * ⚠️ `reason` chỉ nhận **mã lỗi**, không nhận thông báo của Supabase và tuyệt đối không
   * nhận chuỗi token — token không bao giờ được ghi vào một bảng không xoá được.
   */
  private async recordRefreshRejected(
    req: Request,
    reason: string,
    userId?: string,
  ): Promise<void> {
    await this.auditService.record({
      eventCode: AuditEvent.AUTH_SESSION_REFRESH_REJECTED,
      actorId: userId ?? null,
      subjectType: 'AuthSession',
      subjectId: userId ?? null,
      ipAddress: clientIp(req),
      userAgent: clientUserAgent(req),
      requestId: req.requestId ?? null,
      metadata: { reason },
    });
  }

  private async assertEmployeeCodeAvailable(employeeCode: string) {
    const { data, error } = await this.supabaseAdminService.client
      .from(UserProfileTableName)
      .select('id')
      .eq('employee_code', employeeCode)
      .maybeSingle();

    // ⚠️ Truy vấn lỗi phải NÉM, không được coi là "mã còn trống": đọc `data` rỗng khi database
    // lỗi sẽ cho qua bước kiểm, rồi hỏng ở câu INSERT với một lỗi khó hiểu hơn.
    if (error) mapSupabasePostgrestError(error);

    if (data) {
      throw new AppException(ErrorCode.EMPLOYEE_CODE_TAKEN, { employeeCode });
    }
  }

  /**
   * Địa chỉ ứng dụng để dựng liên kết trong email (xác nhận đăng ký, đặt lại mật khẩu).
   *
   * Có biến riêng `APP_URL` thì ưu tiên nó; không có thì lấy origin **đầu tiên** trong
   * `CORS_ORIGINS`; cuối cùng rơi về frontend dev (`http://localhost:5175`).
   */
  private resolveAppUrl(): string {
    const appUrl = this.configService.get<string>('APP_URL')?.trim();
    if (appUrl) return appUrl.replace(/\/+$/, '');

    const firstOrigin = this.configService
      .get<string>('CORS_ORIGINS')
      ?.split(',')[0]
      ?.trim();
    return (firstOrigin || 'http://localhost:5175').replace(/\/+$/, '');
  }
}

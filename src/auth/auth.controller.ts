import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { API_VERSION_1 } from '@/common/constants/api-version.const';
import {
  THROTTLE_AUTH,
  THROTTLE_EMAIL,
  THROTTLE_LOGIN,
  THROTTLE_WRITE,
} from '@/common/constants/throttle.const';
import { AuthService } from './auth.service';
import { ActivationService } from './activation.service';
import { AuthRequest } from './auth.interface';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { UpdatePreferredLocaleDto } from './dto/update-preferred-locale.dto';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/password.dto';
import {
  ActivationPreviewDto,
  CompleteActivationDto,
} from './dto/activation.dto';

/**
 * ============================================================================
 * `/v1/auth` — LUỒNG XÁC THỰC
 * ============================================================================
 *
 * ⚠️ ROUTE NÀO CÓ GUARD, ROUTE NÀO KHÔNG — VÀ VÌ SAO
 *
 * | Route                 | Guard | Lý do |
 * | --------------------- | ----- | ----- |
 * | `activation/preview`  | ❌    | Access token từ email mời là bằng chứng |
 * | `activation/complete` | ❌    | Như trên; người dùng chưa có phiên EH-AM |
 * | `login`               | ❌    | Người gọi chưa có token |
 * | `refresh`             | ❌    | Access token **đã hết hạn** — đó là lý do họ gọi |
 * | `forgot-password`     | ❌    | Không đăng nhập được nên mới cần |
 * | `reset-password`      | ❌    | Mã khôi phục trong body đã là bằng chứng |
 * | `logout`              | ✅    | Cần biết thu hồi phiên của ai |
 * | `logout-all`          | ✅    | Như trên |
 * | `change-password`     | ✅    | Chỉ chủ tài khoản đổi được |
 * | `me`                  | ✅    | Trả dữ liệu của người đang đăng nhập |
 * | `me/locale`           | ✅    | Chỉ chủ tài khoản đổi ngôn ngữ của chính mình (UC-IAM-14) |
 *
 * ⚠️ CÁC ROUTE KHÔNG CÓ GUARD Ở BẢNG TRÊN LÀ TOÀN BỘ BỀ MẶT CÔNG KHAI CỦA HỆ THỐNG XÁC THỰC.
 * Thêm một route không guard vào đây là mở rộng bề mặt đó, nên phải có lý do ghi rõ trong
 * bảng trên — không phải chỉ vì "endpoint này không cần đăng nhập".
 *
 * ⚠️ MỌI ROUTE Ở ĐÂY ĐỀU CÓ GIỚI HẠN TẦN SUẤT RIÊNG, CHẶT HƠN MẶC ĐỊNH
 *
 * Mức mặc định 120/phút là dành cho API nghiệp vụ. Với xác thực, mỗi request là một lần
 * thử thông tin đăng nhập hoặc một lần gửi email — nên chúng dùng `THROTTLE_LOGIN`,
 * `THROTTLE_AUTH` và `THROTTLE_EMAIL`. Xem `common/constants/throttle.const.ts`.
 */
@Controller({ path: 'auth', version: API_VERSION_1 })
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly activationService: ActivationService,
  ) {}

  /** Đọc thông tin tối thiểu của lời mời; access token trong body là bằng chứng sở hữu email. */
  @Post('activation/preview')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_AUTH })
  async previewActivation(@Body() dto: ActivationPreviewDto) {
    return this.activationService.preview(dto);
  }

  /** Đặt mật khẩu rồi kích hoạt profile; không cấp phiên ứng dụng sau khi hoàn tất. */
  @Post('activation/complete')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_AUTH })
  async completeActivation(
    @Body() dto: CompleteActivationDto,
    @Req() req: Request,
  ) {
    return this.activationService.complete(dto, req);
  }

  // =========================================================================
  // TẠO TÀI KHOẢN VÀ ĐĂNG NHẬP
  // =========================================================================

  /**
   * Đăng nhập.
   *
   * Trả về `session` với **cả hai token đã mã hoá** — xem `buildSessionPayload()` trong
   * `auth.service.ts`.
   */
  @Post('login')
  @Throttle({ default: THROTTLE_LOGIN })
  async login(@Body() dto: LoginDto, @Req() req: Request) {
    return this.authService.login(dto, req);
  }

  /**
   * Làm mới phiên — đổi refresh token thành cặp token mới.
   *
   * ⚠️ `@HttpCode(200)`: không có tài nguyên nào được tạo, nên `201` mặc định của `@Post`
   * là sai nghĩa.
   *
   * ⚠️ Dùng `THROTTLE_AUTH` (10/phút) chứ không dùng mức mặc định. Một client hoạt động
   * bình thường gọi endpoint này mỗi giờ một lần; gọi 10 lần trong một phút nghĩa là hoặc
   * frontend có vòng lặp làm mới (bug), hoặc có người đang thử refresh token.
   *
   * ⚠️ **KHÔNG** đặt `JwtAuthGuard` lên route này. Access token đã hết hạn ở đúng thời điểm
   * client gọi — đó là lý do họ gọi. Đặt guard vào là làm endpoint không bao giờ dùng được,
   * và triệu chứng sẽ là "người dùng bị đăng xuất sau một giờ" mà không ai hiểu vì sao.
   */
  @Post('refresh')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_AUTH })
  async refresh(@Body() dto: RefreshTokenDto, @Req() req: Request) {
    return this.authService.refreshSession(dto, req);
  }

  /** Đăng xuất phiên hiện tại. Thu hồi refresh token ở Supabase, không chỉ xoá ở client. */
  @Post('logout')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async logout(@Req() req: AuthRequest) {
    return this.authService.logout(req);
  }

  /**
   * Đăng xuất khỏi **tất cả** thiết bị, kể cả thiết bị đang gọi.
   *
   * Tách khỏi `logout` chứ không làm một tham số của nó: đây là hành động khôi phục quyền
   * kiểm soát khi nghi bị truy cập trái phép (ví dụ điện thoại cửa hàng bị mất), và nó cần một
   * nút riêng trên giao diện với một bước xác nhận. Gộp vào một endpoint với một cờ boolean là
   * cách để một ngày nào đó frontend gửi sai cờ và đăng xuất người dùng khỏi mọi máy.
   */
  @Post('logout-all')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_AUTH })
  @UseGuards(JwtAuthGuard)
  async logoutAll(@Req() req: AuthRequest) {
    return this.authService.logoutAllSessions(req);
  }

  // =========================================================================
  // MẬT KHẨU
  // =========================================================================

  /**
   * Quên mật khẩu — **không có guard**, vì người gọi chưa đăng nhập được.
   *
   * ⚠️ Dùng `THROTTLE_EMAIL` (5 lần / **giờ**), chặt nhất trong toàn bộ API. Mỗi lần gọi là
   * một email được gửi tới một địa chỉ **do client chỉ định** — nên endpoint này vừa tốn tiền
   * vừa có thể dùng để quấy rối hộp thư của người không dùng hệ thống, và hệ quả nặng nhất là
   * uy tín tên miền gửi thư. Xem chú thích ở `THROTTLE_EMAIL`.
   */
  @Post('forgot-password')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_EMAIL })
  async forgotPassword(@Body() dto: ForgotPasswordDto, @Req() req: Request) {
    return this.authService.forgotPassword(dto, req);
  }

  /**
   * Đặt lại mật khẩu bằng mã khôi phục trong email — cũng **không có guard**.
   *
   * Xem chú thích ở `ResetPasswordDto` về lý do mã khôi phục đi trong body chứ không
   * trong header `Authorization`.
   *
   * Thành công sẽ **thu hồi mọi phiên** của tài khoản đó.
   */
  @Post('reset-password')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_AUTH })
  async resetPassword(@Body() dto: ResetPasswordDto, @Req() req: Request) {
    return this.authService.resetPassword(dto, req);
  }

  /**
   * Đổi mật khẩu khi đang đăng nhập — bắt buộc có phiên hợp lệ.
   *
   * ⚠️ Thành công sẽ thu hồi **mọi** phiên, kể cả phiên đang gọi (hành vi đo được của
   * Supabase — xem `AuthService.changePassword`). Frontend phải đưa người dùng về trang đăng
   * nhập khi thấy `sessionsRevoked: true`.
   */
  @Post('change-password')
  @HttpCode(200)
  @Throttle({ default: THROTTLE_AUTH })
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req: AuthRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(req, dto);
  }

  // =========================================================================
  // THÔNG TIN PHIÊN
  // =========================================================================

  /**
   * Người đang đăng nhập là ai, và có vai trò gì trên phạm vi nào.
   *
   * ⚠️ Đây là nguồn DUY NHẤT để frontend biết vai trò: token đã mã hoá nên frontend không đọc
   * được nội dung JWT. Vai trò trả về ở đây chỉ để **hiển thị** (ẩn/hiện menu); quyền thật vẫn
   * được kiểm lại ở mọi request.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getAuthUser(@Req() req: AuthRequest) {
    return this.authService.getAuthUser(req);
  }

  /** Chỉ đổi lựa chọn ngôn ngữ của chính người trong phiên; không nhận mã người dùng từ client. */
  @Patch('me/locale')
  @Throttle({ default: THROTTLE_WRITE })
  @UseGuards(JwtAuthGuard)
  async updatePreferredLocale(
    @Req() req: AuthRequest,
    @Body() dto: UpdatePreferredLocaleDto,
  ) {
    return this.authService.updatePreferredLocale(req.user.sub, dto);
  }
}

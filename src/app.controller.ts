import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * ⚠️ `version: VERSION_NEUTRAL` — controller duy nhất **không** mang tiền tố `/v1`.
 *
 * Đường dẫn thật là `/health`, không phải `/v1/health`. Lý do: Docker `HEALTHCHECK` và load
 * balancer gọi nó, và chúng không nên phải biết version nào đang chạy. Một health check trỏ
 * vào `/v1/health` sẽ vỡ đúng vào lúc phát hành v2 và ngừng v1 — thời điểm tệ nhất để mất
 * health check, vì lúc đó hệ thống sẽ bị đánh dấu là không lành mạnh và bị rút khỏi vòng
 * phục vụ ngay giữa một lần triển khai.
 */
@Controller({ version: VERSION_NEUTRAL })
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Health check.
   *
   * ⚠️ KHÔNG chạm database ở đây, và đó là chủ ý.
   *
   * Endpoint này được Docker `HEALTHCHECK` và load balancer gọi mỗi 30 giây. Cho nó truy
   * vấn database nghĩa là một lần database chậm sẽ làm health check timeout, container bị
   * đánh dấu unhealthy và bị khởi động lại — trong khi chính việc khởi động lại không sửa
   * được gì và còn làm mất các kết nối đang xử lý (ví dụ một lượt kiểm kê đang gửi kết quả).
   * Health check trả lời "tiến trình này còn sống", không phải "cả hệ thống còn khoẻ".
   *
   * Kiểm tra phụ thuộc ngoài (Supabase, FAST) thuộc về một endpoint riêng (`/readyz`) khi cần.
   */
  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}

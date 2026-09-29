import { Global, Module } from '@nestjs/common';
import { SupabaseModule } from '@/supabase/supabase.module';
import { AuditService } from './audit.service';

/**
 * `@Global()` vì gần như mọi domain đều phải ghi audit — nguyên tắc "không bao giờ xoá lịch
 * sử, mọi thay đổi phải lưu Ai – Khi nào – Thay đổi gì – Trước/Sau – Lý do" áp cho toàn hệ
 * thống, không riêng module nào.
 *
 * Không global thì mỗi module lại phải `imports: [AuditModule]`, và module nào quên sẽ
 * fail lúc boot — một rào cản không mang lại lợi ích nào, vì đây là lớp ngang không có
 * trạng thái riêng.
 */
@Global()
@Module({
  imports: [SupabaseModule],
  providers: [AuditService],
  exports: [AuditService],
})
export class AuditModule {}

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

@Injectable()
export class SupabaseAuthService {
  readonly client: SupabaseClient<Database>;

  private readonly url: string;
  private readonly anonKey: string;

  constructor(private configService: ConfigService) {
    this.url = this.configService.get<string>('SUPABASE_URL')!;
    this.anonKey = this.configService.get<string>('SUPABASE_PUBLISHABLE_KEY')!;

    this.client = createClient<Database>(this.url, this.anonKey);
  }

  /**
   * Client dùng một lần rồi bỏ, để **kiểm chứng thông tin đăng nhập** mà không chạm
   * vào `client` dùng chung.
   *
   * `client` ở trên là singleton tạo với tuỳ chọn mặc định, tức `persistSession: true`:
   * mỗi lần `signInWithPassword` thành công là nó ghi session vừa nhận vào bộ nhớ của
   * chính nó. Trên server — nơi một tiến trình phục vụ mọi người dùng — session "đang
   * hoạt động" của singleton đó chỉ là người đăng nhập gần nhất, chẳng liên quan tới
   * request đang xử lý. Vô hại với luồng đăng nhập vì luồng đó chỉ đọc token trong
   * `data` rồi thôi, nhưng bất kỳ chỗ nào đăng nhập thử để *kiểm tra* mật khẩu (đổi
   * mật khẩu) mà dùng singleton là thêm một người ghi vào trạng thái dùng chung đó.
   *
   * `persistSession: false` + `autoRefreshToken: false` khiến client này không giữ gì
   * sau lời gọi và không dựng timer làm mới token trong nền.
   */
  createEphemeralClient(): SupabaseClient<Database> {
    return createClient<Database>(this.url, this.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
}

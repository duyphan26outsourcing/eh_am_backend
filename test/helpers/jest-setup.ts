/**
 * Chạy **trước** mọi test file, trước khi bất kỳ module nào được import.
 *
 * ⚠️ VÌ SAO PHẢI Ở `setupFiles` CHỨ KHÔNG ĐẶT Ở ĐẦU TEST FILE
 *
 * `ConfigModule.forRoot()` đọc `.env` và `process.env` **lúc module khởi tạo**, tức ngay khi
 * `AppModule` được import. Import xảy ra ở đầu file test, trước khi `beforeAll` chạy.
 *
 * Nghĩa là đặt `process.env.X = ...` trong `beforeAll` là **quá muộn** — provider đã đọc giá
 * trị cũ (hoặc `undefined`) rồi. Triệu chứng: `EncryptionService` ném lỗi
 * `ENCRYPTION_SECRET_KEY phải là đúng 64 ký tự hex` dù test file có đặt biến đó.
 *
 * `setupFiles` chạy trước tất cả, nên đây là chỗ duy nhất đúng.
 */
import { config as loadDotenv } from 'dotenv';
import { applyFakeEnvWhereMissing } from './test-app';

/**
 * Nạp `.env.development.local` nếu có, để test luồng đầy đủ dùng được project Supabase dev.
 *
 * ⚠️ `override: false` — biến đã có trong `process.env` (ví dụ do CI đặt) **thắng** giá trị
 * trong tệp. Ngược lại thì CI không đặt được cấu hình riêng, và một lần chạy trên CI sẽ dùng
 * project dev của một người nào đó.
 */
loadDotenv({ path: '.env.development.local', override: false });
loadDotenv({ path: '.env', override: false });

// Điền giá trị giả cho biến còn trống → app boot được mà không cần Supabase thật.
applyFakeEnvWhereMissing();

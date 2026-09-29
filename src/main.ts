import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import {
  DEFAULT_PORT,
  MAX_BODY_SIZE,
  configureApp,
  resolveAllowedOrigins,
  resolveTrustProxyHops,
} from './bootstrap';
import {
  API_VERSION_1,
  SUPPORTED_API_VERSIONS,
} from './common/constants/api-version.const';

/**
 * Điểm khởi động tiến trình.
 *
 * ⚠️ File này CỐ Ý MỎNG. Mọi cấu hình ảnh hưởng tới hành vi HTTP (versioning,
 * `ValidationPipe`, giới hạn body, helmet, CORS, trust proxy) nằm ở `src/bootstrap.ts` để
 * test e2e dùng lại được **đúng** cấu hình đó.
 *
 * Xem chú thích đầu `bootstrap.ts` về hậu quả của việc để cấu hình ở đây: test sẽ kiểm một
 * app khác app production, và nó sẽ xanh trong khi chứng minh điều ngược lại với sự thật.
 *
 * Chỉ ba việc thuộc về file này: đọc `PORT`, `listen`, và log lúc khởi động.
 */
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const logger = new Logger('Bootstrap');

  configureApp(app);

  const port = Number(process.env.PORT) || DEFAULT_PORT;
  await app.listen(port);

  const trustProxyHops = resolveTrustProxyHops();

  logger.log(
    `Every Half · Asset Management backend đang chạy tại http://localhost:${port}`,
  );
  logger.log(
    `API version đang phục vụ: ${SUPPORTED_API_VERSIONS.map((v) => `/v${v}`).join(', ')} ` +
      `· mặc định /v${API_VERSION_1} · body tối đa ${MAX_BODY_SIZE}`,
  );
  logger.log(`CORS cho phép: ${resolveAllowedOrigins().join(', ')}`);
  logger.log(
    `trust proxy = ${trustProxyHops}` +
      (trustProxyHops === 0
        ? ' (dev — không có proxy đứng trước)'
        : ' — phải khớp số tầng proxy thật, xem chú thích trong src/bootstrap.ts'),
  );
}
void bootstrap();

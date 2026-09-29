# syntax=docker/dockerfile:1
#
# Build 2 tầng (multi-stage): tầng "builder" có đủ devDependencies để biên dịch
# TypeScript, tầng "runtime" chỉ chứa dependencies production + code đã build —
# ảnh cuối nhẹ hơn nhiều và không có toolchain build trong container chạy thật.
#
# Base image: node:22-bookworm-slim (Debian 12), KHÔNG dùng alpine — ít rủi ro
# thiếu thư viện hệ thống hơn alpine (musl) khi sau này thêm native module (ví dụ
# thư viện sinh PDF nhãn QR hoặc xử lý ảnh chụp lúc kiểm kê).
#
# Node 22 để khớp phiên bản máy dev, tránh lệch hành vi giữa dev và production.

# ============================================================================
# STAGE 1 — builder
# ============================================================================
FROM node:22-bookworm-slim AS builder

WORKDIR /app

# Copy package*.json TRƯỚC phần còn lại của code: Docker cache layer theo từng
# lệnh COPY/RUN — chỉ cần chạy lại `npm ci` (bước chậm nhất) khi package.json
# hoặc package-lock.json đổi, không phải mỗi lần sửa một dòng code.
COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src
RUN npm run build

# ============================================================================
# STAGE 2 — runtime
# ============================================================================
FROM node:22-bookworm-slim AS runtime

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json ./
# --omit=dev: không cài devDependencies (typescript, eslint, jest...) vào ảnh
# chạy thật — chúng chỉ cần ở stage builder.
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=builder /app/dist ./dist

# Image node chính thức có sẵn user `node` (uid 1000) — không tạo mới, chạy
# container KHÔNG phải root là thực hành bảo mật cơ bản: một lỗ hổng thực thi mã
# trong ứng dụng sẽ không tự động có quyền root trên container.
USER node

# ⚠️ 3006, KHÔNG phải 3005. Trên máy dev của đội, 3005 đã do backend Avantily và
# Darlene chiếm; dùng chung cổng thì hai backend không chạy song song được, và lỗi
# EADDRINUSE dễ bị đọc nhầm thành "backend Every Half lỗi". Giữ 3006 ở MỌI môi
# trường để không phải nhớ hai con số khác nhau.
EXPOSE 3006

# Kiểm tra sức khoẻ bằng chính `node` có sẵn trong ảnh, không cài thêm curl/wget
# chỉ để phục vụ một câu GET. `/health` là route công khai của AppController.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://127.0.0.1:3006/health', r => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

CMD ["node", "dist/main"]

# SVNCKH-NET

Bản rút gọn đang được chuẩn bị trên `feat/simple-club-applications`: hồ sơ CLB trong popup trên landing và một trang admin duyệt/quản lý hồ sơ. Các màn hoạt động được giữ code nhưng ngắt kết nối. Cần áp dụng migration 003 trước khi triển khai frontend này; xem [luồng hồ sơ rút gọn](docs/SIMPLE_APPLICATIONS.md).

React + TypeScript nằm trong `frontend/`; backend Supabase (Auth, PostgreSQL RPC/RLS, Storage) nằm trong `backend/`. Dự án dùng npm workspaces với một lockfile tại `main`.

Cấu trúc frontend/backend đã được tích hợp để triển khai từ `main`. Không cần chạy lại migration hoặc thay đổi project Supabase. Bản demo: https://alt2210.github.io/web_svnckh/.

## Cấu trúc

```text
main/
├── frontend/
│   ├── src/
│   │   ├── pages/                   # Các màn hình React
│   │   ├── components/              # Thành phần giao diện
│   │   ├── contexts/                # Trạng thái phiên cho React
│   │   ├── hooks/                   # Trạng thái tải dữ liệu
│   │   ├── services/                # API dữ liệu theo chức năng
│   │   ├── integrations/supabase/   # Khởi tạo SDK trình duyệt
│   │   ├── features/landing/        # Carousel, biểu tượng, scroll motion
│   │   ├── lib/                     # Router, CSV, thời gian, lỗi
│   │   ├── types/
│   │   ├── styles/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── public/                      # Ảnh, font, logo, tài liệu
│   ├── tests/                       # URL xác thực và CSV
│   └── package.json
├── backend/
│   ├── supabase/
│   │   ├── migrations/              # Schema, RPC, RLS, Storage policies
│   │   └── bootstrap-admin.sql
│   ├── tests/                       # Phân quyền và luồng nghiệp vụ SQL
│   └── package.json
├── tests/                           # Kiểm tra ranh giới kiến trúc
├── docs/
├── .github/workflows/
├── .env.example
├── package.json
└── package-lock.json
```

## Chạy cục bộ

Dùng Node.js 24 như CI. Các lệnh cũ vẫn chạy từ thư mục `main`:

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run build:pages
npm.cmd run preview
```

Vite mặc định tại `http://127.0.0.1:5173/`. `build` xuất `frontend/dist/`; `build:pages` xuất `frontend/dist-pages/`, giữ base `/web_svnckh/` và các hash route hiện tại. Các lệnh trên không publish. Workflow Pages chỉ tự triển khai khi push lên `main`; nhánh refactor đã cập nhật đường dẫn artifact cho cấu trúc mới.

## Phân chia trách nhiệm

Trang React gọi hàm trong `frontend/src/services/`, nhận dữ liệu hoặc lỗi rồi cập nhật UI. Service sử dụng SDK tại `integrations/supabase/client.ts`. Trang/component/context không tự viết query, gọi RPC hay truy cập Storage. Service vẫn là mã frontend chạy bằng quyền phiên hiện tại; không giữ secret key và không thay thế kiểm tra backend.

Quy tắc xác minh email, MFA, trạng thái tài khoản, quyền CLB, xét duyệt, sức chứa và danh sách chờ nằm trong `backend/supabase/migrations/`. Backend thật hiện tại là Supabase, không cần thêm máy chủ Express. **Không chạy lại migration vì đổi thư mục.**

Các nhóm chức năng hiện tại gồm tài khoản/MFA, hồ sơ cá nhân, CLB/minh chứng, tiếp nhận/xét duyệt, quản trị/audit và hoạt động/đăng ký/điểm danh/phản hồi/CSV. Refactor giữ chức năng và giao diện hiện tại.

## Cấu hình và kiểm chứng

`.env.local` hiện tại ở `main` tiếp tục được dùng để giữ cấu hình máy. Vite chỉ lấy biến `VITE_` cho trình duyệt; các biến này chỉ chứa URL và publishable/anon key. Không đưa secret/service-role key vào `VITE_` hoặc commit `.env.local`, `.admin-credentials.local`.

`npm test` chạy kiểm tra kiến trúc, test frontend và 18 test backend trong PostgreSQL bộ nhớ (PGlite). Các test không sửa Supabase thật. Build và test không thay thế UAT trên trình duyệt, SMTP, Storage HTTP hoặc thiết bị thật.

Xem [kiến trúc](docs/ARCHITECTURE.md), [frontend](frontend/README.md), [backend](backend/README.md) và [thiết lập Supabase](docs/SUPABASE_SETUP.md).

# SVNCKH-NET — React + TypeScript + Supabase

Giao diện đã chốt từ `temp` là bản chính tại `src/pages/LandingPage.tsx`. Bản landing page cũ và thư mục `temp` đã được gỡ; mọi luồng dùng một entry `src/main.tsx`.

**Bản demo:** https://alt2210.github.io/web_svnckh/. Workflow triển khai từ nhánh `main`, chạy test trước khi build. Đã kết nối project Supabase `tyitjqomfpfniwcgmnkr`, có admin và đã áp dụng hai migration. 10 bảng nghiệp vụ ban đầu và 3 bảng dữ liệu hoạt động riêng tư từ chối truy cập ẩn danh; bảng `events` cho phép đọc hoạt động công khai qua RLS.

## Chạy cục bộ

Yêu cầu Node.js 22.12+ hoặc 24+:

```powershell
cd main
npm.cmd install
npm.cmd run dev
```

Mở địa chỉ Vite in ra, mặc định `http://127.0.0.1:5173/`. PowerShell dùng `npm.cmd` nếu máy chặn `npm.ps1`.

```powershell
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run preview
```

`build` xuất `dist/`; `build:pages` xuất `dist-pages/` với base `/web_svnckh/`. Đây chỉ là lệnh build cục bộ, không tự publish.

## Chức năng đã triển khai trong code

- **Tài khoản:** đăng ký email/mật khẩu, xác minh email qua Supabase, đăng nhập/đăng xuất, quên/đặt lại mật khẩu, hồ sơ cá nhân, đổi mật khẩu, TOTP MFA.
- **Hoạt động:** tạo bản nháp, công bố/hủy, mở/đóng đăng ký, giới hạn chỗ, danh sách chờ tự chuyển lượt, hủy đăng ký, link phòng riêng tư, điểm danh, phản hồi và xuất CSV. Routes: `/#/hoat-dong`, `/#/dang-ky-hoat-dong`, `/#/quan-ly-hoat-dong`.
- **Người dùng:** tạo/sửa CLB do mình đại diện, minh chứng PDF riêng tư, chọn đợt tiếp nhận, nộp/nộp lại và xem mã hồ sơ, trạng thái, lịch sử, phiên bản.
- **Admin:** tìm kiếm/phân trang người dùng và CLB, khóa/mở tài khoản thường, xem/sửa hồ sơ CLB, lưu trữ/khôi phục CLB, tạo/mở/đóng đợt tiếp nhận, đọc nhật ký.
- **Thẩm định/phê duyệt:** chỉ người có vai trò được giao mới được yêu cầu bổ sung, đề xuất, phê duyệt/từ chối. Admin hệ thống không tự có quyền công nhận CLB.
- **Bảo vệ dữ liệu:** PostgreSQL RLS, RPC kiểm tra vai trò/phạm vi/trạng thái/email/MFA, không tự nâng quyền, snapshot bất biến khi nộp, audit thao tác quan trọng. Tài khoản khóa bị chặn tại DB dù JWT cũ chưa hết hạn.

Không sử dụng tài khoản giả, mật khẩu mặc định hay dữ liệu người dùng trong localStorage. SDK Supabase quản lý phiên đăng nhập; mật khẩu không được lưu bởi ứng dụng.

## Kết nối Supabase

Đọc **[docs/SUPABASE_SETUP.md](docs/SUPABASE_SETUP.md)** để tạo project, chạy migration, cấu hình email/redirect/MFA và tạo admin đầu tiên.

Các file cần thiết:

- `.env.example`: hai biến frontend URL và publishable key.
- `supabase/migrations/202611160001_initial.sql`: bảng, RLS, RPC, trigger và Storage bucket riêng tư.
- `supabase/bootstrap-admin.sql`: gán admin đầu tiên cho tài khoản đã xác minh, không tạo mật khẩu mặc định.
- `tests/database.test.mjs`: test PostgreSQL trong bộ nhớ, kiểm tra quyền truy cập và luồng nộp/thẩm định/công nhận.

Chưa có project thì landing page và giao diện đăng nhập vẫn mở được, nhưng nút xác thực bị khóa và các trang có dữ liệu yêu cầu cấu hình thật. Không có cơ chế đăng nhập demo bỏ qua phân quyền.

## Thư mục

```text
main/
├── src/
│   ├── components/       # PortalLayout, ProtectedRoute, StatusBadge
│   ├── contexts/         # AuthContext
│   ├── features/landing/ # Carousel, SVG icons, scroll motion
│   ├── hooks/            # Tải dữ liệu có xử lý loading/error
│   ├── lib/              # Supabase client và hash router
│   ├── pages/            # Landing, Auth, Account, Clubs, Security, Admin
│   ├── styles/           # Nhận diện landing và giao diện tài khoản
│   ├── types/            # Kiểu dữ liệu nghiệp vụ
│   ├── App.tsx
│   └── main.tsx
├── supabase/
├── tests/
├── docs/
├── public/assets/
└── .github/workflows/
```

## Các đường dẫn chính

`/#/dang-nhap`, `/#/dang-ky`, `/#/quen-mat-khau`, `/#/tai-khoan`, `/#/ho-so`, `/#/bao-mat`, `/#/clb`, `/#/clb/tao`, `/#/admin/dang-nhap`, `/#/admin/nguoi-dung`, `/#/admin/clb`, `/#/admin/dot-tuyen`, `/#/admin/ho-so`, `/#/admin/nhat-ky`.

Hash routing hỗ trợ hosting tĩnh. Khi được phép triển khai Pages sau này, workflow sẽ đọc repository variables `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`.

## Phạm vi và kiểm chứng

Đây là phần tài khoản/CLB/quản trị và hoạt động được yêu cầu, chưa phải toàn bộ MVP trong SRS v2.1. Có 23 kiểm thử SQL, xử lý URL xác thực và CSV; build thường và build Pages cục bộ đã đạt. Test SQL dùng schema Supabase Auth/Storage giả lập, không thay thế kiểm thử end-to-end trên project thật. Chưa kiểm chứng SMTP, Storage HTTP, email callback và giao diện trên thiết bị thật. Chưa tích hợp quét mã độc tệp, sao lưu vận hành, quản lý thành viên/đơn vị, thông báo hay danh bạ công khai; xem giới hạn trong tài liệu thiết lập.

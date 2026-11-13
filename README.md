# SVNCKH-NET — Landing page

Trang GitHub Pages sử dụng **`temp/App.tsx`**: https://alt2210.github.io/web_svnckh/

Workflow `.github/workflows/deploy-pages.yml` tự build và deploy khi push lên nhánh `main`. Lệnh `npm.cmd run build:pages` build riêng giao diện `temp` vào `dist-pages/`, đặt giao diện này tại trang gốc và cấu hình base `/web_svnckh/`. `npm.cmd run build` vẫn build cả hai giao diện phục vụ phát triển cục bộ.

Dự án React 19 + TypeScript + Vite, chuyển từ `../landingpagesample.txt`, tham chiếu SRS v2.1. Giữ thiết kế navy / cyan / vàng và các phần nội dung trong mẫu. Dùng Tailwind CSS được biên dịch khi build, font SVN Apparat và logo do bạn cung cấp; icon SVG Lucide React. Không phụ thuộc CDN khi chạy trang.

## Chạy dự án

Yêu cầu Node.js 22.12+ hoặc 24+. Trong thư mục `main`:

```powershell
npm.cmd install
npm.cmd run dev
```

Mở URL mà Vite in ra, mặc định `http://127.0.0.1:5173`.

```powershell
npm.cmd run typecheck
npm.cmd run build
npm.cmd run preview
```

Bản build nằm trong `dist/`. Dùng `npm.cmd` trên PowerShell nếu máy chặn `npm.ps1`.

## Cấu trúc

```text
main/
├── public/
│   ├── assets/
│   │   └── fonts/                # Font và logo nhận diện
│   └── documents/                # Tài liệu tải xuống
├── src/
│   ├── components/
│   │   ├── common/               # Icon, DetailDialog dùng chung
│   │   ├── layout/               # Header, Footer
│   │   └── landing/              # Các section và ClubCard, RoundStatus
│   ├── data/                     # CLB mẫu, nội dung hộp thoại, đợt tuyển
│   ├── hooks/                    # useClubSearch, useMobileMenu, useLandingActions
│   ├── pages/                    # LandingPage
│   ├── styles/                   # Tailwind, font và CSS toàn cục
│   ├── types/                    # Kiểu dữ liệu Club, ClubFilters, DialogContent
│   ├── utils/                    # Chuẩn hóa tìm kiếm tiếng Việt
│   ├── App.tsx                   # Component gốc
│   ├── main.tsx                  # React entry point
│   └── vite-env.d.ts
├── index.html                    # HTML shell, metadata
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
├── tsconfig.json
├── package.json
├── package-lock.json
└── README.md
```

`LandingPage` ghép các section. Component nhận dữ liệu và callback qua props; trạng thái và vòng đời được quản lý bằng React hooks. Dữ liệu CLB tách khỏi JSX để thay bằng API sau này. Các hiệu ứng có cleanup khi unmount. Chưa thêm router hoặc thư viện quản lý state vì hiện mới có một trang.

## Phạm vi đã triển khai

Hero, thống kê, giới thiệu, quy trình 7 bước, đợt tuyển, quyền lợi, danh bạ, sự kiện, bản tin hướng dẫn, CTA và footer. Menu mobile hỗ trợ bàn phím, bộ lọc tên CLB không phân biệt dấu kết hợp trường/lĩnh vực, trạng thái không có kết quả và xóa bộ lọc. Các mục chưa có backend hiển thị hộp thoại giải thích. Đợt tuyển mẫu tháng 3/2026 hiển thị trạng thái dựa trên ngày thực tế theo múi giờ +07:00.

## Giới hạn

Đây là frontend landing page. Số liệu, CLB, thông tin liên hệ, quyền lợi và sự kiện giữ từ mẫu chỉ để minh họa, cần xác nhận trước khi công bố. Chưa có API, xác thực, gửi hồ sơ, đăng ký sự kiện hay lưu dữ liệu cá nhân. Không tự công nhận CLB; danh bạ mẫu không phải danh sách được phê duyệt thực tế. Bản đồ hiện cung cấp tổng quan ba miền trong hộp thoại, chưa có bản đồ địa lý. Các trang tài khoản, nghiệp vụ quản trị, thẩm định và phê duyệt thuộc bước triển khai tiếp theo. Không triển khai kho học liệu, chuyên gia/cố vấn hay quản lý đề tài vì SRS v2.1 loại khỏi phạm vi.

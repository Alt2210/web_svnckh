# Bản rút gọn: hồ sơ câu lạc bộ

## Luồng sử dụng

- Một màn đăng nhập chung. Người dùng trở lại landing; admin vào quản lý hồ sơ.
- Nút **Nộp hồ sơ CLB / Hồ sơ CLB** mở dialog ngay trên landing. Có lưu nháp, PDF riêng tư, gửi, xem kết quả và bổ sung/gửi lại.
- Link CLB cũ chuyển về popup; không còn trang tài khoản, hồ sơ cá nhân hoặc trang tạo CLB riêng trong điều hướng.
- Admin chỉ còn một trang quản lý/duyệt hồ sơ, có tìm kiếm, lọc trạng thái, chi tiết/minh chứng và lịch sử. TOTP được xác thực ngay trong khu vực này.
- Các trang hoạt động và quản lý/đăng hoạt động được ngắt khỏi router; source, SQL và dữ liệu được giữ. Phần giới thiệu hoạt động tĩnh trên landing vẫn còn, không dẫn tới danh sách động.

## Kích hoạt database

Migration `backend/supabase/migrations/202611160003_simple_applications.sql` đã được người dùng chạy và kiểm tra qua API: đợt mặc định đang mở, hai RPC mới tồn tại và từ chối lời gọi không có phiên người dùng hợp lệ. Không chạy lại 001, 002 hoặc 003.

Migration thêm đợt tiếp nhận mặc định dài hạn để bỏ bước chọn đợt trên UI. `submit_club_basic` vẫn gọi luồng nộp hiện có: email đã xác minh, quyền sở hữu, CLB đang hoạt động, PDF, snapshot, chống nộp trùng và hạn bổ sung. Hồ sơ của đợt cũ được gửi lại trong đúng đợt cũ; hồ sơ từ chối/đã duyệt không tự mở lại.

RPC mới `admin_review_club_application` cho admin có MFA trả trực tiếp ba kết quả: duyệt, yêu cầu bổ sung, từ chối. Đây là thay đổi quy trình theo yêu cầu rút gọn; không cần cấp thêm reviewer/approver cho admin. Vẫn giữ cấm tự duyệt, kiểm tra trạng thái, số quyết định/ngày hiệu lực khi công nhận, audit và lịch sử. Các RPC xét duyệt nhiều bước cũ vẫn giữ cho code lưu trữ.

Không xóa hoặc ghi lại lịch sử hồ sơ hiện tại. Đợt mặc định có thể đóng bằng công cụ vận hành nếu cần; UI không còn màn cấu hình đợt.

## Kiểm tra

`npm test`, `npm run typecheck`, `npm run build:pages` từ `main`. Bốn test mới kiểm tra nộp đơn giản, quyền/MFA/cấm tự duyệt, quyết định, snapshot và bổ sung hồ sơ của đợt cũ. Các test chạy trên PGlite, không ghi dữ liệu thật.

Chỉ triển khai frontend sau khi migration 003 được áp dụng. Chưa kiểm thử thao tác trình duyệt/điện thoại thật; cần thử mở/đóng popup, đăng nhập trở lại landing, tải PDF, gửi lại và duyệt trên môi trường thật sau migration.

# Thiết lập Supabase — SVNCKH-NET

Project Supabase: `tyitjqomfpfniwcgmnkr`. URL và Publishable key đã được cấu hình trong `.env.local` (không được Git theo dõi).

Kiểm tra ngày 16/11/2026 sau khi người dùng chạy migration: Auth trả HTTP 200; Email provider và đăng ký đang bật; xác minh email được yêu cầu. Cả 10 bảng của ứng dụng đã xuất hiện trong API và đều từ chối truy cập ẩn danh với `42501` (permission denied), đúng với thiết kế dữ liệu riêng tư. **Không chạy lại migration khởi tạo.**

Đã tạo tài khoản `admin@svnckh.com` bằng quyền quản trị được người dùng cung cấp, xác nhận email bằng Admin API, cấp duy nhất vai trò `admin` và ghi audit. Đã kiểm tra đăng nhập bằng Publishable key: hồ sơ `active`, đọc được vai trò của chính tài khoản. Mật khẩu ngẫu nhiên nằm trong `.admin-credentials.local`, được Git bỏ qua. Chưa thiết lập TOTP; phiên kiểm thử ở `aal1` đã đăng xuất. Người dùng cần vào Bảo mật tài khoản để hoàn tất MFA trước khi dùng quản trị. Chưa kiểm thử gửi email/callback và luồng thao tác trên UI.

## 1. Tạo project và cơ sở dữ liệu

Migration hoạt động `202611160002_events.sql` đã được người dùng chạy và kiểm tra qua API ngày 16/11/2026: cả bốn bảng `events`, `event_access`, `event_registrations`, `event_feedback` đã tồn tại. Khách chưa đăng nhập đọc được danh sách hoạt động công khai (hiện chưa có hoạt động); không được đọc link phòng, lượt đăng ký, phản hồi hoặc gọi RPC đăng ký. Không chạy lại file 002.

Để thử chức năng: đăng nhập admin, xác thực hai bước tại **Bảo mật tài khoản**, mở **Tổ chức hoạt động → Tạo hoạt động**, lưu bản nháp rồi công bố. Người dùng đã xác minh email vào **Khám phá hoạt động** để đăng ký/hủy và theo dõi danh sách chờ. Ban tổ chức xem người tham gia, xuất CSV và điểm danh từ 30 phút trước giờ bắt đầu. Người có đăng ký xác nhận gửi phản hồi sau giờ kết thúc.

Admin có MFA quản lý hoạt động cấp Mạng lưới. Đại diện CLB đang hoạt động, đã được công nhận, quản lý hoạt động của CLB mình. Phạm vi hiển thị hỗ trợ công khai hoặc tài khoản đã xác minh; chưa giới hạn theo tư cách thành viên từng CLB. Tổng kết hiện được tính từ đăng ký/điểm danh/phản hồi, chưa có bản báo cáo chốt bất biến. Danh sách hoạt động hiện tải tối đa 200 bản ghi mỗi lượt. Chưa kiểm thử tương tác giao diện và email callback trên trình duyệt thật; kiểm thử SQL tự động chạy trên PGlite.

1. Mở project `tyitjqomfpfniwcgmnkr` trong tài khoản Supabase của bạn.
2. Mở SQL Editor, chạy **một lần** toàn bộ `backend/supabase/migrations/202611160001_initial.sql` trong một project mới. Migration chạy trong transaction, tạo bảng, RPC, RLS và bucket riêng tư `club-evidence`.
3. Không chạy lại migration khởi tạo trên schema đã tồn tại. Mọi thay đổi sau đó cần migration bổ sung.

## 2. Cấu hình xác thực

Trong Authentication:

- Bật Email provider và **Confirm email**. Không tắt xác minh email: các RPC sẽ từ chối tài khoản chưa xác minh.
- Thiết lập mật khẩu tối thiểu 10 ký tự và chính sách mật khẩu phù hợp.
- Bật TOTP MFA. Mọi vai trò quản trị/thẩm định/phê duyệt đều cần phiên `aal2`.
- Cấu hình Site URL là URL triển khai thực tế.
- Thêm các Redirect URL được dùng: `http://127.0.0.1:5173/`, `http://localhost:5173/`, `https://svnckh.tainangviet.vn/` và URL demo cũ `https://alt2210.github.io/web_svnckh/`.
- Ứng dụng sử dụng PKCE và callback ở trang gốc. Liên kết xác minh/khôi phục cần mở trên trình duyệt đã bắt đầu luồng. Sự kiện `PASSWORD_RECOVERY` đưa người dùng đến trang đặt mật khẩu.
- Cấu hình SMTP gửi email thực tế, giới hạn tần suất và chống thử sai trong Supabase trước khi mở cổng cho người dùng thật.

Tài liệu: [React Auth](https://supabase.com/docs/guides/auth/quickstarts/react), [SMTP](https://supabase.com/docs/guides/auth/auth-smtp), [MFA](https://supabase.com/docs/guides/auth/auth-mfa).

## 3. Kết nối frontend

Sao chép `.env.example` thành `.env.local` tại thư mục `main` (gốc repository), rồi điền:

```dotenv
VITE_SUPABASE_URL=https://PROJECT_REF.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

Có thể dùng anon key cũ qua `VITE_SUPABASE_ANON_KEY`. Các giá trị này dành cho frontend; RLS/RPC bảo vệ dữ liệu. **Không dùng `service_role`, `sb_secret_...` hoặc mật khẩu database.** Vite sẽ từ chối build nếu nhận nhầm service-role/secret key ở hai biến key được hỗ trợ.

Khởi động lại `npm.cmd run dev` sau khi sửa env. Không commit `.env.local`.

## 4. Tạo admin đầu tiên

1. Tự đăng ký tài khoản thông thường từ giao diện và xác minh email.
2. Sửa email trong `backend/supabase/bootstrap-admin.sql`, chạy script bằng SQL Editor.
3. Đăng xuất/đăng nhập lại để tải quyền.
4. Mở **Bảo mật tài khoản**, thiết lập ứng dụng TOTP rồi xác thực mã 6 số.
5. Khu vực admin được mở sau khi phiên có mức `aal2`.

Không có tài khoản/mật khẩu admin mặc định. Không cho phép tự đăng ký làm admin. Admin không tự có quyền công nhận CLB. Muốn có thẩm định/phê duyệt phải cấp thêm `reviewer`/`approver` theo phân công, bằng SQL như chú thích trong script bootstrap.

## 5. Luồng thử nghiệm

1. Người dùng A đăng ký, xác minh email và tạo hồ sơ CLB (trạng thái **Chưa công nhận**).
2. Người dùng B không đọc/sửa được CLB của A.
3. Admin tạo đợt tiếp nhận với ngày mở/đóng và hướng dẫn.
4. A tải minh chứng PDF riêng tư, chọn đợt đang mở và nộp hồ sơ.
5. Cán bộ `reviewer` xác thực TOTP, bắt đầu thẩm định → yêu cầu bổ sung với hạn phản hồi hoặc đề xuất công nhận.
6. A bổ sung/nộp lại trong thời hạn đợt; phiên bản cũ được giữ nguyên.
7. Người có `approver` xác thực TOTP, phê duyệt hồ sơ đã được đề xuất, nhập số quyết định và ngày hiệu lực. Không được tự duyệt CLB mình.
8. Admin thử khóa tài khoản: RLS/RPC chặn dữ liệu ngay cả khi người dùng vẫn có JWT cũ.
9. Kiểm tra nhật ký và các phiên bản hồ sơ.

Các bài test SQL tự động chạy bằng `npm.cmd test`, dùng PostgreSQL trong bộ nhớ (PGlite) với schema Auth/Storage giả lập. Chúng kiểm tra migration và quy tắc truy cập, không thay thế UAT trên Supabase thật, dịch vụ email, Storage HTTP hoặc thiết bị di động.

## 6. Khi được phép triển khai lại GitHub Pages

Người dùng đã cho phép triển khai bản demo lên GitHub Pages. Repository variables `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` cung cấp cấu hình frontend cho workflow; không đưa secret key hoặc mật khẩu lên GitHub. Site dùng `frontend/src` ở trang gốc; hash routes hoạt động trên Pages mà không cần rewrite server.

## Giới hạn của đợt triển khai này

- Đã có project, tài khoản admin và hai migration; chưa kiểm thử end-to-end SMTP/email callback và toàn bộ luồng giao diện trên dịch vụ Supabase.
- Upload hỗ trợ PDF tối đa 10 MB, lưu bucket riêng tư, kiểm tra quyền ở Storage và metadata; chưa tích hợp quét mã độc. Cần bổ sung/quy định luồng quét trước khi vận hành hồ sơ thật theo NFR-09.
- Đã làm phần tài khoản, hồ sơ cá nhân, CLB, đợt tiếp nhận, nộp/version hồ sơ, quản lý tài khoản/CLB, thẩm định/phê duyệt có phân quyền và audit. Chưa coi là hoàn thành toàn bộ MVP/P0 trong SRS.
- Các nhóm mời thành viên, cơ cấu đơn vị, chuyển người đại diện, thông báo, danh bạ công khai, đình chỉ/thu hồi tư cách thành viên, liệt kê phiên và báo cáo định kỳ còn ngoài phạm vi. Hoạt động đã có tạo/công bố/hủy, đăng ký/danh sách chờ, điểm danh, phản hồi và xuất danh sách CSV.
- File minh chứng không công khai và không xóa từ frontend để bảo toàn lịch sử. Người vận hành cần bổ sung quy trình lưu giữ, xử lý file mồ côi, sao lưu và phục hồi.
- Hiện không có thao tác cấp quyền quản trị trong UI. Cấp/thu hồi vai trò thực hiện bởi người vận hành tin cậy trong SQL Editor, có ghi nhận và đối chiếu quy chế.

## Sau refactor cấu trúc

Mã React ở `frontend/`, migration và kiểm thử database ở `backend/`. Các lệnh npm vẫn chạy từ `main`; không chạy lại migration đã áp dụng. Cấu trúc mới được triển khai từ `main`, không thay đổi schema hoặc dữ liệu Supabase. Xem `docs/ARCHITECTURE.md`.

## Tạm bỏ MFA cho admin

Migration `backend/supabase/migrations/202611160004_admin_password_only.sql` cho phép vai trò admin dùng phiên mật khẩu (`aal1`). Admin không còn màn nhập mã TOTP trong giao diện hiện hành. Vẫn kiểm tra vai trò thực tế, email đã xác minh, tài khoản active và cấm tự duyệt hồ sơ. Reviewer/approver riêng vẫn cần MFA. Không xóa factor đã liên kết; muốn bật lại yêu cầu MFA cho admin, tạo migration khôi phục điều kiện aal2 và bổ sung lại giao diện xác thực. Không chạy lại migration 004 đã áp dụng.

## Custom domain

Subdomain chính: `https://svnckh.tainangviet.vn/`, CNAME tới `alt2210.github.io`. GitHub Pages vẫn là hosting frontend; Supabase vẫn là backend. Bản build dùng base `/` để assets và callback không còn chứa `/web_svnckh/`. Người dùng đã xác nhận cập nhật Site URL và thêm Redirect URL có dấu `/` cuối trong Supabase, giữ các URL cũ. Không đổi API key hoặc chạy lại migration khi gắn domain.

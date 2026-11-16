# Backend Supabase

Backend hiện tại dùng dịch vụ Supabase Auth, PostgreSQL RPC/RLS và Storage. Không có máy chủ Node/Express riêng để khởi động.

- `supabase/migrations/`: schema, hàm nghiệp vụ, kiểm tra quyền, phân quyền theo hàng và Storage policies. Giữ nguyên tên/thứ tự/nội dung migration đã chạy trên project thật.
- `supabase/bootstrap-admin.sql`: công cụ vận hành để cấp admin; không nằm trong frontend bundle.
- `tests/`: kiểm thử PostgreSQL trong bộ nhớ bằng PGlite, không kết nối hay sửa database thật.

Từ `main`, chạy `npm run test --workspace @svnckh/backend`. Toàn bộ kiểm thử chạy bằng `npm test`.

Việc di chuyển thư mục không yêu cầu chạy lại migration hay thay đổi project Supabase. Khi bổ sung nghiệp vụ hoặc đổi phân quyền, tạo migration mới; không sửa/rerun migration đã áp dụng. Backend vẫn kiểm tra email, trạng thái tài khoản, phạm vi tổ chức, MFA và sức chứa dù frontend bị sửa.

Không commit mật khẩu database, service-role/secret key hoặc file thông tin tài khoản. Các thao tác quản trị bằng secret key chỉ chạy trong môi trường tin cậy, không qua GitHub Pages.

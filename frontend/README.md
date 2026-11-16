# Frontend

React + TypeScript + Vite. Chạy lệnh từ thư mục `main`: `npm run dev`.

- `src/pages`, `components`, `contexts`, `hooks`: hiển thị, trạng thái giao diện và điều hướng.
- `src/services`: các thao tác dữ liệu theo chức năng; gọi Supabase bằng quyền của phiên hiện tại, xử lý lỗi và trả dữ liệu cho UI. Đây vẫn là mã chạy trên trình duyệt, không phải backend tin cậy.
- `src/integrations/supabase/client.ts`: nơi duy nhất khởi tạo SDK, đọc URL và publishable key.
- `src/lib`: tiện ích thuần như route/callback, thời gian và CSV; không truy vấn database.
- `public`: ảnh, font, logo và tài liệu công khai.
- `tests`: kiểm thử URL xác thực và CSV.

Biến frontend vẫn lấy từ `.env.local` ở thư mục `main` để giữ cấu hình hiện tại. Chỉ biến `VITE_` được nhúng vào bundle. Không dùng secret/service-role key trong frontend. Các RPC và RLS ở `backend/supabase` mới quyết định quyền và điều kiện nghiệp vụ.

Build thường xuất `frontend/dist/`; build Pages xuất `frontend/dist-pages/`, giữ base `/web_svnckh/` và các hash route cũ.

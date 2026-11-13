import type { DialogContent } from '../types/dialog';

export const actionDialogs: Record<string, DialogContent> = {
  regions: {
    title: 'Kết nối câu lạc bộ ba miền',
    paragraphs: ['Miền Bắc: 2 CLB minh họa trong danh bạ hiện tại.', 'Miền Trung: chưa có CLB minh họa.', 'Miền Nam: 1 CLB minh họa trong danh bạ hiện tại.', 'Bản đồ địa lý tương tác sẽ được bổ sung khi có dữ liệu vị trí được xác nhận.'],
  },
  login: {
    title: 'Đăng nhập hệ thống',
    paragraphs: ['Trang hiện tại là bản triển khai landing page. Chức năng tài khoản sẽ được triển khai trong giai đoạn tiếp theo.', 'Theo SRS: tài khoản sử dụng email cá nhân đã xác minh; quyền quản trị và nộp hồ sơ được kiểm tra theo vai trò và phạm vi câu lạc bộ.'],
  },
  join: {
    title: 'Chuẩn bị hồ sơ gia nhập',
    paragraphs: ['Đợt 1/2026 trong mẫu có thời gian từ 01/03 đến 31/03/2026 và đã kết thúc. Chưa có thông tin được xác nhận về đợt tiếp theo.', 'Quy trình dự kiến: xác minh email người đại diện → khai báo CLB → nộp hồ sơ, minh chứng → thẩm định → phê duyệt → công bố.', 'Việc tạo hồ sơ không tự động công nhận CLB là thành viên. Biểu mẫu và thẩm quyền phê duyệt cần được xác nhận theo SRS.', 'Bản landing page này chưa tiếp nhận hoặc gửi hồ sơ.'],
  },
  event: {
    title: 'Hoạt động học thuật',
    paragraphs: ['Nội dung và lịch trên trang được giữ từ thiết kế mẫu để minh họa giao diện.', 'Lịch tổ chức, địa điểm và cổng đăng ký chính thức chưa được xác nhận. Trang hiện chưa tiếp nhận đăng ký sự kiện.'],
  },
  info: {
    title: 'Thông tin mạng lưới',
    paragraphs: ['Nội dung chính thức cho mục này đang chờ đơn vị quản lý cung cấp và xác nhận.', 'Bạn có thể tham khảo quy trình gia nhập và hướng dẫn chuẩn bị hồ sơ ngay trên trang. Bản hiện tại là giao diện minh họa theo SRS v2.1.'],
  },
};

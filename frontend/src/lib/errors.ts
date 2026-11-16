export function readableError(error: unknown): string {
  const text = error instanceof Error ? error.message : typeof error === 'object' && error && 'message' in error ? String(error.message) : 'Không thực hiện được thao tác. Vui lòng thử lại.';
  if (/invalid login credentials/i.test(text)) return 'Email hoặc mật khẩu không đúng.';
  if (/email not confirmed/i.test(text)) return 'Bạn cần xác minh email trước khi đăng nhập.';
  if (/rate limit|too many/i.test(text)) return 'Bạn thao tác quá nhanh. Vui lòng chờ một lúc rồi thử lại.';
  if (/failed to fetch|network/i.test(text)) return 'Không kết nối được máy chủ. Vui lòng kiểm tra mạng.';
  if (/row.level|permission denied|not authorized/i.test(text)) return 'Bạn không có quyền thực hiện thao tác này hoặc cần xác thực hai bước.';
  return text;
}

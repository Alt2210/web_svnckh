# Landing page — phương án thử nghiệm

`App.tsx` và `styles.css` được sao chép nguyên bản từ hai file cùng tên ở thư mục gốc workspace.

Từ thư mục `main`, chạy:

```powershell
npm.cmd run dev:temp
```

Hoặc chạy `npm.cmd run dev`, rồi mở đường dẫn `/temp/` trên địa chỉ Vite in ra, mặc định `http://127.0.0.1:5173/temp/`.

Trang chính vẫn ở `/`. Phương án thử nghiệm dùng HTML entry và CSS riêng để kiểm tra độc lập với giao diện chính.

Logo `/assets/logo.svg`, `/assets/logo-white.svg` và font đã được chuẩn bị từ `Assets` của workspace.

`npm.cmd run build` kiểm tra TypeScript và build cả hai phương án. Bản thử nghiệm được xuất tại `dist/temp/index.html`.

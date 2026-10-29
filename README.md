This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Google Ads OAuth nhiều khách hàng

Khách bấm **Kết nối Google Ads**, cấp quyền trên Google, chọn tài khoản rồi xem/xuất báo cáo.
Không dùng refresh token hoặc customer ID chung trong biến môi trường nữa.

### Cấu hình của công ty

1. Bật Google Ads API trong Google Cloud project của công ty và cấu hình OAuth consent screen.
2. Tạo OAuth client loại **Web application**, không phải Desktop app.
3. Đăng ký Authorized redirect URI chính xác: `http://localhost:3000/api/ads-auth/callback`.
   Khi triển khai, thêm `https://your-domain/api/ads-auth/callback` và đặt `NEXTAUTH_URL=https://your-domain`.
4. Điền client ID, client secret, developer token vào `.env.local` theo `.env.local.example`.
   Tạo `NEXTAUTH_SECRET` ngẫu nhiên bằng `openssl rand -base64 32`; dùng cùng secret trên mọi instance.
5. Khi OAuth app ở Testing, thêm khách vào Test users. Kiểm tra quyền Google Ads API trên Cloud
   project sở hữu OAuth Client ID; Explorer cho phép truy cập tài khoản thật trong hạn mức.
   Đăng ký Basic yêu cầu hoàn tất brand verification. Không dùng mức quyền cũ trong API Center
   làm căn cứ và không nhầm OAuth Testing với quyền Test của Google Ads API.
6. Khởi động lại server, mở app và kết nối Google. Không yêu cầu khách tự tạo Cloud project hay gửi token.

### Phạm vi và bảo mật

- Scope: `https://www.googleapis.com/auth/adwords`. API của app chỉ đọc báo cáo.
- OAuth dùng state một lần, PKCE và cookie HttpOnly/SameSite=Lax; production yêu cầu HTTPS.
- Refresh token nằm trong cookie phiên mã hóa (JWE), tối đa 30 ngày, không có trong JSON trả cho trình duyệt.
  Mỗi trình duyệt có phiên độc lập; chưa có cơ sở dữ liệu người dùng hoặc lịch crawl nền.
- Danh sách tài khoản dùng ListAccessibleCustomers: chỉ tài khoản được cấp quyền trực tiếp.
  Chưa triển khai duyệt tài khoản con qua MCC; không tự thêm khách vào MCC công ty.
- Server kiểm tra tài khoản được phép trước khi lưu lựa chọn. Báo cáo và CSV dùng token trong phiên đó.
- Đăng xuất xóa cookie tại trình duyệt, không thu hồi quyền Google. Khách có thể thu hồi quyền tại
  https://myaccount.google.com/permissions. Cookie đã sao chép vẫn có hiệu lực đến khi hết hạn;
  muốn quản lý phiên/thu hồi tập trung và crawl nền cần kho token mã hóa phía server.
- Không commit `.env.local`. File mẫu chỉ chứa placeholder; thay khóa thật nếu trước đây đã chia sẻ.

Tài liệu: https://developers.google.com/google-ads/api/docs/oauth/multi-user-authentication

### Trang công khai và xác minh thương hiệu

- `/about`: trang giới thiệu `automatic-content`, chức năng, quyền OAuth và liên hệ.
- `/privacy`: bản mô tả xử lý dữ liệu theo mã nguồn hiện tại, có liên kết thu hồi quyền Google.
- `/`: dashboard được giữ nguyên; liên kết chính sách xuất hiện trước bước kết nối Google.
- Mặc định hai trang thông tin có nhãn **bản nháp** và `noindex, nofollow`. Đây chưa phải
  hồ sơ đã công bố hoặc đã được Google duyệt. Liên kết vẫn truy cập công khai, không phải kiểm soát truy cập.
- Chủ ứng dụng cần xác nhận tên ứng dụng, email hỗ trợ trong `src/lib/branding.ts`, danh tính đơn vị
  vận hành, cam kết sử dụng dữ liệu và cách xử lý yêu cầu xóa. Không tự dùng tên hay tên miền của công ty.
- Trước khi triển khai, bổ sung thông tin nhà cung cấp hosting, nơi lưu dữ liệu và thời hạn nhật ký
  thực tế vào chính sách; thay đoạn ghi chú về hạ tầng triển khai. Rà soát lại nếu thay cách lưu token,
  thêm cơ sở dữ liệu, tác vụ nền, analytics hoặc tích hợp bên thứ ba.
- Sau khi chủ ứng dụng duyệt toàn bộ nội dung, đặt `BRANDING_CONTENT_APPROVED=true` trên môi trường
  triển khai và build lại. Biến này chỉ bỏ nhãn bản nháp/noindex, không phải xác minh Google hay bảo đảm tuân thủ.
- Triển khai trên tên miền HTTPS có quyền kiểm soát, bảo đảm `/about` và `/privacy` truy cập được
  không cần đăng nhập, và xác minh quyền sở hữu tên miền bằng Google Search Console.
- Trên Branding của đúng project, điền Application home page là `https://YOUR_DOMAIN/about`,
  Application privacy policy link là `https://YOUR_DOMAIN/privacy`, và Authorized domains phù hợp.
  `YOUR_DOMAIN` là placeholder; không lưu nguyên giá trị này lên Google Cloud.
- Cập nhật redirect URI và `NEXTAUTH_URL` theo tên miền triển khai nếu chuyển cả dashboard.
  Không tự xóa redirect URI hay authorized domain cũ đang phục vụ ứng dụng khác.
- Chỉ thay đổi Publishing status/gửi brand verification sau khi chủ ứng dụng xác nhận. Khi brand
  verification được duyệt, quay lại Google Ads API Overview để đăng ký Basic nếu cần.

Tài liệu xác minh: https://developers.google.com/identity/protocols/oauth2/production-readiness/brand-verification

Mức truy cập Google Ads API: https://developers.google.com/google-ads/api/docs/access-levels

### Kiểm tra thủ công

- Chưa đăng nhập: báo cáo/CSV trả 401; UI hiển thị nút kết nối.
- Từ chối consent, callback sai state hoặc hết 10 phút: không tạo phiên mới.
- Hai cửa sổ trình duyệt độc lập kết nối hai Google account: dữ liệu không dùng chung.
- Chọn ID ngoài danh sách hoặc POST từ origin khác: trả 403.
- Chọn tài khoản hợp lệ: tải báo cáo và CSV; đăng xuất: không đọc được báo cáo nữa.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

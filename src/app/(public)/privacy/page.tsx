import type { Metadata } from "next";
import Link from "next/link";
import { appName, supportEmail } from "@/lib/branding";
import styles from "../public.module.css";

export const metadata: Metadata = {
  title: `Chính sách quyền riêng tư | ${appName}`,
  description: "Thông tin về truy cập, sử dụng, lưu trữ và thu hồi quyền đối với dữ liệu Google Ads trong automatic-content.",
};

export default function PrivacyPage() {
  return (
    <article className={styles.article}>
      <p className={styles.eyebrow}>{appName} · Dữ liệu của bạn</p>
      <h1>Chính sách quyền riêng tư</h1>
      <p>Phiên bản nội dung: <time dateTime="2026-10-29">29/10/2026</time>.</p>
      <p>Chính sách này mô tả cách <Link href="/about">{appName}</Link> xử lý dữ liệu
        khi bạn kết nối Google Ads, xem báo cáo và xuất CSV. Liên hệ phụ trách ứng dụng
        và yêu cầu về dữ liệu: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>

      <h2>1. Dữ liệu được truy cập</h2>
      <ul>
        <li>Danh sách mã tài khoản Google Ads được cấp quyền truy cập trực tiếp và mã tài khoản bạn chọn.</li>
        <li>Dữ liệu báo cáo: chiến dịch, nhóm quảng cáo, từ khóa, cụm từ tìm kiếm, ngày báo cáo,
          lượt hiển thị, lượt nhấp, chi phí, chuyển đổi và các chỉ số liên quan.</li>
        <li>Mã truy cập OAuth và refresh token để máy chủ thực hiện các yêu cầu Google Ads đã được bạn cho phép.</li>
        <li>Thông tin do bạn tự cung cấp khi liên hệ hỗ trợ, chẳng hạn email và nội dung yêu cầu.</li>
      </ul>
      <p>Ứng dụng không nhận mật khẩu Google. Báo cáo chuyển đổi trong phiên bản này là
        số liệu quảng cáo, không phải tính năng tải danh sách thông tin liên hệ cá nhân
        từ biểu mẫu khách hàng tiềm năng.</p>

      <h2>2. Mục đích sử dụng và quyền Google</h2>
      <p>Dữ liệu được sử dụng để xác định tài khoản được phép truy cập, hiển thị báo cáo,
        tính toán chỉ số trên dashboard, xuất CSV theo yêu cầu và xử lý sự cố kết nối.</p>
      <p>Ứng dụng yêu cầu phạm vi <code>https://www.googleapis.com/auth/adwords</code>.
        Phạm vi này có khả năng quản lý dữ liệu Google Ads, nhưng chức năng hiện tại
        của ứng dụng chỉ đọc báo cáo; không tạo hoặc sửa quảng cáo, chiến dịch hay ngân sách.</p>
      <p>Dữ liệu Google không được sử dụng để bán, xây dựng hồ sơ quảng cáo cá nhân,
        chấm điểm tín dụng hoặc huấn luyện mô hình AI tổng quát.</p>

      <h2>3. Lưu trữ, thời hạn và bảo vệ dữ liệu</h2>
      <ul>
        <li>Cookie <code>ads-session</code> chứa refresh token và mã tài khoản được chọn
          dưới dạng mã hóa. Cookie có thuộc tính HttpOnly và SameSite=Lax, có thời hạn
          tối đa 30 ngày mỗi lần lưu phiên; cấu hình production sử dụng Secure và HTTPS.</li>
        <li>Cookie <code>ads-oauth-flow</code> lưu trạng thái bảo vệ luồng đăng nhập và
          thông tin PKCE dưới dạng mã hóa trong tối đa 10 phút, được xóa khi xử lý callback.</li>
        <li>Refresh token không được trả dưới dạng văn bản trong JSON cho mã JavaScript
          giao diện. Máy chủ giải mã phiên khi cần gọi Google Ads.</li>
        <li>Phiên bản hiện tại không có cơ sở dữ liệu lưu lịch sử báo cáo hoặc tác vụ thu thập
          nền. Dữ liệu được xử lý khi có yêu cầu và hiển thị trong phiên trình duyệt.</li>
        <li>CSV tải về được lưu trên thiết bị của bạn. Bạn kiểm soát thời gian lưu và việc xóa
          hoặc chia sẻ các tệp này.</li>
      </ul>
      <p>Ứng dụng ghi loại lỗi và mã lỗi kỹ thuật để chẩn đoán tải báo cáo. Không gửi token,
        cookie hoặc dữ liệu quảng cáo nhạy cảm trong yêu cầu hỗ trợ. Nội dung email hỗ trợ
        bạn gửi được lưu trong hộp thư liên hệ; bạn có thể yêu cầu xóa qua địa chỉ trên.</p>

      <h2>4. Truyền dữ liệu và dịch vụ bên ngoài</h2>
      <p>Máy chủ ứng dụng trao đổi thông tin xác thực và yêu cầu báo cáo với Google OAuth
        và Google Ads API. Dữ liệu báo cáo được trả về trình duyệt của người dùng đã được cấp
        quyền và có thể được tải xuống khi người dùng yêu cầu xuất CSV.</p>
      <p>Giao diện hiện tải phông chữ từ Google Fonts. Trình duyệt kết nối tới Google để
        lấy phông chữ; yêu cầu này có thể truyền thông tin kết nối như địa chỉ IP và loại
        trình duyệt. Ứng dụng không gửi báo cáo Google Ads hoặc OAuth token đến dịch vụ phông chữ.</p>
      <p>Ứng dụng không tích hợp công cụ theo dõi quảng cáo hoặc phân tích hành vi bên thứ ba.
        Việc sử dụng hạ tầng lưu trữ và nhật ký của nhà cung cấp triển khai phải được công bố
        phù hợp khi đưa ứng dụng lên môi trường công khai.</p>

      <h2>5. Ngắt kết nối, thu hồi quyền và xóa dữ liệu</h2>
      <ol>
        <li>Trong dashboard, mở mục kết nối và chọn <strong>Đăng xuất khỏi ứng dụng</strong>
          để xóa cookie phiên trên trình duyệt đó.</li>
        <li>Để thu hồi quyền OAuth, mở <a href="https://myaccount.google.com/connections">các kết nối
          với ứng dụng bên thứ ba trong tài khoản Google</a>, chọn {appName} và xóa quyền truy cập.</li>
        <li>Xóa các tệp CSV đã tải về nếu bạn không muốn giữ bản sao báo cáo.</li>
        <li>Gửi yêu cầu về dữ liệu hoặc email hỗ trợ đã cung cấp tới <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</li>
      </ol>
      <p>Đăng xuất không tự thu hồi quyền Google và không đăng xuất các trình duyệt khác.
        Nếu cần vô hiệu hóa quyền truy cập của ứng dụng, hãy thu hồi quyền tại Google.
        Xóa dữ liệu của ứng dụng không xóa chiến dịch hoặc dữ liệu gốc trong Google Ads.</p>

      <h2>6. Giới hạn sử dụng dữ liệu Google</h2>
      <p>Việc {appName} sử dụng và chuyển dữ liệu nhận được từ Google APIs tuân thủ
        <a href="https://developers.google.com/terms/api-services-user-data-policy"> Google API Services
          User Data Policy</a>, bao gồm các yêu cầu Limited Use. Dữ liệu chỉ phục vụ các
        chức năng người dùng đã được thông báo và cho phép.</p>

      <h2>7. Thay đổi chính sách và liên hệ</h2>
      <p>Khi thay đổi cách truy cập hoặc sử dụng dữ liệu, nội dung này sẽ được cập nhật.
        Nếu bổ sung mục đích sử dụng mới, ứng dụng phải thông báo và xin lại sự đồng ý
        trước khi sử dụng dữ liệu cho mục đích đó.</p>
      <p>Mọi thắc mắc hoặc yêu cầu hỗ trợ về quyền riêng tư: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
    </article>
  );
}

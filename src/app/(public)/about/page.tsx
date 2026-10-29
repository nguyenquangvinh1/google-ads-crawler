import type { Metadata } from "next";
import Link from "next/link";
import { appName, supportEmail } from "@/lib/branding";
import styles from "../public.module.css";

export const metadata: Metadata = {
  title: `${appName} | Công cụ báo cáo Google Ads`,
  description: "Tìm hiểu automatic-content: xem, phân tích và xuất báo cáo từ tài khoản Google Ads mà bạn được cấp quyền truy cập.",
};

export default function AboutPage() {
  return (
    <>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Google Ads · Báo cáo & phân tích</p>
        <h1>Dữ liệu quảng cáo.<br />Một nơi để theo dõi.</h1>
        <p className={styles.intro}>
          <strong>{appName}</strong> là ứng dụng báo cáo dành cho người quản lý quảng cáo
          và đội ngũ phân tích. Kết nối tài khoản Google của bạn để xem dữ liệu Google Ads
          được cấp quyền, so sánh hiệu suất và tải báo cáo CSV.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} href="/">Mở dashboard</Link>
          <Link href="/privacy">Tìm hiểu cách xử lý dữ liệu →</Link>
        </div>
      </section>

      <div className={styles.grid}>
        <section className={styles.card}>
          <h2>Đọc báo cáo</h2>
          <p>Theo dõi chiến dịch, nhóm quảng cáo, từ khóa, cụm từ tìm kiếm và chỉ số
            chuyển đổi mà Google Ads cung cấp cho tài khoản của bạn.</p>
        </section>
        <section className={styles.card}>
          <h2>Phân tích hiệu suất</h2>
          <p>Xem lượt hiển thị, lượt nhấp, chi phí và chuyển đổi. Lọc khoảng thời gian,
            tìm kiếm trong báo cáo và theo dõi các chỉ số trên dashboard.</p>
        </section>
        <section className={styles.card}>
          <h2>Xuất dữ liệu</h2>
          <p>Tải báo cáo CSV về thiết bị để phục vụ phân tích và báo cáo của bạn.
            Việc lưu trữ và chia sẻ bản xuất do bạn quyết định.</p>
        </section>
      </div>

      <section className={styles.panel}>
        <h2>Kết nối theo quyền của bạn</h2>
        <ol>
          <li>Mở dashboard và đọc chính sách quyền riêng tư trước khi kết nối.</li>
          <li>Đăng nhập và cấp quyền trên trang Google. Ứng dụng không yêu cầu bạn cung cấp mật khẩu Google.</li>
          <li>Chọn tài khoản quảng cáo mà Google cho phép bạn truy cập, rồi tải báo cáo.</li>
        </ol>
        <p>Phiên bản hiện tại liệt kê các tài khoản được cấp quyền trực tiếp; chưa duyệt
          tài khoản con qua MCC. Tài khoản quản lý không phải tài khoản đích để lấy số liệu
          chiến dịch. Dữ liệu khả dụng còn phụ thuộc quyền tài khoản và giới hạn Google Ads API.</p>
      </section>

      <section className={styles.panel}>
        <h2>Quyền truy cập rõ ràng, mục đích cụ thể</h2>
        <p>Ứng dụng yêu cầu phạm vi OAuth <code>https://www.googleapis.com/auth/adwords</code>.
          Đây là quyền Google Ads có khả năng đọc và quản lý dữ liệu, không phải một quyền
          chỉ đọc riêng. Tuy nhiên, chức năng hiện tại của {appName} chỉ truy vấn và xuất
          báo cáo; không tạo quảng cáo, đổi ngân sách hoặc chỉnh sửa chiến dịch.</p>
        <p>Bạn có thể đăng xuất khỏi ứng dụng và thu hồi quyền trong tài khoản Google.
          Xem <Link href="/privacy">chính sách quyền riêng tư</Link> để biết dữ liệu
          nào được sử dụng, cách lưu phiên và cách yêu cầu hỗ trợ.</p>
      </section>

      <section className={styles.panel}>
        <h2>Liên hệ ứng dụng</h2>
        <p>Câu hỏi về kết nối, báo cáo hoặc dữ liệu của bạn: <a href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
        <p>Không gửi mật khẩu, mã xác thực, cookie hoặc mã truy cập khi liên hệ hỗ trợ.</p>
      </section>
    </>
  );
}

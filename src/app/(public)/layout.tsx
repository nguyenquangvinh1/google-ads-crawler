import type { Metadata } from "next";
import Link from "next/link";
import { appName, brandingApproved, supportEmail } from "@/lib/branding";
import styles from "./public.module.css";

export const metadata: Metadata = {
  robots: { index: brandingApproved, follow: brandingApproved },
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.site}>
      <a className={styles.skipLink} href="#public-content">Bỏ qua điều hướng</a>
      <header className={styles.header}>
        <Link className={styles.brand} href="/about">
          <span className={styles.mark} aria-hidden="true">ac</span>
          {appName}
        </Link>
        <nav className={styles.navigation} aria-label="Thông tin ứng dụng">
          <Link href="/about">Giới thiệu</Link>
          <Link href="/privacy">Quyền riêng tư</Link>
          <Link href="/">Mở dashboard ↗</Link>
        </nav>
      </header>
      {!brandingApproved && (
        <aside className={styles.draft} aria-label="Trạng thái nội dung">
          <strong>Bản nháp để chủ ứng dụng duyệt.</strong> Chưa gửi xác minh Google.
          Cần xác nhận thông tin liên hệ, chính sách dữ liệu và tên miền triển khai trước khi công bố.
        </aside>
      )}
      <main id="public-content" className={styles.main}>{children}</main>
      <footer className={styles.footer}>
        <div><strong>{appName}</strong><p>Công cụ báo cáo Google Ads độc lập.</p></div>
        <nav aria-label="Liên hệ và chính sách">
          <Link href="/privacy">Chính sách quyền riêng tư</Link>
          <a href={`mailto:${supportEmail}`}>Liên hệ hỗ trợ</a>
        </nav>
        <p>Không phải sản phẩm do Google phát hành; không tuyên bố được Google chứng nhận.</p>
      </footer>
    </div>
  );
}

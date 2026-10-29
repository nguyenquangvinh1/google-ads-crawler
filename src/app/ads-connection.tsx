"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdsConnection() {
  const [accounts, setAccounts] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/ads-auth/session").then(async (response) => {
      if (new URLSearchParams(window.location.search).has("connection")) setError("Kết nối chưa thành công. Vui lòng thử lại hoặc liên hệ quản trị viên kiểm tra OAuth.");
      const result = await response.json();
      if (response.status === 401) return;
      if (!response.ok) throw new Error(result.error);
      setConnected(true);
      setAccounts(result.accounts);
    }).catch((reason) => setError(reason instanceof Error ? reason.message : "Không tải được kết nối")).finally(() => setLoading(false));
  }, []);

  async function select(customerId: string) {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ads-auth/select", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ customerId }) });
      if (!response.ok) throw new Error("Không thể chọn tài khoản. Vui lòng kết nối lại.");
      window.location.replace(new URL("/", window.location.origin).href);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Lỗi kết nối");
      setLoading(false);
    }
  }

  return <div className="setup-guide">
    <h2>Kết nối Google Ads</h2>
    <p className="subtitle">Đăng nhập Google và cấp quyền để xem báo cáo. Không cần cung cấp mật khẩu cho công ty hoặc tham gia MCC công ty.</p>
    <p>Ứng dụng hiển thị trên Google với tên <strong>automatic-content</strong>. Trước khi cấp quyền,
      xem <Link href="/about">giới thiệu ứng dụng</Link> và <Link href="/privacy">chính sách quyền riêng tư</Link>.</p>
    {error && <p role="alert" className="error-banner">{error}</p>}
    {loading ? <p>Đang tải…</p> : <>
      {connected && <>
        <h3>Chọn tài khoản Google Ads</h3>
        {accounts.length === 0 && <p>Không tìm thấy tài khoản được cấp quyền trực tiếp cho người dùng Google này.</p>}
        <p>Danh sách hiện hỗ trợ các tài khoản được cấp quyền trực tiếp; chưa duyệt tài khoản con qua MCC.</p>
        {accounts.map((customerId) => <button className="btn btn-outline" key={customerId} onClick={() => select(customerId)}>{customerId}</button>)}
      </>}
      <p><button className="btn btn-primary" onClick={() => window.location.replace(new URL("/api/ads-auth/connect", window.location.origin).href)}>{connected ? "Kết nối lại / Đổi tài khoản Google" : "Kết nối Google Ads"}</button></p>
      {connected && <button className="btn btn-outline" onClick={async () => {
        try {
          const response = await fetch("/api/ads-auth/disconnect", { method: "POST" });
          if (!response.ok) throw new Error();
          window.location.replace(new URL("/", window.location.origin).href);
        } catch { setError("Không thể ngắt kết nối. Vui lòng thử lại."); }
      }}>Đăng xuất khỏi ứng dụng</button>}
    </>}
  </div>;
}

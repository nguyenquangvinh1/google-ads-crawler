import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Google Ads Crawler | Dashboard",
  description: "Crawl và phân tích dữ liệu từ Google Ads - Leads, Campaigns, Keywords, Search Terms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "@fontsource/be-vietnam-pro/800.css";
import "@fontsource-variable/source-serif-4/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "HóaLab — Nền tảng tự học Hóa học THPT",
  description: "Học Hóa 10, 11 và 12 qua video tương tác, bài luyện tập và thí nghiệm ảo.",
  openGraph: {
    title: "HóaLab — Nền tảng tự học Hóa học THPT",
    description: "Video tương tác, bài luyện tập và thí nghiệm ảo dành cho học sinh THPT.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HóaLab — Nền tảng tự học Hóa học THPT",
    description: "Video tương tác, bài luyện tập và thí nghiệm ảo dành cho học sinh THPT.",
  },
  other: {
    "page-type": "software",
    "site-kind": "software",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" data-type="software" data-radius="soft" data-buttons="solid" data-motion="quiet">
      <body className="antialiased">{children}</body>
    </html>
  );
}

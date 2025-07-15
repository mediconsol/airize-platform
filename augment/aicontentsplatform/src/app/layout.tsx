import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthProvider from "@/components/providers/AuthProvider";
import MainLayout from "@/components/layout/MainLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AIrize - AI 콘텐츠 마켓플레이스",
  description: "AI로 생성된 콘텐츠를 업로드하고, 거래하고, 공유할 수 있는 프리미엄 마켓플레이스",
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AIrize",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "AIrize Platform",
    title: "AIrize - AI 콘텐츠 마켓플레이스",
    description: "AI로 생성된 콘텐츠를 업로드하고, 거래하고, 공유할 수 있는 프리미엄 마켓플레이스",
  },
  twitter: {
    card: "summary",
    title: "AIrize - AI 콘텐츠 마켓플레이스",
    description: "AI로 생성된 콘텐츠를 업로드하고, 거래하고, 공유할 수 있는 프리미엄 마켓플레이스",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <MainLayout>
            {children}
          </MainLayout>
        </AuthProvider>
      </body>
    </html>
  );
}

'use client';

import Header from './Header';
import Footer from './Footer';
import { ResponsiveNavigation } from './ResponsiveNavigation';
import { useResponsive } from '@/hooks/useResponsive';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const { isMobile, isTablet } = useResponsive();

  return (
    <div className="min-h-screen flex flex-col">
      {/* 반응형 네비게이션 */}
      <ResponsiveNavigation />

      {/* 데스크톱용 기존 헤더 */}
      {!isMobile && !isTablet && <Header />}

      {/* 메인 콘텐츠 */}
      <main className={`flex-1 ${
        isMobile ? 'pt-14 pb-16' : isTablet ? 'pt-16' : ''
      }`}>
        {children}
      </main>

      {/* 데스크톱용 푸터 */}
      {!isMobile && <Footer />}
    </div>
  );
}

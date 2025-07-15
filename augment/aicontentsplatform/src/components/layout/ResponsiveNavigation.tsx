'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useResponsive } from '@/hooks/useResponsive';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { PWAInstallButton } from '@/components/ui/pwa-install-button';
import {
  Menu,
  Home,
  Search,
  Upload,
  BarChart3,
  User,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface NavigationItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  requireAuth?: boolean;
}

const navigationItems: NavigationItem[] = [
  { href: '/', label: '홈', icon: Home },
  { href: '/explore', label: '탐색', icon: Search },
  { href: '/upload', label: '업로드', icon: Upload, requireAuth: true },
  { href: '/my-content', label: '내 콘텐츠', icon: User, requireAuth: true },
  { href: '/stats', label: '통계', icon: BarChart3 },
];

export function ResponsiveNavigation() {
  const { isMobile, isTablet } = useResponsive();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const filteredItems = navigationItems.filter(item => 
    !item.requireAuth || user
  );

  // 모바일 네비게이션
  if (isMobile) {
    return (
      <>
        {/* 상단 헤더 */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-4 h-14">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">AIrize</span>
            </Link>
            
            <div className="flex items-center space-x-2">
              <PWAInstallButton size="sm" />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80">
                  <div className="flex flex-col h-full">
                    <div className="flex items-center space-x-2 mb-6">
                      <Sparkles className="h-6 w-6 text-primary" />
                      <span className="font-bold text-lg">AIrize</span>
                    </div>
                    
                    <nav className="flex-1 space-y-2">
                      {filteredItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                              isActive
                                ? 'bg-primary text-primary-foreground'
                                : 'hover:bg-muted'
                            }`}
                          >
                            <Icon className="h-5 w-5" />
                            <span>{item.label}</span>
                          </Link>
                        );
                      })}
                    </nav>
                    
                    {user && (
                      <div className="border-t pt-4 space-y-2">
                        <div className="px-3 py-2">
                          <p className="text-sm font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                        >
                          <LogOut className="mr-3 h-4 w-4" />
                          로그아웃
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>

        {/* 하단 탭 네비게이션 */}
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t">
          <div className="flex items-center justify-around px-2 py-2">
            {filteredItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </>
    );
  }

  // 태블릿 네비게이션
  if (isTablet) {
    return (
      <>
        {/* 상단 헤더 */}
        <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
          <div className="flex items-center justify-between px-6 h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-7 w-7 text-primary" />
              <span className="font-bold text-xl">AIrize Platform</span>
            </Link>
            
            <nav className="flex items-center space-x-6">
              {filteredItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
            
            <div className="flex items-center space-x-3">
              <PWAInstallButton />
              {user ? (
                <Button variant="outline" onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  로그아웃
                </Button>
              ) : (
                <Button>로그인</Button>
              )}
            </div>
          </div>
        </header>
      </>
    );
  }

  // 데스크톱 네비게이션 (기존 유지)
  return null;
}

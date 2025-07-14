'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';
import ProfileModal from '@/components/auth/ProfileModal';

export default function Header() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'signin' | 'signup'>('signin');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleAuthClick = (tab: 'signin' | 'signup') => {
    setAuthModalTab(tab);
    setAuthModalOpen(true);
  };

  return (
    <>
      {/* Navigation */}
      <nav className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold gradient-text">AIrize</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link href="/explore" className="text-muted-foreground hover:text-foreground transition-colors">
              콘텐츠 탐색
            </Link>
            {user && (
              <>
                <Link href="/upload" className="text-muted-foreground hover:text-foreground transition-colors">
                  콘텐츠 업로드
                </Link>
                <Link href="/my-content" className="text-muted-foreground hover:text-foreground transition-colors">
                  내 콘텐츠
                </Link>
              </>
            )}
            <Link href="/stats" className="text-muted-foreground hover:text-foreground transition-colors">
              플랫폼 통계
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              요금제
            </Link>
          </div>
          
          <div className="flex items-center space-x-3">
            {user ? (
              <UserMenu
                onProfileClick={() => setProfileModalOpen(true)}
                onSettingsClick={() => {/* 설정 페이지로 이동 */}}
              />
            ) : (
              <>
                <Button variant="ghost" onClick={() => handleAuthClick('signin')} className="hidden sm:inline-flex">
                  로그인
                </Button>
                <Button className="gradient-bg hidden sm:inline-flex" onClick={() => handleAuthClick('signup')}>
                  시작하기
                </Button>
              </>
            )}

            {/* 모바일 메뉴 버튼 */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link
                href="/explore"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                콘텐츠 탐색
              </Link>
              {user && (
                <>
                  <Link
                    href="/upload"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    콘텐츠 업로드
                  </Link>
                  <Link
                    href="/my-content"
                    className="block text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    내 콘텐츠
                  </Link>
                </>
              )}
              <Link
                href="/stats"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                플랫폼 통계
              </Link>
              <Link
                href="/pricing"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                요금제
              </Link>

              {!user && (
                <div className="pt-4 border-t space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      handleAuthClick('signin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    className="gradient-bg w-full"
                    onClick={() => {
                      handleAuthClick('signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    시작하기
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* 인증 모달 */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultTab={authModalTab}
      />

      {/* 프로필 모달 */}
      <ProfileModal 
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}

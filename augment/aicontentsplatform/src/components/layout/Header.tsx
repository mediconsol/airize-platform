'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Sparkles, Menu, X, Upload, Search, BarChart3, CreditCard, Plus } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';
import ProfileModal from '@/components/auth/ProfileModal';
import { PWAInstallButton } from '@/components/ui/pwa-install-button';

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
      {/* Premium Navigation */}
      <nav className="border-b border-border/50 bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5 flex items-center justify-between">
          {/* Premium Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-105">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold gradient-text tracking-tight">AIrize</span>
                <span className="text-xs text-muted-foreground font-medium tracking-wider">PREMIUM</span>
              </div>
            </Link>
          </div>

          {/* Premium Navigation Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link
              href="/explore"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span>콘텐츠 탐색</span>
            </Link>

            <Link
              href="/stats"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium hover:scale-105"
            >
              <BarChart3 className="w-4 h-4" />
              <span>플랫폼 통계</span>
            </Link>

            <Link
              href="/pricing"
              className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              <span>요금제</span>
            </Link>

            {user && (
              <Link
                href="/my-content"
                className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium hover:scale-105"
              >
                <span>내 콘텐츠</span>
              </Link>
            )}
          </div>

          {/* Premium Action Buttons */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {/* Premium Upload Button */}
                <Link href="/upload">
                  <Button
                    size="lg"
                    className="gradient-bg hidden sm:inline-flex px-6 py-3 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span className="font-semibold">콘텐츠 업로드</span>
                  </Button>
                </Link>

                {/* User Menu */}
                <UserMenu
                  onProfileClick={() => setProfileModalOpen(true)}
                  onSettingsClick={() => {/* 설정 페이지로 이동 */}}
                />
              </>
            ) : (
              <>
                {/* PWA Install Button */}
                <PWAInstallButton variant="ghost" className="hidden lg:inline-flex" />

                {/* Auth Buttons */}
                <Button
                  variant="ghost"
                  onClick={() => handleAuthClick('signin')}
                  className="hidden sm:inline-flex font-medium hover:bg-primary/5 transition-all duration-200"
                >
                  로그인
                </Button>
                <Button
                  className="gradient-bg hidden sm:inline-flex px-6 py-3 rounded-full shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleAuthClick('signup')}
                >
                  <span className="font-semibold">무료로 시작하기</span>
                </Button>
              </>
            )}

            {/* Premium Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2 hover:bg-primary/5 transition-all duration-200"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Premium Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-border/50 bg-background/98 backdrop-blur-xl shadow-lg">
            <div className="container mx-auto px-6 py-6 space-y-6">
              {/* Mobile Navigation Links */}
              <div className="space-y-4">
                <Link
                  href="/explore"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium p-2 rounded-lg hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Search className="w-5 h-5" />
                  <span>콘텐츠 탐색</span>
                </Link>

                <Link
                  href="/stats"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium p-2 rounded-lg hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-5 h-5" />
                  <span>플랫폼 통계</span>
                </Link>

                <Link
                  href="/pricing"
                  className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium p-2 rounded-lg hover:bg-primary/5"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <CreditCard className="w-5 h-5" />
                  <span>요금제</span>
                </Link>

                {user && (
                  <Link
                    href="/my-content"
                    className="flex items-center space-x-3 text-muted-foreground hover:text-foreground transition-all duration-200 font-medium p-2 rounded-lg hover:bg-primary/5"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span>내 콘텐츠</span>
                  </Link>
                )}
              </div>

              {/* Mobile Action Buttons */}
              {user ? (
                <div className="pt-4 border-t border-border/50">
                  <Link href="/upload" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="gradient-bg w-full py-4 rounded-full shadow-lg">
                      <Plus className="w-5 h-5 mr-2" />
                      <span className="font-semibold">콘텐츠 업로드</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <Button
                    variant="ghost"
                    className="w-full justify-center py-4 font-medium hover:bg-primary/5 transition-all duration-200"
                    onClick={() => {
                      handleAuthClick('signin');
                      setMobileMenuOpen(false);
                    }}
                  >
                    로그인
                  </Button>
                  <Button
                    className="gradient-bg w-full py-4 rounded-full shadow-lg"
                    onClick={() => {
                      handleAuthClick('signup');
                      setMobileMenuOpen(false);
                    }}
                  >
                    <span className="font-semibold">무료로 시작하기</span>
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

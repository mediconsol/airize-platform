'use client';

import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t bg-muted/30 py-12 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold gradient-text">AIrize</span>
          </div>
          <div className="flex space-x-6 text-muted-foreground">
            <Link href="/about" className="hover:text-foreground transition-colors">소개</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">개인정보처리방침</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">이용약관</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">문의하기</Link>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-muted-foreground">
          <p>&copy; 2025 AIrize. 모든 권리 보유.</p>
        </div>
      </div>
    </footer>
  );
}

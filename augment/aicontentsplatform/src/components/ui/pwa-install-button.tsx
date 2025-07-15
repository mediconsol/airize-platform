'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Check, Smartphone, Laptop } from 'lucide-react';
import { usePWA } from '@/hooks/useResponsive';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PWAInstallButtonProps {
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function PWAInstallButton({
  variant = 'outline',
  size = 'default',
  className = '',
}: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [showDialog, setShowDialog] = useState(false);

  // 이미 설치된 경우 버튼 숨김
  if (isInstalled) {
    return null;
  }

  // 설치 불가능한 경우 버튼 숨김
  if (!isInstallable) {
    return null;
  }

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={() => setShowDialog(true)}
      >
        <Download className="mr-2 h-4 w-4" />
        앱 설치하기
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>AIrize 앱 설치하기</DialogTitle>
            <DialogDescription>
              더 나은 사용자 경험을 위해 AIrize 앱을 설치하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
              <Smartphone className="h-12 w-12 text-primary mb-2" />
              <h3 className="text-sm font-medium">모바일 앱</h3>
              <p className="text-xs text-muted-foreground text-center mt-1">
                홈 화면에 추가하여 앱처럼 사용
              </p>
            </div>
            <div className="flex flex-col items-center justify-center p-4 border rounded-lg">
              <Laptop className="h-12 w-12 text-primary mb-2" />
              <h3 className="text-sm font-medium">데스크톱 앱</h3>
              <p className="text-xs text-muted-foreground text-center mt-1">
                별도 창에서 앱처럼 실행
              </p>
            </div>
          </div>
          <div className="bg-muted p-3 rounded-lg">
            <h4 className="text-sm font-medium mb-2">앱 설치 혜택</h4>
            <ul className="text-xs space-y-1">
              <li>• 오프라인에서도 일부 기능 사용 가능</li>
              <li>• 더 빠른 로딩 속도</li>
              <li>• 홈 화면에서 바로 접근</li>
              <li>• 알림 수신 (향후 지원 예정)</li>
            </ul>
          </div>
          <DialogFooter className="sm:justify-start">
            <Button
              type="button"
              variant="default"
              onClick={() => {
                installPWA();
                setShowDialog(false);
              }}
            >
              <Download className="mr-2 h-4 w-4" />
              앱 설치하기
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDialog(false)}
            >
              나중에
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

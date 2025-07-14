'use client';

import { useAuthContext } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lock, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireCreator?: boolean;
  fallback?: React.ReactNode;
  onAuthRequired?: () => void;
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true,
  requireCreator = false,
  fallback,
  onAuthRequired
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuthContext();

  // 로딩 중일 때
  if (loading) {
    return fallback || (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  // 인증이 필요한데 로그인하지 않은 경우
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle>로그인이 필요합니다</CardTitle>
            <CardDescription>
              이 페이지에 접근하려면 로그인이 필요합니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={onAuthRequired} className="w-full">
              <LogIn className="w-4 h-4 mr-2" />
              로그인하기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 크리에이터 권한이 필요한데 일반 사용자인 경우
  if (requireCreator && user && !user.roles.includes('creator')) {
    return fallback || (
      <div className="min-h-[400px] flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-yellow-500" />
            </div>
            <CardTitle>크리에이터 권한이 필요합니다</CardTitle>
            <CardDescription>
              이 기능은 크리에이터만 사용할 수 있습니다. 크리에이터로 등록해보세요.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button variant="outline" className="w-full">
              크리에이터 되기
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // 모든 조건을 만족하면 자식 컴포넌트 렌더링
  return <>{children}</>;
}

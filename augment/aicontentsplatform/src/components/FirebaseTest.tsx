'use client';

import { useEffect, useState } from 'react';
import { auth, db, storage } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { initializeFirestore, getSystemStats } from '@/lib/initFirestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2, Database, BarChart3 } from 'lucide-react';

export default function FirebaseTest() {
  const [firebaseStatus, setFirebaseStatus] = useState({
    auth: false,
    firestore: false,
    storage: false,
  });
  const [loading, setLoading] = useState(true);
  const [initLoading, setInitLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);
  const [systemStats, setSystemStats] = useState<any>(null);
  const { user, signInWithGoogle, signOut } = useAuth();

  useEffect(() => {
    const testFirebaseServices = async () => {
      try {
        // Auth 테스트
        const authStatus = !!auth;
        
        // Firestore 테스트
        const firestoreStatus = !!db;
        
        // Storage 테스트
        const storageStatus = !!storage;

        setFirebaseStatus({
          auth: authStatus,
          firestore: firestoreStatus,
          storage: storageStatus,
        });
      } catch (error) {
        console.error('Firebase 테스트 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    testFirebaseServices();
  }, []);

  const handleGoogleSignIn = async () => {
    const result = await signInWithGoogle();
    if (!result.success) {
      alert('로그인 실패: ' + result.error);
    }
  };

  const handleSignOut = async () => {
    const result = await signOut();
    if (!result.success) {
      alert('로그아웃 실패: ' + result.error);
    }
  };

  const handleInitFirestore = async () => {
    setInitLoading(true);
    try {
      const result = await initializeFirestore();
      if (result.success) {
        alert('✅ Firestore 초기화 완료!');
      } else {
        alert('❌ Firestore 초기화 실패: ' + result.error);
      }
    } catch (error) {
      alert('❌ 오류 발생: ' + error);
    } finally {
      setInitLoading(false);
    }
  };

  const handleGetStats = async () => {
    setStatsLoading(true);
    try {
      const result = await getSystemStats();
      if (result.success) {
        setSystemStats(result.data);
      } else {
        alert('❌ 통계 조회 실패: ' + result.error);
      }
    } catch (error) {
      alert('❌ 오류 발생: ' + error);
    } finally {
      setStatsLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Firebase 연결 테스트 중...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🔥 Firebase 연결 상태</CardTitle>
          <CardDescription>
            Firebase 서비스들의 연결 상태를 확인합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            {firebaseStatus.auth ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span>Authentication</span>
          </div>
          
          <div className="flex items-center gap-3">
            {firebaseStatus.firestore ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span>Firestore Database</span>
          </div>
          
          <div className="flex items-center gap-3">
            {firebaseStatus.storage ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span>Storage</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>🔐 인증 테스트</CardTitle>
          <CardDescription>
            Google 로그인을 테스트해보세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <div className="space-y-4">
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-300">
                  ✅ 로그인 성공!
                </p>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline">
                로그아웃
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground">
                로그인하지 않은 상태입니다.
              </p>
              <Button onClick={handleGoogleSignIn} className="w-full">
                Google로 로그인 테스트
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            🗂️ Firestore 데이터베이스 설정
          </CardTitle>
          <CardDescription>
            Firestore 초기 설정 및 시스템 통계를 확인하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Button
              onClick={handleInitFirestore}
              disabled={initLoading}
              variant="outline"
              className="flex-1"
            >
              {initLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Database className="w-4 h-4 mr-2" />
              )}
              Firestore 초기화
            </Button>

            <Button
              onClick={handleGetStats}
              disabled={statsLoading}
              variant="outline"
              className="flex-1"
            >
              {statsLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              시스템 통계 조회
            </Button>
          </div>

          {systemStats && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <h4 className="font-medium mb-2">📊 시스템 통계</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">총 사용자:</span>
                  <span className="ml-2 font-medium">{systemStats.totalUsers}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">총 콘텐츠:</span>
                  <span className="ml-2 font-medium">{systemStats.totalContents}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">총 다운로드:</span>
                  <span className="ml-2 font-medium">{systemStats.totalDownloads}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">총 수익:</span>
                  <span className="ml-2 font-medium">₩{systemStats.totalRevenue?.toLocaleString() || 0}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

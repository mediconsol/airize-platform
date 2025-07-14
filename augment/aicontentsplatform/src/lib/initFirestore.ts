import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './firebase';

// Firestore 초기 설정 함수
export const initializeFirestore = async () => {
  try {
    console.log('🔥 Firestore 초기화 시작...');

    // 시스템 설정 문서 생성
    const systemConfigRef = doc(db, 'system', 'config');
    const systemConfigSnap = await getDoc(systemConfigRef);

    if (!systemConfigSnap.exists()) {
      await setDoc(systemConfigRef, {
        version: '1.0.0',
        initialized: true,
        createdAt: new Date(),
        settings: {
          maxFileSize: 100 * 1024 * 1024, // 100MB
          allowedFileTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'video/mp4',
            'video/webm',
            'audio/mp3',
            'audio/wav',
            'application/pdf',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'text/plain'
          ],
          contentCategories: [
            'PPT/프레젠테이션',
            '엑셀/스프레드시트',
            '이미지/그래픽',
            '비디오/영상',
            '음악/오디오',
            '코드/프로그래밍',
            '문서/텍스트',
            '기타'
          ],
          aiTools: [
            'ChatGPT',
            'Claude',
            'Midjourney',
            'DALL-E',
            'Stable Diffusion',
            'Suno',
            'Runway',
            'GitHub Copilot',
            '기타'
          ]
        }
      });
      console.log('✅ 시스템 설정 문서 생성 완료');
    }

    // 통계 문서 초기화
    const statsRef = doc(db, 'system', 'stats');
    const statsSnap = await getDoc(statsRef);

    if (!statsSnap.exists()) {
      await setDoc(statsRef, {
        totalUsers: 0,
        totalContents: 0,
        totalDownloads: 0,
        totalRevenue: 0,
        lastUpdated: new Date()
      });
      console.log('✅ 통계 문서 생성 완료');
    }

    console.log('🎉 Firestore 초기화 완료!');
    return { success: true };

  } catch (error: any) {
    console.error('❌ Firestore 초기화 실패:', error);
    return { success: false, error: error.message };
  }
};

// 사용자 통계 업데이트 함수
export const updateUserStats = async (userId: string, action: 'increment' | 'decrement' = 'increment') => {
  try {
    const statsRef = doc(db, 'system', 'stats');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const currentStats = statsSnap.data();
      const newTotal = action === 'increment' 
        ? currentStats.totalUsers + 1 
        : Math.max(0, currentStats.totalUsers - 1);
      
      await setDoc(statsRef, {
        ...currentStats,
        totalUsers: newTotal,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('사용자 통계 업데이트 실패:', error);
  }
};

// 콘텐츠 통계 업데이트 함수
export const updateContentStats = async (action: 'increment' | 'decrement' = 'increment') => {
  try {
    const statsRef = doc(db, 'system', 'stats');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const currentStats = statsSnap.data();
      const newTotal = action === 'increment' 
        ? currentStats.totalContents + 1 
        : Math.max(0, currentStats.totalContents - 1);
      
      await setDoc(statsRef, {
        ...currentStats,
        totalContents: newTotal,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('콘텐츠 통계 업데이트 실패:', error);
  }
};

// 다운로드 통계 업데이트 함수
export const updateDownloadStats = async () => {
  try {
    const statsRef = doc(db, 'system', 'stats');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      const currentStats = statsSnap.data();
      
      await setDoc(statsRef, {
        ...currentStats,
        totalDownloads: currentStats.totalDownloads + 1,
        lastUpdated: new Date()
      });
    }
  } catch (error) {
    console.error('다운로드 통계 업데이트 실패:', error);
  }
};

// 시스템 통계 조회 함수
export const getSystemStats = async () => {
  try {
    const statsRef = doc(db, 'system', 'stats');
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      return { success: true, data: statsSnap.data() };
    } else {
      return { success: false, error: '통계 데이터를 찾을 수 없습니다.' };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

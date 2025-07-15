'use client';

import { useState, useEffect } from 'react';
import { 
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { User } from '@/types/firebase';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        // Firestore에서 사용자 정보 가져오기
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          // 새 사용자인 경우 Firestore에 사용자 정보 생성
          const newUser: User = {
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || '익명 사용자',
            email: firebaseUser.email || '',
            profileImage: firebaseUser.photoURL || undefined,
            bio: '',
            roles: ['viewer'],
            createdAt: new Date() as any,
            updatedAt: new Date() as any,
          };
          
          await setDoc(doc(db, 'users', firebaseUser.uid), newUser);
          setUser(newUser);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // 이메일 로그인
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('🔐 이메일 로그인 시도:', email);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('✅ 로그인 성공:', result.user.uid);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ 로그인 실패:', error.code, error.message);

      // Firebase 오류 코드를 한국어로 변환
      let errorMessage = error.message;
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = '등록되지 않은 이메일입니다.';
          break;
        case 'auth/wrong-password':
          errorMessage = '비밀번호가 올바르지 않습니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '유효하지 않은 이메일 형식입니다.';
          break;
        case 'auth/user-disabled':
          errorMessage = '비활성화된 계정입니다.';
          break;
        case 'auth/too-many-requests':
          errorMessage = '너무 많은 로그인 시도가 있었습니다. 잠시 후 다시 시도해주세요.';
          break;
        case 'auth/network-request-failed':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        case 'auth/invalid-credential':
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.';
          break;
        default:
          errorMessage = '로그인 중 오류가 발생했습니다.';
      }

      return { success: false, error: errorMessage, code: error.code };
    }
  };

  // 이메일 회원가입
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      console.log('📝 회원가입 시도:', email, name);
      const result = await createUserWithEmailAndPassword(auth, email, password);

      // 프로필 업데이트
      await updateProfile(result.user, { displayName: name });
      console.log('✅ 회원가입 성공:', result.user.uid);

      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ 회원가입 실패:', error.code, error.message);

      // Firebase 오류 코드를 한국어로 변환
      let errorMessage = error.message;
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = '이미 사용 중인 이메일입니다.';
          break;
        case 'auth/invalid-email':
          errorMessage = '유효하지 않은 이메일 형식입니다.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = '이메일/비밀번호 계정이 비활성화되어 있습니다.';
          break;
        case 'auth/weak-password':
          errorMessage = '비밀번호가 너무 약합니다. 6자 이상 입력해주세요.';
          break;
        case 'auth/network-request-failed':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        default:
          errorMessage = '회원가입 중 오류가 발생했습니다.';
      }

      return { success: false, error: errorMessage, code: error.code };
    }
  };

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      console.log('🔍 Google 로그인 시도');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('✅ Google 로그인 성공:', result.user.uid);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ Google 로그인 실패:', error.code, error.message);

      let errorMessage = error.message;
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = '로그인 창이 닫혔습니다.';
          break;
        case 'auth/popup-blocked':
          errorMessage = '팝업이 차단되었습니다. 팝업을 허용해주세요.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = '로그인이 취소되었습니다.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = '승인되지 않은 도메인입니다.';
          break;
        case 'auth/network-request-failed':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        default:
          errorMessage = 'Google 로그인 중 오류가 발생했습니다.';
      }

      return { success: false, error: errorMessage, code: error.code };
    }
  };

  // GitHub 로그인
  const signInWithGithub = async () => {
    try {
      console.log('🔍 GitHub 로그인 시도');
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      console.log('✅ GitHub 로그인 성공:', result.user.uid);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error('❌ GitHub 로그인 실패:', error.code, error.message);

      let errorMessage = error.message;
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = '로그인 창이 닫혔습니다.';
          break;
        case 'auth/popup-blocked':
          errorMessage = '팝업이 차단되었습니다. 팝업을 허용해주세요.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = '로그인이 취소되었습니다.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = '다른 로그인 방법으로 이미 가입된 계정입니다.';
          break;
        case 'auth/unauthorized-domain':
          errorMessage = '승인되지 않은 도메인입니다.';
          break;
        case 'auth/network-request-failed':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        default:
          errorMessage = 'GitHub 로그인 중 오류가 발생했습니다.';
      }

      return { success: false, error: errorMessage, code: error.code };
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      console.log('🚪 로그아웃 시도');
      await firebaseSignOut(auth);
      console.log('✅ 로그아웃 성공');
      return { success: true };
    } catch (error: any) {
      console.error('❌ 로그아웃 실패:', error.code, error.message);

      let errorMessage = error.message;
      switch (error.code) {
        case 'auth/network-request-failed':
          errorMessage = '네트워크 연결을 확인해주세요.';
          break;
        default:
          errorMessage = '로그아웃 중 오류가 발생했습니다.';
      }

      return { success: false, error: errorMessage, code: error.code };
    }
  };

  // 사용자 프로필 업데이트
  const updateUserProfile = async (updates: Partial<User>) => {
    if (!user) return { success: false, error: '로그인이 필요합니다.' };

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date(),
      });
      
      setUser({ ...user, ...updates, updatedAt: new Date() as any });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    firebaseUser,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithGithub,
    signOut,
    updateUserProfile,
  };
};

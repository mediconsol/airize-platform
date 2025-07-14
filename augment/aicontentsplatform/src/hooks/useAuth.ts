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
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // 이메일 회원가입
  const signUpWithEmail = async (email: string, password: string, name: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // 프로필 업데이트
      await updateProfile(result.user, { displayName: name });
      
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // Google 로그인
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // GitHub 로그인
  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      const result = await signInWithPopup(auth, provider);
      return { success: true, user: result.user };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  // 로그아웃
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
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

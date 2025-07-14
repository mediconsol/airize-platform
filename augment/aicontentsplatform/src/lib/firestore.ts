import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Content, Comment, Like, Follow, Bookmark } from '@/types/firebase';

// Firestore에서 undefined 값을 제거하는 유틸리티 함수 (중첩 객체 및 배열 지원)
const removeUndefinedFields = (obj: any): any => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .filter(item => item !== undefined)
      .map(item => removeUndefinedFields(item));
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        if (typeof value === 'object' && value !== null) {
          const cleanedValue = removeUndefinedFields(value);
          // 빈 객체는 제거하지만, 빈 배열은 유지 (tags: [] 같은 경우를 위해)
          if (Array.isArray(cleanedValue) || Object.keys(cleanedValue).length > 0) {
            cleaned[key] = cleanedValue;
          }
        } else {
          cleaned[key] = value;
        }
      }
    }
    return cleaned;
  }

  return obj;
};

// 콘텐츠 관련 함수들
export const contentService = {
  // 콘텐츠 생성
  async createContent(contentData: Omit<Content, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      console.log('🔥 createContent 시작 - 원본 데이터:', {
        keys: Object.keys(contentData),
        galleryImages: contentData.galleryImages?.length || 0,
        demoURL: contentData.demoURL,
        youtubeURL: contentData.youtubeURL
      });

      // undefined 값들을 제거하여 Firestore 오류 방지
      const dataWithTimestamps = {
        ...contentData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      console.log('🔥 타임스탬프 추가 후:', {
        keys: Object.keys(dataWithTimestamps),
        hasUndefined: Object.values(dataWithTimestamps).some(v => v === undefined)
      });

      const cleanedData = removeUndefinedFields(dataWithTimestamps);

      console.log('🔥 정리 완료 후:', {
        keys: Object.keys(cleanedData),
        galleryImages: cleanedData.galleryImages?.length || 0,
        hasUndefined: Object.values(cleanedData).some(v => v === undefined)
      });

      const docRef = await addDoc(collection(db, 'contents'), cleanedData);
      console.log('✅ Firestore 저장 성공:', docRef.id);
      return { success: true, id: docRef.id };
    } catch (error: any) {
      console.error('❌ createContent 오류:', error);
      return { success: false, error: error.message };
    }
  },

  // 콘텐츠 조회
  async getContent(contentId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'contents', contentId));
      if (docSnap.exists()) {
        return { success: true, data: { id: docSnap.id, ...docSnap.data() } as Content };
      } else {
        return { success: false, error: '콘텐츠를 찾을 수 없습니다.' };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 콘텐츠 목록 조회 (페이지네이션)
  async getContents(pageSize = 12, lastDoc?: any) {
    try {
      // 인덱스가 생성될 때까지 단순 쿼리 사용
      let q = query(
        collection(db, 'contents'),
        where('isPublic', '==', true),
        limit(pageSize * 2) // 더 많이 가져와서 클라이언트에서 정렬
      );

      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      let contents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      // 클라이언트 사이드에서 최신순 정렬
      contents = contents
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, pageSize);

      return {
        success: true,
        data: contents,
        lastDoc: querySnapshot.docs[Math.min(querySnapshot.docs.length - 1, pageSize - 1)]
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 검색 및 필터링된 콘텐츠 조회 (안전한 폴백 버전)
  async searchContents(searchParams: {
    query?: string;
    type?: string;
    tool?: string;
    priceRange?: string;
    sortBy?: string;
    tags?: string[];
    limit?: number;
    lastDoc?: any;
  }) {
    try {
      const {
        query: searchQuery,
        type,
        tool,
        priceRange,
        sortBy = 'latest',
        tags = [],
        limit = 12,
        lastDoc
      } = searchParams;

      console.log('🔍 검색 파라미터:', searchParams);

      // 인덱스 오류를 피하기 위해 단순한 쿼리부터 시작
      let q;

      try {
        // 인덱스 생성 후 최적화된 쿼리 시도
        let constraints: any[] = [where('isPublic', '==', true)];

        // 콘텐츠 유형 필터 (서버에서 처리)
        if (type) {
          constraints.push(where('type', '==', type));
          console.log('🔍 유형 필터 적용:', type);
        }

        // AI 도구 필터 (서버에서 처리)
        if (tool) {
          constraints.push(where('tool', '==', tool));
          console.log('🔍 도구 필터 적용:', tool);
        }

        // 태그 필터 (서버에서 처리)
        if (tags.length > 0) {
          constraints.push(where('tags', 'array-contains-any', tags));
          console.log('🔍 태그 필터 적용:', tags);
        }

        // 정렬 기준 설정
        let orderByField = 'createdAt';
        let orderDirection: 'asc' | 'desc' = 'desc';

        switch (sortBy) {
          case 'downloads':
            orderByField = 'downloads';
            orderDirection = 'desc';
            break;
          case 'price-low':
            orderByField = 'price';
            orderDirection = 'asc';
            break;
          case 'price-high':
            orderByField = 'price';
            orderDirection = 'desc';
            break;
          case 'latest':
          default:
            orderByField = 'createdAt';
            orderDirection = 'desc';
            break;
        }

        constraints.push(orderBy(orderByField, orderDirection));
        constraints.push(limit(limit * 2));

        if (lastDoc) {
          constraints.push(startAfter(lastDoc));
        }

        q = query(collection(db, 'contents'), ...constraints);
        console.log('🔍 최적화된 쿼리 사용 (인덱스 활용)');
      } catch (indexError) {
        console.log('🔄 인덱스 오류, 단순 쿼리로 폴백');
        // 인덱스가 없는 경우 단순 쿼리 사용
        if (lastDoc) {
          q = query(
            collection(db, 'contents'),
            startAfter(lastDoc),
            limit(limit * 3)
          );
        } else {
          q = query(
            collection(db, 'contents'),
            limit(limit * 3)
          );
        }
      }

      const snapshot = await getDocs(q);

      let contents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      console.log('🔍 Firestore에서 가져온 콘텐츠 수:', contents.length);

      // 모든 필터링을 클라이언트에서 안전하게 처리

      // isPublic 필터 (클라이언트에서 확실히 처리)
      contents = contents.filter(content => content.isPublic === true);
      console.log('🔍 공개 콘텐츠 필터 후:', contents.length);

      // 콘텐츠 유형 필터
      if (type) {
        contents = contents.filter(content => content.type === type);
        console.log('🔍 유형 필터 후 콘텐츠 수:', contents.length);
      }

      // AI 도구 필터
      if (tool) {
        contents = contents.filter(content => content.tool === tool);
        console.log('🔍 도구 필터 후 콘텐츠 수:', contents.length);
      }

      // 태그 필터
      if (tags.length > 0) {
        contents = contents.filter(content =>
          tags.some(tag => content.tags?.includes(tag))
        );
        console.log('🔍 태그 필터 후 콘텐츠 수:', contents.length);
      }

      // 클라이언트에서 처리해야 하는 필터링

      // 텍스트 검색 (Firestore 전문 검색 제한으로 클라이언트에서 처리)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        contents = contents.filter(content =>
          content.title.toLowerCase().includes(query) ||
          content.description.toLowerCase().includes(query) ||
          content.tags?.some(tag => tag.toLowerCase().includes(query))
        );
        console.log('🔍 텍스트 검색 후 콘텐츠 수:', contents.length);
      }

      // 가격 범위 필터 (복합 조건으로 클라이언트에서 처리)
      if (priceRange) {
        contents = contents.filter(content => {
          switch (priceRange) {
            case 'free':
              return content.price === 0;
            case '0-5000':
              return content.price > 0 && content.price <= 5000;
            case '5000-20000':
              return content.price > 5000 && content.price <= 20000;
            case '20000-50000':
              return content.price > 20000 && content.price <= 50000;
            case '50000+':
              return content.price > 50000;
            default:
              return true;
          }
        });
        console.log('🔍 가격 필터 후 콘텐츠 수:', contents.length);
      }

      // 인기순 정렬 (복합 필드 정렬로 클라이언트에서 처리)
      if (sortBy === 'popular') {
        contents.sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads));
        console.log('🔍 인기순 정렬 적용');
      }

      // 결과 제한
      contents = contents.slice(0, limit);

      console.log('🔍 최종 결과 콘텐츠 수:', contents.length);

      return {
        success: true,
        data: contents,
        lastDoc: snapshot.docs[snapshot.docs.length - 1],
        total: contents.length,
        searchInfo: {
          hasFilters: !!(type || tool || tags.length > 0 || priceRange || searchQuery),
          serverFiltered: !!(type || tool || tags.length > 0),
          clientFiltered: !!(searchQuery || priceRange || sortBy === 'popular'),
          originalCount: snapshot.docs.length,
          finalCount: contents.length
        }
      };
    } catch (error: any) {
      console.error('❌ 검색 오류:', error);

      // 인덱스 오류인 경우 기본 목록으로 폴백
      if (error.message.includes('index') || error.message.includes('requires an index')) {
        console.log('🔄 인덱스 오류로 인한 기본 목록 폴백');
        try {
          // 가장 단순한 쿼리로 폴백
          const fallbackQuery = query(collection(db, 'contents'), limit(20));
          const fallbackSnapshot = await getDocs(fallbackQuery);

          let fallbackContents = fallbackSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Content[];

          // 클라이언트에서 기본 필터링
          fallbackContents = fallbackContents.filter(content => content.isPublic === true);

          // 텍스트 검색
          if (searchQuery) {
            const query = searchQuery.toLowerCase();
            fallbackContents = fallbackContents.filter(content =>
              content.title.toLowerCase().includes(query) ||
              content.description.toLowerCase().includes(query) ||
              content.tags?.some(tag => tag.toLowerCase().includes(query))
            );
          }

          // 기본 정렬 (최신순)
          fallbackContents.sort((a, b) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });

          return {
            success: true,
            data: fallbackContents.slice(0, limit),
            lastDoc: fallbackSnapshot.docs[fallbackSnapshot.docs.length - 1],
            total: fallbackContents.length,
            searchInfo: {
              hasFilters: true,
              serverFiltered: false,
              clientFiltered: true,
              originalCount: fallbackSnapshot.docs.length,
              finalCount: fallbackContents.slice(0, limit).length
            }
          };
        } catch (fallbackError) {
          console.error('❌ 폴백 쿼리도 실패:', fallbackError);
          return { success: false, error: '검색 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.' };
        }
      }

      return { success: false, error: error.message };
    }
  },

  // 사용자별 콘텐츠 조회
  async getUserContents(userId: string) {
    try {
      // 인덱스가 생성될 때까지 orderBy 없이 쿼리
      const q = query(
        collection(db, 'contents'),
        where('creatorId', '==', userId)
      );

      const querySnapshot = await getDocs(q);
      let contents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      // 클라이언트 사이드에서 정렬
      contents = contents.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });

      return { success: true, data: contents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 콘텐츠 업데이트
  async updateContent(contentId: string, updates: Partial<Content>) {
    try {
      // undefined 값들을 제거하여 Firestore 오류 방지
      const cleanedUpdates = removeUndefinedFields({
        ...updates,
        updatedAt: Timestamp.now(),
      });

      await updateDoc(doc(db, 'contents', contentId), cleanedUpdates);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 조회수 증가
  async incrementViews(contentId: string) {
    try {
      await updateDoc(doc(db, 'contents', contentId), {
        views: increment(1)
      });
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 콘텐츠 삭제
  async deleteContent(contentId: string) {
    try {
      await deleteDoc(doc(db, 'contents', contentId));
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 콘텐츠 검색 (고급 필터링)
  async searchContents(searchParams: {
    query?: string;
    type?: string;
    tool?: string;
    minPrice?: number;
    maxPrice?: number;
    tags?: string[];
    sortBy?: 'latest' | 'popular' | 'downloads' | 'price-low' | 'price-high';
    pageSize?: number;
    lastDoc?: any;
  }) {
    try {
      const {
        type,
        tool,
        minPrice,
        maxPrice,
        sortBy = 'latest',
        pageSize = 12,
        lastDoc
      } = searchParams;

      let q = query(
        collection(db, 'contents'),
        where('isPublic', '==', true)
      );

      // 타입 필터
      if (type) {
        q = query(q, where('type', '==', type));
      }

      // AI 도구 필터
      if (tool) {
        q = query(q, where('tool', '==', tool));
      }

      // 가격 필터
      if (minPrice !== undefined) {
        q = query(q, where('price', '>=', minPrice));
      }
      if (maxPrice !== undefined) {
        q = query(q, where('price', '<=', maxPrice));
      }

      // 정렬
      switch (sortBy) {
        case 'popular':
          q = query(q, orderBy('likes', 'desc'));
          break;
        case 'downloads':
          q = query(q, orderBy('downloads', 'desc'));
          break;
        case 'price-low':
          q = query(q, orderBy('price', 'asc'));
          break;
        case 'price-high':
          q = query(q, orderBy('price', 'desc'));
          break;
        case 'latest':
        default:
          q = query(q, orderBy('createdAt', 'desc'));
          break;
      }

      // 페이지네이션
      q = query(q, limit(pageSize));
      if (lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const contents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      return {
        success: true,
        data: contents,
        lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
      };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 인기 콘텐츠 조회
  async getPopularContents(pageSize = 12) {
    try {
      // 인덱스가 생성될 때까지 단순 쿼리 사용
      const q = query(
        collection(db, 'contents'),
        where('isPublic', '==', true),
        limit(pageSize * 2) // 더 많이 가져와서 클라이언트에서 정렬
      );

      const querySnapshot = await getDocs(q);
      let contents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      // 클라이언트 사이드에서 인기도순 정렬
      contents = contents
        .sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads))
        .slice(0, pageSize);

      return { success: true, data: contents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 최신 콘텐츠 조회
  async getLatestContents(pageSize = 12) {
    try {
      // 인덱스가 생성될 때까지 단순 쿼리 사용
      const q = query(
        collection(db, 'contents'),
        where('isPublic', '==', true),
        limit(pageSize * 2) // 더 많이 가져와서 클라이언트에서 정렬
      );

      const querySnapshot = await getDocs(q);
      let contents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Content[];

      // 클라이언트 사이드에서 최신순 정렬
      contents = contents
        .sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        })
        .slice(0, pageSize);

      return { success: true, data: contents };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// 좋아요 관련 함수들
export const likeService = {
  // 좋아요 추가
  async addLike(userId: string, contentId: string) {
    try {
      await addDoc(collection(db, 'likes'), {
        userId,
        contentId,
        createdAt: Timestamp.now(),
      });

      // 콘텐츠의 좋아요 수 증가
      await updateDoc(doc(db, 'contents', contentId), {
        likes: increment(1)
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 좋아요 제거
  async removeLike(userId: string, contentId: string) {
    try {
      const q = query(
        collection(db, 'likes'),
        where('userId', '==', userId),
        where('contentId', '==', contentId)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      // 콘텐츠의 좋아요 수 감소
      await updateDoc(doc(db, 'contents', contentId), {
        likes: increment(-1)
      });

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 좋아요 상태 확인
  async checkLike(userId: string, contentId: string) {
    try {
      const q = query(
        collection(db, 'likes'),
        where('userId', '==', userId),
        where('contentId', '==', contentId)
      );

      const querySnapshot = await getDocs(q);
      return { success: true, isLiked: !querySnapshot.empty };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// 댓글 관련 함수들
export const commentService = {
  // 댓글 추가
  async addComment(commentData: Omit<Comment, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'comments'), {
        ...commentData,
        likes: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // 콘텐츠의 댓글 수 증가
      await updateDoc(doc(db, 'contents', commentData.contentId), {
        comments: increment(1)
      });

      return { success: true, id: docRef.id };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 콘텐츠별 댓글 조회
  async getComments(contentId: string) {
    try {
      const q = query(
        collection(db, 'comments'),
        where('contentId', '==', contentId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const comments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Comment[];

      return { success: true, data: comments };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },
};

// 통계 관련 함수들
export const statsService = {
  // 카테고리별 콘텐츠 통계 조회
  async getCategoryStats() {
    try {
      console.log('📊 카테고리 통계 조회 시작');

      const q = query(
        collection(db, 'contents'),
        where('isPublic', '==', true)
      );

      const snapshot = await getDocs(q);
      const categoryStats: Record<string, number> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const type = data.type || 'other';
        categoryStats[type] = (categoryStats[type] || 0) + 1;
      });

      console.log('📊 카테고리 통계:', categoryStats);
      return { success: true, data: categoryStats };
    } catch (error: any) {
      console.error('❌ 카테고리 통계 조회 오류:', error);
      return { success: false, error: error.message };
    }
  },

  // 태그별 콘텐츠 통계 조회
  async getTagStats() {
    try {
      console.log('🏷️ 태그 통계 조회 시작');

      const q = query(
        collection(db, 'contents'),
        where('isPublic', '==', true)
      );

      const snapshot = await getDocs(q);
      const tagStats: Record<string, number> = {};

      snapshot.docs.forEach(doc => {
        const data = doc.data();
        const tags = data.tags || [];
        tags.forEach((tag: string) => {
          tagStats[tag] = (tagStats[tag] || 0) + 1;
        });
      });

      // 상위 5개 태그만 반환
      const sortedTags = Object.entries(tagStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({
          name,
          count,
          trend: `+${Math.floor(Math.random() * 20 + 5)}%` // 임시 트렌드 데이터
        }));

      console.log('🏷️ 태그 통계:', sortedTags);
      return { success: true, data: sortedTags };
    } catch (error: any) {
      console.error('❌ 태그 통계 조회 오류:', error);
      return { success: false, error: error.message };
    }
  },

  // 전체 플랫폼 통계 조회
  async getPlatformStats() {
    try {
      console.log('📈 플랫폼 통계 조회 시작');

      // 모든 공개 콘텐츠 조회
      const contentsQuery = query(
        collection(db, 'contents'),
        where('isPublic', '==', true)
      );

      const contentsSnapshot = await getDocs(contentsQuery);
      const contents = contentsSnapshot.docs.map(doc => doc.data());

      // 기본 통계 계산
      const totalContents = contents.length;
      const totalViews = contents.reduce((sum, content) => sum + (content.views || 0), 0);
      const totalDownloads = contents.reduce((sum, content) => sum + (content.downloads || 0), 0);
      const totalLikes = contents.reduce((sum, content) => sum + (content.likes || 0), 0);

      // 카테고리별 통계
      const categoryStats: Record<string, number> = {};
      contents.forEach(content => {
        const type = content.type || 'other';
        categoryStats[type] = (categoryStats[type] || 0) + 1;
      });

      // AI 도구별 통계
      const toolStats: Record<string, number> = {};
      contents.forEach(content => {
        const tool = content.tool || 'other';
        toolStats[tool] = (toolStats[tool] || 0) + 1;
      });

      // 가격 분포 통계
      const priceRanges = {
        free: 0,
        '1-5000': 0,
        '5001-20000': 0,
        '20001-50000': 0,
        '50000+': 0
      };

      contents.forEach(content => {
        const price = content.price || 0;
        if (price === 0) priceRanges.free++;
        else if (price <= 5000) priceRanges['1-5000']++;
        else if (price <= 20000) priceRanges['5001-20000']++;
        else if (price <= 50000) priceRanges['20001-50000']++;
        else priceRanges['50000+']++;
      });

      // 최근 7일간 업로드 통계
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const recentContents = contents.filter(content => {
        const createdAt = content.createdAt?.toDate?.() || new Date(content.createdAt?.seconds * 1000);
        return createdAt >= sevenDaysAgo;
      });

      // 인기 콘텐츠 (좋아요 + 다운로드 기준)
      const popularContents = contents
        .map(content => ({
          ...content,
          popularity: (content.likes || 0) + (content.downloads || 0)
        }))
        .sort((a, b) => b.popularity - a.popularity)
        .slice(0, 5);

      const stats = {
        overview: {
          totalContents,
          totalViews,
          totalDownloads,
          totalLikes,
          recentUploads: recentContents.length
        },
        categories: categoryStats,
        tools: toolStats,
        priceDistribution: priceRanges,
        popularContents: popularContents.map(content => ({
          id: content.id,
          title: content.title,
          type: content.type,
          popularity: content.popularity,
          views: content.views || 0,
          downloads: content.downloads || 0,
          likes: content.likes || 0
        })),
        trends: {
          dailyUploads: this.calculateDailyUploads(contents),
          growthRate: this.calculateGrowthRate(contents, recentContents)
        }
      };

      console.log('📈 플랫폼 통계 완료:', stats);
      return { success: true, data: stats };
    } catch (error: any) {
      console.error('❌ 플랫폼 통계 조회 오류:', error);
      return { success: false, error: error.message };
    }
  },

  // 일별 업로드 통계 계산
  calculateDailyUploads(contents: any[]) {
    const dailyStats: Record<string, number> = {};
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyStats[dateStr] = 0;
      last7Days.push(dateStr);
    }

    contents.forEach(content => {
      const createdAt = content.createdAt?.toDate?.() || new Date(content.createdAt?.seconds * 1000);
      const dateStr = createdAt.toISOString().split('T')[0];
      if (dailyStats.hasOwnProperty(dateStr)) {
        dailyStats[dateStr]++;
      }
    });

    return last7Days.map(date => ({
      date,
      uploads: dailyStats[date]
    }));
  },

  // 성장률 계산
  calculateGrowthRate(allContents: any[], recentContents: any[]) {
    const totalContents = allContents.length;
    const recentUploads = recentContents.length;

    if (totalContents === 0) return 0;

    const weeklyGrowthRate = ((recentUploads / totalContents) * 100).toFixed(1);
    return parseFloat(weeklyGrowthRate);
  }
};

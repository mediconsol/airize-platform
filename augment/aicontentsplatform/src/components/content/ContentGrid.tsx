'use client';

import { useState, useEffect } from 'react';
import { Content, User } from '@/types/firebase';
import { contentService } from '@/lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ContentCard from './ContentCard';
import SearchPerformanceMonitor from '@/components/debug/SearchPerformanceMonitor';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Loader2, 
  Search, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface ContentWithCreator extends Content {
  creatorName?: string;
  creatorImage?: string;
  isCreator?: boolean;
}

interface SearchFilters {
  query: string;
  type: string;
  tool: string;
  priceRange: string;
  sortBy: string;
  tags: string[];
}

interface ContentGridProps {
  filters: SearchFilters;
  viewMode: 'grid' | 'list';
}

export default function ContentGrid({ filters, viewMode }: ContentGridProps) {
  const [contents, setContents] = useState<ContentWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [searchPerformance, setSearchPerformance] = useState<any>(null);
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  // 콘텐츠 로드
  const loadContents = async (isLoadMore = false) => {
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
      setContents([]);
      setLastDoc(null);
      setHasMore(true);
    }
    
    setError(null);

    try {
      const startTime = performance.now();

      // 검색 파라미터가 있으면 searchContents 사용, 없으면 getContents 사용
      const hasSearchParams = filters.query || filters.type || filters.tool ||
                             filters.priceRange || filters.sortBy !== 'latest' ||
                             filters.tags.length > 0;

      let result;
      if (hasSearchParams) {
        console.log('🔍 검색 API 사용:', filters);
        result = await contentService.searchContents({
          query: filters.query,
          type: filters.type,
          tool: filters.tool,
          priceRange: filters.priceRange,
          sortBy: filters.sortBy,
          tags: filters.tags,
          limit: 12,
          lastDoc: isLoadMore ? lastDoc : undefined
        });
      } else {
        console.log('📋 기본 목록 API 사용');
        result = await contentService.getContents(
          12, // 페이지 크기
          isLoadMore ? lastDoc : undefined
        );
      }

      const endTime = performance.now();
      const searchTime = Math.round(endTime - startTime);

      // 성능 데이터 업데이트
      if (!isLoadMore) {
        setSearchPerformance({
          searchTime,
          searchInfo: result.searchInfo,
          query: filters.query,
          filters,
          timestamp: Date.now()
        });
        setShowPerformanceMonitor(hasSearchParams); // 검색/필터가 있을 때만 표시
      }

      if (result.success) {
        let newContents = result.data;

        // 검색 API를 사용하지 않은 경우에만 클라이언트 필터링 적용
        if (!hasSearchParams) {
          newContents = applyFilters(newContents, filters);
        }

        console.log('📊 로드된 콘텐츠 수:', newContents.length);

        // 크리에이터 정보 가져오기 및 테스트용 갤러리 데이터 추가
        const contentsWithCreators = await Promise.all(
          newContents.map(async (content, index) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', content.creatorId));
              let contentWithCreator = content;

              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                contentWithCreator = {
                  ...content,
                  creatorName: userData.name,
                  creatorImage: userData.profileImage,
                  isCreator: userData.roles.includes('creator')
                };
              }

              // 실제 콘텐츠의 갤러리 이미지 사용 (explore 페이지용)
              // 실제 갤러리 이미지가 있는 경우 사용
              if (contentWithCreator.galleryImages && contentWithCreator.galleryImages.length > 0) {
                // galleryImages에서 URL만 추출하여 galleryURLs로 변환
                const galleryURLs = contentWithCreator.galleryImages
                  .filter(img => img.url && !img.url.startsWith('blob:')) // 유효한 URL만 필터링
                  .map(img => img.url);

                if (galleryURLs.length > 0) {
                  return {
                    ...contentWithCreator,
                    galleryURLs: galleryURLs
                  };
                }
              }

              // 기존 galleryURLs가 있는 경우 그대로 사용
              if (contentWithCreator.galleryURLs && contentWithCreator.galleryURLs.length > 0) {
                return {
                  ...contentWithCreator,
                  galleryURLs: contentWithCreator.galleryURLs
                };
              }

              return contentWithCreator;
            } catch (error) {
              console.error('크리에이터 정보 로드 오류:', error);
              return content;
            }
          })
        );

        if (isLoadMore) {
          // 더보기 시 중복 제거
          setContents(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newUniqueContents = contentsWithCreators.filter(c => !existingIds.has(c.id));
            return [...prev, ...newUniqueContents];
          });
        } else {
          setContents(contentsWithCreators);
        }

        setLastDoc(result.lastDoc);
        setHasMore(contentsWithCreators.length === 12);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      console.error('ContentGrid 오류:', error);

      if (error.message.includes('index')) {
        setError('검색 인덱스를 생성 중입니다. 잠시 후 다시 시도해주세요.');
      } else {
        setError(error.message || '콘텐츠를 불러오는 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // 필터 적용 함수
  const applyFilters = (contents: Content[], filters: SearchFilters): Content[] => {
    let filtered = [...contents];

    // 검색어 필터
    if (filters.query) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(content =>
        content.title.toLowerCase().includes(query) ||
        content.description.toLowerCase().includes(query) ||
        content.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // 콘텐츠 유형 필터
    if (filters.type) {
      filtered = filtered.filter(content => content.type === filters.type);
    }

    // AI 도구 필터
    if (filters.tool) {
      filtered = filtered.filter(content => content.tool === filters.tool);
    }

    // 가격 범위 필터
    if (filters.priceRange) {
      filtered = filtered.filter(content => {
        switch (filters.priceRange) {
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
    }

    // 태그 필터
    if (filters.tags.length > 0) {
      filtered = filtered.filter(content =>
        filters.tags.some(tag => content.tags.includes(tag))
      );
    }

    // 정렬
    switch (filters.sortBy) {
      case 'popular':
        filtered.sort((a, b) => (b.likes + b.downloads) - (a.likes + a.downloads));
        break;
      case 'downloads':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'latest':
      default:
        filtered.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
        break;
    }

    return filtered;
  };

  // 필터 변경 시 콘텐츠 다시 로드
  useEffect(() => {
    loadContents();
  }, [filters]);

  // 좋아요 처리
  const handleLike = (contentId: string, isLiked: boolean) => {
    setContents(prev =>
      prev.map(content =>
        content.id === contentId
          ? { ...content, likes: content.likes + (isLiked ? 1 : -1) }
          : content
      )
    );
  };

  // 로딩 스켈레톤
  const renderSkeleton = () => (
    <div className={viewMode === 'grid' 
      ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      : "space-y-4"
    }>
      {Array.from({ length: 8 }).map((_, index) => (
        <Card key={index}>
          <Skeleton className="aspect-video w-full" />
          <CardContent className="p-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  // 에러 상태
  if (error) {
    return (
      <Card className="p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">오류가 발생했습니다</h3>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={() => loadContents()} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          다시 시도
        </Button>
      </Card>
    );
  }

  // 로딩 상태
  if (loading) {
    return renderSkeleton();
  }

  // 빈 결과
  if (contents.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">검색 결과가 없습니다</h3>
        <p className="text-muted-foreground mb-4">
          다른 검색어나 필터를 시도해보세요.
        </p>
        <Button onClick={() => loadContents()} variant="outline">
          전체 콘텐츠 보기
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 결과 개수 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          총 {contents.length}개의 콘텐츠
        </p>
      </div>

      {/* 콘텐츠 그리드/리스트 */}
      <div className={viewMode === 'grid'
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        : "space-y-4"
      }>
        {contents
          .filter(content => content && content.id) // 유효한 콘텐츠만 렌더링
          .map((content, index) => (
            <ContentCard
              key={`explore-content-${content.id}-${index}`} // 더 고유한 키 생성
              content={content}
              creatorName={content.creatorName}
              creatorImage={content.creatorImage}
              isCreator={content.isCreator}
              onLike={handleLike}
              searchQuery={filters.query}
            />
          ))
        }
      </div>

      {/* 더 보기 버튼 */}
      {hasMore && (
        <div className="text-center">
          <Button
            onClick={() => loadContents(true)}
            disabled={loadingMore}
            variant="outline"
            size="lg"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                로딩 중...
              </>
            ) : (
              '더 보기'
            )}
          </Button>
        </div>
      )}

      {/* 검색 성능 모니터 */}
      <SearchPerformanceMonitor
        searchData={searchPerformance}
        isVisible={showPerformanceMonitor}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import SearchAndFilter from './SearchAndFilter';
import ContentGrid from './ContentGrid';
import { statsService } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  TrendingUp,
  Star,
  Zap,
  Crown,
  Flame
} from 'lucide-react';

interface SearchFilters {
  query: string;
  type: string;
  tool: string;
  priceRange: string;
  sortBy: string;
  tags: string[];
}

// 동적 데이터 타입 정의
interface TrendingTag {
  name: string;
  count: number;
  trend: string;
}

interface FeaturedCategory {
  name: string;
  description: string;
  icon: React.ReactNode;
  count: number;
  color: string;
  type: string;
}

// 카테고리 메타데이터 (아이콘과 설명용)
const CATEGORY_METADATA: Record<string, { description: string; icon: React.ReactNode; color: string }> = {
  'image': {
    description: 'Midjourney, DALL-E로 생성된 고품질 이미지',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-blue-500'
  },
  'ppt': {
    description: 'ChatGPT로 제작된 전문적인 프레젠테이션',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-green-500'
  },
  'music': {
    description: 'Suno로 생성된 다양한 장르의 음악',
    icon: <Crown className="w-6 h-6" />,
    color: 'bg-purple-500'
  },
  'code': {
    description: 'GitHub Copilot으로 작성된 유용한 코드',
    icon: <Flame className="w-6 h-6" />,
    color: 'bg-orange-500'
  },
  'video': {
    description: 'AI로 생성된 창의적인 비디오 콘텐츠',
    icon: <Star className="w-6 h-6" />,
    color: 'bg-red-500'
  },
  'document': {
    description: '전문적인 문서 및 템플릿',
    icon: <Zap className="w-6 h-6" />,
    color: 'bg-indigo-500'
  }
};

export default function ExplorePage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: '',
    tool: '',
    priceRange: '',
    sortBy: 'latest',
    tags: []
  });

  // 동적 데이터 상태
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [featuredCategories, setFeaturedCategories] = useState<FeaturedCategory[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);

  // 통계 데이터 로딩
  useEffect(() => {
    const loadStats = async () => {
      try {
        setStatsLoading(true);
        console.log('📊 통계 데이터 로딩 시작');

        // 카테고리 통계 로딩
        const categoryResult = await statsService.getCategoryStats();
        if (categoryResult.success) {
          const categories: FeaturedCategory[] = Object.entries(categoryResult.data)
            .map(([type, count]) => {
              const metadata = CATEGORY_METADATA[type];
              if (!metadata) return null;

              return {
                name: type === 'image' ? 'AI 이미지' :
                      type === 'ppt' ? 'PPT 템플릿' :
                      type === 'music' ? 'AI 음악' :
                      type === 'code' ? '코드 스니펫' :
                      type === 'video' ? 'AI 비디오' :
                      type === 'document' ? '문서 템플릿' : type,
                description: metadata.description,
                icon: metadata.icon,
                count: count as number,
                color: metadata.color,
                type
              };
            })
            .filter(Boolean) as FeaturedCategory[];

          // 카운트 순으로 정렬하고 상위 4개만 표시
          const sortedCategories = categories
            .sort((a, b) => b.count - a.count)
            .slice(0, 4);

          setFeaturedCategories(sortedCategories);
          console.log('📊 카테고리 데이터 로딩 완료:', sortedCategories);
        }

        // 태그 통계 로딩
        const tagResult = await statsService.getTagStats();
        if (tagResult.success) {
          setTrendingTags(tagResult.data);
          console.log('🏷️ 태그 데이터 로딩 완료:', tagResult.data);
        }

      } catch (error) {
        console.error('❌ 통계 데이터 로딩 오류:', error);

        // 오류 시 기본 데이터 사용
        setFeaturedCategories([
          {
            name: 'AI 이미지',
            description: 'Midjourney, DALL-E로 생성된 고품질 이미지',
            icon: <Star className="w-6 h-6" />,
            count: 0,
            color: 'bg-blue-500',
            type: 'image'
          },
          {
            name: 'PPT 템플릿',
            description: 'ChatGPT로 제작된 전문적인 프레젠테이션',
            icon: <Zap className="w-6 h-6" />,
            count: 0,
            color: 'bg-green-500',
            type: 'ppt'
          }
        ]);

        setTrendingTags([
          { name: '디자인', count: 0, trend: '+0%' },
          { name: '마케팅', count: 0, trend: '+0%' }
        ]);
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
  }, []);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const handleFiltersChange = (newFilters: SearchFilters) => {
    console.log('🔍 ExplorePage - 필터 변경 수신:', newFilters);
    setFilters(newFilters);
  };

  const handleCategoryClick = (type: string) => {
    setFilters(prev => ({ ...prev, type }));
  };

  const handleTagClick = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag) ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
    }));
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">콘텐츠 탐색</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI로 생성된 다양한 콘텐츠를 발견하고 다운로드하세요. 
            전 세계 크리에이터들의 창작물을 만나보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 사이드바 */}
          <div className="lg:col-span-1 space-y-6">
            {/* 인기 카테고리 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  인기 카테고리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-16 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  featuredCategories.map((category, index) => (
                  <div
                    key={`category-${category.type}-${index}`}
                    onClick={() => handleCategoryClick(category.type)}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white`}>
                      {category.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{category.name}</h4>
                      <p className="text-xs text-muted-foreground truncate">
                        {category.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.count.toLocaleString()}개
                      </p>
                    </div>
                  </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* 트렌딩 태그 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Flame className="w-5 h-5" />
                  트렌딩 태그
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {statsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-10 bg-muted rounded-lg"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  trendingTags.map((tag, index) => (
                  <div
                    key={`tag-${tag.name}-${index}`}
                    onClick={() => handleTagClick(tag.name)}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={filters.tags.includes(tag.name) ? "default" : "outline"}
                        className="text-xs"
                      >
                        #{tag.name}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {tag.count.toLocaleString()}
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs text-green-600">
                      {tag.trend}
                    </Badge>
                  </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* 통계 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">플랫폼 통계</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">총 콘텐츠</span>
                  <span className="font-semibold">12,543</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">크리에이터</span>
                  <span className="font-semibold">2,341</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">다운로드</span>
                  <span className="font-semibold">89,234</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">이번 주 신규</span>
                  <span className="font-semibold text-green-600">+234</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-3 space-y-6">
            {/* 검색 및 필터 */}
            <SearchAndFilter
              onFiltersChange={handleFiltersChange}
              onViewModeChange={setViewMode}
              viewMode={viewMode}
            />

            {/* 콘텐츠 그리드 */}
            <ContentGrid
              filters={filters}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

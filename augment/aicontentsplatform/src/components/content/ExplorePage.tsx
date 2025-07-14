'use client';

import { useState } from 'react';
import SearchAndFilter from './SearchAndFilter';
import ContentGrid from './ContentGrid';
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

const TRENDING_TAGS = [
  { name: '디자인', count: 1234, trend: '+15%' },
  { name: '마케팅', count: 987, trend: '+8%' },
  { name: '비즈니스', count: 756, trend: '+12%' },
  { name: '교육', count: 654, trend: '+5%' },
  { name: '기술', count: 543, trend: '+20%' }
];

const FEATURED_CATEGORIES = [
  {
    name: 'AI 이미지',
    description: 'Midjourney, DALL-E로 생성된 고품질 이미지',
    icon: <Star className="w-6 h-6" />,
    count: 2341,
    color: 'bg-blue-500'
  },
  {
    name: 'PPT 템플릿',
    description: 'ChatGPT로 제작된 전문적인 프레젠테이션',
    icon: <Zap className="w-6 h-6" />,
    count: 1876,
    color: 'bg-green-500'
  },
  {
    name: 'AI 음악',
    description: 'Suno로 생성된 다양한 장르의 음악',
    icon: <Crown className="w-6 h-6" />,
    count: 987,
    color: 'bg-purple-500'
  },
  {
    name: '코드 스니펫',
    description: 'GitHub Copilot으로 작성된 유용한 코드',
    icon: <Flame className="w-6 h-6" />,
    count: 1543,
    color: 'bg-orange-500'
  }
];

export default function ExplorePage() {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: '',
    tool: '',
    priceRange: '',
    sortBy: 'latest',
    tags: []
  });
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
                {FEATURED_CATEGORIES.map((category, index) => (
                  <div
                    key={index}
                    onClick={() => handleCategoryClick(category.name === 'AI 이미지' ? 'image' : 
                                                     category.name === 'PPT 템플릿' ? 'ppt' :
                                                     category.name === 'AI 음악' ? 'music' : 'code')}
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
                ))}
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
                {TRENDING_TAGS.map((tag, index) => (
                  <div
                    key={index}
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
                ))}
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

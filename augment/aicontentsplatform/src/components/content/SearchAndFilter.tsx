'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Search, 
  Filter, 
  X, 
  SlidersHorizontal,
  Grid3X3,
  List
} from 'lucide-react';

interface SearchFilters {
  query: string;
  type: string;
  tool: string;
  priceRange: string;
  sortBy: string;
  tags: string[];
}

interface SearchAndFilterProps {
  onFiltersChange: (filters: SearchFilters) => void;
  onViewModeChange: (mode: 'grid' | 'list') => void;
  viewMode: 'grid' | 'list';
}

const CONTENT_TYPES = [
  { value: '', label: '모든 유형' },
  { value: 'ppt', label: 'PPT/프레젠테이션' },
  { value: 'excel', label: '엑셀/스프레드시트' },
  { value: 'image', label: '이미지/그래픽' },
  { value: 'video', label: '비디오/영상' },
  { value: 'music', label: '음악/오디오' },
  { value: 'code', label: '코드/프로그래밍' },
  { value: 'document', label: '문서/텍스트' },
  { value: 'other', label: '기타' }
];

const AI_TOOLS = [
  { value: '', label: '모든 도구' },
  { value: 'ChatGPT', label: 'ChatGPT' },
  { value: 'Claude', label: 'Claude' },
  { value: 'Midjourney', label: 'Midjourney' },
  { value: 'DALL-E', label: 'DALL-E' },
  { value: 'Stable Diffusion', label: 'Stable Diffusion' },
  { value: 'Suno', label: 'Suno' },
  { value: 'Runway', label: 'Runway' },
  { value: 'GitHub Copilot', label: 'GitHub Copilot' },
  { value: '기타', label: '기타' }
];

const PRICE_RANGES = [
  { value: '', label: '모든 가격' },
  { value: 'free', label: '무료' },
  { value: '0-5000', label: '₩5,000 이하' },
  { value: '5000-20000', label: '₩5,000 - ₩20,000' },
  { value: '20000-50000', label: '₩20,000 - ₩50,000' },
  { value: '50000+', label: '₩50,000 이상' }
];

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'downloads', label: '다운로드순' },
  { value: 'price-low', label: '가격 낮은순' },
  { value: 'price-high', label: '가격 높은순' }
];

const POPULAR_TAGS = [
  '디자인', '마케팅', '비즈니스', '교육', '기술',
  '창의적', '전문적', '실용적', '트렌디', '혁신적'
];

export default function SearchAndFilter({ 
  onFiltersChange, 
  onViewModeChange, 
  viewMode 
}: SearchAndFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    type: '',
    tool: '',
    priceRange: '',
    sortBy: 'latest',
    tags: []
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    console.log('🔍 SearchAndFilter - 필터 업데이트:', updatedFilters);
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    updateFilters({ tags: newTags });
  };

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      query: '',
      type: '',
      tool: '',
      priceRange: '',
      sortBy: 'latest',
      tags: []
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.type || filters.tool || filters.priceRange || filters.tags.length > 0;

  return (
    <div className="space-y-4">
      {/* 메인 검색바 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색 입력 */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="콘텐츠 제목, 설명, 태그로 검색..."
                value={filters.query}
                onChange={(e) => updateFilters({ query: e.target.value })}
                className="pl-10"
              />
            </div>

            {/* 정렬 */}
            <div className="w-full lg:w-48">
              <Select value={filters.sortBy} onValueChange={(value) => updateFilters({ sortBy: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="정렬 기준" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 뷰 모드 전환 */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onViewModeChange('list')}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>

            {/* 고급 필터 토글 */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2"
            >
              <SlidersHorizontal className="w-4 h-4" />
              필터
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 고급 필터 */}
      {showAdvancedFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  상세 필터
                </h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-4 h-4 mr-1" />
                    초기화
                  </Button>
                )}
              </div>

              {/* 필터 옵션들 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* 콘텐츠 유형 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">콘텐츠 유형</label>
                  <Select value={filters.type} onValueChange={(value) => updateFilters({ type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="유형 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* AI 도구 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">AI 도구</label>
                  <Select value={filters.tool} onValueChange={(value) => updateFilters({ tool: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="도구 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {AI_TOOLS.map(tool => (
                        <SelectItem key={tool.value} value={tool.value}>
                          {tool.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 가격 범위 */}
                <div>
                  <label className="text-sm font-medium mb-2 block">가격 범위</label>
                  <Select value={filters.priceRange} onValueChange={(value) => updateFilters({ priceRange: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="가격 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRICE_RANGES.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 인기 태그 */}
              <div>
                <label className="text-sm font-medium mb-2 block">인기 태그</label>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_TAGS.map(tag => (
                    <Badge
                      key={tag}
                      variant={filters.tags.includes(tag) ? "default" : "outline"}
                      className="cursor-pointer hover:bg-primary/80"
                      onClick={() => handleTagToggle(tag)}
                    >
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 선택된 태그 */}
              {filters.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">선택된 태그</label>
                  <div className="flex flex-wrap gap-2">
                    {filters.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        #{tag}
                        <X
                          className="w-3 h-3 cursor-pointer hover:text-red-500"
                          onClick={() => handleTagToggle(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

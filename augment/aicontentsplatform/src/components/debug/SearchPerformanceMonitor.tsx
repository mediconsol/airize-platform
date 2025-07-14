'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Database, Filter, Search } from 'lucide-react';

interface SearchInfo {
  hasFilters: boolean;
  serverFiltered: boolean;
  clientFiltered: boolean;
  originalCount: number;
  finalCount: number;
}

interface SearchPerformanceData {
  searchTime: number;
  searchInfo?: SearchInfo;
  query: string;
  filters: any;
  timestamp: number;
}

interface SearchPerformanceMonitorProps {
  searchData?: SearchPerformanceData;
  isVisible?: boolean;
}

export default function SearchPerformanceMonitor({ 
  searchData, 
  isVisible = false 
}: SearchPerformanceMonitorProps) {
  const [performanceHistory, setPerformanceHistory] = useState<SearchPerformanceData[]>([]);

  useEffect(() => {
    if (searchData) {
      setPerformanceHistory(prev => [searchData, ...prev.slice(0, 4)]); // 최근 5개만 유지
    }
  }, [searchData]);

  if (!isVisible || !searchData) {
    return null;
  }

  const { searchTime, searchInfo, query, filters } = searchData;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Search className="w-4 h-4" />
          검색 성능 모니터
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* 검색 시간 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm">검색 시간</span>
          </div>
          <Badge variant={searchTime < 500 ? 'default' : searchTime < 1000 ? 'secondary' : 'destructive'}>
            {searchTime}ms
          </Badge>
        </div>

        {/* 필터 정보 */}
        {searchInfo && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-500" />
                <span className="text-sm">서버 필터링</span>
              </div>
              <Badge variant={searchInfo.serverFiltered ? 'default' : 'outline'}>
                {searchInfo.serverFiltered ? '활성' : '비활성'}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-500" />
                <span className="text-sm">클라이언트 필터링</span>
              </div>
              <Badge variant={searchInfo.clientFiltered ? 'secondary' : 'outline'}>
                {searchInfo.clientFiltered ? '활성' : '비활성'}
              </Badge>
            </div>

            {/* 결과 통계 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <div>원본: {searchInfo.originalCount}개</div>
              <div>최종: {searchInfo.finalCount}개</div>
              <div>필터율: {((1 - searchInfo.finalCount / searchInfo.originalCount) * 100).toFixed(1)}%</div>
            </div>
          </>
        )}

        {/* 현재 검색 조건 */}
        <div className="text-xs text-muted-foreground">
          <div className="font-medium mb-1">검색 조건:</div>
          {query && <div>• 키워드: "{query}"</div>}
          {filters.type && <div>• 유형: {filters.type}</div>}
          {filters.tool && <div>• 도구: {filters.tool}</div>}
          {filters.priceRange && <div>• 가격: {filters.priceRange}</div>}
          {filters.sortBy && filters.sortBy !== 'latest' && <div>• 정렬: {filters.sortBy}</div>}
          {filters.tags?.length > 0 && <div>• 태그: {filters.tags.join(', ')}</div>}
        </div>

        {/* 성능 히스토리 */}
        {performanceHistory.length > 1 && (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium mb-1">최근 검색 시간:</div>
            <div className="flex gap-1">
              {performanceHistory.slice(0, 5).map((data, index) => (
                <Badge 
                  key={data.timestamp} 
                  variant="outline" 
                  className="text-xs"
                >
                  {data.searchTime}ms
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

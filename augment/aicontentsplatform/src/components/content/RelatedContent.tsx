'use client';

import { useState, useEffect } from 'react';
import { Content, User } from '@/types/firebase';
import { contentService } from '@/lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import ContentCard from './ContentCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  RefreshCw,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface ContentWithCreator extends Content {
  creatorName?: string;
  creatorImage?: string;
  isCreator?: boolean;
}

interface RelatedContentProps {
  currentContent: Content;
  maxItems?: number;
}

export default function RelatedContent({ currentContent, maxItems = 4 }: RelatedContentProps) {
  const [relatedContents, setRelatedContents] = useState<ContentWithCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRelatedContents();
  }, [currentContent.id]);

  const loadRelatedContents = async () => {
    setLoading(true);
    setError(null);

    try {
      // 관련 콘텐츠 로드 전략:
      // 1. 같은 타입의 콘텐츠
      // 2. 같은 AI 도구를 사용한 콘텐츠
      // 3. 같은 태그를 가진 콘텐츠
      // 4. 같은 크리에이터의 다른 콘텐츠

      const allRelated: Content[] = [];

      // 1. 같은 타입의 콘텐츠
      const sameTypeResult = await contentService.searchContents({
        type: currentContent.type,
        pageSize: 8
      });

      if (sameTypeResult.success) {
        allRelated.push(...sameTypeResult.data.filter(c => c.id !== currentContent.id));
      }

      // 2. 같은 AI 도구를 사용한 콘텐츠
      const sameToolResult = await contentService.searchContents({
        tool: currentContent.tool,
        pageSize: 6
      });

      if (sameToolResult.success) {
        const newContents = sameToolResult.data.filter(
          c => c.id !== currentContent.id && !allRelated.some(existing => existing.id === c.id)
        );
        allRelated.push(...newContents);
      }

      // 3. 같은 크리에이터의 다른 콘텐츠
      const creatorContentsResult = await contentService.getUserContents(currentContent.creatorId);
      if (creatorContentsResult.success) {
        const newContents = creatorContentsResult.data.filter(
          c => c.id !== currentContent.id && !allRelated.some(existing => existing.id === c.id)
        );
        allRelated.push(...newContents.slice(0, 4));
      }

      // 중복 제거 및 점수 기반 정렬
      const uniqueContents = Array.from(
        new Map(allRelated.map(content => [content.id, content])).values()
      );

      // 관련성 점수 계산
      const scoredContents = uniqueContents.map(content => {
        let score = 0;
        
        // 같은 타입 (+3점)
        if (content.type === currentContent.type) score += 3;
        
        // 같은 AI 도구 (+2점)
        if (content.tool === currentContent.tool) score += 2;
        
        // 같은 크리에이터 (+1점)
        if (content.creatorId === currentContent.creatorId) score += 1;
        
        // 공통 태그 개수 (+0.5점 per 태그)
        const commonTags = content.tags.filter(tag => currentContent.tags.includes(tag));
        score += commonTags.length * 0.5;
        
        // 인기도 점수 (좋아요 + 다운로드)
        const popularityScore = (content.likes + content.downloads) / 100;
        score += popularityScore;

        return { ...content, score };
      });

      // 점수순으로 정렬하고 상위 항목만 선택
      const sortedContents = scoredContents
        .sort((a, b) => b.score - a.score)
        .slice(0, maxItems);

      // 크리에이터 정보 추가
      const contentsWithCreators = await Promise.all(
        sortedContents.map(async (content) => {
          try {
            const userDoc = await getDoc(doc(db, 'users', content.creatorId));
            if (userDoc.exists()) {
              const userData = userDoc.data() as User;
              return {
                ...content,
                creatorName: userData.name,
                creatorImage: userData.profileImage,
                isCreator: userData.roles.includes('creator')
              };
            }
            return content;
          } catch (error) {
            console.error('크리에이터 정보 로드 오류:', error);
            return content;
          }
        })
      );

      setRelatedContents(contentsWithCreators);
    } catch (error: any) {
      setError(error.message || '관련 콘텐츠를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (contentId: string, isLiked: boolean) => {
    setRelatedContents(prev =>
      prev.map(content =>
        content.id === contentId
          ? { ...content, likes: content.likes + (isLiked ? 1 : -1) }
          : content
      )
    );
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            관련 콘텐츠
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="aspect-video w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || relatedContents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            관련 콘텐츠
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {error || '관련 콘텐츠를 찾을 수 없습니다.'}
          </p>
          <Button variant="outline" onClick={loadRelatedContents}>
            <RefreshCw className="w-4 h-4 mr-2" />
            다시 시도
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            관련 콘텐츠
          </CardTitle>
          <Link href="/explore">
            <Button variant="ghost" size="sm">
              더 보기
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {relatedContents.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              creatorName={content.creatorName}
              creatorImage={content.creatorImage}
              isCreator={content.isCreator}
              onLike={handleLike}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

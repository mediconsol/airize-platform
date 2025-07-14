'use client';

import { useState, useEffect } from 'react';
import { Content } from '@/types/firebase';
import { contentService } from '@/lib/firestore';
import ContentDetail from './ContentDetail';
import RelatedContent from './RelatedContent';
import CommentSection from './CommentSection';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface ContentDetailPageProps {
  contentId: string;
}

export default function ContentDetailPage({ contentId }: ContentDetailPageProps) {
  const router = useRouter();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadContent();
  }, [contentId]);

  const loadContent = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await contentService.getContent(contentId);
      if (result.success) {
        setContent(result.data);
      } else {
        setError(result.error || '콘텐츠를 찾을 수 없습니다.');
      }
    } catch (error: any) {
      setError(error.message || '콘텐츠를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error || '콘텐츠를 찾을 수 없습니다.'}
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              이전으로
            </Button>
            <Link href="/explore">
              <Button>
                콘텐츠 탐색하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 메인 콘텐츠 상세 */}
        <ContentDetail contentId={contentId} />

        {/* 댓글 섹션 */}
        <CommentSection 
          contentId={contentId} 
          initialCommentCount={content.comments}
        />

        {/* 관련 콘텐츠 */}
        <RelatedContent currentContent={content} />

        {/* 하단 네비게이션 */}
        <div className="flex items-center justify-between pt-8 border-t">
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전으로
          </Button>
          
          <div className="flex gap-2">
            <Link href="/explore">
              <Button variant="outline">
                더 많은 콘텐츠 보기
              </Button>
            </Link>
            <Link href="/upload">
              <Button>
                콘텐츠 업로드하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

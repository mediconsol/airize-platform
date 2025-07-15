'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Content } from '@/types/firebase';

interface AISummaryProps {
  content: Content;
  autoGenerate?: boolean;
}

interface SummaryState {
  summary: string | null;
  loading: boolean;
  error: string | null;
  generated: boolean;
}

export function AISummary({ content, autoGenerate = false }: AISummaryProps) {
  const [state, setState] = useState<SummaryState>({
    summary: null,
    loading: false,
    error: null,
    generated: false
  });

  // 컴포넌트 마운트 시 자동 생성
  useEffect(() => {
    if (autoGenerate && !state.generated && !state.loading) {
      generateSummary();
    }
  }, [autoGenerate, content.id]);

  const generateSummary = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('🤖 AI 요약 요청 시작:', content.title);

      const response = await fetch('/api/ai-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: content.title,
          description: content.description,
          type: content.type,
          tool: content.tool,
          tags: content.tags || []
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'AI 요약 생성에 실패했습니다.');
      }

      setState({
        summary: data.summary,
        loading: false,
        error: null,
        generated: true
      });

      console.log('✅ AI 요약 완료');

    } catch (error: any) {
      console.error('❌ AI 요약 오류:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'AI 요약 생성 중 오류가 발생했습니다.',
        generated: true
      }));
    }
  };

  const handleRetry = () => {
    setState(prev => ({ ...prev, generated: false }));
    generateSummary();
  };

  // 로딩 상태
  if (state.loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <Badge variant="secondary" className="text-xs">
                AI 요약
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI가 콘텐츠를 분석하고 있습니다...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 오류 상태
  if (state.error) {
    return (
      <Alert variant="destructive" className="border-red-200">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{state.error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            className="ml-2"
          >
            <RefreshCw className="w-3 h-3 mr-1" />
            다시 시도
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  // 요약 완료 상태
  if (state.summary) {
    return (
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <Badge variant="secondary" className="text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                AI 요약
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRetry}
              className="text-xs h-7 px-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              새로 생성
            </Button>
          </div>
          
          <div className="text-sm leading-relaxed text-foreground/90">
            {state.summary}
          </div>
          
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Gemini 2.0 Flash로 생성된 요약입니다</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 초기 상태 (수동 생성 버튼)
  if (!autoGenerate) {
    return (
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">
                AI가 이 콘텐츠를 요약해드릴까요?
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={generateSummary}
              className="text-xs"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI 요약 생성
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

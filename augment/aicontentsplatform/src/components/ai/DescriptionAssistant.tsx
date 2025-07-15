'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Sparkles,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Copy,
  Eye,
  Edit3
} from 'lucide-react';

interface DescriptionAssistantProps {
  title: string;
  type: string;
  tool: string;
  tags?: string[];
  onDescriptionGenerated: (description: string) => void;
}

interface AssistantState {
  rawInput: string;
  enhancedDescription: string | null;
  loading: boolean;
  error: string | null;
  showPreview: boolean;
}

export function DescriptionAssistant({ 
  title, 
  type, 
  tool, 
  tags = [], 
  onDescriptionGenerated 
}: DescriptionAssistantProps) {
  const [state, setState] = useState<AssistantState>({
    rawInput: '',
    enhancedDescription: null,
    loading: false,
    error: null,
    showPreview: false
  });

  const enhanceDescription = async () => {
    if (!state.rawInput.trim()) {
      setState(prev => ({ ...prev, error: '설명 내용을 입력해주세요.' }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('✨ AI 상세설명 정리 요청 시작');

      const response = await fetch('/api/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          rawDescription: state.rawInput,
          type,
          tool,
          tags
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || '상세설명 정리에 실패했습니다.');
      }

      setState(prev => ({
        ...prev,
        enhancedDescription: data.enhancedDescription,
        loading: false,
        error: null,
        showPreview: true
      }));

      console.log('✅ AI 상세설명 정리 완료');

    } catch (error: any) {
      console.error('❌ AI 상세설명 정리 오류:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: error.message || '상세설명 정리 중 오류가 발생했습니다.'
      }));
    }
  };

  const handleApply = () => {
    if (state.enhancedDescription) {
      onDescriptionGenerated(state.enhancedDescription);
      setState(prev => ({ ...prev, showPreview: false }));
    }
  };

  const handleCopy = async () => {
    if (state.enhancedDescription) {
      try {
        await navigator.clipboard.writeText(state.enhancedDescription);
        // 복사 성공 피드백 (선택사항)
      } catch (error) {
        console.error('복사 실패:', error);
      }
    }
  };

  const handleReset = () => {
    setState({
      rawInput: '',
      enhancedDescription: null,
      loading: false,
      error: null,
      showPreview: false
    });
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          AI 상세설명 작성 도우미
          <Badge variant="secondary" className="text-xs">
            Gemini 2.0 Flash
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          간단한 설명을 입력하면 AI가 구조화된 마크다운 형식으로 정리해드립니다.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 오류 표시 */}
        {state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{state.error}</AlertDescription>
          </Alert>
        )}

        {/* 원본 입력 영역 */}
        {!state.showPreview && (
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                설명 내용을 자유롭게 작성해주세요
              </label>
              <Textarea
                value={state.rawInput}
                onChange={(e) => setState(prev => ({ ...prev, rawInput: e.target.value }))}
                placeholder="예: 이 PPT 템플릿은 비즈니스 프레젠테이션용입니다. 깔끔한 디자인과 다양한 차트가 포함되어 있습니다. ChatGPT로 내용을 구성했고 실무에서 바로 사용할 수 있습니다..."
                className="min-h-[120px] resize-none"
                disabled={state.loading}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={enhanceDescription}
                disabled={state.loading || !state.rawInput.trim()}
                className="flex-1"
              >
                {state.loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    AI가 정리하고 있습니다...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI로 정리하기
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* 정리된 결과 미리보기 */}
        {state.showPreview && state.enhancedDescription && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">AI가 정리한 상세설명</span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopy}
                  className="h-7 px-2"
                >
                  <Copy className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setState(prev => ({ ...prev, showPreview: false }))}
                  className="h-7 px-2"
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
              </div>
            </div>

            <div className="bg-background border rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <pre className="whitespace-pre-wrap text-sm font-mono">
                {state.enhancedDescription}
              </pre>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleApply} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                이 설명 적용하기
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RefreshCw className="w-4 h-4 mr-2" />
                다시 작성
              </Button>
            </div>
          </div>
        )}

        {/* 도움말 */}
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
          <div className="flex items-start gap-2">
            <Sparkles className="w-3 h-3 mt-0.5 text-primary" />
            <div>
              <p className="font-medium mb-1">AI 작성 도우미 팁:</p>
              <ul className="space-y-1 text-xs">
                <li>• 핵심 특징과 장점을 간단히 나열해주세요</li>
                <li>• AI가 마크다운 형식으로 구조화해드립니다</li>
                <li>• 제목, 불릿 포인트, 강조 표시 등이 자동 적용됩니다</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

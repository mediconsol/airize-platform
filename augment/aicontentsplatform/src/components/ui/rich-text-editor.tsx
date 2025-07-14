'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  Eye, 
  Edit3, 
  Bold, 
  Italic, 
  List, 
  Link2, 
  Image as ImageIcon,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3
} from 'lucide-react';

// 동적 import로 SSR 문제 해결
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  maxLength?: number;
  height?: number;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "콘텐츠에 대한 상세한 설명을 작성해주세요...",
  label = "상세 설명",
  required = false,
  maxLength = 5000,
  height = 300
}: RichTextEditorProps) {
  const [mounted, setMounted] = useState(false);
  const [editorError, setEditorError] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (val?: string) => {
    const newValue = val || '';
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  // 마크다운 가이드 템플릿
  const insertTemplate = (template: string) => {
    const newValue = value + (value ? '\n\n' : '') + template;
    if (newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const templates = {
    features: `## 🎯 주요 특징
- **특징 1**: 설명
- **특징 2**: 설명
- **특징 3**: 설명`,
    
    usage: `## 📋 사용법
1. **1단계**: 첫 번째 단계 설명
2. **2단계**: 두 번째 단계 설명
3. **3단계**: 세 번째 단계 설명`,
    
    examples: `## 💡 활용 예시
### 비즈니스
- 프레젠테이션 제작
- 보고서 작성

### 교육
- 강의 자료 제작
- 학습 콘텐츠 개발`,
    
    requirements: `## ⚙️ 요구사항
- **소프트웨어**: 필요한 프로그램
- **버전**: 호환 버전 정보
- **기타**: 추가 요구사항`,
    
    tips: `## 💡 사용 팁
> **팁 1**: 유용한 팁 내용
> 
> **팁 2**: 또 다른 팁 내용`
  };

  if (!mounted) {
    return (
      <div className="space-y-2">
        <Label>{label} {required && <span className="text-red-500">*</span>}</Label>
        <div className="border rounded-md p-4 bg-muted animate-pulse" style={{ height: height }}>
          <div className="h-4 bg-muted-foreground/20 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-muted-foreground/20 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="text-xs text-muted-foreground">
          {value.length} / {maxLength}자
        </div>
      </div>

      {/* 빠른 템플릿 버튼들 */}
      <Card className="p-3">
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-muted-foreground mr-2">빠른 템플릿:</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertTemplate(templates.features)}
            className="text-xs h-7"
          >
            <List className="w-3 h-3 mr-1" />
            주요 특징
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertTemplate(templates.usage)}
            className="text-xs h-7"
          >
            <Edit3 className="w-3 h-3 mr-1" />
            사용법
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertTemplate(templates.examples)}
            className="text-xs h-7"
          >
            <ImageIcon className="w-3 h-3 mr-1" />
            활용 예시
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => insertTemplate(templates.tips)}
            className="text-xs h-7"
          >
            <Quote className="w-3 h-3 mr-1" />
            사용 팁
          </Button>
        </div>
      </Card>

      {/* 마크다운 에디터 */}
      <div className="border rounded-lg overflow-hidden">
        {editorError ? (
          // Fallback: 일반 textarea
          <div className="p-3 bg-muted/30">
            <p className="text-sm text-muted-foreground mb-2">
              ⚠️ 리치 텍스트 에디터를 로드할 수 없습니다. 기본 텍스트 입력을 사용합니다.
            </p>
            <Textarea
              value={value}
              onChange={(e) => handleChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[200px] resize-none"
              style={{ height: height - 60 }}
            />
          </div>
        ) : (
          <MDEditor
            value={value}
            onChange={handleChange}
            height={height}
            preview="edit"
            hideToolbar={false}
            textareaProps={{
              placeholder,
              style: {
                fontSize: 14,
                lineHeight: 1.6,
                fontFamily: 'inherit'
              }
            }}
            data-color-mode="light"
            style={{
              backgroundColor: 'transparent'
            }}
            onError={() => setEditorError(true)}
          />
        )}
      </div>

      {/* 마크다운 가이드 */}
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Code className="w-4 h-4" />
            마크다운 문법 가이드
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Heading1 className="w-3 h-3" />
                <code># 제목 1</code>
              </div>
              <div className="flex items-center gap-2">
                <Heading2 className="w-3 h-3" />
                <code>## 제목 2</code>
              </div>
              <div className="flex items-center gap-2">
                <Bold className="w-3 h-3" />
                <code>**굵게**</code>
              </div>
              <div className="flex items-center gap-2">
                <Italic className="w-3 h-3" />
                <code>*기울임*</code>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <List className="w-3 h-3" />
                <code>- 목록 항목</code>
              </div>
              <div className="flex items-center gap-2">
                <Link2 className="w-3 h-3" />
                <code>[링크](URL)</code>
              </div>
              <div className="flex items-center gap-2">
                <Quote className="w-3 h-3" />
                <code>&gt; 인용문</code>
              </div>
              <div className="flex items-center gap-2">
                <Code className="w-3 h-3" />
                <code>`코드`</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 글자 수 경고 */}
      {value.length > maxLength * 0.9 && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          ⚠️ 글자 수가 제한에 가까워지고 있습니다. ({value.length}/{maxLength}자)
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/lib/firestore';
import { updateContentStats } from '@/lib/initFirestore';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import FileUploadZone from './FileUploadZone';
import ContentMetadataForm from './ContentMetadataForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Upload,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

interface UploadedFile {
  file: File;
  downloadURL: string;
}

interface ContentMetadata {
  title: string;
  description: string;
  type: string;
  tool: string;
  price: number;
  tags: string[];
  isPublic: boolean;
  demoURL?: string;
  youtubeURL?: string;
  galleryImages?: Array<{
    id: string;
    url: string;
    caption: string;
  }>;
}

export default function UploadPage() {
  const { user } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [currentStep, setCurrentStep] = useState<'upload' | 'metadata' | 'success'>('upload');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedContentId, setUploadedContentId] = useState<string | null>(null);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      setCurrentStep('metadata');
    }
  };

  const handleMetadataSubmit = async (metadata: ContentMetadata) => {
    if (!user || uploadedFiles.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      // 메인 파일 (첫 번째 파일)
      const mainFile = uploadedFiles[0];
      
      // 썸네일 URL (이미지인 경우 메인 파일, 아니면 기본 썸네일)
      const previewURL = mainFile.file.type.startsWith('image/') 
        ? mainFile.downloadURL 
        : undefined;

      // 콘텐츠 데이터 생성
      // undefined 값들을 제거하여 Firestore 오류 방지
      const contentData: any = {
        title: metadata.title,
        type: metadata.type as any,
        description: metadata.description,
        tool: metadata.tool,
        downloadURL: mainFile.downloadURL,
        price: metadata.price,
        creatorId: user.uid,
        tags: metadata.tags,
        views: 0,
        likes: 0,
        downloads: 0,
        comments: 0,
        isPublic: metadata.isPublic,
      };

      // 선택적 필드들은 값이 있을 때만 추가
      if (previewURL) {
        contentData.previewURL = previewURL;
      }
      if (metadata.demoURL && metadata.demoURL.trim()) {
        contentData.demoURL = metadata.demoURL.trim();
      }
      if (metadata.youtubeURL && metadata.youtubeURL.trim()) {
        contentData.youtubeURL = metadata.youtubeURL.trim();
      }
      if (metadata.galleryImages && metadata.galleryImages.length > 0) {
        const validImages = metadata.galleryImages.filter(img => img.url && !img.url.startsWith('blob:'));
        console.log('갤러리 이미지 필터링:', {
          전체: metadata.galleryImages.length,
          유효한이미지: validImages.length,
          이미지들: metadata.galleryImages.map(img => ({ id: img.id, url: img.url.substring(0, 50) + '...', uploading: img.uploading }))
        });
        contentData.galleryImages = validImages;
      }

      // Firestore에 콘텐츠 저장
      const result = await contentService.createContent(contentData);
      
      if (result.success) {
        setUploadedContentId(result.id);
        
        // 통계 업데이트
        await updateContentStats('increment');
        
        setCurrentStep('success');
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      setError(error.message || '콘텐츠 업로드 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpload = () => {
    setUploadedFiles([]);
    setCurrentStep('upload');
    setError(null);
    setUploadedContentId(null);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1: 파일 업로드 */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'upload' ? 'text-primary' : 
          currentStep === 'metadata' || currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'upload' ? 'border-primary bg-primary text-primary-foreground' :
            currentStep === 'metadata' || currentStep === 'success' ? 'border-green-600 bg-green-600 text-white' :
            'border-muted-foreground'
          }`}>
            {currentStep === 'metadata' || currentStep === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              '1'
            )}
          </div>
          <span className="font-medium">파일 업로드</span>
        </div>

        {/* 연결선 */}
        <div className={`w-12 h-0.5 ${
          currentStep === 'metadata' || currentStep === 'success' ? 'bg-green-600' : 'bg-muted-foreground/30'
        }`} />

        {/* Step 2: 정보 입력 */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'metadata' ? 'text-primary' : 
          currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'metadata' ? 'border-primary bg-primary text-primary-foreground' :
            currentStep === 'success' ? 'border-green-600 bg-green-600 text-white' :
            'border-muted-foreground'
          }`}>
            {currentStep === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              '2'
            )}
          </div>
          <span className="font-medium">정보 입력</span>
        </div>

        {/* 연결선 */}
        <div className={`w-12 h-0.5 ${
          currentStep === 'success' ? 'bg-green-600' : 'bg-muted-foreground/30'
        }`} />

        {/* Step 3: 완료 */}
        <div className={`flex items-center space-x-2 ${
          currentStep === 'success' ? 'text-green-600' : 'text-muted-foreground'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'success' ? 'border-green-600 bg-green-600 text-white' : 'border-muted-foreground'
          }`}>
            {currentStep === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              '3'
            )}
          </div>
          <span className="font-medium">완료</span>
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="bg-gradient-to-br from-background via-background to-muted/20 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-primary-foreground" />
              </div>
              <h1 className="text-3xl font-bold">콘텐츠 업로드</h1>
            </div>
            <p className="text-muted-foreground">
              AI로 생성한 콘텐츠를 업로드하고 다른 사용자들과 공유하세요
            </p>
          </div>

          {/* 단계 표시기 */}
          {renderStepIndicator()}

          {/* 에러 메시지 */}
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 단계별 콘텐츠 */}
          {currentStep === 'upload' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    파일 업로드
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FileUploadZone
                    onFilesUploaded={handleFilesUploaded}
                    maxFiles={1}
                    maxSizeMB={100}
                    userId={user?.uid || ''}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 'metadata' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep('upload')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  이전 단계
                </Button>
              </div>

              <ContentMetadataForm
                onSubmit={handleMetadataSubmit}
                loading={loading}
              />
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center space-y-6">
              <Card className="p-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold mb-2">업로드 완료!</h2>
                <p className="text-muted-foreground mb-6">
                  콘텐츠가 성공적으로 업로드되었습니다.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button onClick={resetUpload} variant="outline">
                    새 콘텐츠 업로드
                  </Button>
                  <Link href="/my-content">
                    <Button className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      내 콘텐츠 보기
                    </Button>
                  </Link>
                </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}

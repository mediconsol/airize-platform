'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ImageGallery from '@/components/ui/image-gallery';
import {
  Tag,
  DollarSign,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Globe,
  Youtube
} from 'lucide-react';

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

interface ContentMetadataFormProps {
  onSubmit: (metadata: ContentMetadata) => void;
  loading?: boolean;
}

const CONTENT_TYPES = [
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
  'ChatGPT',
  'Claude',
  'Midjourney',
  'DALL-E',
  'Stable Diffusion',
  'Suno',
  'Runway',
  'GitHub Copilot',
  'Canva AI',
  'Figma AI',
  '기타'
];

const POPULAR_TAGS = [
  '디자인', '마케팅', '비즈니스', '교육', '기술',
  '창의적', '전문적', '실용적', '트렌디', '혁신적'
];

export default function ContentMetadataForm({ onSubmit, loading = false }: ContentMetadataFormProps) {
  const [formData, setFormData] = useState<ContentMetadata>({
    title: '',
    description: '',
    type: '',
    tool: '',
    price: 0,
    tags: [],
    isPublic: true,
    demoURL: '',
    youtubeURL: '',
    galleryImages: []
  });
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [newTag, setNewTag] = useState('');

  const handleInputChange = (field: keyof ContentMetadata, value: any) => {
    if (field === 'galleryImages') {
      console.log('🔥 handleInputChange - galleryImages 업데이트 시작!', {
        이전이미지수: formData.galleryImages?.length || 0,
        value타입: typeof value,
        value가배열인가: Array.isArray(value),
        value: value
      });

      // value가 함수인 경우 (함수형 업데이트)
      if (typeof value === 'function') {
        console.log('📝 함수형 업데이트 감지 - setFormData에서 처리');
        setFormData(prev => {
          const currentImages = prev.galleryImages || [];
          console.log('함수형 업데이트 - 현재 상태:', {
            현재이미지수: currentImages.length,
            현재이미지들: currentImages.map((img: any) => ({
              id: img.id,
              uploading: img.uploading,
              url: img.url.substring(0, 30) + '...',
              파일명: img.file?.name || '파일없음'
            }))
          });

          const newImages = value(currentImages);
          console.log('✅ 함수형 업데이트 결과:', {
            이전이미지수: currentImages.length,
            새이미지수: newImages?.length || 0,
            새이미지들: newImages?.map((img: any) => ({
              id: img.id,
              uploading: img.uploading,
              url: img.url.substring(0, 30) + '...',
              파일명: img.file?.name || '파일없음'
            }))
          });
          return {
            ...prev,
            [field]: newImages
          };
        });
        return;
      }

      // value가 배열인 경우 (직접 업데이트)
      if (Array.isArray(value)) {
        console.log('📝 배열 직접 업데이트:', {
          새이미지수: value.length,
          새이미지들: value.map((img: any) => ({
            id: img.id,
            uploading: img.uploading,
            url: img.url.substring(0, 30) + '...',
            파일명: img.file?.name || '파일없음'
          }))
        });
      }

      console.log('📊 현재 isImageUploading 상태:', isImageUploading);
    }

    console.log(`🔄 setFormData 호출 - ${field} 필드 업데이트`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [field]: value
      };

      if (field === 'galleryImages') {
        console.log('✅ formData 업데이트 완료 - galleryImages:', newData.galleryImages?.length || 0, '개');
      }

      return newData;
    });
  };

  const isValidURL = (url: string) => {
    if (!url) return true; // 빈 URL은 유효함 (선택사항)
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const isValidYouTubeURL = (url: string) => {
    if (!url) return true; // 빈 URL은 유효함 (선택사항)
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)/;
    return youtubeRegex.test(url);
  };

  // 이미지 업로드 상태 관리
  const handleImageUploadStart = () => {
    console.log('🔥🔥🔥 ContentMetadataForm: 이미지 업로드 시작!!! - isImageUploading을 true로 설정');
    console.log('이전 isImageUploading 상태:', isImageUploading);
    setIsImageUploading(true);
    console.log('setIsImageUploading(true) 호출 완료');
  };

  const handleImageUploadComplete = () => {
    console.log('🎉🎉🎉 ContentMetadataForm: 이미지 업로드 완료!!! - isImageUploading을 false로 설정');
    console.log('이전 isImageUploading 상태:', isImageUploading);
    setIsImageUploading(false);
    console.log('setIsImageUploading(false) 호출 완료');
  };

  const addTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, trimmedTag]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(newTag);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 폼 검증
    if (!formData.title.trim()) {
      alert('제목을 입력해주세요.');
      return;
    }
    if (!formData.description.trim()) {
      alert('설명을 입력해주세요.');
      return;
    }
    if (!formData.type) {
      alert('콘텐츠 유형을 선택해주세요.');
      return;
    }
    if (!formData.tool) {
      alert('사용한 AI 도구를 선택해주세요.');
      return;
    }
    if (formData.price < 0) {
      alert('가격은 0원 이상이어야 합니다.');
      return;
    }
    if (formData.demoURL && !isValidURL(formData.demoURL)) {
      alert('올바른 데모사이트 URL을 입력해주세요.');
      return;
    }
    if (formData.youtubeURL && !isValidYouTubeURL(formData.youtubeURL)) {
      alert('올바른 YouTube URL을 입력해주세요.');
      return;
    }

    // 이미지 업로드 상태 확인 - 강화된 검증
    console.log('🚨🚨🚨 제출 검증 시작!!! 현재 상태:', {
      isImageUploading: isImageUploading,
      galleryImagesCount: formData.galleryImages?.length || 0,
      galleryImages: formData.galleryImages?.map(img => ({
        id: img.id,
        url: img.url.substring(0, 50) + '...',
        uploading: img.uploading,
        파일명: img.file?.name || '파일없음'
      }))
    });

    console.log('🔍 1단계 검증: isImageUploading =', isImageUploading);
    if (isImageUploading) {
      console.log('❌ 제출 차단: isImageUploading = true');
      alert('이미지 업로드가 진행 중입니다. 업로드가 완료될 때까지 기다려주세요.');
      return;
    }
    console.log('✅ 1단계 검증 통과: isImageUploading = false');

    console.log('🔍 2단계 검증: uploading 상태 이미지 확인');
    const uploadingImages = formData.galleryImages?.filter(img => img.uploading) || [];
    console.log('uploading 상태 이미지:', uploadingImages.length, '개');
    if (uploadingImages.length > 0) {
      console.log('❌ 제출 차단: uploading 상태 이미지 존재:', uploadingImages.length);
      alert(`이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요. (${uploadingImages.length}개 업로드 중)`);
      return;
    }
    console.log('✅ 2단계 검증 통과: uploading 상태 이미지 없음');

    console.log('🔍 3단계 검증: blob URL 이미지 확인');
    // blob URL이 있는 이미지가 있는지 확인 (업로드되지 않은 이미지)
    const unuploadedImages = formData.galleryImages?.filter(img => img.url.startsWith('blob:')) || [];
    console.log('blob URL 이미지:', unuploadedImages.length, '개');
    if (unuploadedImages.length > 0) {
      console.log('❌ 제출 차단: blob URL 이미지 존재:', unuploadedImages.length);
      alert(`일부 이미지가 아직 업로드되지 않았습니다. 잠시 후 다시 시도해주세요. (${unuploadedImages.length}개 미완료)`);
      return;
    }
    console.log('✅ 3단계 검증 통과: blob URL 이미지 없음');

    console.log('🎉🎉🎉 모든 이미지 검증 통과!!! - 제출 진행');

    // 임시 검증: 이미지 갤러리가 비어있는지 확인 (디버깅용)
    if (!formData.galleryImages || formData.galleryImages.length === 0) {
      console.log('⚠️ 임시 검증: 이미지 갤러리가 비어있습니다');
      alert('이미지 갤러리가 비어있습니다. 이미지를 추가해주세요.');
      return;
    }

    // 빈 문자열을 undefined로 변환하여 Firestore 오류 방지
    const cleanedData = {
      ...formData,
      demoURL: formData.demoURL?.trim() || undefined,
      youtubeURL: formData.youtubeURL?.trim() || undefined
    };

    console.log('제출할 데이터:', cleanedData);
    onSubmit(cleanedData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          콘텐츠 정보
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              placeholder="콘텐츠 제목을 입력하세요"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              maxLength={100}
              required
            />
            <p className="text-xs text-muted-foreground text-right">
              {formData.title.length}/100
            </p>
          </div>

          {/* 설명 */}
          <RichTextEditor
            value={formData.description}
            onChange={(value) => handleInputChange('description', value)}
            label="상세 설명"
            placeholder="콘텐츠에 대한 자세한 설명을 마크다운으로 작성하세요..."
            required={true}
            maxLength={2000}
            height={250}
          />

          {/* 콘텐츠 유형과 AI 도구 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>콘텐츠 유형 *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="유형을 선택하세요" />
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

            <div className="space-y-2">
              <Label>사용한 AI 도구 *</Label>
              <Select value={formData.tool} onValueChange={(value) => handleInputChange('tool', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="AI 도구를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {AI_TOOLS.map(tool => (
                    <SelectItem key={tool} value={tool}>
                      {tool}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 가격 */}
          <div className="space-y-2">
            <Label htmlFor="price">가격 (원)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="price"
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
                className="pl-10"
                min="0"
                step="100"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              0원으로 설정하면 무료 콘텐츠가 됩니다
            </p>
          </div>

          {/* 관련 링크 */}
          <div className="space-y-4">
            <Label className="text-base font-medium">관련 링크 (선택사항)</Label>

            {/* 데모사이트 URL */}
            <div className="space-y-2">
              <Label htmlFor="demoURL">데모사이트 URL</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="demoURL"
                  type="url"
                  placeholder="https://example.com"
                  value={formData.demoURL || ''}
                  onChange={(e) => handleInputChange('demoURL', e.target.value)}
                  className={`pl-10 ${formData.demoURL && !isValidURL(formData.demoURL) ? 'border-red-500' : ''}`}
                />
              </div>
              {formData.demoURL && !isValidURL(formData.demoURL) && (
                <p className="text-xs text-red-500">올바른 URL 형식을 입력해주세요</p>
              )}
              <p className="text-xs text-muted-foreground">
                콘텐츠와 관련된 웹사이트나 데모 페이지 링크
              </p>
            </div>

            {/* YouTube URL */}
            <div className="space-y-2">
              <Label htmlFor="youtubeURL">YouTube 링크</Label>
              <div className="relative">
                <Youtube className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="youtubeURL"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.youtubeURL || ''}
                  onChange={(e) => handleInputChange('youtubeURL', e.target.value)}
                  className={`pl-10 ${formData.youtubeURL && !isValidYouTubeURL(formData.youtubeURL) ? 'border-red-500' : ''}`}
                />
              </div>
              {formData.youtubeURL && !isValidYouTubeURL(formData.youtubeURL) && (
                <p className="text-xs text-red-500">올바른 YouTube URL을 입력해주세요</p>
              )}
              <p className="text-xs text-muted-foreground">
                콘텐츠 제작 과정이나 사용법을 보여주는 YouTube 영상
              </p>
            </div>
          </div>

          {/* 이미지 갤러리 */}
          <ImageGallery
            images={formData.galleryImages?.map(img => ({
              id: img.id,
              url: img.url,
              caption: img.caption
            })) || []}
            onChange={(images) => handleInputChange('galleryImages', images)}
            maxImages={5}
            maxFileSize={5}
            label="설명용 이미지"
            required={false}
            onUploadStart={handleImageUploadStart}
            onUploadComplete={handleImageUploadComplete}
          />

          {/* 태그 */}
          <div className="space-y-3">
            <Label>태그 (최대 10개)</Label>
            
            {/* 인기 태그 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">인기 태그:</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => formData.tags.includes(tag) ? removeTag(tag) : addTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 커스텀 태그 입력 */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="새 태그 입력 후 Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagInputKeyPress}
                  className="pl-10"
                  maxLength={20}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => addTag(newTag)}
                disabled={!newTag.trim() || formData.tags.length >= 10}
              >
                추가
              </Button>
            </div>

            {/* 선택된 태그 */}
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-red-500"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* 공개 설정 */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {formData.isPublic ? (
                  <Eye className="w-4 h-4 text-green-600" />
                ) : (
                  <EyeOff className="w-4 h-4 text-gray-600" />
                )}
                <Label htmlFor="isPublic" className="font-medium">
                  {formData.isPublic ? '공개' : '비공개'}
                </Label>
              </div>
              <p className="text-sm text-muted-foreground">
                {formData.isPublic 
                  ? '모든 사용자가 이 콘텐츠를 볼 수 있습니다'
                  : '본인만 이 콘텐츠를 볼 수 있습니다'
                }
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={formData.isPublic}
              onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
            />
          </div>

          {/* 제출 버튼 */}
          <Button
            type="submit"
            className="w-full"
            disabled={
              loading ||
              isImageUploading ||
              formData.galleryImages?.some(img => img.uploading) ||
              formData.galleryImages?.some(img => img.url.startsWith('blob:'))
            }
            size="lg"
          >
            {loading ? '업로드 중...' :
             isImageUploading ? '이미지 업로드 중...' :
             formData.galleryImages?.some(img => img.uploading) ? '이미지 업로드 중...' :
             formData.galleryImages?.some(img => img.url.startsWith('blob:')) ? '이미지 처리 중...' :
             '콘텐츠 업로드'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

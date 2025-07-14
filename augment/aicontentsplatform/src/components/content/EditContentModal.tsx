'use client';

import { useState, useEffect } from 'react';
import { Content } from '@/types/firebase';
import { contentService } from '@/lib/firestore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RichTextEditor from '@/components/ui/rich-text-editor';
import ImageGallery from '@/components/ui/image-gallery';
import {
  Save,
  X,
  Loader2,
  AlertCircle,
  Plus,
  Globe,
  Youtube
} from 'lucide-react';

interface EditContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onContentUpdated: (updatedContent: Content) => void;
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
  'ChatGPT', 'Claude', 'Midjourney', 'DALL-E', 'Stable Diffusion',
  'Suno', 'Runway', 'GitHub Copilot', '기타'
];

const POPULAR_TAGS = [
  '디자인', '마케팅', '비즈니스', '교육', '기술',
  '창의적', '전문적', '실용적', '트렌디', '혁신적'
];

export default function EditContentModal({ 
  isOpen, 
  onClose, 
  content, 
  onContentUpdated 
}: EditContentModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    tool: '',
    price: 0,
    isPublic: true,
    tags: [] as string[],
    demoURL: '',
    youtubeURL: '',
    galleryImages: [] as Array<{
      id: string;
      url: string;
      caption: string;
    }>
  });
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isImageUploading, setIsImageUploading] = useState(false);

  // 모달이 열릴 때 기존 콘텐츠 데이터로 폼 초기화
  useEffect(() => {
    if (isOpen && content) {
      setFormData({
        title: content.title,
        description: content.description,
        type: content.type,
        tool: content.tool,
        price: content.price,
        isPublic: content.isPublic,
        tags: [...content.tags],
        demoURL: content.demoURL || '',
        youtubeURL: content.youtubeURL || '',
        galleryImages: content.galleryImages || []
      });
      setError(null);
    }
  }, [isOpen, content]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim()) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handlePopularTagClick = (tag: string) => {
    if (!formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }));
    }
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
    console.log('편집 모달: 이미지 업로드 시작');
    setIsImageUploading(true);
  };

  const handleImageUploadComplete = () => {
    console.log('편집 모달: 이미지 업로드 완료');
    setIsImageUploading(false);
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.');
      return false;
    }
    if (!formData.description.trim()) {
      setError('설명을 입력해주세요.');
      return false;
    }
    if (!formData.type) {
      setError('콘텐츠 유형을 선택해주세요.');
      return false;
    }
    if (!formData.tool) {
      setError('AI 도구를 선택해주세요.');
      return false;
    }
    if (formData.price < 0) {
      setError('가격은 0원 이상이어야 합니다.');
      return false;
    }
    if (formData.demoURL && !isValidURL(formData.demoURL)) {
      setError('올바른 데모사이트 URL을 입력해주세요.');
      return false;
    }
    if (formData.youtubeURL && !isValidYouTubeURL(formData.youtubeURL)) {
      setError('올바른 YouTube URL을 입력해주세요.');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    // 이미지 업로드 상태 확인 - 강화된 검증
    if (isImageUploading) {
      setError('이미지 업로드가 진행 중입니다. 업로드가 완료될 때까지 기다려주세요.');
      return;
    }

    const uploadingImages = formData.galleryImages?.filter(img => img.uploading) || [];
    if (uploadingImages.length > 0) {
      setError(`이미지 업로드가 진행 중입니다. 잠시 후 다시 시도해주세요. (${uploadingImages.length}개 업로드 중)`);
      return;
    }

    // blob URL이 있는 이미지가 있는지 확인 (업로드되지 않은 이미지)
    const unuploadedImages = formData.galleryImages?.filter(img => img.url.startsWith('blob:')) || [];
    if (unuploadedImages.length > 0) {
      setError(`일부 이미지가 아직 업로드되지 않았습니다. 잠시 후 다시 시도해주세요. (${unuploadedImages.length}개 미완료)`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // undefined 값들을 제거하여 Firestore 오류 방지
      const updateData: any = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        type: formData.type,
        tool: formData.tool,
        price: formData.price,
        isPublic: formData.isPublic,
        tags: formData.tags,
        updatedAt: new Date()
      };

      // 선택적 필드들은 값이 있을 때만 추가
      if (formData.demoURL && formData.demoURL.trim()) {
        updateData.demoURL = formData.demoURL.trim();
      }
      if (formData.youtubeURL && formData.youtubeURL.trim()) {
        updateData.youtubeURL = formData.youtubeURL.trim();
      }
      if (formData.galleryImages && formData.galleryImages.length > 0) {
        updateData.galleryImages = formData.galleryImages.filter(img => img.url && !img.url.startsWith('blob:'));
      }

      const result = await contentService.updateContent(content.id, updateData);

      if (result.success) {
        const updatedContent = { ...content, ...updateData };
        onContentUpdated(updatedContent);
        onClose();
      } else {
        setError(result.error || '콘텐츠 수정 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setError(error.message || '콘텐츠 수정 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>콘텐츠 편집</DialogTitle>
          <DialogDescription>
            콘텐츠 정보를 수정하세요. 파일은 변경할 수 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 제목 */}
          <div className="space-y-2">
            <Label htmlFor="title">제목 *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="콘텐츠 제목을 입력하세요"
              maxLength={100}
            />
            <p className="text-xs text-muted-foreground">
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
            height={200}
          />

          {/* 콘텐츠 유형 및 AI 도구 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>콘텐츠 유형 *</Label>
              <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
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

            <div className="space-y-2">
              <Label>AI 도구 *</Label>
              <Select value={formData.tool} onValueChange={(value) => handleInputChange('tool', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="도구 선택" />
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
            <Input
              id="price"
              type="number"
              min="0"
              step="100"
              value={formData.price}
              onChange={(e) => handleInputChange('price', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              0원으로 설정하면 무료 콘텐츠가 됩니다.
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
            images={formData.galleryImages}
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
            <div>
              <p className="text-sm text-muted-foreground mb-2">인기 태그</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map(tag => (
                  <Badge
                    key={tag}
                    variant={formData.tags.includes(tag) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-primary/80"
                    onClick={() => handlePopularTagClick(tag)}
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 커스텀 태그 추가 */}
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="새 태그 입력"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim() || formData.tags.includes(newTag.trim()) || formData.tags.length >= 10}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* 선택된 태그 */}
            {formData.tags.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">선택된 태그</p>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      #{tag}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-red-500"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 공개 설정 */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isPublic" className="text-base font-medium">
                    공개 설정
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    {formData.isPublic ? '모든 사용자가 볼 수 있습니다' : '나만 볼 수 있습니다'}
                  </p>
                </div>
                <Switch
                  id="isPublic"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button
            onClick={handleSave}
            disabled={
              loading ||
              isImageUploading ||
              formData.galleryImages?.some(img => img.uploading) ||
              formData.galleryImages?.some(img => img.url.startsWith('blob:'))
            }
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                저장 중...
              </>
            ) : isImageUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                이미지 업로드 중...
              </>
            ) : formData.galleryImages?.some(img => img.uploading) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                이미지 업로드 중...
              </>
            ) : formData.galleryImages?.some(img => img.url.startsWith('blob:')) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                이미지 처리 중...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                저장
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

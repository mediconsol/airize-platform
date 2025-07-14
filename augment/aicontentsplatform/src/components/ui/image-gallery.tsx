'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Plus,
  GripVertical,
  Eye,
  Edit3,
  Trash2,
  Camera,
  FileImage
} from 'lucide-react';
import { storageService } from '@/lib/storage';
import { useAuth } from '@/hooks/useAuth';

interface ImageItem {
  id: string;
  url: string;
  caption: string;
  file?: File;
  uploading?: boolean;
}

interface ImageGalleryProps {
  images: ImageItem[];
  onChange: (images: ImageItem[] | ((prev: ImageItem[]) => ImageItem[])) => void;
  maxImages?: number;
  maxFileSize?: number; // MB
  label?: string;
  required?: boolean;
  onUploadComplete?: () => void;
  onUploadStart?: () => void;
}

export default function ImageGallery({
  images,
  onChange,
  maxImages = 5,
  maxFileSize = 5,
  label = "설명용 이미지",
  required = false,
  onUploadComplete,
  onUploadStart
}: ImageGalleryProps) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingCaption, setEditingCaption] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState('');
  const uploadingCountRef = useRef(0);

  // ref 연결 상태 모니터링
  useEffect(() => {
    console.log('🔍 useEffect - fileInputRef 상태 확인:', {
      current: fileInputRef.current,
      isNull: fileInputRef.current === null,
      isUndefined: fileInputRef.current === undefined
    });

    if (fileInputRef.current) {
      console.log('✅ fileInputRef가 성공적으로 연결됨');
    } else {
      console.error('❌ fileInputRef가 연결되지 않음');
    }
  }, []);

  // 파일 선택 핸들러
  const handleFileSelect = (files: FileList | null) => {
    console.log('🔥 handleFileSelect 호출됨!', {
      files: files ? files.length : 0,
      user: user ? '로그인됨' : '로그인안됨',
      현재이미지수: images.length,
      최대이미지수: maxImages
    });

    if (!files) {
      console.log('❌ files가 null입니다');
      return;
    }

    if (!user) {
      console.log('❌ user가 없습니다');
      return;
    }

    const newImages: ImageItem[] = [];
    const remainingSlots = maxImages - images.length;

    console.log('📊 파일 처리 시작:', {
      선택된파일수: files.length,
      남은슬롯수: remainingSlots,
      처리할파일수: Math.min(files.length, remainingSlots)
    });

    for (let i = 0; i < Math.min(files.length, remainingSlots); i++) {
      const file = files[i];

      console.log(`📁 파일 ${i + 1} 처리 중:`, {
        이름: file.name,
        크기: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
        타입: file.type
      });

      // 파일 크기 검증
      if (file.size > maxFileSize * 1024 * 1024) {
        console.log(`❌ 파일 크기 초과: ${file.name}`);
        alert(`파일 크기는 ${maxFileSize}MB 이하여야 합니다: ${file.name}`);
        continue;
      }

      // 파일 타입 검증
      if (!file.type.startsWith('image/')) {
        console.log(`❌ 이미지 파일 아님: ${file.name}`);
        alert(`이미지 파일만 업로드 가능합니다: ${file.name}`);
        continue;
      }

      const imageId = `temp-${Date.now()}-${i}`;
      const imageUrl = URL.createObjectURL(file);

      console.log(`✅ 이미지 객체 생성:`, {
        id: imageId,
        url: imageUrl.substring(0, 50) + '...',
        파일명: file.name
      });

      newImages.push({
        id: imageId,
        url: imageUrl,
        caption: '',
        file,
        uploading: true
      });
    }

    if (newImages.length > 0) {
      const updatedImages = [...images, ...newImages];
      console.log('🚀 onChange 호출 - 새 이미지 추가:', {
        기존이미지수: images.length,
        새이미지수: newImages.length,
        전체이미지수: updatedImages.length,
        새이미지들: newImages.map(img => ({ id: img.id, uploading: img.uploading, 파일명: img.file?.name }))
      });

      console.log('🔄 onChange 함수 호출 시작...');
      onChange(updatedImages);
      console.log('✅ onChange 함수 호출 완료');

      // 파일 업로드 즉시 시작
      console.log('🚀 파일 선택 완료, 업로드 시작:', newImages.length, '개');
      uploadImages(newImages);
    } else {
      console.log('⚠️ 새로운 이미지가 없습니다. 업로드하지 않음');
    }
  };

  // 이미지 업로드 함수 - Promise 기반으로 완전히 재작성
  const uploadImages = async (imagesToUpload: ImageItem[]) => {
    if (imagesToUpload.length === 0) return;

    console.log('uploadImages 함수 시작:', imagesToUpload.length, '개 이미지');

    // 업로드 시작 알림
    uploadingCountRef.current = imagesToUpload.length;
    console.log('업로드 시작 콜백 호출');
    onUploadStart?.();

    const uploadPromises = imagesToUpload.map(async (image) => {
      if (!image.file || !user) {
        uploadingCountRef.current--;
        return null;
      }

      try {
        console.log(`업로드 시작: ${image.file.name}`);
        const result = await storageService.uploadFile(image.file, `content-images/${user.uid}/${Date.now()}_${image.file.name}`);

        if (result.success && result.downloadURL) {
          console.log(`업로드 성공: ${image.file.name} -> ${result.downloadURL}`);

          // 업로드 완료 후 URL 업데이트
          console.log(`이미지 업로드 완료 - URL 업데이트: ${image.id}`);

          // 함수형 업데이트로 최신 상태 기반 업데이트
          onChange(prevImages => {
            console.log('함수형 업데이트 - 이전 상태:', {
              이전이미지수: prevImages.length,
              이전이미지들: prevImages.map(img => ({ id: img.id, uploading: img.uploading }))
            });

            const updatedImages = prevImages.map(img =>
              img.id === image.id
                ? { ...img, url: result.downloadURL!, uploading: false, file: undefined }
                : img
            );

            console.log('함수형 업데이트 - 업데이트 후 상태:', {
              이미지ID: image.id,
              새URL: result.downloadURL!.substring(0, 50) + '...',
              전체이미지수: updatedImages.length,
              업로딩중인이미지수: updatedImages.filter(img => img.uploading).length,
              업데이트된이미지들: updatedImages.map(img => ({ id: img.id, uploading: img.uploading, hasFile: !!img.file }))
            });

            return updatedImages;
          });

          uploadingCountRef.current--;
          console.log(`업로드 카운터 감소: ${uploadingCountRef.current}`);

          // 모든 업로드가 완료되면 콜백 호출
          if (uploadingCountRef.current === 0) {
            console.log('모든 이미지 업로드 완료 - 완료 콜백 호출');
            onUploadComplete?.();
          }

          return result.downloadURL;
        } else {
          console.error(`업로드 실패: ${image.file.name}`, result);
          // 업로드 실패 시 제거 - 함수형 업데이트
          onChange(prevImages => {
            console.log('업로드 실패 - 이미지 제거:', image.id);
            return prevImages.filter(img => img.id !== image.id);
          });
          alert(`이미지 업로드 실패: ${image.file.name}`);
          uploadingCountRef.current--;
          return null;
        }
      } catch (error) {
        console.error(`업로드 오류: ${image.file.name}`, error);
        // 업로드 오류 시 제거 - 함수형 업데이트
        onChange(prevImages => {
          console.log('업로드 오류 - 이미지 제거:', image.id);
          return prevImages.filter(img => img.id !== image.id);
        });
        alert(`이미지 업로드 중 오류 발생: ${image.file.name}`);
        uploadingCountRef.current--;
        return null;
      }
    });

    // 모든 업로드 완료 대기
    await Promise.allSettled(uploadPromises);
    console.log('모든 업로드 Promise 완료');
  };

  // 이미지 제거
  const removeImage = (imageId: string) => {
    const updatedImages = images.filter(img => img.id !== imageId);
    onChange(updatedImages);
  };

  // 캡션 수정
  const updateCaption = (imageId: string, caption: string) => {
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, caption } : img
    );
    onChange(updatedImages);
  };

  // 드래그 앤 드롭 핸들러
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);
    
    onChange(newImages);
    setDraggedIndex(null);
  };

  // 캡션 편집 시작
  const startEditingCaption = (imageId: string, currentCaption: string) => {
    setEditingCaption(imageId);
    setTempCaption(currentCaption);
  };

  // 캡션 편집 완료
  const finishEditingCaption = () => {
    if (editingCaption) {
      updateCaption(editingCaption, tempCaption);
    }
    setEditingCaption(null);
    setTempCaption('');
  };

  // 캡션 편집 취소
  const cancelEditingCaption = () => {
    setEditingCaption(null);
    setTempCaption('');
  };

  return (
    <div className="space-y-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <div className="flex items-center gap-2">
          {images.some(img => img.uploading) && (
            <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
              업로드 중...
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {images.length} / {maxImages}
          </Badge>
        </div>
      </div>

      {/* 이미지 그리드 */}
      {images.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {images.map((image, index) => (
            <Card 
              key={image.id}
              className="relative group overflow-hidden"
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, index)}
            >
              <CardContent className="p-0">
                {/* 이미지 */}
                <div className="relative aspect-video bg-muted">
                  <img
                    src={image.url}
                    alt={image.caption || `이미지 ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* 업로딩 오버레이 */}
                  {image.uploading && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                      <div className="text-white text-sm">업로드 중...</div>
                    </div>
                  )}

                  {/* 드래그 핸들 */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded p-1 cursor-move">
                      <GripVertical className="w-4 h-4 text-white" />
                    </div>
                  </div>

                  {/* 액션 버튼들 */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70"
                        onClick={() => startEditingCaption(image.id, image.caption)}
                      >
                        <Edit3 className="w-3 h-3 text-white" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-8 w-8 p-0 bg-red-500/80 hover:bg-red-500"
                        onClick={() => removeImage(image.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* 순서 표시 */}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary" className="text-xs">
                      {index + 1}
                    </Badge>
                  </div>
                </div>

                {/* 캡션 */}
                <div className="p-3">
                  {editingCaption === image.id ? (
                    <div className="space-y-2">
                      <Input
                        value={tempCaption}
                        onChange={(e) => setTempCaption(e.target.value)}
                        placeholder="이미지 설명을 입력하세요"
                        className="text-sm"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') finishEditingCaption();
                          if (e.key === 'Escape') cancelEditingCaption();
                        }}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={finishEditingCaption}>
                          저장
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEditingCaption}>
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p 
                      className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
                      onClick={() => startEditingCaption(image.id, image.caption)}
                    >
                      {image.caption || '클릭하여 설명 추가'}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 업로드 영역 */}
      {images.length < maxImages && (
        <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground" />
              </div>
              
              <div>
                <h3 className="font-medium mb-2">이미지 추가</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  콘텐츠 설명에 도움이 되는 이미지를 업로드하세요
                </p>
                
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      console.log('🖱️ 파일 선택 버튼 클릭됨!');
                      console.log('fileInputRef.current:', fileInputRef.current);
                      console.log('fileInputRef.current가 null인가?', fileInputRef.current === null);
                      console.log('fileInputRef.current가 undefined인가?', fileInputRef.current === undefined);

                      if (fileInputRef.current) {
                        console.log('✅ input 요소 발견, click() 호출');
                        fileInputRef.current.click();
                        console.log('✅ input.click() 호출 완료');
                      } else {
                        console.error('❌ fileInputRef.current가 null/undefined입니다!');
                        // 직접 input 요소를 찾아서 클릭 시도
                        const inputElement = document.querySelector('input[type="file"]');
                        console.log('직접 찾은 input 요소:', inputElement);
                        if (inputElement) {
                          console.log('✅ 직접 찾은 input으로 클릭 시도');
                          (inputElement as HTMLInputElement).click();
                        }
                      }
                    }}
                    className="gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    파일 선택
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  JPG, PNG, GIF 파일 • 최대 {maxFileSize}MB • 최대 {maxImages}개
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 숨겨진 파일 입력 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          console.log('📁 input onChange 이벤트 발생!');
          console.log('e.target:', e.target);
          console.log('e.target.files:', e.target.files);
          console.log('files 개수:', e.target.files?.length || 0);
          handleFileSelect(e.target.files);
        }}
      />

      {/* 업로드 상태 및 도움말 */}
      {images.length > 0 && (
        <div className="space-y-2">
          {/* 업로드 상태 표시 */}
          {images.some(img => img.uploading) && (
            <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-200">
              ⏳ <strong>업로드 진행 중:</strong> {images.filter(img => img.uploading).length}개의 이미지가 업로드되고 있습니다.
              업로드가 완료될 때까지 기다려주세요.
            </div>
          )}

          {/* blob URL 경고 */}
          {images.some(img => img.url.startsWith('blob:')) && (
            <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
              ⚠️ <strong>업로드 미완료:</strong> 일부 이미지가 아직 서버에 저장되지 않았습니다.
              잠시 후 다시 시도해주세요.
            </div>
          )}

          {/* 일반 도움말 */}
          {!images.some(img => img.uploading || img.url.startsWith('blob:')) && (
            <div className="text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
              💡 <strong>팁:</strong> 이미지를 드래그하여 순서를 변경할 수 있습니다.
              각 이미지에 설명을 추가하면 사용자가 더 쉽게 이해할 수 있습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

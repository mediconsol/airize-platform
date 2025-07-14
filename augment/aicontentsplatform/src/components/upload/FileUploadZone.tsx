'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { storageService } from '@/lib/storage';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  File, 
  Image, 
  Video, 
  Music, 
  FileText, 
  X,
  CheckCircle,
  AlertCircle,
  ArrowRight
} from 'lucide-react';

interface UploadedFile {
  file: File;
  preview?: string;
  uploadProgress: number;
  uploadStatus: 'pending' | 'uploading' | 'completed' | 'error';
  downloadURL?: string;
  error?: string;
}

interface FileUploadZoneProps {
  onFilesUploaded: (files: { file: File; downloadURL: string }[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  userId: string;
}

export default function FileUploadZone({
  onFilesUploaded,
  maxFiles = 5,
  maxSizeMB = 100,
  acceptedTypes = [
    'image/*',
    'video/*',
    'audio/*',
    'application/pdf',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/*',
    'application/zip'
  ],
  userId
}: FileUploadZoneProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      uploadProgress: 0,
      uploadStatus: 'pending'
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    // 파일 업로드 시작
    for (let i = 0; i < newFiles.length; i++) {
      const fileData = newFiles[i];
      const fileIndex = uploadedFiles.length + i;

      try {
        // 업로드 상태 업데이트
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex 
              ? { ...f, uploadStatus: 'uploading' as const }
              : f
          )
        );

        // 임시 콘텐츠 ID 생성
        const tempContentId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // 파일 업로드
        const result = await storageService.uploadContentFile(
          fileData.file,
          userId,
          tempContentId,
          (progress) => {
            setUploadedFiles(prev => 
              prev.map((f, idx) => 
                idx === fileIndex 
                  ? { ...f, uploadProgress: progress.progress }
                  : f
              )
            );
          }
        );

        if (result.success) {
          setUploadedFiles(prev => 
            prev.map((f, idx) => 
              idx === fileIndex 
                ? { 
                    ...f, 
                    uploadStatus: 'completed' as const,
                    downloadURL: result.downloadURL,
                    uploadProgress: 100
                  }
                : f
            )
          );
        } else {
          throw new Error(result.error);
        }
      } catch (error: any) {
        setUploadedFiles(prev => 
          prev.map((f, idx) => 
            idx === fileIndex 
              ? { 
                  ...f, 
                  uploadStatus: 'error' as const,
                  error: error.message
                }
              : f
          )
        );
      }
    }
  }, [uploadedFiles, userId]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles,
    maxSize: maxSizeMB * 1024 * 1024,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = [];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: uploadedFiles.length >= maxFiles
  });

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    const completedFiles = uploadedFiles
      .filter(f => f.uploadStatus === 'completed' && f.downloadURL)
      .map(f => ({ file: f.file, downloadURL: f.downloadURL! }));
    
    if (completedFiles.length > 0) {
      onFilesUploaded(completedFiles);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return <Image className="w-6 h-6" />;
    if (fileType.startsWith('video/')) return <Video className="w-6 h-6" />;
    if (fileType.startsWith('audio/')) return <Music className="w-6 h-6" />;
    if (fileType.includes('pdf') || fileType.startsWith('text/')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };

  const hasCompletedFiles = uploadedFiles.some(f => f.uploadStatus === 'completed');

  return (
    <div className="space-y-4">
      {/* 드래그 앤 드롭 영역 */}
      <Card className={`border-2 border-dashed transition-colors ${
        isDragActive 
          ? 'border-primary bg-primary/5' 
          : uploadedFiles.length >= maxFiles 
            ? 'border-muted bg-muted/30' 
            : 'border-muted-foreground/25 hover:border-primary/50'
      }`}>
        <CardContent className="p-8">
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg font-medium text-primary">파일을 여기에 놓으세요</p>
            ) : uploadedFiles.length >= maxFiles ? (
              <p className="text-lg font-medium text-muted-foreground">
                최대 {maxFiles}개 파일까지 업로드 가능합니다
              </p>
            ) : (
              <>
                <p className="text-lg font-medium mb-2">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  최대 {maxSizeMB}MB, {maxFiles}개 파일까지 지원
                </p>
                <p className="text-xs text-muted-foreground">
                  지원 형식: 이미지, 비디오, 오디오, PDF, PPT, Excel, 텍스트 파일
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 업로드된 파일 목록 */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-3">
          {uploadedFiles.map((fileData, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {/* 파일 아이콘/미리보기 */}
                  <div className="flex-shrink-0">
                    {fileData.preview ? (
                      <img
                        src={fileData.preview}
                        alt={fileData.file.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center">
                        {getFileIcon(fileData.file.type)}
                      </div>
                    )}
                  </div>

                  {/* 파일 정보 */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{fileData.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(fileData.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    
                    {/* 진행률 */}
                    {fileData.uploadStatus === 'uploading' && (
                      <div className="mt-2">
                        <Progress value={fileData.uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1">
                          {fileData.uploadProgress}% 업로드 중...
                        </p>
                      </div>
                    )}
                    
                    {/* 에러 메시지 */}
                    {fileData.uploadStatus === 'error' && (
                      <p className="text-sm text-red-500 mt-1">
                        {fileData.error}
                      </p>
                    )}
                  </div>

                  {/* 상태 아이콘 */}
                  <div className="flex items-center space-x-2">
                    {fileData.uploadStatus === 'completed' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                    {fileData.uploadStatus === 'error' && (
                      <AlertCircle className="w-5 h-5 text-red-500" />
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 다음 단계 버튼 */}
      {hasCompletedFiles && (
        <div className="text-center pt-4">
          <Button
            onClick={handleNextStep}
            className="gradient-bg"
            size="lg"
          >
            다음 단계로 진행
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { storageService } from '@/lib/storage';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, Camera, User, Mail, FileText, Crown } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!storageService.validateFileType(file, ['image/jpeg', 'image/png', 'image/gif', 'image/webp'])) {
      alert('이미지 파일만 업로드 가능합니다. (JPEG, PNG, GIF, WebP)');
      return;
    }

    // 파일 크기 검증 (5MB)
    if (!storageService.validateFileSize(file, 5)) {
      alert('파일 크기는 5MB 이하여야 합니다.');
      return;
    }

    setImageUploading(true);
    try {
      const result = await storageService.uploadProfileImage(file, user.uid);
      if (result.success) {
        await updateUserProfile({ profileImage: result.downloadURL });
        alert('프로필 이미지가 업데이트되었습니다!');
      } else {
        alert('이미지 업로드 실패: ' + result.error);
      }
    } catch (error) {
      alert('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await updateUserProfile({
        name: formData.name,
        bio: formData.bio,
      });

      if (result.success) {
        alert('프로필이 업데이트되었습니다!');
        onClose();
      } else {
        alert('프로필 업데이트 실패: ' + result.error);
      }
    } catch (error) {
      alert('프로필 업데이트 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCreator = user.roles.includes('creator');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            프로필 관리
          </DialogTitle>
          <DialogDescription className="text-center">
            프로필 정보를 수정하고 관리하세요
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 프로필 이미지 */}
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                onClick={() => fileInputRef.current?.click()}
                disabled={imageUploading}
              >
                {imageUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={isCreator ? "default" : "secondary"}>
                {isCreator ? (
                  <>
                    <Crown className="mr-1 h-3 w-3" />
                    크리에이터
                  </>
                ) : (
                  '일반 사용자'
                )}
              </Badge>
            </div>
          </div>

          {/* 이메일 (읽기 전용) */}
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user.email}
                className="pl-10 bg-muted"
                disabled
              />
            </div>
          </div>

          {/* 이름 */}
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="이름을 입력하세요"
                value={formData.name}
                onChange={handleInputChange}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* 자기소개 */}
          <div className="space-y-2">
            <Label htmlFor="bio">자기소개</Label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="bio"
                name="bio"
                placeholder="자신을 소개해보세요..."
                value={formData.bio}
                onChange={handleInputChange}
                className="pl-10 min-h-[80px] resize-none"
                maxLength={200}
              />
            </div>
            <p className="text-xs text-muted-foreground text-right">
              {formData.bio.length}/200
            </p>
          </div>

          {/* 가입일 정보 */}
          <div className="text-center text-sm text-muted-foreground">
            가입일: {user.createdAt?.toDate?.()?.toLocaleDateString('ko-KR') || '정보 없음'}
          </div>

          {/* 버튼 */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              저장
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

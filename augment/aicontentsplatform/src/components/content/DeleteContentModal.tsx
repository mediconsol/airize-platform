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
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Trash2, 
  Loader2,
  AlertTriangle
} from 'lucide-react';

interface DeleteContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content;
  onContentDeleted: (contentId: string) => void;
}

export default function DeleteContentModal({ 
  isOpen, 
  onClose, 
  content, 
  onContentDeleted 
}: DeleteContentModalProps) {
  const [confirmText, setConfirmText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const expectedText = '삭제';
  const isConfirmed = confirmText === expectedText;

  // 모달 열림/닫힘 시 body 스크롤 제어
  useEffect(() => {
    if (isOpen) {
      // 모달이 열릴 때 body 스크롤 차단
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        // 모달이 닫힐 때 원래 스크롤 상태 복원
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  const handleDelete = async () => {
    if (!isConfirmed) return;

    setLoading(true);
    setError(null);

    try {
      const result = await contentService.deleteContent(content.id);

      if (result.success) {
        onContentDeleted(content.id);
        onClose();
      } else {
        setError(result.error || '콘텐츠 삭제 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setError(error.message || '콘텐츠 삭제 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText('');
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            콘텐츠 삭제
          </DialogTitle>
          <DialogDescription>
            이 작업은 되돌릴 수 없습니다. 정말로 삭제하시겠습니까?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 콘텐츠 정보 */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">{content.title}</h4>
            <p className="text-sm text-muted-foreground">
              조회수: {content.views} | 다운로드: {content.downloads} | 좋아요: {content.likes}
            </p>
            {content.price > 0 && (
              <p className="text-sm text-muted-foreground">
                가격: ₩{content.price.toLocaleString()}
              </p>
            )}
          </div>

          {/* 경고 메시지 */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>주의:</strong> 삭제된 콘텐츠는 복구할 수 없으며, 다음 데이터가 영구적으로 삭제됩니다:
              <ul className="mt-2 ml-4 list-disc text-sm">
                <li>콘텐츠 파일 및 메타데이터</li>
                <li>모든 댓글 및 좋아요</li>
                <li>다운로드 기록 및 통계</li>
                <li>수익 데이터 (환불 불가)</li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* 확인 입력 */}
          <div className="space-y-2">
            <Label htmlFor="confirmText">
              삭제를 확인하려면 <strong>"{expectedText}"</strong>를 입력하세요:
            </Label>
            <Input
              id="confirmText"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={expectedText}
              className={isConfirmed ? 'border-red-500' : ''}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            취소
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete} 
            disabled={!isConfirmed || loading}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                영구 삭제
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

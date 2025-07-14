'use client';

import { useState, useEffect } from 'react';
import { Comment, User } from '@/types/firebase';
import { useAuth } from '@/hooks/useAuth';
import { commentService } from '@/lib/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  MessageCircle, 
  Send, 
  Heart,
  MoreHorizontal,
  Flag,
  Loader2
} from 'lucide-react';

interface CommentWithUser extends Comment {
  authorProfileImage?: string;
}

interface CommentSectionProps {
  contentId: string;
  initialCommentCount?: number;
}

export default function CommentSection({ contentId, initialCommentCount = 0 }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentCount, setCommentCount] = useState(initialCommentCount);

  useEffect(() => {
    loadComments();
  }, [contentId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const result = await commentService.getComments(contentId);
      if (result.success) {
        // 댓글 작성자 정보 추가
        const commentsWithUsers = await Promise.all(
          result.data.map(async (comment) => {
            try {
              const userDoc = await getDoc(doc(db, 'users', comment.authorId));
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                return {
                  ...comment,
                  authorProfileImage: userData.profileImage
                };
              }
              return comment;
            } catch (error) {
              console.error('사용자 정보 로드 오류:', error);
              return comment;
            }
          })
        );
        
        setComments(commentsWithUsers);
        setCommentCount(commentsWithUsers.length);
      }
    } catch (error) {
      console.error('댓글 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (!newComment.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        contentId,
        authorId: user.uid,
        authorName: user.name,
        authorProfileImage: user.profileImage,
        message: newComment.trim()
      };

      const result = await commentService.addComment(commentData);
      if (result.success) {
        // 새 댓글을 목록에 추가
        const newCommentWithUser: CommentWithUser = {
          id: result.id!,
          ...commentData,
          likes: 0,
          createdAt: new Date() as any,
          updatedAt: new Date() as any
        };

        setComments(prev => [newCommentWithUser, ...prev]);
        setCommentCount(prev => prev + 1);
        setNewComment('');
      } else {
        alert('댓글 작성에 실패했습니다: ' + result.error);
      }
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      alert('댓글 작성 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          댓글 ({commentCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 댓글 작성 */}
        {user ? (
          <div className="space-y-3">
            <div className="flex gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Textarea
                  placeholder="댓글을 작성해보세요..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                  maxLength={500}
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground">
                    {newComment.length}/500
                  </span>
                  <Button
                    onClick={handleSubmitComment}
                    disabled={submitting || !newComment.trim()}
                    size="sm"
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    댓글 작성
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-muted/30 rounded-lg">
            <p className="text-muted-foreground mb-2">댓글을 작성하려면 로그인이 필요합니다.</p>
            <Button variant="outline" size="sm">
              로그인하기
            </Button>
          </div>
        )}

        {/* 댓글 목록 */}
        <div className="space-y-4">
          {loading ? (
            // 로딩 스켈레톤
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>아직 댓글이 없습니다.</p>
              <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3 group">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.authorProfileImage} alt={comment.authorName} />
                  <AvatarFallback>
                    {comment.authorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.authorName}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  
                  <p className="text-sm whitespace-pre-wrap">{comment.message}</p>
                  
                  <div className="flex items-center gap-4 pt-1">
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      <Heart className="w-3 h-3 mr-1" />
                      {comment.likes || 0}
                    </Button>
                    
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      답글
                    </Button>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Flag className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>

        {/* 더 보기 버튼 (추후 페이지네이션) */}
        {comments.length > 0 && comments.length >= 10 && (
          <div className="text-center">
            <Button variant="outline" size="sm">
              댓글 더 보기
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import { Content } from '@/types/firebase';
import { useAuth } from '@/hooks/useAuth';
import { likeService } from '@/lib/firestore';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import SearchHighlight from '@/components/ui/SearchHighlight';
import ImageSlider from '@/components/ui/image-slider';
import { 
  Heart, 
  Download, 
  Eye, 
  MessageCircle,
  Star,
  Crown,
  FileText,
  Image as ImageIcon,
  Video,
  Music,
  Code,
  File
} from 'lucide-react';
import Link from 'next/link';

interface ContentCardProps {
  content: Content;
  creatorName?: string;
  creatorImage?: string;
  isCreator?: boolean;
  onLike?: (contentId: string, isLiked: boolean) => void;
  searchQuery?: string;
}

export default function ContentCard({
  content,
  creatorName = '익명 사용자',
  creatorImage,
  isCreator = false,
  onLike,
  searchQuery = ''
}: ContentCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(content.likes);
  const [loading, setLoading] = useState(false);

  const getContentTypeIcon = (type: string, size: 'sm' | 'lg' = 'sm') => {
    const iconSize = size === 'lg' ? 'w-12 h-12' : 'w-4 h-4';
    switch (type) {
      case 'image': return <ImageIcon className={iconSize} />;
      case 'video': return <Video className={iconSize} />;
      case 'music': return <Music className={iconSize} />;
      case 'code': return <Code className={iconSize} />;
      case 'ppt':
      case 'excel':
      case 'document': return <FileText className={iconSize} />;
      default: return <File className={iconSize} />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'ppt': 'PPT',
      'excel': '엑셀',
      'image': '이미지',
      'video': '비디오',
      'music': '음악',
      'code': '코드',
      'document': '문서',
      'other': '기타'
    };
    return typeMap[type] || '기타';
  };

  const getContentTypeTheme = (type: string) => {
    switch (type) {
      case 'ppt':
        return {
          gradient: 'from-orange-500/20 to-red-500/20',
          iconColor: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200'
        };
      case 'excel':
        return {
          gradient: 'from-green-500/20 to-emerald-500/20',
          iconColor: 'text-green-600',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200'
        };
      case 'image':
        return {
          gradient: 'from-purple-500/20 to-pink-500/20',
          iconColor: 'text-purple-600',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200'
        };
      case 'video':
        return {
          gradient: 'from-blue-500/20 to-cyan-500/20',
          iconColor: 'text-blue-600',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200'
        };
      case 'music':
        return {
          gradient: 'from-pink-500/20 to-rose-500/20',
          iconColor: 'text-pink-600',
          bgColor: 'bg-pink-50',
          borderColor: 'border-pink-200'
        };
      case 'code':
        return {
          gradient: 'from-slate-500/20 to-gray-500/20',
          iconColor: 'text-slate-600',
          bgColor: 'bg-slate-50',
          borderColor: 'border-slate-200'
        };
      case 'document':
        return {
          gradient: 'from-indigo-500/20 to-blue-500/20',
          iconColor: 'text-indigo-600',
          bgColor: 'bg-indigo-50',
          borderColor: 'border-indigo-200'
        };
      default:
        return {
          gradient: 'from-gray-500/20 to-slate-500/20',
          iconColor: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200'
        };
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      if (isLiked) {
        const result = await likeService.removeLike(user.uid, content.id);
        if (result.success) {
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
          onLike?.(content.id, false);
        }
      } else {
        const result = await likeService.addLike(user.uid, content.id);
        if (result.success) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
          onLike?.(content.id, true);
        }
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 overflow-hidden p-0 flex flex-col h-full">
      {/* 썸네일 영역 */}
      <Link href={`/content/${content.id}`}>
        <div className="relative aspect-video bg-muted overflow-hidden cursor-pointer rounded-t-lg">
        {content.previewURL ? (
          // 갤러리 이미지가 있으면 슬라이더 사용, 없으면 단일 이미지 표시
          content.galleryURLs && content.galleryURLs.length > 0 ? (
            <ImageSlider
              images={[content.previewURL, ...content.galleryURLs]}
              alt={content.title}
            />
          ) : (
            <img
              src={content.previewURL}
              alt={content.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-t-lg"
            />
          )
        ) : (
          <div className={`w-full h-full flex flex-col items-center justify-center bg-gradient-to-br ${getContentTypeTheme(content.type).gradient} relative overflow-hidden rounded-t-lg`}>
            {/* 배경 패턴 */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-4 left-4 w-8 h-8 border-2 border-current rounded-full" />
              <div className="absolute top-8 right-6 w-4 h-4 border border-current rounded" />
              <div className="absolute bottom-6 left-8 w-6 h-6 border border-current rounded-full" />
              <div className="absolute bottom-4 right-4 w-3 h-3 bg-current rounded" />
            </div>

            {/* 메인 아이콘 */}
            <div className={`${getContentTypeTheme(content.type).iconColor} mb-3 relative z-10`}>
              {getContentTypeIcon(content.type, 'lg')}
            </div>

            {/* 파일 타입 라벨 */}
            <div className={`px-3 py-1 rounded-full ${getContentTypeTheme(content.type).bgColor} ${getContentTypeTheme(content.type).borderColor} border relative z-10`}>
              <span className={`text-sm font-medium ${getContentTypeTheme(content.type).iconColor}`}>
                {getContentTypeLabel(content.type)}
              </span>
            </div>

            {/* 도구 정보 */}
            <div className="mt-2 relative z-10">
              <span className={`text-xs ${getContentTypeTheme(content.type).iconColor} opacity-75`}>
                {content.tool}
              </span>
            </div>
          </div>
        )}

        {/* 오버레이 정보 - 슬라이더가 자체 오버레이를 가지므로 슬라이더가 없을 때만 표시 */}
        {!(content.previewURL && content.galleryURLs && content.galleryURLs.length > 0) && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
        )}

        {/* 가격 배지 */}
        <div className="absolute top-3 right-3 z-10">
          <Badge
            variant={content.price === 0 ? "secondary" : "default"}
            className="bg-white/90 text-black hover:bg-white"
          >
            {formatPrice(content.price)}
          </Badge>
        </div>

        {/* 콘텐츠 타입 배지 */}
        <div className="absolute top-3 left-3 z-10">
          <Badge variant="outline" className="bg-white/90 text-black border-white/50">
            {getContentTypeIcon(content.type)}
            <span className="ml-1">{getContentTypeLabel(content.type)}</span>
          </Badge>
        </div>

        {/* 갤러리 이미지 표시기 */}
        {content.galleryURLs && content.galleryURLs.length > 0 && content.previewURL && (
          <div className="absolute bottom-3 left-3 z-10 bg-black/50 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <rect width="18" height="14" x="3" y="3" rx="2" />
                <path d="M3 7h18" />
              </svg>
              {content.galleryURLs.length + 1} 이미지
            </span>
          </div>
        )}
        </div>
      </Link>

      <CardContent className="p-4 flex-1 flex flex-col">
        {/* 제목 */}
        <Link href={`/content/${content.id}`}>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors cursor-pointer">
            <SearchHighlight text={content.title} searchQuery={searchQuery} />
          </h3>
        </Link>

        {/* AI 요약 또는 설명 */}
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          <SearchHighlight
            text={content.aiSummary || content.description}
            searchQuery={searchQuery}
          />
        </p>

        {/* AI 요약 표시 배지 */}
        {content.aiSummary && (
          <div className="flex items-center gap-1 mb-2">
            <div className="w-1 h-1 bg-primary rounded-full"></div>
            <span className="text-xs text-primary font-medium">AI 요약</span>
          </div>
        )}

        {/* 크리에이터 정보 */}
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="w-6 h-6">
            <AvatarImage src={creatorImage} alt={creatorName} />
            <AvatarFallback className="text-xs">
              {creatorName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-muted-foreground">{creatorName}</span>
          {isCreator && (
            <Crown className="w-4 h-4 text-yellow-500" />
          )}
        </div>

        {/* AI 도구 */}
        <div className="mb-3">
          <Badge variant="outline" className="text-xs">
            <Star className="w-3 h-3 mr-1" />
            {content.tool}
          </Badge>
        </div>

        {/* 태그 - 남은 공간을 차지하되 하단에 정렬 */}
        <div className="flex-1 flex flex-col justify-end">
          {content.tags && content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-0">
              {content.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  #{tag}
                </Badge>
              ))}
              {content.tags.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{content.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-0 m-0">
        <div className="w-full bg-gradient-to-r from-slate-50/80 to-gray-50/80 dark:from-slate-800/50 dark:to-gray-800/50 border-t border-border/50 px-4 py-3 flex items-center justify-between rounded-b-lg backdrop-blur-sm">
          {/* 통계 */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-default">
              <Eye className="w-4 h-4" />
              <span className="font-medium">{formatCount(content.views)}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-default">
              <Download className="w-4 h-4" />
              <span className="font-medium">{formatCount(content.downloads)}</span>
            </div>
            <div className="flex items-center gap-1 hover:text-primary transition-colors cursor-default">
              <MessageCircle className="w-4 h-4" />
              <span className="font-medium">{formatCount(content.comments)}</span>
            </div>
          </div>

          {/* 좋아요 버튼 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLike}
            disabled={loading}
            className={`flex items-center gap-1 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all duration-200 ${
              isLiked ? 'text-red-500 hover:text-red-600' : 'text-muted-foreground hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="font-medium">{formatCount(likeCount)}</span>
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

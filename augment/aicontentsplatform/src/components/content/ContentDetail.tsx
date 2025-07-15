'use client';

import { useState, useEffect } from 'react';
import { Content, User } from '@/types/firebase';
import { useAuth } from '@/hooks/useAuth';
import { contentService, likeService } from '@/lib/firestore';
// 마크다운 렌더링을 위한 간단한 함수
const renderMarkdown = (text: string) => {
  // 기본적인 마크다운 문법을 HTML로 변환
  return text
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="font-semibold">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="italic">$1</em>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-muted pl-4 italic text-muted-foreground">$1</blockquote>')
    .replace(/`([^`]+)`/gim, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    .replace(/\n/gim, '<br>');
};
import { updateDownloadStats } from '@/lib/initFirestore';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  File,
  Share2,
  Flag,
  Calendar,
  DollarSign,
  Loader2,
  CheckCircle,
  Lock,
  Globe,
  Youtube
} from 'lucide-react';

interface ContentDetailProps {
  contentId: string;
}

export default function ContentDetail({ contentId }: ContentDetailProps) {
  const { user } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [creator, setCreator] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [imageLoadingStates, setImageLoadingStates] = useState<Record<string, boolean>>({});
  const [imageErrorStates, setImageErrorStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    loadContentDetail();
  }, [contentId]);

  const loadContentDetail = async () => {
    setLoading(true);
    setError(null);

    try {
      // 콘텐츠 정보 로드
      const contentResult = await contentService.getContent(contentId);
      if (!contentResult.success) {
        throw new Error(contentResult.error);
      }

      const contentData = contentResult.data;
      setContent(contentData);
      setLikeCount(contentData.likes);

      // 조회수 증가
      await contentService.incrementViews(contentId);

      // 크리에이터 정보 로드
      const creatorDoc = await getDoc(doc(db, 'users', contentData.creatorId));
      if (creatorDoc.exists()) {
        setCreator(creatorDoc.data() as User);
      }

      // 좋아요 상태 확인 (로그인한 경우)
      if (user) {
        const likeResult = await likeService.checkLike(user.uid, contentId);
        if (likeResult.success) {
          setIsLiked(likeResult.isLiked);
        }
      }
    } catch (error: any) {
      setError(error.message || '콘텐츠를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'video': return <Video className="w-5 h-5" />;
      case 'music': return <Music className="w-5 h-5" />;
      case 'code': return <Code className="w-5 h-5" />;
      case 'ppt':
      case 'excel':
      case 'document': return <FileText className="w-5 h-5" />;
      default: return <File className="w-5 h-5" />;
    }
  };

  const getContentTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'ppt': 'PPT/프레젠테이션',
      'excel': '엑셀/스프레드시트',
      'image': '이미지/그래픽',
      'video': '비디오/영상',
      'music': '음악/오디오',
      'code': '코드/프로그래밍',
      'document': '문서/텍스트',
      'other': '기타'
    };
    return typeMap[type] || '기타';
  };

  const handleLike = async () => {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }

    try {
      if (isLiked) {
        const result = await likeService.removeLike(user.uid, contentId);
        if (result.success) {
          setIsLiked(false);
          setLikeCount(prev => prev - 1);
        }
      } else {
        const result = await likeService.addLike(user.uid, contentId);
        if (result.success) {
          setIsLiked(true);
          setLikeCount(prev => prev + 1);
        }
      }
    } catch (error) {
      console.error('좋아요 처리 오류:', error);
    }
  };

  const handleDownload = async () => {
    if (!content) return;

    // 유료 콘텐츠인 경우 구매 확인 (추후 결제 시스템과 연동)
    if (content.price > 0 && !user) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (content.price > 0) {
      // TODO: 구매 여부 확인 로직
      alert('결제 시스템이 곧 추가될 예정입니다.');
      return;
    }

    setDownloading(true);
    try {
      // 다운로드 통계 업데이트
      await updateDownloadStats();
      await contentService.updateContent(contentId, {
        downloads: content.downloads + 1
      });

      // 파일 다운로드
      const link = document.createElement('a');
      link.href = content.downloadURL;
      link.download = content.title;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // 로컬 상태 업데이트
      setContent(prev => prev ? { ...prev, downloads: prev.downloads + 1 } : null);
    } catch (error) {
      console.error('다운로드 오류:', error);
      alert('다운로드 중 오류가 발생했습니다.');
    } finally {
      setDownloading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: false }));
    setImageErrorStates(prev => ({ ...prev, [imageId]: true }));
  };

  const handleImageLoadStart = (imageId: string) => {
    setImageLoadingStates(prev => ({ ...prev, [imageId]: true }));
    setImageErrorStates(prev => ({ ...prev, [imageId]: false }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">콘텐츠를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error || '콘텐츠를 찾을 수 없습니다.'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 콘텐츠 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 콘텐츠 정보 */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">
                        {getContentTypeIcon(content.type)}
                        <span className="ml-1">{getContentTypeLabel(content.type)}</span>
                      </Badge>
                      <Badge variant="secondary">
                        <Star className="w-3 h-3 mr-1" />
                        {content.tool}
                      </Badge>
                    </div>
                    <CardTitle className="text-2xl mb-2">{content.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{formatCount(content.views)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="w-4 h-4" />
                        <span>{formatCount(content.downloads)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{formatCount(content.comments)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(content.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm">
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* 마크다운 설명 렌더링 */}
                <div
                  className="mb-4 text-muted-foreground prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: renderMarkdown(content.description)
                  }}
                />

                {/* 태그 */}
                {content.tags && content.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {content.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* 이미지 갤러리 */}
                {content.galleryImages && content.galleryImages.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="font-medium text-sm">관련 이미지</h4>
                    <div className="space-y-4">
                      {content.galleryImages.map((image, index) => (
                        <div key={image.id} className="space-y-3">
                          <div className="relative bg-muted rounded-lg overflow-hidden group">
                            {/* 로딩 상태 */}
                            {imageLoadingStates[image.id] && (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                              </div>
                            )}

                            {/* 오류 상태 */}
                            {imageErrorStates[image.id] ? (
                              <div className="flex items-center justify-center h-48 bg-muted">
                                <div className="text-center text-muted-foreground">
                                  <ImageIcon className="w-8 h-8 mx-auto mb-2" />
                                  <p className="text-sm">이미지를 불러올 수 없습니다</p>
                                </div>
                              </div>
                            ) : (
                              <img
                                src={image.url}
                                alt={image.caption || `이미지 ${index + 1}`}
                                className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-300 cursor-pointer"
                                onClick={() => window.open(image.url, '_blank')}
                                onLoadStart={() => handleImageLoadStart(image.id)}
                                onLoad={() => handleImageLoad(image.id)}
                                onError={() => handleImageError(image.id)}
                                style={{
                                  maxHeight: '600px',
                                  minHeight: '200px'
                                }}
                              />
                            )}

                            <div className="absolute top-3 left-3 opacity-80 group-hover:opacity-100 transition-opacity">
                              <Badge variant="secondary" className="text-xs shadow-sm">
                                {index + 1}
                              </Badge>
                            </div>
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                          </div>
                          {image.caption && (
                            <p className="text-sm text-muted-foreground leading-relaxed px-1">
                              {image.caption}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 관련 링크 */}
                {(content.demoURL || content.youtubeURL) && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">관련 링크</h4>
                    <div className="flex flex-wrap gap-3">
                      {content.demoURL && (
                        <a
                          href={content.demoURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors text-sm"
                        >
                          <Globe className="w-4 h-4" />
                          데모사이트
                        </a>
                      )}
                      {content.youtubeURL && (
                        <a
                          href={content.youtubeURL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm"
                        >
                          <Youtube className="w-4 h-4" />
                          YouTube
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 사이드바 */}
          <div className="space-y-6">
            {/* 가격 및 다운로드 */}
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">
                    {formatPrice(content.price)}
                  </div>
                  {content.price > 0 && (
                    <p className="text-sm text-muted-foreground">
                      일회성 구매
                    </p>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="w-full"
                  size="lg"
                >
                  {downloading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      다운로드 중...
                    </>
                  ) : content.price > 0 ? (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      구매하기
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      무료 다운로드
                    </>
                  )}
                </Button>

                <Button
                  onClick={handleLike}
                  variant="outline"
                  className={`w-full ${
                    isLiked ? 'text-red-500 border-red-500' : ''
                  }`}
                  disabled={!user}
                >
                  <Heart className={`w-4 h-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  좋아요 {formatCount(likeCount)}
                </Button>

                {content.price === 0 && (
                  <div className="flex items-center justify-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    <span>무료 콘텐츠</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* 크리에이터 정보 */}
            {creator && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">크리에이터</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={creator.profileImage} alt={creator.name} />
                      <AvatarFallback>
                        {creator.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{creator.name}</h4>
                        {creator.roles.includes('creator') && (
                          <Crown className="w-4 h-4 text-yellow-500" />
                        )}
                      </div>
                      {creator.bio && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {creator.bio}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full">
                    프로필 보기
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* 콘텐츠 정보 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">상세 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">파일 형식</span>
                  <span className="text-sm font-medium">
                    {getContentTypeLabel(content.type)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">AI 도구</span>
                  <span className="text-sm font-medium">{content.tool}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">업로드일</span>
                  <span className="text-sm font-medium">
                    {formatDate(content.createdAt)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">다운로드</span>
                  <span className="text-sm font-medium">
                    {formatCount(content.downloads)}회
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

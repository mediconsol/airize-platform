'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { contentService } from '@/lib/firestore';
import { Content } from '@/types/firebase';
import ContentCard from './ContentCard';
import EditContentModal from './EditContentModal';
import DeleteContentModal from './DeleteContentModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus,
  FileText,
  Eye,
  Download,
  Heart,
  DollarSign,
  TrendingUp,
  Calendar,
  BarChart3,
  Settings,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface ContentStats {
  totalContents: number;
  totalViews: number;
  totalDownloads: number;
  totalLikes: number;
  totalEarnings: number;
}

export default function MyContentPage() {
  const { user } = useAuth();
  const [contents, setContents] = useState<Content[]>([]);
  const [stats, setStats] = useState<ContentStats>({
    totalContents: 0,
    totalViews: 0,
    totalDownloads: 0,
    totalLikes: 0,
    totalEarnings: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [deletingContent, setDeletingContent] = useState<Content | null>(null);

  useEffect(() => {
    if (user) {
      loadMyContents();
    }
  }, [user]);

  const loadMyContents = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const result = await contentService.getUserContents(user.uid);
      
      if (result.success) {
        setContents(result.data);
        
        // 통계 계산
        const totalStats = result.data.reduce((acc, content) => ({
          totalContents: acc.totalContents + 1,
          totalViews: acc.totalViews + content.views,
          totalDownloads: acc.totalDownloads + content.downloads,
          totalLikes: acc.totalLikes + content.likes,
          totalEarnings: acc.totalEarnings + (content.downloads * content.price)
        }), {
          totalContents: 0,
          totalViews: 0,
          totalDownloads: 0,
          totalLikes: 0,
          totalEarnings: 0
        });

        setStats(totalStats);
      } else {
        setError(result.error || '콘텐츠를 불러오는 중 오류가 발생했습니다.');
      }
    } catch (error: any) {
      setError(error.message || '콘텐츠를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredContents = () => {
    switch (activeTab) {
      case 'public':
        return contents.filter(c => c.isPublic);
      case 'private':
        return contents.filter(c => !c.isPublic);
      case 'free':
        return contents.filter(c => c.price === 0);
      case 'paid':
        return contents.filter(c => c.price > 0);
      default:
        return contents;
    }
  };

  const formatCurrency = (amount: number) => {
    return `₩${amount.toLocaleString()}`;
  };

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handleContentUpdated = (updatedContent: Content) => {
    setContents(prev =>
      prev.map(content =>
        content.id === updatedContent.id ? updatedContent : content
      )
    );

    // 통계 재계산
    const updatedContents = contents.map(content =>
      content.id === updatedContent.id ? updatedContent : content
    );

    const newStats = updatedContents.reduce((acc, content) => ({
      totalContents: acc.totalContents + 1,
      totalViews: acc.totalViews + content.views,
      totalDownloads: acc.totalDownloads + content.downloads,
      totalLikes: acc.totalLikes + content.likes,
      totalEarnings: acc.totalEarnings + (content.downloads * content.price)
    }), {
      totalContents: 0,
      totalViews: 0,
      totalDownloads: 0,
      totalLikes: 0,
      totalEarnings: 0
    });

    setStats(newStats);
    setEditingContent(null);
  };

  const handleContentDeleted = (contentId: string) => {
    setContents(prev => prev.filter(content => content.id !== contentId));

    // 통계 재계산
    const remainingContents = contents.filter(content => content.id !== contentId);

    const newStats = remainingContents.reduce((acc, content) => ({
      totalContents: acc.totalContents + 1,
      totalViews: acc.totalViews + content.views,
      totalDownloads: acc.totalDownloads + content.downloads,
      totalLikes: acc.totalLikes + content.likes,
      totalEarnings: acc.totalEarnings + (content.downloads * content.price)
    }), {
      totalContents: 0,
      totalViews: 0,
      totalDownloads: 0,
      totalLikes: 0,
      totalEarnings: 0
    });

    setStats(newStats);
    setDeletingContent(null);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            로그인이 필요합니다.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">내 콘텐츠</h1>
            <p className="text-muted-foreground">
              업로드한 콘텐츠를 관리하고 성과를 확인하세요
            </p>
          </div>
          <Link href="/upload">
            <Button className="gradient-bg">
              <Plus className="w-4 h-4 mr-2" />
              새 콘텐츠 업로드
            </Button>
          </Link>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 콘텐츠</p>
                  <p className="text-2xl font-bold">{stats.totalContents}</p>
                </div>
                <FileText className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 조회수</p>
                  <p className="text-2xl font-bold">{formatCount(stats.totalViews)}</p>
                </div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 다운로드</p>
                  <p className="text-2xl font-bold">{formatCount(stats.totalDownloads)}</p>
                </div>
                <Download className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 좋아요</p>
                  <p className="text-2xl font-bold">{formatCount(stats.totalLikes)}</p>
                </div>
                <Heart className="w-8 h-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">총 수익</p>
                  <p className="text-2xl font-bold">{formatCurrency(stats.totalEarnings)}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 콘텐츠 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              콘텐츠 관리
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">
                  전체 ({contents.length})
                </TabsTrigger>
                <TabsTrigger value="public">
                  공개 ({contents.filter(c => c.isPublic).length})
                </TabsTrigger>
                <TabsTrigger value="private">
                  비공개 ({contents.filter(c => !c.isPublic).length})
                </TabsTrigger>
                <TabsTrigger value="free">
                  무료 ({contents.filter(c => c.price === 0).length})
                </TabsTrigger>
                <TabsTrigger value="paid">
                  유료 ({contents.filter(c => c.price > 0).length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="space-y-6">
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, index) => (
                      <Card key={index}>
                        <Skeleton className="aspect-video w-full" />
                        <CardContent className="p-4">
                          <Skeleton className="h-6 w-3/4 mb-2" />
                          <Skeleton className="h-4 w-full mb-2" />
                          <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : error ? (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                ) : getFilteredContents().length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      {activeTab === 'all' ? '아직 업로드한 콘텐츠가 없습니다' : '해당하는 콘텐츠가 없습니다'}
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      첫 번째 콘텐츠를 업로드하고 수익을 창출해보세요!
                    </p>
                    <Link href="/upload">
                      <Button className="gradient-bg">
                        <Plus className="w-4 h-4 mr-2" />
                        콘텐츠 업로드하기
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {getFilteredContents().map((content) => (
                      <div key={content.id} className="relative group">
                        <ContentCard
                          content={content}
                          creatorName={user.name}
                          creatorImage={user.profileImage}
                          isCreator={true}
                        />
                        
                        {/* 관리 버튼 오버레이 */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-8 w-8 p-0"
                              onClick={() => setEditingContent(content)}
                              title="편집"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-8 w-8 p-0"
                              onClick={() => setDeletingContent(content)}
                              title="삭제"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* 상태 배지 */}
                        <div className="absolute top-2 left-2">
                          {!content.isPublic && (
                            <Badge variant="secondary">비공개</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* 편집 모달 */}
        {editingContent && (
          <EditContentModal
            isOpen={!!editingContent}
            onClose={() => setEditingContent(null)}
            content={editingContent}
            onContentUpdated={handleContentUpdated}
          />
        )}

        {/* 삭제 확인 모달 */}
        {deletingContent && (
          <DeleteContentModal
            isOpen={!!deletingContent}
            onClose={() => setDeletingContent(null)}
            content={deletingContent}
            onContentDeleted={handleContentDeleted}
          />
        )}
      </div>
    </div>
  );
}

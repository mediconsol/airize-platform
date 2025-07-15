'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  TrendingUp,
  Users,
  FileText,
  Eye,
  Download,
  Heart,
  Calendar,
  Star,
  Zap,
  Crown,
  Flame
} from 'lucide-react';
import { statsService } from '@/lib/firestore';

interface PlatformStats {
  overview: {
    totalContents: number;
    totalViews: number;
    totalDownloads: number;
    totalLikes: number;
    recentUploads: number;
  };
  categories: Record<string, number>;
  tools: Record<string, number>;
  priceDistribution: Record<string, number>;
  popularContents: Array<{
    id: string;
    title: string;
    type: string;
    popularity: number;
    views: number;
    downloads: number;
    likes: number;
  }>;
  trends: {
    dailyUploads: Array<{ date: string; uploads: number }>;
    growthRate: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  image: <Star className="w-4 h-4" />,
  ppt: <Zap className="w-4 h-4" />,
  music: <Crown className="w-4 h-4" />,
  code: <Flame className="w-4 h-4" />,
  video: <Star className="w-4 h-4" />,
  document: <Zap className="w-4 h-4" />
};

const CATEGORY_NAMES: Record<string, string> = {
  image: 'AI 이미지',
  ppt: 'PPT 템플릿',
  music: 'AI 음악',
  code: '코드 스니펫',
  video: 'AI 비디오',
  document: '문서 템플릿'
};

export function PlatformStatsPage() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        console.log('📈 플랫폼 통계 로딩 시작');
        
        const result = await statsService.getPlatformStats();
        if (result.success) {
          setStats(result.data);
          console.log('📈 플랫폼 통계 로딩 완료:', result.data);
        } else {
          setError(result.error || '통계 데이터를 불러올 수 없습니다.');
        }
      } catch (err) {
        console.error('❌ 플랫폼 통계 로딩 오류:', err);
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">플랫폼 통계</h1>
          <p className="text-muted-foreground">AIrize 플랫폼의 전체 현황을 확인하세요</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="animate-pulse">
                  <div className="h-6 bg-muted rounded w-1/3"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="animate-pulse">
                  <div className="h-64 bg-muted rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">오류 발생</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">데이터 없음</h1>
          <p className="text-muted-foreground">표시할 통계 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  // 차트 데이터 준비
  const categoryChartData = Object.entries(stats.categories).map(([key, value]) => ({
    name: CATEGORY_NAMES[key] || key,
    value,
    icon: CATEGORY_ICONS[key]
  }));

  const toolChartData = Object.entries(stats.tools).map(([key, value]) => ({
    name: key,
    value
  }));

  const priceChartData = Object.entries(stats.priceDistribution).map(([key, value]) => ({
    name: key === 'free' ? '무료' : 
          key === '1-5000' ? '1-5천원' :
          key === '5001-20000' ? '5천-2만원' :
          key === '20001-50000' ? '2만-5만원' : '5만원+',
    value
  }));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">플랫폼 통계</h1>
        <p className="text-muted-foreground">AIrize 플랫폼의 전체 현황을 확인하세요</p>
      </div>

      {/* 주요 지표 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 콘텐츠</p>
                <p className="text-2xl font-bold">{stats.overview.totalContents.toLocaleString()}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 조회수</p>
                <p className="text-2xl font-bold">{stats.overview.totalViews.toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 다운로드</p>
                <p className="text-2xl font-bold">{stats.overview.totalDownloads.toLocaleString()}</p>
              </div>
              <Download className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">총 좋아요</p>
                <p className="text-2xl font-bold">{stats.overview.totalLikes.toLocaleString()}</p>
              </div>
              <Heart className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">최근 7일 업로드</p>
                <p className="text-2xl font-bold">{stats.overview.recentUploads}</p>
                <Badge variant="secondary" className="mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +{stats.trends.growthRate}%
                </Badge>
              </div>
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 차트 섹션 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* 카테고리별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5" />
              카테고리별 콘텐츠 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`category-cell-${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* AI 도구별 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              AI 도구별 사용 현황
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={toolChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 가격 분포 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="w-5 h-5" />
              가격대별 콘텐츠 분포
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* 일별 업로드 트렌드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              최근 7일 업로드 트렌드
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.trends.dailyUploads}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => new Date(value).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => new Date(value).toLocaleDateString('ko-KR')}
                />
                <Line type="monotone" dataKey="uploads" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 인기 콘텐츠 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Flame className="w-5 h-5" />
            인기 콘텐츠 TOP 5
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.popularContents.map((content, index) => (
              <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold">{content.title}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      {CATEGORY_ICONS[content.type]}
                      <span className="text-sm text-muted-foreground">
                        {CATEGORY_NAMES[content.type] || content.type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {content.views.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    {content.downloads.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <Heart className="w-4 h-4" />
                    {content.likes.toLocaleString()}
                  </div>
                  <Badge variant="secondary">
                    인기도 {content.popularity}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

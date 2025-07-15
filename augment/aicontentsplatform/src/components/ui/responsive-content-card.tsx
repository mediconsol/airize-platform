'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useResponsive } from '@/hooks/useResponsive';
import {
  Eye,
  MessageCircle,
  Heart,
  Download,
  Share2,
  MoreVertical,
  Sparkles,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ResponsiveContentCardProps {
  id: string;
  title: string;
  description: string;
  summary?: string;
  imageUrl?: string;
  type: string;
  tool: string;
  tags: string[];
  author: {
    name: string;
    profileImage?: string;
  };
  stats: {
    views: number;
    comments: number;
    likes: number;
    downloads: number;
  };
  createdAt: Date;
  price?: number;
}

export function ResponsiveContentCard({
  id,
  title,
  description,
  summary,
  imageUrl,
  type,
  tool,
  tags,
  author,
  stats,
  createdAt,
  price,
}: ResponsiveContentCardProps) {
  const { isMobile, isTablet } = useResponsive();
  const [imageError, setImageError] = useState(false);

  // 모바일 카드 레이아웃
  if (isMobile) {
    return (
      <Card className="overflow-hidden">
        <Link href={`/content/${id}`}>
          <div className="relative">
            {imageUrl && !imageError ? (
              <div className="relative h-48 w-full">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="h-48 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Sparkles className="h-12 w-12 text-primary/30" />
              </div>
            )}
            
            {/* 가격 배지 */}
            {price && (
              <Badge className="absolute top-2 right-2 bg-green-500">
                ₩{price.toLocaleString()}
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <Link href={`/content/${id}`}>
                <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary transition-colors">
                  {title}
                </h3>
              </Link>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {type}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tool}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Share2 className="mr-2 h-4 w-4" />
                  공유하기
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Heart className="mr-2 h-4 w-4" />
                  좋아요
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* AI 요약 또는 설명 */}
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {summary || description}
          </p>

          {/* 작성자 정보 */}
          <div className="flex items-center space-x-2 mb-3">
            {author.profileImage ? (
              <Image
                src={author.profileImage}
                alt={author.name}
                width={20}
                height={20}
                className="rounded-full"
              />
            ) : (
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {author.name.charAt(0)}
                </span>
              </div>
            )}
            <span className="text-xs text-muted-foreground">{author.name}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">
              {createdAt.toLocaleDateString('ko-KR')}
            </span>
          </div>
        </CardContent>

        <CardFooter className="px-4 py-3 bg-muted/30 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Eye className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stats.views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Heart className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stats.likes}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Download className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{stats.downloads}</span>
            </div>
          </div>
          
          <Button size="sm" variant="outline" className="h-7 text-xs">
            <Download className="mr-1 h-3 w-3" />
            다운로드
          </Button>
        </CardFooter>
      </Card>
    );
  }

  // 태블릿 카드 레이아웃
  if (isTablet) {
    return (
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="flex">
          <Link href={`/content/${id}`} className="flex-shrink-0">
            {imageUrl && !imageError ? (
              <div className="relative w-32 h-32">
                <Image
                  src={imageUrl}
                  alt={title}
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
            ) : (
              <div className="w-32 h-32 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-primary/30" />
              </div>
            )}
          </Link>

          <div className="flex-1 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <Link href={`/content/${id}`}>
                  <h3 className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors">
                    {title}
                  </h3>
                </Link>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                  {price && (
                    <Badge className="bg-green-500 text-xs">
                      ₩{price.toLocaleString()}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {summary || description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {author.profileImage ? (
                  <Image
                    src={author.profileImage}
                    alt={author.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium text-primary">
                      {author.name.charAt(0)}
                    </span>
                  </div>
                )}
                <span className="text-sm text-muted-foreground">{author.name}</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stats.views}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{stats.likes}</span>
                </div>
                <Button size="sm" variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  다운로드
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // 데스크톱 카드 레이아웃 (기존 유지)
  return null;
}

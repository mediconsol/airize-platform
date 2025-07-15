'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Shield, Users } from "lucide-react";
import Link from "next/link";
import FirebaseTest from "@/components/FirebaseTest";
import ContentCard from "@/components/content/ContentCard";
import { contentService } from "@/lib/firestore";
import { Content, User } from "@/types/firebase";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// 타입별 기본 이미지 반환 함수
const getDefaultImageByType = (type: string) => {
  const typeImages = {
    'ppt': 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=600&fit=crop',
    'excel': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
    'image': 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&h=600&fit=crop',
    'video': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop',
    'music': 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
    'code': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop',
    'document': 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=600&fit=crop',
    'other': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop'
  };
  return typeImages[type as keyof typeof typeImages] || typeImages.other;
};

interface ContentWithCreator extends Content {
  creatorName?: string;
  creatorImage?: string;
  isCreator?: boolean;
}

export default function Home() {
  const [latestContents, setLatestContents] = useState<ContentWithCreator[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);

  // 최신 콘텐츠 로드
  useEffect(() => {
    const loadLatestContents = async () => {
      try {
        const result = await contentService.getLatestContents(8);
        if (result.success) {
          // 크리에이터 정보 추가
          const contentsWithCreators = await Promise.all(
            result.data.map(async (content) => {
              try {
                const userDoc = await getDoc(doc(db, 'users', content.creatorId));
                if (userDoc.exists()) {
                  const userData = userDoc.data() as User;
                  return {
                    ...content,
                    creatorName: userData.name,
                    creatorImage: userData.profileImage,
                    isCreator: userData.roles.includes('creator')
                  };
                }
                return content;
              } catch (error) {
                return content;
              }
            })
          );

          // 중복 제거 및 테스트용 갤러리 데이터 추가
          const uniqueContents = contentsWithCreators
            .filter((content, index, self) => {
              // ID가 유효하고 중복되지 않는 콘텐츠만 필터링
              return content.id && index === self.findIndex(c => c.id === content.id);
            })
            .map((content, index) => {
              // 실제 콘텐츠의 갤러리 이미지 사용
              const baseContent = {
                ...content,
                // previewURL이 없으면 타입별 기본 이미지 사용
                previewURL: content.previewURL || getDefaultImageByType(content.type)
              };

              // 실제 갤러리 이미지가 있는 경우 사용
              if (content.galleryImages && content.galleryImages.length > 0) {
                // galleryImages에서 URL만 추출하여 galleryURLs로 변환
                const galleryURLs = content.galleryImages
                  .filter(img => img.url && !img.url.startsWith('blob:')) // 유효한 URL만 필터링
                  .map(img => img.url);

                if (galleryURLs.length > 0) {
                  return {
                    ...baseContent,
                    galleryURLs: galleryURLs
                  };
                }
              }

              // 기존 galleryURLs가 있는 경우 그대로 사용
              if (content.galleryURLs && content.galleryURLs.length > 0) {
                return {
                  ...baseContent,
                  galleryURLs: content.galleryURLs
                };
              }

              // 갤러리 이미지가 없는 경우 기본 콘텐츠 반환
              return baseContent;
            });

          // 갤러리 데이터 디버깅
          console.log('🖼️ 실제 갤러리 데이터 확인:', contentsWithGallery.map(c => ({
            id: c.id,
            title: c.title,
            type: c.type,
            hasPreview: !!c.previewURL,
            hasGalleryImages: !!(c.galleryImages && c.galleryImages.length > 0),
            galleryImagesCount: c.galleryImages?.length || 0,
            hasGalleryURLs: !!(c.galleryURLs && c.galleryURLs.length > 0),
            galleryURLsCount: c.galleryURLs?.length || 0,
            galleryURLs: c.galleryURLs
          })));

          setLatestContents(contentsWithGallery);
        }
      } catch (error) {
        console.error('최신 콘텐츠 로드 오류:', error);
      } finally {
        setLoadingContents(false);
      }
    };

    loadLatestContents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">

      {/* Hero Section - Premium Design */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl opacity-30" />

        <div className="container mx-auto text-center relative z-10">
          <div className="animate-fade-in">
            {/* Premium Badge */}
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary mb-8 backdrop-blur-sm">
              <Sparkles className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm tracking-wide">PREMIUM AI CONTENT MARKETPLACE</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[0.9] tracking-tight">
              <span className="block text-foreground">AI 콘텐츠의</span>
              <span className="block gradient-text">새로운 차원</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              전문가급 AI 콘텐츠를 창작하고, 글로벌 마켓플레이스에서 수익화하세요.
              <br className="hidden md:block" />
              <span className="text-primary font-medium">차세대 크리에이터</span>를 위한 프리미엄 플랫폼입니다.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link href="/upload">
                <Button size="lg" className="gradient-bg text-lg px-10 py-7 rounded-full shadow-2xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105">
                  <span className="font-semibold">창작 시작하기</span>
                  <ArrowRight className="ml-3 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="text-lg px-10 py-7 rounded-full border-2 hover:bg-primary/5 transition-all duration-300">
                  <span className="font-medium">프리미엄 콘텐츠 탐색</span>
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>10,000+ 활성 크리에이터</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>50,000+ 프리미엄 콘텐츠</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                <span>99.9% 업타임 보장</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Design */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              PREMIUM FEATURES
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-foreground">차별화된</span>
              <br />
              <span className="gradient-text">프리미엄 경험</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              전문가급 도구와 엔터프라이즈 수준의 인프라로
              <br className="hidden md:block" />
              <span className="text-primary font-medium">차세대 AI 콘텐츠 창작</span>을 경험하세요.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group premium-card animate-slide-up hover:scale-105 transition-all duration-500 border-0 shadow-xl">
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold mb-3">Lightning Fast</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  최첨단 CDN과 AI 최적화 엔진으로
                  <span className="text-primary font-medium">초고속 업로드</span>와
                  실시간 처리를 제공합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group premium-card animate-slide-up hover:scale-105 transition-all duration-500 border-0 shadow-xl" style={{ animationDelay: '0.1s' }}>
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold mb-3">Enterprise Security</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  <span className="text-primary font-medium">군사급 암호화</span>와
                  블록체인 검증으로 당신의 지적재산을
                  완벽하게 보호합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group premium-card animate-slide-up hover:scale-105 transition-all duration-500 border-0 shadow-xl" style={{ animationDelay: '0.2s' }}>
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold mb-3">Global Network</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  전 세계 <span className="text-primary font-medium">50개국 크리에이터</span>들과
                  연결하고 글로벌 마켓에서
                  수익을 창출하세요.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="group premium-card animate-slide-up hover:scale-105 transition-all duration-500 border-0 shadow-xl" style={{ animationDelay: '0.3s' }}>
              <CardHeader className="pb-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold mb-3">Smart Monetization</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  AI 기반 <span className="text-primary font-medium">수익 최적화</span> 알고리즘으로
                  콘텐츠 가치를 극대화하고
                  안정적인 수입을 보장합니다.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 최신 콘텐츠 섹션 - Premium Design */}
      <section className="relative py-24 px-4 bg-gradient-to-b from-muted/20 to-background">
        <div className="container mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-blue-500/10 to-primary/10 border border-blue-500/20 text-blue-600 mb-6">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3" />
              <span className="font-medium text-sm tracking-wide">LATEST CONTENT</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              <span className="text-foreground">최신</span>
              <br />
              <span className="bg-gradient-to-r from-blue-500 to-primary bg-clip-text text-transparent">AI 콘텐츠</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              방금 업로드된 따끈따끈한
              <br className="hidden md:block" />
              <span className="text-primary font-medium">최신 AI 콘텐츠</span>를 가장 먼저 만나보세요
            </p>
          </div>

          {loadingContents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-muted rounded mb-2" />
                    <div className="h-3 bg-muted rounded w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : latestContents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {latestContents
                .filter(content => content && content.id) // 유효한 콘텐츠만 렌더링
                .map((content, index) => (
                  <ContentCard
                    key={`content-${content.id}-${index}`} // 더 고유한 키 생성
                    content={content}
                    creatorName={content.creatorName}
                    creatorImage={content.creatorImage}
                    isCreator={content.isCreator}
                  />
                ))
              }
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">아직 콘텐츠가 없습니다.</p>
              <Link href="/upload">
                <Button>첫 번째 콘텐츠 업로드하기</Button>
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link href="/explore">
              <Button size="lg" variant="outline">
                모든 콘텐츠 보기
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>



      {/* CTA Section - Premium Design */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-primary/15 rounded-full blur-3xl opacity-40" />

        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 text-primary mb-8">
              <Sparkles className="w-5 h-5 mr-3" />
              <span className="font-medium text-sm tracking-wide">JOIN THE REVOLUTION</span>
            </div>

            <h2 className="text-5xl md:text-7xl font-bold mb-8 tracking-tight leading-[0.9]">
              <span className="text-foreground">당신의 AI 여정,</span>
              <br />
              <span className="gradient-text">지금 시작하세요</span>
            </h2>

            <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              이미 <span className="text-primary font-semibold">10,000명 이상의 크리에이터</span>가
              AIrize에서 AI 콘텐츠로 수익을 창출하고 있습니다.
              <br className="hidden md:block" />
              <span className="text-foreground font-medium">당신도 그 일원이 되어보세요.</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-12">
              <Link href="/upload">
                <Button size="lg" className="gradient-bg text-lg px-12 py-8 rounded-full shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105">
                  <span className="font-bold">무료로 시작하기</span>
                  <ArrowRight className="ml-3 w-6 h-6" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-12 py-8 rounded-full border-2 hover:bg-primary/5 transition-all duration-300">
                  <span className="font-semibold">프리미엄 플랜 보기</span>
                </Button>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/70 rounded-full border-2 border-background" />
                  <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-400 rounded-full border-2 border-background" />
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-400 rounded-full border-2 border-background" />
                  <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-400 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white">
                    +
                  </div>
                </div>
                <span className="font-medium">10,000+ 활성 크리에이터</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                <span className="font-medium">4.9/5 평점 (2,500+ 리뷰)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
    </div>
  );
}

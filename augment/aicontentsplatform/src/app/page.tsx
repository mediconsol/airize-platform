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

interface ContentWithCreator extends Content {
  creatorName?: string;
  creatorImage?: string;
  isCreator?: boolean;
}

export default function Home() {
  const [popularContents, setPopularContents] = useState<ContentWithCreator[]>([]);
  const [loadingContents, setLoadingContents] = useState(true);

  // 인기 콘텐츠 로드
  useEffect(() => {
    const loadPopularContents = async () => {
      try {
        const result = await contentService.getPopularContents(8);
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
          setPopularContents(contentsWithCreators);
        }
      } catch (error) {
        console.error('인기 콘텐츠 로드 오류:', error);
      } finally {
        setLoadingContents(false);
      }
    };

    loadPopularContents();
  }, []);

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20">

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
              <Sparkles className="w-4 h-4 mr-2" />
              AI 기반 콘텐츠 마켓플레이스
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              AI 콘텐츠를 만들고
              <br />
              <span className="gradient-text">공유하고 수익화하세요</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              AI로 생성된 콘텐츠를 위한 프리미엄 마켓플레이스입니다.
              당신의 창작물을 업로드하고, 놀라운 작품들을 발견하며, AI 크리에이터 커뮤니티와 연결하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="gradient-bg text-lg px-8 py-6">
                  창작 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/explore">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  콘텐츠 둘러보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">왜 AIrize를 선택해야 할까요?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              크리에이터를 위해, 크리에이터가 만든 플랫폼. 콘텐츠 창작의 미래를 경험하세요.
            </p>
          </div>
          <div className="content-grid">
            <Card className="premium-card animate-slide-up">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>빠른 속도</CardTitle>
                <CardDescription>
                  최적화된 플랫폼으로 AI 콘텐츠를 몇 초 만에 업로드하고 공유하세요.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="premium-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>안전한 보호</CardTitle>
                <CardDescription>
                  엔터프라이즈급 보안과 블록체인 검증으로 당신의 콘텐츠를 안전하게 보호합니다.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="premium-card animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>글로벌 커뮤니티</CardTitle>
                <CardDescription>
                  전 세계 수천 명의 AI 크리에이터들과 연결하고 트렌딩 콘텐츠를 발견하세요.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="premium-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>유연한 요금제</CardTitle>
                <CardDescription>
                  무료부터 엔터프라이즈까지, 성장 단계에 맞는 최적의 플랜을 선택하세요.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* 인기 콘텐츠 섹션 */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🔥 인기 콘텐츠</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              지금 가장 인기 있는 AI 콘텐츠를 확인해보세요
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
          ) : popularContents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {popularContents.map((content) => (
                <ContentCard
                  key={content.id}
                  content={content}
                  creatorName={content.creatorName}
                  creatorImage={content.creatorImage}
                  isCreator={content.isCreator}
                />
              ))}
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

      {/* Firebase Test Section - 개발용 */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">🔥 Firebase 연결 테스트</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              개발 중인 Firebase 연결 상태를 확인해보세요.
            </p>
          </div>
          <FirebaseTest />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold mb-6">AI 여정을 시작할 준비가 되셨나요?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              이미 AIrize에서 AI 콘텐츠로 수익을 창출하고 있는 수천 명의 크리에이터들과 함께하세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/upload">
                <Button size="lg" className="gradient-bg text-lg px-8 py-6">
                  지금 AIrize 시작하기
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                  요금제 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
    </div>
  );
}

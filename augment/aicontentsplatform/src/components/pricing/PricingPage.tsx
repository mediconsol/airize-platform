'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Check, 
  X, 
  Star, 
  Crown, 
  Zap,
  Users,
  TrendingUp,
  Shield,
  Headphones,
  BarChart3,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

const PLANS = {
  free: {
    name: '무료',
    price: { monthly: 0, yearly: 0 },
    description: '개인 사용자를 위한 기본 플랜',
    icon: <Users className="w-6 h-6" />,
    color: 'border-gray-200',
    buttonVariant: 'outline' as const,
    features: [
      { name: '월 3개 콘텐츠 업로드', included: true },
      { name: '무료 콘텐츠 무제한 다운로드', included: true },
      { name: '기본 검색 및 필터링', included: true },
      { name: '커뮤니티 참여 (댓글, 좋아요)', included: true },
      { name: '기본 프로필 관리', included: true },
      { name: '유료 콘텐츠 판매', included: false },
      { name: '고급 분석 도구', included: false },
      { name: '우선 지원', included: false },
      { name: '커스텀 브랜딩', included: false }
    ]
  },
  creator: {
    name: '크리에이터',
    price: { monthly: 9900, yearly: 99000 },
    description: '콘텐츠 크리에이터를 위한 전문 플랜',
    icon: <Star className="w-6 h-6" />,
    color: 'border-blue-500',
    buttonVariant: 'default' as const,
    popular: true,
    features: [
      { name: '월 50개 콘텐츠 업로드', included: true },
      { name: '무제한 다운로드', included: true },
      { name: '고급 검색 및 AI 추천', included: true },
      { name: '커뮤니티 모든 기능', included: true },
      { name: '고급 프로필 및 포트폴리오', included: true },
      { name: '유료 콘텐츠 판매 (수수료 15%)', included: true },
      { name: '상세 분석 및 통계', included: true },
      { name: '이메일 지원', included: true },
      { name: '크리에이터 배지', included: true }
    ]
  },
  pro: {
    name: '프로',
    price: { monthly: 29900, yearly: 299000 },
    description: '전문 크리에이터 및 팀을 위한 고급 플랜',
    icon: <Crown className="w-6 h-6" />,
    color: 'border-purple-500',
    buttonVariant: 'default' as const,
    features: [
      { name: '무제한 콘텐츠 업로드', included: true },
      { name: '무제한 다운로드', included: true },
      { name: 'AI 기반 개인화 추천', included: true },
      { name: '커뮤니티 모든 기능 + 우선 노출', included: true },
      { name: '커스텀 프로필 및 브랜딩', included: true },
      { name: '유료 콘텐츠 판매 (수수료 10%)', included: true },
      { name: '고급 분석 및 AI 인사이트', included: true },
      { name: '우선 지원 (24시간 이내)', included: true },
      { name: '팀 협업 도구 (최대 5명)', included: true }
    ]
  },
  enterprise: {
    name: '엔터프라이즈',
    price: { monthly: 99900, yearly: 999000 },
    description: '대규모 조직을 위한 맞춤형 솔루션',
    icon: <Zap className="w-6 h-6" />,
    color: 'border-orange-500',
    buttonVariant: 'default' as const,
    features: [
      { name: '무제한 모든 기능', included: true },
      { name: '전용 계정 관리자', included: true },
      { name: 'API 접근 및 커스텀 통합', included: true },
      { name: '화이트라벨 솔루션', included: true },
      { name: '고급 보안 및 컴플라이언스', included: true },
      { name: '유료 콘텐츠 판매 (수수료 5%)', included: true },
      { name: '실시간 분석 대시보드', included: true },
      { name: '24/7 전화 지원', included: true },
      { name: '무제한 팀 멤버', included: true }
    ]
  }
};

export default function PricingPage() {
  const { user } = useAuth();
  const [isYearly, setIsYearly] = useState(false);

  const handleUpgradeClick = () => {
    alert('준비중입니다.');
  };

  const formatPrice = (price: number) => {
    if (price === 0) return '무료';
    return `₩${price.toLocaleString()}`;
  };

  const getDiscountedPrice = (plan: typeof PLANS.creator) => {
    const price = isYearly ? plan.price.yearly : plan.price.monthly;
    if (isYearly && price > 0) {
      const monthlyEquivalent = price / 12;
      const savings = (plan.price.monthly * 12) - price;
      return {
        price: monthlyEquivalent,
        savings,
        originalMonthly: plan.price.monthly
      };
    }
    return { price, savings: 0, originalMonthly: plan.price.monthly };
  };

  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
      <div className="container mx-auto px-4 py-16">
        {/* 헤더 */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold">요금제</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            AI 콘텐츠 크리에이터의 성장 단계에 맞는 최적의 플랜을 선택하세요. 
          </p>

          {/* 연간/월간 토글 */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <Label htmlFor="billing-toggle" className={!isYearly ? 'font-semibold' : ''}>
              월간 결제
            </Label>
            <Switch
              id="billing-toggle"
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <Label htmlFor="billing-toggle" className={isYearly ? 'font-semibold' : ''}>
              연간 결제
            </Label>
            {isYearly && (
              <Badge variant="secondary" className="ml-2">
                최대 17% 할인
              </Badge>
            )}
          </div>
        </div>

        {/* 요금제 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {Object.entries(PLANS).map(([key, plan]) => {
            const pricing = getDiscountedPrice(plan);
            
            return (
              <Card 
                key={key} 
                className={`relative ${plan.color} ${plan.popular ? 'ring-2 ring-primary' : ''} hover:shadow-lg transition-all duration-300`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-1">
                      가장 인기
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex items-center justify-center mb-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      {plan.icon}
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  
                  <div className="mt-4">
                    <div className="text-4xl font-bold">
                      {formatPrice(Math.round(pricing.price))}
                    </div>
                    {pricing.price > 0 && (
                      <div className="text-sm text-muted-foreground">
                        {isYearly ? '월' : '월'}
                        {isYearly && pricing.savings > 0 && (
                          <div className="text-green-600 font-medium">
                            연간 ₩{pricing.savings.toLocaleString()} 절약
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* 기능 목록 */}
                  <div className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <div key={index} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <span className={`text-sm ${
                          feature.included ? '' : 'text-muted-foreground line-through'
                        }`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 버튼 */}
                  <div className="pt-4">
                    {key === 'free' ? (
                      user ? (
                        <Button variant={plan.buttonVariant} className="w-full" disabled>
                          현재 플랜
                        </Button>
                      ) : (
                        <Link href="/signup">
                          <Button variant={plan.buttonVariant} className="w-full">
                            무료로 시작하기
                          </Button>
                        </Link>
                      )
                    ) : key === 'enterprise' ? (
                      <Button variant={plan.buttonVariant} className="w-full" onClick={handleUpgradeClick}>
                        문의하기
                      </Button>
                    ) : (
                      <Button variant={plan.buttonVariant} className="w-full" onClick={handleUpgradeClick}>
                        {user ? '업그레이드' : '시작하기'}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* 상세 기능 비교 테이블 */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">상세 기능 비교</h2>
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-semibold">기능</th>
                    <th className="text-center p-4 font-semibold">무료</th>
                    <th className="text-center p-4 font-semibold">크리에이터</th>
                    <th className="text-center p-4 font-semibold">프로</th>
                    <th className="text-center p-4 font-semibold">엔터프라이즈</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t">
                    <td className="p-4 font-medium">월 업로드 한도</td>
                    <td className="text-center p-4">3개</td>
                    <td className="text-center p-4">50개</td>
                    <td className="text-center p-4">무제한</td>
                    <td className="text-center p-4">무제한</td>
                  </tr>
                  <tr className="border-t bg-muted/20">
                    <td className="p-4 font-medium">스토리지 용량</td>
                    <td className="text-center p-4">1GB</td>
                    <td className="text-center p-4">50GB</td>
                    <td className="text-center p-4">500GB</td>
                    <td className="text-center p-4">무제한</td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4 font-medium">판매 수수료</td>
                    <td className="text-center p-4">-</td>
                    <td className="text-center p-4">15%</td>
                    <td className="text-center p-4">10%</td>
                    <td className="text-center p-4">5%</td>
                  </tr>
                  <tr className="border-t bg-muted/20">
                    <td className="p-4 font-medium">분석 도구</td>
                    <td className="text-center p-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                    <td className="text-center p-4"><Check className="w-4 h-4 text-green-500 mx-auto" /></td>
                  </tr>
                  <tr className="border-t">
                    <td className="p-4 font-medium">우선 지원</td>
                    <td className="text-center p-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-4">이메일</td>
                    <td className="text-center p-4">24시간 이내</td>
                    <td className="text-center p-4">24/7 전화</td>
                  </tr>
                  <tr className="border-t bg-muted/20">
                    <td className="p-4 font-medium">팀 협업</td>
                    <td className="text-center p-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-4"><X className="w-4 h-4 text-red-500 mx-auto" /></td>
                    <td className="text-center p-4">최대 5명</td>
                    <td className="text-center p-4">무제한</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">안전한 결제</h3>
              <p className="text-sm text-muted-foreground">
                업계 표준 보안으로 안전하게 보호되는 결제 시스템
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Headphones className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">24/7 지원</h3>
              <p className="text-sm text-muted-foreground">
                언제든지 도움이 필요할 때 전문 지원팀이 도와드립니다
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <BarChart3 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">성장 분석</h3>
              <p className="text-sm text-muted-foreground">
                상세한 분석 도구로 콘텐츠 성과를 추적하고 개선하세요
              </p>
            </CardContent>
          </Card>
        </div>

        {/* FAQ 섹션 */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-8">자주 묻는 질문</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">언제든지 플랜을 변경할 수 있나요?</h4>
                <p className="text-sm text-muted-foreground">
                  네, 언제든지 업그레이드하거나 다운그레이드할 수 있습니다. 변경사항은 다음 결제 주기부터 적용됩니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">수수료는 어떻게 계산되나요?</h4>
                <p className="text-sm text-muted-foreground">
                  플랜별로 다른 수수료율이 적용되며, 판매 금액에서 자동으로 차감됩니다. 더 높은 플랜일수록 낮은 수수료율을 제공합니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">환불 정책은 어떻게 되나요?</h4>
                <p className="text-sm text-muted-foreground">
                  30일 무조건 환불 보장을 제공합니다. 서비스에 만족하지 않으시면 전액 환불해드립니다.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h4 className="font-semibold mb-2">팀 플랜은 어떻게 관리하나요?</h4>
                <p className="text-sm text-muted-foreground">
                  프로 플랜 이상에서 팀 멤버를 초대하고 권한을 관리할 수 있습니다. 관리자 대시보드에서 모든 설정을 제어할 수 있습니다.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center mt-16">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">아직 결정하지 못하셨나요?</h3>
              <p className="text-muted-foreground mb-6">
                무료 플랜으로 시작해서 AIrize의 모든 기본 기능을 체험해보세요.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/explore">
                  <Button variant="outline" size="lg">
                    콘텐츠 둘러보기
                  </Button>
                </Link>
                <Link href={user ? "/upload" : "/signup"}>
                  <Button size="lg" className="gradient-bg">
                    {user ? "콘텐츠 업로드하기" : "무료로 시작하기"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import ContentDetailPage from '@/components/content/ContentDetailPage';

interface ContentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ContentPage({ params }: ContentPageProps) {
  const { id } = await params;
  return <ContentDetailPage contentId={id} />;
}

// 메타데이터 생성 (SEO 최적화)
export async function generateMetadata({ params }: ContentPageProps) {
  // TODO: 실제 콘텐츠 정보를 가져와서 메타데이터 생성
  return {
    title: `콘텐츠 상세 - AIrize`,
    description: 'AI로 생성된 고품질 콘텐츠를 확인하고 다운로드하세요.',
  };
}

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MyContentPage from '@/components/content/MyContentPage';

export default function MyContent() {
  return (
    <ProtectedRoute requireAuth={true}>
      <MyContentPage />
    </ProtectedRoute>
  );
}

export const metadata = {
  title: '내 콘텐츠 - AIrize',
  description: '업로드한 콘텐츠를 관리하고 성과를 확인하세요.',
};

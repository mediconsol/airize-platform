import { Metadata } from 'next';
import SettingsPage from '@/components/settings/SettingsPage';

export const metadata: Metadata = {
  title: '설정 - AIrize',
  description: '계정 설정, 알림 설정, 개인정보 설정을 관리하세요.',
  themeColor: '#6366f1',
  viewport: 'width=device-width, initial-scale=1',
};

export default function Settings() {
  return <SettingsPage />;
}

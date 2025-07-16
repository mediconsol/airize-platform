'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Camera, 
  Save,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Crown
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    phone: user?.phone || '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    contentUpdates: true,
    commentNotifications: true,
    likeNotifications: false,
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true,
    showActivity: true,
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">로그인이 필요합니다</h1>
            <p className="text-muted-foreground">설정을 변경하려면 먼저 로그인해주세요.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateUserProfile(profileData);
      toast.success('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('프로필 업데이트 오류:', error);
      toast.error('프로필 업데이트에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationUpdate = () => {
    // 알림 설정 저장 로직
    toast.success('알림 설정이 저장되었습니다.');
  };

  const handlePrivacyUpdate = () => {
    // 개인정보 설정 저장 로직
    toast.success('개인정보 설정이 저장되었습니다.');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCreator = user.roles?.includes('creator');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* 헤더 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">설정</h1>
          <p className="text-muted-foreground">
            계정 정보, 알림, 개인정보 보호 설정을 관리하세요.
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              프로필
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              알림
            </TabsTrigger>
            <TabsTrigger value="privacy" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              개인정보
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              테마
            </TabsTrigger>
          </TabsList>

          {/* 프로필 설정 */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  프로필 정보
                  {isCreator && <Crown className="w-4 h-4 text-yellow-500" />}
                </CardTitle>
                <CardDescription>
                  공개 프로필에 표시될 정보를 수정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 프로필 이미지 */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20">
                    <AvatarImage src={user.profileImage} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      <Camera className="w-4 h-4 mr-2" />
                      사진 변경
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      JPG, PNG 파일만 업로드 가능합니다.
                    </p>
                  </div>
                </div>

                <Separator />

                {/* 기본 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">이름</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">이메일</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="이메일을 입력하세요"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">소개</Label>
                  <Input
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    placeholder="자신을 소개해보세요"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">위치</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="서울, 대한민국"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">웹사이트</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">전화번호</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="010-1234-5678"
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleProfileUpdate} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? '저장 중...' : '변경사항 저장'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 알림 설정 */}
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  알림 설정
                </CardTitle>
                <CardDescription>
                  받고 싶은 알림 유형을 선택하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>이메일 알림</Label>
                      <p className="text-sm text-muted-foreground">
                        중요한 업데이트를 이메일로 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>푸시 알림</Label>
                      <p className="text-sm text-muted-foreground">
                        브라우저 푸시 알림을 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>마케팅 이메일</Label>
                      <p className="text-sm text-muted-foreground">
                        새로운 기능과 프로모션 정보를 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, marketingEmails: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>콘텐츠 업데이트</Label>
                      <p className="text-sm text-muted-foreground">
                        팔로우한 크리에이터의 새 콘텐츠 알림을 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.contentUpdates}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, contentUpdates: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>댓글 알림</Label>
                      <p className="text-sm text-muted-foreground">
                        내 콘텐츠에 댓글이 달릴 때 알림을 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.commentNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, commentNotifications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>좋아요 알림</Label>
                      <p className="text-sm text-muted-foreground">
                        내 콘텐츠에 좋아요가 눌릴 때 알림을 받습니다.
                      </p>
                    </div>
                    <Switch
                      checked={notificationSettings.likeNotifications}
                      onCheckedChange={(checked) => 
                        setNotificationSettings(prev => ({ ...prev, likeNotifications: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleNotificationUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    알림 설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 개인정보 설정 */}
          <TabsContent value="privacy">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  개인정보 보호
                </CardTitle>
                <CardDescription>
                  개인정보 공개 범위와 보안 설정을 관리하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>프로필 공개</Label>
                      <p className="text-sm text-muted-foreground">
                        다른 사용자가 내 프로필을 볼 수 있습니다.
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.profileVisibility}
                      onCheckedChange={(checked) =>
                        setPrivacySettings(prev => ({ ...prev, profileVisibility: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>이메일 주소 공개</Label>
                      <p className="text-sm text-muted-foreground">
                        프로필에 이메일 주소를 표시합니다.
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) =>
                        setPrivacySettings(prev => ({ ...prev, showEmail: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>전화번호 공개</Label>
                      <p className="text-sm text-muted-foreground">
                        프로필에 전화번호를 표시합니다.
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) =>
                        setPrivacySettings(prev => ({ ...prev, showPhone: checked }))
                      }
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>메시지 허용</Label>
                      <p className="text-sm text-muted-foreground">
                        다른 사용자가 메시지를 보낼 수 있습니다.
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) =>
                        setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>활동 내역 공개</Label>
                      <p className="text-sm text-muted-foreground">
                        최근 활동 내역을 다른 사용자에게 보여줍니다.
                      </p>
                    </div>
                    <Switch
                      checked={privacySettings.showActivity}
                      onCheckedChange={(checked) =>
                        setPrivacySettings(prev => ({ ...prev, showActivity: checked }))
                      }
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handlePrivacyUpdate}>
                    <Save className="w-4 h-4 mr-2" />
                    개인정보 설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 테마 설정 */}
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  테마 및 외관
                </CardTitle>
                <CardDescription>
                  애플리케이션의 테마와 외관을 설정하세요.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-base font-medium">테마 선택</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      원하는 테마를 선택하세요.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                        <div className="w-full h-20 bg-gradient-to-br from-white to-gray-100 rounded mb-2 border"></div>
                        <p className="text-sm font-medium">라이트 모드</p>
                        <p className="text-xs text-muted-foreground">밝은 테마</p>
                      </div>
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors">
                        <div className="w-full h-20 bg-gradient-to-br from-gray-900 to-black rounded mb-2"></div>
                        <p className="text-sm font-medium">다크 모드</p>
                        <p className="text-xs text-muted-foreground">어두운 테마</p>
                      </div>
                      <div className="border rounded-lg p-4 cursor-pointer hover:border-primary transition-colors border-primary">
                        <div className="w-full h-20 bg-gradient-to-br from-white via-gray-100 to-gray-900 rounded mb-2"></div>
                        <p className="text-sm font-medium">시스템 설정</p>
                        <p className="text-xs text-muted-foreground">시스템 테마 따라가기</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-base font-medium">언어 설정</Label>
                    <p className="text-sm text-muted-foreground mb-4">
                      사용할 언어를 선택하세요.
                    </p>
                    <select className="w-full p-2 border rounded-md">
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="ja">日本語</option>
                    </select>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>애니메이션 효과</Label>
                        <p className="text-sm text-muted-foreground">
                          페이지 전환 및 상호작용 애니메이션을 사용합니다.
                        </p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>고대비 모드</Label>
                        <p className="text-sm text-muted-foreground">
                          접근성을 위한 고대비 색상을 사용합니다.
                        </p>
                      </div>
                      <Switch />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>큰 글씨</Label>
                        <p className="text-sm text-muted-foreground">
                          더 큰 글씨 크기를 사용합니다.
                        </p>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button>
                    <Save className="w-4 h-4 mr-2" />
                    테마 설정 저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

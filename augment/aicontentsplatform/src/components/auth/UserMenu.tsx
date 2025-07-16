'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  User,
  Settings,
  Upload,
  Heart,
  Bookmark,
  CreditCard,
  BarChart3,
  LogOut,
  Crown
} from 'lucide-react';
import Link from 'next/link';

interface UserMenuProps {
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

export default function UserMenu({ onProfileClick, onSettingsClick }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('로그아웃 오류:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isCreator = user.roles.includes('creator');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.profileImage} alt={user.name} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              {isCreator && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={onProfileClick} className="cursor-pointer">
          <User className="mr-2 h-4 w-4" />
          <span>프로필</span>
        </DropdownMenuItem>

        <Link href="/settings">
          <DropdownMenuItem className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>설정</span>
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator />
        
        {isCreator && (
          <>
            <Link href="/upload">
              <DropdownMenuItem className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                <span>콘텐츠 업로드</span>
              </DropdownMenuItem>
            </Link>

            <Link href="/my-content">
              <DropdownMenuItem className="cursor-pointer">
                <BarChart3 className="mr-2 h-4 w-4" />
                <span>내 콘텐츠</span>
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem className="cursor-pointer">
              <BarChart3 className="mr-2 h-4 w-4" />
              <span>크리에이터 대시보드</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator />
          </>
        )}
        
        <DropdownMenuItem className="cursor-pointer">
          <Heart className="mr-2 h-4 w-4" />
          <span>좋아요한 콘텐츠</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <Bookmark className="mr-2 h-4 w-4" />
          <span>북마크</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem className="cursor-pointer">
          <CreditCard className="mr-2 h-4 w-4" />
          <span>구매 내역</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut} 
          className="cursor-pointer text-red-600 focus:text-red-600"
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? '로그아웃 중...' : '로그아웃'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

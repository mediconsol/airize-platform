import { Timestamp } from 'firebase/firestore';

// 사용자 타입
export interface User {
  uid: string;
  name: string;
  email: string;
  profileImage?: string;
  bio?: string;
  roles: ('creator' | 'viewer')[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 콘텐츠 타입
export interface Content {
  id: string;
  title: string;
  type: 'ppt' | 'excel' | 'image' | 'video' | 'music' | 'code' | 'document' | 'other';
  description: string;
  tool: string; // 'ChatGPT', 'Midjourney', 'Suno', etc.
  previewURL?: string; // 썸네일 또는 미리보기 이미지
  downloadURL: string; // 실제 파일 다운로드 URL
  demoURL?: string; // 관련 데모사이트 URL
  youtubeURL?: string; // 관련 YouTube 링크
  galleryImages?: Array<{
    id: string;
    url: string;
    caption: string;
  }>; // 설명용 이미지 갤러리
  price: number; // 0이면 무료
  creatorId: string;
  tags?: string[];
  views: number;
  likes: number;
  downloads: number;
  comments: number;
  isPublic: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 구매 내역 타입
export interface Purchase {
  id: string;
  buyerId: string;
  contentId: string;
  price: number;
  paymentMethod: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purchasedAt: Timestamp;
}

// 댓글 타입
export interface Comment {
  id: string;
  contentId: string;
  authorId: string;
  authorName: string;
  authorProfileImage?: string;
  message: string;
  likes: number;
  replies?: Comment[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 좋아요 타입
export interface Like {
  id: string;
  userId: string;
  contentId: string;
  createdAt: Timestamp;
}

// 팔로우 타입
export interface Follow {
  id: string;
  followerId: string; // 팔로우하는 사람
  followingId: string; // 팔로우받는 사람
  createdAt: Timestamp;
}

// 북마크 타입
export interface Bookmark {
  id: string;
  userId: string;
  contentId: string;
  createdAt: Timestamp;
}

// 알림 타입
export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'purchase' | 'upload';
  title: string;
  message: string;
  isRead: boolean;
  relatedId?: string; // 관련된 콘텐츠나 사용자 ID
  createdAt: Timestamp;
}

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

export interface UploadProgress {
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
}

export const storageService = {
  // 파일 업로드 (진행률 콜백 포함)
  async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ) {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // 진행률 추적이 필요한 경우
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              onProgress({
                progress,
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
              });
            },
            (error) => {
              reject({ success: false, error: error.message });
            },
            async () => {
              try {
                const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({ success: true, downloadURL, path });
              } catch (error: any) {
                reject({ success: false, error: error.message });
              }
            }
          );
        });
      } else {
        // 단순 업로드
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return { success: true, downloadURL, path };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 이미지 파일 업로드 (리사이징 포함)
  async uploadImage(
    file: File,
    folder: string,
    userId: string,
    maxWidth = 1920,
    quality = 0.8
  ) {
    try {
      // 이미지 리사이징
      const resizedFile = await this.resizeImage(file, maxWidth, quality);
      
      // 파일명 생성 (타임스탬프 + 원본 파일명)
      const timestamp = Date.now();
      const fileName = `${timestamp}_${file.name}`;
      const path = `${folder}/${userId}/${fileName}`;
      
      return await this.uploadFile(resizedFile, path);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 프로필 이미지 업로드
  async uploadProfileImage(file: File, userId: string) {
    const path = `profiles/${userId}/avatar_${Date.now()}.jpg`;
    return await this.uploadImage(file, 'profiles', userId, 400, 0.9);
  },

  // 콘텐츠 파일 업로드
  async uploadContentFile(
    file: File,
    userId: string,
    contentId: string,
    onProgress?: (progress: UploadProgress) => void
  ) {
    const timestamp = Date.now();
    const fileName = `${timestamp}_${file.name}`;
    const path = `contents/${userId}/${contentId}/${fileName}`;

    return await this.uploadFile(file, path, onProgress);
  },

  // 썸네일 업로드
  async uploadThumbnail(file: File, userId: string, contentId: string) {
    const path = `thumbnails/${userId}/${contentId}/thumb_${Date.now()}.jpg`;
    return await this.uploadImage(file, 'thumbnails', userId, 800, 0.8);
  },

  // 파일 삭제
  async deleteFile(path: string) {
    try {
      const fileRef = ref(storage, path);
      await deleteObject(fileRef);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 파일 메타데이터 조회
  async getFileMetadata(path: string) {
    try {
      const fileRef = ref(storage, path);
      const metadata = await getMetadata(fileRef);
      return { success: true, metadata };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  },

  // 이미지 리사이징 유틸리티
  async resizeImage(file: File, maxWidth: number, quality: number): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        // 비율 계산
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        const width = img.width * ratio;
        const height = img.height * ratio;

        // 캔버스 크기 설정
        canvas.width = width;
        canvas.height = height;

        // 이미지 그리기
        ctx.drawImage(img, 0, 0, width, height);

        // Blob으로 변환
        canvas.toBlob(
          (blob) => {
            const resizedFile = new File([blob!], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  },

  // 파일 타입 검증
  validateFileType(file: File, allowedTypes: string[]) {
    return allowedTypes.includes(file.type);
  },

  // 파일 크기 검증 (MB 단위)
  validateFileSize(file: File, maxSizeMB: number) {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  },

  // 파일 크기를 읽기 쉬운 형태로 변환
  formatFileSize(bytes: number) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

// 편의를 위한 직접 export
export const uploadFile = storageService.uploadFile.bind(storageService);
export const uploadImage = storageService.uploadImage.bind(storageService);
export const deleteFile = storageService.deleteFile.bind(storageService);

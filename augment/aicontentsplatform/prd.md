 **Firebase 기반 AI 콘텐츠 마켓 플랫폼** 구축을 위해 \*\*AI 개발자 또는 프로그래머에게 전달할 수 있는 실전형 PRD(제품 요구사항 문서)\*\*입니다. 개발자가 이해하고 구현할 수 있도록 기술 중심으로 정리했습니다.

---

# 📄 PRD 문서

## 제품명: **AIrize** – AI 콘텐츠 마켓 플랫폼

버전: v1.0
작성일: 2025-07-13

---

## 1. 🎯 프로젝트 개요

**목표:**
AI로 생성된 콘텐츠(PPT, 엑셀, 이미지, 영상, 음악 등)를 업로드하고, 거래하고, 감상하고, 공유할 수 있는 **크리에이터 중심의 Firebase 기반 마켓플레이스** 구축

**주요 기능:**

* AI 콘텐츠 업로드 (파일 + 메타데이터 + 제작 툴)
* 사용자 프로필 및 포트폴리오
* 유료/무료 다운로드 및 결제 연동
* 커뮤니티 요소 (좋아요, 댓글)
* 관리자 콘텐츠 관리

---

## 2. 🛠️ 기술 스택 (확정)

| 구성     | 기술                                             |
| ------ | ---------------------------------------------- |
| 프론트엔드  | Next.js, Tailwind CSS, shadcn/ui               |
| 백엔드    | Firebase (Firestore, Auth, Storage, Functions) |
| 배포     | Firebase Hosting (또는 Vercel 연동)                |
| 결제 API | Toss Payments (우선), Stripe (해외 확장 고려)          |
| 인증     | Firebase Auth (Google, GitHub, Email)          |
| 이미지 처리 | Firebase Functions + Sharp.js                  |
| 검색     | Firestore 쿼리 (v1), 추후 Algolia 연동 검토            |

---

## 3. 📦 데이터 모델 (Firestore 컬렉션 설계)

### 3.1 `users` (회원 정보)

```json
{
  uid: "string",            // Firebase Auth ID
  name: "string",
  email: "string",
  profileImage: "url",
  bio: "string",
  roles: ["creator", "viewer"],
  createdAt: Timestamp
}
```

### 3.2 `contents` (업로드 콘텐츠 정보)

```json
{
  id: "string",                      // UUID or Auto ID
  title: "string",
  type: "ppt | excel | image | video | music | code | etc",
  description: "string",
  tool: "ChatGPT | Midjourney | Suno | etc",
  previewURL: "string",              // 썸네일 or 미리보기 이미지
  downloadURL: "string",            // 파일 Storage 경로
  price: 0 | number,
  creatorId: "user.uid",
  tags: ["ai", "ppt", "gpt"],
  views: number,
  likes: number,
  comments: number,
  createdAt: Timestamp
}
```

### 3.3 `purchases` (구매 이력)

```json
{
  buyerId: "user.uid",
  contentId: "content.id",
  price: number,
  purchasedAt: Timestamp
}
```

### 3.4 `comments` (댓글)

```json
{
  contentId: "string",
  authorId: "string",
  message: "string",
  createdAt: Timestamp
}
```

---

## 4. 🔑 기능 요구사항 상세

### 4.1 회원가입 및 로그인

* Firebase Authentication 사용
* Google / GitHub / Email 로그인 지원
* 최초 로그인 시 Firestore에 `users` 문서 생성

### 4.2 콘텐츠 업로드

* 업로드 대상: 이미지, PDF, 엑셀, PPT, ZIP 등
* 스토리지 업로드 후 URL 획득
* 메타데이터 입력 (툴, 설명, 가격 등)
* Firestore의 `contents` 컬렉션에 저장

> 🔒 Firebase Storage 보안 규칙:
> 업로드는 로그인한 사용자만 가능
> 다운로드는 구매자 혹은 무료일 경우 허용

### 4.3 콘텐츠 탐색

* 리스트 뷰: 검색(제목/태그), 필터링(유형/가격/툴)
* 상세 페이지: 썸네일, 미리보기, 제작자 정보, 다운로드 버튼, 댓글
* 좋아요 버튼: Firestore 필드 증가 방식

### 4.4 결제 및 다운로드

* 유료 콘텐츠: Toss Payments API 연동 (client → serverless → redirect → webhook)
* 결제 성공 시 `purchases` 문서 생성
* 다운로드 버튼은 해당 콘텐츠를 구매한 경우에만 활성화

> ✅ 추후 구매기록 기반 콘텐츠 추천 기능 추가 예정

### 4.5 커뮤니티 기능

* 댓글: 실시간 반영 (Firestore Snapshot Listener)
* 좋아요: 유저당 1회 제한 (별도 컬렉션 `likes` 필요 시 고려)

### 4.6 관리자 기능

* 신고 콘텐츠 목록 관리 (추가 필요)
* 블라인드 처리: `contents.visibility = false` 필드 적용
* 정산 정보 추적 (결제 API와 연동)

---

## 5. 🔒 Firebase Security Rules 개요

* `users`: 본인만 읽기/쓰기 가능
* `contents`: 전체 사용자 읽기, 작성자만 수정
* `purchases`: 본인만 읽기/쓰기 가능
* `storage`:

  ```
  allow read: if request.auth.uid in resource.metadata.allowedUsers;
  allow write: if request.auth.uid == request.resource.metadata.creatorId;
  ```

---

## 6. 🎯 MVP 개발 우선순위 (4주 기준)

| 주차  | 주요 기능                                  |
| --- | -------------------------------------- |
| 1주차 | Firebase 초기 세팅, 로그인/회원가입, Firestore 연결 |
| 2주차 | 콘텐츠 업로드/파일 저장, 콘텐츠 리스트/상세 페이지          |
| 3주차 | 결제 연동(Toss), 구매/다운로드 기능, 보안 규칙 적용      |
| 4주차 | 댓글, 좋아요, 마이페이지, 관리자 기능 간단화             |

---

## 7. 💬 기타 고려사항

* 향후 추천 콘텐츠 → Firestore 태그 기반 정렬 or ML 도입
* 프롬프트 공개 여부 선택 기능 추가 예정
* 커뮤니티 강화 시, 팔로우/팔로워 기능 확장 가능
* AI 툴 분류 및 필터링은 동적 확장 가능하게 설계

---

## 8. 🧪 API 및 작업 샘플 요청 가능 목록

| 요청 항목                           | 응답             |
| ------------------------------- | -------------- |
| Firestore 컬렉션 예제                | 제공 가능          |
| Firebase Functions - Toss 결제 처리 | 예제 코드 가능       |
| Storage 업로드 후 메타데이터 적용          | 스니펫 제공 가능      |
| 댓글 실시간 반영                       | Snapshot 예제 가능 |

---

이 문서는 **기획자 ↔ 개발자 간 협업 및 구현 가이드를 위한 1차 PRD 문서**입니다.
원하시면 바로 개발 적용 가능한 API 정의서(REST/GraphQL), 와이어프레임, Firebase Functions 코드 예제도 제작해드릴 수 있습니다.



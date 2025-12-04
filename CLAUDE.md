# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

다배달 결제 앱 관리자 웹 사이트 (DaBaeDal Payment Admin)는 앱 결제 시스템을 관리하기 위한 Next.js 16 기반 관리자 대시보드입니다. 관리자가 앱 사용자, 결제 내역, 출금 내역, 공지사항, 팝업 등을 관리할 수 있는 기능을 제공합니다.

**Tech Stack**: Next.js 16, React 19, TypeScript, Tailwind CSS, CKEditor 5

## Common Commands

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

## Project Structure

```
dabaedal-payment-admin/
├── app/                                    # Next.js 16 App Router
│   ├── layout.tsx                          # 루트 레이아웃
│   ├── page.tsx                            # 메인 대시보드 (센터 선택 안내)
│   ├── globals.css                         # 글로벌 스타일
│   ├── login/
│   │   └── page.tsx                        # 로그인 페이지
│   ├── admin-users/                        # 계정 관리
│   │   ├── page.tsx                        # 계정 목록
│   │   └── [id]/page.tsx                   # 계정 상세/수정
│   ├── users/                              # 회원 관리
│   │   ├── page.tsx                        # 회원 목록
│   │   └── [id]/page.tsx                   # 회원 상세/수정
│   ├── payments/                           # 결제 관리
│   │   ├── page.tsx                        # 결제 목록 (리다이렉트)
│   │   ├── delivery/page.tsx               # 배달비 결제 목록
│   │   └── rent/page.tsx                   # 월세 결제 목록
│   ├── withdrawals/                        # 회원 출금 관리
│   │   ├── delivery/page.tsx               # 배달비 출금 내역
│   │   └── rent/page.tsx                   # 월세 출금 내역
│   ├── applications/
│   │   └── rent/                           # 월세 신청 관리
│   │       ├── page.tsx                    # 월세 신청 목록
│   │       └── [documentId]/page.tsx       # 월세 신청 상세 (승인/거절)
│   ├── merchant-withdrawals/
│   │   └── page.tsx                        # 머천트 출금 관리
│   ├── notices/                            # 공지사항 관리
│   │   ├── page.tsx                        # 공지사항 목록
│   │   └── [id]/page.tsx                   # 공지사항 상세/수정/신규
│   ├── popup/
│   │   └── page.tsx                        # 팝업 관리
│   └── api/
│       └── [...path]/
│           └── route.ts                    # API 프록시 (BFF 패턴)
├── components/                             # React 컴포넌트
│   ├── layout/                             # 레이아웃 컴포넌트
│   │   ├── DashboardLayout.tsx             # 대시보드 레이아웃 (Sidebar + Header)
│   │   ├── Sidebar.tsx                     # 사이드바 네비게이션
│   │   └── Header.tsx                      # 헤더 (센터 선택 드롭다운)
│   ├── common/                             # 공통 컴포넌트
│   │   ├── Table.tsx                       # 재사용 가능한 테이블
│   │   ├── Pagination.tsx                  # 페이지네이션
│   │   ├── SearchBar.tsx                   # 검색바
│   │   ├── Modal.tsx                       # 범용 모달
│   │   ├── AlertModal.tsx                  # 알림 모달
│   │   ├── ConfirmModal.tsx                # 확인 모달
│   │   └── CKEditorWrapper.tsx             # CKEditor 래퍼 (동적 import)
│   ├── admin-users/
│   │   └── AdminUserForm.tsx               # 계정 등록/수정 폼
│   ├── users/
│   │   └── UserForm.tsx                    # 회원 등록/수정 폼
│   ├── notices/
│   │   └── NoticeForm.tsx                  # 공지사항 등록/수정 폼
│   ├── applications/
│   │   └── RentApprovalModal.tsx           # 월세 승인 모달
│   └── merchant-withdrawals/
│       └── MerchantWithdrawalModal.tsx     # 머천트 출금 모달
├── lib/                                    # 라이브러리 및 유틸리티
│   ├── api-client.ts                       # API 클라이언트 (fetch 래퍼)
│   ├── api/                                # API 서비스 레이어
│   │   ├── auth.ts                         # 인증 API
│   │   ├── admin-users.ts                  # 계정 관리 API
│   │   ├── users.ts                        # 회원 관리 API
│   │   ├── payments.ts                     # 결제 관리 API
│   │   ├── withdrawals.ts                  # 출금 관리 API
│   │   ├── rent-applications.ts            # 월세 신청 API
│   │   ├── merchant-withdrawals.ts         # 머천트 출금 API
│   │   ├── notices.ts                      # 공지사항 API
│   │   ├── popup.ts                        # 팝업 API
│   │   └── centers.ts                      # 센터 API
│   └── contexts/
│       └── CenterContext.tsx               # 센터 선택 Context
├── types/
│   └── api.ts                              # API 타입 정의
├── utils/
│   └── format.ts                           # 포맷팅 유틸리티
├── middleware.ts                           # Next.js 미들웨어 (인증 체크)
├── next.config.ts                          # Next.js 설정
├── tailwind.config.ts                      # Tailwind CSS 설정
└── tsconfig.json                           # TypeScript 설정
```

## Architecture & Design Principles

### Navigation Pattern

**인증 및 권한**:
- 로그인하지 않은 사용자: `/login`으로 리다이렉트 (middleware.ts)
- 로그인 완료: 센터 선택 화면 또는 대시보드
- **JWT 토큰은 httpOnly 쿠키로 관리** (XSS 방지)
- 로그인한 관리자 정보는 `localStorage`의 `adminUser`에 저장

**메뉴 구조** (Sidebar):
1. **대시보드** - 메인 페이지 (센터 선택 안내)
2. **회원 관리** - 앱 사용자 관리
3. **결제 관리** - 배달비/월세 결제 내역 조회
4. **회원 출금 관리** - 배달비/월세 출금 내역 조회
5. **월세 신청 관리** - 월세 승인 요청 관리
6. **머천트 출금 관리** - 머천트 잔액 출금
7. **공지사항 관리** - 앱 공지사항 CRUD
8. **팝업 관리** - 앱 팝업 관리 (단건)
9. **계정 관리** - 어드민 계정 CRUD

**센터 선택**:
- 로그인 후 센터 목록 조회 (`/api/v1/centers`)
- Header에서 센터 선택 드롭다운 표시
- 선택된 센터 ID는 `CenterContext` 및 `localStorage`에 저장
- 모든 API 호출 시 `centerId` 파라미터 전달

### State Management

- **React Context**: `CenterContext` (선택된 센터 관리)
- **Local State**: `useState` 사용 (페이지/컴포넌트 레벨)
- **Server State**: API 호출 후 클라이언트에서 상태 관리 (React Query 미사용)
- **Local Storage**:
  - `adminUser`: 로그인한 관리자 정보
  - `selectedCenter`: 선택된 센터 정보
- **httpOnly Cookie**:
  - `access_token`: JWT 토큰 (서버에서 설정, JS로 접근 불가)

### API Communication

**BFF (Backend for Frontend) 패턴**:
- 클라이언트는 백엔드 서버에 직접 요청하지 않고, Next.js API Routes를 통해 프록시
- **브라우저 Network 탭에 백엔드 URL이 노출되지 않음** (보안 강화)

**프록시 구조**:
```
브라우저 → /api/* (Next.js 프록시) → 백엔드 서버 (BACKEND_API_URL)
```

- **API Client**: `lib/api-client.ts`의 `ApiClient` 클래스
- **Base URL**: `/api` (프록시 경로)
- **백엔드 URL**: `BACKEND_API_URL` 환경변수 (서버 사이드에서만 사용)
- **Authentication**: httpOnly 쿠키 기반 JWT
  - `credentials: 'include'`로 쿠키 자동 전송
  - 백엔드에서 `Set-Cookie` 헤더로 토큰 설정
- **API Response**: `{ success: boolean, message: string, status: number, data: T | null }`
- **Error Handling**:
  - `ApiError` 클래스로 에러 처리
  - **401 에러 시 자동으로 `/login` 페이지로 리다이렉트**
  - 서버 응답의 `success: false` 시 에러 throw
  - 네트워크 에러 시 기본 에러 메시지 표시

### UI/UX Design Guidelines

**디자인 시스템**:

1. **컬러 스킴**:
   - Primary: `blue-600` (Tailwind)
   - Background: `gray-50`, `gray-100`
   - Border: `gray-200`, `gray-300`
   - Text: `gray-700`, `gray-900`
   - Success: `green-600`
   - Error: `red-600`
   - Warning: `yellow-600`

2. **레이아웃**:
   - **Sidebar**: 고정 너비 (256px), 왼쪽 배치
   - **Header**: 상단 고정, 센터 선택 드롭다운 + 로그아웃
   - **Content Area**: Sidebar 우측, 스크롤 가능
   - **Padding**: 페이지 컨텐츠 `p-6`, 카드 `p-4`

3. **테이블**:
   - `Table` 컴포넌트 사용
   - 헤더: `bg-gray-50`, `font-medium`
   - 행: `hover:bg-gray-50` (호버 효과)
   - 액션 버튼: 각 행의 마지막 컬럼

4. **폼**:
   - 라벨: `block mb-2 text-sm font-medium text-gray-700`
   - 입력 필드: `border border-gray-300 rounded-lg px-4 py-2`
   - 필수 필드: 라벨에 빨간색 별표 (`*`)
   - 검증 에러: 입력 필드 아래 빨간색 텍스트

5. **버튼**:
   - Primary: `bg-blue-600 text-white hover:bg-blue-700`
   - Secondary: `bg-gray-200 text-gray-700 hover:bg-gray-300`
   - Danger: `bg-red-600 text-white hover:bg-red-700`
   - 크기: `px-4 py-2`, `rounded-lg`

6. **모달**:
   - 배경: 반투명 검은색 오버레이
   - 컨텐츠: 중앙 배치, `max-w-2xl`, `bg-white`, `rounded-lg`
   - 닫기 버튼: 우상단 또는 하단

7. **페이지네이션**:
   - `Pagination` 컴포넌트 사용
   - 현재 페이지 강조: `bg-blue-600 text-white`
   - 이전/다음 버튼: 화살표 아이콘

8. **검색바**:
   - 검색 조건: 드롭다운 + 입력 필드 + 날짜 범위
   - 검색 버튼: `bg-blue-600 text-white`
   - 초기화 버튼: `bg-gray-200 text-gray-700`

## Key Features

### 1. 로그인 및 인증
- **엔드포인트**: `POST /admin/api/v1/admin/login`
- **Request**: `{ loginId: string, password: string }`
- **Response**: `AdminUser` (토큰은 httpOnly 쿠키로 설정됨)
- **저장**: `localStorage`에 `adminUser`만 저장 (토큰은 쿠키에 자동 저장)
- **리다이렉트**: 로그인 성공 시 메인 페이지로 이동
- **계정 잠금**: 비밀번호 5회 오류 시 계정 잠금 (관리자에게 문의 필요)

**로그아웃**:
- **엔드포인트**: `POST /admin/api/v1/admin/logout`
- **동작**: 서버에서 쿠키 삭제 (Max-Age=0), localStorage 정리

### 2. 센터 선택
- **엔드포인트**: `GET /admin/api/v1/centers`
- **Response**: `{ centers: Center[], totalElements, totalPages, currentPage, pageSize }`
- **Header 드롭다운**: 센터 목록 표시
- **Context**: `CenterContext`로 전역 관리
- **localStorage**: `selectedCenterId` 저장

### 3. 회원 관리
- **목록 조회**:
  - **엔드포인트**: `GET /admin/api/v1/users`
  - **Query Params**: `centerId` (필수), `page`, `size`, `userStatus`, `registDateFrom`, `registDateTo`, `loginId`, `userName`
  - **Response**: `{ users: UserListItem[], totalElements, totalPages, currentPage, pageSize }`
  - **검색 조건**: 등록일 범위, 회원상태, 아이디/회원명
- **회원 등록**:
  - **엔드포인트**: `POST /admin/api/v1/users`
  - **Request**: `UserCreateRequest`
  - **필수 필드**: 센터, 로그인ID, 비밀번호, 회원명, 연락처, 한도, 배달비 PG 정보
  - **선택 필드**: 월세 PG 정보
- **회원 수정**:
  - **엔드포인트**: `PUT /admin/api/v1/users/{userId}`
  - **Request**: `UserUpdateRequest` (비밀번호는 선택)
- **회원 상세**:
  - **엔드포인트**: `GET /admin/api/v1/users/{userId}`
  - **Response**: `User`

### 4. 결제 관리
- **배달비 결제 목록**:
  - **엔드포인트**: `GET /admin/api/v1/payments/delivery`
  - **Query Params**: `centerId` (필수), `page`, `size`, `requestDateFrom`, `requestDateTo`, `paymentStatus`, `userName`, `approvalNumber`, `cardNumber`, `tid`
  - **Response**: `{ payments: PaymentListItem[], ... }`
- **월세 결제 목록**:
  - **엔드포인트**: `GET /admin/api/v1/payments/rent`
  - **Query Params**: 동일
  - **Response**: 동일

### 5. 회원 출금 관리
- **배달비 출금 내역**:
  - **엔드포인트**: `GET /admin/api/v1/withdrawals/delivery`
  - **Query Params**: `centerId` (필수), `page`, `size`, `requestDateFrom`, `requestDateTo`, `withdrawStatus`, `paymentType`, `userName`, `approvalNumber`, `cardNumber`
  - **Response**: `{ withdraws: WithdrawListItem[], totalElements, ..., merchantBalance, totalAmount, totalFee, totalSettlementAmount }`
- **월세 출금 내역**:
  - **엔드포인트**: `GET /admin/api/v1/withdrawals/rent`
  - **Query Params**: 동일
  - **Response**: 동일

### 6. 월세 신청 관리
- **월세 신청 목록**:
  - **엔드포인트**: `GET /admin/api/v1/rent-applications`
  - **Query Params**: `page`, `size`, `status`, `uploadDateFrom`, `uploadDateTo`, `userName`, `loginId`, `phoneNumber`
  - **Response**: `{ documents: RentApplicationListItem[], ... }`
- **월세 신청 상세**:
  - **엔드포인트**: `GET /admin/api/v1/rent-applications/{documentId}`
  - **Response**: `RentApplicationDetail` (이미지 경로 포함)
- **승인**:
  - **엔드포인트**: `POST /admin/api/v1/rent-applications/{documentId}/approve`
  - **Request**: `ApproveRequest` (월세 PG 정보 포함)
  - **승인 시**: 회원의 `rentApprovalStatus`를 `APPROVED`로 변경, PG 정보 저장
- **거절**:
  - **엔드포인트**: `POST /admin/api/v1/rent-applications/{documentId}/reject`
  - **Request**: `RejectRequest` (거절 사유)
- **취소**:
  - **엔드포인트**: `POST /admin/api/v1/rent-applications/{documentId}/cancel`
  - **Request**: `CancelRequest` (취소 사유)

### 7. 머천트 출금 관리
- **머천트 출금 목록**:
  - **엔드포인트**: `GET /admin/api/v1/merchant-withdrawals`
  - **Query Params**: `centerId` (필수), `paymentPurpose` (필수), `page`, `size`, `requestDateFrom`, `requestDateTo`, `withdrawalStatus`, `accountHolder`, `bankCode`, `accountNumber`
  - **Response**: `{ withdrawals: MerchantWithdrawalListItem[], ..., merchantBalance, totalWithdrawalAmount }`
- **머천트 출금 요청**:
  - **엔드포인트**: `POST /admin/api/v1/merchant-withdrawals`
  - **Request**: `CreateMerchantWithdrawalRequest` (센터, 결제목적, 은행정보, 금액, OTP)
  - **Response**: `MerchantWithdrawalResponse`

### 8. 공지사항 관리
- **목록 조회**:
  - **엔드포인트**: `GET /admin/api/v1/notices`
  - **Query Params**: `page`, `size`, `noticeType`, `title`, `content`, `author`, `registDateFrom`, `registDateTo`
  - **Response**: `{ notices: NoticeListItem[], ... }`
- **공지사항 등록**:
  - **엔드포인트**: `POST /admin/api/v1/notices`
  - **Request**: `NoticeCreateRequest` (noticeType, title, content, author)
- **공지사항 수정**:
  - **엔드포인트**: `PUT /admin/api/v1/notices/{noticeId}`
  - **Request**: `NoticeUpdateRequest`
- **공지사항 상세**:
  - **엔드포인트**: `GET /admin/api/v1/notices/{noticeId}`
  - **Response**: `Notice`
- **공지사항 삭제**:
  - **엔드포인트**: `DELETE /admin/api/v1/notices/{noticeId}`

### 9. 팝업 관리
- **팝업 조회**:
  - **엔드포인트**: `GET /admin/api/v1/popup`
  - **Response**: `Popup` (단건)
- **팝업 생성/업데이트**:
  - **엔드포인트**: `POST /admin/api/v1/popup`
  - **Request**: `PopupCreateRequest` (popupStatus, title, content)
  - **동작**: 기존 팝업 삭제 후 신규 생성
- **팝업 상태 토글**:
  - **엔드포인트**: `PATCH /admin/api/v1/popup/status`
  - **Request**: `{ popupStatus: 'ACTIVE' | 'INACTIVE' }`

### 10. 계정 관리
- **목록 조회**:
  - **엔드포인트**: `GET /admin/api/v1/admin-users`
  - **Query Params**: `page`, `size`, `loginId`, `name`, `phone`, `registDateFrom`, `registDateTo`
  - **Response**: `{ adminUsers: AdminUserListItem[], ... }`
- **계정 등록**:
  - **엔드포인트**: `POST /admin/api/v1/admin-users`
  - **Request**: `AdminUserCreateRequest` (loginId, password, name, tel?, phone, email?)
- **계정 수정**:
  - **엔드포인트**: `PUT /admin/api/v1/admin-users/{adminUserId}`
  - **Request**: `AdminUserUpdateRequest` (password?, name, tel?, phone, email?)
- **계정 상세**:
  - **엔드포인트**: `GET /admin/api/v1/admin-users/{adminUserId}`
  - **Response**: `AdminUser`
- **계정 삭제**:
  - **엔드포인트**: `DELETE /admin/api/v1/admin-users/{adminUserId}`

## Coding Conventions

### TypeScript & React

- **파일명**: kebab-case (예: `admin-user-form.tsx`)
- **컴포넌트명**: PascalCase (예: `AdminUserForm`)
- **변수/함수명**: camelCase (예: `handleSubmit`)
- **상수**: UPPER_SNAKE_CASE (예: `API_BASE_URL`)
- **타입/인터페이스**: PascalCase (예: `AdminUser`, `ApiResponse`)

### Component Pattern

- **Server Components**: 기본 (데이터 fetch는 서버에서)
- **Client Components**: `'use client'` 지시문 사용 (상태 관리, 이벤트 핸들러 필요 시)
- **Props 타입**: 인터페이스로 정의
- **Export**: named export 사용 (default export 지양)

### API Service Pattern

모든 API 호출은 `lib/api/` 디렉토리의 서비스 함수로 분리:

```typescript
// lib/api/users.ts
import { apiClient } from '../api-client';
import type { UserListResponse, UserSearchParams, User, UserCreateRequest, UserUpdateRequest } from '@/types/api';

export async function getUsers(params: UserSearchParams): Promise<UserListResponse> {
  return apiClient.get<UserListResponse>('/users', params);
}

export async function getUser(userId: number): Promise<User> {
  return apiClient.get<User>(`/users/${userId}`);
}

export async function createUser(data: UserCreateRequest): Promise<User> {
  return apiClient.post<User>('/users', data);
}

export async function updateUser(userId: number, data: UserUpdateRequest): Promise<User> {
  return apiClient.put<User>(`/users/${userId}`, data);
}
```

### Error Handling Pattern

```typescript
'use client';

import { useState } from 'react';
import { ApiError } from '@/lib/api-client';

export function SomeComponent() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);
      await somApiCall();
      // Success handling
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {/* ... */}
    </div>
  );
}
```

### Form Pattern

```typescript
'use client';

import { useState, FormEvent } from 'react';
import type { UserCreateRequest } from '@/types/api';

export function UserForm() {
  const [formData, setFormData] = useState<UserCreateRequest>({
    // 초기값
  });

  const handleChange = (field: keyof UserCreateRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    // Validation
    // API call
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* 입력 필드 */}
    </form>
  );
}
```

### Pagination Pattern

모든 목록 페이지는 페이징 처리:

```typescript
const [currentPage, setCurrentPage] = useState(0); // 0-indexed
const [totalPages, setTotalPages] = useState(0);
const [data, setData] = useState<T[]>([]);

const fetchData = async (page: number) => {
  const response = await apiService.getList({ page, size: 10, ...searchParams });
  setData(response.items);
  setTotalPages(response.totalPages);
  setCurrentPage(page);
};

// Pagination 컴포넌트
<Pagination
  currentPage={currentPage}
  totalPages={totalPages}
  onPageChange={(page) => fetchData(page)}
/>
```

## Development Guidelines

### Authentication Flow

**httpOnly 쿠키 기반 인증** (XSS 방지):

1. **로그인 페이지** (`/login`):
   - `loginId`, `password` 입력
   - `POST /api/admin/login` (프록시 경로)
   - 성공 시:
     - 서버에서 `Set-Cookie: access_token=JWT...` 헤더로 쿠키 설정
     - `localStorage`에 `adminUser`만 저장
   - 리다이렉트: `/` (메인 대시보드)
   - **계정 잠금**: 5회 연속 실패 시 계정 잠금

2. **Middleware** (`middleware.ts`):
   - 모든 페이지 접근 시 `access_token` 쿠키 체크
   - 없으면 `/login`으로 리다이렉트
   - `/login`, `/api/*` 경로는 제외

3. **API Client** (`lib/api-client.ts`):
   - `credentials: 'include'`로 쿠키 자동 전송
   - 401 에러 시 자동으로 `/login`으로 리다이렉트

4. **API Proxy** (`app/api/[...path]/route.ts`):
   - 클라이언트 요청을 백엔드로 프록시
   - 쿠키 헤더 전달 (`Cookie`)
   - 백엔드 응답의 `Set-Cookie` 헤더 전달
   - Multipart 요청 지원

5. **로그아웃**:
   - `POST /api/admin/logout` 호출
   - 서버에서 쿠키 삭제 (`Max-Age=0`)
   - `localStorage`의 `adminUser`, `selectedCenter` 삭제
   - `/login`으로 리다이렉트

### Center Selection Flow

1. **Header 컴포넌트**:
   - 로그인 후 `GET /admin/api/v1/centers` 호출
   - 센터 목록을 드롭다운으로 표시
   - 선택된 센터 ID를 `CenterContext`에 저장

2. **CenterContext**:
   - `selectedCenterId`, `setSelectedCenterId` 제공
   - `localStorage`에 `selectedCenterId` 저장/로드

3. **API 호출**:
   - 모든 API 호출 시 `centerId` 파라미터 전달
   - `CenterContext`에서 `selectedCenterId` 가져오기

### Page Structure

모든 목록 페이지는 동일한 구조:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Table } from '@/components/common/Table';
import { Pagination } from '@/components/common/Pagination';
import { SearchBar } from '@/components/common/SearchBar';
import { useCenterContext } from '@/lib/contexts/CenterContext';
import { getItems } from '@/lib/api/items';
import type { ItemListItem, ItemSearchParams } from '@/types/api';

export default function ItemsPage() {
  const { selectedCenterId } = useCenterContext();
  const [items, setItems] = useState<ItemListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchParams, setSearchParams] = useState<Omit<ItemSearchParams, 'centerId' | 'page' | 'size'>>({});

  const fetchItems = async (page: number) => {
    if (!selectedCenterId) return;

    try {
      setLoading(true);
      const response = await getItems({
        centerId: selectedCenterId,
        page,
        size: 10,
        ...searchParams,
      });
      setItems(response.items);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems(0);
  }, [selectedCenterId, searchParams]);

  return (
    <DashboardLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">목록</h1>

        <SearchBar
          onSearch={(params) => setSearchParams(params)}
          // ...
        />

        <Table
          columns={[...]}
          data={items}
          loading={loading}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={fetchItems}
        />
      </div>
    </DashboardLayout>
  );
}
```

## UI Components

### Table Component

재사용 가능한 테이블:

```typescript
interface Column<T> {
  key: string;
  label: string;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  onRowClick?: (item: T) => void;
}

export function Table<T>({ columns, data, loading, onRowClick }: TableProps<T>) {
  // 구현
}
```

### Pagination Component

페이지네이션:

```typescript
interface PaginationProps {
  currentPage: number;  // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisible?: number;  // 기본 5
}

export function Pagination({ currentPage, totalPages, onPageChange, maxVisible = 5 }: PaginationProps) {
  // 구현
}
```

### Modal Component

범용 모달:

```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  // 구현
}
```

## Environment Variables

```env
# .env.local
BACKEND_API_URL=http://localhost:18080/admin/api/v1  # 백엔드 API URL (서버 사이드에서만 사용)
```

- `BACKEND_API_URL`: 백엔드 API 기본 URL (서버 사이드 전용, 클라이언트에 노출되지 않음)

## Known Issues & Future Work

**구현 완료**:
- ✅ 로그인 및 인증
- ✅ 센터 선택
- ✅ 회원 관리 (CRUD)
- ✅ 결제 관리 (배달비/월세 조회)
- ✅ 회원 출금 관리 (배달비/월세 조회)
- ✅ 월세 신청 관리 (승인/거절/취소)
- ✅ 머천트 출금 관리
- ✅ 공지사항 관리 (CRUD)
- ✅ 팝업 관리 (단건)
- ✅ 계정 관리 (CRUD)

**개선 필요**:
- 이미지 업로드 처리 (S3 통합)
- 실시간 데이터 갱신 (Polling 또는 WebSocket)
- 에러 처리 강화 (Toast 메시지)
- 폼 검증 강화 (Zod, React Hook Form)
- 성능 최적화 (React Query, SWR)
- 테스트 작성 (Jest, React Testing Library)

## Brand Identity

**Brand**: "다배달 (DaBaeDal) 결제 관리자"
- 서비스명: 다배달 결제 관리자
- 타겟: 다배달 결제 시스템 운영 관리자
- 주요 기능: 회원 관리, 결제/출금 내역 조회, 월세 승인, 공지사항/팝업 관리

**UI 언어**:
- 사용자 대면: 한국어
- 코드: 영어 (변수명, 함수명, 주석)

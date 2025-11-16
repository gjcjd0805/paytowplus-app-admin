# 다배달 결제 관리자 시스템

다배달 결제 서비스를 위한 관리자 웹 애플리케이션입니다.

## ✨ 구현 완료 화면

✅ **로그인** - JWT 기반 인증
✅ **회원관리** - 회원 목록 조회, 등록, 수정 (검색/필터링)
✅ **결제관리** - 결제 내역 조회 (검색/필터링)
✅ **공지사항관리** - 공지사항 CRUD
✅ **팝업관리** - 팝업 등록/수정 (아이폰 미리보기)
✅ **계정관리** - 관리자 계정 CRUD

## 기술 스택

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 3
- **State Management**: React Context API

## 시작하기

### 환경 설정

1. 환경 변수 파일 생성:
```bash1
cp .env.local.example .env.local
```

2. `.env.local` 파일에서 API URL 설정:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/admin/api/v1
```

### 개발 서버 실행

```bash
npm install
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 빌드

```bash
npm run build
npm start
```

## 주요 기능

### 1. 인증
- 관리자 로그인 (JWT 기반)
- 자동 로그아웃 및 세션 관리

### 2. 회원관리
- 회원 목록 조회 (검색, 페이징)
- 회원 등록/수정
- 센터별 회원 관리

### 3. 결제관리
- 결제 내역 조회
- 결제 상태별 필터링
- 결제 상세 정보 확인

### 4. 공지사항관리
- 공지사항 CRUD
- 공지사항 유형별 관리 (일반/중요/고정)
- HTML 에디터 지원

### 5. 팝업관리
- 팝업 등록/수정
- 팝업 활성화/비활성화

### 6. 계정관리
- 관리자 계정 CRUD
- 계정별 권한 관리

## 프로젝트 구조

```
dabaedal-payment-admin/
├── app/                      # Next.js App Router 페이지
│   ├── login/               # 로그인 페이지
│   ├── users/               # 회원관리
│   ├── payments/            # 결제관리
│   ├── notices/             # 공지사항관리
│   ├── popup/               # 팝업관리
│   └── admin-users/         # 계정관리
├── components/              # React 컴포넌트
│   ├── common/             # 공통 컴포넌트 (Table, Pagination 등)
│   └── layout/             # 레이아웃 컴포넌트 (Header, Sidebar)
├── lib/                     # 유틸리티 함수
│   ├── api/                # API 클라이언트
│   ├── api-client.ts       # HTTP 클라이언트
│   └── contexts/           # React Context
├── types/                   # TypeScript 타입 정의
│   └── api.ts              # API 응답 타입
└── utils/                   # 헬퍼 함수
    └── format.ts           # 포맷팅 유틸리티
```

## API 명세

API 명세는 `dabaedal_ref/ADMIN_API_SPEC.md` 파일을 참조하세요.

## 주요 컴포넌트

### 공통 컴포넌트

- **Table**: 데이터 테이블 컴포넌트
- **Pagination**: 페이지네이션 컴포넌트
- **SearchBar**: 검색 필터 컴포넌트
- **Modal**: 모달 다이얼로그 컴포넌트

### 레이아웃 컴포넌트

- **DashboardLayout**: 전체 레이아웃
- **Sidebar**: 사이드바 네비게이션
- **Header**: 상단 헤더 (센터 선택, 사용자 메뉴)

## 개발 가이드

### 새로운 페이지 추가

1. `app/` 디렉토리에 새 폴더 생성
2. `page.tsx` 파일 작성
3. `components/layout/Sidebar.tsx`에 메뉴 항목 추가

### API 추가

1. `types/api.ts`에 타입 정의
2. `lib/api/` 디렉토리에 API 함수 작성
3. 페이지에서 API 호출

## 주의사항

- 로그인하지 않은 상태에서는 자동으로 로그인 페이지로 리다이렉트됩니다.
- 센터 선택은 필수이며, 로그인 후 자동으로 첫 번째 센터가 선택됩니다.
- 모든 API 요청은 JWT 토큰이 필요합니다.

## 최근 업데이트 내역

### 2025-01-30

#### UI/UX 개선
- **사이드바 센터 선택 기능 추가**
  - 헤더의 센터 드롭다운을 사이드바로 이동
  - 센터명을 클릭하여 드롭다운 메뉴로 센터 변경 가능
  - 센터명 크기 및 간격 조정으로 가독성 향상
  - 메뉴 간격 조정 (space-y-4)

#### 모달 시스템 구현
- **AlertModal 컴포넌트 추가**
  - 성공/에러/경고/정보 타입별 아이콘 및 색상 구분
  - 화면 중앙 정렬
  - ESC 키로 닫기 지원

- **ConfirmModal 컴포넌트 추가**
  - 삭제 등의 확인 액션을 위한 모달
  - 확인/취소 버튼 제공

- **모든 alert() 및 confirm() 대체**
  - UserForm, NoticeForm, AdminUserForm, PopupPage에 적용
  - 일관된 사용자 경험 제공

#### 회원관리 개선
- **계좌 인증 적용 옵션 제거**
  - 회원 등록 시 계좌 인증이 선택 사항으로 변경
  - 사용자가 원할 때만 계좌 인증 가능

#### 팝업관리 개선
- **편집 모드 제거**
  - 모든 필드를 항상 수정 가능하도록 변경
  - "수정" 버튼 제거, "저장" 버튼만 유지
  - 더 직관적인 사용자 경험 제공

#### 날짜 처리 버그 수정
- **UTC 시간 문제 해결**
  - `toISOString()` 사용으로 인한 날짜 오류 수정
  - `getLocalDateString()` 함수로 로컬 날짜 정확히 표시
  - 모든 검색 화면(회원관리, 결제관리, 계정관리)에 적용
  - 검색 종료일자가 현재 날짜로 정확하게 설정

#### 코드 품질 개선
- **컴포넌트 구조 정리**
  - 불필요한 상태 및 함수 제거
  - 코드 중복 최소화
  - 단일 책임 원칙 준수

## 라이센스

ISC

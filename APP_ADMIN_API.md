# 앱 어드민 API 명세서

## 개요

앱 어드민 API는 다배달 앱 사용자 및 결제를 관리하는 관리자용 REST API입니다.

- **Base URL**: `http://localhost:8080/admin/api/v1`
- **인증 방식**: JWT Bearer Token (APP_ADMIN 역할 필요)
- **응답 형식**: JSON

## 인증

로그인 API를 제외한 모든 API는 Authorization 헤더에 APP_ADMIN 역할의 JWT 토큰이 필요합니다.

```
Authorization: Bearer {JWT_TOKEN}
```

---

## 1. 인증 API

### 1.1 어드민 로그인

**Endpoint**: `POST /admin/login`

**인증**: 불필요

**요청 본문**:
```json
{
  "loginId": "admin001",
  "password": "admin123"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 | 검증 규칙 |
|--------|------|------|------|-----------|
| loginId | String | O | 로그인ID | NotBlank |
| password | String | O | 비밀번호 | NotBlank |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "adminUser": {
      "id": 1,
      "loginId": "admin001",
      "name": "관리자",
      "tel": "02-1234-5678",
      "phone": "01012345678",
      "email": "admin@example.com",
      "registDt": "2025-01-01T00:00:00",
      "updateDt": "2025-01-01T00:00:00"
    }
  }
}
```

---

## 2. 어드민 유저 관리 API

### 2.1 어드민 유저 등록

**Endpoint**: `POST /admin-users`

**인증**: 필요 (APP_ADMIN)

**요청 본문**:
```json
{
  "loginId": "admin002",
  "password": "password123",
  "name": "홍길동",
  "tel": "02-9876-5432",
  "phone": "01098765432",
  "email": "hong@example.com"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 | 검증 규칙 |
|--------|------|------|------|-----------|
| loginId | String | O | 로그인ID | NotBlank |
| password | String | O | 비밀번호 | NotBlank |
| name | String | O | 이름 | NotBlank |
| tel | String | X | 전화번호 | - |
| phone | String | O | 휴대폰 | NotBlank |
| email | String | X | 이메일 | Email 형식 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "id": 2,
    "loginId": "admin002",
    "name": "홍길동",
    "tel": "02-9876-5432",
    "phone": "01098765432",
    "email": "hong@example.com",
    "registDt": "2025-01-18T10:00:00",
    "updateDt": "2025-01-18T10:00:00"
  }
}
```

---

### 2.2 어드민 유저 수정

**Endpoint**: `PUT /admin-users/{adminUserId}`

**인증**: 필요 (APP_ADMIN)

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| adminUserId | Long | O | 어드민 유저 ID |

**요청 본문**:
```json
{
  "password": "newPassword456",
  "name": "홍길동",
  "tel": "02-9876-5432",
  "phone": "01098765432",
  "email": "hong@example.com"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 | 검증 규칙 |
|--------|------|------|------|-----------|
| password | String | X | 비밀번호 (미입력 시 기존 유지) | - |
| name | String | O | 이름 | NotBlank |
| tel | String | X | 전화번호 | - |
| phone | String | O | 휴대폰 | NotBlank |
| email | String | X | 이메일 | Email 형식 |

**응답 예시**: 등록과 동일

---

### 2.3 어드민 유저 조회

**Endpoint**: `GET /admin-users/{adminUserId}`

**인증**: 필요 (APP_ADMIN)

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "id": 1,
    "loginId": "admin001",
    "name": "관리자",
    "tel": "02-1234-5678",
    "phone": "01012345678",
    "email": "admin@example.com",
    "registDt": "2025-01-01T00:00:00",
    "updateDt": "2025-01-18T10:00:00"
  }
}
```

---

### 2.4 어드민 유저 목록 조회

**Endpoint**: `GET /admin-users`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| loginId | String | X | - | 로그인ID (부분 검색) |
| name | String | X | - | 이름 (부분 검색) |
| phone | String | X | - | 휴대폰 (부분 검색) |
| registDateFrom | Date | X | - | 등록일 시작 (yyyy-MM-dd) |
| registDateTo | Date | X | - | 등록일 종료 (yyyy-MM-dd) |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |

**요청 예시**:
```
GET /admin/api/v1/admin-users?loginId=admin&page=0&size=10
```

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10,
    "adminUsers": [
      {
        "no": 50,
        "registDt": "2025-01-18T10:00:00",
        "loginId": "admin002",
        "name": "홍길동",
        "phone": "01098765432",
        "email": "hong@example.com"
      }
    ]
  }
}
```

---

### 2.5 어드민 유저 삭제

**Endpoint**: `DELETE /admin-users/{adminUserId}`

**인증**: 필요 (APP_ADMIN)

**응답 예시** (성공 - 200 OK):
```json
{
  "data": null
}
```

---

## 3. 회원 관리 API

### 3.1 회원 등록

**Endpoint**: `POST /users`

**인증**: 필요 (APP_ADMIN)

**요청 본문**:
```json
{
  "centerId": 1,
  "loginId": "user001",
  "password": "user123",
  "userName": "김철수",
  "phoneNumber": "01012341234",
  "perLimitPrice": 500000,
  "dailyLimitPrice": 1000000,
  "annualLimitPrice": 50000000,
  "userStatus": "ACTIVE",
  "allowedInstallmentMonths": 12,
  "isProductNameMutable": true,
  "isPayerNameMutable": false,
  "deliveryPgCode": "WEROUTE",
  "deliveryRecurringMid": "MID001",
  "deliveryRecurringTid": "TID001",
  "deliveryManualMid": "MID002",
  "deliveryManualTid": "TID002",
  "deliveryFeeRate": 3.5,
  "deliveryAccountNumber": "1234567890",
  "deliveryAccountHolder": "김철수",
  "deliveryBankCode": "004",
  "rentPgCode": "WEROUTE",
  "rentRecurringMid": "RENTMID001",
  "rentRecurringTid": "RENTTID001",
  "rentManualMid": "RENTMID002",
  "rentManualTid": "RENTTID002",
  "rentFeeRate": 2.5,
  "rentAccountNumber": "9876543210",
  "rentAccountHolder": "김철수",
  "rentBankCode": "088",
  "memo": "테스트 회원"
}
```

**주요 요청 필드**:
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| centerId | Long | O | 센터 ID |
| loginId | String | O | 로그인 ID |
| password | String | O | 비밀번호 |
| userName | String | O | 회원명 |
| phoneNumber | String | O | 연락처 |
| perLimitPrice | Int | O | 건당 한도금액 |
| dailyLimitPrice | Int | O | 일일 한도금액 |
| annualLimitPrice | Int | O | 연간 한도금액 |
| userStatus | String | O | 회원상태 (ACTIVE, INACTIVE, WITHDRAWN) |
| allowedInstallmentMonths | Int | O | 허용 할부 개월 |
| isProductNameMutable | Boolean | O | 상품명 변경 가능 여부 |
| isPayerNameMutable | Boolean | O | 결제자명 변경 가능 여부 |
| **배달비 관련** | | | |
| deliveryPgCode | String | O | 배달비 PG 코드 (WEROUTE) |
| deliveryRecurringMid | String | O | 배달비 정기결제 MID |
| deliveryRecurringTid | String | O | 배달비 정기결제 TID |
| deliveryManualMid | String | O | 배달비 수기결제 MID |
| deliveryManualTid | String | O | 배달비 수기결제 TID |
| deliveryFeeRate | BigDecimal | O | 배달비 수수료율 (%) |
| deliveryAccountNumber | String | O | 배달비 계좌번호 |
| deliveryAccountHolder | String | O | 배달비 계좌주 |
| deliveryBankCode | String | O | 배달비 은행코드 |
| **월세 관련 (선택)** | | | |
| rentPgCode | String | X | 월세 PG 코드 |
| rentRecurringMid | String | X | 월세 정기결제 MID |
| rentRecurringTid | String | X | 월세 정기결제 TID |
| rentManualMid | String | X | 월세 수기결제 MID |
| rentManualTid | String | X | 월세 수기결제 TID |
| rentFeeRate | BigDecimal | X | 월세 수수료율 (%) |
| rentAccountNumber | String | X | 월세 계좌번호 |
| rentAccountHolder | String | X | 월세 계좌주 |
| rentBankCode | String | X | 월세 은행코드 |
| memo | String | X | 메모 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "userId": 1
  }
}
```

---

### 3.2 회원 수정

**Endpoint**: `PUT /users/{userId}`

**인증**: 필요 (APP_ADMIN)

**요청 본문**: 등록과 동일 (loginId 제외, centerId 제외, password는 선택)

**참고**: 모든 필드는 회원 등록과 동일하나, loginId와 centerId는 수정할 수 없으며, password는 입력 시에만 변경됩니다.

**응답 예시**: 등록과 동일

---

### 3.3 회원 조회

**Endpoint**: `GET /users/{userId}`

**인증**: 필요 (APP_ADMIN)

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "id": 1,
    "terminalCode": "T001",
    "loginId": "user001",
    "userName": "김철수",
    "phoneNumber": "01012341234",
    "perLimitPrice": 500000,
    "dailyLimitPrice": 1000000,
    "annualLimitPrice": 50000000,
    "userStatus": "ACTIVE",
    "allowedInstallmentMonths": 12,
    "isProductNameMutable": true,
    "isPayerNameMutable": false,
    "deliveryPgCode": "WEROUTE",
    "deliveryRecurringMid": "MID001",
    "deliveryRecurringTid": "TID001",
    "deliveryManualMid": "MID002",
    "deliveryManualTid": "TID002",
    "deliveryFeeRate": 3.5,
    "deliveryAccountNumber": "1234567890",
    "deliveryAccountHolder": "김철수",
    "deliveryBankCode": "004",
    "rentPgCode": "WEROUTE",
    "rentRecurringMid": "RENTMID001",
    "rentRecurringTid": "RENTTID001",
    "rentManualMid": "RENTMID002",
    "rentManualTid": "RENTTID002",
    "rentFeeRate": 2.5,
    "rentAccountNumber": "9876543210",
    "rentAccountHolder": "김철수",
    "rentBankCode": "088",
    "rentApprovalStatus": "APPROVED",
    "rentApprovedDt": "2025-01-10T15:30:00",
    "memo": "테스트 회원",
    "registDt": "2025-01-01T10:00:00",
    "updateDt": "2025-01-18T10:00:00"
  }
}
```

---

### 3.4 회원 목록 조회

**Endpoint**: `GET /users`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| centerId | Long | O | - | 센터 ID (필수) |
| userStatus | String | X | - | 회원상태 (ACTIVE, INACTIVE, WITHDRAWN) |
| registDateFrom | Date | X | - | 등록일 시작 (yyyy-MM-dd) |
| registDateTo | Date | X | - | 등록일 종료 (yyyy-MM-dd) |
| loginId | String | X | - | 로그인ID (부분 검색) |
| userName | String | X | - | 회원명 (부분 검색) |
| phoneNumber | String | X | - | 연락처 (부분 검색) |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "totalElements": 100,
    "totalPages": 10,
    "currentPage": 0,
    "pageSize": 10,
    "users": [
      {
        "no": 100,
        "id": 1,
        "registDt": "2025-01-01T10:00:00",
        "loginId": "user001",
        "userName": "김철수",
        "userStatus": "ACTIVE",
        "allowedInstallmentMonths": 12,
        "deliveryFeeRate": 3.5,
        "rentApprovalStatus": "APPROVED",
        "rentFeeRate": 2.5,
        "phoneNumber": "01012341234",
        "perLimitPrice": 500000,
        "annualLimitPrice": 50000000
      }
    ]
  }
}
```

---

### 3.5 전체 회원 FCM 푸시 발송

**Endpoint**: `GET /users/fcm-all`

**인증**: 필요 (APP_ADMIN)

**설명**: 모든 회원에게 FCM 푸시 알림 발송

---

## 4. 결제 관리 API

### 4.1 결제 목록 조회

**Endpoint**: `GET /payments`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| centerId | Long | O | - | 센터 ID |
| paymentPurpose | String | O | - | 결제 목적 (DELIVERY_CHARGE, MONTHLY_RENT) |
| requestDateFrom | Date | X | - | 요청일 시작 (yyyy-MM-dd) |
| requestDateTo | Date | X | - | 요청일 종료 (yyyy-MM-dd) |
| paymentStatus | String | X | - | 결제상태 (PENDING, SUCCESS, FAILED, CANCELED) |
| userName | String | X | - | 회원명 (부분 검색) |
| approvalNumber | String | X | - | 승인번호 (부분 검색) |
| cardNumber | String | X | - | 카드번호 (부분 검색) |
| tid | String | X | - | TID (부분 검색) |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |

**요청 예시**:
```
GET /admin/api/v1/payments?centerId=1&paymentPurpose=DELIVERY_CHARGE&page=0&size=10
```

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "totalElements": 500,
    "totalPages": 50,
    "currentPage": 0,
    "pageSize": 10,
    "payments": [
      {
        "no": 500,
        "pg": "WEROUTE",
        "paymentPurpose": "DELIVERY_CHARGE",
        "requestDt": "2025-01-18 14:30:00",
        "approvalDt": "2025-01-18T14:30:15",
        "paymentStatus": "SUCCESS",
        "userName": "김철수",
        "paymentType": "RECURRING",
        "installmentMonths": 0,
        "approvalNumber": "12345678",
        "cardNumber": "1234-****-****-5678",
        "amount": 50000,
        "fee": 1750,
        "tid": "TID123456789",
        "resultMessage": "정상승인"
      }
    ]
  }
}
```

---

### 4.2 결제 취소

**Endpoint**: `POST /payments/{paymentId}/cancel`

**인증**: 필요 (APP_ADMIN)

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| paymentId | Long | O | 결제 ID |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": null
}
```

---

### 4.3 배달비 출금 목록 조회

**Endpoint**: `GET /payment-withdraws/delivery`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| centerId | Long | O | - | 센터 ID |
| requestDateFrom | Date | X | - | 요청일 시작 (yyyy-MM-dd) |
| requestDateTo | Date | X | - | 요청일 종료 (yyyy-MM-dd) |
| withdrawStatus | String | X | - | 출금상태 (PENDING, SUCCESS, FAILED) |
| userName | String | X | - | 회원명 (부분 검색) |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "totalElements": 200,
    "totalPages": 20,
    "currentPage": 0,
    "pageSize": 10,
    "withdraws": [
      {
        "no": 200,
        "settlementTransferId": 150,
        "requestDt": "2025-01-18 10:00:00",
        "withdrawStatus": "SUCCESS",
        "userName": "김철수",
        "accountHolder": "김철수",
        "bankCode": "004",
        "accountNumber": "1234567890",
        "amount": 48249,
        "withdrawFee": 1,
        "resultMessage": "정상처리"
      }
    ]
  }
}
```

---

### 4.4 월세 출금 목록 조회

**Endpoint**: `GET /payment-withdraws/rent`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**: 배달비 출금 목록 조회와 동일

**응답 예시**: 배달비 출금 목록 조회와 동일

---

### 4.5 수기 정산 완료 처리

**Endpoint**: `PATCH /payment-withdraws/{settlementTransferId}/manual-complete`

**인증**: 필요 (APP_ADMIN)

**설명**: FAILED 상태의 정산 건을 관리자가 수동으로 처리 후 상태 업데이트

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| settlementTransferId | Long | O | 정산 이체 ID |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "settlementTransferId": 150,
    "message": "수기 정산 완료 처리되었습니다."
  }
}
```

---

## 5. 공지사항 관리 API

### 5.1 공지사항 등록

**Endpoint**: `POST /notices`

**인증**: 필요 (APP_ADMIN)

**요청 본문**:
```json
{
  "noticeType": "GENERAL",
  "title": "서비스 점검 안내",
  "content": "2025년 1월 20일 02:00-04:00 정기 점검이 있습니다.",
  "author": "관리자"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 | 검증 규칙 |
|--------|------|------|------|-----------|
| noticeType | String | O | 공지 유형 (GENERAL, IMPORTANT, FIXED) | NotNull, Enum |
| title | String | O | 제목 | NotBlank, 최대 255자 |
| content | String | O | 내용 | NotBlank |
| author | String | O | 작성자 | NotBlank, 최대 100자 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "noticeId": 1
  }
}
```

---

### 5.2 공지사항 수정

**Endpoint**: `PUT /notices/{noticeId}`

**인증**: 필요 (APP_ADMIN)

**요청 본문**: 등록과 동일

---

### 5.3 공지사항 조회

**Endpoint**: `GET /notices/{noticeId}`

**인증**: 필요 (APP_ADMIN)

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "id": 1,
    "noticeType": "GENERAL",
    "title": "서비스 점검 안내",
    "content": "2025년 1월 20일 02:00-04:00 정기 점검이 있습니다.",
    "author": "관리자",
    "viewCount": 150,
    "registDt": "2025-01-18T10:00:00",
    "updateDt": "2025-01-18T10:00:00"
  }
}
```

---

### 5.4 공지사항 목록 조회

**Endpoint**: `GET /notices`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| noticeType | String | X | - | 공지 유형 |
| title | String | X | - | 제목 (부분 검색) |
| author | String | X | - | 작성자 (부분 검색) |
| registDateFrom | Date | X | - | 등록일 시작 |
| registDateTo | Date | X | - | 등록일 종료 |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |

---

### 5.5 공지사항 삭제

**Endpoint**: `DELETE /notices/{noticeId}`

**인증**: 필요 (APP_ADMIN)

---

## 6. 팝업 관리 API

### 6.1 팝업 등록

**Endpoint**: `POST /popup`

**인증**: 필요 (APP_ADMIN)

**설명**: 새 팝업 등록 시 기존 팝업은 자동 삭제됨 (한 번에 하나의 팝업만 존재)

**요청 본문**:
```json
{
  "popupStatus": "ACTIVE",
  "title": "이벤트 안내",
  "content": "신규 회원 할인 이벤트 진행 중!"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 | 검증 규칙 |
|--------|------|------|------|-----------|
| popupStatus | String | O | 팝업 상태 (ACTIVE, INACTIVE) | NotNull, Enum |
| title | String | O | 제목 | NotBlank, 최대 255자 |
| content | String | O | 내용 | NotBlank |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "popupId": 1
  }
}
```

---

### 6.2 팝업 조회

**Endpoint**: `GET /popup`

**인증**: 필요 (APP_ADMIN)

**설명**: 현재 등록된 팝업 정보를 조회합니다.

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "id": 1,
    "popupStatus": "ACTIVE",
    "title": "이벤트 안내",
    "content": "신규 회원 할인 이벤트 진행 중!",
    "registDt": "2025-01-18T10:00:00",
    "updateDt": "2025-01-18T10:00:00"
  }
}
```

---

## 7. 월세 심사 관리 API

### 7.1 월세 서류 목록 조회

**Endpoint**: `GET /rent/documents`

**인증**: 필요 (APP_ADMIN)

**설명**: 월세 서류 목록을 조회합니다. 검색 조건과 페이징을 지원합니다.

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| centerId | Long | O | - | 센터 ID |
| requestDateFrom | Date | X | - | 업로드일 시작 (yyyy-MM-dd) |
| requestDateTo | Date | X | - | 업로드일 종료 (yyyy-MM-dd) |
| status | String | X | - | 승인 상태 (PENDING, APPROVED, REJECTED, CANCELLED) |
| userName | String | X | - | 사용자명 (부분 검색) |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |
| sort | String | X | uploadedAt,DESC | 정렬 기준 |

**요청 예시**:
```
GET /admin/api/v1/rent/documents?centerId=1&status=PENDING&userName=김&page=0&size=10
```

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "documents": [
      {
        "no": 10,
        "documentId": 101,
        "userId": 5,
        "userName": "김철수",
        "loginId": "kim001",
        "phoneNumber": "01012345678",
        "status": "PENDING",
        "uploadedAt": "2025-01-18T10:30:00",
        "reviewedAt": null,
        "rejectedReason": null,
        "cancelledReason": null
      }
    ],
    "totalElements": 10,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

**응답 필드**:
| 필드명 | 타입 | 설명 |
|--------|------|------|
| no | Long | 목록 번호 (총 개수에서 역순) |
| documentId | Long | 서류 ID |
| userId | Long | 사용자 ID |
| userName | String | 사용자명 |
| loginId | String | 로그인 ID |
| phoneNumber | String | 연락처 |
| status | String | 승인 상태 (RentApprovalStatus) |
| uploadedAt | DateTime | 서류 업로드 일시 |
| reviewedAt | DateTime | 검토 완료 일시 (null 가능) |
| rejectedReason | String | 거부 사유 (null 가능) |
| cancelledReason | String | 해지 사유 (null 가능) |

---

### 7.2 월세 서류 상세 조회

**Endpoint**: `GET /rent/documents/{documentId}`

**인증**: 필요 (APP_ADMIN)

**설명**: 특정 월세 서류의 상세 정보를 조회합니다. 업로드된 이미지 경로를 포함합니다.

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| documentId | Long | O | 서류 ID |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "documentId": 101,
    "userId": 5,
    "userName": "김철수",
    "loginId": "kim001",
    "phoneNumber": "01012345678",
    "contractImagePath": "/uploads/rent/contract_101.jpg",
    "idCardImagePath": "/uploads/rent/idcard_101.jpg",
    "status": "PENDING",
    "uploadedAt": "2025-01-18T10:30:00",
    "reviewedAt": null,
    "reviewedBy": null,
    "rejectedReason": null,
    "cancelledReason": null
  }
}
```

**응답 필드**:
| 필드명 | 타입 | 설명 |
|--------|------|------|
| documentId | Long | 서류 ID |
| userId | Long | 사용자 ID |
| userName | String | 사용자명 |
| loginId | String | 로그인 ID |
| phoneNumber | String | 연락처 |
| contractImagePath | String | 임대차계약서 이미지 경로 |
| idCardImagePath | String | 신분증 이미지 경로 |
| status | String | 승인 상태 |
| uploadedAt | DateTime | 서류 업로드 일시 |
| reviewedAt | DateTime | 검토 완료 일시 (null 가능) |
| reviewedBy | Long | 검토한 관리자 ID (null 가능) |
| rejectedReason | String | 거부 사유 (null 가능) |
| cancelledReason | String | 해지 사유 (null 가능) |

---

### 7.3 월세 승인

**Endpoint**: `POST /rent/documents/{documentId}/approve`

**인증**: 필요 (APP_ADMIN)

**설명**: 월세 서류를 승인하고 사용자의 월세 결제 권한을 활성화합니다.

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| documentId | Long | O | 서류 ID |

**요청 본문**:
```json
{
  "adminId": 1,
  "rentPgCode": "WEROUTE",
  "rentRecurringMid": "RENTMID001",
  "rentRecurringTid": "RENTTID001",
  "rentManualMid": "RENTMID002",
  "rentManualTid": "RENTTID002",
  "rentFeeRate": 2.5,
  "rentBankCode": "088",
  "rentAccountNumber": "9876543210",
  "rentAccountHolder": "김철수"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| adminId | Long | O | 관리자 ID |
| rentPgCode | String | O | 월세 PG 코드 |
| rentRecurringMid | String | O | 월세 정기결제 MID |
| rentRecurringTid | String | O | 월세 정기결제 TID |
| rentManualMid | String | O | 월세 수기결제 MID |
| rentManualTid | String | O | 월세 수기결제 TID |
| rentFeeRate | BigDecimal | O | 월세 수수료율 (%) |
| rentBankCode | String | O | 월세 은행코드 |
| rentAccountNumber | String | O | 월세 계좌번호 |
| rentAccountHolder | String | O | 월세 계좌주 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "message": "승인되었습니다."
  }
}
```

---

### 7.4 월세 거부

**Endpoint**: `POST /rent/documents/{documentId}/reject`

**인증**: 필요 (APP_ADMIN)

**설명**: 월세 서류를 거부합니다.

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| documentId | Long | O | 서류 ID |

**요청 본문**:
```json
{
  "adminId": 1,
  "reason": "서류가 불명확합니다."
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| adminId | Long | O | 관리자 ID |
| reason | String | O | 거부 사유 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "message": "거부되었습니다."
  }
}
```

---

### 7.5 월세 해지

**Endpoint**: `POST /rent/users/{userId}/cancel`

**인증**: 필요 (APP_ADMIN)

**설명**: 승인된 사용자의 월세 결제 권한을 해지합니다.

**경로 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| userId | Long | O | 사용자 ID |

**요청 본문**:
```json
{
  "adminId": 1,
  "reason": "월세 연체로 인한 해지"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| adminId | Long | O | 관리자 ID |
| reason | String | O | 해지 사유 |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "message": "해지되었습니다."
  }
}
```

---

## 8. 센터 관리 API

### 8.1 센터 목록 조회

**Endpoint**: `GET /centers`

**인증**: 필요 (APP_ADMIN)

**설명**: 모든 센터의 정보를 조회합니다.

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "centers": [
      {
        "centerId": 1,
        "name": "서울센터",
        "pgCode": "WEROUTE",
        "recurringMid": "MID_RECURRING_001",
        "manualMid": "MID_MANUAL_001",
        "d1RecurringMid": "MID_D1_RECURRING_001",
        "d1ManualMid": "MID_D1_MANUAL_001"
      }
    ],
    "totalElements": 1,
    "totalPages": 1,
    "currentPage": 0,
    "pageSize": 10
  }
}
```

**응답 필드**:
| 필드명 | 타입 | 설명 |
|--------|------|------|
| centerId | Long | 센터 ID |
| name | String | 센터명 |
| pgCode | String | PG 코드 |
| recurringMid | String | D+0 정기결제 MID |
| manualMid | String | D+0 수기결제 MID |
| d1RecurringMid | String | D+1 정기결제 MID (null 가능) |
| d1ManualMid | String | D+1 수기결제 MID (null 가능) |

---

## 9. 머천트 출금 관리 API

### 9.1 머천트 출금 요청

**Endpoint**: `POST /merchant-withdrawals`

**인증**: 필요 (APP_ADMIN)

**설명**: 머천트 잔액을 지정된 계좌로 출금 요청합니다. OTP 인증이 필요합니다.

**요청 본문**:
```json
{
  "centerId": 1,
  "paymentPurpose": "DELIVERY_CHARGE",
  "bankCode": "004",
  "accountNumber": "12345678901234",
  "accountHolder": "홍길동",
  "withdrawalAmount": 1000000,
  "depositorName": "다배달",
  "transferMemo": "2025년 1월 정산",
  "otpCode": "123456"
}
```

**요청 필드**:
| 필드명 | 타입 | 필수 | 설명 | 검증 규칙 |
|--------|------|------|------|-----------|
| centerId | Long | O | 센터 ID | NotNull |
| paymentPurpose | String | O | 결제 목적 (DELIVERY_CHARGE, MONTHLY_RENT) | NotNull, Enum |
| bankCode | String | O | 은행 코드 | NotBlank |
| accountNumber | String | O | 계좌번호 | NotBlank |
| accountHolder | String | O | 예금주 | NotBlank |
| withdrawalAmount | Long | O | 출금 금액 | NotNull, Positive |
| depositorName | String | X | 입금자명 | - |
| transferMemo | String | X | 송금 메모 | - |
| otpCode | String | O | OTP 인증번호 | NotBlank |

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "id": 1,
    "centerId": 1,
    "paymentPurpose": "DELIVERY_CHARGE",
    "requestDt": "2025-01-18 10:00:00",
    "withdrawalStatus": "PENDING",
    "depositorName": "다배달",
    "transferMemo": "2025년 1월 정산",
    "withdrawalAmount": 1000000,
    "merchantBalance": 5000000,
    "bankCode": "004",
    "accountNumber": "12345678901234",
    "accountHolder": "홍길동",
    "requestResultCode": null,
    "requestResultMessage": null,
    "vaHistoryId": null,
    "historyResultCode": null,
    "historyResultMessage": null,
    "lastBalance": null,
    "withdrawFee": null,
    "completedAt": null,
    "retryCount": 0
  }
}
```

---

### 9.2 머천트 출금 목록 조회

**Endpoint**: `GET /merchant-withdrawals`

**인증**: 필요 (APP_ADMIN)

**설명**: 머천트 출금 요청 목록을 조회합니다.

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 기본값 | 설명 |
|----------|------|------|--------|------|
| centerId | Long | O | - | 센터 ID |
| paymentPurpose | String | O | - | 결제 목적 (DELIVERY_CHARGE, MONTHLY_RENT) |
| requestDateFrom | Date | X | - | 요청일 시작 (yyyy-MM-dd) |
| requestDateTo | Date | X | - | 요청일 종료 (yyyy-MM-dd) |
| withdrawalStatus | String | X | - | 출금 상태 (PENDING, PROCESSING, SUCCESS, FAILED, CANCELLED) |
| accountHolder | String | X | - | 예금주 (부분 검색) |
| bankCode | String | X | - | 은행 코드 |
| accountNumber | String | X | - | 계좌번호 (부분 검색) |
| page | Int | X | 0 | 페이지 번호 |
| size | Int | X | 10 | 페이지 크기 |

**요청 예시**:
```
GET /admin/api/v1/merchant-withdrawals?centerId=1&paymentPurpose=DELIVERY_CHARGE&page=0&size=10
```

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "totalElements": 50,
    "totalPages": 5,
    "currentPage": 0,
    "pageSize": 10,
    "merchantBalance": 5000000,
    "totalWithdrawalAmount": 10000000,
    "withdrawals": [
      {
        "no": 50,
        "id": 100,
        "requestDt": "2025-01-18 10:00:00",
        "withdrawalStatus": "SUCCESS",
        "paymentPurpose": "DELIVERY_CHARGE",
        "depositorName": "다배달",
        "transferMemo": "2025년 1월 정산",
        "withdrawalAmount": 1000000,
        "merchantBalance": 4000000,
        "bankCode": "국민은행",
        "accountNumber": "12345678901234",
        "accountHolder": "홍길동",
        "requestResultCode": "00",
        "requestResultMessage": "정상처리",
        "historyResultCode": "00",
        "historyResultMessage": "정상완료",
        "lastBalance": 4000000,
        "withdrawFee": 500,
        "completedAt": "2025-01-18 10:05:00"
      }
    ]
  }
}
```

---

## 10. 포트원 API

### 10.1 계좌 예금주 조회

**Endpoint**: `GET /portone/vbanks/holder`

**인증**: 필요 (APP_ADMIN)

**설명**: 포트원 API를 통해 계좌의 예금주 정보 조회

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| bankCode | String | O | 은행 코드 (예: "004") |
| bankNum | String | O | 계좌번호 |

**요청 예시**:
```
GET /admin/api/v1/portone/vbanks/holder?bankCode=004&bankNum=12345678901234
```

---

## 11. 파일 업로드 API

### 11.1 이미지 업로드 (CKEditor용)

**Endpoint**: `POST /upload/image`

**인증**: 필요 (APP_ADMIN)

**Content-Type**: `multipart/form-data`

**요청 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| image | File | O | 이미지 파일 |

**지원 형식**: image/jpeg, image/png, image/jpg, image/gif, image/webp

**최대 크기**: 10MB

**응답 예시** (성공 - 200 OK):
```json
{
  "data": {
    "imageUrl": "https://s3.amazonaws.com/bucket/editor/images/filename.jpg"
  }
}
```

---

### 11.2 이미지 다운로드

**Endpoint**: `GET /download/image`

**인증**: 필요 (APP_ADMIN)

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| imageUrl | String | O | 다운로드할 이미지 URL |

**설명**: S3 URL과 외부 URL 모두 지원

**응답**: 파일 스트림 (Content-Disposition: attachment)

---

## Enum 값 정의

### UserStatus (회원상태)
- `ACTIVE`: 활성
- `INACTIVE`: 비활성
- `WITHDRAWN`: 탈퇴

### PaymentPurpose (결제 목적)
- `DELIVERY_CHARGE`: 배달비
- `MONTHLY_RENT`: 월세

### PaymentStatus (결제 상태)
- `PENDING`: 대기중
- `SUCCESS`: 성공
- `FAILED`: 실패
- `CANCELED`: 취소됨

### PaymentType (결제 유형)
- `RECURRING`: 정기결제
- `MANUAL`: 수기결제

### WithdrawalStatus (출금 상태)
- `PENDING`: 대기중
- `PROCESSING`: 처리중
- `SUCCESS`: 성공
- `FAILED`: 실패
- `CANCELLED`: 취소됨

### RentApprovalStatus (월세 승인 상태)
- `NOT_APPLIED`: 미신청
- `PENDING`: 승인 대기
- `APPROVED`: 승인
- `REJECTED`: 거부
- `CANCELLED`: 해지

### NoticeType (공지 유형)
- `GENERAL`: 일반
- `IMPORTANT`: 중요
- `FIXED`: 고정

### PopupStatus (팝업 상태)
- `ACTIVE`: 활성
- `INACTIVE`: 비활성

### PG (결제 게이트웨이)
- `WEROUTE`: 위루트

---

## 공통 에러 응답

모든 API는 에러 발생 시 다음 형식의 응답을 반환합니다.

```json
{
  "message": "에러 메시지",
  "status": 400,
  "errorCode": "ERROR_CODE",
  "timeStamp": "2025-01-18T14:30:00"
}
```

### 주요 에러 코드

| HTTP 상태 | errorCode | 설명 |
|-----------|-----------|------|
| 400 | BAD_REQUEST | 잘못된 요청 (검증 실패) |
| 401 | UNAUTHORIZED | 인증 실패 |
| 403 | FORBIDDEN | 권한 없음 |
| 404 | NOT_FOUND | 리소스를 찾을 수 없음 |
| 500 | INTERNAL_SERVER_ERROR | 서버 내부 오류 |

---

## 페이징 공통 사항

### 요청 파라미터
- `page`: 페이지 번호 (0부터 시작, 기본값: 0)
- `size`: 페이지 크기 (기본값: 10)
- 정렬: ID 내림차순 (최신 우선)

### 응답 구조
```json
{
  "totalElements": 100,
  "totalPages": 10,
  "currentPage": 0,
  "pageSize": 10,
  "items": []
}
```

---

## 변경 이력

| 버전 | 날짜 | 변경 내용 |
|------|------|-----------|
| 1.0 | 2025-01-18 | 초기 버전 작성 |
| 1.1 | 2025-01-22 | 월세 심사 관리 API 상세 명세 추가 (7.1~7.5) |
| 1.2 | 2025-01-22 | 전체 API 현행화 - 팝업 API 수정, 머천트 출금 API 추가 (9.1~9.2), 센터 목록 조회 API 응답 필드 추가, 회원 관리 API memo 필드 및 phoneNumber 검색 조건 추가, WithdrawalStatus enum 추가 |

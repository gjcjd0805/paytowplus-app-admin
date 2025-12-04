// 숫자를 천 단위 구분자로 포맷팅
export function formatNumber(value: number | string): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '0';
  return num.toLocaleString('ko-KR');
}

// 날짜 포맷팅 (yyyy-MM-dd HH:mm:ss)
export function formatDateTime(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '-';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 날짜 포맷팅 (yyyy-MM-dd)
export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

// 상태 한글 변환
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    // 회원 상태
    ACTIVE: '활성',
    TERMINATED: '정지',

    // 결제 상태
    PENDING: '대기',
    SUCCESS: '완료',
    MANUAL_SUCCESS: '수기완료',
    FAILED: '실패',
    CANCELLED: '취소',

    // 출금 상태
    REQUESTED: '요청완료',

    // 결제 유형
    RECURRING: '정기',
    MANUAL: '수기',

    // 결제 목적
    DELIVERY_CHARGE: '배달비',
    MONTHLY_RENT: '월세',

    // PG
    WEROUTE: '위루트',

    // 월세 승인 상태
    NOT_APPLIED: '미신청',
    REJECTED: '거부',
    APPROVED: '승인',

    // 공지사항 타입
    GENERAL: '일반',
    IMPORTANT: '중요',
    FIXED: '고정',

    // 팝업 상태
    INACTIVE: '미적용',
  };
  return statusMap[status] || status;
}

// 카드번호 마스킹
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber || cardNumber.length < 8) return cardNumber;
  return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1-****-****-$4');
}

// 전화번호 포맷팅
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3');
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
  }

  return phone;
}

// 은행코드를 은행명으로 변환
export function getBankName(bankCode: string): string {
  const bankMap: Record<string, string> = {
    '004': '국민은행',
    '020': '우리은행',
    '081': '하나은행',
    '088': '신한은행',
    '003': '기업은행',
    '011': '농협은행',
    '023': 'SC제일은행',
    '027': '씨티은행',
    '031': '대구은행',
    '032': '부산은행',
    '034': '광주은행',
    '035': '제주은행',
    '037': '전북은행',
    '039': '경남은행',
    '045': '새마을금고',
    '048': '신협',
    '071': '우체국',
    '089': '케이뱅크',
    '090': '카카오뱅크',
  };
  return bankMap[bankCode] || bankCode;
}

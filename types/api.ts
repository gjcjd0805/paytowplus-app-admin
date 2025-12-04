// ========== 공통 응답 타입 ==========
export interface SuccessResponse<T = unknown> {
  success: true;
  message: string;
  status: number;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  status: number;
  data: null;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// ========== Enum 타입 ==========
export type UserStatus = 'ACTIVE' | 'TERMINATED';
export type PG = 'WEROUTE';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
export type PaymentType = 'RECURRING' | 'MANUAL';
export type PaymentPurpose = 'DELIVERY_CHARGE' | 'MONTHLY_RENT';
export type SettlementStatus = 'PENDING' | 'REQUESTED' | 'SUCCESS' | 'FAILED' | 'MANUAL_SUCCESS';
export type WithdrawalStatus = 'PENDING' | 'SUCCESS' | 'FAILED';
export type NoticeType = 'GENERAL' | 'IMPORTANT' | 'FIXED';
export type PopupStatus = 'INACTIVE' | 'ACTIVE';
export type RentApprovalStatus = 'NOT_APPLIED' | 'PENDING' | 'REJECTED' | 'APPROVED' | 'CANCELLED';

// ========== 어드민 유저 관련 타입 ==========
export interface AdminUser {
  id: number;
  loginId: string;
  name: string;
  tel?: string;
  phone: string;
  email?: string;
  registDt: string;
  updateDt: string;
}

export interface AdminLoginRequest {
  loginId: string;
  password: string;
}

export interface AdminLoginResponse {
  token: string;
  adminUser: AdminUser;
}

export interface AdminUserCreateRequest {
  loginId: string;
  password: string;
  name: string;
  tel?: string;
  phone: string;
  email?: string;
}

export interface AdminUserUpdateRequest {
  password?: string;
  name: string;
  tel?: string;
  phone: string;
  email?: string;
}

export interface AdminUserListItem {
  id: number;
  no: number;
  registDt: string;
  loginId: string;
  name: string;
  phone: string;
  email?: string;
}

export interface AdminUserListResponse {
  adminUsers: AdminUserListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface AdminUserSearchParams {
  page?: number;
  size?: number;
  loginId?: string;
  name?: string;
  phone?: string;
  registDateFrom?: string;
  registDateTo?: string;
}

// ========== 회원 관련 타입 ==========
// 회원 기본정보
export interface UserBasicInfo {
  id: number;
  terminalCode: string;
  loginId: string;
  userName: string;
  depositorName: string;
  ownerIdentityNumber: string;
  phoneNumber: string;
  userStatus: string;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;
  memo: string | null;
  pg: PG;  // PG 코드 (회원 레벨로 통합)
  registDt: string;
  updateDt: string;
  // PIN 관련 정보
  pinEnabled: boolean;
  pinSetAt: string | null;
  pinFailCount: number;
  pinLocked: boolean;
  pinLockedAt: string | null;
}

// 배달비 설정 정보
export interface DeliveryConfigInfo {
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  allowedInstallmentMonths: number;
  recurringMid: string;
  recurringTid: string;
  manualMid: string;
  manualTid: string;
  feeRate: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

// 월세 설정 정보
export interface RentConfigInfo {
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  allowedInstallmentMonths: number;
  recurringMid: string;
  recurringTid: string;
  manualMid: string;
  manualTid: string;
  feeRate: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  approvalStatus: string;
  approvedDt: string | null;
  // 서류 이미지
  contractImagePath: string | null;
  idCardImagePath: string | null;
  // 약관 동의 정보
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  electronicFinanceAgreed: boolean;
  paymentAgreed: boolean;
  marketingAgreed: boolean;
  personalizedAdAgreed: boolean;
  termsAgreedAt: string | null;
  // 자동결제 설정
  autoPaymentEnabled: boolean;
  autoPaymentAmount: number | null;
  autoPaymentFee: number | null;
  autoPaymentTransferFee: number | null;
  autoPaymentSettlementAmount: number | null;
  autoPaymentDayOfMonth: number | null;
  autoTransferDayOfMonth: number | null;
  autoPaymentStartMonth: string | null;
  autoPaymentEndMonth: string | null;
  autoPaymentCardId: number | null;
}

// 자동결제 이력
export interface AutoPaymentHistoryInfo {
  id: number;
  targetMonth: string;
  paymentDate: string;
  transferDate: string;
  amount: number;
  fee: number;
  transferFee: number;
  settlementAmount: number;
  cardId: number;
  status: string;
  failureReason: string | null;
  retryCount: number;
  processedAt: string | null;
  createdDt: string;
}

// 자동결제 이력 목록 응답
export interface AutoPaymentHistoryListResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  histories: AutoPaymentHistoryInfo[];
}

// 회원 상세 조회 응답 (섹션별 분리)
export interface UserDetailResponse {
  basic: UserBasicInfo;
  deliveryConfig: DeliveryConfigInfo | null;
  rentConfig: RentConfigInfo | null;
}

// 기존 User 인터페이스 (호환성 유지, 추후 제거)
export interface User {
  id: number;
  terminalCode: string;
  loginId: string;
  userName: string;
  depositorName: string;
  ownerIdentityNumber: string;
  phoneNumber: string;
  userStatus: string;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;

  // 배달비 한도 관련
  deliveryPerLimitPrice: number | null;
  deliveryDailyLimitPrice: number | null;
  deliveryAnnualLimitPrice: number | null;
  deliveryAllowedInstallmentMonths: number | null;

  // 배달비 PG 관련
  deliveryPgCode: string | null;
  deliveryRecurringMid: string | null;
  deliveryRecurringTid: string | null;
  deliveryManualMid: string | null;
  deliveryManualTid: string | null;
  deliveryFeeRate: number | null;
  deliveryAccountNumber: string | null;
  deliveryAccountHolder: string | null;
  deliveryBankCode: string | null;

  // 월세 한도 관련
  rentPerLimitPrice: number | null;
  rentDailyLimitPrice: number | null;
  rentAnnualLimitPrice: number | null;
  rentAllowedInstallmentMonths: number | null;

  // 월세 PG 관련
  rentPgCode: string | null;
  rentRecurringMid: string | null;
  rentRecurringTid: string | null;
  rentManualMid: string | null;
  rentManualTid: string | null;
  rentFeeRate: number | null;
  rentAccountNumber: string | null;
  rentAccountHolder: string | null;
  rentBankCode: string | null;
  rentApprovalStatus: string;
  rentApprovedDt: string | null;

  memo?: string;
  registDt: string;
  updateDt: string;
}

// 회원 등록 요청 (기본정보만)
export interface UserCreateRequest {
  centerId: number;
  pg: PG;  // PG 코드 (회원 레벨로 통합)
  loginId: string;
  password: string;
  userName: string;
  depositorName: string;
  ownerIdentityNumber: string;
  phoneNumber: string;
  userStatus: UserStatus;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;
  memo?: string;
}

// 회원 수정 요청 (기본정보만)
export interface UserUpdateRequest {
  password?: string;
  userName: string;
  depositorName: string;
  ownerIdentityNumber: string;
  phoneNumber: string;
  userStatus: UserStatus;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;
  memo?: string;
}

// 배달비 설정 생성/수정 요청
export interface DeliveryConfigRequest {
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  allowedInstallmentMonths: number;
  recurringMid: string;
  recurringTid: string;
  manualMid: string;
  manualTid: string;
  feeRate: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

// 월세 설정 생성/수정 요청
export interface RentConfigRequest {
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  allowedInstallmentMonths: number;
  recurringMid: string;
  recurringTid: string;
  manualMid: string;
  manualTid: string;
  feeRate: number;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
}

export interface UserListItem {
  no: number;
  id: number;
  registDt: string;
  loginId: string;
  userName: string;
  userStatus: string;
  phoneNumber: string;

  // 배달비 한도
  deliveryPerLimitPrice: number | null;
  deliveryAnnualLimitPrice: number | null;
  deliveryAllowedInstallmentMonths: number | null;
  deliveryFeeRate: number | null;

  // 월세 한도
  rentPerLimitPrice: number | null;
  rentAnnualLimitPrice: number | null;
  rentAllowedInstallmentMonths: number | null;
  rentApprovalStatus: string | null;
  rentFeeRate: number | null;
}

export interface UserListResponse {
  users: UserListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface UserSearchParams {
  centerId: number;
  page?: number;
  size?: number;
  userStatus?: UserStatus;
  registDateFrom?: string;
  registDateTo?: string;
  loginId?: string;
  userName?: string;
  phoneNumber?: string;
}

// ========== 결제 관련 타입 ==========
export interface PaymentListItem {
  no: number;
  paymentId: number;
  pg: PG;
  paymentPurpose: PaymentPurpose;
  requestDt: string;
  approvalDt?: string;
  paymentStatus: PaymentStatus;
  withdrawStatus?: SettlementStatus;  // 출금상태
  scheduledSettlementDt?: string;     // 이체예정일시
  userName: string;
  paymentType: PaymentType;
  installmentMonths: number;
  approvalNumber: string;
  cardNumber: string;
  amount: number;
  fee: number;
  tid: string;
  resultMessage: string;
}

export interface PaymentListResponse {
  payments: PaymentListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface PaymentSearchParams {
  centerId: number;
  page?: number;
  size?: number;
  paymentPurpose?: PaymentPurpose;
  requestDateFrom?: string;
  requestDateTo?: string;
  paymentStatus?: PaymentStatus;
  withdrawStatus?: SettlementStatus;
  userName?: string;
  approvalNumber?: string;
  cardNumber?: string;
  tid?: string;
}

// ========== 출금 관련 타입 ==========
export interface WithdrawListItem {
  no: number;
  settlementTransferId: number;
  requestDt: string;
  withdrawStatus: SettlementStatus;
  userName: string;
  paymentType: PaymentType;
  installmentMonths: number;
  approvalNumber: string;
  cardNumber: string;
  amount: number;
  fee: number;
  transferFee: number;
  settlementAmount: number;
  scheduledSettlementDt: string;
  resultMessage: string;
}

// 수기 완료 처리 응답
export interface ManualCompleteResponse {
  settlementTransferId: number;
  status: string;
  completedDt: string;
}

export interface WithdrawListResponse {
  withdraws: WithdrawListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  merchantBalance: number;
  totalAmount: number;
  totalFee: number;
  totalSettlementAmount: number;
}

export interface WithdrawSearchParams {
  centerId: number;
  page?: number;
  size?: number;
  requestDateFrom?: string;
  requestDateTo?: string;
  withdrawStatus?: SettlementStatus;
  paymentType?: PaymentType;
  userName?: string;
  approvalNumber?: string;
  cardNumber?: string;
}

// ========== 월세 신청 관련 타입 ==========
export interface RentApplicationListItem {
  documentId: number;
  userId: number;
  userName: string;
  loginId: string;
  phoneNumber: string;
  status: RentApprovalStatus;
  uploadedAt: string;
  reviewedAt?: string;
  rejectedReason?: string;
  cancelledReason?: string;
  // 약관 동의 여부
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  electronicFinanceAgreed: boolean;
  paymentAgreed: boolean;
  marketingAgreed: boolean;
  personalizedAdAgreed: boolean;
  termsAgreedAt?: string;
  // 임대인 계좌 정보
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export interface RentApplicationDetail {
  documentId: number;
  userId: number;
  userName: string;
  loginId: string;
  phoneNumber: string;
  contractImagePath: string;
  idCardImagePath: string;
  status: RentApprovalStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  rejectedReason?: string;
  cancelledReason?: string;
  // 약관 동의 여부
  serviceTermsAgreed: boolean;
  privacyPolicyAgreed: boolean;
  electronicFinanceAgreed: boolean;
  paymentAgreed: boolean;
  marketingAgreed: boolean;
  personalizedAdAgreed: boolean;
  termsAgreedAt?: string;
  // 임대인 계좌 정보
  bankCode?: string;
  accountNumber?: string;
  accountHolder?: string;
}

export interface ApproveRequest {
  adminId: number;
  // 한도 설정
  rentPerLimitPrice: number;
  rentDailyLimitPrice: number;
  rentAnnualLimitPrice: number;
  rentAllowedInstallmentMonths: number;
  // PG 설정 (pgCode는 사용자의 AppUser.pg 값을 자동 사용)
  rentRecurringMid: string;
  rentRecurringTid: string;
  rentManualMid: string;
  rentManualTid: string;
  rentFeeRate: number;
  // 임대인 계좌 정보
  rentBankCode: string;
  rentAccountNumber: string;
  rentAccountHolder: string;
}

export interface RejectRequest {
  adminId: number;
  reason: string;
}

export interface CancelRequest {
  adminId: number;
  reason: string;
}

export interface RentApplicationListResponse {
  documents: RentApplicationListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface RentApplicationSearchParams {
  centerId: number;
  page?: number;
  size?: number;
  status?: RentApprovalStatus;
  uploadDateFrom?: string;
  uploadDateTo?: string;
  userName?: string;
  loginId?: string;
  phoneNumber?: string;
}

// ========== 센터 관련 타입 ==========
export interface Center {
  centerId: number;
  name: string;
  pgCode: PG;
  recurringMid: string;
  manualMid: string;
  d1RecurringMid?: string;
  d1ManualMid?: string;
}

export interface CenterListResponse {
  centers: Center[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

// ========== 공지사항 관련 타입 ==========
export interface Notice {
  id: number;
  noticeType: NoticeType;
  title: string;
  content: string;
  author: string;
  viewCount: number;
  registDt: string;
  updateDt: string;
}

export interface NoticeCreateRequest {
  noticeType: NoticeType;
  title: string;
  content: string;
  author: string;
}

export interface NoticeUpdateRequest {
  noticeType: NoticeType;
  title: string;
  content: string;
  author: string;
}

export interface NoticeListItem {
  no: number;
  id: number;
  noticeType: NoticeType;
  title: string;
  author: string;
  registDt: string;
  viewCount: number;
}

export interface NoticeListResponse {
  notices: NoticeListItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface NoticeSearchParams {
  page?: number;
  size?: number;
  noticeType?: NoticeType;
  title?: string;
  content?: string;
  author?: string;
  registDateFrom?: string;
  registDateTo?: string;
}

// ========== 팝업 관련 타입 ==========
export interface Popup {
  popupId: number;
  popupStatus: PopupStatus;
  title: string;
  content: string;
}

export interface PopupCreateRequest {
  popupStatus: PopupStatus;
  title: string;
  content: string;
}

// ========== 머천트 출금 관련 타입 ==========
export interface MerchantWithdrawalListItem {
  no: number;
  id: number;
  requestDt: string;
  withdrawalStatus: WithdrawalStatus;
  paymentPurpose: PaymentPurpose;
  depositorName: string | null;
  transferMemo: string | null;
  withdrawalAmount: number;
  merchantBalance: number | null;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  requestResultCode: string | null;
  requestResultMessage: string | null;
  historyResultCode: string | null;
  historyResultMessage: string | null;
  lastBalance: number | null;
  withdrawFee: number | null;
  completedAt: string | null;
}

export interface MerchantWithdrawalListResponse {
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  merchantBalance: number;
  totalWithdrawalAmount: number;
  withdrawals: MerchantWithdrawalListItem[];
}

export interface MerchantWithdrawalSearchParams {
  centerId: number;
  paymentPurpose: PaymentPurpose;
  page?: number;
  size?: number;
  requestDateFrom?: string;
  requestDateTo?: string;
  withdrawalStatus?: WithdrawalStatus;
  accountHolder?: string;
  bankCode?: string;
  accountNumber?: string;
}

export interface CreateMerchantWithdrawalRequest {
  centerId: number;
  paymentPurpose: PaymentPurpose;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  withdrawalAmount: number;
  depositorName?: string;
  transferMemo?: string;
  otpCode: string;
}

export interface MerchantWithdrawalResponse {
  id: number;
  centerId: number;
  paymentPurpose: PaymentPurpose;
  requestDt: string;
  withdrawalStatus: WithdrawalStatus;
  depositorName: string | null;
  transferMemo: string | null;
  withdrawalAmount: number;
  merchantBalance: number | null;
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  requestResultCode: string | null;
  requestResultMessage: string | null;
  vaHistoryId: number | null;
  historyResultCode: string | null;
  historyResultMessage: string | null;
  lastBalance: number | null;
  withdrawFee: number | null;
  completedAt: string | null;
  retryCount: number;
}

// ========== 월세 자동결제 회원 관련 타입 ==========
export interface RentAutoPaymentUserItem {
  no: number;
  userId: number;
  loginId: string;
  userName: string;
  phoneNumber: string;
  // 자동결제 설정
  autoPaymentEnabled: boolean;
  autoPaymentAmount: number | null;
  autoPaymentFee: number | null;
  autoPaymentTransferFee: number | null;
  autoPaymentSettlementAmount: number | null;
  autoPaymentDayOfMonth: number | null;
  autoTransferDayOfMonth: number | null;
  autoPaymentStartMonth: string | null;
  autoPaymentEndMonth: string | null;
  autoPaymentCardId: number | null;
  // 임대인 계좌 정보
  bankCode: string;
  accountNumber: string;
  accountHolder: string;
  // 수수료율
  feeRate: number;
  // 승인일
  approvedAt: string | null;
}

export interface RentAutoPaymentListResponse {
  users: RentAutoPaymentUserItem[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface RentAutoPaymentSearchParams {
  centerId: number;
  page?: number;
  size?: number;
  userName?: string;
  loginId?: string;
  phoneNumber?: string;
  autoPaymentEnabled?: boolean;
  autoPaymentDayOfMonth?: number;
}

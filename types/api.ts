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
export type SettlementStatus = 'PENDING' | 'REQUESTED' | 'SUCCESS' | 'FAILED';
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
export interface User {
  id: number;
  terminalCode: string;
  loginId: string;
  userName: string;
  phoneNumber: string;
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  userStatus: string;
  allowedInstallmentMonths: number;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;

  // 배달비 관련
  deliveryPgCode: string;
  deliveryRecurringMid: string;
  deliveryRecurringTid: string;
  deliveryManualMid: string;
  deliveryManualTid: string;
  deliveryFeeRate: number;
  deliveryAccountNumber: string;
  deliveryAccountHolder: string;
  deliveryBankCode: string;

  // 월세 관련
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

export interface UserCreateRequest {
  centerId: number;
  loginId: string;
  password: string;
  userName: string;
  phoneNumber: string;
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  userStatus: UserStatus;
  allowedInstallmentMonths: number;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;

  // 배달비 관련
  deliveryPgCode: PG;
  deliveryRecurringMid: string;
  deliveryRecurringTid: string;
  deliveryManualMid: string;
  deliveryManualTid: string;
  deliveryFeeRate: number;
  deliveryAccountNumber: string;
  deliveryAccountHolder: string;
  deliveryBankCode: string;

  // 월세 관련 (선택)
  rentPgCode?: PG;
  rentRecurringMid?: string;
  rentRecurringTid?: string;
  rentManualMid?: string;
  rentManualTid?: string;
  rentFeeRate?: number;
  rentAccountNumber?: string;
  rentAccountHolder?: string;
  rentBankCode?: string;
  rentApprovalStatus?: RentApprovalStatus;

  memo?: string;
}

export interface UserUpdateRequest {
  password?: string;
  userName: string;
  phoneNumber: string;
  perLimitPrice: number;
  dailyLimitPrice: number;
  annualLimitPrice: number;
  userStatus: UserStatus;
  allowedInstallmentMonths: number;
  isProductNameMutable: boolean;
  isPayerNameMutable: boolean;

  // 배달비 관련
  deliveryPgCode: PG;
  deliveryRecurringMid: string;
  deliveryRecurringTid: string;
  deliveryManualMid: string;
  deliveryManualTid: string;
  deliveryFeeRate: number;
  deliveryAccountNumber: string;
  deliveryAccountHolder: string;
  deliveryBankCode: string;

  // 월세 관련 (선택)
  rentPgCode?: PG;
  rentRecurringMid?: string;
  rentRecurringTid?: string;
  rentManualMid?: string;
  rentManualTid?: string;
  rentFeeRate?: number;
  rentAccountNumber?: string;
  rentAccountHolder?: string;
  rentBankCode?: string;
  rentApprovalStatus?: RentApprovalStatus;

  memo?: string;
}

export interface UserListItem {
  no: number;
  id: number;
  registDt: string;
  loginId: string;
  userName: string;
  userStatus: string;
  allowedInstallmentMonths: number;
  deliveryFeeRate: number;
  rentApprovalStatus: string;
  rentFeeRate: number | null;
  phoneNumber: string;
  perLimitPrice: number;
  annualLimitPrice: number;
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
  pg: PG;
  paymentPurpose: PaymentPurpose;
  requestDt: string;
  approvalDt?: string;
  paymentStatus: PaymentStatus;
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
  requestDateFrom?: string;
  requestDateTo?: string;
  paymentStatus?: PaymentStatus;
  userName?: string;
  approvalNumber?: string;
  cardNumber?: string;
  tid?: string;
}

// ========== 출금 관련 타입 ==========
export interface WithdrawListItem {
  no: number;
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
}

export interface RentApplicationDetail {
  documentId: number;
  userId: number;
  userName: string;
  loginId: string;
  phoneNumber: string;
  contractImagePath: string;
  idCardImagePath: string;
  bankbookImagePath: string;
  status: RentApprovalStatus;
  uploadedAt: string;
  reviewedAt?: string;
  reviewedBy?: number;
  rejectedReason?: string;
  cancelledReason?: string;
}

export interface ApproveRequest {
  adminId: number;
  rentPgCode?: string;
  rentRecurringMid?: string;
  rentRecurringTid?: string;
  rentManualMid?: string;
  rentManualTid?: string;
  rentFeeRate?: number;
  rentBankCode?: string;
  rentAccountNumber?: string;
  rentAccountHolder?: string;
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

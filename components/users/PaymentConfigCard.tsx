'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/utils/format';
import { usersApi } from '@/lib/api';
import type { RentConfigInfo, AutoPaymentHistoryInfo } from '@/types/api';

// 은행 코드 매핑
const BANK_MAP: Record<string, string> = {
  '004': 'KB국민',
  '003': '기업',
  '011': '농협',
  '020': '우리',
  '088': '신한',
  '081': '하나',
  '023': 'SC제일',
  '027': '씨티',
  '031': '대구',
  '032': '부산',
  '034': '광주',
  '035': '제주',
  '037': '전북',
  '039': '경남',
  '045': '새마을',
  '048': '신협',
  '050': '저축',
  '071': '우체국',
  '090': '카카오',
  '089': '케이뱅크',
  '092': '토스',
};

export type PaymentConfigType = 'delivery' | 'rent';

export interface PaymentConfigData {
  type: PaymentConfigType;
  // 한도 설정
  perLimitPrice: number | null;
  dailyLimitPrice: number | null;
  annualLimitPrice: number | null;
  allowedInstallmentMonths: number | null;
  // PG 설정
  pgCode: string | null;
  recurringMid: string | null;
  recurringTid: string | null;
  manualMid: string | null;
  manualTid: string | null;
  feeRate: number | null;
  // 계좌 정보
  bankCode: string | null;
  accountNumber: string | null;
  accountHolder: string | null;
  // 월세 전용
  approvalStatus?: string;
  approvedDt?: string | null;
  // 계좌 인증 상태
  accountVerified?: boolean;
}

interface PaymentConfigCardProps {
  config: PaymentConfigData;
  onEdit: () => void;
  onCancel?: () => void; // 월세 해지용
  isNew?: boolean; // 신규 등록 모드
  // 월세 상세 정보용
  userId?: number;
  rentConfigInfo?: RentConfigInfo | null;
}

const CONFIG_LABELS: Record<PaymentConfigType, { icon: string; title: string; color: string }> = {
  delivery: {
    icon: '🚚',
    title: '배달비',
    color: 'blue',
  },
  rent: {
    icon: '🏠',
    title: '월세',
    color: 'green',
  },
};

const APPROVAL_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  NOT_APPLIED: { label: '미신청', className: 'bg-gray-100 text-gray-600' },
  PENDING: { label: '승인대기', className: 'bg-yellow-100 text-yellow-800' },
  REJECTED: { label: '거부', className: 'bg-red-100 text-red-800' },
  APPROVED: { label: '승인', className: 'bg-blue-100 text-blue-800' },
  CANCELLED: { label: '해지', className: 'bg-gray-100 text-gray-800' },
};

const AUTO_PAYMENT_STATUS_LABELS: Record<string, { label: string; className: string }> = {
  PENDING: { label: '대기', className: 'bg-gray-100 text-gray-600' },
  PROCESSING: { label: '처리중', className: 'bg-blue-100 text-blue-800' },
  SUCCESS: { label: '성공', className: 'bg-green-100 text-green-800' },
  FAILED: { label: '실패', className: 'bg-red-100 text-red-800' },
  RETRY_PENDING: { label: '재시도대기', className: 'bg-yellow-100 text-yellow-800' },
  SKIPPED: { label: '건너뜀', className: 'bg-gray-100 text-gray-500' },
};

export default function PaymentConfigCard({ config, onEdit, onCancel, isNew, userId, rentConfigInfo }: PaymentConfigCardProps) {
  const { icon, title, color } = CONFIG_LABELS[config.type];
  const hasData = config.perLimitPrice !== null || config.pgCode !== null;

  // 월세인 경우 승인 상태 확인
  const approvalStatus = config.type === 'rent' ? config.approvalStatus : null;
  const statusInfo = approvalStatus ? APPROVAL_STATUS_LABELS[approvalStatus] : null;

  // 월세 상세 탭 상태
  const [activeTab, setActiveTab] = useState<'terms' | 'documents' | 'autoPayment' | 'history'>('terms');
  const [histories, setHistories] = useState<AutoPaymentHistoryInfo[]>([]);
  const [isLoadingHistories, setIsLoadingHistories] = useState(false);
  const [historyPage, setHistoryPage] = useState(0);
  const [totalHistoryPages, setTotalHistoryPages] = useState(0);

  // 자동결제 이력 로드
  const loadHistories = async (page: number = 0) => {
    if (!userId) return;
    setIsLoadingHistories(true);
    try {
      const response = await usersApi.getAutoPaymentHistories(userId, page, 5);
      setHistories(response.histories);
      setTotalHistoryPages(response.totalPages);
      setHistoryPage(response.currentPage);
    } catch (err) {
      console.error('자동결제 이력 로드 실패:', err);
    } finally {
      setIsLoadingHistories(false);
    }
  };

  useEffect(() => {
    if (config.type === 'rent' && activeTab === 'history' && userId) {
      loadHistories(0);
    }
  }, [activeTab, userId, config.type]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  // 데이터가 없는 경우 (설정 추가 카드)
  if (!hasData) {
    const addLabel = config.type === 'delivery' ? '배달비 결제 설정 추가' : '월세 결제 설정 추가';
    const borderHover = config.type === 'delivery' ? 'hover:border-blue-400' : 'hover:border-green-400';

    return (
      <div
        onClick={onEdit}
        className={`border-2 border-dashed border-gray-300 rounded-lg p-6 cursor-pointer ${borderHover} hover:bg-gray-50 transition-colors`}
      >
        <div className="flex items-center justify-center text-gray-500">
          <span className="text-xl mr-2">{icon}</span>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">{addLabel}</span>
        </div>
      </div>
    );
  }

  const borderColor = color === 'blue' ? 'border-blue-200' : 'border-green-200';
  const headerBg = color === 'blue' ? 'bg-blue-50' : 'bg-green-50';
  const headerText = color === 'blue' ? 'text-blue-700' : 'text-green-700';

  return (
    <div className={`border-2 ${borderColor} rounded-lg overflow-hidden`}>
      {/* 헤더 */}
      <div className={`${headerBg} px-4 py-3 flex items-center justify-between`}>
        <div className="flex items-center space-x-2">
          <span className="text-xl">{icon}</span>
          <span className={`font-semibold ${headerText}`}>{title}</span>
          {statusInfo && (
            <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${statusInfo.className}`}>
              {statusInfo.label}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onEdit}
            className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
          >
            수정
          </button>
          {config.type === 'rent' && approvalStatus === 'APPROVED' && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
            >
              해지
            </button>
          )}
        </div>
      </div>

      {/* 내용 */}
      <div className="p-4 bg-white">
        <div className="grid grid-cols-2 gap-4">
          {/* 한도 정보 */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">한도</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">건당</span>
                <span className="font-medium">{config.perLimitPrice ? formatNumber(config.perLimitPrice) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">일일</span>
                <span className="font-medium">{config.dailyLimitPrice ? formatNumber(config.dailyLimitPrice) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">연간</span>
                <span className="font-medium">{config.annualLimitPrice ? formatNumber(config.annualLimitPrice) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">허용할부</span>
                <span className="font-medium">{config.allowedInstallmentMonths ? `${config.allowedInstallmentMonths}개월` : '-'}</span>
              </div>
            </div>
          </div>

          {/* PG/수수료 정보 */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">PG/수수료</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">PG</span>
                <span className="font-medium">{config.pgCode === 'WEROUTE' ? '위루트' : config.pgCode || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수수료율</span>
                <span className="font-medium">{config.feeRate !== null ? `${config.feeRate}%` : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">정기 TID</span>
                <span className="font-medium text-xs">{config.recurringTid || '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">수기 TID</span>
                <span className="font-medium text-xs">{config.manualTid || '-'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 계좌 정보 */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">계좌정보</h4>
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">
                {config.bankCode ? BANK_MAP[config.bankCode] || config.bankCode : '-'}
              </span>
              <span className="font-medium">{config.accountNumber || '-'}</span>
              <span className="text-gray-500">{config.accountHolder || ''}</span>
            </div>
            {config.accountVerified && (
              <span className="flex items-center text-green-600 text-xs">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                인증완료
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 월세 상세 정보 탭 (월세 설정이 있는 경우에만) */}
      {config.type === 'rent' && rentConfigInfo && (
        <div className="border-t border-gray-200">
          {/* 탭 헤더 */}
          <div className="bg-gray-50 border-b flex">
            <button
              type="button"
              onClick={() => setActiveTab('terms')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'terms'
                  ? 'bg-white text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              약관 동의
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'documents'
                  ? 'bg-white text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              서류 이미지
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('autoPayment')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'autoPayment'
                  ? 'bg-white text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              자동결제 설정
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-white text-green-700 border-b-2 border-green-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              자동결제 이력
            </button>
          </div>

          {/* 탭 내용 */}
          <div className="p-4 bg-white">
            {/* 약관 동의 탭 */}
            {activeTab === 'terms' && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">서비스 이용약관</span>
                    <span className={`text-sm font-medium ${rentConfigInfo.serviceTermsAgreed ? 'text-green-600' : 'text-gray-400'}`}>
                      {rentConfigInfo.serviceTermsAgreed ? '동의' : '미동의'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">개인정보 수집 및 이용</span>
                    <span className={`text-sm font-medium ${rentConfigInfo.privacyPolicyAgreed ? 'text-green-600' : 'text-gray-400'}`}>
                      {rentConfigInfo.privacyPolicyAgreed ? '동의' : '미동의'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">전자금융거래 이용약관</span>
                    <span className={`text-sm font-medium ${rentConfigInfo.electronicFinanceAgreed ? 'text-green-600' : 'text-gray-400'}`}>
                      {rentConfigInfo.electronicFinanceAgreed ? '동의' : '미동의'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">결제 동의서</span>
                    <span className={`text-sm font-medium ${rentConfigInfo.paymentAgreed ? 'text-green-600' : 'text-gray-400'}`}>
                      {rentConfigInfo.paymentAgreed ? '동의' : '미동의'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">마케팅 정보 수신 (선택)</span>
                    <span className={`text-sm font-medium ${rentConfigInfo.marketingAgreed ? 'text-green-600' : 'text-gray-400'}`}>
                      {rentConfigInfo.marketingAgreed ? '동의' : '미동의'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <span className="text-sm text-gray-600">개인맞춤형 광고 (선택)</span>
                    <span className={`text-sm font-medium ${rentConfigInfo.personalizedAdAgreed ? 'text-green-600' : 'text-gray-400'}`}>
                      {rentConfigInfo.personalizedAdAgreed ? '동의' : '미동의'}
                    </span>
                  </div>
                </div>
                {rentConfigInfo.termsAgreedAt && (
                  <p className="text-xs text-gray-500 mt-2">
                    동의 일시: {formatDate(rentConfigInfo.termsAgreedAt)}
                  </p>
                )}
              </div>
            )}

            {/* 서류 이미지 탭 */}
            {activeTab === 'documents' && (
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">임대차계약서</h4>
                  {rentConfigInfo.contractImagePath ? (
                    <a
                      href={rentConfigInfo.contractImagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors"
                    >
                      <img
                        src={rentConfigInfo.contractImagePath}
                        alt="임대차계약서"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>';
                        }}
                      />
                      <div className="p-2 text-center text-xs text-blue-600">클릭하여 보기</div>
                    </a>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-400 text-sm h-32 flex items-center justify-center">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">신분증</h4>
                  {rentConfigInfo.idCardImagePath ? (
                    <a
                      href={rentConfigInfo.idCardImagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors"
                    >
                      <img
                        src={rentConfigInfo.idCardImagePath}
                        alt="신분증"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>';
                        }}
                      />
                      <div className="p-2 text-center text-xs text-blue-600">클릭하여 보기</div>
                    </a>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-400 text-sm h-32 flex items-center justify-center">
                      이미지 없음
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">통장사본</h4>
                  {rentConfigInfo.bankbookImagePath ? (
                    <a
                      href={rentConfigInfo.bankbookImagePath}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block border border-gray-200 rounded-lg overflow-hidden hover:border-green-400 transition-colors"
                    >
                      <img
                        src={rentConfigInfo.bankbookImagePath}
                        alt="통장사본"
                        className="w-full h-32 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%239ca3af"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5-7l-3 3.72L9 13l-3 4h12l-4-5z"/></svg>';
                        }}
                      />
                      <div className="p-2 text-center text-xs text-blue-600">클릭하여 보기</div>
                    </a>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 text-center text-gray-400 text-sm h-32 flex items-center justify-center">
                      이미지 없음
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 자동결제 설정 탭 */}
            {activeTab === 'autoPayment' && (
              <div>
                <div className="flex items-center mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    rentConfigInfo.autoPaymentEnabled
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {rentConfigInfo.autoPaymentEnabled ? '자동결제 활성화' : '자동결제 비활성화'}
                  </span>
                </div>

                {rentConfigInfo.autoPaymentEnabled ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">결제 금액</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoPaymentAmount ? formatNumber(rentConfigInfo.autoPaymentAmount) + '원' : '-'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">수수료</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoPaymentFee ? formatNumber(rentConfigInfo.autoPaymentFee) + '원' : '-'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">이체 수수료</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoPaymentTransferFee ? formatNumber(rentConfigInfo.autoPaymentTransferFee) + '원' : '-'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">정산금액 (월세)</span>
                        <span className="text-sm font-medium text-green-600">{rentConfigInfo.autoPaymentSettlementAmount ? formatNumber(rentConfigInfo.autoPaymentSettlementAmount) + '원' : '-'}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">결제일</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoPaymentDayOfMonth ? `매월 ${rentConfigInfo.autoPaymentDayOfMonth}일` : '-'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">이체일</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoTransferDayOfMonth ? `매월 ${rentConfigInfo.autoTransferDayOfMonth}일` : '-'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">시작월</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoPaymentStartMonth || '-'}</span>
                      </div>
                      <div className="flex justify-between p-3 bg-gray-50 rounded">
                        <span className="text-sm text-gray-600">종료월</span>
                        <span className="text-sm font-medium">{rentConfigInfo.autoPaymentEndMonth || '무기한'}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    자동결제가 설정되지 않았습니다.
                  </div>
                )}
              </div>
            )}

            {/* 자동결제 이력 탭 */}
            {activeTab === 'history' && (
              <div>
                {isLoadingHistories ? (
                  <div className="text-center text-gray-500 py-8">로딩 중...</div>
                ) : histories.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">자동결제 이력이 없습니다.</div>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">대상월</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">결제일</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">결제금액</th>
                          <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">정산금액</th>
                          <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">상태</th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">처리일시</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {histories.map((history) => {
                          const historyStatusInfo = AUTO_PAYMENT_STATUS_LABELS[history.status] || { label: history.status, className: 'bg-gray-100 text-gray-600' };
                          return (
                            <tr key={history.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium">{history.targetMonth}</td>
                              <td className="px-3 py-2">{formatDateShort(history.paymentDate)}</td>
                              <td className="px-3 py-2 text-right">{formatNumber(history.amount)}원</td>
                              <td className="px-3 py-2 text-right text-green-600">{formatNumber(history.settlementAmount)}원</td>
                              <td className="px-3 py-2 text-center">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${historyStatusInfo.className}`}>
                                  {historyStatusInfo.label}
                                </span>
                                {history.retryCount > 0 && (
                                  <span className="ml-1 text-xs text-gray-400">({history.retryCount}차)</span>
                                )}
                              </td>
                              <td className="px-3 py-2 text-xs text-gray-500">
                                {history.processedAt ? formatDate(history.processedAt) : '-'}
                                {history.failureReason && (
                                  <div className="text-red-500 mt-1" title={history.failureReason}>
                                    {history.failureReason.length > 20 ? history.failureReason.substring(0, 20) + '...' : history.failureReason}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>

                    {/* 페이지네이션 */}
                    {totalHistoryPages > 1 && (
                      <div className="flex justify-center items-center space-x-2 mt-4">
                        <button
                          type="button"
                          onClick={() => loadHistories(historyPage - 1)}
                          disabled={historyPage === 0}
                          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          이전
                        </button>
                        <span className="text-sm text-gray-600">
                          {historyPage + 1} / {totalHistoryPages}
                        </span>
                        <button
                          type="button"
                          onClick={() => loadHistories(historyPage + 1)}
                          disabled={historyPage >= totalHistoryPages - 1}
                          className="px-3 py-1 text-sm border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                          다음
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

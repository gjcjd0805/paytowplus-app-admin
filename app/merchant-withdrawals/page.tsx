'use client';

import { useState, useEffect } from 'react';
import { merchantWithdrawalsApi } from '@/lib/api';
import type { MerchantWithdrawalListItem, PaymentPurpose, WithdrawalStatus } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import AlertModal from '@/components/common/AlertModal';
import MerchantWithdrawalModal from '@/components/merchant-withdrawals/MerchantWithdrawalModal';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';
import { SearchSection, SearchField, DateRange, RadioGroup, SearchInputWithSelect } from '@/components/common/SearchSection';

export default function MerchantWithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<MerchantWithdrawalListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // 통계 정보
  const [merchantBalance, setMerchantBalance] = useState(0);
  const [totalWithdrawalAmount, setTotalWithdrawalAmount] = useState(0);

  // 검색 조건
  const [paymentPurpose, setPaymentPurpose] = useState<PaymentPurpose>('DELIVERY_CHARGE');
  const [dateType, setDateType] = useState<'all' | 'range'>('all');
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const [dateFrom, setDateFrom] = useState(getLocalDateString(firstDayOfMonth));
  const [dateTo, setDateTo] = useState(getLocalDateString(today));
  const [withdrawalStatus, setWithdrawalStatus] = useState<WithdrawalStatus | 'ALL'>('ALL');
  const [searchType, setSearchType] = useState<'accountHolder' | 'accountNumber'>('accountHolder');
  const [searchKeyword, setSearchKeyword] = useState('');

  // 모달 상태
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({
    isOpen: false,
    message: '',
    type: 'success',
  });

  useEffect(() => {
    loadWithdrawals();
  }, [currentPage, pageSize, paymentPurpose]);

  const loadWithdrawals = async () => {
    setIsLoading(true);
    try {
      const selectedCenter = JSON.parse(localStorage.getItem('selectedCenter') || '{}');
      if (!selectedCenter?.centerId) {
        setAlertModal({ isOpen: true, message: '센터를 선택해주세요.', type: 'error' });
        return;
      }

      const params: any = {
        centerId: selectedCenter.centerId,
        paymentPurpose,
        page: currentPage,
        size: pageSize,
      };

      if (dateType !== 'all') {
        params.requestDateFrom = dateFrom;
        params.requestDateTo = dateTo;
      }

      if (withdrawalStatus !== 'ALL') {
        params.withdrawalStatus = withdrawalStatus;
      }

      if (searchKeyword) {
        params[searchType] = searchKeyword;
      }

      const response = await merchantWithdrawalsApi.list(params);
      setWithdrawals(response.withdrawals);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setMerchantBalance(response.merchantBalance);
      setTotalWithdrawalAmount(response.totalWithdrawalAmount);
    } catch (error) {
      console.error('머천트 출금 목록 조회 실패:', error);
      setAlertModal({ isOpen: true, message: '머천트 출금 목록 조회에 실패했습니다.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadWithdrawals();
  };

  const handleReset = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateType('range');
    setDateFrom(getLocalDateString(firstDayOfMonth));
    setDateTo(getLocalDateString(today));
    setWithdrawalStatus('ALL');
    setSearchType('accountHolder');
    setSearchKeyword('');
    setCurrentPage(0);
    loadWithdrawals();
  };

  const handleWithdrawalSuccess = () => {
    setShowWithdrawalModal(false);
    setAlertModal({ isOpen: true, message: '출금 요청이 완료되었습니다.', type: 'success' });
    loadWithdrawals();
  };

  const getBankName = (bankCode: string) => {
    const BANK_MAP: { [key: string]: string } = {
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
    return BANK_MAP[bankCode] || bankCode;
  };

  const columns = [
    { key: 'no', header: 'NO', width: '80px', align: 'center' as const, render: (_row: MerchantWithdrawalListItem, index: number) => currentPage * pageSize + index + 1 },
    { key: 'requestDt', header: '요청일시', width: '180px', align: 'center' as const, render: (row: MerchantWithdrawalListItem) => formatDateTime(row.requestDt) },
    {
      key: 'withdrawalStatus',
      header: '출금상태',
      width: '100px',
      align: 'center' as const,
      render: (row: MerchantWithdrawalListItem) => (
        <span
          className={`px-2 py-1 rounded text-xs font-medium ${
            row.withdrawalStatus === 'SUCCESS'
              ? 'bg-blue-100 text-blue-800'
              : row.withdrawalStatus === 'FAILED'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {formatStatus(row.withdrawalStatus)}
        </span>
      ),
    },
    { key: 'depositorName', header: '입금자명', width: '200px', align: 'center' as const },
    { key: 'transferMemo', header: '이체내역', width: '250px', align: 'center' as const },
    {
      key: 'withdrawalAmount',
      header: '출금금액',
      width: '120px',
      align: 'center' as const,
      render: (row: MerchantWithdrawalListItem) => formatNumber(row.withdrawalAmount),
    },
    {
      key: 'merchantBalance',
      header: '머천트잔액',
      width: '120px',
      align: 'center' as const,
      render: (row: MerchantWithdrawalListItem) => (row.merchantBalance !== null ? formatNumber(row.merchantBalance) : '-'),
    },
    {
      key: 'bankCode',
      header: '은행명',
      width: '100px',
      align: 'center' as const,
      render: (row: MerchantWithdrawalListItem) => getBankName(row.bankCode),
    },
    { key: 'accountNumber', header: '계좌번호', width: '200px', align: 'center' as const },
    { key: 'accountHolder', header: '예금주', width: '120px', align: 'center' as const },
    {
      key: 'resultMessage',
      header: '결과메시지',
      width: 'auto',
      align: 'center' as const,
      render: (row: MerchantWithdrawalListItem) => {
        const message = row.historyResultMessage || row.requestResultMessage || '-';
        return <span className="text-sm">{message}</span>;
      },
    },
  ];

  return (
    <div>
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
            <path
              fillRule="evenodd"
              d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
              clipRule="evenodd"
            />
          </svg>
          머천트 출금 리스트
        </h1>
      </div>

      {/* 결제 유형 선택 카드 */}
      <div className="mb-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <button
          onClick={() => {
            setPaymentPurpose('DELIVERY_CHARGE');
            setCurrentPage(0);
          }}
          className={`w-full sm:w-1/2 lg:w-1/5 p-3 sm:p-4 rounded-lg border-2 transition-all ${
            paymentPurpose === 'DELIVERY_CHARGE'
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`p-2 sm:p-3 rounded-full ${
                  paymentPurpose === 'DELIVERY_CHARGE' ? 'bg-blue-100' : 'bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p
                  className={`text-base sm:text-lg font-bold ${
                    paymentPurpose === 'DELIVERY_CHARGE' ? 'text-blue-600' : 'text-gray-700'
                  }`}
                >
                  배달비
                </p>
                <p className="text-xs sm:text-sm text-gray-500">D+0 계좌</p>
              </div>
            </div>
            {paymentPurpose === 'DELIVERY_CHARGE' && (
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>

        <button
          onClick={() => {
            setPaymentPurpose('MONTHLY_RENT');
            setCurrentPage(0);
          }}
          className={`w-full sm:w-1/2 lg:w-1/5 p-3 sm:p-4 rounded-lg border-2 transition-all ${
            paymentPurpose === 'MONTHLY_RENT'
              ? 'border-green-500 bg-green-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div
                className={`p-2 sm:p-3 rounded-full ${
                  paymentPurpose === 'MONTHLY_RENT' ? 'bg-green-100' : 'bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <div className="text-left">
                <p
                  className={`text-base sm:text-lg font-bold ${
                    paymentPurpose === 'MONTHLY_RENT' ? 'text-green-600' : 'text-gray-700'
                  }`}
                >
                  월세
                </p>
                <p className="text-xs sm:text-sm text-gray-500">D+1 계좌</p>
              </div>
            </div>
            {paymentPurpose === 'MONTHLY_RENT' && (
              <div className="flex items-center justify-center w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* 검색 조건 영역 */}
      <SearchSection>
        <SearchField label="요청일" className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
            <DateRange
              dateFrom={dateFrom}
              dateTo={dateTo}
              onDateFromChange={setDateFrom}
              onDateToChange={setDateTo}
              disabled={dateType === 'all'}
            />
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={dateType === 'all'}
                onChange={(e) => setDateType(e.target.checked ? 'all' : 'range')}
                className="w-4 h-4 text-blue-600"
              />
              <span className="text-sm text-gray-700 whitespace-nowrap">전체</span>
            </label>
          </div>
        </SearchField>

        <SearchField label="출금상태" className="flex-1">
          <RadioGroup
            name="withdrawalStatus"
            value={withdrawalStatus}
            onChange={(value) => setWithdrawalStatus(value as any)}
            options={[
              { value: 'ALL', label: '전체' },
              { value: 'SUCCESS', label: '완료' },
              { value: 'PENDING', label: '대기' },
              { value: 'FAILED', label: '실패' },
            ]}
          />
        </SearchField>

        <SearchField label="검색어" className="flex-1">
          <SearchInputWithSelect
            searchType={searchType}
            searchValue={searchKeyword}
            onSearchTypeChange={(value) => setSearchType(value as any)}
            onSearchValueChange={setSearchKeyword}
            onSearch={handleSearch}
            onReset={handleReset}
            options={[
              { value: 'accountHolder', label: '예금주' },
              { value: 'accountNumber', label: '계좌번호' },
            ]}
          />
        </SearchField>
      </SearchSection>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">머천트 잔액</p>
              <p className="text-lg sm:text-2xl font-bold text-blue-600 mt-1">{formatNumber(merchantBalance)}원</p>
            </div>
            <div className="p-2 sm:p-3 bg-blue-100 rounded-full">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path
                  fillRule="evenodd"
                  d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">총 출금 금액</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 mt-1">{formatNumber(totalWithdrawalAmount)}원</p>
            </div>
            <div className="p-2 sm:p-3 bg-green-100 rounded-full">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="text-xs sm:text-sm text-gray-600">
            전체 <span className="font-semibold text-primary-600">{formatNumber(totalElements)}</span>건
          </div>
          <button
            onClick={() => setShowWithdrawalModal(true)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>출금 요청</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(0);
            }}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value={10}>10 건</option>
            <option value={20}>20 건</option>
            <option value={30}>30 건</option>
            <option value={50}>50 건</option>
            <option value={100}>100 건</option>
          </select>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={withdrawals}
        emptyMessage="검색 결과가 없습니다."
      />

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />

      <LoadingModal isOpen={isLoading} />

      {/* 출금 요청 모달 */}
      <MerchantWithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
        onSuccess={handleWithdrawalSuccess}
        paymentPurpose={paymentPurpose}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '', type: 'success' })}
        type={alertModal.type}
        message={alertModal.message}
      />
    </div>
  );
}

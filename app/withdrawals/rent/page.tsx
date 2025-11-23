'use client';

import { useState, useEffect } from 'react';
import { withdrawalsApi } from '@/lib/api';
import type { WithdrawListItem } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';
import { SearchSection, SearchField, DateRange, RadioGroup, SearchInputWithSelect } from '@/components/common/SearchSection';
import { useCenter } from '@/lib/contexts/CenterContext';

export default function RentWithdrawalsPage() {
  const { selectedCenter } = useCenter();
  const [withdrawals, setWithdrawals] = useState<WithdrawListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // 통계 정보
  const [merchantBalance, setMerchantBalance] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalFee, setTotalFee] = useState(0);
  const [totalSettlementAmount, setTotalSettlementAmount] = useState(0);

  // 검색 조건
  const [dateType, setDateType] = useState<'all' | 'range'>('range');
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
  const [withdrawStatus, setWithdrawStatus] = useState<'all' | 'PENDING' | 'REQUESTED' | 'SUCCESS' | 'FAILED'>('all');
  const [paymentType, setPaymentType] = useState<'all' | 'RECURRING' | 'MANUAL'>('all');
  const [searchType, setSearchType] = useState<'userName' | 'approvalNumber' | 'cardNumber'>('userName');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadWithdrawals();
  }, [currentPage, pageSize, selectedCenter]);

  const loadWithdrawals = async () => {
    if (!selectedCenter?.centerId) return;

    setIsLoading(true);
    try {
      const centerId = selectedCenter.centerId;

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
      };

      // dateType이 'all'이 아닐 때만 날짜 파라미터 추가
      if (dateType !== 'all') {
        params.requestDateFrom = dateFrom;
        params.requestDateTo = dateTo;
      }

      if (withdrawStatus !== 'all') {
        params.withdrawStatus = withdrawStatus;
      }

      if (paymentType !== 'all') {
        params.paymentType = paymentType;
      }

      if (searchKeyword) {
        params[searchType] = searchKeyword;
      }

      const response = await withdrawalsApi.listRent(params);
      setWithdrawals(response.withdraws);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      setMerchantBalance(response.merchantBalance);
      setTotalAmount(response.totalAmount);
      setTotalFee(response.totalFee);
      setTotalSettlementAmount(response.totalSettlementAmount);
    } catch (error) {
      console.error('월세 출금 목록 조회 실패:', error);
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
    setWithdrawStatus('all');
    setPaymentType('all');
    setSearchType('userName');
    setSearchKeyword('');
    setCurrentPage(0);
    loadWithdrawals();
  };

  const columns = [
    { key: 'no', header: 'NO', width: '80px', align: 'center' as const, render: (_row: WithdrawListItem, index: number) => currentPage * pageSize + index + 1 },
    { key: 'requestDt', header: '요청일시', width: '180px', align: 'center' as const, render: (row: WithdrawListItem) => formatDateTime(row.requestDt) },
    { key: 'withdrawStatus', header: '출금상태', width: '100px', align: 'center' as const, render: (row: WithdrawListItem) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.withdrawStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
        row.withdrawStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
        row.withdrawStatus === 'REQUESTED' ? 'bg-blue-100 text-blue-800' :
        row.withdrawStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(row.withdrawStatus)}
      </span>
    )},
    { key: 'userName', header: '회원명', width: '120px', align: 'center' as const },
    { key: 'paymentType', header: '결제유형', width: '100px', align: 'center' as const, render: (row: WithdrawListItem) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${row.paymentType === 'RECURRING' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
        {formatStatus(row.paymentType)}
      </span>
    )},
    { key: 'installmentMonths', header: '할부', width: '80px', align: 'center' as const, render: (row: WithdrawListItem) => row.installmentMonths === 0 ? '일시불' : `${row.installmentMonths}개월` },
    { key: 'approvalNumber', header: '승인번호', width: '120px', align: 'center' as const },
    { key: 'cardNumber', header: '카드번호', width: '180px', align: 'center' as const },
    { key: 'amount', header: '승인금액', width: '120px', align: 'center' as const, render: (row: WithdrawListItem) => formatNumber(row.amount) },
    { key: 'fee', header: '수수료', width: '100px', align: 'center' as const, render: (row: WithdrawListItem) => formatNumber(row.fee) },
    { key: 'transferFee', header: '이체수수료', width: '100px', align: 'center' as const, render: (row: WithdrawListItem) => formatNumber(row.transferFee) },
    { key: 'settlementAmount', header: '정산금액', width: '120px', align: 'center' as const, render: (row: WithdrawListItem) => formatNumber(row.settlementAmount) },
    { key: 'scheduledSettlementDt', header: '정산 예정일시', width: '180px', align: 'center' as const, render: (row: WithdrawListItem) => formatDateTime(row.scheduledSettlementDt) },
    { key: 'resultMessage', header: '결과메시지', width: '200px', align: 'center' as const },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          월세 출금 내역
        </h1>
      </div>

      {/* 검색 조건 */}
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
            name="withdrawStatus"
            value={withdrawStatus}
            onChange={(value) => setWithdrawStatus(value as any)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'PENDING', label: '대기' },
              { value: 'REQUESTED', label: '요청완료' },
              { value: 'SUCCESS', label: '완료' },
              { value: 'FAILED', label: '실패' },
            ]}
          />
        </SearchField>

        <SearchField label="결제유형" className="flex-1">
          <RadioGroup
            name="paymentType"
            value={paymentType}
            onChange={(value) => setPaymentType(value as any)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'RECURRING', label: '정기' },
              { value: 'MANUAL', label: '수기' },
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
              { value: 'userName', label: '회원명' },
              { value: 'approvalNumber', label: '승인번호' },
              { value: 'cardNumber', label: '카드번호' },
            ]}
          />
        </SearchField>
      </SearchSection>

      {/* 통계 정보 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4">
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">머천트 잔액</div>
          <div className="text-lg sm:text-2xl font-bold text-primary-600">{formatNumber(merchantBalance)}원</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">승인금액 합계</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(totalAmount)}원</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">수수료 합계</div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900">{formatNumber(totalFee)}원</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-2 sm:p-4">
          <div className="text-xs sm:text-sm text-gray-600 mb-1">정산금액 합계</div>
          <div className="text-lg sm:text-2xl font-bold text-green-600">{formatNumber(totalSettlementAmount)}원</div>
        </div>
      </div>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-600">
          전체 <span className="font-semibold text-primary-600">{formatNumber(totalElements)}</span>건
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <LoadingModal isOpen={isLoading} />
    </div>
  );
}

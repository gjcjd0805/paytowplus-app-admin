'use client';

import { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api';
import type { PaymentListItem } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';
import { SearchSection, SearchField, DateRange, RadioGroup, SearchInputWithSelect } from '@/components/common/SearchSection';

export default function DeliveryPaymentsPage() {
  const [payments, setPayments] = useState<PaymentListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

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
  const [paymentStatus, setPaymentStatus] = useState<'all' | 'PENDING' | 'SUCCESS' | 'FAILED'>('all');
  const [searchType, setSearchType] = useState<'userName' | 'approvalNumber' | 'cardNumber' | 'tid'>('userName');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadPayments();
  }, [currentPage, pageSize]);

  const loadPayments = async () => {
    setIsLoading(true);
    try {
      const centerId = JSON.parse(localStorage.getItem('selectedCenter') || '{}')?.centerId;
      if (!centerId) return;

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
        paymentPurpose: 'DELIVERY_CHARGE', // 배달비 결제만 조회
      };

      // dateType이 'all'이 아닐 때만 날짜 파라미터 추가
      if (dateType !== 'all') {
        params.requestDateFrom = dateFrom;
        params.requestDateTo = dateTo;
      }

      if (paymentStatus !== 'all') {
        params.paymentStatus = paymentStatus;
      }

      if (searchKeyword) {
        params[searchType] = searchKeyword;
      }

      const response = await paymentsApi.list(params);
      setPayments(response.payments);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('배달비 결제 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadPayments();
  };

  const handleReset = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateType('range');
    setDateFrom(getLocalDateString(firstDayOfMonth));
    setDateTo(getLocalDateString(today));
    setPaymentStatus('all');
    setSearchType('userName');
    setSearchKeyword('');
    setCurrentPage(0);
    loadPayments();
  };

  const columns = [
    {
      key: 'no',
      header: 'NO',
      width: '80px',
      align: 'center' as const,
      render: (_row: PaymentListItem, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'pg',
      header: 'PG',
      width: '100px',
      align: 'center' as const,
      render: (row: PaymentListItem) => formatStatus(row.pg)
    },
    {
      key: 'requestDt',
      header: '요청일시',
      width: '180px',
      align: 'center' as const,
      render: (row: PaymentListItem) => formatDateTime(row.requestDt)
    },
    {
      key: 'approvalDt',
      header: '승인일시',
      width: '180px',
      align: 'center' as const,
      render: (row: PaymentListItem) => row.approvalDt ? formatDateTime(row.approvalDt) : '-'
    },
    {
      key: 'paymentStatus',
      header: '결제상태',
      width: '100px',
      align: 'center' as const,
      render: (row: PaymentListItem) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.paymentStatus === 'SUCCESS' ? 'bg-green-100 text-green-800' :
          row.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
          row.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {formatStatus(row.paymentStatus)}
        </span>
      )
    },
    {
      key: 'userName',
      header: '회원명',
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'paymentType',
      header: '결제유형',
      width: '100px',
      align: 'center' as const,
      render: (row: PaymentListItem) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.paymentType === 'RECURRING' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
          {formatStatus(row.paymentType)}
        </span>
      )
    },
    {
      key: 'installmentMonths',
      header: '할부',
      width: '80px',
      align: 'center' as const,
      render: (row: PaymentListItem) => row.installmentMonths === 0 ? '일시불' : `${row.installmentMonths}개월`
    },
    {
      key: 'approvalNumber',
      header: '승인번호',
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'cardNumber',
      header: '카드번호',
      width: '180px',
      align: 'center' as const
    },
    {
      key: 'amount',
      header: '승인금액',
      width: '120px',
      align: 'center' as const,
      render: (row: PaymentListItem) => formatNumber(row.amount)
    },
    {
      key: 'fee',
      header: '수수료',
      width: '100px',
      align: 'center' as const,
      render: (row: PaymentListItem) => formatNumber(row.fee)
    },
    {
      key: 'tid',
      header: 'TID',
      width: '150px',
      align: 'center' as const
    },
    {
      key: 'resultMessage',
      header: '결과메시지',
      width: '150px',
      align: 'center' as const
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
          배달비 결제 리스트
        </h1>
      </div>

      {/* 검색 영역 */}
      <SearchSection>
        <SearchField label="등록일" className="flex-1">
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

        <SearchField label="결제상태" className="flex-1">
          <RadioGroup
            name="paymentStatus"
            value={paymentStatus}
            onChange={(value) => setPaymentStatus(value as any)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'PENDING', label: '대기' },
              { value: 'SUCCESS', label: '완료' },
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
              { value: 'userName', label: '회원명' },
              { value: 'approvalNumber', label: '승인번호' },
              { value: 'cardNumber', label: '카드번호' },
              { value: 'tid', label: 'TID' },
            ]}
          />
        </SearchField>
      </SearchSection>

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
        data={payments}
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

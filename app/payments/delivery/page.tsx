'use client';

import { useState, useEffect } from 'react';
import { paymentsApi } from '@/lib/api';
import type { PaymentListItem } from '@/types/api';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';

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
    { key: 'no', label: 'NO', width: '80px', align: 'center' as const },
    { key: 'pg', label: 'PG', width: '100px', align: 'center' as const, render: (value: any) => formatStatus(value) },
    { key: 'requestDt', label: '요청일시', width: '180px', align: 'center' as const, render: (value: any) => formatDateTime(value) },
    { key: 'approvalDt', label: '승인일시', width: '180px', align: 'center' as const, render: (value: any) => value ? formatDateTime(value) : '-' },
    { key: 'paymentStatus', label: '결제상태', width: '100px', align: 'center' as const, render: (value: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        value === 'SUCCESS' ? 'bg-green-100 text-green-800' :
        value === 'FAILED' ? 'bg-red-100 text-red-800' :
        value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(value)}
      </span>
    )},
    { key: 'userName', label: '회원명', width: '120px', align: 'center' as const },
    { key: 'paymentType', label: '결제유형', width: '100px', align: 'center' as const, render: (value: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${value === 'RECURRING' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
        {formatStatus(value)}
      </span>
    )},
    { key: 'installmentMonths', label: '할부', width: '80px', align: 'center' as const, render: (value: any) => value === 0 ? '일시불' : `${value}개월` },
    { key: 'approvalNumber', label: '승인번호', width: '120px', align: 'center' as const },
    { key: 'cardNumber', label: '카드번호', width: '180px', align: 'center' as const },
    { key: 'amount', label: '승인금액', width: '120px', align: 'center' as const, render: (value: any) => formatNumber(value) },
    { key: 'fee', label: '수수료', width: '100px', align: 'center' as const, render: (value: any) => formatNumber(value) },
    { key: 'tid', label: 'TID', width: '150px', align: 'center' as const },
    { key: 'resultMessage', label: '결과메시지', width: '150px', align: 'center' as const },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
          배달비 결제 리스트
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 첫 번째 줄 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">요청일</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                disabled={dateType === 'all'}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
              <span className="text-gray-500">~</span>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                disabled={dateType === 'all'}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={dateType === 'all'}
                onChange={(e) => setDateType(e.target.checked ? 'all' : 'range')}
                className="w-4 h-4"
              />
              <span className="text-sm">전체</span>
            </label>
          </div>

          {/* 결제상태 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">결제상태</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={paymentStatus === 'all'}
                  onChange={() => setPaymentStatus('all')}
                  className="w-4 h-4"
                />
                <span className="text-sm">전체</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={paymentStatus === 'PENDING'}
                  onChange={() => setPaymentStatus('PENDING')}
                  className="w-4 h-4"
                />
                <span className="text-sm">대기</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={paymentStatus === 'SUCCESS'}
                  onChange={() => setPaymentStatus('SUCCESS')}
                  className="w-4 h-4"
                />
                <span className="text-sm">완료</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={paymentStatus === 'FAILED'}
                  onChange={() => setPaymentStatus('FAILED')}
                  className="w-4 h-4"
                />
                <span className="text-sm">실패</span>
              </label>
            </div>
          </div>

          {/* 두 번째 줄 - 검색조건 */}
          <div className="col-span-2 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">검색조건</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={searchType === 'userName'}
                  onChange={() => setSearchType('userName')}
                  className="w-4 h-4"
                />
                <span className="text-sm">회원명</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={searchType === 'approvalNumber'}
                  onChange={() => setSearchType('approvalNumber')}
                  className="w-4 h-4"
                />
                <span className="text-sm">승인번호</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={searchType === 'cardNumber'}
                  onChange={() => setSearchType('cardNumber')}
                  className="w-4 h-4"
                />
                <span className="text-sm">카드번호</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={searchType === 'tid'}
                  onChange={() => setSearchType('tid')}
                  className="w-4 h-4"
                />
                <span className="text-sm">TID</span>
              </label>
            </div>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어를 입력해 주세요."
              className="px-3 py-1.5 border border-gray-300 rounded text-sm flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-6 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium whitespace-nowrap"
            >
              검색
            </button>
            <button
              onClick={handleReset}
              className="px-6 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium whitespace-nowrap"
            >
              초기화
            </button>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : (
        <Table columns={columns} data={payments} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { getRentAutoPaymentUsers } from '@/lib/api/rent-auto-payment';
import type { RentAutoPaymentUserItem } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import { formatDateTime, formatNumber, getBankName } from '@/utils/format';
import { SearchSection, SearchField, RadioGroup, SearchInputWithSelect } from '@/components/common/SearchSection';
import { useCenter } from '@/lib/contexts/CenterContext';

export default function RentAutoPaymentPage() {
  const { selectedCenter } = useCenter();
  const [users, setUsers] = useState<RentAutoPaymentUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 페이징
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 검색 조건 (활성화된 회원만 조회하므로 활성화 필터 없음)
  const [dayOfMonthFilter, setDayOfMonthFilter] = useState<string>('');
  const [searchType, setSearchType] = useState<'userName' | 'loginId' | 'phoneNumber'>('userName');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize, selectedCenter]);

  const loadUsers = async () => {
    if (!selectedCenter?.centerId) return;

    setIsLoading(true);
    try {
      const centerId = selectedCenter.centerId;

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
      };

      if (dayOfMonthFilter) {
        params.autoPaymentDayOfMonth = parseInt(dayOfMonthFilter);
      }
      if (searchValue) {
        params[searchType] = searchValue;
      }

      const response = await getRentAutoPaymentUsers(params);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('자동결제 회원 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadUsers();
  };

  const handleReset = () => {
    setDayOfMonthFilter('');
    setSearchType('userName');
    setSearchValue('');
    setCurrentPage(0);
  };

  const columns = [
    { key: 'no', header: 'NO', width: '60px', align: 'center' as const, render: (_row: RentAutoPaymentUserItem, index: number) => currentPage * pageSize + index + 1 },
    { key: 'approvedAt', header: '승인일시', width: '150px', align: 'center' as const, render: (row: RentAutoPaymentUserItem) => row.approvedAt ? formatDateTime(row.approvedAt) : '-' },
    { key: 'userName', header: '회원명', width: '100px', align: 'center' as const },
    { key: 'loginId', header: '아이디', width: '120px', align: 'center' as const },
    { key: 'phoneNumber', header: '연락처', width: '120px', align: 'center' as const },
    { key: 'autoPaymentDayOfMonth', header: '결제일', width: '70px', align: 'center' as const, render: (row: RentAutoPaymentUserItem) => row.autoPaymentDayOfMonth ? `${row.autoPaymentDayOfMonth}일` : '-' },
    { key: 'autoTransferDayOfMonth', header: '이체일', width: '70px', align: 'center' as const, render: (row: RentAutoPaymentUserItem) => row.autoTransferDayOfMonth ? `${row.autoTransferDayOfMonth}일` : '-' },
    { key: 'autoPaymentAmount', header: '결제금액', width: '100px', align: 'right' as const, render: (row: RentAutoPaymentUserItem) => row.autoPaymentAmount ? formatNumber(row.autoPaymentAmount) + '원' : '-' },
    { key: 'autoPaymentFee', header: '수수료', width: '80px', align: 'right' as const, render: (row: RentAutoPaymentUserItem) => row.autoPaymentFee ? formatNumber(row.autoPaymentFee) + '원' : '-' },
    { key: 'autoPaymentSettlementAmount', header: '정산금액', width: '100px', align: 'right' as const, render: (row: RentAutoPaymentUserItem) => row.autoPaymentSettlementAmount ? formatNumber(row.autoPaymentSettlementAmount) + '원' : '-' },
    { key: 'feeRate', header: '수수료율', width: '70px', align: 'center' as const, render: (row: RentAutoPaymentUserItem) => `${row.feeRate}%` },
    { key: 'autoPaymentPeriod', header: '결제기간', width: '160px', align: 'center' as const, render: (row: RentAutoPaymentUserItem) => {
      const start = row.autoPaymentStartMonth ? row.autoPaymentStartMonth.substring(0, 7) : '';
      const end = row.autoPaymentEndMonth ? row.autoPaymentEndMonth.substring(0, 7) : '무기한';
      if (!start && !end) return '-';
      return `${start} ~ ${end}`;
    }},
    { key: 'bankInfo', header: '임대인계좌', width: '180px', align: 'left' as const, render: (row: RentAutoPaymentUserItem) => {
      if (!row.bankCode || !row.accountNumber) return '-';
      return (
        <span className="text-xs">
          {getBankName(row.bankCode)} {row.accountNumber}
          {row.accountHolder && <span className="text-gray-500 ml-1">({row.accountHolder})</span>}
        </span>
      );
    }},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          월세 자동결제 회원
        </h1>
      </div>

      {/* 검색 조건 */}
      <SearchSection>
        <SearchField label="결제일" className="flex-1">
          <select
            value={dayOfMonthFilter}
            onChange={(e) => setDayOfMonthFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">전체</option>
            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>{day}일</option>
            ))}
          </select>
        </SearchField>

        <SearchField label="검색어" className="flex-1">
          <SearchInputWithSelect
            searchType={searchType}
            searchValue={searchValue}
            onSearchTypeChange={(value) => setSearchType(value as any)}
            onSearchValueChange={setSearchValue}
            onSearch={handleSearch}
            onReset={handleReset}
            options={[
              { value: 'userName', label: '회원명' },
              { value: 'loginId', label: '아이디' },
              { value: 'phoneNumber', label: '연락처' },
            ]}
          />
        </SearchField>
      </SearchSection>

      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
        <div className="text-xs sm:text-sm text-gray-600">
          전체 <span className="font-semibold text-primary-600">{totalElements}</span>건
        </div>
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setCurrentPage(0);
          }}
          className="px-3 py-1.5 border border-gray-300 rounded text-sm"
        >
          <option value={10}>10건</option>
          <option value={20}>20건</option>
          <option value={50}>50건</option>
          <option value={100}>100건</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={users}
        emptyMessage="검색 결과가 없습니다."
      />

      {totalPages > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <LoadingModal isOpen={isLoading} />
    </div>
  );
}

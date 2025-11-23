'use client';

import { useState, useEffect } from 'react';
import { rentApplicationsApi } from '@/lib/api';
import type { RentApplicationListItem, RentApprovalStatus } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import { formatDateTime, formatStatus } from '@/utils/format';
import { useRouter } from 'next/navigation';
import { SearchSection, SearchField, DateRange, RadioGroup, SearchInputWithSelect } from '@/components/common/SearchSection';
import { useCenter } from '@/lib/contexts/CenterContext';

export default function RentApplicationsPage() {
  const router = useRouter();
  const { selectedCenter } = useCenter();
  const [applications, setApplications] = useState<RentApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 페이징
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  // 검색 조건
  const [statusFilter, setStatusFilter] = useState<'all' | RentApprovalStatus>('all');
  const [dateType, setDateType] = useState<'all' | 'range'>('range');
  const [uploadDateFrom, setUploadDateFrom] = useState(getLocalDateString(firstDayOfMonth));
  const [uploadDateTo, setUploadDateTo] = useState(getLocalDateString(today));
  const [searchType, setSearchType] = useState<'userName' | 'loginId' | 'phoneNumber'>('userName');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    loadApplications();
  }, [currentPage, pageSize, selectedCenter]);

  const loadApplications = async () => {
    if (!selectedCenter?.centerId) return;

    setIsLoading(true);
    try {
      const centerId = selectedCenter.centerId;

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
      };

      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      if (dateType === 'range') {
        if (uploadDateFrom) {
          params.uploadDateFrom = uploadDateFrom;
        }
        if (uploadDateTo) {
          params.uploadDateTo = uploadDateTo;
        }
      }
      if (searchValue) {
        params[searchType] = searchValue;
      }

      const response = await rentApplicationsApi.getDocuments(params);
      setApplications(response.documents);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('월세 신청 내역 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadApplications();
  };

  const handleReset = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateType('range');
    setUploadDateFrom(getLocalDateString(firstDayOfMonth));
    setUploadDateTo(getLocalDateString(today));
    setStatusFilter('all');
    setSearchType('userName');
    setSearchValue('');
    setCurrentPage(0);
  };

  const handleRowClick = (application: RentApplicationListItem) => {
    router.push(`/applications/rent/${application.documentId}`);
  };

  const columns = [
    { key: 'documentId', header: 'NO', width: '80px', align: 'center' as const, render: (_row: RentApplicationListItem, index: number) => currentPage * pageSize + index + 1 },
    { key: 'uploadedAt', header: '신청일시', width: '180px', align: 'center' as const, render: (row: RentApplicationListItem) => formatDateTime(row.uploadedAt) },
    { key: 'userName', header: '회원명', width: '120px', align: 'center' as const },
    { key: 'loginId', header: '아이디', width: '150px', align: 'center' as const },
    { key: 'phoneNumber', header: '연락처', width: '130px', align: 'center' as const },
    { key: 'status', header: '승인상태', width: '100px', align: 'center' as const, render: (row: RentApplicationListItem) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
        row.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        row.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
        row.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(row.status)}
      </span>
    )},
    { key: 'reviewedAt', header: '처리일시', width: '180px', align: 'center' as const, render: (row: RentApplicationListItem) => row.reviewedAt ? formatDateTime(row.reviewedAt) : '-' },
    { key: 'rejectedReason', header: '거부사유', width: '200px', align: 'left' as const, render: (row: RentApplicationListItem) => row.rejectedReason || '-' },
    { key: 'cancelledReason', header: '해지사유', width: '200px', align: 'left' as const, render: (row: RentApplicationListItem) => row.cancelledReason || '-' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          월세 신청 리스트
        </h1>
      </div>

      {/* 검색 조건 */}
      <SearchSection>
        <SearchField label="신청일" className="flex-1">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full">
            <DateRange
              dateFrom={uploadDateFrom}
              dateTo={uploadDateTo}
              onDateFromChange={setUploadDateFrom}
              onDateToChange={setUploadDateTo}
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

        <SearchField label="승인상태" className="flex-1">
          <RadioGroup
            name="statusFilter"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as any)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'PENDING', label: '대기' },
              { value: 'APPROVED', label: '승인' },
              { value: 'REJECTED', label: '거부' },
              { value: 'CANCELLED', label: '해지' },
            ]}
          />
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
        data={applications}
        emptyMessage="검색 결과가 없습니다."
        onRowClick={handleRowClick}
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

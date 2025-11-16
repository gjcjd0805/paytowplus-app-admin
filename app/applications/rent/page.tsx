'use client';

import { useState, useEffect } from 'react';
import { rentApplicationsApi } from '@/lib/api';
import type { RentApplicationListItem, RentApprovalStatus } from '@/types/api';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import { formatDateTime, formatStatus } from '@/utils/format';
import { useRouter } from 'next/navigation';

export default function RentApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<RentApplicationListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 페이징
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // 검색 조건
  const [statusFilter, setStatusFilter] = useState<'all' | RentApprovalStatus>('all');
  const [dateType, setDateType] = useState<'all' | 'range'>('range');
  const [uploadDateFrom, setUploadDateFrom] = useState('');
  const [uploadDateTo, setUploadDateTo] = useState('');
  const [searchType, setSearchType] = useState<'userName' | 'loginId' | 'phoneNumber'>('userName');
  const [searchValue, setSearchValue] = useState('');

  // 날짜를 YYYY-MM-DD 형식으로 변환
  const getLocalDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    // 초기 날짜 설정: 이번 달 1일부터 오늘까지
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setUploadDateFrom(getLocalDateString(firstDayOfMonth));
    setUploadDateTo(getLocalDateString(today));
  }, []);

  useEffect(() => {
    loadApplications();
  }, [currentPage, pageSize]);

  const loadApplications = async () => {
    setIsLoading(true);
    try {
      const params: any = {
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
    { key: 'documentId', label: 'NO', width: '80px', align: 'center' as const },
    { key: 'uploadedAt', label: '신청일시', width: '180px', align: 'center' as const, render: (value: any) => formatDateTime(value) },
    { key: 'userName', label: '회원명', width: '120px', align: 'center' as const },
    { key: 'loginId', label: '아이디', width: '150px', align: 'center' as const },
    { key: 'phoneNumber', label: '연락처', width: '130px', align: 'center' as const },
    { key: 'status', label: '승인상태', width: '100px', align: 'center' as const, render: (value: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        value === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
        value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        value === 'REJECTED' ? 'bg-red-100 text-red-800' :
        value === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(value)}
      </span>
    )},
    { key: 'reviewedAt', label: '처리일시', width: '180px', align: 'center' as const, render: (value: any) => value ? formatDateTime(value) : '-' },
    { key: 'rejectedReason', label: '거부사유', width: '200px', align: 'left' as const, render: (value: any) => value || '-' },
    { key: 'cancelledReason', label: '해지사유', width: '200px', align: 'left' as const, render: (value: any) => value || '-' },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          월세 신청 리스트
        </h1>
      </div>

      {/* 검색 조건 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 첫 번째 줄 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">신청일</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={uploadDateFrom}
                onChange={(e) => setUploadDateFrom(e.target.value)}
                disabled={dateType === 'all'}
                className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:bg-gray-100 disabled:text-gray-500"
              />
              <span className="text-gray-500">~</span>
              <input
                type="date"
                value={uploadDateTo}
                onChange={(e) => setUploadDateTo(e.target.value)}
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

          {/* 승인상태 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">승인상태</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={statusFilter === 'all'}
                  onChange={() => setStatusFilter('all')}
                  className="w-4 h-4"
                />
                <span className="text-sm">전체</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={statusFilter === 'PENDING'}
                  onChange={() => setStatusFilter('PENDING')}
                  className="w-4 h-4"
                />
                <span className="text-sm">대기</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={statusFilter === 'APPROVED'}
                  onChange={() => setStatusFilter('APPROVED')}
                  className="w-4 h-4"
                />
                <span className="text-sm">승인</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={statusFilter === 'REJECTED'}
                  onChange={() => setStatusFilter('REJECTED')}
                  className="w-4 h-4"
                />
                <span className="text-sm">거부</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={statusFilter === 'CANCELLED'}
                  onChange={() => setStatusFilter('CANCELLED')}
                  className="w-4 h-4"
                />
                <span className="text-sm">해지</span>
              </label>
            </div>
          </div>

          {/* 검색조건 */}
          <div className="col-span-2 flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">검색어</label>
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
                  checked={searchType === 'loginId'}
                  onChange={() => setSearchType('loginId')}
                  className="w-4 h-4"
                />
                <span className="text-sm">아이디</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={searchType === 'phoneNumber'}
                  onChange={() => setSearchType('phoneNumber')}
                  className="w-4 h-4"
                />
                <span className="text-sm">연락처</span>
              </label>
            </div>
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
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

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      ) : (
        <>
          <Table columns={columns} data={applications} onRowClick={handleRowClick} />
          {totalPages > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      )}
    </div>
  );
}

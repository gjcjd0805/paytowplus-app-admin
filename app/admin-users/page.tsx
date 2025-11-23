'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import type { AdminUserListItem } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import ConfirmModal from '@/components/common/ConfirmModal';
import AlertModal from '@/components/common/AlertModal';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatNumber } from '@/utils/format';
import { SearchSection, SearchField, DateRange, SearchInputWithSelect } from '@/components/common/SearchSection';

export default function AdminUsersPage() {
  const router = useRouter();
  const [adminUsers, setAdminUsers] = useState<AdminUserListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // 검색 조건
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
  const [searchType, setSearchType] = useState<'loginId' | 'name' | 'phone'>('loginId');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; adminId: number | null }>({ isOpen: false, adminId: null });
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    loadAdminUsers();
  }, [currentPage, pageSize]);

  const loadAdminUsers = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      // dateType이 'all'이 아닐 때만 날짜 파라미터 추가
      if (dateType !== 'all') {
        params.registDateFrom = dateFrom;
        params.registDateTo = dateTo;
      }

      if (searchKeyword) {
        params[searchType] = searchKeyword;
      }

      const response = await adminApi.list(params);
      setAdminUsers(response.adminUsers);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('어드민 계정 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadAdminUsers();
  };

  const handleReset = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateType('range');
    setDateFrom(getLocalDateString(firstDayOfMonth));
    setDateTo(getLocalDateString(today));
    setSearchType('loginId');
    setSearchKeyword('');
    setCurrentPage(0);
    loadAdminUsers();
  };

  const handleDeleteClick = (id: number) => {
    setConfirmModal({ isOpen: true, adminId: id });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmModal.adminId) return;

    try {
      await adminApi.delete(confirmModal.adminId);
      setConfirmModal({ isOpen: false, adminId: null });
      setAlertModal({ isOpen: true, message: '삭제되었습니다.', type: 'success' });
      loadAdminUsers();
    } catch (error) {
      console.error('삭제 실패:', error);
      setConfirmModal({ isOpen: false, adminId: null });
      setAlertModal({ isOpen: true, message: '삭제에 실패했습니다.', type: 'error' });
    }
  };

  const columns = [
    { key: 'no', header: 'NO', width: '80px', align: 'center' as const, render: (_row: AdminUserListItem, index: number) => currentPage * pageSize + index + 1 },
    { key: 'registDt', header: '등록일시', width: '180px', render: (row: AdminUserListItem) => formatDateTime(row.registDt) },
    { key: 'loginId', header: '아이디', width: '150px' },
    { key: 'name', header: '이름', width: '120px' },
    { key: 'phone', header: '휴대폰', width: '150px' },
    { key: 'email', header: '이메일', width: 'auto' },
    { key: 'actions', header: '상세', width: '80px', align: 'center' as const, render: (row: AdminUserListItem) => (
      <button
        onClick={() => handleDeleteClick(row.id)}
        className="text-red-600 hover:text-red-700 text-sm font-medium"
      >
        삭제
      </button>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
          </svg>
          계정 리스트
        </h1>
        <button
          onClick={() => router.push('/admin-users/new')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>계정 등록</span>
        </button>
      </div>

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

        <SearchField label="검색어" className="flex-1">
          <SearchInputWithSelect
            searchType={searchType}
            searchValue={searchKeyword}
            onSearchTypeChange={(value) => setSearchType(value as any)}
            onSearchValueChange={setSearchKeyword}
            onSearch={handleSearch}
            onReset={handleReset}
            options={[
              { value: 'loginId', label: '아이디' },
              { value: 'name', label: '이름' },
              { value: 'phone', label: '휴대폰' },
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
        data={adminUsers}
        emptyMessage="검색 결과가 없습니다."
      />

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <LoadingModal isOpen={isLoading} />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, adminId: null })}
        onConfirm={handleDeleteConfirm}
        title="계정 삭제"
        message="정말 삭제하시겠습니까?"
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

'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { UserListItem } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';
import { SearchSection, SearchField, DateRange, RadioGroup, SearchInputWithSelect } from '@/components/common/SearchSection';

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserListItem[]>([]);
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
  const [userStatus, setUserStatus] = useState<'all' | 'ACTIVE' | 'TERMINATED'>('all');
  const [searchType, setSearchType] = useState<'loginId' | 'userName' | 'phoneNumber'>('loginId');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadUsers();
  }, [currentPage, pageSize]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const centerId = JSON.parse(localStorage.getItem('selectedCenter') || '{}')?.centerId;
      if (!centerId) return;

      const params: any = {
        centerId,
        page: currentPage,
        size: pageSize,
      };

      // dateType이 'all'이 아닐 때만 날짜 파라미터 추가
      if (dateType !== 'all') {
        params.registDateFrom = dateFrom;
        params.registDateTo = dateTo;
      }

      if (userStatus !== 'all') {
        params.userStatus = userStatus;
      }

      if (searchKeyword) {
        params[searchType] = searchKeyword;
      }

      const response = await usersApi.list(params);
      setUsers(response.users);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('회원 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadUsers();
  };

  const handleReset = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateType('range');
    setDateFrom(getLocalDateString(firstDayOfMonth));
    setDateTo(getLocalDateString(today));
    setUserStatus('all');
    setSearchType('loginId');
    setSearchKeyword('');
    setCurrentPage(0);
    loadUsers();
  };

  const handleEdit = (user: UserListItem) => {
    router.push(`/users/${user.id}`);
  };

  const columns = [
    {
      key: 'no',
      header: 'NO',
      width: '80px',
      align: 'center' as const,
      render: (_row: UserListItem, index: number) => currentPage * pageSize + index + 1
    },
    {
      key: 'registDt',
      header: '등록일시',
      width: '180px',
      align: 'center' as const,
      render: (row: UserListItem) => formatDateTime(row.registDt)
    },
    {
      key: 'loginId',
      header: '아이디',
      width: '150px',
      align: 'center' as const
    },
    {
      key: 'userName',
      header: '회원명',
      width: '120px',
      align: 'center' as const
    },
    {
      key: 'userStatus',
      header: '회원상태',
      width: '100px',
      align: 'center' as const,
      render: (row: UserListItem) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${row.userStatus === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {formatStatus(row.userStatus)}
        </span>
      )
    },
    {
      key: 'rentApprovalStatus',
      header: '월세상태',
      width: '100px',
      align: 'center' as const,
      render: (row: UserListItem) => (
        <span className={`px-2 py-1 rounded text-xs font-medium ${
          row.rentApprovalStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
          row.rentApprovalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {formatStatus(row.rentApprovalStatus)}
        </span>
      )
    },
    {
      key: 'deliveryFeeRate',
      header: '배달비수수료율',
      width: '120px',
      align: 'center' as const,
      render: (row: UserListItem) => `${row.deliveryFeeRate}%`
    },
    {
      key: 'rentFeeRate',
      header: '월세수수료율',
      width: '120px',
      align: 'center' as const,
      render: (row: UserListItem) => row.rentFeeRate ? `${row.rentFeeRate}%` : '-'
    },
    {
      key: 'allowedInstallmentMonths',
      header: '허용할부개월',
      width: '120px',
      align: 'center' as const,
      render: (row: UserListItem) => `${row.allowedInstallmentMonths}개월`
    },
    {
      key: 'phoneNumber',
      header: '연락처',
      width: '130px',
      align: 'center' as const
    },
    {
      key: 'perLimitPrice',
      header: '건한도',
      width: '120px',
      align: 'center' as const,
      render: (row: UserListItem) => formatNumber(row.perLimitPrice)
    },
    {
      key: 'annualLimitPrice',
      header: '연한도',
      width: '130px',
      align: 'center' as const,
      render: (row: UserListItem) => formatNumber(row.annualLimitPrice)
    },
    {
      key: 'actions',
      header: '관리',
      width: '100px',
      align: 'center' as const,
      render: (row: UserListItem) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-medium transition-colors"
        >
          회원수정
        </button>
      )
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          회원 리스트
        </h1>
        <button
          onClick={() => router.push('/users/new')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>회원 등록</span>
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

        <SearchField label="회원상태" className="flex-1">
          <RadioGroup
            name="userStatus"
            value={userStatus}
            onChange={(value) => setUserStatus(value as any)}
            options={[
              { value: 'all', label: '전체' },
              { value: 'ACTIVE', label: '활성' },
              { value: 'TERMINATED', label: '해지' },
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
              { value: 'loginId', label: '아이디' },
              { value: 'userName', label: '회원명' },
              { value: 'phoneNumber', label: '전화번호' },
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
        data={users}
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

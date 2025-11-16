'use client';

import { useState, useEffect } from 'react';
import { usersApi } from '@/lib/api';
import type { UserListItem } from '@/types/api';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';

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
  const [searchType, setSearchType] = useState<'loginId' | 'userName'>('loginId');
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
    { key: 'no', label: 'NO', width: '80px', align: 'center' as const },
    { key: 'registDt', label: '등록일시', width: '180px', align: 'center' as const, render: (value: any) => formatDateTime(value) },
    { key: 'loginId', label: '아이디', width: '150px', align: 'center' as const },
    { key: 'userName', label: '회원명', width: '120px', align: 'center' as const },
    { key: 'userStatus', label: '회원상태', width: '100px', align: 'center' as const, render: (value: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${value === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {formatStatus(value)}
      </span>
    )},
    { key: 'rentApprovalStatus', label: '월세상태', width: '100px', align: 'center' as const, render: (value: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        value === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
        value === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(value)}
      </span>
    )},
    { key: 'deliveryFeeRate', label: '배달비수수료율', width: '120px', align: 'center' as const, render: (value: any) => `${value}%` },
    { key: 'rentFeeRate', label: '월세수수료율', width: '120px', align: 'center' as const, render: (value: any) => value ? `${value}%` : '-' },
    { key: 'allowedInstallmentMonths', label: '허용할부개월', width: '120px', align: 'center' as const, render: (value: any) => `${value}개월` },
    { key: 'phoneNumber', label: '연락처', width: '130px', align: 'center' as const },
    { key: 'perLimitPrice', label: '건한도', width: '120px', align: 'center' as const, render: (value: any) => formatNumber(value) },
    { key: 'annualLimitPrice', label: '연한도', width: '130px', align: 'center' as const, render: (value: any) => formatNumber(value) },
    { key: 'actions', label: '관리', width: '100px', align: 'center' as const, render: (value: any, row: UserListItem) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleEdit(row);
        }}
        className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white rounded text-xs font-medium transition-colors"
      >
        회원수정
      </button>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
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

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* 첫 번째 줄 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">등록일</label>
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

          {/* 회원상태 */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">회원상태</label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={userStatus === 'all'}
                  onChange={() => setUserStatus('all')}
                  className="w-4 h-4"
                />
                <span className="text-sm">전체</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={userStatus === 'ACTIVE'}
                  onChange={() => setUserStatus('ACTIVE')}
                  className="w-4 h-4"
                />
                <span className="text-sm">활성</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={userStatus === 'TERMINATED'}
                  onChange={() => setUserStatus('TERMINATED')}
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
                  checked={searchType === 'loginId'}
                  onChange={() => setSearchType('loginId')}
                  className="w-4 h-4"
                />
                <span className="text-sm">아이디</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  checked={searchType === 'userName'}
                  onChange={() => setSearchType('userName')}
                  className="w-4 h-4"
                />
                <span className="text-sm">회원명</span>
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
        <Table columns={columns} data={users} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

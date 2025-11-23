'use client';

import { useState, useEffect } from 'react';
import { noticesApi } from '@/lib/api';
import type { NoticeListItem, NoticeType } from '@/types/api';
import { DataTable } from '@/components/common/DataTable';
import { LoadingModal } from '@/components/common/LoadingModal';
import Pagination from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';
import { SearchSection, SearchField, SearchInputWithSelect } from '@/components/common/SearchSection';

export default function NoticesPage() {
  const router = useRouter();
  const [notices, setNotices] = useState<NoticeListItem[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  // 검색 조건
  const [searchType, setSearchType] = useState<'title' | 'content' | 'author'>('title');
  const [searchKeyword, setSearchKeyword] = useState('');

  useEffect(() => {
    loadNotices();
  }, [currentPage, pageSize]);

  const loadNotices = async () => {
    setIsLoading(true);
    try {
      const params: any = {
        page: currentPage,
        size: pageSize,
      };

      if (searchKeyword) {
        params[searchType] = searchKeyword;
      }

      const response = await noticesApi.list(params);
      setNotices(response.notices);
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
    } catch (error) {
      console.error('공지사항 목록 조회 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadNotices();
  };

  const handleReset = () => {
    setSearchType('title');
    setSearchKeyword('');
    setCurrentPage(0);
    loadNotices();
  };

  const handleRowClick = (notice: NoticeListItem) => {
    router.push(`/notices/${notice.id}`);
  };

  const columns = [
    { key: 'no', header: 'NO', width: '80px', align: 'center' as const, render: (_row: NoticeListItem, index: number) => currentPage * pageSize + index + 1 },
    { key: 'noticeType', header: '구분', width: '100px', align: 'center' as const, render: (row: NoticeListItem) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        row.noticeType === 'FIXED' ? 'bg-red-100 text-red-800' :
        row.noticeType === 'IMPORTANT' ? 'bg-orange-100 text-orange-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(row.noticeType)}
      </span>
    )},
    { key: 'title', header: '제목', width: 'auto' },
    { key: 'author', header: '작성자', width: '120px', align: 'center' as const },
    { key: 'registDt', header: '작성일시', width: '180px', render: (row: NoticeListItem) => formatDateTime(row.registDt) },
    { key: 'viewCount', header: '조회수', width: '100px', align: 'center' as const },
    { key: 'actions', header: '수정', width: '80px', align: 'center' as const, render: (row: NoticeListItem) => (
      <button
        onClick={(e) => {
          e.stopPropagation();
          router.push(`/notices/${row.id}`);
        }}
        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
      >
        수정
      </button>
    )},
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-6 h-6 sm:w-7 sm:h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
          </svg>
          공지사항 리스트
        </h1>
        <button
          onClick={() => router.push('/notices/new')}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>공지사항 등록</span>
        </button>
      </div>

      <SearchSection>
        <SearchField label="검색어" className="flex-1">
          <SearchInputWithSelect
            searchType={searchType}
            searchValue={searchKeyword}
            onSearchTypeChange={(value) => setSearchType(value as any)}
            onSearchValueChange={setSearchKeyword}
            onSearch={handleSearch}
            onReset={handleReset}
            options={[
              { value: 'title', label: '제목' },
              { value: 'content', label: '내용' },
              { value: 'author', label: '작성자' },
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
        data={notices}
        emptyMessage="검색 결과가 없습니다."
        onRowClick={handleRowClick}
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

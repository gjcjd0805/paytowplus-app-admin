'use client';

import { useState, useEffect } from 'react';
import { noticesApi } from '@/lib/api';
import type { NoticeListItem, NoticeType } from '@/types/api';
import Table from '@/components/common/Table';
import Pagination from '@/components/common/Pagination';
import { useRouter } from 'next/navigation';
import { formatDateTime, formatNumber, formatStatus } from '@/utils/format';

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
    { key: 'no', label: 'NO', width: '80px', align: 'center' as const },
    { key: 'noticeType', label: '구분', width: '100px', align: 'center' as const, render: (value: any) => (
      <span className={`px-2 py-1 rounded text-xs font-medium ${
        value === 'FIXED' ? 'bg-red-100 text-red-800' :
        value === 'IMPORTANT' ? 'bg-orange-100 text-orange-800' :
        'bg-gray-100 text-gray-800'
      }`}>
        {formatStatus(value)}
      </span>
    )},
    { key: 'title', label: '제목', width: 'auto' },
    { key: 'author', label: '작성자', width: '120px', align: 'center' as const },
    { key: 'registDt', label: '작성일시', width: '180px', render: (value: any) => formatDateTime(value) },
    { key: 'viewCount', label: '조회수', width: '100px', align: 'center' as const },
    { key: 'actions', label: '수정', width: '80px', align: 'center' as const, render: (value: any, row: any) => (
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
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
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

      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
        <div className="flex items-center gap-6">
          {/* 검색조건 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">검색조건</label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={searchType === 'title'}
                onChange={() => setSearchType('title')}
                className="w-4 h-4"
              />
              <span className="text-sm">제목</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={searchType === 'content'}
                onChange={() => setSearchType('content')}
                className="w-4 h-4"
              />
              <span className="text-sm">내용</span>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={searchType === 'author'}
                onChange={() => setSearchType('author')}
                className="w-4 h-4"
              />
              <span className="text-sm">작성자</span>
            </label>
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어를 입력해 주세요."
              className="px-3 py-1.5 border border-gray-300 rounded text-sm w-96"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>

          {/* 검색 버튼 */}
          <button
            onClick={handleSearch}
            className="px-6 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded text-sm font-medium"
          >
            검색
          </button>

          {/* 초기화 버튼 */}
          <button
            onClick={handleReset}
            className="px-6 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm font-medium"
          >
            초기화
          </button>
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
        <Table columns={columns} data={notices} onRowClick={handleRowClick} />
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}

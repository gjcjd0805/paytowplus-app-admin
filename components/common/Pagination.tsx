'use client';

import { useEffect, useState } from 'react';

interface PaginationProps {
  currentPage: number; // 0-indexed
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
}: PaginationProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (totalPages === 0) return null;

  const effectiveMaxVisiblePages = isMobile ? 3 : maxVisiblePages;

  // 표시할 페이지 번호 계산
  const getVisiblePages = (): number[] => {
    const halfVisible = Math.floor(effectiveMaxVisiblePages / 2);
    let startPage = Math.max(0, currentPage - halfVisible);
    let endPage = Math.min(totalPages - 1, startPage + effectiveMaxVisiblePages - 1);

    if (endPage - startPage < effectiveMaxVisiblePages - 1) {
      startPage = Math.max(0, endPage - effectiveMaxVisiblePages + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const visiblePages = getVisiblePages();
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mt-4 sm:mt-6 flex-wrap">
      {/* 처음 버튼 */}
      <button
        onClick={() => onPageChange(0)}
        disabled={isFirstPage}
        className="px-2 sm:px-3 py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] sm:min-h-0"
        title="처음 페이지"
      >
        <span className="hidden sm:inline">처음</span>
        <span className="sm:hidden">처</span>
      </button>

      {/* 이전 버튼 */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
        className="px-2 sm:px-3 py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] sm:min-h-0"
        title="이전 페이지"
      >
        <span className="hidden sm:inline">이전</span>
        <span className="sm:hidden">◀</span>
      </button>

      {/* 페이지 번호 */}
      <div className="flex gap-1">
        {visiblePages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`min-w-[44px] sm:min-w-[40px] px-2 sm:px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors min-h-[44px] sm:min-h-0 ${
              page === currentPage
                ? "bg-[#4A90E2] text-white border-[#4A90E2]"
                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
            title={`${page + 1}페이지`}
          >
            {page + 1}
          </button>
        ))}
      </div>

      {/* 다음 버튼 */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
        className="px-2 sm:px-3 py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] sm:min-h-0"
        title="다음 페이지"
      >
        <span className="hidden sm:inline">다음</span>
        <span className="sm:hidden">▶</span>
      </button>

      {/* 마지막 버튼 */}
      <button
        onClick={() => onPageChange(totalPages - 1)}
        disabled={isLastPage}
        className="px-2 sm:px-3 py-2 rounded-md border border-gray-300 bg-white text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-w-[44px] min-h-[44px] sm:min-h-0"
        title="마지막 페이지"
      >
        <span className="hidden sm:inline">마지막</span>
        <span className="sm:hidden">끝</span>
      </button>
    </div>
  );
}

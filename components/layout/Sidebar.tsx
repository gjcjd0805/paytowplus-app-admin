'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSidebar } from '@/lib/contexts/SidebarContext';

interface MenuItem {
  icon: React.ReactNode;
  label: string;
  path: string;
  subItems?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
    label: '회원관리',
    path: '/users',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
        <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
      </svg>
    ),
    label: '신청 관리',
    path: '/applications',
    subItems: [
      {
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        ),
        label: '월세 신청 내역',
        path: '/applications/rent',
      },
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
        <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
      </svg>
    ),
    label: '결제관리',
    path: '/payments',
    subItems: [
      {
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
        label: '배달비 결제 내역',
        path: '/payments/delivery',
      },
      {
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        ),
        label: '월세 결제 내역',
        path: '/payments/rent',
      },
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
      </svg>
    ),
    label: '회원출금관리',
    path: '/withdrawals',
    subItems: [
      {
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
          </svg>
        ),
        label: '배달비 출금 내역',
        path: '/withdrawals/delivery',
      },
      {
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
        ),
        label: '월세 출금 내역',
        path: '/withdrawals/rent',
      },
    ],
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
      </svg>
    ),
    label: '머천트출금관리',
    path: '/merchant-withdrawals',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
      </svg>
    ),
    label: '공지사항관리',
    path: '/notices',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
      </svg>
    ),
    label: '팝업관리',
    path: '/popup',
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
      </svg>
    ),
    label: '계정관리',
    path: '/admin-users',
  },
];

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useSidebar();
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  useEffect(() => {
    // 결제관리, 회원출금관리, 신청 관리는 항상 펼쳐진 상태 유지
    const alwaysExpanded = ['/payments', '/withdrawals', '/applications'];
    const newExpandedMenus = [...alwaysExpanded];

    // 현재 경로에 해당하는 메뉴도 자동 확장
    menuItems.forEach((item) => {
      if (item.subItems && item.subItems.some(sub => pathname.startsWith(sub.path))) {
        if (!newExpandedMenus.includes(item.path)) {
          newExpandedMenus.push(item.path);
        }
      }
    });

    setExpandedMenus(newExpandedMenus);
  }, [pathname]);

  const toggleMenu = (path: string) => {
    setExpandedMenus(prev =>
      prev.includes(path)
        ? prev.filter(p => p !== path)
        : [...prev, path]
    );
  };

  const handleMenuClick = () => {
    // 모바일에서 메뉴 클릭 시 사이드바 닫기
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setTimeout(() => {
        closeSidebar();
      }, 100);
    }
  };

  return (
    <>
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* 사이드바 */}
      <aside
        className={`
          fixed left-0 top-14 sm:top-16 z-40 w-64 bg-gradient-to-b from-white to-pastel-blue shadow-lg
          transition-transform duration-300 ease-in-out
          lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
      <div className="px-6 pt-6 pb-6 h-full overflow-y-auto">
        {/* 모바일 닫기 버튼 */}
        <div className="lg:hidden flex justify-end mb-4">
          <button
            onClick={closeSidebar}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="메뉴 닫기"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 메뉴 */}
        <nav className="space-y-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname.startsWith(item.path + '/');
            const isExpanded = expandedMenus.includes(item.path);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.path}>
                {hasSubItems ? (
                  <button
                    onClick={() => toggleMenu(item.path)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-cute transition-all duration-300 transform hover:scale-105 ${
                      isActive
                        ? 'bg-white text-primary-700 shadow-md font-bold'
                        : 'text-gray-700 hover:bg-white hover:bg-opacity-50 hover:shadow-sm'
                    }`}
                  >
                    <div className={`${isActive ? 'text-primary-600' : 'text-gray-500'} transition-colors`}>
                      {item.icon}
                    </div>
                    <span className="text-base font-medium flex-1 text-left">{item.label}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <Link
                    href={item.path}
                    onClick={handleMenuClick}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-cute transition-all duration-300 transform hover:scale-105 min-h-[44px] lg:min-h-0 ${
                      isActive
                        ? 'bg-white text-primary-700 shadow-md font-bold'
                        : 'text-gray-700 hover:bg-white hover:bg-opacity-50 hover:shadow-sm'
                    }`}
                  >
                    <div className={`${isActive ? 'text-primary-600' : 'text-gray-500'} transition-colors`}>
                      {item.icon}
                    </div>
                    <span className="text-base font-medium">{item.label}</span>
                  </Link>
                )}

                {/* 하위 메뉴 */}
                {hasSubItems && isExpanded && (
                  <div className="mt-2 ml-4 space-y-2">
                    {item.subItems!.map((subItem) => {
                      const isSubActive = pathname === subItem.path || pathname.startsWith(subItem.path + '/');
                      return (
                        <Link
                          key={subItem.path}
                          href={subItem.path}
                          onClick={handleMenuClick}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-cute transition-all duration-300 min-h-[44px] lg:min-h-0 ${
                            isSubActive
                              ? 'bg-white text-primary-700 shadow-sm font-semibold'
                              : 'text-gray-600 hover:bg-white hover:bg-opacity-30 hover:text-gray-800'
                          }`}
                        >
                          <div className={`${isSubActive ? 'text-primary-600' : 'text-gray-400'} transition-colors`}>
                            {subItem.icon}
                          </div>
                          <span className="text-sm">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
      </aside>
    </>
  );
}

'use client';

import { useState, useEffect } from 'react';
import type { AdminUser, Center } from '@/types/api';
import { centersApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useSidebar } from '@/lib/contexts/SidebarContext';
import { useCenter } from '@/lib/contexts/CenterContext';

export default function Header() {
  const { toggleSidebar } = useSidebar();
  const { selectedCenter, setSelectedCenter } = useCenter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 로컬스토리지에서 사용자 정보 로드
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 센터 목록 로드
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const response = await centersApi.list();
      setCenters(response.centers);

      // 선택된 센터가 없으면 첫 번째 센터 선택
      if (!selectedCenter && response.centers.length > 0) {
        handleCenterChange(response.centers[0]);
      }
    } catch (error) {
      console.error('센터 목록 로드 실패:', error);
    }
  };

  const handleCenterChange = (center: Center) => {
    const centerData = {
      centerId: center.centerId,
      centerName: center.name,
      name: center.name,
      pgCode: center.pgCode,
      recurringMid: center.recurringMid,
      manualMid: center.manualMid,
    };
    setSelectedCenter(centerData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCenter');
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-white to-pastel-blue h-14 sm:h-16 flex items-center justify-between px-3 sm:px-6 shadow-sm z-50 relative">
      {/* 모바일 메뉴 버튼 */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden p-2 hover:bg-white/50 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
        aria-label="메뉴 열기"
      >
        <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* 센터 선택 드롭다운 */}
      <div className="flex items-center justify-center mx-4">
        <div className="relative" style={{ minWidth: '200px', maxWidth: '280px' }}>
          <select
            value={selectedCenter?.centerId || ''}
            onChange={(e) => {
              const center = centers.find(c => c.centerId === Number(e.target.value));
              if (center) handleCenterChange(center);
            }}
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white px-5 py-2.5 pr-10 rounded-super-cute text-base font-bold hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-300"
          >
            {centers.length === 0 ? (
              <option value="">센터를 불러오는 중...</option>
            ) : (
              centers.map((center) => (
                <option key={center.centerId} value={center.centerId} className="bg-white text-gray-700">
                  {center.name}
                </option>
              ))
            )}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 sm:space-x-3 px-2 sm:px-4 py-2 rounded-cute hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-sm font-bold text-gray-800">{user?.name || '관리자'} ✨</div>
              <div className="text-xs text-gray-500">{user?.loginId}</div>
            </div>
            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500 hidden sm:block" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-cute shadow-xl border-2 border-primary-200 py-2 z-20">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-pastel-pink rounded-lg mx-2 transition-all duration-200 flex items-center space-x-2 font-medium"
                >
                  <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                  </svg>
                  <span>로그아웃 👋</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

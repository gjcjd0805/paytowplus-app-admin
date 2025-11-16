'use client';

import { useState, useEffect } from 'react';
import type { AdminUser, Center } from '@/types/api';
import { centersApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function Header() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 로컬스토리지에서 사용자 정보 및 센터 정보 로드
    const storedUser = localStorage.getItem('user');
    const storedCenter = localStorage.getItem('selectedCenter');

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedCenter) {
      setSelectedCenter(JSON.parse(storedCenter));
    }

    // 센터 목록 로드
    loadCenters();
  }, []);

  const loadCenters = async () => {
    try {
      const response = await centersApi.list();
      setCenters(response.centers);

      // 선택된 센터가 없으면 첫 번째 센터 선택
      const storedCenter = localStorage.getItem('selectedCenter');
      if (!storedCenter && response.centers.length > 0) {
        handleCenterChange(response.centers[0]);
      }
    } catch (error) {
      console.error('센터 목록 로드 실패:', error);
    }
  };

  const handleCenterChange = (center: Center) => {
    setSelectedCenter(center);
    const centerData = {
      centerId: center.centerId,
      centerName: center.name,
      name: center.name,
      pgCode: center.pgCode,
      recurringMid: center.recurringMid,
      manualMid: center.manualMid,
    };
    localStorage.setItem('selectedCenter', JSON.stringify(centerData));
    window.location.reload(); // 페이지 새로고침하여 센터 변경 반영
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCenter');
    router.push('/login');
  };

  return (
    <header className="bg-gradient-to-r from-white to-pastel-blue h-16 flex items-center justify-end px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 px-4 py-2 rounded-cute hover:bg-white hover:shadow-md transition-all duration-300 transform hover:scale-105"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-md">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold text-gray-800">{user?.name || '관리자'} ✨</div>
              <div className="text-xs text-gray-500">{user?.loginId}</div>
            </div>
            <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
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

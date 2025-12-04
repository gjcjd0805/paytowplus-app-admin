'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import type { AdminUser, Center } from '@/types/api';
import { centersApi } from '@/lib/api';

interface AuthContextType {
  user: AdminUser | null;
  centers: Center[];
  selectedCenter: Center | null;
  isLoading: boolean;
  login: (loginId: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  selectCenter: (center: Center) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // 초기 로드 시 로컬스토리지에서 데이터 복원
    const storedUser = localStorage.getItem('adminUser');
    const storedCenter = localStorage.getItem('selectedCenter');

    if (storedUser) {
      setUser(JSON.parse(storedUser));

      // 센터 목록 로드
      loadCenters();

      if (storedCenter) {
        setSelectedCenter(JSON.parse(storedCenter));
      }
    }

    setIsLoading(false);
  }, []);

  const loadCenters = async () => {
    try {
      const response = await centersApi.list();
      setCenters(response.centers);

      // 저장된 센터가 없으면 첫 번째 센터를 선택
      const storedCenter = localStorage.getItem('selectedCenter');
      if (!storedCenter && response.centers.length > 0) {
        const firstCenter = response.centers[0];
        setSelectedCenter(firstCenter);
        localStorage.setItem('selectedCenter', JSON.stringify(firstCenter));
      }
    } catch (error) {
      console.error('센터 목록 로드 실패:', error);
    }
  };

  const login = async (loginId: string, password: string) => {
    try {
      const adminUser = await adminApi.login({ loginId, password });

      setUser(adminUser);

      // adminUser만 로컬스토리지에 저장 (토큰은 httpOnly 쿠키로 자동 설정됨)
      localStorage.setItem('adminUser', JSON.stringify(adminUser));

      // 센터 목록 로드
      await loadCenters();

      router.push('/users');
    } catch (error) {
      console.error('로그인 실패:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // 서버에 로그아웃 요청 (쿠키 삭제)
      await adminApi.logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      setUser(null);
      setSelectedCenter(null);
      setCenters([]);

      localStorage.removeItem('adminUser');
      localStorage.removeItem('selectedCenter');

      router.push('/login');
    }
  };

  const selectCenter = (center: Center) => {
    setSelectedCenter(center);
    localStorage.setItem('selectedCenter', JSON.stringify(center));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        centers,
        selectedCenter,
        isLoading,
        login,
        logout,
        selectCenter,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

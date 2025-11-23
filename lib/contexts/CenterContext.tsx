'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Center {
  centerId: number;
  centerName: string;
  name: string;
  pgCode?: string;
  recurringMid?: string;
  manualMid?: string;
}

interface CenterContextType {
  selectedCenter: Center | null;
  setSelectedCenter: (center: Center) => void;
}

const CenterContext = createContext<CenterContextType | undefined>(undefined);

export function CenterProvider({ children }: { children: ReactNode }) {
  const [selectedCenter, setSelectedCenterState] = useState<Center | null>(null);

  useEffect(() => {
    // localStorage에서 센터 정보 로드
    if (typeof window !== 'undefined') {
      const storedCenter = localStorage.getItem('selectedCenter');
      if (storedCenter) {
        setSelectedCenterState(JSON.parse(storedCenter));
      }
    }
  }, []);

  const setSelectedCenter = (center: Center) => {
    setSelectedCenterState(center);
    if (typeof window !== 'undefined') {
      localStorage.setItem('selectedCenter', JSON.stringify(center));
      // 센터 변경 이벤트 발생
      window.dispatchEvent(new Event('centerChanged'));
    }
  };

  return (
    <CenterContext.Provider value={{ selectedCenter, setSelectedCenter }}>
      {children}
    </CenterContext.Provider>
  );
}

export function useCenter() {
  const context = useContext(CenterContext);
  if (context === undefined) {
    throw new Error('useCenter must be used within a CenterProvider');
  }
  return context;
}

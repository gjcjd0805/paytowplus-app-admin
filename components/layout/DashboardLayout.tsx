'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';
import { SidebarProvider } from '@/lib/contexts/SidebarContext';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // 로그인 페이지는 레이아웃 없이 렌더링
  if (pathname === '/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-2 sm:p-4 lg:p-6 lg:ml-64">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

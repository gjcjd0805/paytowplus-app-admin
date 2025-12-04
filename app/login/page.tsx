'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/lib/api';
import { ApiError } from '@/lib/api-client';

export default function LoginPage() {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const adminUser = await adminApi.login({ loginId, password });

      // adminUser만 localStorage에 저장 (토큰은 httpOnly 쿠키로 자동 설정됨)
      localStorage.setItem('adminUser', JSON.stringify(adminUser));

      // 회원관리 페이지로 이동
      router.push('/users');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('로그인 중 오류가 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-full max-w-7xl flex">
        {/* 왼쪽 일러스트 영역 */}
        <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-center items-center">
          <div className="relative w-full max-w-md">
            {/* 차트 아이콘들 */}
            <div className="absolute top-0 left-8">
              <svg className="w-20 h-20 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4 2h2v12h-2V9zm4-4h2v16h-2V5z" />
              </svg>
            </div>

            <div className="absolute top-4 right-8">
              <svg className="w-20 h-20 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z" />
              </svg>
            </div>

            <div className="absolute bottom-32 left-4">
              <svg className="w-24 h-24 text-blue-300" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="#60A5FA" />
                <path d="M50 50 L50 10 A40 40 0 0 1 85 65 Z" fill="#3B82F6" />
              </svg>
            </div>

            <div className="absolute bottom-20 right-12">
              <svg className="w-16 h-16 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M3.5 18.5l6-6 4 4L22 6.92 20.59 5.5 13.5 12.5l-4-4L2 16l1.5 2.5z" />
              </svg>
            </div>

            {/* 비즈니스맨 일러스트 */}
            <div className="relative z-10 flex justify-center items-center">
              <svg className="w-80 h-80" viewBox="0 0 400 500" fill="none">
                {/* 머리 */}
                <ellipse cx="200" cy="120" rx="50" ry="55" fill="#8B7355" />

                {/* 얼굴 */}
                <ellipse cx="200" cy="140" rx="45" ry="50" fill="#D4A574" />

                {/* 안경 */}
                <circle cx="185" cy="135" r="15" fill="none" stroke="#4A90E2" strokeWidth="3" />
                <circle cx="215" cy="135" r="15" fill="none" stroke="#4A90E2" strokeWidth="3" />
                <line x1="200" y1="135" x2="200" y2="135" stroke="#4A90E2" strokeWidth="3" />
                <circle cx="185" cy="135" r="8" fill="#4A90E2" />
                <circle cx="215" cy="135" r="8" fill="#4A90E2" />
                <circle cx="183" cy="133" r="3" fill="white" />
                <circle cx="213" cy="133" r="3" fill="white" />

                {/* 입 */}
                <path d="M 190 155 Q 200 160 210 155" fill="none" stroke="#8B6F47" strokeWidth="2" />

                {/* 몸통 (정장) */}
                <rect x="150" y="190" width="100" height="140" rx="10" fill="#1E3A5F" />

                {/* 넥타이 */}
                <path d="M 200 190 L 195 230 L 200 250 L 205 230 Z" fill="#F59E0B" />

                {/* 와이셔츠 */}
                <path d="M 180 190 L 200 250 L 220 190" fill="white" />

                {/* 팔 (왼쪽) */}
                <rect x="130" y="200" width="25" height="100" rx="12" fill="#1E3A5F" />

                {/* 팔 (오른쪽) */}
                <rect x="245" y="200" width="25" height="100" rx="12" fill="#1E3A5F" />

                {/* 태블릿 */}
                <rect x="220" y="240" width="70" height="90" rx="5" fill="#2C3E50" />
                <rect x="225" y="245" width="60" height="75" fill="#34495E" />

                {/* 손 (왼쪽) */}
                <circle cx="142" cy="310" r="12" fill="#D4A574" />

                {/* 손 (오른쪽) */}
                <circle cx="258" cy="310" r="12" fill="#D4A574" />

                {/* 다리 */}
                <rect x="165" y="330" width="30" height="120" fill="#1E3A5F" />
                <rect x="205" y="330" width="30" height="120" fill="#1E3A5F" />

                {/* 신발 */}
                <ellipse cx="180" cy="455" rx="20" ry="12" fill="#8B4513" />
                <ellipse cx="220" cy="455" rx="20" ry="12" fill="#8B4513" />
              </svg>
            </div>
          </div>
        </div>

        {/* 오른쪽 로그인 폼 */}
        <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-10">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-2">
                  <div className="bg-[#1E3A8A] text-white px-3 py-1 rounded-full text-sm font-bold">
                    pay++
                  </div>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900">Login</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-2">
                  ID
                </label>
                <input
                  id="loginId"
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
                  placeholder="아이디를 입력해 주세요."
                  required
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all bg-gray-50"
                  placeholder="비밀번호를 입력해 주세요."
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-semibold py-3.5 px-4 rounded-md transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed mt-8"
              >
                {isLoading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            <div className="mt-12 text-center text-sm text-gray-400">
              © 2025. pay++ All rights reserved.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

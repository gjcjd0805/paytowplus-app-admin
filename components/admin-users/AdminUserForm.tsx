'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { ApiError } from '@/lib/api-client';
import AlertModal from '@/components/common/AlertModal';

interface AdminUserFormProps {
  adminUserId: number | null;
  onClose: () => void;
}

export default function AdminUserForm({ adminUserId, onClose }: AdminUserFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Alert Modal
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
  });

  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [tel, setTel] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (adminUserId) {
      loadAdminUser();
    }
  }, [adminUserId]);

  const loadAdminUser = async () => {
    if (!adminUserId) return;

    setIsLoading(true);
    try {
      const user = await adminApi.get(adminUserId);
      setLoginId(user.loginId);
      setName(user.name);
      setTel(user.tel || '');
      setPhone(user.phone);
      setEmail(user.email || '');
    } catch (err) {
      console.error('계정 정보 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const data = {
        loginId,
        password: password || undefined,
        name,
        tel: tel || undefined,
        phone,
        email: email || undefined,
      };

      if (adminUserId) {
        await adminApi.update(adminUserId, data);
      } else {
        await adminApi.create({ ...data, password: password || 'password123' });
      }

      onClose();
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: '저장 실패',
          message: err.message,
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: '저장 실패',
          message: '저장 중 오류가 발생했습니다.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      <form onSubmit={handleSubmit} className="space-y-6">

      <div className="grid grid-cols-2 gap-6">
        {/* 아이디 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            아이디 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            disabled={!!adminUserId}
            placeholder="아이디를 입력해 주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none disabled:bg-gray-100"
            required
          />
        </div>

        {/* 비밀번호 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            비밀번호 {adminUserId && <span className="text-gray-500 text-xs">(변경 시에만 입력)</span>}
            {!adminUserId && <span className="text-red-500">*</span>}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={adminUserId ? '비밀번호 변경' : '비밀번호를 입력해 주세요.'}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required={!adminUserId}
          />
        </div>

        {/* 이름 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이름 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력해 주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
        </div>

        {/* 연락처 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">연락처</label>
          <input
            type="tel"
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            placeholder="연락처를 입력해 주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>

        {/* 휴대폰 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            휴대폰 <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="휴대폰 번호를 입력해 주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            required
          />
        </div>

        {/* 이메일 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일을 입력해 주세요."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-400"
        >
          {isLoading ? '저장 중...' : adminUserId ? '수정' : '등록'}
        </button>
      </div>
    </form>
    </>
  );
}

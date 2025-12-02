'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import UserForm from '@/components/users/UserForm';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const initialUserId = params.id === 'new' ? null : Number(params.id);
  const [pageTitle, setPageTitle] = useState(initialUserId ? '회원 수정' : '회원 등록');

  const handleClose = () => {
    router.push('/users');
  };

  const handleUserCreated = (newUserId: number) => {
    // URL 변경 (새로고침 없이)
    window.history.replaceState(null, '', `/users/${newUserId}`);
    setPageTitle('회원 수정');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {pageTitle}
        </h1>
      </div>

      <UserForm
        userId={initialUserId}
        onClose={handleClose}
        onUserCreated={handleUserCreated}
      />
    </div>
  );
}

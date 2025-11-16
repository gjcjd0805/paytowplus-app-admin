'use client';

import { useRouter, useParams } from 'next/navigation';
import UserForm from '@/components/users/UserForm';

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id === 'new' ? null : Number(params.id);

  const handleClose = () => {
    router.push('/users');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {userId ? '회원 수정' : '회원 등록'}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <UserForm userId={userId} onClose={handleClose} />
      </div>
    </div>
  );
}

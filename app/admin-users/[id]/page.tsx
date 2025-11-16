'use client';

import { useRouter, useParams } from 'next/navigation';
import AdminUserForm from '@/components/admin-users/AdminUserForm';

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const adminUserId = params.id === 'new' ? null : Number(params.id);

  const handleClose = () => {
    router.push('/admin-users');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {adminUserId ? '계정 수정' : '계정 등록'}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <AdminUserForm adminUserId={adminUserId} onClose={handleClose} />
      </div>
    </div>
  );
}

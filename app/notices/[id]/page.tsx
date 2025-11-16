'use client';

import { useRouter, useParams } from 'next/navigation';
import NoticeForm from '@/components/notices/NoticeForm';

export default function NoticeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const noticeId = params.id === 'new' ? null : Number(params.id);

  const handleClose = () => {
    router.push('/notices');
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {noticeId ? '공지사항 수정' : '공지사항 등록'}
        </h1>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <NoticeForm noticeId={noticeId} onClose={handleClose} />
      </div>
    </div>
  );
}

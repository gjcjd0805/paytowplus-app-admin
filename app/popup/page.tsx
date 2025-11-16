'use client';

import { useState, useEffect } from 'react';
import { popupApi } from '@/lib/api';
import type { Popup, PopupStatus } from '@/types/api';
import { ApiError } from '@/lib/api-client';
import AlertModal from '@/components/common/AlertModal';
import dynamic from 'next/dynamic';

const CKEditorWrapper = dynamic(() => import('@/components/common/CKEditorWrapper'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded p-4 text-gray-500">에디터를 로딩 중...</div>,
});

export default function PopupPage() {
  const [popup, setPopup] = useState<Popup | null>(null);
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

  const [popupStatus, setPopupStatus] = useState<PopupStatus>('INACTIVE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    loadPopup();
  }, []);

  const loadPopup = async () => {
    setIsLoading(true);
    try {
      const data = await popupApi.get();
      if (data) {
        setPopup(data);
        setPopupStatus(data.popupStatus);
        setTitle(data.title);
        setContent(data.content);
      }
    } catch (err) {
      console.error('팝업 조회 실패:', err);
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
        popupStatus,
        title,
        content,
      };

      await popupApi.create(data);
      setAlertModal({
        isOpen: true,
        type: 'success',
        title: '저장 완료',
        message: '팝업이 성공적으로 저장되었습니다.',
      });
      loadPopup();
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

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5zm11 1H6v8l4-2 4 2V6z" clipRule="evenodd" />
            </svg>
            팝업 관리
          </h1>
        </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">
          {/* 적용여부 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">적용여부</label>
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={popupStatus === 'INACTIVE'}
                  onChange={() => setPopupStatus('INACTIVE')}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm">미적용</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={popupStatus === 'ACTIVE'}
                  onChange={() => setPopupStatus('ACTIVE')}
                  className="mr-2 w-4 h-4"
                />
                <span className="text-sm">적용</span>
              </label>
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full max-w-2xl px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              required
              placeholder="제목을 입력하세요"
            />
          </div>

          {/* 내용 + 미리보기 */}
          <div className="flex gap-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <CKEditorWrapper
                value={content}
                onChange={setContent}
                placeholder="팝업 내용을 입력하세요"
              />
            </div>

            {/* 미리보기 */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">미리보기</label>
              <div className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50 flex items-center justify-center" style={{ width: '380px', height: '680px' }}>
                <div className="relative" style={{ width: '320px', height: '630px' }}>
                  {/* 아이폰 프레임 */}
                  <div className="absolute inset-0 border-8 border-black rounded-[45px] bg-white overflow-hidden shadow-xl">
                    {/* 노치 */}
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-36 h-6 bg-black rounded-b-3xl z-10"></div>

                    {/* 팝업 내용 */}
                    <div className="p-5 pt-10 h-full overflow-auto">
                      {title && (
                        <h3 className="text-sm font-bold text-gray-900 mb-2">{title}</h3>
                      )}
                      {content ? (
                        <div
                          className="text-xs text-gray-700"
                          dangerouslySetInnerHTML={{ __html: content }}
                        />
                      ) : (
                        <p className="text-xs text-gray-400">내용을 입력하면 여기에 미리보기가 표시됩니다.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="flex justify-start pt-6 border-t">
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-medium"
            >
              {isLoading ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
}

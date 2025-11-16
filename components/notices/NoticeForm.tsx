'use client';

import { useState, useEffect } from 'react';
import { noticesApi } from '@/lib/api';
import type { NoticeType } from '@/types/api';
import { ApiError } from '@/lib/api-client';
import AlertModal from '@/components/common/AlertModal';
import ConfirmModal from '@/components/common/ConfirmModal';
import dynamic from 'next/dynamic';

const CKEditorWrapper = dynamic(() => import('@/components/common/CKEditorWrapper'), {
  ssr: false,
  loading: () => <div className="border border-gray-300 rounded p-4 text-gray-500">에디터를 로딩 중...</div>,
});

interface NoticeFormProps {
  noticeId: number | null;
  onClose: () => void;
}

export default function NoticeForm({ noticeId, onClose }: NoticeFormProps) {
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

  // Confirm Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    title?: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    type: 'warning',
    message: '',
    onConfirm: () => {},
  });

  const [noticeType, setNoticeType] = useState<NoticeType>('GENERAL');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    if (noticeId) {
      loadNotice();
    } else {
      // 새 공지사항인 경우 작성자 자동 입력
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setAuthor(user.name || '관리자');
    }
  }, [noticeId]);

  const loadNotice = async () => {
    if (!noticeId) return;

    setIsLoading(true);
    try {
      const notice = await noticesApi.get(noticeId);
      setNoticeType(notice.noticeType);
      setTitle(notice.title);
      setContent(notice.content);
      setAuthor(notice.author);
    } catch (err) {
      console.error('공지사항 정보 로드 실패:', err);
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
        noticeType,
        title,
        content,
        author,
      };

      if (noticeId) {
        await noticesApi.update(noticeId, data);
      } else {
        await noticesApi.create(data);
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

  const handleDelete = async () => {
    if (!noticeId) return;

    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: '삭제 확인',
      message: '정말 삭제하시겠습니까?',
      onConfirm: async () => {
        setIsLoading(true);
        try {
          await noticesApi.delete(noticeId);
          onClose();
        } catch (err) {
          if (err instanceof ApiError) {
            setAlertModal({
              isOpen: true,
              type: 'error',
              title: '삭제 실패',
              message: err.message,
            });
          } else {
            setAlertModal({
              isOpen: true,
              type: 'error',
              title: '삭제 실패',
              message: '삭제 중 오류가 발생했습니다.',
            });
          }
        } finally {
          setIsLoading(false);
        }
      },
    });
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        type={confirmModal.type}
        title={confirmModal.title}
        message={confirmModal.message}
      />

      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl">

      {/* 적용여부 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">구분</label>
        <div className="flex items-center space-x-6">
          <label className="flex items-center">
            <input
              type="radio"
              checked={noticeType === 'GENERAL'}
              onChange={() => setNoticeType('GENERAL')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm">일반</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={noticeType === 'IMPORTANT'}
              onChange={() => setNoticeType('IMPORTANT')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm">중요</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              checked={noticeType === 'FIXED'}
              onChange={() => setNoticeType('FIXED')}
              className="mr-2 w-4 h-4"
            />
            <span className="text-sm">고정</span>
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
            placeholder="공지사항 내용을 입력하세요"
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

                {/* 공지사항 내용 */}
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

      {/* 작성자 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">작성자</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="w-full max-w-xs px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
          readOnly
        />
      </div>

      {/* 버튼 */}
      <div className="flex justify-between pt-6 border-t">
        {noticeId && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
          >
            삭제
          </button>
        )}
        <div className="flex space-x-3 ml-auto">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-medium"
          >
            {isLoading ? '저장 중...' : noticeId ? '수정' : '등록'}
          </button>
        </div>
      </div>
    </form>
    </>
  );
}

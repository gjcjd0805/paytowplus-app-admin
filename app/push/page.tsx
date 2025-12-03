'use client';

import { useState } from 'react';
import { pushApi, type PushActionType, type BroadcastPushRequest } from '@/lib/api/push';
import { ApiError } from '@/lib/api-client';
import AlertModal from '@/components/common/AlertModal';
import ConfirmModal from '@/components/common/ConfirmModal';

const actionTypeOptions: { value: PushActionType; label: string; description: string }[] = [
  { value: 'STORE', label: '앱 스토어', description: 'Play Store / App Store로 이동' },
  { value: 'NOTICE', label: '공지사항', description: '공지사항 화면으로 이동' },
  { value: 'SCREEN', label: '앱 화면', description: '특정 앱 화면으로 이동' },
  { value: 'WEB', label: '외부 링크', description: '외부 브라우저로 URL 열기' },
];

const screenNameOptions = [
  { value: 'HOME', label: '홈' },
  { value: 'CARD_MANAGEMENT', label: '카드 관리' },
  { value: 'PAYMENT_HISTORY', label: '결제 내역' },
  { value: 'NOTICE', label: '공지사항' },
  { value: 'SETTINGS', label: '설정' },
];

export default function PushPage() {
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [actionType, setActionType] = useState<PushActionType>('NOTICE');
  const [targetId, setTargetId] = useState('');
  const [screenName, setScreenName] = useState('HOME');
  const [url, setUrl] = useState('');

  // Modal state
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

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        title: '입력 오류',
        message: '제목을 입력해주세요.',
      });
      return;
    }

    if (!body.trim()) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        title: '입력 오류',
        message: '내용을 입력해주세요.',
      });
      return;
    }

    if (actionType === 'WEB' && !url.trim()) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        title: '입력 오류',
        message: 'URL을 입력해주세요.',
      });
      return;
    }

    // 확인 모달 표시
    setConfirmModal({ isOpen: true });
  };

  const handleConfirmSend = async () => {
    setConfirmModal({ isOpen: false });
    setIsLoading(true);

    try {
      const request: BroadcastPushRequest = {
        title: title.trim(),
        body: body.trim(),
        actionType,
      };

      if (actionType === 'NOTICE' && targetId) {
        request.targetId = parseInt(targetId, 10);
      } else if (actionType === 'SCREEN') {
        request.screenName = screenName;
      } else if (actionType === 'WEB') {
        request.url = url.trim();
      }

      await pushApi.broadcast(request);

      setAlertModal({
        isOpen: true,
        type: 'success',
        title: '발송 완료',
        message: '푸시 알림이 성공적으로 발송되었습니다.',
      });

      // 폼 초기화
      setTitle('');
      setBody('');
      setActionType('NOTICE');
      setTargetId('');
      setScreenName('HOME');
      setUrl('');
    } catch (err) {
      if (err instanceof ApiError) {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: '발송 실패',
          message: err.message,
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'error',
          title: '발송 실패',
          message: '푸시 발송 중 오류가 발생했습니다.',
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

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false })}
        onConfirm={handleConfirmSend}
        title="푸시 알림 발송"
        message="전체 사용자에게 푸시 알림을 발송하시겠습니까?"
        confirmText="발송"
        cancelText="취소"
      />

      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.147 3.147a.5.5 0 00-.294-.147H3a1 1 0 00-1 1v10a1 1 0 001 1h1v2a1 1 0 001.6.8L9 15h8a1 1 0 001-1V4a1 1 0 00-1-1h-.853zM4 5h12v8H8.5L6 14.5V13H4V5z" />
              <path d="M7 7h6v1H7V7zm0 2h4v1H7V9z" />
            </svg>
            푸시 알림 발송
          </h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
            {/* 제목 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                제목 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="푸시 알림 제목을 입력하세요"
                maxLength={100}
              />
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none"
                placeholder="푸시 알림 내용을 입력하세요"
                rows={4}
                maxLength={500}
              />
            </div>

            {/* 액션 타입 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                클릭 시 동작 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {actionTypeOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex flex-col p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      actionType === option.value
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="actionType"
                        value={option.value}
                        checked={actionType === option.value}
                        onChange={(e) => setActionType(e.target.value as PushActionType)}
                        className="mr-2"
                      />
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 ml-6">{option.description}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 액션별 추가 입력 필드 */}
            {actionType === 'NOTICE' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  공지사항 ID (선택)
                </label>
                <input
                  type="number"
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="특정 공지사항으로 이동 시 ID 입력 (비워두면 목록으로 이동)"
                />
              </div>
            )}

            {actionType === 'SCREEN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이동할 화면 <span className="text-red-500">*</span>
                </label>
                <select
                  value={screenName}
                  onChange={(e) => setScreenName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                >
                  {screenNameOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {actionType === 'WEB' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  placeholder="https://example.com"
                />
              </div>
            )}

            {/* 미리보기 */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-3">미리보기</label>
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 max-w-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">P++</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {title || '푸시 알림 제목'}
                    </p>
                    <p className="text-gray-600 text-xs mt-0.5 line-clamp-2">
                      {body || '푸시 알림 내용이 여기에 표시됩니다.'}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">지금</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 발송 버튼 */}
            <div className="flex justify-start pt-4 border-t">
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-medium flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    발송 중...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    전체 발송
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

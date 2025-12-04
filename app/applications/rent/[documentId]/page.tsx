'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { rentApplicationsApi } from '@/lib/api';
import type { RentApplicationDetail } from '@/types/api';
import { formatDateTime, formatStatus, getBankName } from '@/utils/format';
import RentApprovalModal, { type RentApprovalData } from '@/components/applications/RentApprovalModal';
import AlertModal from '@/components/common/AlertModal';

export default function RentApplicationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = Number(params.documentId);

  const [detail, setDetail] = useState<RentApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageName, setSelectedImageName] = useState<string>('');
  const [alertModal, setAlertModal] = useState<{ isOpen: boolean; message: string; type: 'success' | 'error' }>({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    loadDetail();
  }, [documentId]);

  const handleImageClick = (imageUrl: string, imageName: string) => {
    setSelectedImage(imageUrl);
    setSelectedImageName(imageName);
  };

  const handleDownloadImage = async () => {
    if (!selectedImage) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setAlertModal({ isOpen: true, message: '로그인이 필요합니다.', type: 'error' });
        return;
      }

      // 백엔드 다운로드 API 사용
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:18080/admin/api/v1';
      const downloadUrl = `${apiBaseUrl}/download/image?imageUrl=${encodeURIComponent(selectedImage)}`;

      const response = await fetch(downloadUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('이미지 다운로드에 실패했습니다.');
      }

      // Blob으로 변환
      const blob = await response.blob();

      // 다운로드
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedImageName || 'image.jpg';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('이미지 다운로드 실패:', error);
      setAlertModal({ isOpen: true, message: '이미지 다운로드에 실패했습니다.', type: 'error' });
    }
  };

  const loadDetail = async () => {
    setIsLoading(true);
    try {
      const response = await rentApplicationsApi.getDocumentDetail(documentId);
      setDetail(response);
    } catch (error) {
      console.error('월세 신청 상세 조회 실패:', error);
      setAlertModal({ isOpen: true, message: '월세 신청 상세 조회에 실패했습니다.', type: 'error' });
      router.push('/applications/rent');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (rentData: RentApprovalData) => {
    if (!detail) return;

    setIsProcessing(true);
    try {
      const adminId = Number(localStorage.getItem('adminId'));
      await rentApplicationsApi.approve(documentId, {
        adminId,
        ...rentData,
      });
      setShowApproveModal(false);
      setAlertModal({ isOpen: true, message: '승인이 완료되었습니다.', type: 'success' });
      loadDetail();
    } catch (error) {
      console.error('승인 실패:', error);
      setAlertModal({ isOpen: true, message: '승인에 실패했습니다.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!detail || !rejectReason.trim()) {
      setAlertModal({ isOpen: true, message: '거부 사유를 입력해주세요.', type: 'error' });
      return;
    }

    setIsProcessing(true);
    try {
      const adminId = Number(localStorage.getItem('adminId'));
      await rentApplicationsApi.reject(documentId, { adminId, reason: rejectReason });
      setShowRejectModal(false);
      setRejectReason('');
      setAlertModal({ isOpen: true, message: '거부가 완료되었습니다.', type: 'success' });
      loadDetail();
    } catch (error) {
      console.error('거부 실패:', error);
      setAlertModal({ isOpen: true, message: '거부에 실패했습니다.', type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Note: 해지 기능은 회원 정보 페이지에서만 제공

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!detail) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
          </svg>
          월세 신청 상세
        </h1>
        <button
          onClick={() => router.push('/applications/rent')}
          className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors"
        >
          목록으로
        </button>
      </div>

      {/* 기본 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NO</label>
            <div className="text-sm text-gray-900">{detail.documentId}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">승인상태</label>
            <div>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                detail.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                detail.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                detail.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                detail.status === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {formatStatus(detail.status)}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">회원명</label>
            <div className="text-sm text-gray-900">{detail.userName}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">아이디</label>
            <div className="text-sm text-gray-900">{detail.loginId}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
            <div className="text-sm text-gray-900">{detail.phoneNumber}</div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">신청일시</label>
            <div className="text-sm text-gray-900">{formatDateTime(detail.uploadedAt)}</div>
          </div>
          {detail.reviewedAt && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">처리일시</label>
              <div className="text-sm text-gray-900">{formatDateTime(detail.reviewedAt)}</div>
            </div>
          )}
          {detail.rejectedReason && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">거부사유</label>
              <div className="text-sm text-gray-900">{detail.rejectedReason}</div>
            </div>
          )}
          {detail.cancelledReason && (
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">해지사유</label>
              <div className="text-sm text-gray-900">{detail.cancelledReason}</div>
            </div>
          )}
        </div>
      </div>

      {/* 약관 동의 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">약관 동의 정보</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">서비스 이용약관</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${detail.serviceTermsAgreed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {detail.serviceTermsAgreed ? '동의' : '미동의'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">개인정보 처리방침</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${detail.privacyPolicyAgreed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {detail.privacyPolicyAgreed ? '동의' : '미동의'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">전자금융거래 이용약관</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${detail.electronicFinanceAgreed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {detail.electronicFinanceAgreed ? '동의' : '미동의'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">결제 이용약관</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${detail.paymentAgreed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {detail.paymentAgreed ? '동의' : '미동의'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">마케팅 정보 수신</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${detail.marketingAgreed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {detail.marketingAgreed ? '동의' : '미동의'}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <span className="text-sm text-gray-700">맞춤 광고</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${detail.personalizedAdAgreed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              {detail.personalizedAdAgreed ? '동의' : '미동의'}
            </span>
          </div>
        </div>
        {detail.termsAgreedAt && (
          <div className="mt-3 text-sm text-gray-500">
            동의일시: {formatDateTime(detail.termsAgreedAt)}
          </div>
        )}
      </div>

      {/* 임대인 계좌 정보 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">임대인 계좌 정보</h2>
        {detail.bankCode && detail.accountNumber ? (
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">은행</label>
              <div className="text-sm text-gray-900">{getBankName(detail.bankCode)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">계좌번호</label>
              <div className="text-sm text-gray-900">{detail.accountNumber}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예금주</label>
              <div className="text-sm text-gray-900">{detail.accountHolder || '-'}</div>
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">등록된 계좌 정보가 없습니다.</div>
        )}
      </div>

      {/* 제출 서류 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">제출 서류</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">임대차 계약서</label>
            <div className="border border-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
              <img
                src={detail.contractImagePath}
                alt="임대차 계약서"
                className="w-full h-64 object-contain bg-gray-50"
                onClick={() => handleImageClick(detail.contractImagePath, `임대차_계약서_${detail.documentId}.jpg`)}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E이미지 없음%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">신분증</label>
            <div className="border border-gray-200 rounded overflow-hidden cursor-pointer hover:opacity-75 transition-opacity">
              <img
                src={detail.idCardImagePath}
                alt="신분증"
                className="w-full h-64 object-contain bg-gray-50"
                onClick={() => handleImageClick(detail.idCardImagePath, `신분증_${detail.documentId}.jpg`)}
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23f3f4f6" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E이미지 없음%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 액션 버튼 - 승인/거부만 (해지는 회원 정보에서 처리) */}
      {detail.status === 'PENDING' && (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setShowApproveModal(true)}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          >
            승인
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
          >
            거부
          </button>
        </div>
      )}

      {/* 승인 모달 */}
      <RentApprovalModal
        isOpen={showApproveModal}
        onClose={() => setShowApproveModal(false)}
        onConfirm={handleApprove}
        userId={detail.userId}
        isProcessing={isProcessing}
        documentBankCode={detail.bankCode}
        documentAccountNumber={detail.accountNumber}
        documentAccountHolder={detail.accountHolder}
      />

      {/* 거부 모달 */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">거부 사유 입력</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거부 사유를 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm mb-4 h-32 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason('');
                }}
                disabled={isProcessing}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isProcessing ? '처리 중...' : '거부'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 확대 모달 */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* 이미지 영역 - 버튼 공간 확보를 위해 max-h 제한 */}
          <div className="flex-1 flex items-center justify-center w-full max-h-[calc(100vh-120px)] mb-4">
            <img
              src={selectedImage}
              alt="확대 이미지"
              className="max-w-full max-h-full object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* 하단 버튼 영역 - 항상 고정 위치 */}
          <div className="flex gap-3 pb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownloadImage();
              }}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              다운로드
            </button>
            <button
              onClick={() => setSelectedImage(null)}
              className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-gray-100 text-gray-900 rounded-lg transition-all shadow-lg hover:shadow-xl font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              닫기
            </button>
          </div>
        </div>
      )}

      {/* Alert Modal */}
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ isOpen: false, message: '', type: 'success' })}
        type={alertModal.type}
        message={alertModal.message}
      />
    </div>
  );
}

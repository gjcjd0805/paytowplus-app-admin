'use client';

import { useState, useEffect } from 'react';
import { merchantWithdrawalsApi } from '@/lib/api';
import { accountApi } from '@/lib/api/account';
import type { PaymentPurpose } from '@/types/api';
import AlertModal from '@/components/common/AlertModal';

interface MerchantWithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  paymentPurpose: PaymentPurpose;
}

// 은행 코드 매핑
const BANK_LIST = [
  { code: '004', name: 'KB국민은행' },
  { code: '003', name: '기업은행' },
  { code: '011', name: '농협은행' },
  { code: '020', name: '우리은행' },
  { code: '088', name: '신한은행' },
  { code: '081', name: '하나은행' },
  { code: '023', name: 'SC제일은행' },
  { code: '027', name: '한국씨티은행' },
  { code: '031', name: '대구은행' },
  { code: '032', name: '부산은행' },
  { code: '034', name: '광주은행' },
  { code: '035', name: '제주은행' },
  { code: '037', name: '전북은행' },
  { code: '039', name: '경남은행' },
  { code: '045', name: '새마을금고' },
  { code: '048', name: '신협' },
  { code: '050', name: '저축은행' },
  { code: '071', name: '우체국' },
  { code: '090', name: '카카오뱅크' },
  { code: '089', name: '케이뱅크' },
  { code: '092', name: '토스뱅크' },
];

export default function MerchantWithdrawalModal({
  isOpen,
  onClose,
  onSuccess,
  paymentPurpose,
}: MerchantWithdrawalModalProps) {
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('');
  const [depositorName, setDepositorName] = useState('');
  const [transferMemo, setTransferMemo] = useState('');
  const [otpCode, setOtpCode] = useState('');

  const [accountVerified, setAccountVerified] = useState(false);
  const [accountVerifying, setAccountVerifying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // 기본값 설정
  useEffect(() => {
    if (isOpen) {
      // 센터명을 입금자명 기본값으로 설정
      const selectedCenter = JSON.parse(localStorage.getItem('selectedCenter') || '{}');
      if (selectedCenter?.name) {
        setDepositorName(selectedCenter.name);
      }

      // 현재 날짜로 이체 메모 기본값 설정
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setTransferMemo(`${year}-${month}-${day} 머천트 출금이체`);
    }
  }, [isOpen]);

  // Alert Modal
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  }>({
    isOpen: false,
    type: 'info',
    message: '',
  });

  // 계좌 정보 변경 시 인증 해제
  useEffect(() => {
    if (accountVerified) {
      setAccountVerified(false);
    }
  }, [bankCode, accountNumber]);

  const handleAccountVerify = async () => {
    if (!bankCode || !accountNumber) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '은행과 계좌번호를 입력해주세요.',
      });
      return;
    }

    setAccountVerifying(true);
    try {
      const response = await accountApi.verify(bankCode, accountNumber);
      setAccountHolder(response.bank_holder);
      setAccountVerified(true);
      setAlertModal({
        isOpen: true,
        type: 'success',
        message: `계좌 인증이 완료되었습니다.\n예금주: ${response.bank_holder}`,
      });
    } catch (err) {
      setAccountVerified(false);
      setAlertModal({
        isOpen: true,
        type: 'error',
        message: '계좌 인증에 실패했습니다. 계좌 정보를 확인해주세요.',
      });
    } finally {
      setAccountVerifying(false);
    }
  };

  const handleSubmit = async () => {
    // 유효성 검사
    if (!bankCode || !accountNumber || !accountHolder) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '계좌 정보를 모두 입력해주세요.',
      });
      return;
    }

    if (!accountVerified) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '계좌 인증을 완료해주세요.',
      });
      return;
    }

    const amount = Number(withdrawalAmount.replace(/,/g, ''));
    if (!withdrawalAmount || amount < 500) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '출금 금액은 500원 이상이어야 합니다.',
      });
      return;
    }

    if (!otpCode || otpCode.length !== 6) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: 'OTP 인증번호 6자리를 입력해주세요.',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const selectedCenter = JSON.parse(localStorage.getItem('selectedCenter') || '{}');
      if (!selectedCenter?.centerId) {
        setAlertModal({
          isOpen: true,
          type: 'error',
          message: '센터를 선택해주세요.',
        });
        setIsProcessing(false);
        return;
      }

      await merchantWithdrawalsApi.create({
        centerId: selectedCenter.centerId,
        paymentPurpose,
        bankCode,
        accountNumber,
        accountHolder,
        withdrawalAmount: Number(withdrawalAmount.replace(/,/g, '')),
        depositorName: depositorName || undefined,
        transferMemo: transferMemo || undefined,
        otpCode,
      });

      onSuccess();
      handleClose();
    } catch (err: any) {
      console.error('출금 요청 실패:', err);
      setAlertModal({
        isOpen: true,
        type: 'error',
        message: err.message || '출금 요청에 실패했습니다.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    // 모달 닫을 때 초기화
    setBankCode('');
    setAccountNumber('');
    setAccountHolder('');
    setWithdrawalAmount('');
    setDepositorName('');
    setTransferMemo('');
    setOtpCode('');
    setAccountVerified(false);
    onClose();
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-4xl">
          <div className="bg-white border-b border-gray-200 px-6 py-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 mr-2 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              머천트 출금 요청
              <span className="ml-2 text-sm font-normal text-gray-600">
                ({paymentPurpose === 'DELIVERY_CHARGE' ? '배달비' : '월세'})
              </span>
            </h3>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* 계좌 정보 - 왼쪽 */}
              <div className="border-2 border-blue-300 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 bg-blue-50 py-1.5 px-2 rounded">계좌 정보</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      은행 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    >
                      <option value="">선택</option>
                      {BANK_LIST.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      계좌번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, '');
                        setAccountNumber(value);
                      }}
                      placeholder="숫자만 입력"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      예금주 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder="예금주"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                      readOnly={accountVerified}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAccountVerify}
                      disabled={accountVerifying || accountVerified}
                      className={`w-full px-2 py-1.5 rounded text-sm font-medium transition-colors ${
                        accountVerified
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {accountVerifying ? '인증 중...' : accountVerified ? '✓ 인증 완료' : '계좌 인증'}
                    </button>
                  </div>
                </div>
              </div>

              {/* 출금 정보 - 오른쪽 */}
              <div className="border-2 border-green-300 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 bg-green-50 py-1.5 px-2 rounded">출금 정보</h4>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      출금 금액 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formatNumber(withdrawalAmount)}
                      onChange={(e) => setWithdrawalAmount(e.target.value.replace(/,/g, ''))}
                      placeholder="최소 500원"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-0.5">최소 500원 이상</p>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">입금자명</label>
                    <input
                      type="text"
                      value={depositorName}
                      onChange={(e) => setDepositorName(e.target.value)}
                      placeholder="기본값: 예금주명"
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">이체 메모</label>
                    <input
                      type="text"
                      value={transferMemo}
                      onChange={(e) => setTransferMemo(e.target.value)}
                      placeholder="최대 20자"
                      maxLength={20}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OTP 인증 - 하단 */}
            <div className="border-2 border-orange-300 rounded-lg p-3 mb-3">
              <div className="flex items-center gap-4">
                <h4 className="text-sm font-semibold text-gray-700 bg-orange-50 py-1.5 px-2 rounded whitespace-nowrap">
                  OTP 인증
                </h4>
                <div className="flex-1">
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '');
                      if (value.length <= 6) {
                        setOtpCode(value);
                      }
                    }}
                    placeholder="OTP 6자리 입력"
                    maxLength={6}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <p className="text-xs text-orange-600 whitespace-nowrap">⚠️ 유효시간 30초</p>
              </div>
            </div>

            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded">
              <p className="text-xs text-yellow-800">
                <span className="font-semibold">⚠️ 주의:</span> 계좌 인증 필수 / OTP는 1회용 / 출금 후 취소 불가
              </p>
            </div>
          </div>

          <div className="bg-gray-50 border-t border-gray-200 px-6 py-3 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-5 py-1.5 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50 font-medium text-sm"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded transition-colors disabled:opacity-50 font-medium text-sm"
            >
              {isProcessing ? '처리 중...' : '출금 요청'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Modal - z-index를 더 높게 설정 */}
      {alertModal.isOpen && (
        <div className="fixed inset-0 z-[60]">
          <AlertModal
            isOpen={alertModal.isOpen}
            onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
            type={alertModal.type}
            message={alertModal.message}
          />
        </div>
      )}
    </>
  );
}

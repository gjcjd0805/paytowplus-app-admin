'use client';

import { useState, useEffect } from 'react';
import { centersApi } from '@/lib/api';
import { accountApi } from '@/lib/api/account';
import type { Center } from '@/types/api';
import AlertModal from '@/components/common/AlertModal';

interface RentApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (rentData: RentApprovalData) => void;
  userId: number;
  isProcessing: boolean;
}

export interface RentApprovalData {
  rentPgCode: string;
  rentRecurringMid: string;
  rentRecurringTid: string;
  rentManualMid: string;
  rentManualTid: string;
  rentFeeRate: number;
  rentBankCode: string;
  rentAccountNumber: string;
  rentAccountHolder: string;
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

export default function RentApprovalModal({
  isOpen,
  onClose,
  onConfirm,
  userId,
  isProcessing,
}: RentApprovalModalProps) {
  const [rentPgCode, setRentPgCode] = useState('WEROUTE');
  const [rentRecurringMid, setRentRecurringMid] = useState('');
  const [rentRecurringTid, setRentRecurringTid] = useState('');
  const [rentManualMid, setRentManualMid] = useState('');
  const [rentManualTid, setRentManualTid] = useState('');
  const [rentFeeRate, setRentFeeRate] = useState('');
  const [rentBankCode, setRentBankCode] = useState('');
  const [rentAccountNumber, setRentAccountNumber] = useState('');
  const [rentAccountHolder, setRentAccountHolder] = useState('');

  const [accountVerified, setAccountVerified] = useState(false);
  const [accountVerifying, setAccountVerifying] = useState(false);

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

  useEffect(() => {
    if (isOpen) {
      loadCenterInfo();
    }
  }, [isOpen]);

  const loadCenterInfo = async () => {
    try {
      const selectedCenter = JSON.parse(localStorage.getItem('selectedCenter') || '{}');
      if (!selectedCenter?.centerId) return;

      const response = await centersApi.list();
      const center = response.centers.find((c: Center) => c.centerId === selectedCenter.centerId);

      if (center) {
        // 월세 MID 자동 설정
        if (center.d1RecurringMid) {
          setRentRecurringMid(center.d1RecurringMid);
        }
        if (center.d1ManualMid) {
          setRentManualMid(center.d1ManualMid);
        }
      }
    } catch (err) {
      console.error('센터 정보 로드 실패:', err);
    }
  };

  const handleAccountVerify = async () => {
    if (!rentBankCode || !rentAccountNumber) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '은행과 계좌번호를 입력해주세요.',
      });
      return;
    }

    setAccountVerifying(true);
    try {
      const response = await accountApi.verify(rentBankCode, rentAccountNumber);
      setRentAccountHolder(response.bank_holder);
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

  // 계좌 정보 변경 시 인증 해제
  useEffect(() => {
    if (accountVerified) {
      setAccountVerified(false);
    }
  }, [rentBankCode, rentAccountNumber]);

  const handleSubmit = () => {
    // 유효성 검사
    if (!rentRecurringMid || !rentRecurringTid) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '정기결제 MID와 TID를 입력해주세요.',
      });
      return;
    }

    if (!rentManualMid || !rentManualTid) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '수기결제 MID와 TID를 입력해주세요.',
      });
      return;
    }

    if (!rentFeeRate) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '수수료율을 입력해주세요.',
      });
      return;
    }

    if (!rentBankCode || !rentAccountNumber || !rentAccountHolder) {
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

    const rentData: RentApprovalData = {
      rentPgCode,
      rentRecurringMid,
      rentRecurringTid,
      rentManualMid,
      rentManualTid,
      rentFeeRate: Number(rentFeeRate),
      rentBankCode,
      rentAccountNumber,
      rentAccountHolder,
    };

    onConfirm(rentData);
  };

  const handleClose = () => {
    // 모달 닫을 때 초기화
    setRentPgCode('WEROUTE');
    setRentRecurringMid('');
    setRentRecurringTid('');
    setRentManualMid('');
    setRentManualTid('');
    setRentFeeRate('');
    setRentBankCode('');
    setRentAccountNumber('');
    setRentAccountHolder('');
    setAccountVerified(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
            <h3 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg className="w-6 h-6 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
              </svg>
              월세 승인 정보 입력
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              월세 결제를 위한 정보를 입력해주세요.
            </p>
          </div>

          <div className="p-6">
            {/* 상단 2개 항목 */}
            <div className="flex gap-3 mb-4">
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PG <span className="text-red-500">*</span>
                </label>
                <select
                  value={rentPgCode}
                  onChange={(e) => setRentPgCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                >
                  <option value="WEROUTE">위루트</option>
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  수수료율 (%) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="15"
                  value={rentFeeRate}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (value <= 15 || e.target.value === '') {
                      setRentFeeRate(e.target.value);
                    }
                  }}
                  placeholder="예: 3.5"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                />
              </div>
            </div>

            {/* 3개 박스 */}
            <div className="grid grid-cols-3 gap-4">
              {/* 정기결제 박스 */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center bg-blue-50 py-2 rounded">
                  정기결제
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      MID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rentRecurringMid}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      TID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rentRecurringTid}
                      onChange={(e) => setRentRecurringTid(e.target.value)}
                      placeholder="TID 입력"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 수기결제 박스 */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center bg-orange-50 py-2 rounded">
                  수기결제
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      MID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rentManualMid}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      TID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rentManualTid}
                      onChange={(e) => setRentManualTid(e.target.value)}
                      placeholder="TID 입력"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* 계좌정보 박스 */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 text-center bg-green-50 py-2 rounded">
                  계좌정보
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      은행 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={rentBankCode}
                      onChange={(e) => setRentBankCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
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
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      계좌번호 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rentAccountNumber}
                      onChange={(e) => setRentAccountNumber(e.target.value)}
                      placeholder="계좌번호 입력"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      계좌주 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={rentAccountHolder}
                      onChange={(e) => setRentAccountHolder(e.target.value)}
                      placeholder="계좌주"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                      readOnly={accountVerified}
                    />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={handleAccountVerify}
                      disabled={accountVerifying || accountVerified}
                      className={`w-full px-3 py-2 rounded text-sm font-medium transition-colors ${
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
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">💡 안내:</span> 월세 승인 시 위 정보가 회원의 월세 결제 정보로 등록됩니다.
                계좌 인증을 반드시 완료해주세요.
              </p>
            </div>
          </div>

          <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
            <button
              onClick={handleClose}
              disabled={isProcessing}
              className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50 font-medium"
            >
              취소
            </button>
            <button
              onClick={handleSubmit}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors disabled:opacity-50 font-medium"
            >
              {isProcessing ? '처리 중...' : '승인'}
            </button>
          </div>
        </div>
      </div>

      {/* Alert Modal - z-index를 더 높게 설정하여 RentApprovalModal 위에 표시 */}
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

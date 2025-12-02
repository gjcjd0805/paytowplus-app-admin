'use client';

import { useState, useEffect } from 'react';
import { accountApi } from '@/lib/api/account';
import AlertModal from '@/components/common/AlertModal';
import type { PaymentConfigData, PaymentConfigType } from './PaymentConfigCard';

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

const CONFIG_LABELS: Record<PaymentConfigType, { icon: string; title: string }> = {
  delivery: { icon: '🚚', title: '배달비 설정' },
  rent: { icon: '🏠', title: '월세 설정' },
};

interface PaymentConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (config: PaymentConfigData) => void;
  config: PaymentConfigData;
  type: PaymentConfigType;
  centerMid?: { recurringMid: string; manualMid: string }; // 센터 기본 MID
}

export default function PaymentConfigModal({
  isOpen,
  onClose,
  onSave,
  config,
  type,
  centerMid,
}: PaymentConfigModalProps) {
  const { icon, title } = CONFIG_LABELS[type];

  // 폼 상태
  const [perLimitPrice, setPerLimitPrice] = useState('');
  const [dailyLimitPrice, setDailyLimitPrice] = useState('');
  const [annualLimitPrice, setAnnualLimitPrice] = useState('');
  const [allowedInstallmentMonths, setAllowedInstallmentMonths] = useState('12');
  const [pgCode, setPgCode] = useState('WEROUTE');
  const [recurringMid, setRecurringMid] = useState('');
  const [recurringTid, setRecurringTid] = useState('');
  const [manualMid, setManualMid] = useState('');
  const [manualTid, setManualTid] = useState('');
  const [feeRate, setFeeRate] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  // 계좌 인증 상태
  const [accountVerified, setAccountVerified] = useState(false);
  const [accountVerifying, setAccountVerifying] = useState(false);
  const [originalAccount, setOriginalAccount] = useState({ bankCode: '', accountNumber: '', accountHolder: '' });

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

  // 초기 데이터 로드
  useEffect(() => {
    if (isOpen) {
      setPerLimitPrice(config.perLimitPrice?.toString() || '1000000');
      setDailyLimitPrice(config.dailyLimitPrice?.toString() || '1000000');
      setAnnualLimitPrice(config.annualLimitPrice?.toString() || '100000000');
      setAllowedInstallmentMonths(config.allowedInstallmentMonths?.toString() || '12');
      setPgCode(config.pgCode || 'WEROUTE');
      setRecurringMid(config.recurringMid || centerMid?.recurringMid || '');
      setRecurringTid(config.recurringTid || '');
      setManualMid(config.manualMid || centerMid?.manualMid || '');
      setManualTid(config.manualTid || '');
      setFeeRate(config.feeRate?.toString() || '');
      setBankCode(config.bankCode || '');
      setAccountNumber(config.accountNumber || '');
      setAccountHolder(config.accountHolder || '');

      // 기존 계좌 정보 저장
      if (config.bankCode && config.accountNumber) {
        setOriginalAccount({
          bankCode: config.bankCode,
          accountNumber: config.accountNumber,
          accountHolder: config.accountHolder || '',
        });
        setAccountVerified(config.accountVerified || false);
      } else {
        setOriginalAccount({ bankCode: '', accountNumber: '', accountHolder: '' });
        setAccountVerified(false);
      }
    }
  }, [isOpen, config, centerMid]);

  // 계좌 변경 감지
  useEffect(() => {
    if (originalAccount.bankCode) {
      const isChanged =
        bankCode !== originalAccount.bankCode ||
        accountNumber !== originalAccount.accountNumber ||
        accountHolder !== originalAccount.accountHolder;

      if (isChanged) {
        setAccountVerified(false);
      }
    }
  }, [bankCode, accountNumber, accountHolder, originalAccount]);

  // 계좌 인증
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

  // 저장
  const handleSave = () => {
    // 필수값 검증
    if (!perLimitPrice || !dailyLimitPrice || !annualLimitPrice) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '한도 설정을 입력해주세요.',
      });
      return;
    }

    if (!feeRate) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '수수료율을 입력해주세요.',
      });
      return;
    }

    if (!recurringTid || !manualTid) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: 'TID를 입력해주세요.',
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

    const savedConfig: PaymentConfigData = {
      type,
      perLimitPrice: Number(perLimitPrice.replace(/,/g, '')),
      dailyLimitPrice: Number(dailyLimitPrice.replace(/,/g, '')),
      annualLimitPrice: Number(annualLimitPrice.replace(/,/g, '')),
      allowedInstallmentMonths: Number(allowedInstallmentMonths),
      pgCode,
      recurringMid,
      recurringTid,
      manualMid,
      manualTid,
      feeRate: Number(feeRate),
      bankCode,
      accountNumber,
      accountHolder,
      accountVerified: true,
      approvalStatus: config.approvalStatus,
      approvedDt: config.approvedDt,
    };

    onSave(savedConfig);
    // onClose는 UserForm의 handleSaveConfig에서 처리
  };

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  if (!isOpen) return null;

  return (
    <>
      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* 헤더 */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              <span className="text-xl mr-2">{icon}</span>
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* 내용 */}
          <div className="p-6 space-y-6">
            {/* 한도 설정 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                한도 설정
              </h3>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    건당한도 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formatNumber(perLimitPrice)}
                    onChange={(e) => setPerLimitPrice(e.target.value.replace(/,/g, ''))}
                    placeholder="1,000,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    일일한도 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formatNumber(dailyLimitPrice)}
                    onChange={(e) => setDailyLimitPrice(e.target.value.replace(/,/g, ''))}
                    placeholder="1,000,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    연간한도 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formatNumber(annualLimitPrice)}
                    onChange={(e) => setAnnualLimitPrice(e.target.value.replace(/,/g, ''))}
                    placeholder="100,000,000"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    허용할부 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={allowedInstallmentMonths}
                    onChange={(e) => setAllowedInstallmentMonths(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="0">일시불</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                      <option key={m} value={m}>{m}개월</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* PG 설정 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
                PG 설정
              </h3>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    PG <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={pgCode}
                    onChange={(e) => setPgCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="WEROUTE">위루트</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    수수료율 (%) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="15"
                    value={feeRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value <= 15 || e.target.value === '') {
                        setFeeRate(e.target.value);
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 정기결제 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-2 text-center">정기결제</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">MID</label>
                      <input
                        type="text"
                        value={recurringMid}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        TID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={recurringTid}
                        onChange={(e) => setRecurringTid(e.target.value)}
                        placeholder="TID 입력"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* 수기결제 */}
                <div className="border border-gray-200 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-2 text-center">수기결제</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">MID</label>
                      <input
                        type="text"
                        value={manualMid}
                        readOnly
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">
                        TID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={manualTid}
                        onChange={(e) => setManualTid(e.target.value)}
                        placeholder="TID 입력"
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 계좌 정보 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm4 9a1 1 0 100-2 1 1 0 000 2zm4-1a1 1 0 11-2 0 1 1 0 012 0zm2 1a1 1 0 100-2 1 1 0 000 2z" />
                </svg>
                계좌 정보 {type === 'rent' && '(임대인)'}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    은행 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">선택</option>
                    {BANK_LIST.map((bank) => (
                      <option key={bank.code} value={bank.code}>{bank.name}</option>
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
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="계좌번호"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    예금주 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountHolder}
                    readOnly={accountVerified}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    placeholder="예금주"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={handleAccountVerify}
                  disabled={accountVerifying || accountVerified}
                  className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                    accountVerified
                      ? 'bg-green-100 text-green-700 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {accountVerifying ? '인증 중...' : accountVerified ? '✓ 계좌 인증 완료' : '계좌 인증'}
                </button>
              </div>
            </div>
          </div>

          {/* 푸터 */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

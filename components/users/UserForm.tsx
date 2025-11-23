'use client';

import { useState, useEffect } from 'react';
import { usersApi, centersApi } from '@/lib/api';
import { rentApplicationsApi } from '@/lib/api';
import { accountApi } from '@/lib/api/account';
import type { User, Center } from '@/types/api';
import { ApiError } from '@/lib/api-client';
import AlertModal from '@/components/common/AlertModal';
import ConfirmModal from '@/components/common/ConfirmModal';

interface UserFormProps {
  userId: number | null;
  onClose: () => void;
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

export default function UserForm({ userId, onClose }: UserFormProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  // 기본 정보
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [perLimitPrice, setPerLimitPrice] = useState('1000000');
  const [dailyLimitPrice, setDailyLimitPrice] = useState('1000000');
  const [annualLimitPrice, setAnnualLimitPrice] = useState('100000000');
  const [allowedInstallmentMonths, setAllowedInstallmentMonths] = useState('12');
  const [isProductNameMutable, setIsProductNameMutable] = useState(true);
  const [isPayerNameMutable, setIsPayerNameMutable] = useState(true);
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'TERMINATED'>('ACTIVE');

  // 배달비 관련
  const [deliveryPgCode, setDeliveryPgCode] = useState('WEROUTE');
  const [deliveryRecurringMid, setDeliveryRecurringMid] = useState('');
  const [deliveryRecurringTid, setDeliveryRecurringTid] = useState('');
  const [deliveryManualMid, setDeliveryManualMid] = useState('');
  const [deliveryManualTid, setDeliveryManualTid] = useState('');
  const [deliveryFeeRate, setDeliveryFeeRate] = useState('');
  const [deliveryBankCode, setDeliveryBankCode] = useState('');
  const [deliveryAccountNumber, setDeliveryAccountNumber] = useState('');
  const [deliveryAccountHolder, setDeliveryAccountHolder] = useState('');

  // 월세 관련 (선택)
  const [rentPgCode, setRentPgCode] = useState('WEROUTE');
  const [rentRecurringMid, setRentRecurringMid] = useState('');
  const [rentRecurringTid, setRentRecurringTid] = useState('');
  const [rentManualMid, setRentManualMid] = useState('');
  const [rentManualTid, setRentManualTid] = useState('');
  const [rentFeeRate, setRentFeeRate] = useState('');
  const [rentBankCode, setRentBankCode] = useState('');
  const [rentAccountNumber, setRentAccountNumber] = useState('');
  const [rentAccountHolder, setRentAccountHolder] = useState('');
  const [rentApprovalStatus, setRentApprovalStatus] = useState<'NOT_APPLIED' | 'PENDING' | 'REJECTED' | 'APPROVED' | 'CANCELLED'>('NOT_APPLIED');

  // 메모
  const [memo, setMemo] = useState('');

  // 터미널 코드
  const [terminalCode, setTerminalCode] = useState('');
  const [copiedTerminalCode, setCopiedTerminalCode] = useState(false);

  const handleCopyTerminalCode = () => {
    if (terminalCode) {
      navigator.clipboard.writeText(terminalCode);
      setCopiedTerminalCode(true);
      setTimeout(() => setCopiedTerminalCode(false), 2000);
    }
  };

  // 계좌 인증 상태
  const [deliveryAccountVerified, setDeliveryAccountVerified] = useState(false);
  const [deliveryAccountVerifying, setDeliveryAccountVerifying] = useState(false);
  const [deliveryOriginalAccount, setDeliveryOriginalAccount] = useState({ bankCode: '', accountNumber: '', accountHolder: '' });

  const [rentAccountVerified, setRentAccountVerified] = useState(false);
  const [rentAccountVerifying, setRentAccountVerifying] = useState(false);
  const [rentOriginalAccount, setRentOriginalAccount] = useState({ bankCode: '', accountNumber: '', accountHolder: '' });

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'delivery' | 'rent'>('delivery');

  // 해지 모달 상태
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (userId) {
      loadUser();
    } else {
      // 등록 모드일 때만 센터 정보에서 MID 로드
      loadCenterInfo();
    }
  }, [userId]);

  const loadCenterInfo = async () => {
    try {
      const selectedCenter = JSON.parse(localStorage.getItem('selectedCenter') || '{}');
      if (!selectedCenter?.centerId) return;

      const response = await centersApi.list();
      const center = response.centers.find((c: Center) => c.centerId === selectedCenter.centerId);

      if (center) {
        // 배달비 MID 자동 설정
        setDeliveryRecurringMid(center.recurringMid || '');
        setDeliveryManualMid(center.manualMid || '');

        // 월세 MID 자동 설정 (있는 경우)
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

  const loadUser = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      const user = await usersApi.get(userId);
      // 기본 정보
      setLoginId(user.loginId);
      setUserName(user.userName);
      setPhoneNumber(user.phoneNumber);
      setPerLimitPrice(String(user.perLimitPrice));
      setDailyLimitPrice(String(user.dailyLimitPrice));
      setAnnualLimitPrice(String(user.annualLimitPrice));
      setAllowedInstallmentMonths(String(user.allowedInstallmentMonths));
      setIsProductNameMutable(user.isProductNameMutable);
      setIsPayerNameMutable(user.isPayerNameMutable);
      setUserStatus(user.userStatus as 'ACTIVE' | 'TERMINATED');

      // 배달비 정보
      setDeliveryPgCode(user.deliveryPgCode || 'WEROUTE');
      setDeliveryRecurringMid(user.deliveryRecurringMid || '');
      setDeliveryRecurringTid(user.deliveryRecurringTid || '');
      setDeliveryManualMid(user.deliveryManualMid || '');
      setDeliveryManualTid(user.deliveryManualTid || '');
      setDeliveryFeeRate(String(user.deliveryFeeRate));
      setDeliveryBankCode(user.deliveryBankCode || '');
      setDeliveryAccountNumber(user.deliveryAccountNumber || '');
      setDeliveryAccountHolder(user.deliveryAccountHolder || '');

      // 기존 배달비 계좌 정보 저장 (인증 완료된 것으로 간주)
      setDeliveryOriginalAccount({
        bankCode: user.deliveryBankCode || '',
        accountNumber: user.deliveryAccountNumber || '',
        accountHolder: user.deliveryAccountHolder || ''
      });
      setDeliveryAccountVerified(true);

      // 월세 정보
      setRentPgCode(user.rentPgCode || 'WEROUTE');
      setRentRecurringMid(user.rentRecurringMid || '');
      setRentRecurringTid(user.rentRecurringTid || '');
      setRentManualMid(user.rentManualMid || '');
      setRentManualTid(user.rentManualTid || '');
      setRentFeeRate(user.rentFeeRate ? String(user.rentFeeRate) : '');
      setRentBankCode(user.rentBankCode || '');
      setRentAccountNumber(user.rentAccountNumber || '');
      setRentAccountHolder(user.rentAccountHolder || '');
      setRentApprovalStatus(user.rentApprovalStatus as 'NOT_APPLIED' | 'PENDING' | 'REJECTED' | 'APPROVED' | 'CANCELLED');

      // 메모
      setMemo(user.memo || '');

      // 터미널 코드
      setTerminalCode(user.terminalCode || '');

      // 기존 월세 계좌 정보 저장 (인증 완료된 것으로 간주)
      if (user.rentBankCode && user.rentAccountNumber) {
        setRentOriginalAccount({
          bankCode: user.rentBankCode || '',
          accountNumber: user.rentAccountNumber || '',
          accountHolder: user.rentAccountHolder || ''
        });
        setRentAccountVerified(true);
      }
    } catch (err) {
      console.error('회원 정보 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 배달비 계좌 변경 감지 - 은행, 계좌번호, 계좌주 변경 시 인증 해제
  useEffect(() => {
    if (userId && deliveryOriginalAccount.bankCode) {
      const isChanged =
        deliveryBankCode !== deliveryOriginalAccount.bankCode ||
        deliveryAccountNumber !== deliveryOriginalAccount.accountNumber ||
        deliveryAccountHolder !== deliveryOriginalAccount.accountHolder;

      if (isChanged) {
        setDeliveryAccountVerified(false);
      }
    }
  }, [deliveryBankCode, deliveryAccountNumber, deliveryAccountHolder]);

  // 월세 계좌 변경 감지 - 은행, 계좌번호, 계좌주 변경 시 인증 해제
  useEffect(() => {
    if (userId && rentOriginalAccount.bankCode) {
      const isChanged =
        rentBankCode !== rentOriginalAccount.bankCode ||
        rentAccountNumber !== rentOriginalAccount.accountNumber ||
        rentAccountHolder !== rentOriginalAccount.accountHolder;

      if (isChanged) {
        setRentAccountVerified(false);
      }
    }
  }, [rentBankCode, rentAccountNumber, rentAccountHolder]);

  // 배달비 계좌 인증
  const handleDeliveryAccountVerify = async () => {
    if (!deliveryBankCode || !deliveryAccountNumber) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '은행과 계좌번호를 입력해주세요.',
      });
      return;
    }

    setDeliveryAccountVerifying(true);
    try {
      const response = await accountApi.verify(deliveryBankCode, deliveryAccountNumber);
      setDeliveryAccountHolder(response.bank_holder);
      setDeliveryAccountVerified(true);
      setAlertModal({
        isOpen: true,
        type: 'success',
        message: `계좌 인증이 완료되었습니다.\n예금주: ${response.bank_holder}`,
      });
    } catch (err) {
      setDeliveryAccountVerified(false);
      setAlertModal({
        isOpen: true,
        type: 'error',
        message: '계좌 인증에 실패했습니다. 계좌 정보를 확인해주세요.',
      });
    } finally {
      setDeliveryAccountVerifying(false);
    }
  };

  // 월세 계좌 인증
  const handleRentAccountVerify = async () => {
    if (!rentBankCode || !rentAccountNumber) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '은행과 계좌번호를 입력해주세요.',
      });
      return;
    }

    setRentAccountVerifying(true);
    try {
      const response = await accountApi.verify(rentBankCode, rentAccountNumber);
      setRentAccountHolder(response.bank_holder);
      setRentAccountVerified(true);
      setAlertModal({
        isOpen: true,
        type: 'success',
        message: `계좌 인증이 완료되었습니다.\n예금주: ${response.bank_holder}`,
      });
    } catch (err) {
      setRentAccountVerified(false);
      setAlertModal({
        isOpen: true,
        type: 'error',
        message: '계좌 인증에 실패했습니다. 계좌 정보를 확인해주세요.',
      });
    } finally {
      setRentAccountVerifying(false);
    }
  };

  // 월세 해지 처리
  const handleCancelRent = async () => {
    if (!userId) {
      setAlertModal({
        isOpen: true,
        type: 'error',
        message: '사용자 정보를 찾을 수 없습니다.',
      });
      return;
    }

    if (!cancelReason.trim()) {
      setAlertModal({
        isOpen: true,
        type: 'warning',
        message: '해지 사유를 입력해주세요.',
      });
      return;
    }

    setIsCancelling(true);
    try {
      const adminId = Number(localStorage.getItem('adminId'));
      await rentApplicationsApi.cancel(userId, { adminId, reason: cancelReason });

      setShowCancelModal(false);
      setCancelReason('');
      setRentApprovalStatus('CANCELLED');

      setAlertModal({
        isOpen: true,
        type: 'success',
        message: '월세 해지가 완료되었습니다.',
      });

      // 회원 정보 새로고침
      if (userId) {
        loadUser();
      }
    } catch (err) {
      console.error('해지 실패:', err);
      setAlertModal({
        isOpen: true,
        type: 'error',
        message: '해지에 실패했습니다.',
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    try {
      const centerId = JSON.parse(localStorage.getItem('selectedCenter') || '{}')?.centerId;
      if (!centerId) {
        setAlertModal({
          isOpen: true,
          type: 'error',
          message: '센터를 선택해주세요.',
        });
        setIsLoading(false);
        return;
      }

      // 배달비 계좌 인증 확인
      if (!deliveryAccountVerified) {
        setAlertModal({
          isOpen: true,
          type: 'warning',
          message: '배달비 계좌 인증을 완료해주세요.',
        });
        setIsLoading(false);
        return;
      }

      // 월세 계좌 정보가 있는 경우 인증 확인
      if (rentBankCode && rentAccountNumber && !rentAccountVerified) {
        setAlertModal({
          isOpen: true,
          type: 'warning',
          message: '월세 계좌 인증을 완료해주세요.',
        });
        setIsLoading(false);
        return;
      }

      const data: any = {
        centerId,
        userName,
        phoneNumber,
        perLimitPrice: Number(perLimitPrice.replace(/,/g, '')),
        dailyLimitPrice: Number(dailyLimitPrice.replace(/,/g, '')),
        annualLimitPrice: Number(annualLimitPrice.replace(/,/g, '')),
        allowedInstallmentMonths: Number(allowedInstallmentMonths),
        isProductNameMutable,
        isPayerNameMutable,
        userStatus,

        // 배달비 관련
        deliveryPgCode: deliveryPgCode as 'WEROUTE',
        deliveryRecurringMid,
        deliveryRecurringTid,
        deliveryManualMid,
        deliveryManualTid,
        deliveryFeeRate: Number(deliveryFeeRate),
        deliveryAccountNumber,
        deliveryAccountHolder,
        deliveryBankCode,
      };

      // 등록 시에만 loginId, password 필요
      if (!userId) {
        data.loginId = loginId;
        data.password = password || 'password123';
      }

      // 수정 시 비밀번호 변경하는 경우에만 추가
      if (userId && password) {
        data.password = password;
      }

      // 월세 정보 추가
      data.rentPgCode = rentPgCode as 'WEROUTE';
      data.rentRecurringMid = rentRecurringMid;
      data.rentRecurringTid = rentRecurringTid;
      data.rentManualMid = rentManualMid;
      data.rentManualTid = rentManualTid;
      data.rentFeeRate = rentFeeRate ? Number(rentFeeRate) : 0;
      data.rentAccountNumber = rentAccountNumber;
      data.rentAccountHolder = rentAccountHolder;
      data.rentBankCode = rentBankCode;
      data.rentApprovalStatus = rentApprovalStatus;

      // 메모
      if (memo) {
        data.memo = memo;
      }

      if (userId) {
        await usersApi.update(userId, data);
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '수정 완료',
          message: '회원 정보가 수정되었습니다.',
        });
      } else {
        await usersApi.create(data);
        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '등록 완료',
          message: '회원이 등록되었습니다.',
        });
      }

      setTimeout(() => {
        onClose();
      }, 1000);
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

  const formatNumber = (value: string) => {
    const num = value.replace(/[^0-9]/g, '');
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 기본 정보 섹션 */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
            </svg>
            기본 정보
          </h2>

          <div>
            {/* 첫 번째 줄 */}
            <div className="flex gap-3 mb-3">
              {/* 아이디 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  아이디 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="아이디"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  readOnly={!!userId}
                  disabled={!!userId}
                  required={!userId}
                />
              </div>

              {/* 비밀번호 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 {!userId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={userId ? '변경 시만 입력' : '비밀번호'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required={!userId}
                />
              </div>

              {/* 회원명 */}
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="회원명"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* 연락처 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연락처 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 11) {
                      setPhoneNumber(value);
                    }
                  }}
                  placeholder="01012345678"
                  maxLength={11}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* 건당한도금액 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  건당한도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(perLimitPrice)}
                  onChange={(e) => setPerLimitPrice(e.target.value.replace(/,/g, ''))}
                  placeholder="1,000,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* 일일한도금액 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  일일한도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(dailyLimitPrice)}
                  onChange={(e) => setDailyLimitPrice(e.target.value.replace(/,/g, ''))}
                  placeholder="1,000,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* 연간한도금액 */}
              <div className="w-44">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  연간한도 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formatNumber(annualLimitPrice)}
                  onChange={(e) => setAnnualLimitPrice(e.target.value.replace(/,/g, ''))}
                  placeholder="100,000,000"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>

              {/* 허용할부개월 */}
              <div className="w-32">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  허용할부 <span className="text-red-500">*</span>
                </label>
                <select
                  value={allowedInstallmentMonths}
                  onChange={(e) => setAllowedInstallmentMonths(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  required
                >
                  <option value="0">일시불</option>
                  <option value="1">1개월</option>
                  <option value="2">2개월</option>
                  <option value="3">3개월</option>
                  <option value="4">4개월</option>
                  <option value="5">5개월</option>
                  <option value="6">6개월</option>
                  <option value="7">7개월</option>
                  <option value="8">8개월</option>
                  <option value="9">9개월</option>
                  <option value="10">10개월</option>
                  <option value="11">11개월</option>
                  <option value="12">12개월</option>
                </select>
              </div>
            </div>

            {/* 두 번째 줄 */}
            <div className="flex gap-3 mb-3">
              {/* 회원상태 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원상태 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={userStatus === 'ACTIVE'}
                      onChange={() => setUserStatus('ACTIVE')}
                      className="w-4 h-4 text-primary-600 focus:ring-1 focus:ring-primary-500"
                    />
                    <span className="ml-1.5 text-sm text-gray-700">활성</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={userStatus === 'TERMINATED'}
                      onChange={() => setUserStatus('TERMINATED')}
                      className="w-4 h-4 text-primary-600 focus:ring-1 focus:ring-primary-500"
                    />
                    <span className="ml-1.5 text-sm text-gray-700">해지</span>
                  </label>
                </div>
              </div>

              {/* 상품명 변동 가능 여부 */}
              <div className="w-36">
                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isProductNameMutable}
                    onChange={(e) => setIsProductNameMutable(e.target.checked)}
                    className="w-4 h-4 text-primary-600 focus:ring-1 focus:ring-primary-500 rounded"
                  />
                  <span className="ml-1.5 text-sm text-gray-700">상품명 변동가능</span>
                </label>
              </div>

              {/* 결제자명 변동 가능 여부 */}
              <div className="w-40">
                <label className="block text-sm font-medium text-gray-700 mb-1">&nbsp;</label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPayerNameMutable}
                    onChange={(e) => setIsPayerNameMutable(e.target.checked)}
                    className="w-4 h-4 text-primary-600 focus:ring-1 focus:ring-primary-500 rounded"
                  />
                  <span className="ml-1.5 text-sm text-gray-700">결제자명 변동가능</span>
                </label>
              </div>
            </div>

            {/* 터미널 코드 & 메모 */}
            <div className="flex gap-4">
              {/* 터미널 코드 (수정 모드일 때만) */}
              {userId && terminalCode && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                    </svg>
                    <h3 className="text-sm font-semibold text-gray-900">터미널 코드</h3>
                  </div>
                  <p className="text-xs text-gray-600 mb-3">
                    터미널 코드로 웹 정산 어드민과 결제 및 정산 연동이 가능합니다.
                  </p>
                  <div className="bg-gray-900 rounded-lg px-4 py-3 font-mono text-sm flex items-center gap-4">
                    <code className="text-green-400 font-semibold">{terminalCode}</code>
                    <button
                      type="button"
                      onClick={handleCopyTerminalCode}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors whitespace-nowrap ${
                        copiedTerminalCode
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copiedTerminalCode ? (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          복사됨
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                            <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z" />
                          </svg>
                          복사
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* 메모 */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 w-96">
                <div className="flex items-center mb-2">
                  <svg className="w-5 h-5 mr-2 text-gray-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                  <h3 className="text-sm font-semibold text-gray-900">메모</h3>
                </div>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="메모를 입력하세요"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded bg-white focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 배달비/월세 섹션 */}
        <div className="border-t pt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
              <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
            </svg>
            결제 정보
          </h2>

          {/* 탭 버튼 */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('delivery')}
              className={`relative px-8 py-3 font-semibold transition-all ${
                activeTab === 'delivery'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                  <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                </svg>
                <span>배달비</span>
              </div>
              {activeTab === 'delivery' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('rent')}
              className={`relative px-8 py-3 font-semibold transition-all ${
                activeTab === 'rent'
                  ? 'text-green-600 bg-green-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                <span>월세</span>
              </div>
              {activeTab === 'rent' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-600"></div>
              )}
            </button>
          </div>

          {/* 배달비 탭 내용 */}
          {activeTab === 'delivery' && (
            <div>
              {/* 상단 2개 항목 */}
              <div className="flex gap-3 mb-3">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PG <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={deliveryPgCode}
                    onChange={(e) => setDeliveryPgCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    required
                  >
                    <option value="WEROUTE">위루트</option>
                  </select>
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수수료율 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="15"
                    value={deliveryFeeRate}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      if (value <= 15 || e.target.value === '') {
                        setDeliveryFeeRate(e.target.value);
                      }
                    }}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    required
                  />
                </div>
              </div>

              {/* 3개 박스 */}
              <div className="grid grid-cols-3 gap-3">
                {/* 정기결제 박스 */}
                <div className="border-2 border-gray-300 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">정기결제</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        MID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryRecurringMid}
                        readOnly
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        TID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryRecurringTid}
                        onChange={(e) => setDeliveryRecurringTid(e.target.value)}
                        placeholder="TID"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 수기결제 박스 */}
                <div className="border-2 border-gray-300 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">수기결제</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        MID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryManualMid}
                        readOnly
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        TID <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryManualTid}
                        onChange={(e) => setDeliveryManualTid(e.target.value)}
                        placeholder="TID"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 계좌정보 박스 */}
                <div className="border-2 border-gray-300 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">계좌정보</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        은행 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={deliveryBankCode}
                        onChange={(e) => setDeliveryBankCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                        required
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
                        value={deliveryAccountNumber}
                        onChange={(e) => setDeliveryAccountNumber(e.target.value)}
                        placeholder="계좌번호"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        계좌주 <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={deliveryAccountHolder}
                        onChange={(e) => setDeliveryAccountHolder(e.target.value)}
                        placeholder="계좌주"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                        readOnly={deliveryAccountVerified}
                        required
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleDeliveryAccountVerify}
                        disabled={deliveryAccountVerifying || deliveryAccountVerified}
                        className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          deliveryAccountVerified
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {deliveryAccountVerifying ? '인증 중...' : deliveryAccountVerified ? '✓ 인증 완료' : '계좌 인증'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 월세 탭 내용 */}
          {activeTab === 'rent' && (
            <div>
              {/* 상단 3개 항목 */}
              <div className="flex gap-3 mb-3">
                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    PG
                  </label>
                  <select
                    value={rentPgCode}
                    onChange={(e) => setRentPgCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  >
                    <option value="WEROUTE">위루트</option>
                  </select>
                </div>
                <div className="w-28">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    수수료율
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
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-24">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      승인상태
                    </label>
                    <span className={`inline-block w-full px-3 py-2 rounded text-sm font-medium text-center ${
                      rentApprovalStatus === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                      rentApprovalStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      rentApprovalStatus === 'REJECTED' ? 'bg-red-100 text-red-800' :
                      rentApprovalStatus === 'CANCELLED' ? 'bg-gray-100 text-gray-800' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {rentApprovalStatus === 'NOT_APPLIED' ? '미신청' :
                       rentApprovalStatus === 'PENDING' ? '승인대기' :
                       rentApprovalStatus === 'REJECTED' ? '거부' :
                       rentApprovalStatus === 'APPROVED' ? '승인' :
                       rentApprovalStatus === 'CANCELLED' ? '해지' : '미신청'}
                    </span>
                  </div>
                  {userId && rentApprovalStatus === 'APPROVED' && (
                    <div className="pt-6">
                      <button
                        type="button"
                        onClick={() => setShowCancelModal(true)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded text-sm font-medium transition-colors whitespace-nowrap"
                      >
                        해지
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* 3개 박스 */}
              <div className="grid grid-cols-3 gap-3">
                {/* 정기결제 박스 */}
                <div className="border-2 border-gray-300 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">정기결제</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        MID
                      </label>
                      <input
                        type="text"
                        value={rentRecurringMid}
                        readOnly
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        TID
                      </label>
                      <input
                        type="text"
                        value={rentRecurringTid}
                        onChange={(e) => setRentRecurringTid(e.target.value)}
                        placeholder="TID"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 수기결제 박스 */}
                <div className="border-2 border-gray-300 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">수기결제</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        MID
                      </label>
                      <input
                        type="text"
                        value={rentManualMid}
                        readOnly
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded bg-gray-50 text-gray-600 cursor-not-allowed outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        TID
                      </label>
                      <input
                        type="text"
                        value={rentManualTid}
                        onChange={(e) => setRentManualTid(e.target.value)}
                        placeholder="TID"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* 계좌정보 박스 */}
                <div className="border-2 border-gray-300 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">계좌정보</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        은행
                      </label>
                      <select
                        value={rentBankCode}
                        onChange={(e) => setRentBankCode(e.target.value)}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
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
                        계좌번호
                      </label>
                      <input
                        type="text"
                        value={rentAccountNumber}
                        onChange={(e) => setRentAccountNumber(e.target.value)}
                        placeholder="계좌번호"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">
                        계좌주
                      </label>
                      <input
                        type="text"
                        value={rentAccountHolder}
                        onChange={(e) => setRentAccountHolder(e.target.value)}
                        placeholder="계좌주"
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                        readOnly={rentAccountVerified}
                      />
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleRentAccountVerify}
                        disabled={rentAccountVerifying || rentAccountVerified}
                        className={`w-full px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                          rentAccountVerified
                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                      >
                        {rentAccountVerifying ? '인증 중...' : rentAccountVerified ? '✓ 인증 완료' : '계좌 인증'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* 버튼 */}
        <div className="flex justify-center space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            목록으로
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-medium"
          >
            {isLoading ? '저장 중...' : userId ? '수정하기' : '등록하기'}
          </button>
        </div>
      </form>

      {/* 해지 모달 */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">월세 해지 사유 입력</h3>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="해지 사유를 입력해주세요"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-transparent outline-none text-sm mb-4 h-32 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setCancelReason('');
                }}
                disabled={isCancelling}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded transition-colors disabled:opacity-50"
              >
                취소
              </button>
              <button
                onClick={handleCancelRent}
                disabled={isCancelling}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors disabled:opacity-50"
              >
                {isCancelling ? '처리 중...' : '해지'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

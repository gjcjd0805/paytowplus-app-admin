'use client';

import { useState, useEffect } from 'react';
import { usersApi, centersApi } from '@/lib/api';
import { rentApplicationsApi } from '@/lib/api';
import type { Center, DeliveryConfigRequest, RentConfigRequest } from '@/types/api';
import { ApiError } from '@/lib/api-client';
import AlertModal from '@/components/common/AlertModal';
import PaymentConfigCard, { PaymentConfigData, PaymentConfigType } from './PaymentConfigCard';
import PaymentConfigModal from './PaymentConfigModal';
import type { RentConfigInfo } from '@/types/api';

interface UserFormProps {
  userId: number | null;
  onClose: () => void;
  onUserCreated?: (newUserId: number) => void; // 신규 등록 후 콜백
}

export default function UserForm({ userId, onClose, onUserCreated }: UserFormProps) {
  const [currentUserId, setCurrentUserId] = useState<number | null>(userId);
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
  const [depositorName, setDepositorName] = useState('');
  const [ownerIdentityNumber, setOwnerIdentityNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProductNameMutable, setIsProductNameMutable] = useState(true);
  const [isPayerNameMutable, setIsPayerNameMutable] = useState(true);
  const [userStatus, setUserStatus] = useState<'ACTIVE' | 'TERMINATED'>('ACTIVE');
  const [pgCode, setPgCode] = useState<'WEROUTE'>('WEROUTE');  // PG 코드 (회원 레벨로 통합)
  const [memo, setMemo] = useState('');
  const [terminalCode, setTerminalCode] = useState('');
  const [copiedTerminalCode, setCopiedTerminalCode] = useState(false);

  // PIN 정보
  const [pinEnabled, setPinEnabled] = useState(false);
  const [pinSetAt, setPinSetAt] = useState<string | null>(null);
  const [pinFailCount, setPinFailCount] = useState(0);
  const [pinLocked, setPinLocked] = useState(false);
  const [pinLockedAt, setPinLockedAt] = useState<string | null>(null);
  const [isDeletingPin, setIsDeletingPin] = useState(false);

  // 결제 설정 (배달비, 월세)
  const [deliveryConfig, setDeliveryConfig] = useState<PaymentConfigData>({
    type: 'delivery',
    perLimitPrice: null,
    dailyLimitPrice: null,
    annualLimitPrice: null,
    allowedInstallmentMonths: null,
    recurringMid: null,
    recurringTid: null,
    manualMid: null,
    manualTid: null,
    feeRate: null,
    bankCode: null,
    accountNumber: null,
    accountHolder: null,
    accountVerified: false,
  });

  const [rentConfig, setRentConfig] = useState<PaymentConfigData>({
    type: 'rent',
    perLimitPrice: null,
    dailyLimitPrice: null,
    annualLimitPrice: null,
    allowedInstallmentMonths: null,
    recurringMid: null,
    recurringTid: null,
    manualMid: null,
    manualTid: null,
    feeRate: null,
    bankCode: null,
    accountNumber: null,
    accountHolder: null,
    accountVerified: false,
    approvalStatus: 'NOT_APPLIED',
    approvedDt: null,
  });

  // 센터 MID 정보
  const [centerMid, setCenterMid] = useState<{
    delivery: { recurringMid: string; manualMid: string };
    rent: { recurringMid: string; manualMid: string };
  }>({
    delivery: { recurringMid: '', manualMid: '' },
    rent: { recurringMid: '', manualMid: '' },
  });

  // 모달 상태
  const [editingConfigType, setEditingConfigType] = useState<PaymentConfigType | null>(null);

  // 설정 존재 여부 (수정 모드에서 사용)
  const [hasDeliveryConfig, setHasDeliveryConfig] = useState(false);
  const [hasRentConfig, setHasRentConfig] = useState(false);

  // 월세 상세 정보 (RentDetailCard용)
  const [rentConfigInfo, setRentConfigInfo] = useState<RentConfigInfo | null>(null);

  // 해지 모달 상태
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);

  // 탭 상태
  const [activeTab, setActiveTab] = useState<'basic' | 'delivery' | 'rent'>('basic');

  useEffect(() => {
    loadCenterInfo();
    if (currentUserId) {
      loadUser();
    }
  }, [currentUserId]);

  const loadCenterInfo = async () => {
    try {
      const selectedCenter = JSON.parse(localStorage.getItem('selectedCenter') || '{}');
      if (!selectedCenter?.centerId) return;

      const response = await centersApi.list();
      const center = response.centers.find((c: Center) => c.centerId === selectedCenter.centerId);

      if (center) {
        setCenterMid({
          delivery: {
            recurringMid: center.recurringMid || '',
            manualMid: center.manualMid || '',
          },
          rent: {
            recurringMid: center.d1RecurringMid || '',
            manualMid: center.d1ManualMid || '',
          },
        });

        // 신규 등록 시 기본 MID 설정
        if (!currentUserId) {
          setDeliveryConfig((prev) => ({
            ...prev,
            recurringMid: center.recurringMid || '',
            manualMid: center.manualMid || '',
          }));
          setRentConfig((prev) => ({
            ...prev,
            recurringMid: center.d1RecurringMid || '',
            manualMid: center.d1ManualMid || '',
          }));
        }
      }
    } catch (err) {
      console.error('센터 정보 로드 실패:', err);
    }
  };

  const loadUser = async () => {
    if (!currentUserId) return;

    setIsLoading(true);
    try {
      const response = await usersApi.get(currentUserId);
      const { basic, deliveryConfig: delivery, rentConfig: rent } = response;

      // 기본 정보
      setLoginId(basic.loginId);
      setUserName(basic.userName);
      setDepositorName(basic.depositorName || '');
      setOwnerIdentityNumber(basic.ownerIdentityNumber || '');
      setPhoneNumber(basic.phoneNumber);
      setIsProductNameMutable(basic.isProductNameMutable);
      setIsPayerNameMutable(basic.isPayerNameMutable);
      setUserStatus(basic.userStatus as 'ACTIVE' | 'TERMINATED');
      setPgCode(basic.pg || 'WEROUTE');  // PG 코드 로드
      setMemo(basic.memo || '');
      setTerminalCode(basic.terminalCode || '');

      // PIN 정보
      setPinEnabled(basic.pinEnabled);
      setPinSetAt(basic.pinSetAt);
      setPinFailCount(basic.pinFailCount);
      setPinLocked(basic.pinLocked);
      setPinLockedAt(basic.pinLockedAt);

      // 배달비 설정
      if (delivery) {
        setDeliveryConfig({
          type: 'delivery',
          perLimitPrice: delivery.perLimitPrice,
          dailyLimitPrice: delivery.dailyLimitPrice,
          annualLimitPrice: delivery.annualLimitPrice,
          allowedInstallmentMonths: delivery.allowedInstallmentMonths,
          recurringMid: delivery.recurringMid,
          recurringTid: delivery.recurringTid,
          manualMid: delivery.manualMid,
          manualTid: delivery.manualTid,
          feeRate: delivery.feeRate,
          bankCode: delivery.bankCode,
          accountNumber: delivery.accountNumber,
          accountHolder: delivery.accountHolder,
          accountVerified: !!(delivery.bankCode && delivery.accountNumber),
        });
        setHasDeliveryConfig(true);
      } else {
        setHasDeliveryConfig(false);
      }

      // 월세 설정
      if (rent) {
        setRentConfig({
          type: 'rent',
          perLimitPrice: rent.perLimitPrice,
          dailyLimitPrice: rent.dailyLimitPrice,
          annualLimitPrice: rent.annualLimitPrice,
          allowedInstallmentMonths: rent.allowedInstallmentMonths,
          recurringMid: rent.recurringMid,
          recurringTid: rent.recurringTid,
          manualMid: rent.manualMid,
          manualTid: rent.manualTid,
          feeRate: rent.feeRate,
          bankCode: rent.bankCode,
          accountNumber: rent.accountNumber,
          accountHolder: rent.accountHolder,
          accountVerified: !!(rent.bankCode && rent.accountNumber),
          approvalStatus: rent.approvalStatus || 'NOT_APPLIED',
          approvedDt: rent.approvedDt,
        });
        setHasRentConfig(true);
        // 월세 상세 정보 저장 (RentDetailCard용)
        setRentConfigInfo(rent);
      } else {
        setHasRentConfig(false);
        setRentConfigInfo(null);
      }
    } catch (err) {
      console.error('회원 정보 로드 실패:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyTerminalCode = () => {
    if (terminalCode) {
      navigator.clipboard.writeText(terminalCode);
      setCopiedTerminalCode(true);
      setTimeout(() => setCopiedTerminalCode(false), 2000);
    }
  };

  // 결제 설정 수정 모달 열기
  const handleEditConfig = (type: PaymentConfigType) => {
    setEditingConfigType(type);
  };

  // 결제 설정 저장 (API 호출)
  const handleSaveConfig = async (config: PaymentConfigData) => {
    // 상태 먼저 업데이트
    if (config.type === 'delivery') {
      setDeliveryConfig(config);
    } else {
      setRentConfig(config);
    }

    // 신규 등록 모드일 때는 API 호출하지 않음 (회원 등록 후 별도로 처리)
    if (!currentUserId) {
      setEditingConfigType(null);
      return;
    }

    // 수정 모드일 때만 API 호출
    setIsLoading(true);
    try {
      if (config.type === 'delivery') {
        const request: DeliveryConfigRequest = {
          perLimitPrice: config.perLimitPrice!,
          dailyLimitPrice: config.dailyLimitPrice!,
          annualLimitPrice: config.annualLimitPrice!,
          allowedInstallmentMonths: config.allowedInstallmentMonths!,
          recurringMid: config.recurringMid!,
          recurringTid: config.recurringTid!,
          manualMid: config.manualMid!,
          manualTid: config.manualTid!,
          feeRate: config.feeRate!,
          bankCode: config.bankCode!,
          accountNumber: config.accountNumber!,
          accountHolder: config.accountHolder!,
        };

        if (hasDeliveryConfig) {
          await usersApi.updateDeliveryConfig(currentUserId, request);
        } else {
          await usersApi.createDeliveryConfig(currentUserId, request);
          setHasDeliveryConfig(true);
        }

        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '저장 완료',
          message: '배달비 설정이 저장되었습니다.',
        });
      } else {
        const request: RentConfigRequest = {
          perLimitPrice: config.perLimitPrice!,
          dailyLimitPrice: config.dailyLimitPrice!,
          annualLimitPrice: config.annualLimitPrice!,
          allowedInstallmentMonths: config.allowedInstallmentMonths!,
          recurringMid: config.recurringMid!,
          recurringTid: config.recurringTid!,
          manualMid: config.manualMid!,
          manualTid: config.manualTid!,
          feeRate: config.feeRate!,
          bankCode: config.bankCode!,
          accountNumber: config.accountNumber!,
          accountHolder: config.accountHolder!,
        };

        if (hasRentConfig) {
          await usersApi.updateRentConfig(currentUserId, request);
        } else {
          await usersApi.createRentConfig(currentUserId, request);
          setHasRentConfig(true);
        }

        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '저장 완료',
          message: '월세 설정이 저장되었습니다.',
        });
      }
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
          message: '설정 저장 중 오류가 발생했습니다.',
        });
      }
    } finally {
      setIsLoading(false);
      setEditingConfigType(null);
    }
  };

  // 월세 해지 처리
  const handleCancelRent = async () => {
    if (!currentUserId) {
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
      await rentApplicationsApi.cancel(currentUserId, { adminId, reason: cancelReason });

      setShowCancelModal(false);
      setCancelReason('');
      setRentConfig((prev) => ({ ...prev, approvalStatus: 'CANCELLED' }));

      setAlertModal({
        isOpen: true,
        type: 'success',
        message: '월세 해지가 완료되었습니다.',
      });

      // 회원 정보 새로고침
      loadUser();
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

  // PIN 삭제 처리
  const handleDeletePin = async () => {
    if (!currentUserId) return;

    if (!confirm('PIN을 삭제하시겠습니까? 회원은 앱에서 새로 PIN을 설정해야 합니다.')) {
      return;
    }

    setIsDeletingPin(true);
    try {
      await usersApi.deletePin(currentUserId);
      setAlertModal({
        isOpen: true,
        type: 'success',
        message: 'PIN이 삭제되었습니다.',
      });

      // PIN 상태 초기화
      setPinEnabled(false);
      setPinSetAt(null);
      setPinFailCount(0);
      setPinLocked(false);
      setPinLockedAt(null);
    } catch (err) {
      console.error('PIN 삭제 실패:', err);
      if (err instanceof ApiError) {
        setAlertModal({
          isOpen: true,
          type: 'error',
          message: err.message,
        });
      } else {
        setAlertModal({
          isOpen: true,
          type: 'error',
          message: 'PIN 삭제에 실패했습니다.',
        });
      }
    } finally {
      setIsDeletingPin(false);
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

      // 필수 입력값 검증
      if (!userName.trim()) {
        setAlertModal({ isOpen: true, type: 'warning', message: '회원명을 입력해주세요.' });
        setIsLoading(false);
        return;
      }

      if (!depositorName.trim()) {
        setAlertModal({ isOpen: true, type: 'warning', message: '입금자명을 입력해주세요.' });
        setIsLoading(false);
        return;
      }

      if (!ownerIdentityNumber.trim()) {
        setAlertModal({ isOpen: true, type: 'warning', message: '주민번호 앞 6자리 또는 사업자번호를 입력해주세요.' });
        setIsLoading(false);
        return;
      }

      if (!phoneNumber.trim()) {
        setAlertModal({ isOpen: true, type: 'warning', message: '연락처를 입력해주세요.' });
        setIsLoading(false);
        return;
      }

      if (currentUserId) {
        // 수정 모드: 기본정보만 저장
        const updateData: any = {
          userName,
          depositorName,
          ownerIdentityNumber,
          phoneNumber,
          userStatus,
          isProductNameMutable,
          isPayerNameMutable,
        };

        // 비밀번호 변경하는 경우에만 추가
        if (password) {
          updateData.password = password;
        }

        // 메모
        if (memo) {
          updateData.memo = memo;
        }

        await usersApi.update(currentUserId, updateData);
        setPassword(''); // 비밀번호 필드 초기화

        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '수정 완료',
          message: '기본 정보가 수정되었습니다.',
        });

        // 회원 정보 재로드
        loadUser();
      } else {
        // 등록 모드: 기본정보만 저장
        if (!loginId.trim()) {
          setAlertModal({ isOpen: true, type: 'warning', message: '아이디를 입력해주세요.' });
          setIsLoading(false);
          return;
        }

        // 기본정보 저장
        const createData = {
          centerId,
          pg: pgCode,  // PG 코드 (회원 레벨로 통합)
          loginId,
          password: password || 'password123',
          userName,
          depositorName,
          ownerIdentityNumber,
          phoneNumber,
          userStatus,
          isProductNameMutable,
          isPayerNameMutable,
          memo: memo || undefined,
        };

        const result = await usersApi.create(createData);
        const newUserId = result.userId;

        // 배달비/월세 설정 초기화 (신규 회원은 설정이 없음)
        setDeliveryConfig({
          type: 'delivery',
          perLimitPrice: null,
          dailyLimitPrice: null,
          annualLimitPrice: null,
          allowedInstallmentMonths: null,
          recurringMid: null,
          recurringTid: null,
          manualMid: null,
          manualTid: null,
          feeRate: null,
          bankCode: null,
          accountNumber: null,
          accountHolder: null,
          accountVerified: false,
        });
        setRentConfig({
          type: 'rent',
          perLimitPrice: null,
          dailyLimitPrice: null,
          annualLimitPrice: null,
          allowedInstallmentMonths: null,
          recurringMid: null,
          recurringTid: null,
          manualMid: null,
          manualTid: null,
          feeRate: null,
          bankCode: null,
          accountNumber: null,
          accountHolder: null,
          accountVerified: false,
          approvalStatus: 'NOT_APPLIED',
          approvedDt: null,
        });
        setHasDeliveryConfig(false);
        setHasRentConfig(false);
        setRentConfigInfo(null);

        setAlertModal({
          isOpen: true,
          type: 'success',
          title: '등록 완료',
          message: '회원이 등록되었습니다. 이제 결제 설정을 추가할 수 있습니다.',
        });

        // 등록된 회원 ID로 전환하여 수정 모드로 변경
        setCurrentUserId(newUserId);
        setPassword(''); // 비밀번호 필드 초기화

        // 콜백 호출 (URL 변경 등)
        if (onUserCreated) {
          onUserCreated(newUserId);
        }
      }
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

      {/* 결제 설정 수정 모달 */}
      {editingConfigType && (
        <PaymentConfigModal
          isOpen={!!editingConfigType}
          onClose={() => setEditingConfigType(null)}
          onSave={handleSaveConfig}
          config={editingConfigType === 'delivery' ? deliveryConfig : rentConfig}
          type={editingConfigType}
          centerMid={editingConfigType === 'delivery' ? centerMid.delivery : centerMid.rent}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 탭 헤더 */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 border-b flex">
            <button
              type="button"
              onClick={() => setActiveTab('basic')}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'basic'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              기본정보
            </button>
            <button
              type="button"
              onClick={() => currentUserId ? setActiveTab('delivery') : null}
              disabled={!currentUserId}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'delivery'
                  ? 'bg-white text-blue-600 border-b-2 border-blue-500'
                  : currentUserId
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <span className="text-lg mr-2">🚚</span>
              배달비
              {!currentUserId ? (
                <span className="ml-2 text-xs text-gray-400">(저장 후)</span>
              ) : (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                  hasDeliveryConfig ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-600'
                }`}>
                  {hasDeliveryConfig ? '등록' : '미등록'}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => currentUserId ? setActiveTab('rent') : null}
              disabled={!currentUserId}
              className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'rent'
                  ? 'bg-white text-green-600 border-b-2 border-green-500'
                  : currentUserId
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-gray-300 cursor-not-allowed'
              }`}
            >
              <span className="text-lg mr-2">🏠</span>
              월세
              {!currentUserId ? (
                <span className="ml-2 text-xs text-gray-400">(저장 후)</span>
              ) : (
                <span className={`ml-2 px-1.5 py-0.5 rounded text-xs font-medium ${
                  hasRentConfig ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                }`}>
                  {hasRentConfig ? '등록' : '미등록'}
                </span>
              )}
            </button>
          </div>

          {/* 기본정보 탭 */}
          {activeTab === 'basic' && (
          <div className="p-4 space-y-4">
            {/* 첫 번째 줄: 아이디, 비밀번호, PG, 회원상태 */}
            <div className="grid grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  아이디 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="아이디"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  readOnly={!!currentUserId}
                  disabled={!!currentUserId}
                  required={!currentUserId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  비밀번호 {!currentUserId && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={currentUserId ? '변경 시만 입력' : '비밀번호'}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  required={!currentUserId}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PG <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4 h-10">
                  <label className={`flex items-center ${currentUserId ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                    <input
                      type="radio"
                      checked={pgCode === 'WEROUTE'}
                      onChange={() => setPgCode('WEROUTE')}
                      disabled={!!currentUserId}
                      className="w-4 h-4 text-blue-600 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <span className={`ml-2 text-sm ${currentUserId ? 'text-gray-400' : 'text-gray-700'}`}>위루트</span>
                  </label>
                </div>
                {currentUserId && (
                  <p className="text-xs text-gray-500 mt-1">PG는 수정할 수 없습니다</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원상태 <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-4 h-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={userStatus === 'ACTIVE'}
                      onChange={() => setUserStatus('ACTIVE')}
                      className="w-4 h-4 text-blue-600 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">활성</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      checked={userStatus === 'TERMINATED'}
                      onChange={() => setUserStatus('TERMINATED')}
                      className="w-4 h-4 text-blue-600 focus:ring-1 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">해지</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 두 번째 줄: 회원명, 입금자명, 주민번호/사업자번호 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  회원명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="회원명"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입금자명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={depositorName}
                  onChange={(e) => setDepositorName(e.target.value)}
                  placeholder="입금자명"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주민번호/사업자번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={ownerIdentityNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    if (value.length <= 10) {
                      setOwnerIdentityNumber(value);
                    }
                  }}
                  placeholder="주민번호 앞6자리 또는 사업자번호"
                  maxLength={10}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>
            </div>

            {/* 세 번째 줄: 연락처, 상품명변동, 결제자명변동 */}
            <div className="grid grid-cols-3 gap-4">
              <div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상품명 변동</label>
                <div className="flex items-center h-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isProductNameMutable}
                      onChange={(e) => setIsProductNameMutable(e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-1 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">변동가능</span>
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">결제자명 변동</label>
                <div className="flex items-center h-10">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPayerNameMutable}
                      onChange={(e) => setIsPayerNameMutable(e.target.checked)}
                      className="w-4 h-4 text-blue-600 focus:ring-1 focus:ring-blue-500 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">변동가능</span>
                  </label>
                </div>
              </div>
            </div>

            {/* 터미널 코드 (수정 모드일 때만) */}
            {currentUserId && terminalCode && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                      </svg>
                      터미널 코드
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      웹 정산 어드민과 결제 및 정산 연동 시 사용됩니다.
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <code className="bg-gray-900 text-green-400 px-3 py-1.5 rounded font-mono text-sm">
                      {terminalCode}
                    </code>
                    <button
                      type="button"
                      onClick={handleCopyTerminalCode}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                        copiedTerminalCode
                          ? 'bg-green-600 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      {copiedTerminalCode ? '복사됨' : '복사'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PIN 정보 (수정 모드일 때만) */}
            {currentUserId && (
              <div className={`border rounded-lg p-4 ${pinEnabled ? (pinLocked ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200') : 'bg-gray-50 border-gray-200'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 flex items-center">
                      <svg className={`w-4 h-4 mr-1 ${pinEnabled ? (pinLocked ? 'text-red-600' : 'text-green-600') : 'text-gray-500'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      PIN 인증
                      {pinEnabled && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${pinLocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {pinLocked ? '잠금' : '설정됨'}
                        </span>
                      )}
                      {!pinEnabled && (
                        <span className="ml-2 px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          미설정
                        </span>
                      )}
                    </h3>
                    {pinEnabled && (
                      <div className="mt-2 space-y-1 text-xs text-gray-600">
                        <p>설정일시: {pinSetAt ? new Date(pinSetAt).toLocaleString('ko-KR') : '-'}</p>
                        <p>실패횟수: <span className={pinFailCount > 0 ? 'text-red-600 font-medium' : ''}>{pinFailCount}회</span></p>
                        {pinLocked && pinLockedAt && (
                          <p className="text-red-600">잠금일시: {new Date(pinLockedAt).toLocaleString('ko-KR')}</p>
                        )}
                      </div>
                    )}
                    {!pinEnabled && (
                      <p className="text-xs text-gray-500 mt-1">
                        회원이 앱에서 PIN을 설정하지 않았습니다.
                      </p>
                    )}
                  </div>
                  {pinEnabled && (
                    <button
                      type="button"
                      onClick={handleDeletePin}
                      disabled={isDeletingPin}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium transition-colors disabled:bg-gray-400"
                    >
                      {isDeletingPin ? '삭제 중...' : 'PIN 삭제'}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* 메모 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모를 입력하세요"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm resize-none"
              />
            </div>

            {/* 기본정보 저장 버튼 */}
            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:bg-gray-400 font-medium text-sm"
              >
                {isLoading ? '저장 중...' : currentUserId ? '기본정보 수정' : '기본정보 등록'}
              </button>
            </div>
          </div>
          )}

          {/* 배달비 탭 */}
          {activeTab === 'delivery' && currentUserId && (
            <div className="p-4">
              <PaymentConfigCard
                config={deliveryConfig}
                onEdit={() => handleEditConfig('delivery')}
              />
            </div>
          )}

          {/* 월세 탭 */}
          {activeTab === 'rent' && currentUserId && (
            <div className="p-4">
              <PaymentConfigCard
                config={rentConfig}
                onEdit={() => handleEditConfig('rent')}
                onCancel={() => setShowCancelModal(true)}
                userId={currentUserId || undefined}
                rentConfigInfo={hasRentConfig ? rentConfigInfo : null}
              />
            </div>
          )}
        </div>

        {/* 목록으로 버튼 */}
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-8 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            목록으로
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
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none text-sm mb-4 h-32 resize-none"
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

import { apiClient } from '../api-client';
import type {
  MerchantWithdrawalListResponse,
  MerchantWithdrawalSearchParams,
  CreateMerchantWithdrawalRequest,
  MerchantWithdrawalResponse,
} from '@/types/api';

export const merchantWithdrawalsApi = {
  // 머천트 출금 목록 조회
  list: async (params: MerchantWithdrawalSearchParams): Promise<MerchantWithdrawalListResponse> => {
    const queryParams = new URLSearchParams();

    queryParams.append('centerId', params.centerId.toString());
    queryParams.append('paymentPurpose', params.paymentPurpose);

    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());
    if (params.requestDateFrom) queryParams.append('requestDateFrom', params.requestDateFrom);
    if (params.requestDateTo) queryParams.append('requestDateTo', params.requestDateTo);
    if (params.withdrawalStatus) queryParams.append('withdrawalStatus', params.withdrawalStatus);
    if (params.accountHolder) queryParams.append('accountHolder', params.accountHolder);
    if (params.bankCode) queryParams.append('bankCode', params.bankCode);
    if (params.accountNumber) queryParams.append('accountNumber', params.accountNumber);

    const queryString = queryParams.toString();
    const response = await apiClient.get<MerchantWithdrawalListResponse>(
      `/merchant-withdrawals${queryString ? `?${queryString}` : ''}`
    );
    return response;
  },

  // 머천트 출금 요청
  create: async (request: CreateMerchantWithdrawalRequest): Promise<MerchantWithdrawalResponse> => {
    const response = await apiClient.post<MerchantWithdrawalResponse>('/merchant-withdrawals', request);
    return response;
  },
};

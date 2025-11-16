import { apiClient } from '../api-client';
import type { WithdrawListResponse, WithdrawSearchParams } from '@/types/api';

export const withdrawalsApi = {
  // 배달비 출금 목록 조회
  listDelivery: async (params: WithdrawSearchParams): Promise<WithdrawListResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get<WithdrawListResponse>(
      `/payment-withdraws/delivery?${queryParams.toString()}`
    );
    return response;
  },

  // 월세 출금 목록 조회
  listRent: async (params: WithdrawSearchParams): Promise<WithdrawListResponse> => {
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });

    const response = await apiClient.get<WithdrawListResponse>(
      `/payment-withdraws/rent?${queryParams.toString()}`
    );
    return response;
  },
};

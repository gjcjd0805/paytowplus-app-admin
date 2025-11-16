import { apiClient } from '../api-client';
import type {
  PaymentListResponse,
  PaymentSearchParams,
} from '@/types/api';

export const paymentsApi = {
  // 결제 목록 조회
  list: (params: PaymentSearchParams) =>
    apiClient.get<PaymentListResponse>('/payments', params),
};

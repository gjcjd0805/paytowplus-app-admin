import { apiClient } from '../api-client';
import type { RentAutoPaymentListResponse, RentAutoPaymentSearchParams } from '@/types/api';

/**
 * 월세 자동결제 설정 회원 목록 조회
 */
export async function getRentAutoPaymentUsers(
  params: RentAutoPaymentSearchParams
): Promise<RentAutoPaymentListResponse> {
  return apiClient.get<RentAutoPaymentListResponse>('/rent/auto-payment-users', params);
}

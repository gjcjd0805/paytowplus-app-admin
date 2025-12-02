import { apiClient } from '../api-client';
import type {
  UserDetailResponse,
  UserCreateRequest,
  UserUpdateRequest,
  UserListResponse,
  UserSearchParams,
  DeliveryConfigRequest,
  RentConfigRequest,
  DeliveryConfigInfo,
  RentConfigInfo,
  AutoPaymentHistoryListResponse,
} from '@/types/api';

export const usersApi = {
  // 회원 목록 조회
  list: (params: UserSearchParams) =>
    apiClient.get<UserListResponse>('/users', params),

  // 회원 단건 조회 (섹션별 분리된 응답)
  get: (id: number) =>
    apiClient.get<UserDetailResponse>(`/users/${id}`),

  // 회원 등록 (기본정보만)
  create: (data: UserCreateRequest) =>
    apiClient.post<{ userId: number }>('/users', data),

  // 회원 수정 (기본정보만)
  update: (id: number, data: UserUpdateRequest) =>
    apiClient.put<{ userId: number }>(`/users/${id}`, data),

  // 배달비 설정 생성
  createDeliveryConfig: (userId: number, data: DeliveryConfigRequest) =>
    apiClient.post<DeliveryConfigInfo>(`/users/${userId}/delivery-config`, data),

  // 배달비 설정 수정
  updateDeliveryConfig: (userId: number, data: DeliveryConfigRequest) =>
    apiClient.put<DeliveryConfigInfo>(`/users/${userId}/delivery-config`, data),

  // 월세 설정 생성
  createRentConfig: (userId: number, data: RentConfigRequest) =>
    apiClient.post<RentConfigInfo>(`/users/${userId}/rent-config`, data),

  // 월세 설정 수정
  updateRentConfig: (userId: number, data: RentConfigRequest) =>
    apiClient.put<RentConfigInfo>(`/users/${userId}/rent-config`, data),

  // PIN 삭제
  deletePin: (userId: number) =>
    apiClient.delete<void>(`/users/${userId}/pin`),

  // 자동결제 이력 조회
  getAutoPaymentHistories: (userId: number, page: number = 0, size: number = 10) =>
    apiClient.get<AutoPaymentHistoryListResponse>(`/users/${userId}/auto-payment-histories`, { page, size }),
};

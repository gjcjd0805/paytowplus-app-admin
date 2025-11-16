import { apiClient } from '../api-client';
import type {
  AdminLoginRequest,
  AdminLoginResponse,
  AdminUser,
  AdminUserCreateRequest,
  AdminUserUpdateRequest,
  AdminUserListResponse,
  AdminUserSearchParams,
} from '@/types/api';

export const adminApi = {
  // 로그인
  login: (data: AdminLoginRequest) =>
    apiClient.post<{ token: string; adminUser: AdminUser }>('/admin/login', data),

  // 어드민 유저 목록 조회
  list: (params: AdminUserSearchParams) =>
    apiClient.get<AdminUserListResponse>('/admin-users', params),

  // 어드민 유저 단건 조회
  get: (id: number) =>
    apiClient.get<AdminUser>(`/admin-users/${id}`),

  // 어드민 유저 등록
  create: (data: AdminUserCreateRequest) =>
    apiClient.post<{ id: number }>('/admin-users', data),

  // 어드민 유저 수정
  update: (id: number, data: AdminUserUpdateRequest) =>
    apiClient.put<{ id: number }>(`/admin-users/${id}`, data),

  // 어드민 유저 삭제
  delete: (id: number) =>
    apiClient.delete<null>(`/admin-users/${id}`),
};

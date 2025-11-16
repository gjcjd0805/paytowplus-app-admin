import { apiClient } from '../api-client';
import type {
  User,
  UserCreateRequest,
  UserUpdateRequest,
  UserListResponse,
  UserSearchParams,
} from '@/types/api';

export const usersApi = {
  // 회원 목록 조회
  list: (params: UserSearchParams) =>
    apiClient.get<UserListResponse>('/users', params),

  // 회원 단건 조회
  get: (id: number) =>
    apiClient.get<User>(`/users/${id}`),

  // 회원 등록
  create: (data: UserCreateRequest) =>
    apiClient.post<{ userId: number }>('/users', data),

  // 회원 수정
  update: (id: number, data: UserUpdateRequest) =>
    apiClient.put<{ userId: number }>(`/users/${id}`, data),
};

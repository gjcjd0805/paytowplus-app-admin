import { apiClient } from '../api-client';
import type {
  Notice,
  NoticeCreateRequest,
  NoticeUpdateRequest,
  NoticeListResponse,
  NoticeSearchParams,
} from '@/types/api';

export const noticesApi = {
  // 공지사항 목록 조회
  list: (params: NoticeSearchParams) =>
    apiClient.get<NoticeListResponse>('/notices', params),

  // 공지사항 단건 조회
  get: (id: number) =>
    apiClient.get<Notice>(`/notices/${id}`),

  // 공지사항 등록
  create: (data: NoticeCreateRequest) =>
    apiClient.post<{ noticeId: number }>('/notices', data),

  // 공지사항 수정
  update: (id: number, data: NoticeUpdateRequest) =>
    apiClient.put<{ noticeId: number }>(`/notices/${id}`, data),

  // 공지사항 삭제
  delete: (id: number) =>
    apiClient.delete<null>(`/notices/${id}`),
};

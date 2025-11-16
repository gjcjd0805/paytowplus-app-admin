import { apiClient } from '../api-client';
import type {
  Popup,
  PopupCreateRequest,
} from '@/types/api';

export const popupApi = {
  // 팝업 조회
  get: () =>
    apiClient.get<Popup | null>('/popup'),

  // 팝업 등록
  create: (data: PopupCreateRequest) =>
    apiClient.post<Popup>('/popup', data),
};

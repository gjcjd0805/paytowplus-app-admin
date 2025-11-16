import { apiClient } from '../api-client';
import type { CenterListResponse } from '@/types/api';

export const centersApi = {
  // 센터 목록 조회
  list: () =>
    apiClient.get<CenterListResponse>('/centers'),
};

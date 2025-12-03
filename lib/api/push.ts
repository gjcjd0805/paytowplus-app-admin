import { apiClient } from '../api-client';

export type PushActionType = 'STORE' | 'NOTICE' | 'SCREEN' | 'WEB';

export interface BroadcastPushRequest {
  title: string;
  body: string;
  actionType: PushActionType;
  targetId?: number;     // NOTICE일 경우 공지사항 ID
  screenName?: string;   // SCREEN일 경우 화면 이름
  url?: string;          // WEB일 경우 외부 URL
}

export const pushApi = {
  // 전체 푸시 발송
  broadcast: (data: BroadcastPushRequest) =>
    apiClient.post<void>('/push/broadcast', data),
};

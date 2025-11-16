import { apiClient } from '../api-client';
import type {
  RentApplicationListItem,
  RentApplicationDetail,
  RentApplicationListResponse,
  RentApplicationSearchParams,
  ApproveRequest,
  RejectRequest,
  CancelRequest,
  RentApprovalStatus
} from '@/types/api';

export const rentApplicationsApi = {
  // 승인 대기 목록 조회
  getPendingList: async (): Promise<RentApplicationListItem[]> => {
    const response = await apiClient.get<RentApplicationListItem[]>('/rent/pending');
    return response;
  },

  // 서류 목록 조회 (페이징 및 검색 조건 포함)
  getDocuments: async (params?: RentApplicationSearchParams): Promise<RentApplicationListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.page !== undefined) queryParams.append('page', params.page.toString());
    if (params?.size !== undefined) queryParams.append('size', params.size.toString());
    if (params?.status) queryParams.append('status', params.status);
    if (params?.uploadDateFrom) queryParams.append('uploadDateFrom', params.uploadDateFrom);
    if (params?.uploadDateTo) queryParams.append('uploadDateTo', params.uploadDateTo);
    if (params?.userName) queryParams.append('userName', params.userName);
    if (params?.loginId) queryParams.append('loginId', params.loginId);
    if (params?.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber);

    const queryString = queryParams.toString();
    const response = await apiClient.get<RentApplicationListResponse>(
      `/rent/documents${queryString ? `?${queryString}` : ''}`
    );
    return response;
  },

  // 서류 상세 조회
  getDocumentDetail: async (documentId: number): Promise<RentApplicationDetail> => {
    const response = await apiClient.get<RentApplicationDetail>(`/rent/documents/${documentId}`);
    return response;
  },

  // 승인
  approve: async (documentId: number, request: ApproveRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/rent/documents/${documentId}/approve`, request);
    return response;
  },

  // 거부
  reject: async (documentId: number, request: RejectRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/rent/documents/${documentId}/reject`, request);
    return response;
  },

  // 해지
  cancel: async (userId: number, request: CancelRequest): Promise<{ message: string }> => {
    const response = await apiClient.post<{ message: string }>(`/rent/users/${userId}/cancel`, request);
    return response;
  },
};

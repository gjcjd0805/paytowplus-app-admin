import { apiClient } from '../api-client';

export interface AccountVerifyResponse {
  bank_holder: string;
}

export const accountApi = {
  // 계좌 인증
  verify: async (bankCode: string, bankNum: string): Promise<AccountVerifyResponse> => {
    const response = await apiClient.get<AccountVerifyResponse>(
      `/portone/vbanks/holder?bankCode=${bankCode}&bankNum=${bankNum}`
    );
    return response;
  },
};

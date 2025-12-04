import type { ApiResponse } from '@/types/api';

// 클라이언트에서는 /api 프록시 경로로 요청 (실제 백엔드 URL은 서버에서만 사용)
const API_BASE_URL = '/api';

export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data: unknown = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private handleUnauthorized(): void {
    if (typeof window === 'undefined') return;

    // 인증 정보 삭제 (토큰은 httpOnly 쿠키라서 JS로 삭제 불가)
    localStorage.removeItem('adminUser');
    localStorage.removeItem('selectedCenter');

    // 로그인 페이지로 리다이렉트
    window.location.href = '/login';
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    const url = `${this.baseUrl}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // 쿠키 자동 전송
      });

      // HTTP 401 응답 처리
      if (response.status === 401) {
        this.handleUnauthorized();
        throw new ApiError(401, '인증이 만료되었습니다. 다시 로그인해주세요.');
      }

      const data: ApiResponse<T> = await response.json();

      // API 응답의 status가 401인 경우 처리
      if (!data.success) {
        if (data.status === 401) {
          this.handleUnauthorized();
        }
        throw new ApiError(data.status, data.message, data.data);
      }

      return data.data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, '서버와의 통신 중 오류가 발생했습니다.');
    }
  }

  async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const queryString = params
      ? '?' + new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, String(value)])
        ).toString()
      : '';

    return this.request<T>(`${endpoint}${queryString}`, {
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

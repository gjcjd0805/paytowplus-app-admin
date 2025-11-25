import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

interface JwtPayload {
  exp?: number;
  iat?: number;
  sub?: string;
  [key: string]: unknown;
}

function parseJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);

  if (!payload || !payload.exp) {
    return true;
  }

  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 로그인 페이지는 인증 체크 제외
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 쿠키에서 토큰 확인
  const token = request.cookies.get('token')?.value;

  // 토큰이 없으면 로그인 페이지로 리다이렉트
  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // 토큰 만료 시간 검사
  if (isTokenExpired(token)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    const response = NextResponse.redirect(url);
    // 만료된 토큰 쿠키 삭제
    response.cookies.delete('token');
    return response;
  }

  // 토큰이 유효하면 요청 진행
  return NextResponse.next();
}

// 미들웨어를 적용할 경로 설정
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

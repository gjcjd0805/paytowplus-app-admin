import { NextRequest, NextResponse } from 'next/server';

// 서버 전용 환경변수 (NEXT_PUBLIC_ prefix 없음 - 브라우저에 노출되지 않음)
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:18080/admin/api/v1';

async function proxyRequest(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  const path = pathSegments.join('/');
  const url = `${BACKEND_API_URL}/${path}${request.nextUrl.search}`;

  try {
    const headers: Record<string, string> = {};

    // 원본 Content-Type 유지 (multipart/form-data, application/json 등)
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers['Content-Type'] = contentType;
    }

    // 쿠키 전달 (httpOnly 쿠키 포함)
    const cookies = request.headers.get('cookie');
    if (cookies) {
      headers['Cookie'] = cookies;
    }

    // Authorization 헤더 전달 (폴백용)
    const authHeader = request.headers.get('Authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // 요청 body 처리
    let body: BodyInit | undefined;
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      // multipart/form-data인 경우 arrayBuffer로 전달 (FormData 유지)
      if (contentType?.includes('multipart/form-data')) {
        body = await request.arrayBuffer();
      } else {
        try {
          body = await request.text();
        } catch {
          // body가 없는 경우
        }
      }
    }

    const response = await fetch(url, {
      method: request.method,
      headers,
      body: body || undefined,
    });

    // 응답 처리
    const responseContentType = response.headers.get('content-type');

    let nextResponse: NextResponse;

    if (responseContentType?.includes('application/json')) {
      const data = await response.json();
      nextResponse = NextResponse.json(data, { status: response.status });
    } else {
      // JSON이 아닌 응답 (파일 다운로드 등)
      const blob = await response.blob();
      nextResponse = new NextResponse(blob, {
        status: response.status,
        headers: {
          'Content-Type': responseContentType || 'application/octet-stream',
        },
      });
    }

    // Set-Cookie 헤더 전달 (로그인/로그아웃 응답)
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      nextResponse.headers.set('Set-Cookie', setCookie);
    }

    return nextResponse;
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      {
        success: false,
        message: '서버와의 통신 중 오류가 발생했습니다.',
        status: 500,
        data: null,
      },
      { status: 500 }
    );
  }
}

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params;
  return proxyRequest(request, path);
}

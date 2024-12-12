import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// 認証不要なパスをスキップ
	if (
		request.nextUrl.pathname.startsWith('/login') ||
		request.nextUrl.pathname.startsWith('/api/auth') ||
		request.nextUrl.pathname.startsWith('/error') ||
		request.nextUrl.pathname === '/favicon.ico'
	) {
		return NextResponse.next()
	}

	const authCookie =
		request.cookies.get('next-auth.session-token')?.value ||
		request.cookies.get('__Secure-next-auth.session-token')?.value

	if (!authCookie) {
		const url = new URL('/login', request.url)
		url.searchParams.set('callbackUrl', request.url)
		return NextResponse.redirect(url)
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|assets|favicon.ico).*)'],
}

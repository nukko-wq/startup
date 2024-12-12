import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
	// 認証不要なパスをスキップ
	if (
		request.nextUrl.pathname.startsWith('/login') ||
		request.nextUrl.pathname.startsWith('/api/auth')
	) {
		return NextResponse.next()
	}

	const authCookie = request.cookies.get('next-auth.session-token')?.value

	if (!authCookie) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
	const session = await auth()
	const isAuth = !!session
	const isAuthPage = request.nextUrl.pathname === '/login'

	if (!isAuth && !isAuthPage) {
		return NextResponse.redirect(new URL('/login', request.url))
	}

	if (isAuth && isAuthPage) {
		return NextResponse.redirect(new URL('/', request.url))
	}

	return NextResponse.next()
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

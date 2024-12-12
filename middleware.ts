import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
	const isLoggedIn = !!req.auth
	const isOnLoginPage = req.nextUrl.pathname === '/login'

	// 認証が必要なパスの定義
	const authRequired =
		!req.nextUrl.pathname.startsWith('/api') &&
		!req.nextUrl.pathname.startsWith('/_next') &&
		!req.nextUrl.pathname.startsWith('/static') &&
		!isOnLoginPage

	// 未ログインで認証が必要なパスにアクセスした場合
	if (!isLoggedIn && authRequired) {
		const redirectUrl = new URL('/login', req.url)
		redirectUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
		return NextResponse.redirect(redirectUrl)
	}

	// ログイン済みでログインページにアクセスした場合
	if (isLoggedIn && isOnLoginPage) {
		return NextResponse.redirect(new URL('/', req.url))
	}

	return NextResponse.next()
})

// 認証チェックを行うパスを指定
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
}

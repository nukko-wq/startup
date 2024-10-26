import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
	await updateSession(request)

	const session = await auth()
	const isAuth = !!session
	const isAuthPage = request.nextUrl.pathname === '/login'

	console.log({
		pathname: request.nextUrl.pathname,
		isAuth,
		isAuthPage,
	})

	if (!isAuth && !isAuthPage) {
		return Response.redirect(new URL('/login', request.nextUrl.origin))
	}

	if (isAuth && isAuthPage) {
		return Response.redirect(new URL('/', request.nextUrl.origin))
	}

	return null
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
		 * Feel free to modify this pattern to include more paths.
		 */
		'/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
	],
}

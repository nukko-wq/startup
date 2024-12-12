import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

export async function middleware(request: NextRequest) {
	try {
		const session = await auth()

		if (!session) {
			return NextResponse.redirect(new URL('/login', request.url))
		}

		return NextResponse.next()
	} catch (error) {
		console.error('Middleware error:', error)
		return NextResponse.redirect(new URL('/login', request.url))
	}
}

export const config = {
	matcher: ['/((?!api|_next/static|_next/image|favicon|login|auth).*)'],
}

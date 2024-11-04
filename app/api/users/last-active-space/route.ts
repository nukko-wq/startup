import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function PUT(request: Request) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const { spaceId } = await request.json()

		await prisma.user.update({
			where: { id: session.user.id },
			data: { lastActiveSpaceId: spaceId },
		})

		return NextResponse.json({ success: true })
	} catch (error) {
		console.error('Error updating last active space:', error)
		return new NextResponse('Internal Server Error', { status: 500 })
	}
}

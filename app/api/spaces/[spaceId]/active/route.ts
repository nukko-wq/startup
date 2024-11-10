import { prisma } from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
		}

		const url = new URL(req.url)
		const spaceId = url.pathname.split('/')[3]

		// 以前のアクティブスペースをリセット
		await prisma.space.updateMany({
			where: {
				userId: session.user.id,
				isLastActive: true,
			},
			data: {
				isLastActive: false,
			},
		})

		// 新しいアクティブスペースを設定
		await prisma.space.update({
			where: {
				id: spaceId,
				userId: session.user.id,
			},
			data: {
				isLastActive: true,
			},
		})

		return NextResponse.json({ message: 'OK' }, { status: 200 })
	} catch (error) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 },
		)
	}
}

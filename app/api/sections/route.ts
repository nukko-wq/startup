import { NextResponse, type NextRequest } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { sectionSchema } from '@/lib/validations/section'

const sectionCreateSchema = z.object({
	name: z.string(),
	order: z.number(),
	spaceId: z.string(),
})

export async function POST(request: Request) {
	try {
		const session = await auth()
		if (!session?.user?.id) {
			return new NextResponse('Unauthorized', { status: 401 })
		}

		const json = await request.json()
		console.log('Received request body:', json)

		const body = sectionSchema.parse(json)
		console.log('Parsed body:', body)

		const space = await prisma.space.findUnique({
			where: { id: body.spaceId },
		})
		console.log('Found space:', space)

		if (!space) {
			return new NextResponse('Space not found', { status: 404 })
		}

		const section = await prisma.section.create({
			data: {
				name: body.name,
				order: body.order,
				space: {
					connect: { id: body.spaceId },
				},
				user: {
					connect: { id: session.user.id },
				},
			},
		})
		console.log('Created section:', section)

		return NextResponse.json(section)
	} catch (error) {
		console.error('Section creation error details:', error)
		return new NextResponse(
			error instanceof Error ? error.message : 'Internal Server Error',
			{
				status: error instanceof Error ? 422 : 500,
			},
		)
	}
}

export async function PUT(req: NextRequest) {
	// セクション更新API（名前変更、順序変更など）
}

export async function GET(req: NextRequest) {
	try {
		const session = await auth()
		const userId = session?.user?.id
		const { searchParams } = new URL(req.url)
		const spaceId = searchParams.get('spaceId')

		if (!userId) {
			return NextResponse.json({ error: '認証が必要です' }, { status: 401 })
		}

		const sections = await db.section.findMany({
			where: {
				userId,
				spaceId: spaceId || undefined,
			},
			orderBy: {
				order: 'asc',
			},
			include: {
				resources: {
					orderBy: {
						position: 'asc',
					},
				},
			},
		})

		return NextResponse.json(sections)
	} catch (error) {
		console.error('Error fetching sections:', error)
		return NextResponse.json(
			{ error: 'セクションの取得に失敗しました' },
			{ status: 500 },
		)
	}
}

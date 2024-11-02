import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function getInitialSections() {
	const session = await auth()

	// セッションがない場合は早期リターン
	if (!session?.user?.id) {
		throw new Error('Unauthorized')
	}

	// ユーザー存在確認
	const user = await db.user.findUnique({
		where: {
			id: session.user.id,
		},
	})

	if (!user) {
		throw new Error('User not found')
	}

	// セクション取得
	const sections = await db.section.findMany({
		where: {
			userId: user.id,
		},
		select: {
			id: true,
			name: true,
			order: true,
			createdAt: true,
			resources: {
				orderBy: {
					position: 'asc',
				},
			},
		},
		orderBy: {
			order: 'asc',
		},
	})

	// デフォルトセクション作成
	if (sections.length === 0) {
		const defaultSection = await db.section.create({
			data: {
				name: 'Resources',
				order: 1,
				user: {
					connect: {
						id: user.id,
					},
				},
			},
			select: {
				id: true,
				name: true,
				order: true,
				createdAt: true,
				resources: true,
			},
		})
		sections.push(defaultSection)
	}

	return { sections, userId: user.id }
}

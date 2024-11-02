import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function getInitialSections() {
	const session = await auth()

	// セッションチェック
	if (!session?.user?.id) {
		return redirect('/login')
	}

	// ユーザー存在確認
	const user = await db.user.findUnique({
		where: {
			id: session.user.id,
		},
	})

	if (!user) {
		return redirect('/login')
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
		try {
			const defaultSection = await db.section.create({
				data: {
					name: 'Resources',
					order: 1,
					userId: user.id, // 直接userIdを設定
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
		} catch (error) {
			console.error('Error creating default section:', error)
			// エラーが発生しても処理を継続
		}
	}

	return { sections, userId: user.id }
}

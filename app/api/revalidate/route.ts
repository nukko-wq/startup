import { revalidateTag } from 'next/cache'
import { type NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
	const tag = request.nextUrl.searchParams.get('tag')

	if (!tag) {
		return NextResponse.json(
			{ message: 'タグパラメータが必要です' },
			{ status: 400 },
		)
	}

	try {
		revalidateTag(tag)
		return NextResponse.json({ revalidated: true, now: Date.now() })
	} catch (error) {
		return NextResponse.json(
			{ message: '再検証に失敗しました' },
			{ status: 500 },
		)
	}
}

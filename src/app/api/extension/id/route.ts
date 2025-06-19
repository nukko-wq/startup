import { NextResponse } from 'next/server'

export async function GET() {
	const extensionIdsStr = process.env.EXTENSION_ID
	console.debug('Raw extension IDs:', extensionIdsStr)

	if (!extensionIdsStr) {
		console.error('EXTENSION_ID environment variable is not set')
		return new NextResponse('Extension IDs not configured', { status: 500 })
	}

	const extensionIds = extensionIdsStr
		.split(',')
		.map((id) => id.trim())
		.filter((id) => id.length > 0)

	if (extensionIds.length === 0) {
		console.error('No valid extension IDs found after processing')
		return new NextResponse('No valid extension IDs', { status: 500 })
	}

	return NextResponse.json({ extensionIds })
}

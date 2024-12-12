import { PrismaClient } from '@prisma/client'

declare global {
	var dbClient: PrismaClient | undefined
}

const createPrismaClient = () => {
	const client = new PrismaClient({
		log: ['error'],
		datasources: {
			db: {
				url: process.env.DATABASE_URL,
			},
		},
	})

	// 接続テスト
	client
		.$connect()
		.then(() => console.log('Database connected'))
		.catch((e) => console.error('Database connection error:', e))

	return client
}

const prisma = globalThis.dbClient ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
	globalThis.dbClient = prisma
}

export const db = prisma

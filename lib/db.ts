import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined
}

const prismaClientSingleton = () => {
	return new PrismaClient({
		log: ['query', 'error', 'warn'],
	})
}

export const db = globalForPrisma.prisma ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') {
	globalForPrisma.prisma = db
}

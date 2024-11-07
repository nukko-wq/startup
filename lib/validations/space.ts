import { z } from 'zod'

export const spaceCreateSchema = z.object({
	name: z.string().min(1, '名前を入力してください'),
	workspaceId: z.string(),
})

export const spaceUpdateSchema = z.object({
	name: z.string().min(1, '名前を入力してください').optional(),
	workspaceId: z.string().optional(),
})

export type SpaceSchema = z.infer<typeof spaceCreateSchema>
export type SpaceUpdateSchema = z.infer<typeof spaceUpdateSchema>

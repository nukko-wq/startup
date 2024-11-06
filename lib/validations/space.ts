import { z } from 'zod'

export const spaceCreateSchema = z.object({
	name: z.string().min(1, '名前を入力してください'),
	workspaceId: z.string(),
})

export type SpaceSchema = z.infer<typeof spaceCreateSchema>

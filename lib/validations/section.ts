import { z } from 'zod'

export const sectionSchema = z.object({
	name: z.string(),
	order: z.number(),
	spaceId: z.string(),
})

export const sectionNameSchema = z.object({
	name: z.string().min(1, 'セクション名を入力してください'),
})

export type SectionSchema = z.infer<typeof sectionSchema>

import { z } from 'zod'

export const sectionSchema = z.object({
	name: z.string().min(1, '名前を入力してください'),
})

export type SectionSchema = z.infer<typeof sectionSchema>

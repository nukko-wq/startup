import { z } from 'zod'

export const sectionSchema = z.object({
	name: z.string(),
	order: z.number(),
	spaceId: z.string(),
})

export type SectionSchema = z.infer<typeof sectionSchema>

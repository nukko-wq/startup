import { z } from 'zod'

export const resourceSchema = z.object({
	url: z.string().url().min(1).max(1024),
	title: z.string().max(128).optional(),
	description: z.string().min(1).max(1024).optional().default('Webpage'),
})

export type ResourceSchema = z.infer<typeof resourceSchema>

import { z } from 'zod'

export const resourceSchema = z.object({
	title: z.string().min(1).max(128),
	url: z.string().min(1).max(1024),
	description: z.string().min(1).max(1024).optional(),
})

export type ResourceSchema = z.infer<typeof resourceSchema>

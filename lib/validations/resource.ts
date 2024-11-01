import { z } from 'zod'

export const resourceSchema = z.object({
	url: z
		.string()
		.url({ message: '有効なURLを入力して下さい' })
		.min(1, { message: 'URLは必須です' })
		.max(1024, { message: 'URLは1024文字以内で入力して下さい' }),
	title: z
		.string()
		.max(128, { message: 'タイトルは128文字以内で入力して下さい' })
		.optional(),
	description: z
		.string()
		.max(1024, { message: 'descriptionは1024文字以内で入力して下さい' })
		.optional(),
	faviconUrl: z.string().url().nullable().optional().or(z.literal('')),
	mimeType: z.string().nullable().optional().or(z.literal('')),
	isGoogleDrive: z.boolean().optional(),
})

export type ResourceSchema = z.infer<typeof resourceSchema>

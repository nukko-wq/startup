import { z } from 'zod'

export const resourceSchema = z.object({
	url: z
		.string()
		.min(1, { message: 'URLは必須です' })
		.url({ message: '有効なURLを入力してください' }),
	title: z
		.string()
		.max(255, { message: 'タイトルは255文字以内で入力してください' })
		.optional()
		.or(z.literal('')),
})

export type ResourceFormData = z.infer<typeof resourceSchema>

// zodを使用してワークスペースのスキーマを定義する

import { z } from 'zod'

export const workspaceSchema = z.object({
	name: z
		.string()
		.min(1, 'ワークスペース名は必須です')
		.max(20, 'ワークスペース名は20文字以内で入力してください'),
})

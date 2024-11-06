import { z } from 'zod'

export const workspaceCreateSchema = z.object({
	name: z.string().min(0).default('New Workspace'),
})

export const workspaceUpdateSchema = z.object({
	name: z.string().min(1, '名前を入力してください'),
})

export type WorkspaceSchema = z.infer<typeof workspaceCreateSchema>
export type WorkspaceUpdateSchema = z.infer<typeof workspaceUpdateSchema>

import { z } from 'zod'

export const workspaceCreateSchema = z.object({
	name: z.string().min(0).default('New Workspace'),
})

export type WorkspaceSchema = z.infer<typeof workspaceCreateSchema>

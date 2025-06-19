/**
 * Input validation schemas for API routes
 * Prevents XSS attacks and ensures data integrity
 */

import { z } from 'zod'

// Common validation patterns
const nameSchema = z
	.string()
	.min(1, 'Name is required')
	.max(100, 'Name must be less than 100 characters')
	.trim()
	.refine(
		(val) => val.length > 0,
		'Name cannot be empty after trimming whitespace'
	)

const urlSchema = z
	.string()
	.url('Invalid URL format')
	.max(2000, 'URL must be less than 2000 characters')

// Workspace schemas
export const createWorkspaceSchema = z.object({
	name: nameSchema,
})

export const updateWorkspaceSchema = z.object({
	name: nameSchema,
})

export const reorderWorkspacesSchema = z.object({
	workspaces: z
		.array(
			z.object({
				id: z.string().cuid('Invalid workspace ID format'),
				order: z.number().int().min(0, 'Order must be a non-negative integer'),
			})
		)
		.min(1, 'At least one workspace is required')
		.max(100, 'Too many workspaces in reorder request'),
})

// Space schemas
export const createSpaceSchema = z.object({
	name: nameSchema,
	workspaceId: z.string().cuid('Invalid workspace ID format'),
})

export const updateSpaceSchema = z.object({
	name: nameSchema,
})

export const reorderSpacesSchema = z.object({
	spaceId: z.string().cuid('Invalid space ID format'),
	destinationWorkspaceId: z.string().cuid('Invalid workspace ID format'),
	newOrder: z.number().int().min(0, 'Order must be a non-negative integer'),
})

// Section schemas
export const createSectionSchema = z.object({
	name: nameSchema,
	spaceId: z.string().cuid('Invalid space ID format'),
})

export const updateSectionSchema = z.object({
	name: nameSchema,
})

// Resource schemas
export const createResourceSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(255, 'Title must be less than 255 characters')
		.trim(),
	url: urlSchema,
	sectionId: z.string().cuid('Invalid section ID format'),
	faviconUrl: z
		.string()
		.url('Invalid favicon URL format')
		.optional()
		.or(z.literal('')),
	description: z
		.string()
		.max(1000, 'Description must be less than 1000 characters')
		.optional(),
})

export const updateResourceSchema = z.object({
	title: z
		.string()
		.min(1, 'Title is required')
		.max(255, 'Title must be less than 255 characters')
		.trim()
		.optional(),
	url: urlSchema.optional(),
	faviconUrl: z
		.string()
		.url('Invalid favicon URL format')
		.optional()
		.or(z.literal('')),
	description: z
		.string()
		.max(1000, 'Description must be less than 1000 characters')
		.optional(),
})

export const reorderResourcesSchema = z.object({
	resourceId: z.string().cuid('Invalid resource ID format'),
	destinationSectionId: z.string().cuid('Invalid section ID format'),
	newOrder: z.number().int().min(0, 'Order must be a non-negative integer'),
})

// Generic ID validation
export const validateId = (id: string, type: string) => {
	const result = z.string().cuid().safeParse(id)
	if (!result.success) {
		throw new Error(`Invalid ${type} ID format`)
	}
	return result.data
}
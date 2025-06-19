/**
 * Validation utilities for API routes
 */

import { NextResponse } from 'next/server'
import { z } from 'zod'

export class ValidationError extends Error {
	constructor(
		message: string,
		public issues: z.ZodIssue[]
	) {
		super(message)
		this.name = 'ValidationError'
	}
}

/**
 * Validate request body against a Zod schema
 * Throws ValidationError if validation fails
 */
export function validateRequestBody<T>(
	body: unknown,
	schema: z.ZodSchema<T>
): T {
	const result = schema.safeParse(body)
	
	if (!result.success) {
		throw new ValidationError(
			'Validation failed',
			result.error.issues
		)
	}
	
	return result.data
}

/**
 * Create a standardized validation error response
 */
export function createValidationErrorResponse(error: ValidationError) {
	const errorMessages = error.issues.map(issue => ({
		field: issue.path.join('.'),
		message: issue.message,
	}))

	return NextResponse.json(
		{
			error: 'Validation failed',
			details: errorMessages,
		},
		{ status: 400 }
	)
}

/**
 * Handle validation errors in API routes
 */
export function handleValidationError(error: unknown) {
	if (error instanceof ValidationError) {
		return createValidationErrorResponse(error)
	}
	
	// Re-throw other errors to be handled by the calling code
	throw error
}
# Task Completion Checklist

## Before Committing Code

### 1. Code Quality Checks
```bash
npm run lint              # Run Next.js linting - MUST pass
npm run build             # Ensure build succeeds - MUST pass
```

### 2. Type Safety
- Ensure TypeScript compilation passes without errors
- All new code should be properly typed
- No `any` types without justification

### 3. Database Changes
If database schema was modified:
```bash
npx prisma generate       # Regenerate Prisma client
npx prisma migrate dev    # Apply migrations in development
```

### 4. Testing (When Available)
**Note**: No testing framework is currently configured.
- Consider adding unit tests for new functionality
- Test manually in development environment
- Verify all CRUD operations work correctly

### 5. Code Review Requirements
- Follow existing code style and conventions
- Use feature-based organization for new components
- Ensure proper error handling and validation
- Add appropriate TypeScript types
- Follow Redux patterns for state management

### 6. Environment Validation
- Ensure all required environment variables are documented
- Test with actual Google OAuth flow if authentication is modified
- Verify database connections work

### 7. Browser Extension (If Modified)
- Test extension functionality with the main application
- Ensure proper communication between extension and app

## Deployment Considerations

### Vercel Deployment
```bash
npm run vercel-build      # Use this for Vercel deployments (includes Prisma migrations)
```

### Environment Variables
- Ensure all production environment variables are set
- Test with production-like environment
- Verify Google OAuth callbacks are properly configured

## Security Checklist
- No sensitive data in client-side code
- Proper validation on all API endpoints
- Authentication checks on protected routes
- No environment variables committed to repository

## Performance Considerations
- Optimize bundle size where possible
- Use proper React optimization patterns (memoization, etc.)
- Ensure database queries are efficient
- Consider caching strategies for frequently accessed data
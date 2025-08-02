# Task Completion Checklist

## Required Commands After Code Changes

### 1. Code Quality (MUST RUN)
```bash
npm run format      # Format code with Biome and fix auto-fixable linting issues
npm run lint        # Check for remaining linting issues
```

### 2. Build Verification
```bash
npm run build       # Ensure the application builds successfully
```

### 3. Database (If Schema Changes)
```bash
npx prisma generate     # Regenerate Prisma client if schema changed
npx prisma migrate dev  # Apply new migrations in development
```

## Testing
- No specific test framework mentioned in package.json
- Check if tests exist before assuming testing approach
- Look for test files or ask user for testing commands

## Pre-Commit Checklist
1. ✅ Run `npm run format`
2. ✅ Run `npm run lint` (should pass)
3. ✅ Run `npm run build` (should succeed)
4. ✅ Test functionality manually
5. ✅ Check for TypeScript errors
6. ✅ Verify no console errors

## Important Notes
- NEVER commit changes unless explicitly asked by user
- Always run linting and formatting after making changes
- Biome handles both formatting and linting - use it consistently
# Environment Setup & Configuration

## Required Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection for migrations  
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `ALLOWED_EMAILS` - Comma-separated list of allowed email addresses
- `NEXTAUTH_URL` - Application URL for auth callbacks
- `NEXTAUTH_SECRET` - NextAuth.js encryption secret

## Database Setup
- PostgreSQL database required
- Prisma ORM for database operations
- Migrations in `/prisma/migrations`
- Schema defined in `/prisma/schema.prisma`

## Development Environment
- Node.js with npm
- Linux system (WSL2 in this case)
- Git repository with proper gitignore
- VS Code with appropriate extensions recommended

## Browser Extension Setup
- Extension code in `startup-browser-extension/`
- Chrome extension manifest and scripts
- Communication between extension and main app

## Key Configuration Files
- `biome.json` - Code formatting and linting configuration
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `middleware.ts` - Next.js middleware for auth
- `package.json` - Dependencies and scripts
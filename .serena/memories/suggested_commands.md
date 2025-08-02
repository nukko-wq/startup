# Suggested Commands

## Development Server
```bash
npm run dev              # Start Next.js development server on http://localhost:3000
```

## Build & Production
```bash
npm run build           # Build the application for production
npm start              # Start production server
npm run vercel-build   # Build with Prisma migrations for Vercel deployment
```

## Code Quality & Linting
```bash
npm run lint           # Run Next.js linting
npm run format         # Format code (Note: Biome was recently uninstalled, this may need updating)
```

## Database Operations
```bash
npm run postinstall         # Generate Prisma client (runs automatically after npm install)
npx prisma migrate dev      # Apply database migrations in development
npx prisma generate         # Generate Prisma client manually
npx prisma studio          # Open Prisma Studio for database inspection
```

## Dependency Management
```bash
npm install                    # Install all dependencies
npm run upgrade-interactive    # Interactive dependency updates with ncu
```

## Essential Unix/Linux Commands
```bash
ls                    # List directory contents
cd <directory>        # Change directory
pwd                   # Print working directory
grep <pattern> <file> # Search for patterns in files
find <path> -name <pattern>  # Find files by name
git status           # Check git status
git add <files>      # Stage files for commit
git commit -m "message"  # Commit changes
git push            # Push to remote repository
```

## Environment Setup
- Ensure PostgreSQL is running
- Set up required environment variables (see environment_variables.md)
- Run `npm install` to install dependencies
- Run `npx prisma migrate dev` to set up database
- Run `npm run dev` to start development server

## Testing
**Note**: No testing framework is currently configured in the project. Consider adding Jest, Vitest, or Playwright for testing.
# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Development Server
```bash
npm run dev
```
Starts the Next.js development server on http://localhost:3000

### Build & Production
```bash
npm run build        # Build the application
npm start           # Start production server
npm run vercel-build # Build with Prisma migrations for Vercel deployment
```

### Code Quality
```bash
npm run lint         # Run Next.js linting
npm run format       # Format code with Biome (also fixes linting issues)
npm run upgrade-interactive # Interactive package updates with npm-check-updates
```

### Database
```bash
npm run postinstall  # Generate Prisma client (runs automatically after npm install)
npx prisma migrate dev    # Apply database migrations in development
npx prisma generate       # Generate Prisma client
npx prisma studio        # Open Prisma Studio for database inspection
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with Google OAuth
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS v4
- **Code Quality**: Biome v2 for formatting and linting
- **Drag & Drop**: @hello-pangea/dnd
- **UI Components**: react-aria-components, Lucide React icons

### Database Schema
The application uses a hierarchical structure:
- **Users** have multiple **Workspaces**
- **Workspaces** contain multiple **Spaces**
- **Spaces** contain multiple **Sections**
- **Sections** contain multiple **Resources** (bookmarks/links)

Each level supports ordering and the user can have one "last active" space.

### Authentication & Authorization
- Google OAuth with specific scopes for Drive access
- Email whitelist via `ALLOWED_EMAILS` environment variable
- Session management with JWT strategy
- Automatic token refresh handling

### State Management Architecture
Redux store organized by domain with separate slices for:
- `workspace` - Workspace management
- `space` - Space management and navigation
- `section` - Section organization
- `resource` - Bookmark/resource management
- `googleDrive` - Google Drive integration
- `tabs` - Browser extension tab management
- `overlay` - UI overlay states

Each slice includes:
- RTK Query API definitions for server communication
- Reducers for local state management
- Selectors for computed state
- TypeScript types

### File Organization
- `/src/app` - Next.js App Router pages and layouts
- `/src/app/features` - Feature-based organization with components, schemas, and actions
- `/src/app/lib/redux` - Redux store, slices, and state management
- `/src/lib` - Shared utilities (auth, database, sessions)
- `/src/types` - Global TypeScript type definitions
- `/prisma` - Database schema and migrations

### Browser Extension
The project includes a browser extension in `startup-browser-extension/` that communicates with the main application for tab management.

### Code Style
- Uses Biome with tab indentation
- Single quotes for JavaScript, double quotes for JSX
- Semicolons only when needed
- Import organization enabled
- Strict TypeScript configuration

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `DIRECT_URL` - Direct database connection for migrations
- `AUTH_GOOGLE_ID` - Google OAuth client ID
- `AUTH_GOOGLE_SECRET` - Google OAuth client secret
- `ALLOWED_EMAILS` - Comma-separated list of allowed email addresses
- `NEXTAUTH_URL` - Application URL for auth callbacks
- `NEXTAUTH_SECRET` - NextAuth.js encryption secret
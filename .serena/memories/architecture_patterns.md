# Architecture & Design Patterns

## State Management Architecture
Redux store organized by domain with separate slices:
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

## Authentication & Authorization
- Google OAuth with specific scopes for Drive access
- Email whitelist via `ALLOWED_EMAILS` environment variable
- Session management with JWT strategy  
- Automatic token refresh handling

## Database Design Pattern
Hierarchical structure with clear ownership:
```
User -> Workspaces -> Spaces -> Sections -> Resources
```
- Each level supports ordering
- User can have one "last active" space
- Proper foreign key relationships and indexes

## API Structure
- RESTful API routes in `/src/app/api`
- Organized by resource type
- Consistent error handling patterns
- Validation with Zod schemas

## Component Organization
- Feature-based directory structure
- Separation of concerns: components, schemas, actions
- Reusable UI components in `/src/app/components`
- Feature-specific components in `/src/app/features`

## Browser Extension Integration
- Separate extension in `startup-browser-extension/`
- Message passing for tab management
- Integration with main application state
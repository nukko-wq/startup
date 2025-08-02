# Code Style and Conventions

## Code Formatting & Linting
- **Note**: Biome was recently uninstalled from the project
- **Next.js ESLint**: Built-in linting with `npm run lint`
- **Prettier-style formatting**: Single quotes for JavaScript, double quotes for JSX
- **Indentation**: Tab indentation (was configured in Biome)
- **Semicolons**: Only when needed

## TypeScript Configuration
- **Strict mode**: Enabled (`"strict": true`)
- **Target**: ES2017
- **Module**: ESNext with bundler resolution
- **Path mapping**: `@/*` maps to `./src/*`
- **JSX**: Preserve mode for Next.js

## File Organization Patterns
- **Feature-based structure**: `/src/app/features/` organized by domain
- **Separation of concerns**: Components, schemas, actions separated
- **Redux organization**: Slices organized by domain in `/src/app/lib/redux/features/`
- **API routes**: RESTful structure in `/src/app/api/`

## Naming Conventions
- **Components**: PascalCase (e.g., `WorkspaceList.tsx`)
- **Files**: PascalCase for components, camelCase for utilities
- **Variables**: camelCase
- **Constants**: UPPER_SNAKE_CASE
- **Types/Interfaces**: PascalCase

## Import Organization
- **Absolute imports**: Uses `@/` for src directory
- **Import ordering**: External packages first, then internal imports

## Component Patterns
- **Functional components**: Uses React functional components with hooks
- **Props interfaces**: Defined as `ComponentNameProps`
- **Default exports**: Components use default exports
- **TypeScript**: Strict typing for all components and functions

## Redux Patterns
- **RTK Slices**: One slice per domain (workspace, space, section, resource, etc.)
- **Selectors**: Dedicated selector files for computed state
- **API definitions**: Separate API files for each domain
- **Optimistic updates**: Used throughout for better UX

## Database/API Patterns
- **Serialization**: Custom serialization functions for each entity type
- **Validation**: Zod schemas for request/response validation
- **Error handling**: Centralized error handling utilities
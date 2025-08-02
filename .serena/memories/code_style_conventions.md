# Code Style & Conventions

## Formatting (Biome Configuration)
- **Indentation**: Tab indentation (not spaces)
- **Quotes**: Single quotes for JavaScript, double quotes for JSX
- **Semicolons**: Only when needed (`semicolons: "asNeeded"`)
- **Import Organization**: Enabled automatically

## Linting Rules
- Uses Biome v2 with strict recommended rules
- Additional style rules enforced:
  - `noParameterAssign: "error"`
  - `useAsConstAssertion: "error"`
  - `useDefaultParameterLast: "error"`
  - `useSelfClosingElements: "error"`
  - `noInferrableTypes: "error"`

## File Organization
- `/src/app` - Next.js App Router pages and layouts
- `/src/app/features` - Feature-based organization with components, schemas, and actions
- `/src/app/lib/redux` - Redux store, slices, and state management
- `/src/lib` - Shared utilities (auth, database, sessions)
- `/src/types` - Global TypeScript type definitions
- `/prisma` - Database schema and migrations

## TypeScript
- Strict TypeScript configuration
- Type definitions in dedicated files
- Proper interface/type definitions for all data structures

## Naming Conventions
- React components: PascalCase (e.g., `WorkspaceList`, `SectionItem`)
- Files: kebab-case for utilities, PascalCase for components
- Functions: camelCase
- Constants: UPPER_SNAKE_CASE
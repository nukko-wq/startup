# Project Structure

## Root Directory
```
startup/
├── src/                          # Main source code
├── startup-browser-extension/    # Browser extension code
├── prisma/                       # Database schema and migrations
├── package.json                  # Dependencies and scripts
├── tsconfig.json                # TypeScript configuration
├── next.config.ts               # Next.js configuration
├── postcss.config.mjs           # PostCSS configuration
├── CLAUDE.md                    # AI assistant instructions
├── CODE_REVIEW.md               # Code review guidelines
└── middleware.ts                # Next.js middleware
```

## Source Code Structure (`/src`)

### Main Application (`/src/app`)
```
app/
├── (auth-pages)/              # Authentication pages
│   └── login/
├── (dashboard)/               # Main dashboard pages
│   ├── space/[spaceId]/      # Dynamic space pages
│   ├── components/           # Dashboard-specific components
│   └── utils/               # Dashboard utilities
├── api/                      # API routes
│   ├── auth/                # Authentication endpoints
│   ├── workspaces/          # Workspace CRUD operations
│   ├── spaces/              # Space CRUD operations
│   ├── sections/            # Section CRUD operations
│   ├── resources/           # Resource CRUD operations
│   └── googleapis/          # Google API integration
├── features/                # Feature-based organization
│   ├── auth/               # Authentication components
│   ├── workspace/          # Workspace management
│   ├── space/              # Space management
│   ├── section/            # Section management
│   ├── resource/           # Resource management
│   ├── tabs/               # Browser tab management
│   └── google-drive/       # Google Drive integration
├── lib/                    # Application-specific libraries
│   └── redux/              # Redux store and state management
└── components/             # Shared components
    ├── header/
    ├── sidebar/
    └── elements/
```

### Shared Libraries (`/src/lib`)
```
lib/
├── auth.ts                  # NextAuth configuration
├── prisma.ts               # Prisma client setup
├── session.ts              # Session utilities
├── google.ts               # Google API utilities
├── validation-schemas.ts   # Zod validation schemas
├── validation-utils.ts     # Validation utilities
├── ownership-utils.ts      # Ownership validation
└── env.ts                  # Environment validation
```

### Redux State Management (`/src/app/lib/redux`)
```
redux/
├── store.ts                # Redux store configuration
├── hooks.ts               # Typed Redux hooks
├── provider.tsx           # Redux provider component
└── features/              # Feature-specific slices
    ├── workspace/         # Workspace state
    ├── space/             # Space state
    ├── section/           # Section state
    ├── resource/          # Resource state
    ├── tabs/              # Tab management state
    ├── google-drive/      # Google Drive state
    └── overlay/           # UI overlay state
```

## Key Patterns
- **Feature-based organization**: Related components, types, and logic grouped by feature
- **Separation of concerns**: API routes, components, and state management separated
- **Hierarchical data structure**: Workspace → Space → Section → Resource
- **Type safety**: Comprehensive TypeScript types throughout
- **Reusable components**: Shared UI components in `/src/components`
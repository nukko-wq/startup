# Tech Stack and Dependencies

## Core Framework & Runtime
- **Next.js 15** with App Router - React framework
- **React 19** - UI library
- **TypeScript 5** - Static typing
- **Node.js** - Runtime environment

## Database & ORM
- **PostgreSQL** - Primary database
- **Prisma 6** - ORM and database toolkit
- **@prisma/client** - Database client

## Authentication & Authorization
- **NextAuth.js v5** (beta) - Authentication framework
- **@auth/prisma-adapter** - Prisma adapter for NextAuth
- **Google OAuth** - Authentication provider

## State Management
- **Redux Toolkit (@reduxjs/toolkit)** - State management
- **React Redux** - React bindings for Redux
- **RTK Query** - Data fetching and caching (part of Redux Toolkit)

## UI & Styling
- **Tailwind CSS v4** - Utility-first CSS framework
- **react-aria-components** - Accessible UI components
- **Lucide React** - Icon library
- **@hello-pangea/dnd** - Drag and drop functionality

## Form Handling & Validation
- **react-hook-form** - Form management
- **@hookform/resolvers** - Form validation resolvers
- **Zod** - Schema validation

## External APIs & Integrations
- **googleapis** - Google APIs integration
- **@types/chrome** - Chrome extension types

## Development Tools
- **Biome v2** - Formatting and linting (Note: recently uninstalled)
- **PostCSS** - CSS processing
- **@tailwindcss/postcss** - Tailwind CSS PostCSS plugin

## Utilities
- **lodash** - Utility library
- **uuid** - UUID generation

## Database Schema Hierarchy
Users → Workspaces → Spaces → Sections → Resources
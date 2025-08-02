# Project Overview

## Purpose
This is a startup application built with Next.js that serves as a bookmark management system. The application allows users to organize bookmarks into a hierarchical structure:
- **Users** have multiple **Workspaces**
- **Workspaces** contain multiple **Spaces**
- **Spaces** contain multiple **Sections**
- **Sections** contain multiple **Resources** (bookmarks/links)

## Key Features
- Google OAuth authentication with email whitelist
- Hierarchical bookmark organization
- Drag & drop functionality for reordering
- Browser extension integration for tab management
- Google Drive integration
- Real-time state management with Redux

## Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 with Google OAuth
- **State Management**: Redux Toolkit with RTK Query
- **Styling**: Tailwind CSS v4
- **Code Quality**: Biome v2 for formatting and linting
- **Drag & Drop**: @hello-pangea/dnd
- **UI Components**: react-aria-components, Lucide React icons
- **Language**: TypeScript
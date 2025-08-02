# Project Purpose and Overview

## What is this project?
This is a **Startup** web application - a bookmark/resource management system with a hierarchical structure. It helps users organize their bookmarks and resources in a structured way with workspaces, spaces, sections, and individual resources.

## Key Features
- **Hierarchical Organization**: Users → Workspaces → Spaces → Sections → Resources
- **Google Drive Integration**: Ability to browse and manage Google Drive files
- **Browser Extension**: Includes a browser extension for tab management
- **Authentication**: Google OAuth with email whitelist
- **Drag & Drop**: Support for reordering items at all levels
- **Real-time State Management**: Redux-based state management with optimistic updates

## Target Use Case
The application appears to be designed for professionals or teams who need to organize large amounts of web resources, bookmarks, and Google Drive files in a structured, hierarchical manner. It supports collaborative features through workspaces and integrates with browser extension for tab management.

## Architecture
The application uses a modern web stack with Next.js 15, PostgreSQL database, and includes both a web application and browser extension component.
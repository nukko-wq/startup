# Development Commands

## Essential Development Commands

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

### Code Quality (Important - Run After Changes)
```bash
npm run lint         # Run Next.js linting
npm run format       # Format code with Biome (also fixes linting issues)
```

### Database Operations
```bash
npm run postinstall  # Generate Prisma client (runs automatically after npm install)
npx prisma migrate dev    # Apply database migrations in development
npx prisma generate       # Generate Prisma client
npx prisma studio        # Open Prisma Studio for database inspection
```

### Package Management
```bash
npm run upgrade-interactive  # Interactive package updates with ncu
```

## System Commands (Linux)
- `git` - Version control
- `ls` - List files
- `cd` - Change directory
- `grep` / `rg` (ripgrep) - Search in files
- `find` - Find files
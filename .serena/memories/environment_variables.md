# Environment Variables

## Required Environment Variables

### Database Configuration
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database_name
DIRECT_URL=postgresql://user:password@localhost:5432/database_name
```
- `DATABASE_URL`: PostgreSQL connection string for Prisma
- `DIRECT_URL`: Direct database connection for migrations (usually same as DATABASE_URL)

### Authentication (NextAuth.js)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
```
- `NEXTAUTH_URL`: Application URL for auth callbacks
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js encryption

### Google OAuth Configuration
```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```
- `AUTH_GOOGLE_ID`: Google OAuth client ID
- `AUTH_GOOGLE_SECRET`: Google OAuth client secret

### Access Control
```env
ALLOWED_EMAILS=email1@example.com,email2@example.com
```
- `ALLOWED_EMAILS`: Comma-separated list of email addresses allowed to access the application

## Environment File Setup
Create a `.env.local` file in the project root with all the required variables above.

## Security Notes
- Never commit environment files to version control
- Use strong, unique values for `NEXTAUTH_SECRET`
- Ensure Google OAuth credentials are properly configured in Google Cloud Console
- Database should be properly secured with appropriate user permissions

## Google OAuth Setup
1. Create a project in Google Cloud Console
2. Enable Google+ API and Google Drive API
3. Configure OAuth consent screen
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs (e.g., `http://localhost:3000/api/auth/callback/google`)
6. Copy client ID and secret to environment variables
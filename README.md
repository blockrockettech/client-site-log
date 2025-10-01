# Proclean 1987 - Facility Management System

A comprehensive facility management system built for tracking cleaning staff visits, managing sites, and maintaining service quality through customizable checklists.

## Features

### Multi-Role System
- **Admin Dashboard**: Complete system management with user, site, and checklist administration
- **Staff Portal**: Visit logging, site management, and checklist completion
- **Client Interface**: Monitor assigned sites and view service history

### Core Functionality
- **Site Management**: Create and manage facility locations with detailed information
- **Visit Tracking**: Log visits with check-in/check-out times and notes
- **Customizable Checklists**: Create reusable checklists for different site types
- **User Management**: Role-based access control (Admin, Staff, Client)
- **Database Inspector**: Real-time database monitoring and management tools

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router v6

## Prerequisites

- Node.js 18+ (recommended: use [nvm](https://github.com/nvm-sh/nvm))
- A Supabase account and project

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <your-git-url>
cd client-site-log
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the project root with your Supabase credentials:

```bash
# Supabase Configuration
# Get these values from your Supabase project dashboard at https://app.supabase.com
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Example values (replace with your actual values):
# VITE_SUPABASE_URL=https://your-project-ref.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**How to get your Supabase credentials:**

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to Settings → API
4. Copy the "Project URL" as `VITE_SUPABASE_URL`
5. Copy the "anon public" key as `VITE_SUPABASE_ANON_KEY`

⚠️ **Important**: The `VITE_` prefix is required for Vite to expose these variables to the browser. These are public keys and safe to expose in the frontend.

### 4. Database Setup

The application uses Supabase migrations for database schema management. The migrations in `/supabase/migrations/` will be automatically applied to your Supabase project.

Key database features:
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Automated profile creation on user signup
- Proper foreign key relationships

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:8080`

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run build:dev` - Build in development mode
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── AppSidebar.tsx  # Main navigation sidebar
│   ├── Layout.tsx      # Application layout wrapper
│   └── ErrorBoundary.tsx # Error handling
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
│   └── supabase/       # Supabase client and types
├── lib/                # Utility functions and validations
├── pages/              # Route components
│   ├── admin/          # Admin-only pages
│   ├── staff/          # Staff role pages
│   └── client/         # Client role pages
└── assets/             # Static assets
```

## User Roles & Permissions

### Admin (`admin`)
- Full system access
- User management (create, update, delete users)
- Site management (all sites)
- Checklist management
- Visit oversight (all visits)
- Database inspection tools

### Staff (`staff`)
- View all sites
- Create and manage visits
- Complete checklists during visits
- View personal visit history

### Client (`client`)
- View assigned sites only
- Monitor visit history for their sites
- Read-only access to their facilities

## API Integration

The application uses Supabase's auto-generated TypeScript types for type safety. Database schema changes are automatically reflected in the TypeScript types.

### Key Database Tables
- `profiles` - User profiles with role information
- `sites` - Facility locations with visit scheduling
- `visits` - Service visit logs with check-in/out times
- `checklists` - Reusable task lists for different site types

## Development Notes

### Authentication Flow
1. User signs up/signs in via Supabase Auth
2. Profile is automatically created via database trigger
3. Role-based redirecting and UI rendering
4. Row Level Security enforces permissions at the database level

### Error Handling
- Global error boundary catches React errors
- Query error boundaries for data fetching errors
- Form validation with Zod schemas
- Comprehensive error messaging

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/client-site-log)

### Manual Deployment

The application can be deployed to any static hosting service:

1. Build the project: `npm run build`
2. Deploy the `dist/` folder to your hosting service
3. Configure environment variables on your hosting platform
4. Ensure your Supabase project is properly configured for production

**Recommended hosting options:**
- **Vercel** (recommended - see [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed guide)
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production

Set these environment variables in your hosting platform:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues related to:
- **Application bugs**: Open a GitHub issue
- **Supabase setup**: Check [Supabase Documentation](https://supabase.com/docs)
- **Deployment**: Consult your hosting provider's documentation

# examples

Checklist

Clinical Room 1

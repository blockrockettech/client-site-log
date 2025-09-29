# Deployment Guide - Vercel

This guide covers deploying the Proclean 1987 Facility Management System to Vercel.

## Prerequisites

- Vercel account ([sign up here](https://vercel.com))
- Supabase project with database set up
- Git repository (GitHub, GitLab, or Bitbucket)

## Environment Variables

Before deploying, you need to configure the following environment variables in Vercel:

### Required Environment Variables

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### How to Get Supabase Credentials

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy the **Project URL** as `VITE_SUPABASE_URL`
5. Copy the **anon public** key as `VITE_SUPABASE_ANON_KEY`

## Deployment Methods

### Method 1: Vercel CLI (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy from project directory:**
   ```bash
   vercel
   ```

4. **Follow the prompts:**
   - Link to existing project or create new one
   - Set up environment variables when prompted
   - Choose production deployment

5. **Set environment variables:**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

### Method 2: GitHub Integration

1. **Connect GitHub repository to Vercel:**
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure build settings:**
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Add environment variables:**
   - Go to Project Settings → Environment Variables
   - Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

4. **Deploy:**
   - Click "Deploy" button
   - Vercel will automatically build and deploy

## Build Configuration

The project is configured for optimal Vercel deployment:

### Package.json Scripts
- `build`: Production build
- `build:vercel`: Vercel-specific build
- `start`: Preview server
- `type-check`: TypeScript validation

### Vite Configuration
- **Output Directory**: `dist`
- **Code Splitting**: Optimized chunks for vendor libraries
- **Source Maps**: Development only
- **Preview Server**: Port 3000

### Vercel Configuration (`vercel.json`)
- **Framework**: Vite
- **SPA Routing**: All routes redirect to `index.html`
- **Asset Caching**: 1 year for static assets
- **Environment**: Production mode

## Post-Deployment Checklist

### 1. Environment Variables
- [ ] `VITE_SUPABASE_URL` is set correctly
- [ ] `VITE_SUPABASE_ANON_KEY` is set correctly
- [ ] No missing environment variables

### 2. Database Setup
- [ ] Supabase project is active
- [ ] Database migrations are applied
- [ ] Row Level Security (RLS) is enabled
- [ ] Test database connection

### 3. Application Testing
- [ ] Homepage loads correctly
- [ ] Authentication works (sign up/sign in)
- [ ] All user roles function properly
- [ ] Database operations work
- [ ] No console errors

### 4. Performance
- [ ] Page load times are acceptable
- [ ] Images and assets load correctly
- [ ] No 404 errors for routes

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build locally
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint
```

#### Environment Variables Not Working
- Ensure variables start with `VITE_`
- Check variable names are exact (case-sensitive)
- Redeploy after adding new variables

#### Database Connection Issues
- Verify Supabase URL and key are correct
- Check Supabase project is not paused
- Ensure RLS policies are properly configured

#### Routing Issues
- Verify `vercel.json` has SPA rewrite rules
- Check that all routes redirect to `index.html`

### Debug Commands

```bash
# Local build test
npm run build
npm run preview

# Check environment variables
vercel env ls

# View deployment logs
vercel logs [deployment-url]
```

## Performance Optimization

### Bundle Analysis
```bash
# Analyze bundle size
npm run build
npx vite-bundle-analyzer dist
```

### Caching Strategy
- Static assets cached for 1 year
- API responses cached appropriately
- Supabase queries optimized with proper indexing

### Code Splitting
- Vendor libraries in separate chunks
- Route-based code splitting
- Lazy loading for heavy components

## Security Considerations

### Environment Variables
- Never commit `.env` files to version control
- Use Vercel's environment variable system
- Rotate keys regularly

### Supabase Security
- RLS policies are properly configured
- API keys are properly scoped
- Database access is restricted by role

### Content Security Policy
- Consider adding CSP headers in production
- Validate all user inputs
- Sanitize data before display

## Monitoring and Analytics

### Vercel Analytics
- Enable Vercel Analytics for performance monitoring
- Set up error tracking
- Monitor Core Web Vitals

### Application Monitoring
- Set up error boundaries
- Log important events
- Monitor database performance

## Scaling Considerations

### Database
- Monitor Supabase usage limits
- Optimize queries for performance
- Consider database indexing

### CDN
- Vercel provides global CDN automatically
- Static assets served from edge locations
- API responses cached appropriately

## Rollback Strategy

### Quick Rollback
```bash
# Rollback to previous deployment
vercel rollback [deployment-url]
```

### Environment Rollback
- Keep previous environment variable values
- Document all configuration changes
- Test rollback procedures

## Support

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Community](https://github.com/vercel/vercel/discussions)

### Application Support
- Check application logs in Vercel dashboard
- Monitor Supabase logs
- Review browser console for client-side errors

## Next Steps

After successful deployment:

1. **Set up custom domain** (optional)
2. **Configure SSL certificates** (automatic with Vercel)
3. **Set up monitoring and alerts**
4. **Plan for scaling and performance optimization**
5. **Document deployment procedures for team**

---

**Note**: This deployment guide assumes you have completed the local development setup as described in the main README.md file.

# 🚀 Grammarly Clone Setup Guide

## Environment Variables

Create a `.env.local` file in the root directory with these variables:

```bash
# Database (Required for production)
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
# For local Supabase: postgresql://postgres:postgres@localhost:54322/postgres

# Clerk Authentication (Required)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_publishable_key_here"
CLERK_SECRET_KEY="sk_test_your_secret_key_here"
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/login"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/signup"

# Stripe (Disabled - billing functionality removed)
# STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key_here"
# STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret_here"
```

## Quick Start (Development Mode)

1. **Without Database** (Current State):
   - App runs with mock data
   - No database setup required
   - Perfect for UI development and testing

2. **With Database** (Full Features):
   ```bash
   # Start Supabase (requires Docker)
   npx supabase start
   
   # Run migrations
   npx drizzle-kit push
   
   # Start app
   npm run dev
   ```

## Getting API Keys

### Clerk (Authentication)
1. Go to [clerk.com](https://clerk.com)
2. Create account/project
3. Copy keys from dashboard

### Supabase (Database)
1. Go to [supabase.com](https://supabase.com)
2. Create project
3. Get connection string from settings

### Stripe (Disabled)
Billing functionality has been removed for the Grammarly app.
Re-enable in `/lib/stripe.ts` and `/actions/stripe.ts` if needed.

## Current Features Working

✅ **Without Database:**
- User interface
- Editor functionality
- Mock suggestions
- All UI components

✅ **With Database:**
- Document persistence
- User-owned documents
- Real suggestions storage
- Full authentication

❌ **Disabled (for simplicity):**
- Billing/subscription features
- Stripe integration
- Payment processing

## File Structure

- `/.env.local` - Your environment variables (create this)
- `/components/Editor/` - Rich text editor components
- `/components/Dashboard/` - Document management
- `/actions/documents.ts` - Database operations
- `/db/schema/` - Database tables 
# Test Users Scripts for Supabase

This directory contains SQL scripts to create and manage test users for the ProClean Site Log application.

## Scripts

### 1. `create_test_users.sql`
**Purpose**: Creates test users with a simplified, reliable approach.

**What it does**:
- Creates 3 test users: admin, staff, and client
- Creates associated profiles with proper roles
- Creates basic test sites for the client
- Creates a basic checklist
- Creates a sample visit

**Usage**: Run this script in the Supabase SQL Editor to create test users.

### 2. `seed_test_data.sql`
**Purpose**: Seeds comprehensive test data for realistic testing.

**What it does**:
- Creates 3 specialized checklists (Office, Warehouse, Retail)
- Creates 6 test sites with different types and schedules
- Creates 12 test visits (6 per staff member) with realistic data
- Includes varied visit notes and completion statuses
- Provides comprehensive test data for all user roles

**Usage**: Run this after `create_test_users.sql` for comprehensive test data.

### 3. `verify_test_user_email.sql`
**Purpose**: Verifies email addresses for test users.

**What it does**:
- Marks all test user emails as confirmed
- Sets proper confirmation status
- Updates timestamps

**Usage**: Run this if test users can't log in due to email verification issues.

### 4. `verify_all_test_users.sql`
**Purpose**: Complete verification for all test users.

**What it does**:
- Verifies emails and sets confirmation status
- Ensures profiles exist with correct roles
- Updates authentication timestamps

**Usage**: Run this for comprehensive test user setup.

### 5. `cleanup_test_users.sql`
**Purpose**: Removes all test users and their associated data.

**What it does**:
- Deletes test visits
- Deletes test sites
- Deletes test checklists
- Deletes test profiles
- Deletes test users from auth.users

**Usage**: Run this script to clean up all test data.

## Test User Credentials

After running the creation script, you can log in with these credentials:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@proclean1987.com | admin123 |
| Staff | staff@proclean1987.com | staff123 |
| Client | client@proclean1987.com | client123 |

## Quick Start

1. **Create test users**: Run `create_test_users.sql`
2. **Seed test data**: Run `seed_test_data.sql` for comprehensive data
3. **Verify emails**: Run `verify_test_user_email.sql` (if needed)
4. **Test login**: Use the credentials above
5. **Clean up**: Run `cleanup_test_users.sql` when done

## Troubleshooting

### Issue: "No API key found in request"
Check your `.env` file and ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set correctly.

### Issue: Users can't log in
Run `verify_test_user_email.sql` to ensure emails are confirmed.

### Issue: Missing profiles
Run `verify_all_test_users.sql` for comprehensive setup.

## Notes

- Scripts are idempotent (safe to run multiple times)
- Test data is marked with "Test" prefixes for easy identification
- All test users use consistent password patterns
- Scripts handle foreign key constraints properly
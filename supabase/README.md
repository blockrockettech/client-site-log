# Supabase Scripts

This directory contains SQL scripts and migrations for the ProClean Site Log application.

## Test Users

- **[create_test_users.sql](./create_test_users.sql)** - Create test users for development
- **[seed_test_data.sql](./seed_test_data.sql)** - Seed comprehensive test data (6 sites, 12 visits, 3 checklists)
- **[verify_test_user_email.sql](./verify_test_user_email.sql)** - Verify test user emails
- **[verify_all_test_users.sql](./verify_all_test_users.sql)** - Complete test user verification
- **[cleanup_test_users.sql](./cleanup_test_users.sql)** - Remove all test data
- **[README_TEST_USERS.md](./README_TEST_USERS.md)** - Detailed test user documentation

## Database Migrations

The `migrations/` directory contains database schema migrations:

- **20250912125314_*** - Initial RLS policies
- **20250912125335_*** - Database schema setup
- **20250912125354_*** - Additional schema components
- **20250912150000_*** - Make checklist_id nullable
- **20250912160000_*** - Fix checklist relationship
- **20250912170000_*** - Remove unique checklist constraint
- **20250912180000_*** - Add admin user info function
- **20250916000001_*** - Create client assignment helper

## Quick Start

1. **Set up database**: Run migrations in order
2. **Create test users**: Run `create_test_users.sql`
3. **Seed test data**: Run `seed_test_data.sql` for comprehensive test data
4. **Verify emails**: Run `verify_test_user_email.sql` if needed
5. **Test application**: Use test credentials to log in
6. **Clean up**: Run `cleanup_test_users.sql` when done

## Configuration

- **[config.toml](./config.toml)** - Supabase project configuration

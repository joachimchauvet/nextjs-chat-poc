# Declarative Database Schema

This directory contains the auto-generated declarative schema for the Supabase database, created using the recommended approach from the [Supabase documentation](https://supabase.com/docs/guides/local-development/declarative-database-schemas).

## Current Schema

- `generated.sql` - Complete auto-generated schema from the database

## How It Was Created

The schema was auto-generated using Supabase's built-in dump command:

```bash
supabase db dump --schema public > supabase/schemas/generated.sql
```

## Using the Declarative Schema

### 1. Making Schema Changes

To make schema changes, you have two options:

**Option A: Edit the schema file directly**

1. Edit `generated.sql` to declare your desired database state
2. Test locally: `supabase db reset`
3. Generate migration: `supabase db diff --schema public --file my_changes`
4. Apply to production: `supabase db push`

**Option B: Use migrations first, then regenerate**

1. Create a migration file with your changes
2. Apply locally: `supabase migration up`
3. Regenerate schema: `supabase db dump --schema public > supabase/schemas/generated.sql`

### 2. Development Workflow

```bash
# Test schema changes locally
supabase db reset

# Generate migration from schema changes
supabase db diff --schema public --file my_feature

# Apply to production
supabase db push
```

### 3. Updating from Production

If your production database changes, regenerate the schema:

```bash
supabase db dump --schema public > supabase/schemas/generated.sql
```

## Benefits of Auto-Generated Schema

✅ **Complete**: Includes all PostgreSQL settings and proper formatting  
✅ **Accurate**: Directly reflects your actual database state  
✅ **Production-Ready**: No missing constraints, indexes, or policies  
✅ **Maintainable**: Single source of truth for your database schema

## Breaking Down the Schema (Optional)

For large projects, you can break down the generated schema into smaller files:

```bash
# Extract just the tables
grep -A 50 "CREATE TABLE" generated.sql > tables.sql

# Extract just the policies
grep -A 10 "CREATE POLICY" generated.sql > policies.sql
```

Then update `supabase/config.toml` with multiple schema files:

```toml
schema_paths = ["./schemas/tables.sql", "./schemas/policies.sql"]
```

## Known Limitations

As mentioned in the [Supabase documentation](https://supabase.com/docs/guides/local-development/declarative-database-schemas#known-caveats), some entities aren't fully supported:

- DML statements (INSERT, UPDATE, DELETE)
- Some RLS policy alterations
- View ownership and grants
- Schema privileges
- Comments and partitions

For these cases, continue using traditional migrations.

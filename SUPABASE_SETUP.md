# 🚀 Supabase Setup Instructions

## ✅ Completed Steps
1. ✅ Created Supabase project
2. ✅ Updated .env.local with credentials
3. ✅ Created database schema files (`lib/database.sql` and `lib/database-rls.sql`)
4. ✅ Created Supabase client wrappers
5. ✅ Created TypeScript types for database
6. ✅ Created connection test endpoint

## 📋 Manual Setup Required

### Step 1: Run Database Migrations

1. **Open your Supabase Dashboard**
   - Go to: https://bramtdzshmewknjqddrt.supabase.co
   - Sign in with your account

2. **Navigate to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query" button

3. **Run the Database Schema**
   - Copy ALL contents from: `/lib/database.sql`
   - Paste into the SQL editor
   - Click "Run" (or press Cmd/Ctrl + Enter)
   - You should see: "Success. No rows returned"

4. **Run the RLS Policies**
   - Click "New Query" again to create a fresh query
   - Copy ALL contents from: `/lib/database-rls.sql`
   - Paste into the SQL editor
   - Click "Run"
   - You should see: "Success. No rows returned"

### Step 2: Create Storage Bucket

1. **Navigate to Storage**
   - Click "Storage" in the left sidebar
   - Click "New Bucket" button

2. **Configure the Bucket**
   - Name: `memory-photos`
   - Public bucket: ✅ Yes (check this box)
   - File size limit: `10`
   - Allowed MIME types: 
     ```
     image/jpeg,image/png,image/gif,image/webp
     ```
   - Click "Save"

### Step 3: Verify Setup

1. **Test the connection**
   - The dev server is already running on port 3002
   - Open a new terminal and run:
   ```bash
   curl http://localhost:3002/api/test-connection
   ```

2. **Expected Success Response**
   ```json
   {
     "success": true,
     "message": "Supabase connection successful",
     "environment": {
       "hasPublicUrl": true,
       "hasAnonKey": true,
       "hasServiceKey": true
     },
     "database": {
       "publicAccess": true,
       "adminAccess": true
     }
   }
   ```

## 🎯 Current Status

- **Dev Server**: Running on http://localhost:3002
- **Database**: Waiting for manual migration
- **Storage**: Waiting for bucket creation
- **Connection Test**: Will work after migrations are run

## 📝 Next Steps

After completing the manual setup above:
1. The connection test should return success
2. We'll create seed data for development
3. Continue with the next sprint tasks

## ⚠️ Troubleshooting

If you encounter issues:

1. **"Table not found" error**: Make sure you ran both SQL files completely
2. **Permission denied**: Check that RLS policies were applied
3. **Storage upload fails**: Verify the bucket is set to public
4. **Connection refused**: Make sure the dev server is running

## 📌 Quick Commands

```bash
# Test connection (after setup)
curl http://localhost:3002/api/test-connection | python3 -m json.tool

# View server logs
# The server is running in background, showing logs in the terminal
```

---

**Please complete the manual setup steps above and let me know when done!**
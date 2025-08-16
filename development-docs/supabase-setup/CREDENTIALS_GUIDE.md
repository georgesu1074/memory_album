# 🔐 Supabase Credentials Setup Guide

## Where to Find Your Supabase Credentials

1. **Log into your Supabase Dashboard**
   - Go to: https://app.supabase.com
   - Select your project

2. **Get Your Project URL and Anon Key**
   - Go to: Settings → API
   - You'll find:
     - **Project URL**: `https://[your-project-id].supabase.co`
     - **Anon/Public Key**: A long string starting with `eyJ...`
     - **Service Role Key**: Another long string (keep this SECRET!)

3. **Update Your .env.local File**
   Replace the placeholders with your actual values:

```env
# Supabase (REPLACE THESE WITH YOUR ACTUAL VALUES)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Other Services (for later)

### Qdrant (Vector Database)
- Sign up at: https://cloud.qdrant.io
- Create a cluster
- Get your URL and API key from the dashboard

### Google Gemini AI
- Go to: https://makersuite.google.com/app/apikey
- Create an API key
- Add to .env.local: `GEMINI_API_KEY=your_key_here`

### JWT Secret
- Generate a random string (32+ characters)
- You can use: `openssl rand -base64 32`
- Add to .env.local: `JWT_SECRET=your_generated_secret`

## Security Notes
⚠️ **NEVER commit .env.local to git** (it's already in .gitignore)
⚠️ **Service Role Key** gives full database access - keep it secret!
✅ **Anon Key** is safe to expose in frontend code
✅ **Project URL** is public information

## Testing Your Credentials
After updating .env.local, we'll create a test connection to verify everything works.

---

**Ready?** Once you've updated your .env.local with Supabase credentials, let me know and we'll continue with setting up the database schema!
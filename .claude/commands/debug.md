# /debug

Debug and troubleshoot issues with detailed analysis.

## Usage
```
/debug [context]
```

## Examples
```
/debug "Memory submission returns 500 error when uploading photos"
/debug "Photos not uploading on mobile Safari"
/debug "AI categorization grouping unrelated memories"
/debug "Tailwind styles not applying in production"
```

## Implementation

### 1. Parse Error Context
```
1. Identify error type (runtime, build, logic, UI)
2. Extract key symptoms
3. Determine affected component/feature
4. Note environment (dev/prod, browser, device)
```

### 2. Diagnostic Steps

#### For Runtime Errors
```
1. Check console logs
2. Review network tab
3. Inspect error stack trace
4. Check environment variables
5. Verify API endpoints
6. Review recent changes
```

#### For Build Errors
```
1. Check TypeScript errors
2. Review import statements
3. Verify dependencies installed
4. Check build configuration
5. Review environment setup
```

#### For UI Issues
```
1. Inspect element styles
2. Check responsive breakpoints
3. Verify Tailwind classes
4. Review component props
5. Check browser compatibility
```

#### For API/Backend Issues
```
1. Check request/response
2. Verify authentication
3. Review CORS settings
4. Check rate limiting
5. Inspect database queries
```

### 3. Analysis Framework

```markdown
## 🔍 Debugging: [Issue Description]

### Symptoms
- [What's happening]
- [Error messages]
- [When it occurs]

### Initial Analysis
- **Type**: [Runtime/Build/Logic/UI]
- **Component**: [Affected area]
- **Environment**: [Dev/Prod, Browser]
- **Severity**: [Critical/Major/Minor]

### Potential Causes
1. [Most likely cause]
   - Why: [Reasoning]
   - Check: [How to verify]
   
2. [Second possibility]
   - Why: [Reasoning]
   - Check: [How to verify]

### Diagnostic Steps
1. [First check]
2. [Second check]
3. [Third check]

### Solutions to Try
1. **Quick Fix**:
   ```code
   [Code snippet]
   ```
   
2. **Proper Solution**:
   ```code
   [Code snippet]
   ```

### Prevention
- [How to prevent in future]
- [Best practice to follow]
```

## Common Issues & Solutions

### Memory Submission 500 Error
```typescript
// Check 1: Verify Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Check 2: File size validation
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
if (file.size > MAX_FILE_SIZE) {
  return new Response('File too large', { status: 413 })
}

// Check 3: CORS configuration
headers: {
  'Access-Control-Allow-Origin': '*',
}
```

### Photos Not Uploading (Safari)
```typescript
// Issue: Safari FormData handling
// Solution: Use explicit append
const formData = new FormData()
Array.from(files).forEach((file, index) => {
  formData.append(`photo-${index}`, file)
})

// Alternative: Base64 encoding for Safari
const base64 = await convertToBase64(file)
```

### Tailwind Not Working in Production
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  // Ensure purge is configured correctly
}
```

### Environment Variables Not Loading
```bash
# Check .env.local exists
ls -la .env.local

# Verify format (no quotes needed)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=xxx

# Restart dev server after changes
npm run dev
```

## Debug Output Example

```
🔍 Debugging: Memory submission returns 500 error when uploading photos

### Symptoms
- 500 error on POST /api/memories
- Only occurs with photo uploads
- Text-only submissions work fine

### Initial Analysis
- **Type**: Runtime/API
- **Component**: Memory submission API
- **Environment**: Development
- **Severity**: Critical

### Potential Causes
1. File size exceeding limit
   - Check: Log file.size before upload
   
2. Supabase storage misconfigured
   - Check: Verify bucket exists and is public

3. Multipart parsing issue
   - Check: Log formData contents

### Diagnostic Steps
1. Add logging to API route:
   ```typescript
   console.log('Files received:', formData.getAll('photos'))
   ```

2. Check Supabase dashboard for storage errors

3. Test with smaller image file

### Solution Found
The issue was missing multipart configuration:

```typescript
export const config = {
  api: {
    bodyParser: false, // Required for multipart
  },
}
```

### Prevention
- Add file size validation client-side
- Show progress indicator during upload
- Add error boundary for better error handling
```

## Debugging Checklist
- [ ] Error reproduced locally
- [ ] Console logs checked
- [ ] Network requests inspected
- [ ] Recent changes reviewed
- [ ] Environment variables verified
- [ ] Dependencies up to date
- [ ] Browser compatibility checked
- [ ] Build output reviewed
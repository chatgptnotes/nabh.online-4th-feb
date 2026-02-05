# Backend Proxy Implementation - Completion Guide

## Status: 70% Complete

The Gemini API backend proxy has been partially implemented to secure the API key. This document outlines what's been done and what remains.

---

## ✅ Completed

### 1. Backend API Endpoint Created
**File**: `/api/generate-evidence.ts`
- Vercel serverless function
- Accepts POST requests with prompt
- Calls Gemini API with server-side key
- Returns response to frontend
- Error handling included

### 2. Environment Variable Updated
- Changed `.env` from `VITE_GEMINI_API_KEY` to `GEMINI_API_KEY`
- Server-side only (no VITE_ prefix)
- Added to Vercel production environment

### 3. Backend Proxy Function Created
**File**: `src/lib/supabase.ts`
- Added `callGeminiAPI(prompt, temperature, maxOutputTokens)` function
- Calls `/api/generate-evidence` endpoint
- Returns Gemini API response

### 4. Partially Updated Frontend
**File**: `src/components/ObjectiveDetailPage.tsx`
- Updated import to use `callGeminiAPI`
- Updated `handleExecuteEvidenceGeneration` function

---

## ⚠️ TODO: Complete These Updates

### Replace All Remaining Direct Gemini API Calls

The following functions in `ObjectiveDetailPage.tsx` still call Gemini directly and need updating:

#### 1. handleTestConnection (line ~665)
```typescript
// OLD:
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
  ...
);

// NEW:
const data = await callGeminiAPI(prompt, 0.7, 1024);
```

#### 2. handleGenerateEvidenceList (line ~891)
```typescript
// OLD:
const apiKey = getGeminiApiKey();
if (!apiKey) throw new Error('API key not configured');
const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, ...);

// NEW:
const data = await callGeminiAPI(prompt, 0.7, 2048);
```

#### 3. handleGenerateEvidenceFromInterpretation (line ~967)
```typescript
// Replace fetch call with callGeminiAPI
```

#### 4. handleGenerateEvidenceDocuments (line ~2035)
```typescript
// Replace getGeminiApiKey check and fetch call with callGeminiAPI
```

#### 5. handleGenerateCustomEvidence (line ~2248)
```typescript
// Replace getGeminiApiKey and fetch call with callGeminiAPI
```

#### 6. handleGenerateRegisters (line ~2340)
```typescript
// Replace getGeminiApiKey and fetch call with callGeminiAPI
```

#### 7. extractTextFromDocument (line ~2465)
```typescript
// Replace getGeminiApiKey and fetch call with callGeminiAPI
// Note: This function handles image upload, may need special handling
```

#### 8. handleImproveDocument (line ~2541)
```typescript
// Replace getGeminiApiKey and fetch call with callGeminiAPI
```

---

## 🔧 Search & Replace Pattern

For each function, follow this pattern:

### Step 1: Remove API Key Check
```typescript
// REMOVE:
const apiKey = getGeminiApiKey();
if (!apiKey) {
  throw new Error('API key not configured');
}
```

### Step 2: Replace Fetch Call
```typescript
// OLD:
const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
    }),
  }
);
if (!response.ok) throw new Error(`API error: ${response.status}`);
const data = await response.json();

// NEW:
const data = await callGeminiAPI(prompt, 0.7, 8192);
```

---

## 🧪 Testing Checklist

After completing all updates:

1. [ ] Build the project: `npm run build`
2. [ ] Test evidence generation from list
3. [ ] Test evidence generation modal
4. [ ] Test custom evidence generation
5. [ ] Test register generation
6. [ ] Test document improvement
7. [ ] Test interpretation evidence generation
8. [ ] Check browser console for any API key leaks
9. [ ] Deploy to Vercel: `vercel --prod`
10. [ ] Test production deployment

---

## 🔐 Security Verification

After deployment, verify security:

1. Open browser DevTools → Network tab
2. Generate any evidence
3. Check network requests - should see `/api/generate-evidence` calls
4. Should NOT see any `generativelanguage.googleapis.com` calls with `key=` parameter
5. Inspect page source - API key should NOT appear anywhere

---

## 📝 Additional Notes

### For Clawd Bot

When completing this task:
1. Search for all instances of `getGeminiApiKey()` and replace
2. Search for all instances of `generativelanguage.googleapis.com` and replace with `callGeminiAPI()`
3. Maintain the same error handling
4. Keep the same response parsing logic
5. Test each function after updating

### Function Signature
```typescript
callGeminiAPI(
  prompt: string,
  temperature: number = 0.7,
  maxOutputTokens: number = 8192
): Promise<any>
```

### Error Handling
The `callGeminiAPI` function throws errors, so existing try-catch blocks should work:
```typescript
try {
  const data = await callGeminiAPI(prompt);
  // Process data
} catch (error) {
  console.error('Error:', error);
  // Handle error
}
```

---

## 🎯 Expected Outcome

Once complete:
- ✅ API key never exposed to client
- ✅ All Gemini API calls go through backend proxy
- ✅ Same functionality as before
- ✅ Better security
- ✅ Usage tracking possible (future enhancement)
- ✅ Rate limiting possible (future enhancement)

---

## 🚀 Quick Command Reference

```bash
# Build and test locally
npm run build
npm run dev

# Deploy to production
vercel --prod

# Check environment variables
vercel env ls

# View deployment logs
vercel logs
```

---

Good luck with the completion! The hardest part (creating the backend proxy) is done. Now it's just systematic replacement.

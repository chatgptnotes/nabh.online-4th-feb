# F7: Direct Content Editor

## Overview
F7 is a new section added to the Recent SOPs page (`/recent-sops`) that allows direct editing of SOP content with real-time preview sync and AI-powered content improvement using Gemini API.

## Location
- **File:** `src/components/RecentSOPsPage.tsx`
- **Position:** Between "Final Prompt" section (F6) and "Final SOP Result" section
- **Route:** `/recent-sops`

## Features

### 1. Direct Content Editing
- Large textarea (250px height) for editing HTML content
- Edit SOP content directly without going through the generation flow
- Placeholder text guides users on how to use the feature

### 2. Auto-Sync on Blur
- When user clicks outside the textarea, content automatically syncs to Final SOP preview
- Shows snackbar notification: "Content auto-synced to preview!"
- No need to manually click sync button

### 3. Sync Status Indicator
| Status | Chip Color | Meaning |
|--------|------------|---------|
| ✓ Synced | Green | F7 content matches Final SOP preview |
| ⚠ Not synced | Yellow/Warning | F7 content differs from preview |

### 4. Manual Sync Button
- "Sync to Preview" button for manual sync
- Disabled when content is already synced
- Shows success snackbar on click

### 5. AI Improve Button (Gemini API)
- **Button:** "✨ AI Improve"
- **API:** Uses `callGeminiAPI` from `src/lib/supabase.ts`
- **Function:** Improves SOP content for:
  - Professional language
  - NABH compliance terminology
  - Grammar corrections
  - Step-by-step procedure formatting
- **Loading State:** Shows "AI Improving..." chip and button spinner
- **Auto-updates:** Both F7 textarea and Final SOP preview

### 6. Copy Button
- IconButton with copy icon
- Copies F7 content to clipboard
- Shows snackbar: "F7 copied!"

## State Variables

```tsx
// F7: Direct Content Editor
const [directEditContent, setDirectEditContent] = useState<string>('');
const [aiImproving, setAiImproving] = useState(false);
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                            │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Select Chapter│   │ Select Objective│   │ Generate SOP    │
│ & Objective   │   │ (Existing SOP)  │   │ Button          │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │ directEditContent state │
                 │ (F7 Textarea)           │
                 └─────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌─────────────────┐   ┌─────────────────┐
│ Edit in       │   │ Click "AI       │   │ Click outside   │
│ Textarea      │   │ Improve" Button │   │ (onBlur)        │
└───────────────┘   └─────────────────┘   └─────────────────┘
        │                     │                     │
        │                     ▼                     │
        │           ┌─────────────────┐             │
        │           │ Gemini API Call │             │
        │           │ (Improve Prompt)│             │
        │           └─────────────────┘             │
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │ finalSOP state          │
                 │ (Preview & PDF)         │
                 └─────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │ Final SOP Result        │
                 │ (iframe preview)        │
                 └─────────────────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │ PDF Download / Save DB  │
                 └─────────────────────────┘
```

## Sync Points

Content is synced to `directEditContent` when:
1. **Existing SOP loads** from `nabh_generated_sops` table (line ~208)
2. **SOP is generated** via "Generate SOP" button (line ~359)
3. **SOP is updated** via Improvement Chat (line ~480)

Content is cleared when:
1. **Chapter changes** (line ~566)
2. **Objective changes** (line ~189)

## AI Improve Prompt

```
You are an expert SOP writer for NABH hospital accreditation.

TASK: Improve the following SOP content to make it more professional,
clear, and compliant with NABH standards.

INSTRUCTIONS:
1. Keep the same HTML structure and formatting
2. Improve language clarity and professionalism
3. Ensure NABH compliance terminology is used
4. Fix any grammatical errors
5. Make procedures more step-by-step if needed
6. Keep all existing sections but enhance them

OUTPUT: Return ONLY the improved HTML content, no explanations.
```

## UI Components

```tsx
<Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
  {/* Header */}
  <Box sx={{ bgcolor: '#e1f5fe' }}>
    - Title: "F7: Direct Content Editor"
    - Sync Status Chip (✓ Synced / ⚠ Not synced)
    - AI Improving Chip (when loading)
    - "✨ AI Improve" Button
    - "Sync to Preview" Button
    - Copy IconButton
  </Box>

  {/* Content */}
  <Box>
    <textarea
      value={directEditContent}
      onChange={...}
      onBlur={...}  // Auto-sync
    />
  </Box>
</Paper>
```

## Dependencies

- `@mui/material` - UI components (Paper, Box, Button, Chip, IconButton)
- `@mui/icons-material` - Icons (GenerateIcon, CopyIcon)
- `callGeminiAPI` from `src/lib/supabase.ts` - Gemini API integration

## Testing

1. Navigate to `/recent-sops`
2. Select a Chapter from dropdown
3. Select an Objective Element
4. If existing SOP found → content loads in F7 automatically
5. Edit content in F7 textarea
6. Click outside → preview updates (auto-sync)
7. Click "✨ AI Improve" → Gemini improves content
8. Click "PDF" → PDF contains edited/improved content
9. Click Save → saves edited content to database

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-06 | Initial implementation with auto-sync and AI Improve |

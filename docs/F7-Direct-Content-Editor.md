# F7: Modify SOP with AI

## Overview
F7 is a prompt-based SOP modifier that allows users to modify the Final SOP Result by entering natural language instructions. Gemini AI processes the instructions and updates the SOP accordingly.

## Location
- **File:** `src/components/RecentSOPsPage.tsx`
- **Position:** Between "Final Prompt" section and "Final SOP Result" section
- **Route:** `/recent-sops`

## How It Works

### User Flow
```
1. Load/Generate SOP → Final SOP Result shows content
2. Type instructions in F7 → "Change the title to ABC"
3. Click "🔄 Apply Changes"
4. Gemini modifies the SOP based on instructions
5. Final SOP Result updates with modified content
6. F7 clears (ready for next instruction)
```

### Gemini AI Prompt
```
CURRENT SOP CONTENT:
{finalSOP}

USER'S MODIFICATION REQUEST:
{modifyPrompt}

TASK: Modify the SOP according to the user's request.
Keep the same HTML structure. Only change what the user asked.
Return the complete modified HTML.
```

## Features

### 1. Prompt-Based Modification
- User enters natural language instructions
- No need to edit HTML directly
- AI understands and applies changes

### 2. Example Instructions
- "Change the document number to SOP-001"
- "Add a section about patient safety"
- "Update the effective date to today"
- "Change the title to 'Infection Control Protocol'"
- "Add a step for hand hygiene before procedure"

### 3. Apply Changes Button
- **Button:** "🔄 Apply Changes"
- **Disabled when:** No prompt entered OR no SOP loaded
- **Loading state:** Shows "Applying..." with spinner
- **On success:** SOP updates, prompt clears, success snackbar

## State Variables

```tsx
// F7: Modify SOP with AI
const [modifyPrompt, setModifyPrompt] = useState<string>('');
const [applyingChanges, setApplyingChanges] = useState(false);
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FINAL SOP RESULT                             │
│                    (Current SOP Content)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                F7: MODIFY SOP WITH AI                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  "Change the document number to SOP-001"                  │  │
│  │  (User's modification instructions)                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [🔄 Apply Changes]                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      GEMINI AI                                  │
│  Input: Current SOP + User's Instructions                       │
│  Output: Modified SOP HTML                                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINAL SOP RESULT                             │
│                    (Modified SOP Content)                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PDF / SAVE TO DB                             │
│                    (Uses Modified Content)                      │
└─────────────────────────────────────────────────────────────────┘
```

## UI Components

```tsx
<Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
  {/* Header */}
  <Box sx={{ bgcolor: '#e1f5fe' }}>
    - Title: "F7: Modify SOP with AI"
    - Loading Chip (when applying changes)
    - "🔄 Apply Changes" Button
  </Box>

  {/* Content */}
  <Box>
    <textarea
      value={modifyPrompt}
      onChange={...}
      placeholder="Enter instructions to modify the SOP..."
    />
  </Box>
</Paper>
```

## Dependencies

- `@mui/material` - UI components
- `callGeminiAPI` from `src/lib/supabase.ts` - Gemini API integration

## Validation

1. **Prompt required:** Button disabled if no prompt entered
2. **SOP required:** Button disabled if no SOP loaded in Final SOP Result
3. **Error handling:** Shows snackbar on API failure

## Testing

1. Navigate to `/recent-sops`
2. Select Chapter & Objective (or generate new SOP)
3. Ensure Final SOP Result has content
4. Type in F7: "Change the title to Test SOP"
5. Click "🔄 Apply Changes"
6. Verify Final SOP Result shows modified title
7. Click PDF → verify PDF has modified title

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-02-06 | Initial: Direct HTML editor with auto-sync |
| 2.0 | 2026-02-06 | Changed to prompt-based modifier with Gemini AI |

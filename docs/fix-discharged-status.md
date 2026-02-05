# Changelog - 31 Jan 2026

## Summary
Fixed patient status issue where patients with discharge dates were showing as "Active" instead of "Discharged".

---

## Issue #1: Auto-set "Discharged" Status Based on Discharge Date

### Problem
- 500 patients imported from Excel
- All patients showing status "Active"
- Patients like "Shourya Avi Adsod" had discharge date "02 Sept 2025" but showed "Active"
- DISCHARGED tab showed count (0)

### Root Cause
Import logic was not checking if discharge date exists before setting status.

### Solution

#### Part A: Code Fix (for future imports)

**File:** `src/components/patients/ImportPatientsModal.tsx` (line 337)

**Before:**
```typescript
status: (String(status).trim() as Patient['status']) || 'Active',
```

**After:**
```typescript
status: dischargeDate ? 'Discharged' : ((String(status).trim() as Patient['status']) || 'Active'),
```

**Logic:**
- If `dischargeDate` exists → status = "Discharged"
- Otherwise → use status from Excel column, or default to "Active"

#### Part B: Database Fix (for existing data)

**Script Created:** `fix-discharged-status.mjs`

```javascript
// Updates all patients where discharge_date IS NOT NULL and status = 'Active'
// Sets their status to 'Discharged'
```

**Command to run:**
```bash
node fix-discharged-status.mjs
```

**API Query executed:**
```
PATCH /rest/v1/nabh_patients
WHERE discharge_date IS NOT NULL AND status = 'Active'
SET status = 'Discharged', updated_at = NOW()
```

### Results
| Status | Count |
|--------|-------|
| Active | 184 |
| Discharged | 316 |
| Transferred | 0 |
| **Total** | **500** |

### Verification
After fix, tab counts correctly show:
- ALL (500)
- ACTIVE (184)
- DISCHARGED (316)
- TRANSFERRED (0)

---

## Files Modified Today

| File | Change |
|------|--------|
| `src/components/patients/ImportPatientsModal.tsx` | Added auto-set status logic based on discharge date |
| `fix-discharged-status.mjs` | Created one-time script to fix existing patient data |
| `docs/fix-discharged-status.md` | Created this documentation |

---

## Notes
- The script `fix-discharged-status.mjs` was a one-time fix and can be deleted
- Future imports will automatically set correct status based on discharge date

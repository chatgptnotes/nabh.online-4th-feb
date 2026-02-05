# Master Data Migration to Supabase - Complete Analysis & Plan

## Executive Summary

**Current Status:** Most master data IS already in Supabase database
**Remaining Work:** Migrate localStorage/sessionStorage data and unused legacy files
**Risk Level:** LOW - System is more robust than initially assessed

---

## 1. ALREADY IN DATABASE ✅

### Core NABH Data (100% Database-Backed)
- ✅ **nabh_chapters** - Chapter master data
- ✅ **nabh_standards** - Standards for each chapter
- ✅ **nabh_elements** - Objective elements (408 elements)
- ✅ **nabh_objective_edits** - User edits and customizations
- ✅ **nabh_patients** - Patient master data
- ✅ **nabh_team_members** - Staff/employee master data
- ✅ **nabh_ai_generated_evidence** - Generated evidence documents
- ✅ **nabh_kpi_graphs** - KPI tracking data
- ✅ **nabh_departments** - Department master

**Impact:** Core audit-ready data is safe and persistent ✅

---

## 2. NOT IN DATABASE ⚠️ - Action Required

### A. Browser Storage (High Priority)

#### 1. Presentations (localStorage)
**File:** `src/components/SlideDeckPage.tsx`
**Storage:** `localStorage.getItem('nabh_presentations')`
**Data Structure:**
```typescript
interface Presentation {
  id: string;
  name: string;
  description: string;
  slides: Slide[];
  status: 'draft' | 'ready' | 'presented';
  createdAt: string;
  updatedAt: string;
  presentedAt?: string;
}

interface Slide {
  type: 'title' | 'content' | 'summary';
  title: string;
  content: string;
  notes?: string;
}
```

**Recommended Table Schema:**
```sql
-- Presentations table
CREATE TABLE nabh_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'ready', 'presented')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  presented_at TIMESTAMPTZ,
  hospital_id TEXT DEFAULT 'hope',
  created_by TEXT,
  CONSTRAINT presentations_pkey PRIMARY KEY (id)
);

-- Slides table (one-to-many with presentations)
CREATE TABLE nabh_presentation_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID REFERENCES nabh_presentations(id) ON DELETE CASCADE,
  slide_order INTEGER NOT NULL,
  slide_type TEXT CHECK (slide_type IN ('title', 'content', 'summary')),
  title TEXT NOT NULL,
  content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(presentation_id, slide_order)
);

-- Index for faster queries
CREATE INDEX idx_presentation_slides_presentation_id ON nabh_presentation_slides(presentation_id);
CREATE INDEX idx_presentations_hospital_id ON nabh_presentations(hospital_id);
```

**Migration Steps:**
1. Create migration file: `011_create_presentations_tables.sql`
2. Update `SlideDeckPage.tsx` to use Supabase instead of localStorage
3. Create service file: `src/services/presentationStorage.ts`
4. Add data migration utility to move existing localStorage data to DB

---

#### 2. KPI Data (localStorage/computed)
**Files:**
- `src/components/KPIsPage.tsx`
- `src/components/KPIDetailPage.tsx`
- `src/services/kpiDataGenerator.ts`

**Current Storage:** Mix of localStorage and runtime computation

**Status:** KPI graphs already stored in `nabh_kpi_graphs` table ✅
**Action:** Verify all KPI configuration templates are backed up

---

### B. Legacy Files (No Longer Used) 📦

#### 1. nabhShcoStandards.ts (3,146 lines)
**Status:** ❌ NOT USED - Data loaded from `nabh_chapters`, `nabh_standards`, `nabh_elements` tables
**Action:** Archive file, keep as reference only

#### 2. nabhEvidencePrompt.ts (324 lines)
**Status:** ❌ NOT USED
**Action:**
- Extract useful prompt templates
- Store in `nabh_prompt_templates` table (optional)
- Archive original file

#### 3. nabhLearningResources.ts (1,081 lines)
**Status:** ❌ NOT USED
**Action:**
- Review if any resources should be added to `nabh_elements.training_materials`
- Archive file

#### 4. nabhData.ts (80 lines)
**Status:** Check usage
**Action:** Verify and migrate if needed

---

## 3. MIGRATION PLAN

### Phase 1: Presentations Migration (High Priority)
**Timeline:** 1-2 hours
**Steps:**
1. Create migration SQL file
2. Run migration to create tables
3. Create `presentationStorage.ts` service
4. Update `SlideDeckPage.tsx` to use Supabase
5. Create utility to migrate existing localStorage data
6. Test presentation CRUD operations
7. Deploy and verify

### Phase 2: Cleanup & Documentation
**Timeline:** 30 minutes
**Steps:**
1. Archive unused data files to `src/data/archive/`
2. Update documentation
3. Create backup scripts
4. Update .gitignore if needed

---

## 4. SQL MIGRATION SCRIPTS

### Script 1: Create Presentations Tables

```sql
-- File: supabase/migrations/011_create_presentations_tables.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create presentations table
CREATE TABLE IF NOT EXISTS nabh_presentations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('draft', 'ready', 'presented')) DEFAULT 'draft',
  hospital_id TEXT DEFAULT 'hope',
  created_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  presented_at TIMESTAMPTZ
);

-- Create slides table
CREATE TABLE IF NOT EXISTS nabh_presentation_slides (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  presentation_id UUID NOT NULL REFERENCES nabh_presentations(id) ON DELETE CASCADE,
  slide_order INTEGER NOT NULL,
  slide_type TEXT CHECK (slide_type IN ('title', 'content', 'summary')) NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_slide_order UNIQUE(presentation_id, slide_order)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_presentation_slides_presentation_id
  ON nabh_presentation_slides(presentation_id);
CREATE INDEX IF NOT EXISTS idx_presentations_hospital_id
  ON nabh_presentations(hospital_id);
CREATE INDEX IF NOT EXISTS idx_presentations_status
  ON nabh_presentations(status);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_presentations_updated_at
  BEFORE UPDATE ON nabh_presentations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_presentation_slides_updated_at
  BEFORE UPDATE ON nabh_presentation_slides
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add RLS policies
ALTER TABLE nabh_presentations ENABLE ROW LEVEL SECURITY;
ALTER TABLE nabh_presentation_slides ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read/write presentations
CREATE POLICY "Allow all access to presentations"
  ON nabh_presentations FOR ALL
  USING (true) WITH CHECK (true);

CREATE POLICY "Allow all access to slides"
  ON nabh_presentation_slides FOR ALL
  USING (true) WITH CHECK (true);

-- Add comments
COMMENT ON TABLE nabh_presentations IS 'Stores NABH assessment presentations';
COMMENT ON TABLE nabh_presentation_slides IS 'Stores individual slides for presentations';
```

---

## 5. SERVICE FILES TO CREATE

### File: `src/services/presentationStorage.ts`

```typescript
import { supabase } from '../lib/supabase';

export interface Slide {
  type: 'title' | 'content' | 'summary';
  title: string;
  content: string;
  notes?: string;
}

export interface Presentation {
  id: string;
  name: string;
  description: string;
  slides: Slide[];
  status: 'draft' | 'ready' | 'presented';
  createdAt: string;
  updatedAt: string;
  presentedAt?: string;
  hospitalId?: string;
  createdBy?: string;
}

interface DBPresentation {
  id: string;
  name: string;
  description: string | null;
  status: 'draft' | 'ready' | 'presented';
  hospital_id: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  presented_at: string | null;
}

interface DBSlide {
  id: string;
  presentation_id: string;
  slide_order: number;
  slide_type: 'title' | 'content' | 'summary';
  title: string;
  content: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Load all presentations for a hospital
export async function loadPresentations(hospitalId: string = 'hope') {
  const { data: presentations, error: presError } = await supabase
    .from('nabh_presentations')
    .select('*')
    .eq('hospital_id', hospitalId)
    .order('updated_at', { ascending: false });

  if (presError || !presentations) {
    console.error('Error loading presentations:', presError);
    return { success: false, error: presError, data: null };
  }

  // Load slides for each presentation
  const presentationsWithSlides: Presentation[] = [];
  for (const pres of presentations as DBPresentation[]) {
    const { data: slides, error: slidesError } = await supabase
      .from('nabh_presentation_slides')
      .select('*')
      .eq('presentation_id', pres.id)
      .order('slide_order', { ascending: true });

    if (slidesError) {
      console.error('Error loading slides:', slidesError);
      continue;
    }

    const presentation: Presentation = {
      id: pres.id,
      name: pres.name,
      description: pres.description || '',
      status: pres.status,
      createdAt: pres.created_at,
      updatedAt: pres.updated_at,
      presentedAt: pres.presented_at || undefined,
      hospitalId: pres.hospital_id,
      createdBy: pres.created_by || undefined,
      slides: (slides as DBSlide[] || []).map(s => ({
        type: s.slide_type,
        title: s.title,
        content: s.content || '',
        notes: s.notes || undefined,
      })),
    };

    presentationsWithSlides.push(presentation);
  }

  return { success: true, data: presentationsWithSlides, error: null };
}

// Save a new presentation
export async function savePresentation(presentation: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt'>) {
  // Insert presentation
  const { data: newPres, error: presError } = await supabase
    .from('nabh_presentations')
    .insert({
      name: presentation.name,
      description: presentation.description,
      status: presentation.status,
      hospital_id: presentation.hospitalId || 'hope',
      created_by: presentation.createdBy,
      presented_at: presentation.presentedAt,
    })
    .select()
    .single();

  if (presError || !newPres) {
    return { success: false, error: presError, data: null };
  }

  // Insert slides
  const slidesData = presentation.slides.map((slide, index) => ({
    presentation_id: newPres.id,
    slide_order: index,
    slide_type: slide.type,
    title: slide.title,
    content: slide.content,
    notes: slide.notes,
  }));

  const { error: slidesError } = await supabase
    .from('nabh_presentation_slides')
    .insert(slidesData);

  if (slidesError) {
    // Rollback: delete the presentation
    await supabase.from('nabh_presentations').delete().eq('id', newPres.id);
    return { success: false, error: slidesError, data: null };
  }

  return { success: true, data: newPres.id, error: null };
}

// Update existing presentation
export async function updatePresentation(id: string, updates: Partial<Presentation>) {
  // Update presentation metadata
  if (updates.name || updates.description || updates.status || updates.presentedAt) {
    const { error: presError } = await supabase
      .from('nabh_presentations')
      .update({
        name: updates.name,
        description: updates.description,
        status: updates.status,
        presented_at: updates.presentedAt,
      })
      .eq('id', id);

    if (presError) {
      return { success: false, error: presError };
    }
  }

  // Update slides if provided
  if (updates.slides) {
    // Delete existing slides
    await supabase
      .from('nabh_presentation_slides')
      .delete()
      .eq('presentation_id', id);

    // Insert new slides
    const slidesData = updates.slides.map((slide, index) => ({
      presentation_id: id,
      slide_order: index,
      slide_type: slide.type,
      title: slide.title,
      content: slide.content,
      notes: slide.notes,
    }));

    const { error: slidesError } = await supabase
      .from('nabh_presentation_slides')
      .insert(slidesData);

    if (slidesError) {
      return { success: false, error: slidesError };
    }
  }

  return { success: true, error: null };
}

// Delete presentation
export async function deletePresentation(id: string) {
  const { error } = await supabase
    .from('nabh_presentations')
    .delete()
    .eq('id', id);

  return { success: !error, error };
}

// Migrate from localStorage to database
export async function migrateLocalStoragePresentations() {
  const localData = localStorage.getItem('nabh_presentations');
  if (!localData) {
    return { success: true, migrated: 0 };
  }

  try {
    const presentations: Presentation[] = JSON.parse(localData);
    let migrated = 0;

    for (const pres of presentations) {
      const result = await savePresentation({
        name: pres.name,
        description: pres.description,
        status: pres.status,
        slides: pres.slides,
        presentedAt: pres.presentedAt,
        hospitalId: 'hope',
      });

      if (result.success) {
        migrated++;
      }
    }

    // Backup localStorage data
    localStorage.setItem('nabh_presentations_backup', localData);
    // Clear localStorage after successful migration
    localStorage.removeItem('nabh_presentations');

    return { success: true, migrated };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, migrated: 0, error };
  }
}
```

---

## 6. CODE UPDATES REQUIRED

### Update: `src/components/SlideDeckPage.tsx`

Replace localStorage code with Supabase calls:

```typescript
// OLD CODE (Remove):
useEffect(() => {
  const saved = localStorage.getItem('nabh_presentations');
  if (saved) {
    setPresentations(JSON.parse(saved));
  }
}, []);

useEffect(() => {
  localStorage.setItem('nabh_presentations', JSON.stringify(presentations));
}, [presentations]);

// NEW CODE (Add):
import {
  loadPresentations,
  savePresentation,
  updatePresentation,
  deletePresentation,
  migrateLocalStoragePresentations
} from '../services/presentationStorage';

// Load presentations from Supabase
useEffect(() => {
  const loadData = async () => {
    // Try migration first
    await migrateLocalStoragePresentations();

    // Load from database
    const result = await loadPresentations(hospitalConfig.id);
    if (result.success && result.data) {
      setPresentations(result.data);
    }
  };
  loadData();
}, [hospitalConfig.id]);

// Save new presentation
const handleSavePresentation = async (newPres: Presentation) => {
  const result = await savePresentation(newPres);
  if (result.success) {
    // Reload presentations
    const loadResult = await loadPresentations(hospitalConfig.id);
    if (loadResult.success && loadResult.data) {
      setPresentations(loadResult.data);
    }
  }
};
```

---

## 7. TESTING CHECKLIST

### Presentations Migration Testing
- [ ] Run migration SQL successfully
- [ ] Create new presentation via UI
- [ ] Verify presentation saved to database
- [ ] Load presentations from database
- [ ] Update existing presentation
- [ ] Delete presentation
- [ ] Verify slides order maintained
- [ ] Test with multiple presentations
- [ ] Verify localStorage migration works
- [ ] Test across different hospitals

---

## 8. DEPLOYMENT STEPS

1. **Backup Current Data**
   ```bash
   # Backup localStorage data
   # Run in browser console on production site
   const backup = localStorage.getItem('nabh_presentations');
   console.log('BACKUP:', backup);
   # Save this output to a file
   ```

2. **Run Migration**
   ```bash
   # Run migration SQL in Supabase dashboard
   # Or via CLI if configured
   supabase db push
   ```

3. **Deploy Code Changes**
   ```bash
   git add .
   git commit -m "feat: migrate presentations to Supabase database"
   git push latest main
   ```

4. **Verify Migration**
   - Open application
   - Check that existing presentations load
   - Create a test presentation
   - Verify it appears in Supabase dashboard

5. **Monitor**
   - Check browser console for errors
   - Verify database queries in Supabase dashboard
   - Test across different browsers

---

## 9. SUMMARY

### Current State
- ✅ Core NABH data: 100% in database
- ✅ Patient data: In database
- ✅ Team members: In database
- ✅ Evidence documents: In database
- ⚠️ Presentations: localStorage (needs migration)
- 📦 Legacy files: Not used (can archive)

### Next Steps
1. Create presentations migration (Priority 1)
2. Test thoroughly
3. Deploy to production
4. Archive unused files
5. Update documentation

### Risk Assessment
- **Data Loss Risk:** LOW (most data already in database)
- **Migration Complexity:** LOW (simple schema)
- **Testing Effort:** MEDIUM (thorough testing needed)
- **Rollback Difficulty:** LOW (localStorage backup available)

---

**Last Updated:** 2026-02-03
**Status:** Ready for implementation
**Priority:** HIGH (Presentations migration)

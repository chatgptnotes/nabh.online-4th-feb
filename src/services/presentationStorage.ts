/**
 * Presentation Storage Service
 * Manages NABH presentations and slides in Supabase database
 */

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

/**
 * Load all presentations for a hospital
 */
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

/**
 * Save a new presentation
 */
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
    console.error('Error saving presentation:', presError);
    return { success: false, error: presError, data: null };
  }

  // Insert slides
  if (presentation.slides && presentation.slides.length > 0) {
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
      console.error('Error saving slides:', slidesError);
      // Rollback: delete the presentation
      await supabase.from('nabh_presentations').delete().eq('id', newPres.id);
      return { success: false, error: slidesError, data: null };
    }
  }

  return { success: true, data: newPres.id, error: null };
}

/**
 * Update existing presentation
 */
export async function updatePresentation(id: string, updates: Partial<Presentation>) {
  // Update presentation metadata
  const metadataUpdates: any = {};
  if (updates.name !== undefined) metadataUpdates.name = updates.name;
  if (updates.description !== undefined) metadataUpdates.description = updates.description;
  if (updates.status !== undefined) metadataUpdates.status = updates.status;
  if (updates.presentedAt !== undefined) metadataUpdates.presented_at = updates.presentedAt;

  if (Object.keys(metadataUpdates).length > 0) {
    const { error: presError } = await supabase
      .from('nabh_presentations')
      .update(metadataUpdates)
      .eq('id', id);

    if (presError) {
      console.error('Error updating presentation:', presError);
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
      console.error('Error updating slides:', slidesError);
      return { success: false, error: slidesError };
    }
  }

  return { success: true, error: null };
}

/**
 * Delete presentation
 */
export async function deletePresentation(id: string) {
  const { error } = await supabase
    .from('nabh_presentations')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting presentation:', error);
  }

  return { success: !error, error };
}

/**
 * Migrate presentations from localStorage to database
 * This is a one-time migration utility
 */
export async function migrateLocalStoragePresentations() {
  const localData = localStorage.getItem('nabh_presentations');
  if (!localData) {
    console.log('No localStorage presentations to migrate');
    return { success: true, migrated: 0 };
  }

  try {
    const presentations: Presentation[] = JSON.parse(localData);
    let migrated = 0;

    console.log(`Migrating ${presentations.length} presentations from localStorage...`);

    for (const pres of presentations) {
      const result = await savePresentation({
        name: pres.name,
        description: pres.description,
        status: pres.status,
        slides: pres.slides,
        presentedAt: pres.presentedAt,
        hospitalId: pres.hospitalId || 'hope',
        createdBy: pres.createdBy,
      });

      if (result.success) {
        migrated++;
        console.log(`✓ Migrated: ${pres.name}`);
      } else {
        console.error(`✗ Failed to migrate: ${pres.name}`, result.error);
      }
    }

    // Backup localStorage data
    localStorage.setItem('nabh_presentations_backup', localData);
    console.log('Created backup in localStorage: nabh_presentations_backup');

    // Clear localStorage after successful migration
    localStorage.removeItem('nabh_presentations');
    console.log(`Migration complete: ${migrated}/${presentations.length} presentations migrated`);

    return { success: true, migrated };
  } catch (error) {
    console.error('Migration error:', error);
    return { success: false, migrated: 0, error };
  }
}

/**
 * Get a single presentation by ID
 */
export async function getPresentation(id: string) {
  const { data: pres, error: presError } = await supabase
    .from('nabh_presentations')
    .select('*')
    .eq('id', id)
    .single();

  if (presError || !pres) {
    console.error('Error loading presentation:', presError);
    return { success: false, error: presError, data: null };
  }

  const { data: slides, error: slidesError } = await supabase
    .from('nabh_presentation_slides')
    .select('*')
    .eq('presentation_id', id)
    .order('slide_order', { ascending: true });

  if (slidesError) {
    console.error('Error loading slides:', slidesError);
    return { success: false, error: slidesError, data: null };
  }

  const dbPres = pres as DBPresentation;
  const presentation: Presentation = {
    id: dbPres.id,
    name: dbPres.name,
    description: dbPres.description || '',
    status: dbPres.status,
    createdAt: dbPres.created_at,
    updatedAt: dbPres.updated_at,
    presentedAt: dbPres.presented_at || undefined,
    hospitalId: dbPres.hospital_id,
    createdBy: dbPres.created_by || undefined,
    slides: (slides as DBSlide[] || []).map(s => ({
      type: s.slide_type,
      title: s.title,
      content: s.content || '',
      notes: s.notes || undefined,
    })),
  };

  return { success: true, data: presentation, error: null };
}

import type { ObjectiveElement, NABHChapter, NABHStandard, NABHObjectiveElement, ElementCategory } from '../types/nabh';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Type for row data from Supabase (nabh_objective_edits table)
interface ObjectiveEditRow {
  id: string;
  objective_code: string;
  chapter_id: string;
  title: string | null;
  description: string | null;
  hindi_explanation: string | null;
  evidences_list: string | null;
  evidence_links: string | null;
  status: string | null;
  priority: string | null;
  assignee: string | null;
  start_date: string | null;
  end_date: string | null;
  deliverable: string | null;
  notes: string | null;
  infographic_svg: string | null;
  infographic_data_url: string | null;
  evidence_files: unknown[] | null;
  youtube_videos: unknown[] | null;
  training_materials: unknown[] | null;
  sop_documents: unknown[] | null;
  auditor_priority_items: string[] | null; // Evidence items marked as priority for auditors
  interpretations2: string | null; // User-editable interpretation field
  created_at: string;
  updated_at: string;
}

/**
 * Convert base64 data URL to Blob
 */
function dataURLtoBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Upload infographic to Supabase Storage and return the public URL
 */
async function uploadInfographicToStorage(
  objectiveCode: string,
  dataUrl: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const blob = dataURLtoBlob(dataUrl);
    const fileName = `infographics/${objectiveCode.replace(/\./g, '_')}_${Date.now()}.png`;

    // Upload to Supabase Storage
    const uploadResponse = await fetch(
      `${SUPABASE_URL}/storage/v1/object/nabh-evidence/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': blob.type,
          'x-upsert': 'true',
        },
        body: blob,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Storage upload failed:', uploadResponse.status, errorText);
      return { success: false, error: `Upload failed: ${errorText}` };
    }

    // Get the public URL
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/nabh-evidence/${fileName}`;
    console.log('Infographic uploaded to:', publicUrl);

    return { success: true, url: publicUrl };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error uploading infographic:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Save objective edits to Supabase using direct REST API
 */
export async function saveObjectiveToSupabase(
  chapterId: string,
  objective: ObjectiveElement
): Promise<{ success: boolean; error?: string }> {
  try {
    let infographicUrl = objective.infographicDataUrl || null;

    // If we have a base64 data URL, upload to Storage first
    if (infographicUrl && infographicUrl.startsWith('data:')) {
      console.log('Uploading infographic to Supabase Storage...');
      const uploadResult = await uploadInfographicToStorage(objective.code, infographicUrl);
      if (uploadResult.success && uploadResult.url) {
        infographicUrl = uploadResult.url;
      } else {
        console.warn('Failed to upload infographic, storing without it:', uploadResult.error);
        infographicUrl = null;
      }
    }

    const editData = {
      objective_code: objective.code,
      chapter_id: chapterId,
      title: objective.title || null,
      description: objective.description || null,
      hindi_explanation: objective.hindiExplanation || null,
      evidences_list: objective.evidencesList || null,
      evidence_links: objective.evidenceLinks || null,
      status: objective.status || null,
      priority: objective.priority || null,
      assignee: objective.assignee || null,
      start_date: objective.startDate || null,
      end_date: objective.endDate || null,
      deliverable: objective.deliverable || null,
      notes: objective.notes || null,
      infographic_svg: objective.infographicSvg || null,
      infographic_data_url: infographicUrl,
      evidence_files: objective.evidenceFiles || [],
      youtube_videos: objective.youtubeVideos || [],
      training_materials: objective.trainingMaterials || [],
      sop_documents: objective.sopDocuments || [],
      auditor_priority_items: objective.auditorPriorityItems || [],
      interpretations2: objective.interpretations2 || null,
    };

    console.log('Saving to Supabase, payload size:', JSON.stringify(editData).length, 'bytes');

    // Use direct REST API with proper headers
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_edits?on_conflict=objective_code`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'resolution=merge-duplicates',
        },
        body: JSON.stringify(editData),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error saving to Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }
    
    // Also update the normalized nabh_objective_elements table if we have YouTube videos or training materials
    // This ensures the data is available when loading from the normalized schema
    if (objective.youtubeVideos?.length || objective.trainingMaterials?.length || objective.sopDocuments?.length || objective.hindiExplanation || objective.interpretation || objective.interpretations2) {
      try {
        // First, find the element ID by code
        const [chapterCode, stdNum, elemNum] = objective.code.split('.');
        const findResponse = await fetch(
          `${SUPABASE_URL}/rest/v1/nabh_objective_elements?select=id,standard_id,nabh_standards(standard_number,chapter_id,nabh_chapters(name))&element_number=eq.${elemNum}`,
          {
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
          }
        );
        
        if (findResponse.ok) {
          const elements = await findResponse.json();
          // Find the matching element by chapter and standard
          const matchingElement = elements.find((e: any) => 
            e.nabh_standards?.nabh_chapters?.name === chapterCode &&
            e.nabh_standards?.standard_number === stdNum
          );
          
          if (matchingElement) {
            // Update the normalized table
            const normalizedUpdate: Record<string, any> = {};
            if (objective.youtubeVideos?.length) normalizedUpdate.youtube_videos = objective.youtubeVideos;
            if (objective.trainingMaterials?.length) normalizedUpdate.training_materials = objective.trainingMaterials;
            if (objective.sopDocuments?.length) normalizedUpdate.sop_documents = objective.sopDocuments;
            if (objective.hindiExplanation) normalizedUpdate.hindi_explanation = objective.hindiExplanation;
            if (objective.interpretation) normalizedUpdate.interpretation = objective.interpretation;
            // Always save interpretations2 (user edits)
            if (objective.interpretations2 !== undefined) {
              normalizedUpdate.interpretations2 = objective.interpretations2 || null;
            }
            if (objective.notes) normalizedUpdate.notes = objective.notes;
            if (objective.assignee) normalizedUpdate.assignee = objective.assignee;
            // Normalize status to match database CHECK constraint (case-sensitive)
            if (objective.status) {
              const statusMap: Record<string, string> = {
                'not started': 'Not Started',
                'in progress': 'In Progress',
                'completed': 'Completed',
                'not applicable': 'Not Applicable',
              };
              normalizedUpdate.status = statusMap[objective.status.toLowerCase()] || objective.status;
            }

            console.log('Saving to nabh_objective_elements:', {
              elementId: matchingElement.id,
              interpretations2: objective.interpretations2,
              normalizedUpdate
            });

            await fetch(
              `${SUPABASE_URL}/rest/v1/nabh_objective_elements?id=eq.${matchingElement.id}`,
              {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json',
                  'apikey': SUPABASE_ANON_KEY,
                  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                },
                body: JSON.stringify(normalizedUpdate),
              }
            );
          }
        }
      } catch (normalizedError) {
        // Don't fail the main save if normalized update fails
        console.warn('Could not update normalized table:', normalizedError);
      }
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving objective:', errorMessage);
    console.error('Full error:', error);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load a single objective's edits from Supabase
 */
export async function loadObjectiveFromSupabase(
  objectiveCode: string
): Promise<{
  success: boolean;
  data?: Partial<ObjectiveElement>;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_edits?objective_code=eq.${encodeURIComponent(objectiveCode)}&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading from Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const rows = await response.json();

    if (!rows || rows.length === 0) {
      return { success: true, data: undefined };
    }

    const data = rows[0] as ObjectiveEditRow;

    const objectiveData: Partial<ObjectiveElement> = {
      title: data.title ?? undefined,
      description: data.description ?? undefined,
      hindiExplanation: data.hindi_explanation ?? undefined,
      evidencesList: data.evidences_list ?? undefined,
      evidenceLinks: data.evidence_links ?? undefined,
      status: (data.status as ObjectiveElement['status']) ?? undefined,
      priority: (data.priority as ObjectiveElement['priority']) ?? undefined,
      assignee: data.assignee ?? undefined,
      startDate: data.start_date ?? undefined,
      endDate: data.end_date ?? undefined,
      deliverable: data.deliverable ?? undefined,
      notes: data.notes ?? undefined,
      infographicSvg: data.infographic_svg ?? undefined,
      infographicDataUrl: data.infographic_data_url ?? undefined,
      evidenceFiles: (data.evidence_files as ObjectiveElement['evidenceFiles']) ?? [],
      youtubeVideos: (data.youtube_videos as ObjectiveElement['youtubeVideos']) ?? [],
      trainingMaterials: (data.training_materials as ObjectiveElement['trainingMaterials']) ?? [],
      sopDocuments: (data.sop_documents as ObjectiveElement['sopDocuments']) ?? [],
      auditorPriorityItems: (data.auditor_priority_items as string[]) ?? [],
      interpretations2: data.interpretations2 ?? undefined,
    };

    return { success: true, data: objectiveData };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading objective:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all objective edits from Supabase
 */
export async function loadAllObjectiveEditsFromSupabase(): Promise<{
  success: boolean;
  data?: Record<string, Partial<ObjectiveElement>>;
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_edits?select=*`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading from Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const rows = await response.json();
    const editsMap: Record<string, Partial<ObjectiveElement>> = {};

    if (rows) {
      for (const row of rows as ObjectiveEditRow[]) {
        editsMap[row.objective_code] = {
          title: row.title ?? undefined,
          description: row.description ?? undefined,
          hindiExplanation: row.hindi_explanation ?? undefined,
          evidencesList: row.evidences_list ?? undefined,
          evidenceLinks: row.evidence_links ?? undefined,
          status: (row.status as ObjectiveElement['status']) ?? undefined,
          priority: (row.priority as ObjectiveElement['priority']) ?? undefined,
          assignee: row.assignee ?? undefined,
          startDate: row.start_date ?? undefined,
          endDate: row.end_date ?? undefined,
          deliverable: row.deliverable ?? undefined,
          notes: row.notes ?? undefined,
          infographicSvg: row.infographic_svg ?? undefined,
          infographicDataUrl: row.infographic_data_url ?? undefined,
          evidenceFiles: (row.evidence_files as ObjectiveElement['evidenceFiles']) ?? [],
          youtubeVideos: (row.youtube_videos as ObjectiveElement['youtubeVideos']) ?? [],
          trainingMaterials: (row.training_materials as ObjectiveElement['trainingMaterials']) ?? [],
          sopDocuments: (row.sop_documents as ObjectiveElement['sopDocuments']) ?? [],
          auditorPriorityItems: (row.auditor_priority_items as string[]) ?? [],
          interpretations2: row.interpretations2 ?? undefined,
        };
      }
    }

    return { success: true, data: editsMap };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading objectives:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete an objective's edits from Supabase
 */
export async function deleteObjectiveFromSupabase(
  objectiveCode: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_edits?objective_code=eq.${encodeURIComponent(objectiveCode)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting from Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting objective:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Generated Evidence Storage Functions
// ============================================

// Type for generated evidence
export interface GeneratedEvidence {
  id: string;
  objective_code: string;
  evidence_title: string;
  prompt: string;
  generated_content: string;
  html_content: string;
  evidence_type: 'document' | 'visual' | 'custom' | 'register' | 'package';
  hospital_config: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    qualityCoordinator: string;
    qualityCoordinatorDesignation: string;
  };
  created_at: string;
  is_auditor_ready?: boolean;
  package_id?: string; // Links multiple documents together as a package
  package_sequence?: number; // Order within the package (1, 2, 3...)
  package_total?: number; // Total documents in the package
}

/**
 * Save a generated evidence document to Supabase
 */
export async function saveGeneratedEvidence(
  evidence: Omit<GeneratedEvidence, 'id' | 'created_at'>
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_ai_generated_evidence`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          objective_code: evidence.objective_code,
          evidence_title: evidence.evidence_title,
          prompt: evidence.prompt,
          generated_content: evidence.generated_content,
          html_content: evidence.html_content,
          evidence_type: evidence.evidence_type,
          hospital_config: evidence.hospital_config,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error saving evidence to Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    const savedId = data[0]?.id;

    return { success: true, id: savedId };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error saving evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing generated evidence document
 */
export async function updateGeneratedEvidence(
  id: string,
  updates: Partial<Omit<GeneratedEvidence, 'id' | 'created_at'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_ai_generated_evidence?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating evidence:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all generated evidences for a specific objective
 */
export async function loadGeneratedEvidences(
  objectiveCode: string
): Promise<{ success: boolean; data?: GeneratedEvidence[]; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_ai_generated_evidence?objective_code=eq.${encodeURIComponent(objectiveCode)}&order=created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading evidences:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    return { success: true, data: data as GeneratedEvidence[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading evidences:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load a single generated evidence by ID (for sharing)
 */
export async function loadEvidenceById(
  id: string
): Promise<{ success: boolean; data?: GeneratedEvidence; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_ai_generated_evidence?id=eq.${id}&limit=1`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading evidence:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      return { success: false, error: 'Evidence not found' };
    }

    return { success: true, data: data[0] as GeneratedEvidence };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a generated evidence document
 */
export async function deleteGeneratedEvidence(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_ai_generated_evidence?id=eq.${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting evidence:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting evidence:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Chapter Management Functions
// ============================================

// Type for chapter data from Supabase
interface ChapterRow {
  id: string;
  chapter_number: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

/**
 * Load allowed chapters from nabh_chapters table
 */
export async function loadChaptersFromSupabase(): Promise<{
  success: boolean;
  data?: ChapterRow[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_chapters?select=*&order=chapter_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading chapters from Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const chapters = await response.json();
    return { success: true, data: chapters as ChapterRow[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading chapters:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// New Normalized Schema Functions
// ============================================

/**
 * Load standards for a specific chapter from nabh_standards table
 */
export async function loadStandardsByChapter(chapterId: string): Promise<{
  success: boolean;
  data?: NABHStandard[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_standards?chapter_id=eq.${chapterId}&select=*&order=standard_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading standards from Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const standards = await response.json();
    return { success: true, data: standards as NABHStandard[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading standards:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load objective elements for a specific standard from nabh_objective_elements table
 */
export async function loadObjectiveElementsByStandard(standardId: string): Promise<{
  success: boolean;
  data?: NABHObjectiveElement[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_elements?standard_id=eq.${standardId}&select=*&order=element_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading objective elements from Supabase:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const elements = await response.json();
    return { success: true, data: elements as NABHObjectiveElement[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading objective elements:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all data from normalized schema
 */
export async function loadAllNormalizedData(): Promise<{
  success: boolean;
  data?: {
    chapters: NABHChapter[];
    standards: NABHStandard[];
    elements: NABHObjectiveElement[];
  };
  error?: string;
}> {
  try {
    // Load all chapters
    const chaptersResult = await loadChaptersFromSupabase();
    if (!chaptersResult.success) {
      return { success: false, error: chaptersResult.error };
    }

    // Load all standards
    const standardsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_standards?select=*&order=standard_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!standardsResponse.ok) {
      const errorText = await standardsResponse.text();
      return { success: false, error: `Standards error: ${standardsResponse.status}: ${errorText}` };
    }

    // Load all objective elements  
    const elementsResponse = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_elements?select=*&order=element_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!elementsResponse.ok) {
      const errorText = await elementsResponse.text();
      return { success: false, error: `Elements error: ${elementsResponse.status}: ${errorText}` };
    }

    const standards = await standardsResponse.json();
    const elements = await elementsResponse.json();

    return {
      success: true,
      data: {
        chapters: chaptersResult.data as NABHChapter[],
        standards: standards as NABHStandard[],
        elements: elements as NABHObjectiveElement[],
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading normalized data:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Data Insertion Utilities for Migration
// ============================================

/**
 * Insert a new chapter into nabh_chapters table
 */
export async function insertChapter(chapter: {
  chapter_number: number;
  name: string;
  description: string;
}): Promise<{ success: boolean; data?: NABHChapter; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_chapters`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(chapter),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error inserting chapter:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const insertedChapter = await response.json();
    return { success: true, data: insertedChapter[0] as NABHChapter };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error inserting chapter:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Insert a new standard into nabh_standards table
 */
export async function insertStandard(standard: {
  chapter_id: string;
  standard_number: string;
  name: string;
  description?: string;
}): Promise<{ success: boolean; data?: NABHStandard; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_standards`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(standard),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error inserting standard:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const insertedStandard = await response.json();
    return { success: true, data: insertedStandard[0] as NABHStandard };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error inserting standard:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Insert a new objective element into nabh_objective_elements table
 */
export async function insertObjectiveElement(element: {
  standard_id: string;
  element_number: string;
  description: string;
  interpretation?: string;
  is_core?: boolean;
  category?: ElementCategory;
  status?: 'Not Started' | 'In Progress' | 'Completed' | 'Not Applicable';
  assignee?: string;
  evidence_links?: string;
  notes?: string;
}): Promise<{ success: boolean; data?: NABHObjectiveElement; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_elements`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          ...element,
          is_core: element.is_core || false,
          category: element.category || (element.is_core ? 'Core' : 'Commitment'),
          status: element.status || 'Not Started',
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error inserting objective element:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const insertedElement = await response.json();
    return { success: true, data: insertedElement[0] as NABHObjectiveElement };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error inserting objective element:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Helper function to migrate data from a structured format
 * Usage: Call this with your NABH data to populate the normalized tables
 */
export async function migrateDataToNormalizedSchema(data: {
  chapters: Array<{
    chapter_number: number;
    name: string;
    description: string;
    standards: Array<{
      standard_number: string;
      name: string;
      description?: string;
      elements: Array<{
        element_number: string;
        description: string;
        interpretation?: string;
        is_core?: boolean;
        status?: 'Not Started' | 'In Progress' | 'Completed' | 'Not Applicable';
        assignee?: string;
        evidence_links?: string;
        notes?: string;
      }>;
    }>;
  }>;
}): Promise<{ success: boolean; error?: string; stats?: { chapters: number; standards: number; elements: number } }> {
  try {
    let chaptersInserted = 0;
    let standardsInserted = 0;
    let elementsInserted = 0;

    for (const chapterData of data.chapters) {
      // Insert chapter
      const chapterResult = await insertChapter({
        chapter_number: chapterData.chapter_number,
        name: chapterData.name,
        description: chapterData.description,
      });

      if (!chapterResult.success) {
        console.error(`Failed to insert chapter ${chapterData.name}:`, chapterResult.error);
        continue;
      }

      chaptersInserted++;
      const insertedChapter = chapterResult.data!;

      // Insert standards for this chapter
      for (const standardData of chapterData.standards) {
        const standardResult = await insertStandard({
          chapter_id: insertedChapter.id,
          standard_number: standardData.standard_number,
          name: standardData.name,
          description: standardData.description,
        });

        if (!standardResult.success) {
          console.error(`Failed to insert standard ${standardData.standard_number}:`, standardResult.error);
          continue;
        }

        standardsInserted++;
        const insertedStandard = standardResult.data!;

        // Insert elements for this standard
        for (const elementData of standardData.elements) {
          const elementResult = await insertObjectiveElement({
            standard_id: insertedStandard.id,
            element_number: elementData.element_number,
            description: elementData.description,
            interpretation: elementData.interpretation,
            is_core: elementData.is_core,
            status: elementData.status,
            assignee: elementData.assignee,
            evidence_links: elementData.evidence_links,
            notes: elementData.notes,
          });

          if (!elementResult.success) {
            console.error(`Failed to insert element ${elementData.element_number}:`, elementResult.error);
            continue;
          }

          elementsInserted++;
        }
      }
    }

    return {
      success: true,
      stats: {
        chapters: chaptersInserted,
        standards: standardsInserted,
        elements: elementsInserted,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error migrating data:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

// ============================================
// CRUD Functions for NABH Master Management
// ============================================

/**
 * Update an existing chapter
 */
export async function updateChapter(
  chapterId: string,
  updates: { chapter_number?: number; name?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_chapters?id=eq.${chapterId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating chapter:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating chapter:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a chapter (cascades to standards and elements)
 */
export async function deleteChapter(
  chapterId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_chapters?id=eq.${chapterId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting chapter:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting chapter:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing standard
 */
export async function updateStandard(
  standardId: string,
  updates: { standard_number?: string; name?: string; description?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_standards?id=eq.${standardId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating standard:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating standard:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a standard (cascades to elements)
 */
export async function deleteStandard(
  standardId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_standards?id=eq.${standardId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting standard:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting standard:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all standards (for table view)
 */
export async function loadAllStandards(): Promise<{
  success: boolean;
  data?: NABHStandard[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_standards?select=*&order=standard_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading all standards:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const standards = await response.json();
    return { success: true, data: standards as NABHStandard[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading all standards:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing objective element
 */
export async function updateObjectiveElement(
  elementId: string,
  updates: Partial<{
    element_number: string;
    description: string;
    interpretation: string;
    is_core: boolean;
    category: ElementCategory;
    status: 'Not Started' | 'In Progress' | 'Completed' | 'Not Applicable';
    assignee: string;
    evidence_links: string;
    notes: string;
  }>
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_elements?id=eq.${elementId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(updates),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating objective element:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error updating objective element:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete an objective element
 */
export async function deleteObjectiveElement(
  elementId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_elements?id=eq.${elementId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting objective element:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error deleting objective element:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Load all objective elements (for table view)
 */
export async function loadAllObjectiveElements(): Promise<{
  success: boolean;
  data?: NABHObjectiveElement[];
  error?: string;
}> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_objective_elements?select=*&order=element_number.asc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error loading all objective elements:', response.status, errorText);
      return { success: false, error: `${response.status}: ${errorText}` };
    }

    const elements = await response.json();
    return { success: true, data: elements as NABHObjectiveElement[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error loading all objective elements:', errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Bulk insert objective elements (for Excel import)
 */
export async function bulkInsertObjectiveElements(
  elements: Array<{
    standard_id: string;
    element_number: string;
    description: string;
    interpretation?: string;
    is_core?: boolean;
  }>
): Promise<{ success: boolean; inserted: number; errors: string[] }> {
  const errors: string[] = [];
  let inserted = 0;

  for (const element of elements) {
    const result = await insertObjectiveElement({
      standard_id: element.standard_id,
      element_number: element.element_number,
      description: element.description,
      interpretation: element.interpretation,
      is_core: element.is_core,
    });

    if (result.success) {
      inserted++;
    } else {
      errors.push(`Element ${element.element_number}: ${result.error}`);
    }
  }

  return { success: errors.length === 0, inserted, errors };
}

// SOP Document Storage Service
import { supabase } from '../lib/supabase';

export interface SOPDocument {
  id: string;
  chapter_code: string;
  chapter_name: string;
  title: string;
  description?: string;
  extracted_content: string;
  version: string;
  effective_date?: string;
  review_date?: string;
  category?: string;
  department?: string;
  author?: string;
  status: 'Draft' | 'Active' | 'Under Review' | 'Archived';
  tags?: string[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface CreateSOPRequest {
  chapter_code: string;
  chapter_name: string;
  title: string;
  description?: string;
  extracted_content: string;
  version?: string;
  effective_date?: string;
  review_date?: string;
  category?: string;
  department?: string;
  author?: string;
  status?: 'Draft' | 'Active' | 'Under Review' | 'Archived';
  tags?: string[];
  is_public?: boolean;
}

/**
 * Save a generated SOP to the database
 */
export const saveSOPDocument = async (sopData: CreateSOPRequest): Promise<{ success: boolean; data?: SOPDocument; error?: string }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();
    
    const sopRecord = {
      ...sopData,
      version: sopData.version || '1.0',
      status: sopData.status || 'Active' as const,
      is_public: sopData.is_public ?? false,
      created_by: userData?.user?.email || 'system',
    };

    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .insert([sopRecord])
      .select()
      .single();

    if (error) {
      console.error('Error saving SOP document:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveSOPDocument:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Update an existing SOP document
 */
export const updateSOPDocument = async (id: string, sopData: Partial<CreateSOPRequest>): Promise<{ success: boolean; data?: SOPDocument; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .update(sopData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating SOP document:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in updateSOPDocument:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Fetch SOPs by chapter
 */
export const getSOPsByChapter = async (chapterCode?: string): Promise<{ success: boolean; data?: SOPDocument[]; error?: string }> => {
  try {
    let query = supabase
      .from('nabh_sop_documents')
      .select('*')
      .order('created_at', { ascending: false });

    if (chapterCode) {
      query = query.eq('chapter_code', chapterCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching SOPs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getSOPsByChapter:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get a specific SOP by ID
 */
export const getSOPById = async (id: string): Promise<{ success: boolean; data?: SOPDocument; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching SOP by ID:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getSOPById:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Delete a SOP document
 */
export const deleteSOPDocument = async (id: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('nabh_sop_documents')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting SOP document:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteSOPDocument:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Search SOPs by text
 */
export const searchSOPs = async (searchTerm: string): Promise<{ success: boolean; data?: SOPDocument[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('*')
      .or(`title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,extracted_content.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error searching SOPs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in searchSOPs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get SOPs statistics
 */
export const getSOPsStats = async (): Promise<{ success: boolean; data?: { total: number; byStatus: Record<string, number>; byChapter: Record<string, number> }; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('status, chapter_code');

    if (error) {
      console.error('Error fetching SOP stats:', error);
      return { success: false, error: error.message };
    }

    const stats = {
      total: data.length,
      byStatus: {} as Record<string, number>,
      byChapter: {} as Record<string, number>
    };

    data.forEach(sop => {
      stats.byStatus[sop.status] = (stats.byStatus[sop.status] || 0) + 1;
      stats.byChapter[sop.chapter_code] = (stats.byChapter[sop.chapter_code] || 0) + 1;
    });

    return { success: true, data: stats };
  } catch (error) {
    console.error('Error in getSOPsStats:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
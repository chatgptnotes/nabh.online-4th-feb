// SOP Generated Storage Service
// Handles PDF upload to bucket + data save to nabh_generated_sops table
import { supabase } from '../lib/supabase';

export interface GeneratedSOP {
  id: string;
  chapter_id: string;
  chapter_code: string;
  chapter_name: string;
  objective_code: string;
  objective_title: string;
  f3_title: string;
  f4_interpretation: string;
  sop_html_content: string;
  sop_text_content?: string;
  pdf_url?: string;
  pdf_file_path?: string;
  pdf_file_size?: number;
  document_number?: string;
  version: string;
  department: string;
  category: string;
  effective_date: string;
  review_date: string;
  status: 'Draft' | 'Active' | 'Under Review' | 'Archived';
  created_by?: string;
  created_at: string;
  updated_at: string;
  tags: string[];
}

export interface SaveSOPRequest {
  chapter_id: string;
  chapter_code: string;
  chapter_name: string;
  objective_code: string;
  objective_title: string;
  f3_title?: string;
  f4_interpretation?: string;
  sop_html_content: string;
  version?: string;
  department?: string;
  category?: string;
}

/**
 * Upload PDF to sop-documents bucket
 */
export const uploadSOPPdf = async (
  pdfBlob: Blob,
  chapterCode: string,
  objectiveCode: string
): Promise<{ success: boolean; url?: string; path?: string; size?: number; error?: string }> => {
  try {
    const timestamp = Date.now();
    const safeObjectiveCode = objectiveCode.replace(/[\/\\:*?"<>|]/g, '-').replace(/\./g, '-').substring(0, 40);
    const fileName = `${chapterCode}/${safeObjectiveCode}_${timestamp}.pdf`;

    const { data, error } = await supabase.storage
      .from('sop-documents')
      .upload(fileName, pdfBlob, {
        contentType: 'application/pdf',
        upsert: false
      });

    if (error) {
      console.error('Error uploading PDF:', error);
      return { success: false, error: error.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('sop-documents')
      .getPublicUrl(data.path);

    return {
      success: true,
      url: urlData.publicUrl,
      path: data.path,
      size: pdfBlob.size
    };
  } catch (error) {
    console.error('Error in uploadSOPPdf:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Save generated SOP to database
 */
export const saveGeneratedSOP = async (
  sopData: SaveSOPRequest,
  pdfUrl?: string,
  pdfPath?: string,
  pdfSize?: number
): Promise<{ success: boolean; data?: GeneratedSOP; error?: string }> => {
  try {
    const { data: userData } = await supabase.auth.getUser();

    const effectiveDate = '2025-09-09';
    const reviewDate = '2025-09-09';

    const record = {
      chapter_id: sopData.chapter_id,
      chapter_code: sopData.chapter_code,
      chapter_name: sopData.chapter_name,
      objective_code: sopData.objective_code,
      objective_title: sopData.objective_title,
      f3_title: sopData.f3_title || null,
      f4_interpretation: sopData.f4_interpretation || null,
      sop_html_content: sopData.sop_html_content,
      pdf_url: pdfUrl || null,
      pdf_file_path: pdfPath || null,
      pdf_file_size: pdfSize || null,
      document_number: `SOP-${sopData.chapter_code}-${sopData.objective_code.replace(/[\/\\:*?"<>|]/g, '-').replace(/\./g, '-').substring(0, 40)}-${new Date().getFullYear()}`,
      version: sopData.version || '1.0',
      department: sopData.department || 'Quality Department',
      category: sopData.category || 'Administrative',
      effective_date: effectiveDate,
      review_date: reviewDate,
      status: 'Active' as const,
      created_by: userData?.user?.email || 'System',
      tags: [sopData.chapter_code, sopData.objective_code, 'AI-Generated', 'NABH-3rd-Edition']
    };

    const { data, error } = await supabase
      .from('nabh_generated_sops')
      .insert([record])
      .select()
      .single();

    if (error) {
      console.error('Error saving generated SOP:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in saveGeneratedSOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Upload PDF and save SOP in one call
 */
export const uploadAndSaveSOP = async (
  sopData: SaveSOPRequest,
  pdfBlob?: Blob
): Promise<{ success: boolean; data?: GeneratedSOP; pdfUrl?: string; error?: string }> => {
  try {
    let pdfUrl: string | undefined;
    let pdfPath: string | undefined;
    let pdfSize: number | undefined;

    // Upload PDF if provided
    if (pdfBlob) {
      const uploadResult = await uploadSOPPdf(pdfBlob, sopData.chapter_code, sopData.objective_code);
      if (uploadResult.success) {
        pdfUrl = uploadResult.url;
        pdfPath = uploadResult.path;
        pdfSize = uploadResult.size;
      } else {
        console.warn('PDF upload failed, continuing without PDF:', uploadResult.error);
      }
    }

    // Save to database
    const saveResult = await saveGeneratedSOP(sopData, pdfUrl, pdfPath, pdfSize);

    if (!saveResult.success) {
      return { success: false, error: saveResult.error };
    }

    return {
      success: true,
      data: saveResult.data,
      pdfUrl
    };
  } catch (error) {
    console.error('Error in uploadAndSaveSOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get all SOPs by chapter
 */
export const getGeneratedSOPsByChapter = async (
  chapterCode?: string
): Promise<{ success: boolean; data?: GeneratedSOP[]; error?: string }> => {
  try {
    let query = supabase
      .from('nabh_generated_sops')
      .select('*')
      .order('created_at', { ascending: false });

    if (chapterCode) {
      query = query.eq('chapter_code', chapterCode);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching generated SOPs:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Error in getGeneratedSOPsByChapter:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Get SOP by ID
 */
export const getGeneratedSOPById = async (
  id: string
): Promise<{ success: boolean; data?: GeneratedSOP; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('nabh_generated_sops')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching SOP by ID:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error in getGeneratedSOPById:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * Delete SOP and its PDF
 */
export const deleteGeneratedSOP = async (
  id: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // First get the SOP to find PDF path
    const { data: sop } = await supabase
      .from('nabh_generated_sops')
      .select('pdf_file_path')
      .eq('id', id)
      .single();

    // Delete PDF from storage if exists
    if (sop?.pdf_file_path) {
      await supabase.storage
        .from('sop-documents')
        .remove([sop.pdf_file_path]);
    }

    // Delete from database
    const { error } = await supabase
      .from('nabh_generated_sops')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting SOP:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error in deleteGeneratedSOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

/**
 * SOP Storage Service
 * Handles CRUD operations for SOPs in Supabase
 */

import { supabase } from '../lib/supabase';
import type { SOPDocument } from '../types/sop';

interface UploadResponse {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

/**
 * Upload a single PDF to Supabase storage
 */
export async function uploadSOPPdf(file: File): Promise<UploadResponse> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `sops/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return { success: true, url: data.publicUrl, filename: file.name };
  } catch (error) {
    console.error('Error uploading PDF:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

/**
 * Upload multiple PDFs to Supabase storage
 */
export async function uploadMultipleSOPPdfs(files: File[]): Promise<{ success: boolean; urls?: string[]; filenames?: string[]; error?: string }> {
  try {
    const uploadPromises = files.map(file => uploadSOPPdf(file));
    const results = await Promise.all(uploadPromises);

    const urls: string[] = [];
    const filenames: string[] = [];

    for (const result of results) {
      if (result.success && result.url && result.filename) {
        urls.push(result.url);
        filenames.push(result.filename);
      } else {
        throw new Error(result.error || 'One or more uploads failed');
      }
    }

    return { success: true, urls, filenames };
  } catch (error) {
    console.error('Error uploading multiple PDFs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

/**
 * Create nabh_sop_documents table
 */
export async function createSOPTable() {
  const { error } = await supabase.rpc('create_sop_table', {});
  if (error) {
    console.error('Error creating SOP table:', error);
    throw error;
  }
}

/**
 * Save SOP document to Supabase
 */
export async function saveSOPDocument(sop: Omit<SOPDocument, 'id' | 'created_at' | 'updated_at'>): Promise<{ success: boolean; data?: SOPDocument; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .insert([{
        chapter_code: sop.chapter_code,
        chapter_name: sop.chapter_name,
        title: sop.title,
        description: sop.description,
        google_drive_url: sop.google_drive_url,
        google_drive_file_id: sop.google_drive_file_id,
        extracted_content: sop.extracted_content,
        version: sop.version,
        effective_date: sop.effective_date,
        review_date: sop.review_date,
        category: sop.category,
        department: sop.department,
        author: sop.author,
        status: sop.status,
        tags: sop.tags,
        is_public: sop.is_public,
        created_by: sop.created_by,
        pdf_url: sop.pdf_url,
        pdf_filename: sop.pdf_filename,
        pdf_urls: sop.pdf_urls,
        pdf_filenames: sop.pdf_filenames,
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as SOPDocument };
  } catch (error) {
    console.error('Error saving SOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load all SOPs
 */
export async function loadAllSOPs(): Promise<{ success: boolean; data?: SOPDocument[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('*')
      .order('chapter_code', { ascending: true })
      .order('title', { ascending: true });

    if (error) throw error;

    return { success: true, data: data as SOPDocument[] };
  } catch (error) {
    console.error('Error loading SOPs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load SOPs by chapter
 */
export async function loadSOPsByChapter(chapterCode: string): Promise<{ success: boolean; data?: SOPDocument[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('*')
      .eq('chapter_code', chapterCode)
      .order('title', { ascending: true });

    if (error) throw error;

    return { success: true, data: data as SOPDocument[] };
  } catch (error) {
    console.error('Error loading SOPs by chapter:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Load single SOP by ID
 */
export async function loadSOPById(id: string): Promise<{ success: boolean; data?: SOPDocument; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data: data as SOPDocument };
  } catch (error) {
    console.error('Error loading SOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update SOP document
 */
export async function updateSOPDocument(
  id: string,
  updates: Partial<Omit<SOPDocument, 'id' | 'created_at' | 'updated_at'>>
): Promise<{ success: boolean; data?: SOPDocument; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as SOPDocument };
  } catch (error) {
    console.error('Error updating SOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete SOP document
 */
export async function deleteSOPDocument(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('nabh_sop_documents')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting SOP:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Search SOPs by keyword
 */
export async function searchSOPs(query: string): Promise<{ success: boolean; data?: SOPDocument[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_documents')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,extracted_content.ilike.%${query}%`)
      .order('title', { ascending: true });

    if (error) throw error;

    return { success: true, data: data as SOPDocument[] };
  } catch (error) {
    console.error('Error searching SOPs:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

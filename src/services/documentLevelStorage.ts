import { supabase } from '../lib/supabase';

export interface DocumentLevelItem {
  id: string;
  level: number;
  title: string;
  description?: string;
  content?: string;
  file_url?: string;
  file_type?: string;
  images?: string[];
  category?: string;
  effective_date?: string;
  version: string;
  status: 'Active' | 'Draft' | 'Archived';
  created_at: string;
  updated_at: string;
}

interface Response<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Upload image to Supabase storage
export async function uploadDocumentImage(file: File): Promise<Response<string>> {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `document-levels/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('documents')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('documents').getPublicUrl(filePath);
    return { success: true, data: data.publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Upload multiple images
export async function uploadMultipleImages(files: File[]): Promise<Response<string[]>> {
  try {
    const uploadPromises = files.map(file => uploadDocumentImage(file));
    const results = await Promise.all(uploadPromises);

    const urls: string[] = [];
    for (const result of results) {
      if (result.success && result.data) {
        urls.push(result.data);
      } else {
        throw new Error(result.error || 'One or more uploads failed');
      }
    }

    return { success: true, data: urls };
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Upload failed' };
  }
}

// Load all documents for a specific level
export async function loadDocumentsByLevel(level: number): Promise<Response<DocumentLevelItem[]>> {
  try {
    const { data, error } = await supabase
      .from('nabh_document_levels')
      .select('*')
      .eq('level', level)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as DocumentLevelItem[] };
  } catch (error) {
    console.error('Error loading documents:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Save a new document
export async function saveDocument(
  doc: Omit<DocumentLevelItem, 'id' | 'created_at' | 'updated_at'>
): Promise<Response<DocumentLevelItem>> {
  try {
    const { data, error } = await supabase
      .from('nabh_document_levels')
      .insert([{
        ...doc,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as DocumentLevelItem };
  } catch (error) {
    console.error('Error saving document:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update an existing document
export async function updateDocument(
  id: string,
  updates: Partial<Omit<DocumentLevelItem, 'id' | 'created_at' | 'updated_at'>>
): Promise<Response<DocumentLevelItem>> {
  try {
    const { data, error } = await supabase
      .from('nabh_document_levels')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data: data as DocumentLevelItem };
  } catch (error) {
    console.error('Error updating document:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Delete a document
export async function deleteDocument(id: string): Promise<Response<void>> {
  try {
    const { error } = await supabase
      .from('nabh_document_levels')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error deleting document:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Load all documents (for search/filter)
export async function loadAllDocuments(): Promise<Response<DocumentLevelItem[]>> {
  try {
    const { data, error } = await supabase
      .from('nabh_document_levels')
      .select('*')
      .order('level', { ascending: true })
      .order('created_at', { ascending: false });

    if (error) throw error;
    return { success: true, data: data as DocumentLevelItem[] };
  } catch (error) {
    console.error('Error loading all documents:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

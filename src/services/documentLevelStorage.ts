import { supabase } from '../lib/supabase';

export interface DocumentLevelItem {
  id: string;
  level: number;
  title: string;
  description?: string;
  file_url?: string;
  file_type?: string;
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

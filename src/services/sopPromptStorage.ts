/**
 * SOP Prompt Storage Service
 * Handles CRUD operations for SOP prompts in Supabase
 */

import { supabase } from '../lib/supabase';

export interface SOPPrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  hospital_id?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SOPPromptInput {
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  hospital_id?: string;
  is_active?: boolean;
}

/**
 * Load all SOP prompts from the database
 */
export async function loadAllSOPPrompts(): Promise<{ success: boolean; data?: SOPPrompt[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_prompts')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as SOPPrompt[] };
  } catch (error) {
    console.error('Error loading SOP prompts:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Save a new SOP prompt to the database
 */
export async function saveSOPPrompt(prompt: SOPPromptInput): Promise<{ success: boolean; data?: SOPPrompt; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_prompts')
      .insert([{
        title: prompt.title,
        description: prompt.description,
        prompt: prompt.prompt,
        category: prompt.category,
        tags: prompt.tags,
        hospital_id: prompt.hospital_id || 'hope',
        is_active: prompt.is_active ?? true,
      }])
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as SOPPrompt };
  } catch (error) {
    console.error('Error saving SOP prompt:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Update an existing SOP prompt
 */
export async function updateSOPPrompt(
  id: string,
  updates: Partial<SOPPromptInput>
): Promise<{ success: boolean; data?: SOPPrompt; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_prompts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data: data as SOPPrompt };
  } catch (error) {
    console.error('Error updating SOP prompt:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Delete an SOP prompt (soft delete by setting is_active to false)
 */
export async function deleteSOPPrompt(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('nabh_sop_prompts')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error deleting SOP prompt:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Hard delete an SOP prompt (permanent removal)
 */
export async function hardDeleteSOPPrompt(id: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('nabh_sop_prompts')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return { success: true };
  } catch (error) {
    console.error('Error hard deleting SOP prompt:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Get a single SOP prompt by ID
 */
export async function getSOPPromptById(id: string): Promise<{ success: boolean; data?: SOPPrompt; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return { success: true, data: data as SOPPrompt };
  } catch (error) {
    console.error('Error loading SOP prompt:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

/**
 * Search SOP prompts by keyword
 */
export async function searchSOPPrompts(query: string): Promise<{ success: boolean; data?: SOPPrompt[]; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('nabh_sop_prompts')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%,prompt.ilike.%${query}%`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return { success: true, data: data as SOPPrompt[] };
  } catch (error) {
    console.error('Error searching SOP prompts:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

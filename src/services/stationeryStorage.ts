import { supabase } from '../lib/supabase';

export interface StationeryItem {
  id: string;
  name: string;
  category: string;
  description: string;
  original_file_url?: string;
  original_file_name?: string;
  original_file_type?: string;
  extracted_text?: string;
  analyzed_data?: {
    documentType: string;
    sections: { heading: string; content: string }[];
    suggestions?: string[];
  };
  improved_content?: string;
  user_suggestions: string[];
  status: 'pending' | 'extracted' | 'improved' | 'approved';
  created_at: string;
  updated_at: string;
  documents_link?: string;
  hospital_id?: string;
}

export const stationeryStorage = {
  async getAll(hospitalId?: string) {
    let query = supabase.from('stationery_items').select('*').order('created_at', { ascending: false });
    if (hospitalId) {
      query = query.eq('hospital_id', hospitalId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async uploadFile(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `uploads/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('stationery')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('stationery').getPublicUrl(filePath);
    return data.publicUrl;
  },

  async save(item: Partial<StationeryItem>) {
    const { data, error } = await supabase
      .from('stationery_items')
      .upsert({
        ...item,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string) {
    const { error } = await supabase
      .from('stationery_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};

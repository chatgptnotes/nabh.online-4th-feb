/**
 * Emergency Codes Storage Service
 * Handles CRUD operations for Emergency Codes in Supabase
 */

import { supabase } from '../lib/supabase';

export interface EmergencyCodeProtocol {
  id: string;
  code_type: string;
  name: string;
  description: string;
  color: string;
  icon: string;
  response_time: string;
  activation_criteria: string[];
  response_team: Record<string, string>;
  equipment_required: string[];
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyCodeDocument {
  id: string;
  doc_id: string;
  code_type: string;
  document_type: string;
  title: string;
  description: string;
  category: string;
  frequency: string;
  mandatory_fields: string[];
  template: string;
  evidence_requirement: string;
  nabh_standard: string[];
  responsible_person: string;
  review_frequency: string;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const emergencyCodesStorage = {
  // Get all protocols
  async getAllProtocols(hospitalId?: string): Promise<EmergencyCodeProtocol[]> {
    try {
      let query = supabase
        .from('emergency_code_protocols')
        .select('*')
        .eq('is_active', true)
        .order('code_type');

      if (hospitalId) {
        query = query.eq('hospital_id', hospitalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching protocols:', error);
      return [];
    }
  },

  // Get all documents
  async getAllDocuments(hospitalId?: string): Promise<EmergencyCodeDocument[]> {
    try {
      let query = supabase
        .from('emergency_code_documents')
        .select('*')
        .eq('is_active', true)
        .order('code_type')
        .order('document_type');

      if (hospitalId) {
        query = query.eq('hospital_id', hospitalId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      return [];
    }
  },

  // Get documents by code type
  async getDocumentsByCodeType(codeType: string): Promise<EmergencyCodeDocument[]> {
    try {
      const { data, error } = await supabase
        .from('emergency_code_documents')
        .select('*')
        .eq('code_type', codeType)
        .eq('is_active', true)
        .order('document_type');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching documents by code type:', error);
      return [];
    }
  },

  // Get single protocol
  async getProtocol(codeType: string): Promise<EmergencyCodeProtocol | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_code_protocols')
        .select('*')
        .eq('code_type', codeType)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching protocol:', error);
      return null;
    }
  },

  // Save/Update protocol
  async saveProtocol(protocol: Partial<EmergencyCodeProtocol>): Promise<EmergencyCodeProtocol | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_code_protocols')
        .upsert({
          ...protocol,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving protocol:', error);
      return null;
    }
  },

  // Save/Update document
  async saveDocument(document: Partial<EmergencyCodeDocument>): Promise<EmergencyCodeDocument | null> {
    try {
      const { data, error } = await supabase
        .from('emergency_code_documents')
        .upsert({
          ...document,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving document:', error);
      return null;
    }
  },

  // Delete document (soft delete)
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('emergency_code_documents')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      return false;
    }
  },
};

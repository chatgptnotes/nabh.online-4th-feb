/**
 * SOP (Standard Operating Procedure) Types
 * For storing and managing hospital SOPs linked to NABH chapters
 */

export interface SOPDocument {
  id: string;
  chapter_code: string; // AAC, COP, MOM, etc.
  chapter_name: string;
  title: string;
  description?: string;
  google_drive_url?: string;
  google_drive_file_id?: string;
  extracted_content: string; // HTML formatted text from Google Docs
  version: string;
  effective_date?: string;
  review_date?: string;
  category?: string; // Policy, Procedure, Protocol, Guideline, etc.
  department?: string;
  author?: string;
  status: 'Draft' | 'Active' | 'Under Review' | 'Archived';
  tags?: string[];
  is_public: boolean; // Whether it can be shared via public URL
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface SOPMetadata {
  totalSOPs: number;
  byChapter: Record<string, number>;
  byStatus: Record<string, number>;
  lastUpdated: string;
}

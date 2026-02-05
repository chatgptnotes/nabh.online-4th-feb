/**
 * Link Metadata Types
 * Shared type definitions for link metadata functionality
 */

export interface LinkMetadata {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  category?: string;
  type?: 'google_docs' | 'google_sheets' | 'pdf' | 'website' | 'other';
  priority?: 'high' | 'medium' | 'low';
}

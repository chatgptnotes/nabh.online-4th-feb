/**
 * Document Evidence Types
 * Types for uploading documents and generating evidence from extracted content
 */

/** Supported file types for document upload */
export type DocumentFileType = 'pdf' | 'doc' | 'docx' | 'png' | 'jpg' | 'jpeg' | 'xlsx' | 'xls';

/** Document upload status */
export type DocumentExtractionStatus = 'pending' | 'extracting' | 'extracted' | 'error';

/** Uploaded document with extraction metadata */
export interface UploadedDocument {
  id: string;
  file: File;
  fileName: string;
  fileType: DocumentFileType;
  fileSize: number;
  uploadedAt: string;
  status: DocumentExtractionStatus;
  extractedData?: DocumentExtractedData;
  error?: string;
}

/** Structured data extracted from documents */
export interface DocumentExtractedData {
  /** Raw text content */
  rawText: string;
  /** Document type detected (form, register, report, etc.) */
  documentType?: string;
  /** Document title if detected */
  title?: string;
  /** Sections with headings and content */
  sections?: Array<{
    heading: string;
    content: string;
  }>;
  /** Tables extracted from the document */
  tables?: Array<{
    headers: string[];
    rows: string[][];
  }>;
  /** Key-value pairs extracted */
  keyValuePairs?: Record<string, string>;
  /** Dates found in the document */
  dates?: string[];
  /** Names/signatures found */
  signatures?: string[];
}

/** Google Drive document types */
export type GoogleDriveDocType = 'document' | 'spreadsheet' | 'presentation' | 'unknown';

/** Google Drive link metadata */
export interface GoogleDriveLink {
  id: string;
  url: string;
  documentId: string;
  docType: GoogleDriveDocType;
  status: DocumentExtractionStatus;
  extractedData?: DocumentExtractedData;
  error?: string;
}

/** Request to generate evidence from documents */
export interface DocumentEvidenceRequest {
  /** Evidence item text to generate */
  evidenceItemText: string;
  /** Extracted data from uploaded documents */
  documentData: DocumentExtractedData[];
  /** Objective code (e.g., "AAC.1.1") */
  objectiveCode: string;
  /** Objective title */
  objectiveTitle: string;
  /** Hospital configuration */
  hospitalConfig: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
  };
}

/** Request to format uploaded documents as NABH evidence (simplified - no evidence item selection needed) */
export interface FormatDocumentRequest {
  /** Extracted data from uploaded documents */
  documentData: DocumentExtractedData[];
  /** Objective code (e.g., "AAC.1.1") */
  objectiveCode: string;
  /** Objective title */
  objectiveTitle: string;
  /** Original file names for title detection */
  fileNames: string[];
  /** Hospital configuration */
  hospitalConfig: {
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo?: string;
  };
}

/** Generated evidence result */
export interface DocumentEvidenceResult {
  success: boolean;
  /** Generated HTML content */
  htmlContent?: string;
  /** Evidence title */
  title?: string;
  /** Any error message */
  error?: string;
}

/** Database record for persisted source documents */
export interface SourceDocumentRecord {
  id: string;
  objective_code: string;
  file_name: string;
  file_type: DocumentFileType;
  file_size: number;
  storage_url: string;
  extraction_status: DocumentExtractionStatus;
  extracted_data?: DocumentExtractedData;
  extraction_error?: string;
  source_type: 'upload' | 'google_drive';
  google_drive_url?: string;
  created_at: string;
  updated_at: string;
}

/** Excel row data (flexible for any column structure) */
export interface ExcelRow {
  [key: string]: string | number | Date | undefined;
}

/** Parsed Excel data */
export interface ParsedExcelData {
  sheetName: string;
  headers: string[];
  rows: ExcelRow[];
  totalRows: number;
}

/** Saved document evidence stored in database (one per objective) */
export interface SavedDocumentEvidence {
  id: string;
  objective_code: string;
  html_content: string;
  title?: string;
  hospital_id?: string;
  source_filename?: string;  // tracks which uploaded file generated this evidence
  created_at: string;
  updated_at: string;
}

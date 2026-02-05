export type Priority = 'CORE' | 'Prev NC' | 'P0' | 'P1' | 'P2' | 'P3' | '';
export type Status = 'Not started' | 'In progress' | 'Blocked' | 'Completed' | '';
export type ElementCategory = 'Core' | 'Commitment' | 'Achievement' | 'Excellence';
export type ChapterType = 'Patient Centered' | 'Organization Centered';

export interface EvidenceFile {
  id: string;
  name: string;
  type: 'image' | 'pdf';
  size: number;
  dataUrl: string;              // Base64 data URL for local storage
  uploadedAt: string;
}

export interface YouTubeVideo {
  id?: string;
  title: string;
  url: string;
  description?: string;
  addedBy?: string;
  addedAt?: string;
}

export interface TrainingMaterial {
  id: string;
  type: 'video' | 'photo' | 'document' | 'certificate';
  title: string;
  description?: string;
  fileUrl?: string;
  dataUrl?: string;              // Base64 for locally stored files
  thumbnailUrl?: string;
  uploadedBy: string;
  uploadedAt: string;
  trainingDate?: string;
  participants?: string[];
}

export interface SOPDocument {
  id: string;
  title: string;
  fileName: string;
  fileType: 'pdf' | 'doc' | 'docx';
  fileSize: number;
  dataUrl: string;               // Base64 data URL for storage
  version: string;
  effectiveDate: string;
  reviewDate?: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

export interface ObjectiveElement {
  id: string;
  code: string;
  title: string;
  description: string;          // NABH SHCO 3rd Edition description
  interpretation: string;       // AI-generated interpretation/guidance (read-only)
  interpretations2?: string;    // User-editable interpretation field
  hindiExplanation: string;     // Hindi explanation for staff
  category: ElementCategory;    // Core, Commitment, Achievement, Excellence
  isCore: boolean;              // Quick check for core elements
  evidencesList: string;
  documentsLink?: string;       // Google Docs/Sheets link
  evidenceLinks: string;
  evidenceFiles: EvidenceFile[]; // Uploaded evidence files (images, PDFs)
  youtubeVideos: YouTubeVideo[]; // YouTube training videos
  trainingMaterials: TrainingMaterial[]; // Internal training evidence
  sopDocuments: SOPDocument[];  // Hospital SOPs (Word/PDF documents)
  infographicSvg?: string;      // SVG content for bilingual infographic
  infographicDataUrl?: string;  // Base64 data URL for infographic storage
  auditorPriorityItems?: string[]; // Evidence items marked as priority for auditors
  priority: Priority;
  assignee: string;
  status: Status;
  startDate: string;
  endDate: string;
  deliverable: string;
  notes: string;
}

// New normalized schema types
export interface NABHChapter {
  id: string;
  chapter_number: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface NABHStandard {
  id: string;
  chapter_id: string;
  standard_number: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface NABHObjectiveElement {
  id: string;
  standard_id: string;
  element_number: string;
  description: string;
  interpretation: string;
  interpretations2?: string;  // User-editable interpretation saved separately
  is_core: boolean;
  category?: ElementCategory;  // Commitment, Core, Achievement, Excellence
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Not Applicable';
  assignee: string;
  evidence_links: string;
  notes: string;
  created_at: string;
  updated_at: string;
  infographic_svg?: string;
  infographic_data_url?: string;
  infographic_created_at?: string;
}

// Legacy type for backwards compatibility
export interface Standard {
  code: string;
  title: string;
  intent?: string;
  elements?: ObjectiveElement[];
}

export interface Chapter {
  id: string;
  code: string;
  name: string;
  fullName: string;
  type: ChapterType;
  objectives: ObjectiveElement[];
  standards?: Standard[];
}

export interface NABHData {
  chapters: Chapter[];
  lastUpdated: string;
}

export const CHAPTER_NAMES: Record<string, string> = {
  AAC: 'Access, Assessment and Continuity of Care',
  COP: 'Care of Patients',
  MOM: 'Management of Medication',
  PRE: 'Patient Rights and Education',
  HIC: 'Hospital Infection Control',
  CQI: 'Continuous Quality Improvement',  // SHCO uses CQI instead of PSQ
  PSQ: 'Patient Safety and Quality Improvement',
  ROM: 'Responsibilities of Management',
  FMS: 'Facility Management and Safety',
  HRM: 'Human Resource Management',
  IMS: 'Information Management System',
};

export const CHAPTER_TYPES: Record<string, ChapterType> = {
  AAC: 'Patient Centered',
  COP: 'Patient Centered',
  MOM: 'Patient Centered',
  PRE: 'Patient Centered',
  HIC: 'Patient Centered',
  CQI: 'Organization Centered',
  PSQ: 'Organization Centered',
  ROM: 'Organization Centered',
  FMS: 'Organization Centered',
  HRM: 'Organization Centered',
  IMS: 'Organization Centered',
};

// Department Master Types
export type DepartmentCategory = 
  | 'Clinical Speciality' 
  | 'Super Speciality' 
  | 'Support Services' 
  | 'Administration';

export type DepartmentType = 
  | 'Medical' 
  | 'Surgical' 
  | 'Diagnostic' 
  | 'Support' 
  | 'Administrative';

export interface Department {
  id: string;
  name: string;
  code: string;
  category: DepartmentCategory;
  type: DepartmentType;
  description: string;
  headOfDepartment?: string;
  contactNumber?: string;
  nabhCompliance: {
    isActive: boolean;
    lastAuditDate?: string;
    complianceStatus: 'Compliant' | 'Non-Compliant' | 'Under Review' | 'Not Assessed';
    criticalFindings?: string[];
  };
  services: string[];
  equipmentList?: string[];
  staffCount?: number;
  isEmergencyService: boolean;
  operatingHours: string;
  createdAt: string;
  updatedAt: string;
}

// Equipment Master Types
export type EquipmentCategory = 
  | 'Critical Care' 
  | 'Monitoring' 
  | 'Diagnostic' 
  | 'Therapeutic' 
  | 'Emergency' 
  | 'Support';

export type EquipmentStatus = 
  | 'Operational' 
  | 'Under Maintenance' 
  | 'Out of Service' 
  | 'Pending Calibration' 
  | 'Decommissioned';

export type EquipmentCompliance = 
  | 'Compliant' 
  | 'Non-Compliant' 
  | 'Pending Inspection' 
  | 'Calibration Due' 
  | 'Maintenance Due';

export interface EquipmentCalibration {
  lastCalibrationDate: string;
  nextCalibrationDue: string;
  calibratedBy: string;
  certificateNumber?: string;
  frequency: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'As Required';
}

export interface EquipmentMaintenance {
  lastMaintenanceDate: string;
  nextMaintenanceDue: string;
  maintenanceType: 'Preventive' | 'Corrective' | 'Emergency' | 'Routine';
  performedBy: string;
  notes?: string;
}

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  manufacturer: string;
  model?: string;
  serialNumber?: string;
  equipmentTag: string; // EIT - Equipment Identification Tag
  department: string;
  location: string;
  quantity: number;
  status: EquipmentStatus;
  compliance: EquipmentCompliance;
  
  // Technical Details
  specifications?: string;
  yearOfPurchase?: string;
  warrantExpiry?: string;
  
  // NABH Compliance
  calibration?: EquipmentCalibration;
  maintenance?: EquipmentMaintenance;
  biomedicalClearance: boolean;
  
  // Asset Management
  purchaseValue?: number;
  currentValue?: number;
  depreciationRate?: number;
  
  // Operational
  operatingHours?: number;
  criticalEquipment: boolean;
  backupAvailable: boolean;
  
  createdAt: string;
  updatedAt: string;
}

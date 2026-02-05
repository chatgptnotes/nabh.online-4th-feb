/**
 * Emergency Codes Types
 * Type definitions for emergency code protocols
 */

export type EmergencyCodeType = 'CODE_BLUE' | 'CODE_RED' | 'CODE_PINK';

export type DocumentType =
  | 'SOP'
  | 'TRAINING_RECORD'
  | 'INCIDENT_FORM'
  | 'DRILL_REPORT'
  | 'EQUIPMENT_CHECKLIST'
  | 'STAFF_ASSIGNMENT'
  | 'COMMUNICATION_LOG'
  | 'RESPONSE_EVALUATION'
  | 'COMPETENCY_ASSESSMENT';

export interface EmergencyCodeDocument {
  id: string;
  codeType: EmergencyCodeType;
  documentType: DocumentType;
  title: string;
  description: string;
  category: string;
  frequency: string;
  mandatoryFields: string[];
  template: string;
  evidenceRequirement: string;
  nabhStandard: string[];
  responsiblePerson: string;
  reviewFrequency: string;
  lastUpdated: string;
}

export interface EmergencyCodeProtocol {
  codeType: EmergencyCodeType;
  name: string;
  description: string;
  activationCriteria: string[];
  responseTeam: string[];
  equipmentRequired: string[];
  responseTime: string;
  escalationProtocol: string[];
  trainingRequirements: string[];
  documents: EmergencyCodeDocument[];
}

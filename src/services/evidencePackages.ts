/**
 * Evidence Package Definitions
 *
 * For comprehensive NABH compliance, each evidence type requires multiple
 * interconnected documents. This file defines what documents should be
 * generated for each evidence category.
 */

export interface DocumentInPackage {
  id: string;
  title: string;
  description: string;
  documentType: 'circular' | 'attendance' | 'content' | 'assessment' | 'report' | 'register' | 'form' | 'policy' | 'sop' | 'checklist' | 'audit' | 'log';
  priority: number; // 1 = highest
}

export interface EvidencePackage {
  category: string;
  keywords: string[];
  documents: DocumentInPackage[];
}

export const EVIDENCE_PACKAGES: EvidencePackage[] = [
  {
    category: 'Training Records',
    keywords: ['training', 'orientation', 'workshop', 'education', 'competency', 'skill development'],
    documents: [
      {
        id: 'training-circular',
        title: 'Training Announcement Circular',
        description: 'Official circular announcing the training program with date, time, venue, trainer details, and participant list',
        documentType: 'circular',
        priority: 1
      },
      {
        id: 'training-attendance',
        title: 'Training Attendance Sheet',
        description: 'Attendance register with employee names, employee IDs, department, designation, signatures, and timestamps',
        documentType: 'attendance',
        priority: 2
      },
      {
        id: 'training-content',
        title: 'Training Material & Content',
        description: 'Detailed training content covering topics, learning objectives, presentation slides, handouts, and reference materials',
        documentType: 'content',
        priority: 3
      },
      {
        id: 'training-assessment',
        title: 'Training Assessment MCQ Sheet',
        description: 'Multiple choice question assessment form with 10 questions, employee answers, scoring system, and pass/fail criteria',
        documentType: 'assessment',
        priority: 4
      },
      {
        id: 'training-completion',
        title: 'Training Completion Report',
        description: 'Summary report with training details, attendance statistics, assessment results, feedback summary, and recommendations',
        documentType: 'report',
        priority: 5
      }
    ]
  },
  {
    category: 'Audit Records',
    keywords: ['audit', 'inspection', 'assessment', 'review', 'evaluation', 'compliance check'],
    documents: [
      {
        id: 'audit-schedule',
        title: 'Audit Schedule Notice',
        description: 'Official notice announcing audit dates, scope, areas to be audited, auditor names, and preparation checklist',
        documentType: 'circular',
        priority: 1
      },
      {
        id: 'audit-checklist',
        title: 'Audit Checklist',
        description: 'Detailed checklist covering all audit criteria, compliance points, verification methods, and scoring system',
        documentType: 'checklist',
        priority: 2
      },
      {
        id: 'audit-observations',
        title: 'Audit Observation Sheet',
        description: 'Documentation of audit findings, observations, non-conformances, areas of improvement, and photographic evidence',
        documentType: 'form',
        priority: 3
      },
      {
        id: 'audit-capa',
        title: 'CAPA (Corrective & Preventive Action) Plan',
        description: 'Action plan addressing audit findings with corrective actions, responsible persons, timelines, and verification method',
        documentType: 'report',
        priority: 4
      },
      {
        id: 'audit-report',
        title: 'Final Audit Report',
        description: 'Comprehensive audit report with summary, compliance score, findings, recommendations, and management response',
        documentType: 'report',
        priority: 5
      }
    ]
  },
  {
    category: 'Incident Management',
    keywords: ['incident', 'accident', 'near miss', 'adverse event', 'sentinel event', 'medication error'],
    documents: [
      {
        id: 'incident-report-form',
        title: 'Incident Report Form',
        description: 'Initial incident reporting form with date, time, location, persons involved, description of incident, and immediate action taken',
        documentType: 'form',
        priority: 1
      },
      {
        id: 'incident-investigation',
        title: 'Incident Investigation Report',
        description: 'Detailed investigation with root cause analysis, contributing factors, witness statements, and evidence collection',
        documentType: 'report',
        priority: 2
      },
      {
        id: 'incident-rca',
        title: 'Root Cause Analysis (RCA)',
        description: 'Systematic RCA using fishbone diagram or 5 Whys method to identify underlying causes',
        documentType: 'report',
        priority: 3
      },
      {
        id: 'incident-action-plan',
        title: 'Corrective Action Plan',
        description: 'Action plan to prevent recurrence with specific actions, responsible persons, deadlines, and monitoring plan',
        documentType: 'report',
        priority: 4
      },
      {
        id: 'incident-closure',
        title: 'Incident Closure Report',
        description: 'Final closure document confirming all actions completed, effectiveness verification, and lessons learned',
        documentType: 'report',
        priority: 5
      }
    ]
  },
  {
    category: 'Policy & Procedures',
    keywords: ['policy', 'procedure', 'protocol', 'guideline', 'sop', 'standard operating procedure'],
    documents: [
      {
        id: 'policy-document',
        title: 'Policy Document',
        description: 'Complete policy document with purpose, scope, definitions, policy statements, responsibilities, and references',
        documentType: 'policy',
        priority: 1
      },
      {
        id: 'policy-sop',
        title: 'Standard Operating Procedure (SOP)',
        description: 'Step-by-step procedure for implementing the policy with flowcharts, forms, and checklists',
        documentType: 'sop',
        priority: 2
      },
      {
        id: 'policy-communication',
        title: 'Policy Communication Circular',
        description: 'Official communication to all staff announcing new or revised policy with effective date and training schedule',
        documentType: 'circular',
        priority: 3
      },
      {
        id: 'policy-training-record',
        title: 'Policy Training Acknowledgment',
        description: 'Staff acknowledgment register showing who was trained on the policy, date, and signature',
        documentType: 'register',
        priority: 4
      },
      {
        id: 'policy-review',
        title: 'Policy Review & Revision Record',
        description: 'Annual review record showing review date, changes made, reviewers, and approval signatures',
        documentType: 'log',
        priority: 5
      }
    ]
  },
  {
    category: 'Equipment Management',
    keywords: ['equipment', 'calibration', 'maintenance', 'biomedical', 'preventive maintenance', 'breakdown'],
    documents: [
      {
        id: 'equipment-register',
        title: 'Equipment Master Register',
        description: 'Complete inventory with equipment ID, name, location, purchase date, warranty, and responsible person',
        documentType: 'register',
        priority: 1
      },
      {
        id: 'equipment-calibration',
        title: 'Calibration Records',
        description: 'Calibration certificate with equipment details, calibration date, next due date, standards used, and results',
        documentType: 'log',
        priority: 2
      },
      {
        id: 'equipment-maintenance-log',
        title: 'Preventive Maintenance Log',
        description: 'PM schedule and completion records with date, activities performed, parts replaced, and technician signature',
        documentType: 'log',
        priority: 3
      },
      {
        id: 'equipment-breakdown',
        title: 'Breakdown & Repair Records',
        description: 'Breakdown report with issue description, downtime, repair actions, spare parts used, and cost',
        documentType: 'form',
        priority: 4
      },
      {
        id: 'equipment-usage-log',
        title: 'Equipment Usage Log',
        description: 'Daily usage register showing patient name, procedure, operator name, duration, and any issues',
        documentType: 'log',
        priority: 5
      }
    ]
  },
  {
    category: 'Patient Care Records',
    keywords: ['patient record', 'medical record', 'clinical documentation', 'nursing notes', 'discharge summary'],
    documents: [
      {
        id: 'patient-admission-form',
        title: 'Patient Admission Form',
        description: 'Complete admission documentation with patient details, admission date, diagnosis, treating doctor, and consent',
        documentType: 'form',
        priority: 1
      },
      {
        id: 'patient-assessment',
        title: 'Clinical Assessment Sheet',
        description: 'Initial clinical assessment with vital signs, medical history, physical examination, and diagnosis',
        documentType: 'form',
        priority: 2
      },
      {
        id: 'patient-progress-notes',
        title: 'Daily Progress Notes',
        description: 'Daily clinical notes showing patient condition, treatment given, investigations ordered, and response to treatment',
        documentType: 'log',
        priority: 3
      },
      {
        id: 'patient-medication-chart',
        title: 'Medication Administration Record (MAR)',
        description: 'Complete medication chart with drug name, dose, route, frequency, time of administration, and nurse signature',
        documentType: 'log',
        priority: 4
      },
      {
        id: 'patient-discharge-summary',
        title: 'Discharge Summary',
        description: 'Complete discharge documentation with final diagnosis, treatment given, discharge medications, and follow-up plan',
        documentType: 'report',
        priority: 5
      }
    ]
  },
  {
    category: 'Infection Control',
    keywords: ['infection control', 'hand hygiene', 'biomedical waste', 'sterilization', 'disinfection', 'isolation'],
    documents: [
      {
        id: 'infection-surveillance',
        title: 'Infection Surveillance Register',
        description: 'Monthly surveillance data with infection rates, types of infections, affected patients, and interventions',
        documentType: 'register',
        priority: 1
      },
      {
        id: 'hand-hygiene-audit',
        title: 'Hand Hygiene Compliance Audit',
        description: 'Observation audit sheet showing WHO 5 moments, compliance rate by department, and action plan',
        documentType: 'audit',
        priority: 2
      },
      {
        id: 'sterilization-log',
        title: 'Sterilization Log Book',
        description: 'Daily sterilization records with autoclave cycle details, biological indicator results, and operator signature',
        documentType: 'log',
        priority: 3
      },
      {
        id: 'waste-segregation-audit',
        title: 'Biomedical Waste Segregation Audit',
        description: 'Color-coded waste segregation compliance audit with observations, non-conformances, and corrective actions',
        documentType: 'audit',
        priority: 4
      },
      {
        id: 'isolation-register',
        title: 'Isolation Precaution Register',
        description: 'Register of patients requiring isolation with type of precaution, date initiated, infection type, and closure date',
        documentType: 'register',
        priority: 5
      }
    ]
  }
];

/**
 * Identify the evidence package type based on keywords in the evidence text
 */
export function identifyEvidencePackage(evidenceText: string): EvidencePackage | null {
  const lowerText = evidenceText.toLowerCase();

  for (const pkg of EVIDENCE_PACKAGES) {
    // Check if any keyword matches
    if (pkg.keywords.some(keyword => lowerText.includes(keyword))) {
      return pkg;
    }
  }

  // Return null if no package matches (will generate single document)
  return null;
}

/**
 * Get the appropriate package or return a default single-document structure
 */
export function getEvidenceDocuments(evidenceText: string): DocumentInPackage[] {
  const pkg = identifyEvidencePackage(evidenceText);

  if (pkg) {
    return pkg.documents;
  }

  // Default: single document
  return [
    {
      id: 'single-document',
      title: evidenceText.replace(/^\d+[.):]\s*/, '').substring(0, 100),
      description: 'Complete evidence documentation',
      documentType: 'form',
      priority: 1
    }
  ];
}

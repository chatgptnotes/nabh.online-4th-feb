/**
 * Departments Master - Based on Scope of Services
 * Ayushman Nagpur Hospital - September 26, 2025
 * 
 * This file contains all departments mentioned in the scope of services
 * organized by service category for NABH audit coordination
 */

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

/**
 * Master List of Departments - Hope Hospital / Ayushman Nagpur Hospital
 * Extracted from Scope of Services dated September 26, 2025
 */
export const departmentsMaster: Department[] = [
  // BROAD SPECIALITIES - CLINICAL SERVICES
  {
    id: 'dept_001',
    name: 'Anaesthesia',
    code: 'ANAES',
    category: 'Clinical Speciality',
    type: 'Medical',
    description: 'Anesthesia services for surgical procedures and pain management',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['General Anesthesia', 'Regional Anesthesia', 'Local Anesthesia', 'Pain Management'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_002',
    name: 'Critical Care Unit Combined',
    code: 'CCU',
    category: 'Clinical Speciality',
    type: 'Medical',
    description: 'Intensive care services for critically ill patients',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Intensive Care', 'Ventilator Support', 'Cardiac Monitoring', 'Life Support'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_003',
    name: 'Family Medicine',
    code: 'FAM',
    category: 'Clinical Speciality',
    type: 'Medical',
    description: 'Primary care and family medicine services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Primary Care', 'Family Health', 'Preventive Medicine', 'Health Screening'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 8:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_004',
    name: 'General Medicine',
    code: 'MED',
    category: 'Clinical Speciality',
    type: 'Medical',
    description: 'General internal medicine and medical consultations',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Internal Medicine', 'Medical Consultation', 'Chronic Disease Management'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_005',
    name: 'General Surgery',
    code: 'SURG',
    category: 'Clinical Speciality',
    type: 'Surgical',
    description: 'General surgical procedures and emergency surgery',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['General Surgery', 'Emergency Surgery', 'Minor Procedures', 'Outpatient Surgery'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_006',
    name: 'Joint Replacement & Arthroscopy',
    code: 'ARTHR',
    category: 'Clinical Speciality',
    type: 'Surgical',
    description: 'Orthopedic joint replacement and arthroscopic procedures',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Joint Replacement', 'Arthroscopy', 'Orthopedic Surgery', 'Sports Medicine'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_007',
    name: 'Orthopaedics Surgery',
    code: 'ORTHO',
    category: 'Clinical Speciality',
    type: 'Surgical',
    description: 'Orthopedic surgery and bone-related treatments',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Orthopedic Surgery', 'Fracture Treatment', 'Spine Surgery', 'Trauma Surgery'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_008',
    name: 'Otorhinolaryngology',
    code: 'ENT',
    category: 'Clinical Speciality',
    type: 'Surgical',
    description: 'ENT (Ear, Nose, Throat) specialist services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['ENT Surgery', 'Hearing Tests', 'Nasal Procedures', 'Throat Surgery'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_009',
    name: 'Respiratory Medicine',
    code: 'RESP',
    category: 'Clinical Speciality',
    type: 'Medical',
    description: 'Pulmonology and respiratory care services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Pulmonology', 'Respiratory Care', 'Sleep Studies', 'Lung Function Tests'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_010',
    name: 'Day Care Services',
    code: 'DAYCARE',
    category: 'Clinical Speciality',
    type: 'Medical',
    description: 'Day care procedures and outpatient treatments',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Day Surgery', 'Outpatient Procedures', 'Minor Operations', 'Same-day Discharge'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_011',
    name: 'Vascular Surgery',
    code: 'VASC',
    category: 'Clinical Speciality',
    type: 'Surgical',
    description: 'Vascular and blood vessel surgical procedures',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Vascular Surgery', 'Angioplasty', 'Bypass Surgery', 'Vascular Interventions'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_012',
    name: 'Biomedical Engineering',
    code: 'BME',
    category: 'Support Services',
    type: 'Support',
    description: 'Medical equipment maintenance and biomedical engineering services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Equipment Maintenance', 'Calibration', 'Medical Device Management', 'Technical Support'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_013',
    name: 'CSSD',
    code: 'CSSD',
    category: 'Support Services',
    type: 'Support',
    description: 'Central Sterile Supply Department - sterilization services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Sterilization', 'Instrument Processing', 'Supply Management', 'Infection Control'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_014',
    name: 'General Administration',
    code: 'ADMIN',
    category: 'Administration',
    type: 'Administrative',
    description: 'Hospital administration and management services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Hospital Administration', 'Policy Management', 'Compliance', 'Operations Management'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_015',
    name: 'Housekeeping',
    code: 'HOUSE',
    category: 'Support Services',
    type: 'Support',
    description: 'Hospital housekeeping and environmental services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Cleaning Services', 'Waste Management', 'Environmental Hygiene', 'Maintenance'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_016',
    name: 'Human Resources',
    code: 'HR',
    category: 'Administration',
    type: 'Administrative',
    description: 'Human resource management and staff services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Staff Management', 'Training', 'Recruitment', 'Employee Relations'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_017',
    name: 'Information Technology',
    code: 'IT',
    category: 'Support Services',
    type: 'Support',
    description: 'Hospital information systems and IT services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['IT Support', 'System Administration', 'Network Management', 'Data Security'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },

  // SUPER SPECIALITIES
  {
    id: 'dept_018',
    name: 'Gastrointestinal Medicine',
    code: 'GASTRO',
    category: 'Super Speciality',
    type: 'Medical',
    description: 'Gastroenterology and digestive system specialist services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Gastroenterology', 'Endoscopy', 'Liver Care', 'Digestive System Treatment'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_019',
    name: 'Critical Care - Combined Speciality ICU',
    code: 'ICU',
    category: 'Super Speciality',
    type: 'Medical',
    description: 'Specialized intensive care unit with combined specialties',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Specialized ICU', 'Multi-specialty Critical Care', 'Advanced Life Support'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_020',
    name: 'Neurology',
    code: 'NEURO',
    category: 'Super Speciality',
    type: 'Medical',
    description: 'Neurological disorders and brain specialist services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Neurology', 'Brain Disorders', 'Neurological Assessment', 'Movement Disorders'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_021',
    name: 'Neurosurgery',
    code: 'NSURG',
    category: 'Super Speciality',
    type: 'Surgical',
    description: 'Brain and nervous system surgical procedures',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Brain Surgery', 'Spine Surgery', 'Neurological Procedures', 'Tumor Removal'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_022',
    name: 'Surgical Oncology',
    code: 'ONCO',
    category: 'Super Speciality',
    type: 'Surgical',
    description: 'Cancer surgery - mainly neuro and orthopedic oncology',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Cancer Surgery', 'Neuro Oncology', 'Orthopedic Oncology', 'Tumor Removal'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_023',
    name: 'Plastic and Reconstructive Surgery',
    code: 'PLASTIC',
    category: 'Super Speciality',
    type: 'Surgical',
    description: 'Plastic surgery and reconstructive procedures',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Plastic Surgery', 'Reconstructive Surgery', 'Cosmetic Surgery', 'Burn Treatment'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_024',
    name: 'Urology',
    code: 'URO',
    category: 'Super Speciality',
    type: 'Surgical',
    description: 'Urological surgery and kidney-related treatments',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Urology', 'Kidney Surgery', 'Prostate Treatment', 'Urological Procedures'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_025',
    name: 'Surgical Gastroenterology',
    code: 'SGASTRO',
    category: 'Super Speciality',
    type: 'Surgical',
    description: 'Surgical treatment of gastrointestinal disorders',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['GI Surgery', 'Laparoscopic Surgery', 'Liver Surgery', 'Pancreatic Surgery'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },

  // SUPPORT SERVICES
  {
    id: 'dept_026',
    name: 'Physiotherapy',
    code: 'PHYSIO',
    category: 'Support Services',
    type: 'Support',
    description: 'Physical therapy and rehabilitation services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Physical Therapy', 'Rehabilitation', 'Exercise Therapy', 'Mobility Training'],
    isEmergencyService: false,
    operatingHours: '8:00 AM - 6:00 PM',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_027',
    name: 'Clinical Biochemistry',
    code: 'BIOCHEM',
    category: 'Support Services',
    type: 'Diagnostic',
    description: 'Clinical laboratory biochemistry testing services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Blood Chemistry', 'Biochemical Tests', 'Enzyme Analysis', 'Metabolic Testing'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_028',
    name: 'Clinical Pathology',
    code: 'PATH',
    category: 'Support Services',
    type: 'Diagnostic',
    description: 'Clinical pathology and laboratory diagnostic services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Pathology', 'Histopathology', 'Cytology', 'Microscopy'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_029',
    name: 'Haematology',
    code: 'HAEM',
    category: 'Support Services',
    type: 'Diagnostic',
    description: 'Blood-related diagnostic and treatment services',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['Blood Tests', 'CBC', 'Blood Banking', 'Coagulation Studies'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  },
  {
    id: 'dept_030',
    name: 'Radiology',
    code: 'RAD',
    category: 'Support Services',
    type: 'Diagnostic',
    description: 'Medical imaging services - X-Ray and Ultrasound',
    nabhCompliance: {
      isActive: true,
      complianceStatus: 'Under Review'
    },
    services: ['X-Ray', 'Ultrasound', 'Medical Imaging', 'Diagnostic Radiology'],
    isEmergencyService: true,
    operatingHours: '24/7',
    createdAt: '2026-02-03T04:21:00.000Z',
    updatedAt: '2026-02-03T04:21:00.000Z'
  }
];

/**
 * Utility functions for department management
 */

export const getDepartmentsByCategory = (category: DepartmentCategory): Department[] => {
  return departmentsMaster.filter(dept => dept.category === category);
};

export const getDepartmentsByType = (type: DepartmentType): Department[] => {
  return departmentsMaster.filter(dept => dept.type === type);
};

export const getEmergencyDepartments = (): Department[] => {
  return departmentsMaster.filter(dept => dept.isEmergencyService);
};

export const getDepartmentByCode = (code: string): Department | undefined => {
  return departmentsMaster.find(dept => dept.code === code);
};

export const getDepartmentById = (id: string): Department | undefined => {
  return departmentsMaster.find(dept => dept.id === id);
};

/**
 * NABH compliance statistics
 */
export const getNABHComplianceStats = () => {
  const total = departmentsMaster.length;
  const compliant = departmentsMaster.filter(dept => 
    dept.nabhCompliance.complianceStatus === 'Compliant'
  ).length;
  const nonCompliant = departmentsMaster.filter(dept => 
    dept.nabhCompliance.complianceStatus === 'Non-Compliant'
  ).length;
  const underReview = departmentsMaster.filter(dept => 
    dept.nabhCompliance.complianceStatus === 'Under Review'
  ).length;
  const notAssessed = departmentsMaster.filter(dept => 
    dept.nabhCompliance.complianceStatus === 'Not Assessed'
  ).length;

  return {
    total,
    compliant,
    nonCompliant,
    underReview,
    notAssessed,
    compliancePercentage: total > 0 ? Math.round((compliant / total) * 100) : 0
  };
};

/**
 * Department categories summary
 */
export const getDepartmentCategorySummary = () => {
  return {
    'Clinical Speciality': getDepartmentsByCategory('Clinical Speciality').length,
    'Super Speciality': getDepartmentsByCategory('Super Speciality').length,
    'Support Services': getDepartmentsByCategory('Support Services').length,
    'Administration': getDepartmentsByCategory('Administration').length,
  };
};

/**
 * Export for NABH audit documentation
 */
export const exportDepartmentListForAudit = () => {
  return departmentsMaster.map(dept => ({
    code: dept.code,
    name: dept.name,
    category: dept.category,
    type: dept.type,
    isEmergencyService: dept.isEmergencyService,
    operatingHours: dept.operatingHours,
    complianceStatus: dept.nabhCompliance.complianceStatus,
    services: dept.services.join(', ')
  }));
};

export default departmentsMaster;
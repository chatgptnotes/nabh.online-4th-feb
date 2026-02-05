/**
 * Equipment Master - Hope Hospital Equipment Inventory
 * Based on Equipment List Google Sheets Data
 * 
 * This file contains all medical equipment for NABH audit compliance
 * and hospital asset management
 */

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

/**
 * Hope Hospital ICU Equipment Master
 * Extracted from Google Sheets Equipment List
 */
export const equipmentMaster: Equipment[] = [
  // VENTILATORS
  {
    id: 'eq_001',
    name: 'Ventilator',
    category: 'Critical Care',
    manufacturer: 'Mindray',
    equipmentTag: 'HOP-BME-ICU-CCE-VEN-01',
    department: 'ICU',
    location: 'ICU - Bay 1',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_002',
    name: 'Ventilator',
    category: 'Critical Care',
    manufacturer: 'Mindray',
    equipmentTag: 'HOP-BME-ICU-CCE-VEN-02',
    department: 'ICU',
    location: 'ICU - Bay 2',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_003',
    name: 'Ventilator',
    category: 'Critical Care',
    manufacturer: 'NELLCOR PURITAN BENNETT',
    equipmentTag: 'HOP-BME-2007-ICU-CCE-VEN-01',
    department: 'ICU',
    location: 'ICU - Bay 3',
    quantity: 1,
    status: 'Operational',
    compliance: 'Calibration Due',
    yearOfPurchase: '2007',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_004',
    name: 'Ventilator',
    category: 'Critical Care',
    manufacturer: 'NELLCOR PURITAN BENNETT',
    equipmentTag: 'HOP-BME-2007-ICU-CCE-VEN-02',
    department: 'ICU',
    location: 'ICU - Bay 4',
    quantity: 1,
    status: 'Operational',
    compliance: 'Calibration Due',
    yearOfPurchase: '2007',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_005',
    name: 'Ventilator',
    category: 'Critical Care',
    manufacturer: 'NELLCOR PURITAN BENNETT',
    equipmentTag: 'HOP-BME-2007-ICU-CCE-VEN-03',
    department: 'ICU',
    location: 'ICU - Backup',
    quantity: 1,
    status: 'Operational',
    compliance: 'Pending Inspection',
    yearOfPurchase: '2007',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: false,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // MULTIPARA MONITORS
  {
    id: 'eq_006',
    name: 'Multipara Monitor',
    category: 'Monitoring',
    manufacturer: 'NASAN',
    equipmentTag: 'HOP-BME-2012-ICU-CCE-MON-01',
    department: 'ICU',
    location: 'ICU - Bay 1',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    yearOfPurchase: '2012',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_007',
    name: 'Multipara Monitor',
    category: 'Monitoring',
    manufacturer: 'NASAN',
    equipmentTag: 'HOP-BME-2012-ICU-CCE-MON-02',
    department: 'ICU',
    location: 'ICU - Bay 2',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    yearOfPurchase: '2012',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_008',
    name: 'Multipara Monitor',
    category: 'Monitoring',
    manufacturer: 'NASAN',
    equipmentTag: 'HOP-BME-2012-ICU-CCE-MON-03',
    department: 'ICU',
    location: 'ICU - Bay 3',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    yearOfPurchase: '2012',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_009',
    name: 'Multipara Monitor',
    category: 'Monitoring',
    manufacturer: 'NASAN',
    equipmentTag: 'HOP-BME-ICU-CCE-MON-04',
    department: 'ICU',
    location: 'ICU - Bay 4',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_010',
    name: 'Multipara Monitor',
    category: 'Monitoring',
    manufacturer: 'MEDIAID',
    equipmentTag: 'HOP-BME-ICU-CCE-MON-05',
    department: 'ICU',
    location: 'ICU - Central Station',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_011',
    name: 'Multipara Monitor',
    category: 'Monitoring',
    manufacturer: 'MEDIAID',
    equipmentTag: 'HOP-BME-ICU-CCE-MON-06',
    department: 'ICU',
    location: 'ICU - Portable',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: false,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // DEFIBRILLATOR
  {
    id: 'eq_012',
    name: 'Defibrillator',
    category: 'Emergency',
    manufacturer: 'BPL',
    equipmentTag: 'HOP-BME-ICU-CCE-DEF-01',
    department: 'ICU',
    location: 'ICU - Emergency Cart',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: false,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // SUCTION MACHINES
  {
    id: 'eq_013',
    name: 'Suction Machine',
    category: 'Therapeutic',
    manufacturer: 'GOLEY',
    equipmentTag: 'HOP-BME-ICU-CCE-SUC-01',
    department: 'ICU',
    location: 'ICU - Bay 1',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_014',
    name: 'Suction Machine',
    category: 'Therapeutic',
    manufacturer: 'GOLEY',
    equipmentTag: 'HOP-BME-ICU-CCE-SUC-02',
    department: 'ICU',
    location: 'ICU - Bay 2',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // SYRINGE PUMPS
  {
    id: 'eq_015',
    name: 'Syringe Pump',
    category: 'Therapeutic',
    manufacturer: 'SMITH',
    equipmentTag: 'HOP-BME-ICU-CCE-SYP-01',
    department: 'ICU',
    location: 'ICU - Bay 1',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_016',
    name: 'Syringe Pump',
    category: 'Therapeutic',
    manufacturer: 'SMITH',
    equipmentTag: 'HOP-BME-ICU-CCE-SYP-02',
    department: 'ICU',
    location: 'ICU - Bay 1',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_017',
    name: 'Syringe Pump',
    category: 'Therapeutic',
    manufacturer: 'SMITH',
    equipmentTag: 'HOP-BME-ICU-CCE-SYP-03',
    department: 'ICU',
    location: 'ICU - Bay 2',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_018',
    name: 'Syringe Pump',
    category: 'Therapeutic',
    manufacturer: 'SMITH',
    equipmentTag: 'HOP-BME-ICU-CCE-SYP-04',
    department: 'ICU',
    location: 'ICU - Bay 2',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },
  {
    id: 'eq_019',
    name: 'Syringe Pump',
    category: 'Therapeutic',
    manufacturer: 'SMITH',
    equipmentTag: 'HOP-BME-ICU-CCE-SYP-05',
    department: 'ICU',
    location: 'ICU - Bay 3',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // BIPAP
  {
    id: 'eq_020',
    name: 'BiPAP',
    category: 'Therapeutic',
    manufacturer: 'Harmony',
    equipmentTag: 'HOP-BME-2012-ICU-CCE-BIP-01',
    department: 'ICU',
    location: 'ICU - Portable Unit',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    yearOfPurchase: '2012',
    biomedicalClearance: true,
    criticalEquipment: false,
    backupAvailable: false,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // ABG
  {
    id: 'eq_021',
    name: 'ABG (Arterial Blood Gas)',
    category: 'Diagnostic',
    manufacturer: 'i-STAT',
    equipmentTag: 'HOP-BME-ICU-CCE-ABG-01',
    department: 'ICU',
    location: 'ICU - Lab Station',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: true,
    backupAvailable: false,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // NEBULIZER
  {
    id: 'eq_022',
    name: 'Nebulizer',
    category: 'Therapeutic',
    manufacturer: 'LIFE-LINE',
    equipmentTag: 'HOP-BME-ICU-CCE-NEB-01',
    department: 'ICU',
    location: 'ICU - Medication Room',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: false,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // GLUCOMETER
  {
    id: 'eq_023',
    name: 'Glucometer',
    category: 'Diagnostic',
    manufacturer: 'SD-Codefree',
    equipmentTag: 'HOP-BME-ICU-CCE-GLU-01',
    department: 'ICU',
    location: 'ICU - Nursing Station',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: false,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // THERMOMETER
  {
    id: 'eq_024',
    name: 'Thermometer',
    category: 'Diagnostic',
    manufacturer: 'HICKS',
    equipmentTag: 'HOP-BME-ICU-CCE-THE-01',
    department: 'ICU',
    location: 'ICU - Nursing Station',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: false,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // NEEDLE BURNER
  {
    id: 'eq_025',
    name: 'Needle Burner',
    category: 'Support',
    manufacturer: 'Handyned',
    equipmentTag: 'HOP-BME-ICU-CCE-NEB-01',
    department: 'ICU',
    location: 'ICU - Utility Room',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: false,
    backupAvailable: false,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  },

  // BP APPARATUS
  {
    id: 'eq_026',
    name: 'BP Apparatus',
    category: 'Diagnostic',
    manufacturer: 'Diamond',
    equipmentTag: 'HOP-BME-ICU-CCE-BPA-01',
    department: 'ICU',
    location: 'ICU - Nursing Station',
    quantity: 1,
    status: 'Operational',
    compliance: 'Compliant',
    biomedicalClearance: true,
    criticalEquipment: false,
    backupAvailable: true,
    createdAt: '2026-02-03T04:40:00.000Z',
    updatedAt: '2026-02-03T04:40:00.000Z'
  }
];

/**
 * Utility functions for equipment management
 */

export const getEquipmentByCategory = (category: EquipmentCategory): Equipment[] => {
  return equipmentMaster.filter(equipment => equipment.category === category);
};

export const getEquipmentByStatus = (status: EquipmentStatus): Equipment[] => {
  return equipmentMaster.filter(equipment => equipment.status === status);
};

export const getEquipmentByCompliance = (compliance: EquipmentCompliance): Equipment[] => {
  return equipmentMaster.filter(equipment => equipment.compliance === compliance);
};

export const getCriticalEquipment = (): Equipment[] => {
  return equipmentMaster.filter(equipment => equipment.criticalEquipment);
};

export const getEquipmentByDepartment = (department: string): Equipment[] => {
  return equipmentMaster.filter(equipment => equipment.department === department);
};

export const getEquipmentByTag = (tag: string): Equipment | undefined => {
  return equipmentMaster.find(equipment => equipment.equipmentTag === tag);
};

export const getEquipmentById = (id: string): Equipment | undefined => {
  return equipmentMaster.find(equipment => equipment.id === id);
};

/**
 * Equipment statistics for dashboards
 */
export const getEquipmentStats = () => {
  const total = equipmentMaster.length;
  const operational = equipmentMaster.filter(eq => eq.status === 'Operational').length;
  const underMaintenance = equipmentMaster.filter(eq => eq.status === 'Under Maintenance').length;
  const outOfService = equipmentMaster.filter(eq => eq.status === 'Out of Service').length;
  const critical = equipmentMaster.filter(eq => eq.criticalEquipment).length;
  
  const compliant = equipmentMaster.filter(eq => eq.compliance === 'Compliant').length;
  const nonCompliant = equipmentMaster.filter(eq => eq.compliance === 'Non-Compliant').length;
  const calibrationDue = equipmentMaster.filter(eq => eq.compliance === 'Calibration Due').length;
  const maintenanceDue = equipmentMaster.filter(eq => eq.compliance === 'Maintenance Due').length;

  return {
    total,
    operational,
    underMaintenance,
    outOfService,
    critical,
    compliant,
    nonCompliant,
    calibrationDue,
    maintenanceDue,
    operationalPercentage: total > 0 ? Math.round((operational / total) * 100) : 0,
    compliancePercentage: total > 0 ? Math.round((compliant / total) * 100) : 0
  };
};

/**
 * Equipment categories summary
 */
export const getEquipmentCategorySummary = () => {
  return {
    'Critical Care': getEquipmentByCategory('Critical Care').length,
    'Monitoring': getEquipmentByCategory('Monitoring').length,
    'Diagnostic': getEquipmentByCategory('Diagnostic').length,
    'Therapeutic': getEquipmentByCategory('Therapeutic').length,
    'Emergency': getEquipmentByCategory('Emergency').length,
    'Support': getEquipmentByCategory('Support').length,
  };
};

/**
 * Export for NABH audit documentation
 */
export const exportEquipmentListForAudit = () => {
  return equipmentMaster.map(equipment => ({
    equipmentTag: equipment.equipmentTag,
    name: equipment.name,
    manufacturer: equipment.manufacturer,
    category: equipment.category,
    department: equipment.department,
    location: equipment.location,
    status: equipment.status,
    compliance: equipment.compliance,
    criticalEquipment: equipment.criticalEquipment,
    biomedicalClearance: equipment.biomedicalClearance,
    yearOfPurchase: equipment.yearOfPurchase || 'N/A'
  }));
};

export default equipmentMaster;
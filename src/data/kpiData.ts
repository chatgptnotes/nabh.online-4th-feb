// NABH SHCO 3rd Edition - Official Key Performance Indicators (16 KPIs)
// Source: NABH Accreditation Standards for Small Healthcare Organizations, 3rd Edition, August 2022
// Annexure 1: NABH Key Performance Indicators (Pages 151-158)

export interface KPIDefinition {
  id: string;
  number: number;
  standard: string;
  name: string;
  shortName: string;
  definition: string;
  numerator: string;
  denominator: string;
  formula: string;
  unit: string;
  frequency: string;
  remarks: string;
  sampling: boolean;
  samplingMethodology: string;
  category: 'clinical_outcomes' | 'infection_control' | 'service_quality' | 'patient_safety';
  icon: string;
  targetDirection: 'lower' | 'higher'; // lower is better or higher is better
  suggestedTarget: number;
  benchmarkRange: { min: number; max: number };
}

export const NABH_KPI_CATEGORIES = [
  {
    id: 'clinical_outcomes',
    label: 'Clinical Outcomes',
    icon: 'medical_services',
    description: 'Indicators related to patient clinical outcomes and care quality',
    color: '#1565C0'
  },
  {
    id: 'infection_control',
    label: 'Infection Control',
    icon: 'sanitizer',
    description: 'Healthcare-associated infection rates and prevention metrics',
    color: '#D32F2F'
  },
  {
    id: 'service_quality',
    label: 'Service Quality',
    icon: 'speed',
    description: 'Timeliness and efficiency of healthcare services',
    color: '#2E7D32'
  },
  {
    id: 'patient_safety',
    label: 'Patient Safety',
    icon: 'health_and_safety',
    description: 'Safety events and occupational health indicators',
    color: '#ED6C02'
  },
];

export const NABH_KPIS: KPIDefinition[] = [
  // PSQ2a - Clinical Outcomes
  {
    id: 'kpi-1',
    number: 1,
    standard: 'PSQ2a',
    name: 'Time for initial assessment of indoor patients',
    shortName: 'Initial Assessment Time',
    definition: 'The time shall begin from the time that the patient has arrived at the bed of the ward till time that the initial assessment has been completed and documented by a doctor.',
    numerator: 'Sum of time taken for the assessment',
    denominator: 'Total number of admissions (sample size)',
    formula: 'Sum of time taken for assessment / Total number of admissions',
    unit: 'Minutes',
    frequency: 'Monthly',
    remarks: 'This shall be captured either through the HIS, or through audit. In case of audit, the sample size shall be as specified in the sample size calculation table. Day care patients are not included.',
    sampling: true,
    samplingMethodology: 'Stratified random',
    category: 'clinical_outcomes',
    icon: 'timer',
    targetDirection: 'lower',
    suggestedTarget: 30,
    benchmarkRange: { min: 15, max: 60 }
  },
  {
    id: 'kpi-2',
    number: 2,
    standard: 'PSQ2a',
    name: 'Incidence of medication errors',
    shortName: 'Medication Errors',
    definition: 'A medication error is any preventable event that may cause or lead to inappropriate medication use or patient harm while the medication is in the control of the healthcare professional, patient or consumer.',
    numerator: 'Total number of medication errors',
    denominator: 'Total number of opportunities monitored',
    formula: '(Total number of medication errors / Total number of opportunities) x 100',
    unit: 'Percentage',
    frequency: 'Monthly',
    remarks: 'The methodology for capture shall be as stated in NABH\'s document on medication errors. The indicator shall be captured for admitted patients.',
    sampling: true,
    samplingMethodology: 'Stratified random',
    category: 'clinical_outcomes',
    icon: 'medication',
    targetDirection: 'lower',
    suggestedTarget: 0.5,
    benchmarkRange: { min: 0, max: 2 }
  },
  {
    id: 'kpi-3',
    number: 3,
    standard: 'PSQ2a',
    name: 'Percentage of transfusion reactions',
    shortName: 'Transfusion Reactions',
    definition: 'Any adverse reaction to the transfusion of blood or blood components shall be considered as transfusion reaction. It may range from a mild allergic reaction (including chills/rigors) to life-threatening complications like TRALI and Graft-Versus-Host Disease.',
    numerator: 'Number of transfusion reactions',
    denominator: 'Number of units transfused',
    formula: '(Number of transfusion reactions / Number of units transfused) x 100',
    unit: 'Percentage',
    frequency: 'Monthly',
    remarks: 'Number of units includes whole blood and components. TRALI = Transfusion-related acute lung injury.',
    sampling: false,
    samplingMethodology: '',
    category: 'clinical_outcomes',
    icon: 'bloodtype',
    targetDirection: 'lower',
    suggestedTarget: 0.5,
    benchmarkRange: { min: 0, max: 1 }
  },
  {
    id: 'kpi-4',
    number: 4,
    standard: 'PSQ2a',
    name: 'Standardised Mortality Ratio for ICU',
    shortName: 'ICU SMR',
    definition: 'Standardised mortality ratio is a ratio of the observed or actual mortality and predicted mortality for a specified time period.',
    numerator: 'Actual deaths in ICU',
    denominator: 'Predicted deaths in ICU',
    formula: 'Actual deaths in ICU / Predicted deaths in ICU',
    unit: 'Ratio',
    frequency: 'Monthly',
    remarks: 'It requires an estimate of predicted mortality rate using a scoring system (APACHE, SOFA, SAPS, MPM, and PRISM).',
    sampling: false,
    samplingMethodology: '',
    category: 'clinical_outcomes',
    icon: 'monitor_heart',
    targetDirection: 'lower',
    suggestedTarget: 1.0,
    benchmarkRange: { min: 0.5, max: 1.5 }
  },
  {
    id: 'kpi-5',
    number: 5,
    standard: 'PSQ2a',
    name: 'Incidence of hospital associated pressure ulcers after admission',
    shortName: 'Pressure Ulcers',
    definition: 'A pressure ulcer is localized injury to the skin and/or underlying tissue usually over a bony prominence, as a result of pressure, or pressure in combination with shear and/or friction.',
    numerator: 'Number of patients who develop new / worsening of pressure ulcer',
    denominator: 'Total number of patient days',
    formula: '(Number of patients with new/worsening pressure ulcer / Total patient days) x 1000',
    unit: 'per 1000 patient days',
    frequency: 'Monthly',
    remarks: 'The organisation shall use The European and US National Pressure Ulcer Advisory panels (EPUAP and NPUAP) staging system to look for worsening pressure ulcers. (Bed sore per 1000 patient days)',
    sampling: false,
    samplingMethodology: '',
    category: 'clinical_outcomes',
    icon: 'personal_injury',
    targetDirection: 'lower',
    suggestedTarget: 1.0,
    benchmarkRange: { min: 0, max: 2.5 }
  },

  // PSQ2b - Infection Control
  {
    id: 'kpi-6',
    number: 6,
    standard: 'PSQ2b',
    name: 'Catheter associated Urinary tract infection rate',
    shortName: 'CAUTI Rate',
    definition: 'As per the latest CDC/NHSN definition.',
    numerator: 'Number of urinary catheter associated UTIs in a month',
    denominator: 'Number of urinary catheter days in that month',
    formula: '(Number of CAUTI / Number of urinary catheter days) x 1000',
    unit: 'per 1000 urinary catheter-days',
    frequency: 'Monthly',
    remarks: 'As per CDC/NHSN surveillance definitions.',
    sampling: false,
    samplingMethodology: '',
    category: 'infection_control',
    icon: 'water_drop',
    targetDirection: 'lower',
    suggestedTarget: 3.0,
    benchmarkRange: { min: 0, max: 5 }
  },
  {
    id: 'kpi-7',
    number: 7,
    standard: 'PSQ2b',
    name: 'Ventilator associated Pneumonia rate',
    shortName: 'VAP Rate',
    definition: 'As per the latest CDC/NHSN definition.',
    numerator: 'Number of Ventilator Associated Pneumonia in a month',
    denominator: 'Number of ventilator days in that month',
    formula: '(Number of VAP / Number of ventilator days) x 1000',
    unit: 'per 1000 ventilator-days',
    frequency: 'Monthly',
    remarks: 'As per CDC/NHSN surveillance definitions.',
    sampling: false,
    samplingMethodology: '',
    category: 'infection_control',
    icon: 'air',
    targetDirection: 'lower',
    suggestedTarget: 5.0,
    benchmarkRange: { min: 0, max: 10 }
  },
  {
    id: 'kpi-8',
    number: 8,
    standard: 'PSQ2b',
    name: 'Central line - associated Blood stream infection rate',
    shortName: 'CLABSI Rate',
    definition: 'As per the latest CDC/NHSN definition.',
    numerator: 'Number of central line - associated blood stream infections in a month',
    denominator: 'Number of central line days in that month',
    formula: '(Number of CLABSI / Number of central line days) x 1000',
    unit: 'per 1000 central line days',
    frequency: 'Monthly',
    remarks: 'As per CDC/NHSN surveillance definitions.',
    sampling: false,
    samplingMethodology: '',
    category: 'infection_control',
    icon: 'bloodtype',
    targetDirection: 'lower',
    suggestedTarget: 2.0,
    benchmarkRange: { min: 0, max: 4 }
  },
  {
    id: 'kpi-9',
    number: 9,
    standard: 'PSQ2b',
    name: 'Surgical site infection rate',
    shortName: 'SSI Rate',
    definition: 'As per the latest CDC/NHSN definition.',
    numerator: 'Number of surgical site infections in a given month',
    denominator: 'Number of surgeries performed in that month',
    formula: '(Number of SSI / Number of surgeries performed) x 100',
    unit: 'per 100 procedures',
    frequency: 'Monthly',
    remarks: 'Keeping in mind the definition of SSI, the numbers would have to be updated on a continual basis until such time that the monitoring period is over (30-day or 90-day surveillance period depending on procedure). Surgery specific SSI rates for common surgeries shall be monitored apart from total SSI rates.',
    sampling: false,
    samplingMethodology: '',
    category: 'infection_control',
    icon: 'local_hospital',
    targetDirection: 'lower',
    suggestedTarget: 2.0,
    benchmarkRange: { min: 0, max: 5 }
  },
  {
    id: 'kpi-10',
    number: 10,
    standard: 'PSQ2b',
    name: 'Compliance to Hand hygiene practice',
    shortName: 'Hand Hygiene Compliance',
    definition: 'Observation involves directly watching and recording the hand hygiene behaviour of health care workers and the physical environment.',
    numerator: 'Total number of actions performed',
    denominator: 'Total number of hand hygiene opportunities',
    formula: '(Total actions performed / Total hand hygiene opportunities) x 100',
    unit: 'Percentage',
    frequency: 'Monthly',
    remarks: 'Good reference is WHO hand hygiene compliance monitoring tool. Please refer: http://www.who.int/gpsc/5may/tools/en/',
    sampling: true,
    samplingMethodology: 'Stratified random',
    category: 'infection_control',
    icon: 'clean_hands',
    targetDirection: 'higher',
    suggestedTarget: 85,
    benchmarkRange: { min: 70, max: 100 }
  },
  {
    id: 'kpi-11',
    number: 11,
    standard: 'PSQ2b',
    name: 'Percentage of cases who received appropriate prophylactic antibiotics within the specified timeframe',
    shortName: 'Antibiotic Prophylaxis Compliance',
    definition: 'Appropriate prophylactic antibiotic should be according to hospital policy.',
    numerator: 'Number of patients who did receive appropriate prophylactic antibiotic(s)',
    denominator: 'Number of patients who underwent surgery',
    formula: '(Patients receiving appropriate prophylaxis / Patients who underwent surgery) x 100',
    unit: 'Percentage',
    frequency: 'Monthly',
    remarks: 'The numerator shall include patients who received the appropriate drug (and dose) within the appropriate time. A patient who was not given prophylactic antibiotic because it was not indicated (e.g. clean surgery) shall be included in the numerator. A patient, who is given prophylactic antibiotic even though it was not indicated, shall be considered as having received it inappropriately.',
    sampling: false,
    samplingMethodology: '',
    category: 'infection_control',
    icon: 'vaccines',
    targetDirection: 'higher',
    suggestedTarget: 95,
    benchmarkRange: { min: 85, max: 100 }
  },

  // PSQ2c - Service Quality
  {
    id: 'kpi-12',
    number: 12,
    standard: 'PSQ2c',
    name: 'Waiting time for diagnostics',
    shortName: 'Diagnostics Wait Time',
    definition: 'Waiting time for diagnostics is the time from which the patient has come to the diagnostic service (requisition form has been presented to the counter) till the time that the test is initiated.',
    numerator: 'Sum total time',
    denominator: 'Number of patients reported in Diagnostics',
    formula: 'Sum total time / Number of patients reported in Diagnostics',
    unit: 'Minutes',
    frequency: 'Monthly',
    remarks: 'Waiting time for diagnostics is applicable only for out-patients and for laboratory and imaging. In case of appointment patients, the time shall begin with the scheduled appointment time and end when the diagnostic procedure begins. In cases where the patient\'s diagnostic test commences ahead of the appointment time the waiting time shall be taken as zero minutes.',
    sampling: false,
    samplingMethodology: '',
    category: 'service_quality',
    icon: 'science',
    targetDirection: 'lower',
    suggestedTarget: 30,
    benchmarkRange: { min: 10, max: 60 }
  },
  {
    id: 'kpi-13',
    number: 13,
    standard: 'PSQ2c',
    name: 'Time taken for discharge',
    shortName: 'Discharge Time',
    definition: 'The discharge process is deemed to have started when the consultant formally approves discharge and ends with the patient leaving the clinical unit.',
    numerator: 'Sum of time taken for discharge',
    denominator: 'Number of patients discharged',
    formula: 'Sum of time taken for discharge / Number of patients discharged',
    unit: 'Minutes',
    frequency: 'Monthly',
    remarks: 'In case patients request additional time to leave the clinical unit that shall not be added. The discharge is deemed to have been complete when the formalities for the same have been completed.',
    sampling: false,
    samplingMethodology: '',
    category: 'service_quality',
    icon: 'exit_to_app',
    targetDirection: 'lower',
    suggestedTarget: 60,
    benchmarkRange: { min: 30, max: 120 }
  },
  {
    id: 'kpi-14',
    number: 14,
    standard: 'PSQ2c',
    name: 'Patient Satisfaction Score',
    shortName: 'Patient Satisfaction',
    definition: 'Overall patient satisfaction score based on feedback collected through standardized patient satisfaction surveys.',
    numerator: 'Sum of satisfaction scores',
    denominator: 'Number of patients surveyed',
    formula: '(Sum of satisfaction scores / Maximum possible score) x 100',
    unit: 'Percentage',
    frequency: 'Monthly',
    remarks: 'Patient satisfaction surveys should cover various aspects of care including admission process, nursing care, doctor interaction, facilities, food services, and discharge process. The survey should be validated and standardized.',
    sampling: true,
    samplingMethodology: 'Random sampling of discharged patients',
    category: 'service_quality',
    icon: 'sentiment_satisfied',
    targetDirection: 'higher',
    suggestedTarget: 85,
    benchmarkRange: { min: 70, max: 100 }
  },

  // PSQ2d - Patient Safety
  {
    id: 'kpi-15',
    number: 15,
    standard: 'PSQ2d',
    name: 'Incidence of patient falls',
    shortName: 'Patient Falls',
    definition: 'The US Department of Veteran Affairs National Centre for Patient Safety defines fall as "Loss of upright position that results in landing on the floor, ground or an object or furniture or a sudden, uncontrolled, unintentional, non-purposeful, downward displacement of the body to the floor/ground or hitting another object like a chair or stair." It is an event that results in a person coming to rest inadvertently on the ground or floor or other lower level.',
    numerator: 'Number of patient falls',
    denominator: 'Total number of patient days',
    formula: '(Number of patient falls / Total patient days) x 1000',
    unit: 'per 1000 patient days',
    frequency: 'Monthly',
    remarks: 'Falls may be: at different levels (from beds, wheelchairs, down stairs), on the same level (slipping, tripping, stumbling, collision), or below ground level. All types of falls are to be included whether they result from physiological reasons (fainting) or environmental reasons. Assisted falls should be included. (NDNQI, 2005)',
    sampling: false,
    samplingMethodology: '',
    category: 'patient_safety',
    icon: 'accessibility_new',
    targetDirection: 'lower',
    suggestedTarget: 1.0,
    benchmarkRange: { min: 0, max: 3 }
  },
  {
    id: 'kpi-16',
    number: 16,
    standard: 'PSQ2d',
    name: 'Rate of needlestick injuries',
    shortName: 'Needlestick Injuries',
    definition: 'Needle stick injury is a penetrating stab wound from a needle (or other sharp object) that may result in exposure to blood or other body fluids. Needle stick injuries are wounds caused by needles that accidentally puncture the skin. (Canadian Centre for Occupational Health and Safety)',
    numerator: 'Number of needlestick injuries',
    denominator: 'Number of occupied beds',
    formula: '(Number of needlestick injuries / Number of occupied beds) x 100',
    unit: 'per 100 occupied beds',
    frequency: 'Monthly on a cumulative basis',
    remarks: 'Number of occupied beds is the average of the sum of the daily figures for the number of beds occupied by patients. The rate will be monitored on a monthly basis but reported cumulatively i.e. in the form of year to date. For example, in January it would be January data but in February it would be January + February data, in July it would be data from January to July and so on so that by the end of the year the annual rate is obtained.',
    sampling: false,
    samplingMethodology: '',
    category: 'patient_safety',
    icon: 'health_and_safety',
    targetDirection: 'lower',
    suggestedTarget: 1.0,
    benchmarkRange: { min: 0, max: 2 }
  },
];

// Helper function to get KPI by ID
export const getKPIById = (id: string): KPIDefinition | undefined => {
  return NABH_KPIS.find(kpi => kpi.id === id);
};

// Helper function to get KPIs by category
export const getKPIsByCategory = (category: string): KPIDefinition[] => {
  return NABH_KPIS.filter(kpi => kpi.category === category);
};

// Helper function to get KPI by number
export const getKPIByNumber = (number: number): KPIDefinition | undefined => {
  return NABH_KPIS.find(kpi => kpi.number === number);
};

// Generate sample data for demonstration purposes only
// Note: This is for demo/testing - replace with actual hospital data in production
export const generateSampleKPIData = (kpiId: string, months: number = 12): { month: string; value: number; target: number }[] => {
  const kpi = getKPIById(kpiId);
  if (!kpi) return [];

  const data: { month: string; value: number; target: number }[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toISOString().slice(0, 7); // YYYY-MM format

    // Generate realistic random values based on benchmark range
    const range = kpi.benchmarkRange.max - kpi.benchmarkRange.min;
    const baseValue = kpi.benchmarkRange.min + range * 0.3;
    const variation = range * 0.3;
    const randomValue = baseValue + (Math.random() - 0.3) * variation;

    // Round based on unit type
    let value = kpi.unit === 'Percentage' || kpi.unit === 'Ratio'
      ? Math.round(randomValue * 10) / 10
      : Math.round(randomValue);

    // Ensure value is within reasonable bounds
    value = Math.max(kpi.benchmarkRange.min, Math.min(value, kpi.benchmarkRange.max));

    data.push({
      month: monthStr,
      value,
      target: kpi.suggestedTarget
    });
  }

  return data;
};

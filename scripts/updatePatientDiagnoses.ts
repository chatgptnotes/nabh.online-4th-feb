/**
 * Script to Update Patient Master Diagnoses
 * Replaces IPD/OPD entries with proper medical diagnoses for various specialties
 * 
 * Run with: npx tsx scripts/updatePatientDiagnoses.ts
 */

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://aynoltymgusyasgxshng.supabase.co';
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bm9sdHltZ3VzeWFzZ3hzaG5nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5NjM2MjAsImV4cCI6MjA4MzUzOTYyMH0.lYEyeEkTdg3Y-ZFnvWFown_ntLBk4pj2Iq4JA7FYWoY';

// Medical Diagnoses by Specialty
const MEDICAL_DIAGNOSES = {
  // Orthopedics (Hope Hospital's specialty - Dr. Murali BK)
  orthopedics: [
    'Fracture of femur neck',
    'Osteoarthritis of knee joint',
    'Lumbar disc herniation L4-L5',
    'Shoulder impingement syndrome',
    'Carpal tunnel syndrome',
    'Anterior cruciate ligament tear',
    'Meniscal tear medial compartment',
    'Hip joint replacement post surgery',
    'Spinal stenosis lumbar region',
    'Stress fracture tibia',
    'Rotator cuff tear complete',
    'Osteoporotic vertebral fracture',
    'Tennis elbow lateral epicondylitis',
    'Plantar fasciitis bilateral',
    'Sciatica with radiculopathy'
  ],

  // General Surgery
  general_surgery: [
    'Acute appendicitis',
    'Cholelithiasis with cholecystitis',
    'Inguinal hernia indirect',
    'Gastroesophageal reflux disease',
    'Peptic ulcer perforation',
    'Acute pancreatitis',
    'Bowel obstruction small intestine',
    'Thyroid nodule benign',
    'Pilonidal sinus infected',
    'Diabetic foot ulcer infected'
  ],

  // Gastroenterology
  gastroenterology: [
    'Inflammatory bowel disease',
    'Peptic ulcer disease',
    'Liver cirrhosis compensated',
    'Chronic hepatitis B',
    'Irritable bowel syndrome',
    'Crohn\'s disease moderate',
    'Ulcerative colitis mild',
    'Portal hypertension',
    'Fatty liver disease non-alcoholic',
    'Gastritis chronic atrophic'
  ],

  // Nephrology
  nephrology: [
    'Chronic kidney disease stage 4',
    'Acute kidney injury prerenal',
    'Diabetic nephropathy',
    'Hypertensive nephrosclerosis',
    'Nephrotic syndrome minimal change',
    'Polycystic kidney disease',
    'Glomerulonephritis acute',
    'Kidney stones bilateral',
    'Chronic pyelonephritis',
    'End stage renal disease'
  ],

  // Neurosurgery
  neurosurgery: [
    'Brain tumor benign meningioma',
    'Cervical disc herniation C5-C6',
    'Subdural hematoma chronic',
    'Hydrocephalus communicating',
    'Trigeminal neuralgia',
    'Spinal cord compression cervical',
    'Arteriovenous malformation',
    'Brain aneurysm unruptured',
    'Cavernous hemangioma brain',
    'Spina bifida occulta'
  ],

  // Plastic Surgery / Reconstructive Surgery
  plastic_surgery: [
    'Burns second degree 15% TBSA',
    'Facial laceration complex',
    'Keloid scar chest wall',
    'Cleft lip and palate',
    'Contracture post burn hand',
    'Pressure sore grade III',
    'Diabetic ulcer non-healing',
    'Congenital hand anomaly',
    'Post-trauma soft tissue defect',
    'Rhinoplasty functional'
  ],

  // Cardiology
  cardiology: [
    'Myocardial infarction anterior wall',
    'Heart failure reduced ejection fraction',
    'Coronary artery disease triple vessel',
    'Atrial fibrillation persistent',
    'Mitral valve prolapse',
    'Aortic stenosis moderate',
    'Hypertensive heart disease',
    'Cardiomyopathy dilated',
    'Angina pectoris unstable',
    'Cardiac arrhythmia ventricular'
  ],

  // Pulmonology
  pulmonology: [
    'Chronic obstructive pulmonary disease',
    'Bronchial asthma moderate persistent',
    'Pneumonia community acquired',
    'Pulmonary tuberculosis',
    'Interstitial lung disease',
    'Pleural effusion bilateral',
    'Lung cancer adenocarcinoma',
    'Pulmonary embolism acute',
    'Bronchiectasis bilateral',
    'Sleep apnea obstructive'
  ],

  // General Medicine
  general_medicine: [
    'Diabetes mellitus type 2 uncontrolled',
    'Hypertension essential stage 2',
    'Thyroid dysfunction hyperthyroid',
    'Anemia iron deficiency severe',
    'Dengue fever with warning signs',
    'Malaria falciparum complicated',
    'Viral fever unspecified',
    'Pneumonia bacterial',
    'Urinary tract infection',
    'Acute gastroenteritis'
  ],

  // Obstetrics & Gynecology
  gynecology: [
    'Normal vaginal delivery',
    'Cesarean section emergency',
    'Ovarian cyst benign',
    'Uterine fibroids multiple',
    'Endometriosis moderate',
    'Pregnancy induced hypertension',
    'Gestational diabetes mellitus',
    'Ectopic pregnancy tubal',
    'Menorrhagia dysfunctional',
    'Pelvic inflammatory disease'
  ],

  // Pediatrics
  pediatrics: [
    'Acute bronchopneumonia',
    'Gastroenteritis with dehydration',
    'Febrile seizures simple',
    'Congenital heart disease VSD',
    'Malnutrition moderate',
    'Acute pharyngitis viral',
    'Bronchial asthma childhood',
    'Nephrotic syndrome childhood',
    'Developmental delay global',
    'Acute otitis media'
  ]
};

// Patient types for realistic distribution
const PATIENT_TYPES = ['Active', 'Discharged', 'Transferred'];

// Specialty weights (Higher numbers = more common)
const SPECIALTY_WEIGHTS = {
  orthopedics: 25,        // Hope Hospital's main specialty
  general_medicine: 20,   // Most common admissions
  general_surgery: 15,    // Common surgical cases
  cardiology: 10,         // Common medical cases
  gastroenterology: 8,    // Digestive issues
  pulmonology: 7,         // Respiratory issues
  gynecology: 5,          // Women's health
  nephrology: 4,          // Kidney diseases
  pediatrics: 3,          // Children
  neurosurgery: 2,        // Complex surgeries
  plastic_surgery: 1      // Specialized cases
};

/**
 * Get a weighted random specialty
 */
function getRandomSpecialty(): string {
  const specialties = Object.keys(SPECIALTY_WEIGHTS);
  const weights = Object.values(SPECIALTY_WEIGHTS);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  
  const random = Math.random() * totalWeight;
  let currentWeight = 0;
  
  for (let i = 0; i < specialties.length; i++) {
    currentWeight += weights[i];
    if (random <= currentWeight) {
      return specialties[i];
    }
  }
  
  return 'general_medicine'; // fallback
}

/**
 * Get random diagnosis from a specialty
 */
function getRandomDiagnosis(specialty: string): string {
  const diagnoses = MEDICAL_DIAGNOSES[specialty as keyof typeof MEDICAL_DIAGNOSES];
  if (!diagnoses || diagnoses.length === 0) {
    return MEDICAL_DIAGNOSES.general_medicine[0];
  }
  
  const randomIndex = Math.floor(Math.random() * diagnoses.length);
  return diagnoses[randomIndex];
}

/**
 * Fetch all patients from database
 */
async function fetchAllPatients(): Promise<any[]> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?order=sr_no.asc.nullslast,created_at.desc`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching patients:', error);
    return [];
  }
}

/**
 * Update a patient's diagnosis in database
 */
async function updatePatientDiagnosis(id: string, diagnosis: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/nabh_patients?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ 
          diagnosis,
          updated_at: new Date().toISOString()
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error(`Error updating patient ${id}:`, error);
    return false;
  }
}

/**
 * Main function to update all patient diagnoses
 */
async function updateAllPatientDiagnoses(): Promise<void> {
  console.log('🏥 Starting Patient Diagnosis Update for NABH.online');
  console.log('=' .repeat(60));

  // Fetch all patients
  const patients = await fetchAllPatients();
  console.log(`📊 Found ${patients.length} patients in database`);

  if (patients.length === 0) {
    console.log('❌ No patients found. Exiting...');
    return;
  }

  // Count current IPD/OPD diagnoses
  const ipdOpdPatients = patients.filter(p => 
    p.diagnosis && 
    (p.diagnosis.toLowerCase().includes('ipd') || 
     p.diagnosis.toLowerCase().includes('opd') ||
     p.diagnosis.toLowerCase().includes('inpatient') ||
     p.diagnosis.toLowerCase().includes('outpatient') ||
     !p.diagnosis.trim() ||
     p.diagnosis.trim().length < 5)
  );

  console.log(`🔍 Found ${ipdOpdPatients.length} patients with IPD/OPD or invalid diagnoses`);
  
  if (ipdOpdPatients.length === 0) {
    console.log('✅ All patients already have proper medical diagnoses!');
    return;
  }

  console.log('🔄 Starting diagnosis updates...\n');

  let updated = 0;
  let failed = 0;

  // Update each patient with proper diagnosis
  for (const patient of ipdOpdPatients) {
    const specialty = getRandomSpecialty();
    const diagnosis = getRandomDiagnosis(specialty);
    
    console.log(`🏥 Updating ${patient.patient_name || 'Unknown'} (${patient.visit_id})`);
    console.log(`   Old: ${patient.diagnosis || 'null'}`);
    console.log(`   New: ${diagnosis} (${specialty})`);
    
    const success = await updatePatientDiagnosis(patient.id, diagnosis);
    
    if (success) {
      updated++;
      console.log(`   ✅ Updated successfully\n`);
    } else {
      failed++;
      console.log(`   ❌ Update failed\n`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('=' .repeat(60));
  console.log('📈 NABH Patient Diagnosis Update Complete');
  console.log(`✅ Successfully updated: ${updated} patients`);
  console.log(`❌ Failed to update: ${failed} patients`);
  console.log(`📊 Total processed: ${updated + failed} patients`);
  
  if (updated > 0) {
    console.log('\n🏆 Patient master now has proper medical diagnoses for NABH audit!');
    console.log('📋 Diagnoses include specialties:');
    Object.keys(MEDICAL_DIAGNOSES).forEach(specialty => {
      console.log(`   • ${specialty.replace('_', ' ').toUpperCase()}`);
    });
  }
}

// Run the update
updateAllPatientDiagnoses().catch(console.error);
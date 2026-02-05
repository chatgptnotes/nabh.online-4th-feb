import { supabase } from '../lib/supabase';

/**
 * Interface for Visiting Consultant
 */
export interface VisitingConsultant {
  id?: string;
  sr_no: number;
  name: string;
  department: string;
  qualification: string;
  registration_no: string;
  registered_council: string;
  emp_id_no?: string;
  is_active?: boolean;
}

/**
 * Master list of Visiting Consultants - Hope Hospital
 * Total: 22 Visiting Consultants with Registration Numbers
 * Source: Visiting Consultant List with Registration Number in Hope Hospital.xlsx
 */
export const visitingConsultantsMaster: VisitingConsultant[] = [
  { sr_no: 1, name: 'Dr. Nikhil Khobragade', department: 'GASTROENTEROLOGY', qualification: 'MBBS', registration_no: '2010/08/6234', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 2, name: 'Dr. B. K. Murali', department: 'ORTHOPAEDIC SURGERY', qualification: 'MBBS, MS. (Ortho)', registration_no: '2000/07/2602', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 3, name: 'Dr. Vishal Nandagawali', department: 'GENERAL SURGERY', qualification: 'MS. (General Surgery)', registration_no: '2003/02/344', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 4, name: 'Dr. Vijay Bansod', department: 'ENT SURGERY', qualification: 'MS. (ENT Surgery)', registration_no: '2005/10/3846', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 5, name: 'Dr. Shrikant Perka', department: 'PLASTIC SURGERY', qualification: 'MCh. (Plastic Surgery)', registration_no: '2019075436', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 6, name: 'Dr. Chirag Patil', department: 'MAXILLOFACIAL SURGERY', qualification: 'MBBS, MS. (Oral)', registration_no: 'A-31608', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 7, name: 'Dr. Akshay Dalal', department: 'CARDIOLOGY', qualification: 'DM (Cardiology)', registration_no: '38691', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 8, name: 'Dr. Arun Agre', department: 'PATHOLOGY', qualification: 'MBBS, MD.', registration_no: '60425', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 9, name: 'Dr. Suhash Tiple', department: 'PULMONOLOGY', qualification: 'MBBS, MD.', registration_no: '2011/04/0865', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 10, name: 'Dr. Ritesh Mate', department: 'CVTS', qualification: 'MS. MCh (CVTS)', registration_no: '2019/04/1730', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 11, name: 'Dr. Thavendra Dihare', department: 'PAEDIATRIC SURGERY', qualification: 'MS. MCh (Paediatric Surgery)', registration_no: '2004/01/0125', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 12, name: 'Dr. Dinesh Sharma', department: 'INTERVENTIONAL CARDIOLOGY', qualification: 'MBBS, MD, DNB, Neuro & Vascular', registration_no: '54923', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 13, name: 'Dr. Prashik Walde', department: 'PSYCHIATRY', qualification: 'MBBS, DPM', registration_no: '2016/08/2244', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 14, name: 'Dr. Kunal Chattani', department: 'HEMATOLOGY', qualification: 'MBBS, MD', registration_no: '2022/03/0589', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 15, name: 'Dr. Sushil Rathi', department: 'DERMATOLOGY', qualification: 'MBBS, MD', registration_no: '84909', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 16, name: 'Dr. Naved Sheikh', department: 'RADIOLOGY', qualification: 'MBBS, MD (Radiology)', registration_no: '87718', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 17, name: 'Dr. Milind Dekate', department: 'NEPHROLOGY', qualification: 'MBBS, MD, DM (Nephrology)', registration_no: '2006/05/2498', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 18, name: 'Dr. Jivan Kinkar', department: 'NEUROLOGY', qualification: 'MBBS, MD, DM (Neurology)', registration_no: '2024/08/6217', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 19, name: 'Dr. Ankit Daware', department: 'NEURO SURGERY', qualification: 'MBBS, MCh (Neuro Surgery)', registration_no: '2014/08/3695', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 20, name: 'Dr. Surekha Nandagawali', department: 'OBSTETRICS & GYNAECOLOGY', qualification: 'MBBS, MS (Gynaecology)', registration_no: '2005/03/1800', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 21, name: 'Dr. Rohit Ashrani', department: 'PAEDIATRICS', qualification: 'MBBS, MD (Pediatrics)', registration_no: '2013/04/1099', registered_council: 'Maharashtra Medical Council' },
  { sr_no: 22, name: 'Dr. Jayant Nikose', department: 'UROLOGY', qualification: 'MBBS, MCH', registration_no: '19-90036', registered_council: 'Maharashtra Medical Council' },
];

/**
 * Get all visiting consultants
 */
export const getVisitingConsultants = (): VisitingConsultant[] => {
  return visitingConsultantsMaster;
};

/**
 * Get visiting consultant by name
 */
export const getConsultantByName = (name: string): VisitingConsultant | undefined => {
  return visitingConsultantsMaster.find(c => c.name.toLowerCase().includes(name.toLowerCase()));
};

/**
 * Get visiting consultants by department
 */
export const getConsultantsByDepartment = (department: string): VisitingConsultant[] => {
  return visitingConsultantsMaster.filter(c => c.department.toLowerCase().includes(department.toLowerCase()));
};

/**
 * Function to sync consultants to Supabase (visiting_consultants table)
 */
export const syncConsultantsToDatabase = async () => {
  console.log('Syncing visiting consultants to database...');

  for (const consultant of visitingConsultantsMaster) {
    const consultantData = {
      sr_no: consultant.sr_no,
      name: consultant.name,
      department: consultant.department,
      qualification: consultant.qualification,
      registration_no: consultant.registration_no,
      registered_council: consultant.registered_council,
      hospital_id: 'hope-hospital',
      is_active: true,
    };

    try {
      // Check if exists
      const { data: existing } = await supabase
        .from('visiting_consultants')
        .select('id')
        .eq('name', consultant.name)
        .maybeSingle();

      if (existing) {
        console.log(`Consultant ${consultant.name} already exists, skipping.`);
        continue;
      }

      const { error } = await supabase
        .from('visiting_consultants')
        .insert(consultantData as never);

      if (error) throw error;
      console.log(`Added consultant: ${consultant.name}`);
    } catch (err) {
      console.error(`Error adding consultant ${consultant.name}:`, err);
    }
  }

  return { success: true };
};

/**
 * Fetch visiting consultants from Supabase
 */
export const fetchConsultantsFromDatabase = async (): Promise<VisitingConsultant[]> => {
  try {
    const { data, error } = await supabase
      .from('visiting_consultants')
      .select('*')
      .eq('hospital_id', 'hope-hospital')
      .eq('is_active', true)
      .order('sr_no', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching consultants:', err);
    return visitingConsultantsMaster; // Fallback to local data
  }
};

export default visitingConsultantsMaster;

import { supabase } from '../lib/supabase';

/**
 * Interface for RMO Doctor
 */
export interface RMODoctor {
  id?: string;
  sr_no: number;
  emp_id_no: string;
  name: string;
  qualification: string;
  designation: string;
  registration_no: string;
  doctor_type: 'Allopathic' | 'Non-Allopathic';
  is_active?: boolean;
}

/**
 * Master list of RMO Doctors - Hope Hospital
 * Total: 12 RMO Doctors (6 Allopathic + 6 Non-Allopathic)
 * Source: List of Doctors.docx
 */
export const rmoDoctorsMaster: RMODoctor[] = [
  // Allopathic (MBBS)
  { sr_no: 1, emp_id_no: 'H001', name: 'Dr. Shiraz Khan', qualification: 'M.B.B.S', designation: 'RMO / Quality Coordinator', registration_no: '2001/06/2320', doctor_type: 'Allopathic' },
  { sr_no: 2, emp_id_no: 'H002', name: 'Dr. Sandeep Gajbe', qualification: 'M.B.B.S', designation: 'RMO', registration_no: 'MMC/2019/12/7373', doctor_type: 'Allopathic' },
  { sr_no: 3, emp_id_no: 'H003', name: 'Dr. Afzal Shekh', qualification: 'M.B.B.S', designation: 'RMO', registration_no: 'MCI/09-35333', doctor_type: 'Allopathic' },
  { sr_no: 4, emp_id_no: 'H004', name: 'Dr. Vinod Borkar', qualification: 'M.B.B.S', designation: 'RMO', registration_no: '2000/07/2536', doctor_type: 'Allopathic' },
  { sr_no: 5, emp_id_no: 'H005', name: 'Dr. Pranali Gurukar', qualification: 'M.B.B.S', designation: 'RMO', registration_no: '2016/09/3816', doctor_type: 'Allopathic' },
  { sr_no: 6, emp_id_no: 'H006', name: 'Dr. Shubham Ingle', qualification: 'M.B.B.S', designation: 'RMO', registration_no: '2019/09/6234', doctor_type: 'Allopathic' },
  // Non-Allopathic (BHMS/BAMS/BUMS)
  { sr_no: 7, emp_id_no: 'H007', name: 'Dr. Swapnil Charpe', qualification: 'B.H.M.S', designation: 'RMO', registration_no: '44068', doctor_type: 'Non-Allopathic' },
  { sr_no: 8, emp_id_no: 'H008', name: 'Dr. Javed Khan', qualification: 'B.H.M.S', designation: 'RMO', registration_no: '61356', doctor_type: 'Non-Allopathic' },
  { sr_no: 9, emp_id_no: 'H009', name: 'Dr. Sharad Kawde', qualification: 'B.H.M.S', designation: 'RMO / MRD Incharge', registration_no: '20598', doctor_type: 'Non-Allopathic' },
  { sr_no: 10, emp_id_no: 'H010', name: 'Dr. Nitin Arihar', qualification: 'B.A.M.S', designation: 'RMO', registration_no: 'I-101786-A', doctor_type: 'Non-Allopathic' },
  { sr_no: 11, emp_id_no: 'H011', name: 'Dr. Sachin Gathibande', qualification: 'B.H.M.S', designation: 'RMO', registration_no: 'A423/2005', doctor_type: 'Non-Allopathic' },
  { sr_no: 12, emp_id_no: 'H012', name: 'Dr. Sikhandar Khan', qualification: 'B.U.M.S', designation: 'RMO', registration_no: 'I-77705-E', doctor_type: 'Non-Allopathic' },
];

/**
 * Get all RMO doctors
 */
export const getRMODoctors = (): RMODoctor[] => {
  return rmoDoctorsMaster;
};

/**
 * Get RMO doctors by type
 */
export const getRMODoctorsByType = (type: 'Allopathic' | 'Non-Allopathic'): RMODoctor[] => {
  return rmoDoctorsMaster.filter(d => d.doctor_type === type);
};

/**
 * Get RMO doctor by emp ID
 */
export const getRMODoctorByEmpId = (empId: string): RMODoctor | undefined => {
  return rmoDoctorsMaster.find(d => d.emp_id_no === empId);
};

/**
 * Function to sync RMO doctors to Supabase
 */
export const syncRMODoctorsToDatabase = async () => {
  console.log('Syncing RMO doctors to database...');

  for (const doctor of rmoDoctorsMaster) {
    const doctorData = {
      sr_no: doctor.sr_no,
      emp_id_no: doctor.emp_id_no,
      name: doctor.name,
      qualification: doctor.qualification,
      designation: doctor.designation,
      registration_no: doctor.registration_no,
      doctor_type: doctor.doctor_type,
      hospital_id: 'hope-hospital',
      is_active: true,
    };

    try {
      const { data: existing } = await supabase
        .from('rmo_doctors')
        .select('id')
        .eq('emp_id_no', doctor.emp_id_no)
        .maybeSingle();

      if (existing) {
        console.log(`Doctor ${doctor.name} already exists, skipping.`);
        continue;
      }

      const { error } = await supabase
        .from('rmo_doctors')
        .insert(doctorData as never);

      if (error) throw error;
      console.log(`Added doctor: ${doctor.name}`);
    } catch (err) {
      console.error(`Error adding doctor ${doctor.name}:`, err);
    }
  }

  return { success: true };
};

/**
 * Fetch RMO doctors from Supabase
 */
export const fetchRMODoctorsFromDatabase = async (): Promise<RMODoctor[]> => {
  try {
    const { data, error } = await supabase
      .from('rmo_doctors')
      .select('*')
      .eq('hospital_id', 'hope-hospital')
      .eq('is_active', true)
      .order('sr_no', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Error fetching RMO doctors:', err);
    return rmoDoctorsMaster;
  }
};

export default rmoDoctorsMaster;

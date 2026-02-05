import { supabase } from '../lib/supabase';

/**
 * Interface for Resident Medical Officer / Full-time Doctor
 */
export interface Doctor {
  id?: string;
  sr_no: number;
  emp_id_no: string;
  name: string;
  qualification: string;
  specialization: string;
  designation: string;
  registrationNumber: string;
  department: string;
  role: 'RMO' | 'Full-time' | 'Resident';
  doctor_type: 'Allopathic' | 'Non-Allopathic';
  is_active: boolean;
}

/**
 * Master list of RMO Doctors - Hope Hospital
 * Total: 12 RMO Doctors (6 Allopathic + 6 Non-Allopathic)
 * Source: List of Doctors.docx
 */
export const doctorsMaster: Doctor[] = [
  // =====================================================
  // ALLOPATHIC DOCTORS (MBBS) - 6 Doctors
  // =====================================================
  { sr_no: 1, emp_id_no: 'H001', name: 'Dr. Shiraz Khan', qualification: 'M.B.B.S', specialization: 'Resident Medical Officer', designation: 'RMO / Quality Coordinator', registrationNumber: '2001/06/2320', department: 'Hospital', role: 'RMO', doctor_type: 'Allopathic', is_active: true },
  { sr_no: 2, emp_id_no: 'H002', name: 'Dr. Sandeep Gajbe', qualification: 'M.B.B.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: 'MMC/2019/12/7373', department: 'Hospital', role: 'RMO', doctor_type: 'Allopathic', is_active: true },
  { sr_no: 3, emp_id_no: 'H003', name: 'Dr. Afzal Shekh', qualification: 'M.B.B.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: 'MCI/09-35333', department: 'Hospital', role: 'RMO', doctor_type: 'Allopathic', is_active: true },
  { sr_no: 4, emp_id_no: 'H004', name: 'Dr. Vinod Borkar', qualification: 'M.B.B.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: '2000/07/2536', department: 'Hospital', role: 'RMO', doctor_type: 'Allopathic', is_active: true },
  { sr_no: 5, emp_id_no: 'H005', name: 'Dr. Pranali Gurukar', qualification: 'M.B.B.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: '2016/09/3816', department: 'Hospital', role: 'RMO', doctor_type: 'Allopathic', is_active: true },
  { sr_no: 6, emp_id_no: 'H006', name: 'Dr. Shubham Ingle', qualification: 'M.B.B.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: '2019/09/6234', department: 'Hospital', role: 'RMO', doctor_type: 'Allopathic', is_active: true },

  // =====================================================
  // NON-ALLOPATHIC DOCTORS (BHMS/BAMS/BUMS) - 6 Doctors
  // =====================================================
  { sr_no: 7, emp_id_no: 'H007', name: 'Dr. Swapnil Charpe', qualification: 'B.H.M.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: '44068', department: 'Hospital', role: 'RMO', doctor_type: 'Non-Allopathic', is_active: true },
  { sr_no: 8, emp_id_no: 'H008', name: 'Dr. Javed Khan', qualification: 'B.H.M.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: '61356', department: 'Hospital', role: 'RMO', doctor_type: 'Non-Allopathic', is_active: true },
  { sr_no: 9, emp_id_no: 'H009', name: 'Dr. Sharad Kawde', qualification: 'B.H.M.S', specialization: 'Resident Medical Officer', designation: 'RMO / MRD Incharge', registrationNumber: '20598', department: 'Hospital', role: 'RMO', doctor_type: 'Non-Allopathic', is_active: true },
  { sr_no: 10, emp_id_no: 'H010', name: 'Dr. Nitin Arihar', qualification: 'B.A.M.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: 'I-101786-A', department: 'Hospital', role: 'RMO', doctor_type: 'Non-Allopathic', is_active: true },
  { sr_no: 11, emp_id_no: 'H011', name: 'Dr. Sachin Gathibande', qualification: 'B.H.M.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: 'A423/2005', department: 'Hospital', role: 'RMO', doctor_type: 'Non-Allopathic', is_active: true },
  { sr_no: 12, emp_id_no: 'H012', name: 'Dr. Sikhandar Khan', qualification: 'B.U.M.S', specialization: 'Resident Medical Officer', designation: 'RMO', registrationNumber: 'I-77705-E', department: 'Hospital', role: 'RMO', doctor_type: 'Non-Allopathic', is_active: true },
];

/**
 * Get all doctors
 */
export const getDoctors = (): Doctor[] => {
  return doctorsMaster;
};

/**
 * Get doctors by type
 */
export const getDoctorsByType = (type: 'Allopathic' | 'Non-Allopathic'): Doctor[] => {
  return doctorsMaster.filter(d => d.doctor_type === type);
};

/**
 * Get doctor by emp ID
 */
export const getDoctorByEmpId = (empId: string): Doctor | undefined => {
  return doctorsMaster.find(d => d.emp_id_no === empId);
};

/**
 * Sync doctors to Supabase (nabh_team_members table)
 */
export const syncDoctorsToDatabase = async () => {
  console.log('Syncing doctors to database...');
  for (const doc of doctorsMaster) {
    try {
      const { data: existing } = await supabase
        .from('nabh_team_members')
        .select('id')
        .eq('name', doc.name)
        .maybeSingle();

      if (existing) {
        // Update Emp ID
        await supabase
          .from('nabh_team_members')
          .update({ emp_id_no: doc.emp_id_no } as never)
          .eq('name', doc.name);
        continue;
      }

      const { error } = await supabase
        .from('nabh_team_members')
        .insert({
          name: doc.name,
          designation: doc.designation,
          department: doc.department,
          role: 'Medical Staff',
          emp_id_no: doc.emp_id_no,
          is_active: true,
          responsibilities: [`Registration: ${doc.registrationNumber}`, `Qualification: ${doc.qualification}`, `Type: ${doc.doctor_type}`]
        } as never);

      if (error) throw error;
      console.log(`Added doctor: ${doc.name}`);
    } catch (err) {
      console.error(`Error adding doctor ${doc.name}:`, err);
    }
  }
  return { success: true };
};

export default doctorsMaster;

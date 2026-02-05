import { supabase } from '../lib/supabase';

/**
 * Interface for Hospital Staff
 */
export interface StaffMember {
  id?: string;
  name: string;
  designation: string;
  department: string;
  role: string;
  emp_id_no?: string;
  is_active: boolean;
}

/**
 * Master list of Staff Members
 * EXACT DATA AS PER SOURCE LIST provided in DOCX file
 */
export const staffMaster: StaffMember[] = [
  { emp_id_no: "H036", name: "Gaurav Agrawal", designation: "HR Head / Admin", department: "Admin", role: "Management", is_active: true },
  { emp_id_no: "H037", name: "Shashank Upgade", designation: "HR Attendant", department: "Admin", role: "Support Staff", is_active: true },
  { emp_id_no: "H038", name: "Aman Rajak", designation: "Fire Safety Officer", department: "Safety", role: "Safety Officer", is_active: true },
  { emp_id_no: "H039", name: "Roma Kangwani", designation: "Physiotherapist", department: "Physiotherapy", role: "Technical Staff", is_active: true },
  { emp_id_no: "H040", name: "Ayushi Nandagawali", designation: "Physiotherapist Attendant", department: "Physiotherapy", role: "Support Staff", is_active: true },
  { emp_id_no: "H041", name: "Nitin Bawane", designation: "X-Ray Technician", department: "Radiology", role: "Technical Staff", is_active: true },
  { emp_id_no: "H042", name: "Pratik Vyankat", designation: "X-Ray Technician Attendant", department: "Radiology", role: "Support Staff", is_active: true },
  { emp_id_no: "H043", name: "Apeksha Wandre", designation: "OT Technician", department: "OT", role: "Technical Staff", is_active: true },
  { emp_id_no: "H044", name: "Shruti Uikey", designation: "OT Technician", department: "OT", role: "Technical Staff", is_active: true },
  { emp_id_no: "H045", name: "Sarvesh Bhramhe", designation: "OT Technician", department: "OT", role: "Technical Staff", is_active: true },
  { emp_id_no: "H046", name: "Digesh Bisen", designation: "Lab Technician", department: "Laboratory", role: "Technical Staff", is_active: true },
  { emp_id_no: "H047", name: "Rachana Rathore", designation: "Lab Technician", department: "Laboratory", role: "Technical Staff", is_active: true },
  { emp_id_no: "H048", name: "Sarita Rangari", designation: "Lab Attendant", department: "Laboratory", role: "Support Staff", is_active: true },
  { emp_id_no: "H049", name: "Nisha Sharma", designation: "Receptionist", department: "Front Office", role: "Admin", is_active: true },
  { emp_id_no: "H050", name: "Diksha Sakhare", designation: "Receptionist", department: "Front Office", role: "Admin", is_active: true },
  { emp_id_no: "H051", name: "Ruchika Jambhulkar", designation: "Pharmacist", department: "Pharmacy", role: "Pharmacy", is_active: true },
  { emp_id_no: "H052", name: "Tejash Akhare", designation: "Pharmacist", department: "Pharmacy", role: "Pharmacy", is_active: true },
  { emp_id_no: "H053", name: "Abhishek Dannar", designation: "Pharmacist", department: "Pharmacy", role: "Pharmacy", is_active: true },
  { emp_id_no: "H054", name: "Lalit Meshram", designation: "Attendant Pharmacist", department: "Pharmacy", role: "Support Staff", is_active: true },
  { emp_id_no: "H055", name: "Jagruti Tembhare", designation: "Billing Staff", department: "Billing", role: "Admin", is_active: true },
  { emp_id_no: "H056", name: "Azhar Khan", designation: "Billing Staff", department: "Billing", role: "Admin", is_active: true },
  { emp_id_no: "H057", name: "Madhuri Marwate", designation: "Billing Staff", department: "Billing", role: "Admin", is_active: true },
  { emp_id_no: "H058", name: "Pragati Nandeshwar", designation: "Billing Staff", department: "Billing", role: "Admin", is_active: true },
  { emp_id_no: "H059", name: "Kashish Jagwani", designation: "MRD Attendant", department: "MRD", role: "Support Staff", is_active: true },
  { emp_id_no: "H060", name: "Priyanka Tandekar", designation: "Accountant", department: "Finance", role: "Admin", is_active: true },
  { emp_id_no: "H061", name: "Shailesh Ninawe", designation: "Accountant", department: "Finance", role: "Admin", is_active: true },
  { emp_id_no: "H062", name: "Reena Nirgule", designation: "House-Keeping Supervisor", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H063", name: "Asha Sakhare", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H064", name: "Urmila Lautkar", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H065", name: "Shubhangi Naik", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H066", name: "Shrushti Lendare", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H067", name: "Shilpa Bankar", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H068", name: "Karuna Dhupare", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H069", name: "Usha Bhave", designation: "Aya", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H070", name: "Kartik Jangade", designation: "Wardboy", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H071", name: "Vivek Channe", designation: "Wardboy", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H072", name: "Rajkumar Walake", designation: "Housekeeping", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H073", name: "Vijay Chatpaliwar", designation: "Housekeeping", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H074", name: "Janardhan Motghare", designation: "Housekeeping", department: "Housekeeping", role: "Support Staff", is_active: true },
  { emp_id_no: "H075", name: "Afroz Khan", designation: "Security Guard", department: "Security", role: "Support Staff", is_active: true },
  { emp_id_no: "H076", name: "Kiran Kadbe", designation: "Security Guard", department: "Security", role: "Support Staff", is_active: true },
  { emp_id_no: "H077", name: "Jiyalal Sukhdeve", designation: "Security Guard", department: "Security", role: "Support Staff", is_active: true }
];

/**
 * Function to sync staff to Supabase
 */
export const syncStaffToDatabase = async () => {
  console.log('Syncing staff to database...');
  for (const staff of staffMaster) {
    try {
      const { data: existing } = await supabase
        .from('nabh_team_members')
        .select('id')
        .eq('name', staff.name)
        .maybeSingle();

      if (existing) {
        await supabase
          .from('nabh_team_members')
          .update({ emp_id_no: staff.emp_id_no, designation: staff.designation, department: staff.department } as never)
          .eq('name', staff.name);
        continue;
      }

      const { error } = await supabase
        .from('nabh_team_members')
        .insert({
          name: staff.name,
          designation: staff.designation,
          department: staff.department,
          role: staff.role,
          emp_id_no: staff.emp_id_no,
          is_active: staff.is_active,
          responsibilities: []
        } as never);

      if (error) throw error;
    } catch (err) {
      console.error(`Error adding staff ${staff.name}:`, err);
    }
  }
  return { success: true };
};

export default staffMaster;

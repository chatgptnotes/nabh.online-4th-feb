import { migrateDataToNormalizedSchema } from '../services/objectiveStorage';

/**
 * Complete AAC Chapter data extracted from NABH SHCO documentation
 */
export const aacChapterData = {
  chapters: [
    {
      chapter_number: 1,
      name: 'AAC',
      description: 'Access, Assessment and Continuity of Care',
      standards: [
        {
          standard_number: '1',
          name: 'Healthcare Services Definition',
          description: 'The organization defines and displays the healthcare services that it provides.',
          elements: [
            {
              element_number: 'a',
              description: 'The healthcare services being provided are defined and are in consonance with the needs of the community.',
              interpretation: 'Hospital must conduct community health needs assessment and ensure services align with identified needs. Document service scope and rationale.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Conduct community needs assessment and document service alignment',
            },
            {
              element_number: 'b',
              description: 'Each defined healthcare service should have diagnostic and treatment services with suitably qualified personnel who provide out-patient, in-patient and emergency cover.',
              interpretation: 'Ensure adequate staffing with appropriate qualifications for all service areas. Maintain 24/7 coverage for emergency services.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Review staffing patterns and qualifications for all services',
            },
            {
              element_number: 'c',
              description: 'Scope of healthcare services of each department is defined.',
              interpretation: 'Create detailed scope of service documents for each department outlining capabilities, limitations, and protocols.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop department-wise service scope documents',
            },
            {
              element_number: 'd',
              description: 'The organization\'s defined healthcare services are prominently displayed.',
              interpretation: 'Install clear signage and information boards displaying all available services in patient and visitor areas.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Create and install service display boards and signage',
            }
          ]
        },
        {
          standard_number: '2',
          name: 'Registration, Admission and Transfer Process',
          description: 'The organization has a well-defined registration, admission and transfer process.',
          elements: [
            {
              element_number: 'a',
              description: 'There is a documented process for registration of patients.',
              interpretation: 'Establish comprehensive patient registration procedures including identity verification, insurance processing, and documentation requirements.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Document patient registration process and train staff',
            },
            {
              element_number: 'b',
              description: 'There is a documented process for admission of patients.',
              interpretation: 'Create standardized admission procedures including bed allocation, initial assessment, and documentation protocols.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop admission process documentation and workflows',
            },
            {
              element_number: 'c',
              description: 'There is a documented process for transfer of patients.',
              interpretation: 'Establish protocols for internal transfers between departments and external transfers to other facilities.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Create transfer protocols and communication procedures',
            },
            {
              element_number: 'd',
              description: 'The processes are understood by all concerned staff.',
              interpretation: 'Provide comprehensive training to all staff involved in registration, admission, and transfer processes.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Conduct staff training and maintain competency records',
            }
          ]
        },
        {
          standard_number: '3',
          name: 'Patient Assessment and Re-assessment',
          description: 'Patients cared for by the organization undergo an established initial assessment and regular re-assessment.',
          elements: [
            {
              element_number: 'a',
              description: 'There is a documented process for initial assessment of patients.',
              interpretation: 'Establish comprehensive initial assessment protocols including medical history, physical examination, and risk assessment.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop initial assessment protocols and forms',
            },
            {
              element_number: 'b',
              description: 'There is a documented process for re-assessment of patients.',
              interpretation: 'Create protocols for regular patient reassessment including frequency, parameters, and documentation requirements.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Establish reassessment schedules and monitoring protocols',
            },
            {
              element_number: 'c',
              description: 'The assessment processes are followed by all concerned staff.',
              interpretation: 'Ensure all clinical staff are trained on assessment protocols and compliance is monitored.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Train staff and implement compliance monitoring',
            }
          ]
        },
        {
          standard_number: '4',
          name: 'Laboratory Services',
          description: 'Laboratory services are provided as per the scope of services of the organization and adhere to best practices.',
          elements: [
            {
              element_number: 'a',
              description: 'Laboratory services are available as per the scope of services.',
              interpretation: 'Ensure laboratory services match the defined scope and are available when needed for patient care.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Review lab service availability and scope alignment',
            },
            {
              element_number: 'b',
              description: 'Laboratory services follow established protocols and best practices.',
              interpretation: 'Implement quality control measures, standard operating procedures, and best practice guidelines.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop lab SOPs and quality control protocols',
            }
          ]
        },
        {
          standard_number: '5',
          name: 'Imaging Services',
          description: 'Imaging services are provided as per the scope of services of the organization and adhere to best practices.',
          elements: [
            {
              element_number: 'a',
              description: 'Imaging services are available as per the scope of services.',
              interpretation: 'Ensure imaging services match the defined scope and equipment is properly maintained and calibrated.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Review imaging service availability and equipment status',
            },
            {
              element_number: 'b',
              description: 'Imaging services follow established protocols and best practices.',
              interpretation: 'Implement radiation safety protocols, quality assurance programs, and best practice guidelines.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop imaging SOPs and safety protocols',
            }
          ]
        },
        {
          standard_number: '6',
          name: 'Laboratory and Imaging Safety Programme',
          description: 'There is an established safety programme in the laboratory and imaging services.',
          elements: [
            {
              element_number: 'a',
              description: 'There is a documented safety programme for laboratory services.',
              interpretation: 'Establish comprehensive lab safety protocols including chemical safety, infection control, and waste management.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop laboratory safety program and protocols',
            },
            {
              element_number: 'b',
              description: 'There is a documented safety programme for imaging services.',
              interpretation: 'Implement radiation safety protocols, protective equipment requirements, and exposure monitoring.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Create imaging safety program and radiation protection protocols',
            },
            {
              element_number: 'c',
              description: 'Safety programmes are implemented and monitored.',
              interpretation: 'Ensure safety protocols are followed, conduct regular safety audits, and maintain incident reporting systems.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Implement safety monitoring and audit procedures',
            }
          ]
        },
        {
          standard_number: '7',
          name: 'Continuous Multidisciplinary Care',
          description: 'Patient care is continuous and multidisciplinary in nature.',
          elements: [
            {
              element_number: 'a',
              description: 'There are documented processes for continuous patient care.',
              interpretation: 'Establish protocols for seamless patient care across shifts, departments, and care transitions.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop continuous care protocols and handover procedures',
            },
            {
              element_number: 'b',
              description: 'There are documented processes for multidisciplinary care.',
              interpretation: 'Create multidisciplinary team structures, communication protocols, and care coordination mechanisms.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Establish multidisciplinary team protocols and coordination systems',
            }
          ]
        },
        {
          standard_number: '8',
          name: 'Discharge Process',
          description: 'The organization has an established discharge process, and defines the content of the discharge summary.',
          elements: [
            {
              element_number: 'a',
              description: 'There is a documented discharge process.',
              interpretation: 'Establish comprehensive discharge procedures including planning, patient education, and follow-up arrangements.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Develop discharge planning process and protocols',
            },
            {
              element_number: 'b',
              description: 'The content of discharge summary is defined.',
              interpretation: 'Standardize discharge summary format including diagnosis, treatment, medications, and follow-up instructions.',
              is_core: false,
              status: 'Not Started' as const,
              assignee: '',
              evidence_links: '',
              notes: 'Create standardized discharge summary template and requirements',
            }
          ]
        }
      ]
    }
  ]
};

/**
 * Function to migrate AAC data to the normalized schema
 * Usage: Call this function to insert the AAC chapter data
 */
export async function migrateAACData() {
  console.log('Starting AAC data migration to normalized schema...');
  
  const result = await migrateDataToNormalizedSchema(aacChapterData);
  
  if (result.success) {
    console.log('AAC Migration completed successfully!');
    console.log('Statistics:', result.stats);
    console.log(`Inserted: ${result.stats?.chapters} chapters, ${result.stats?.standards} standards, ${result.stats?.elements} elements`);
  } else {
    console.error('AAC Migration failed:', result.error);
  }
  
  return result;
}

/**
 * Generic function to migrate any data to the normalized schema
 */
export async function migrateData(data: typeof aacChapterData) {
  console.log('Starting data migration to normalized schema...');
  
  const result = await migrateDataToNormalizedSchema(data);
  
  if (result.success) {
    console.log('Migration completed successfully!');
    console.log('Statistics:', result.stats);
    console.log(`Inserted: ${result.stats?.chapters} chapters, ${result.stats?.standards} standards, ${result.stats?.elements} elements`);
  } else {
    console.error('Migration failed:', result.error);
  }
  
  return result;
}

/**
 * Instructions for using this migration helper:
 * 
 * 1. Replace `sampleNABHData` with your actual NABH data
 * 2. Make sure your data follows the same structure:
 *    - chapters: Array of chapter objects with chapter_number, name, description, and standards
 *    - standards: Array of standard objects with standard_number, name, description, and elements  
 *    - elements: Array of element objects with all required fields
 * 
 * 3. Call migrateYourData() from the browser console or create a migration component
 * 
 * 4. Once data is migrated, update your store to use loadFromNormalizedSchema() instead of loadDataFromSupabase()
 * 
 * Example of calling from browser console:
 * ```
 * import { migrateYourData } from './src/utils/dataMigrationHelper';
 * migrateYourData().then(result => console.log(result));
 * ```
 */
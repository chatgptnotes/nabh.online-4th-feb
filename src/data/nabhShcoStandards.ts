/**
 * NABH SHCO (Small Healthcare Organizations) Standards - 3rd Edition
 * Released: 31st August 2022
 * Effective: 1st August 2022
 *
 * Total: 10 Chapters, 71 Standards, 408 Objective Elements
 * - Core (C): 100 elements - Mandatorily assessed during each assessment
 * - Commitment (CM): 257 elements - Assessed during final assessment
 * - Achievement (A): 35 elements - Assessed during surveillance
 * - Excellence (E): 16 elements - Assessed during re-accreditation
 *
 * Sources:
 * - NABH Official Portal: https://nabh.co/shco/
 * - NABH SHCO Standards 3rd Edition PDF
 */

export type ElementCategory = 'Core' | 'Commitment' | 'Achievement' | 'Excellence';

export interface ObjectiveElement {
  code: string;
  description: string;
  category: ElementCategory;
  isCore: boolean;
}

export interface Standard {
  code: string;
  title: string;
  intent?: string;
  objectiveElements: ObjectiveElement[];
}

export interface Chapter {
  code: string;
  name: string;
  fullName: string;
  type: 'Patient Centered' | 'Organization Centered';
  standards: Standard[];
}

export const nabhShcoStandards: Chapter[] = [
  // ============================================
  // CHAPTER 1: ACCESS, ASSESSMENT AND CONTINUITY OF CARE (AAC)
  // ============================================
  {
    code: 'AAC',
    name: 'AAC',
    fullName: 'Access, Assessment and Continuity of Care',
    type: 'Patient Centered',
    standards: [
      {
        code: 'AAC.1',
        title: 'The organization defines and displays the healthcare services that it provides.',
        intent: 'To ensure patients and community are aware of services available at the healthcare facility.',
        objectiveElements: [
          {
            code: 'AAC.1.a',
            description: 'The healthcare services being provided are defined and are in consonance with the needs of the community.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.1.b',
            description: 'Each defined healthcare service should have diagnostic and treatment services with suitably qualified personnel who provide out-patient, in-patient and emergency cover.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.1.c',
            description: 'Scope of healthcare services of each department is defined.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.1.d',
            description: 'The organization\'s defined healthcare services are prominently displayed.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.2',
        title: 'The organization has a well-defined registration, admission and transfer process.',
        intent: 'To ensure smooth patient flow from registration to admission with proper documentation.',
        objectiveElements: [
          {
            code: 'AAC.2.a',
            description: 'The organization has a mechanism for registering and admitting patients.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.2.b',
            description: 'A unique identification number is generated at the end of registration.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'AAC.2.c',
            description: 'Patients are accepted only if the organization can provide the required service.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.2.d',
            description: 'The organization has a mechanism to address management of patients during non-availability of beds.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.2.e',
            description: 'Access to the healthcare services in the organization is prioritized according to the clinical needs of the patient.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'AAC.2.f',
            description: 'Transfer–in and transfer-out / referral of patients to the organization is done appropriately.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.3',
        title: 'Patients cared for by the organization undergo an established initial assessment and regular re-assessment.',
        intent: 'To ensure comprehensive initial patient assessment for appropriate care planning.',
        objectiveElements: [
          {
            code: 'AAC.3.a',
            description: 'The initial assessment for the out–patients, day-care, in-patients and emergency patients is done.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'AAC.3.b',
            description: 'The initial assessment results in a documented care plan.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'AAC.3.c',
            description: 'Patients are reassessed at appropriate intervals to determine their response to treatment and to plan further treatment or discharge.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'AAC.3.d',
            description: 'Out-patients are informed of their next follow-up, where appropriate.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.3.e',
            description: 'The organization lays down guidelines and implements processes to identify early warning signs of change or deterioration in clinical conditions for initiating prompt intervention.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.4',
        title: 'Laboratory services are provided as per the scope of services of the organization and adhere to best practices.',
        intent: 'To ensure availability of quality laboratory services for patient care.',
        objectiveElements: [
          {
            code: 'AAC.4.a',
            description: 'Scope of the laboratory services is commensurate to the services provided by the organization.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.b',
            description: 'The infrastructure (physical and equipment) and human resources are adequate to provide the defined scope of services.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.c',
            description: 'Requisition for tests, collection, identification, handling, safe transportation, processing and disposal of specimens is performed according to written guidance.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.d',
            description: 'Laboratory results are available within a defined time frame.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.e',
            description: 'Critical results are intimated to the person concerned at the earliest.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.f',
            description: 'Laboratory tests not available in the organization are outsourced to organization(s) based on their quality assurance system.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.g',
            description: 'The laboratory quality assurance programme is implemented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.4.h',
            description: 'The programme includes periodic calibration and maintenance of all equipment.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.5',
        title: 'Imaging services are provided as per the scope of services of the organization and adhere to best practices.',
        intent: 'To ensure availability of quality imaging services for patient diagnosis.',
        objectiveElements: [
          {
            code: 'AAC.5.a',
            description: 'Imaging services comply with legal and other requirements.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'AAC.5.b',
            description: 'Scope of the imaging services is commensurate to the services provided by the organization.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.5.c',
            description: 'The infrastructure (physical and equipment) and human resources are adequate to provide for its defined scope of services.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.5.d',
            description: 'Imaging results are available in the standardised manner within a defined time frame.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.5.e',
            description: 'Critical results are intimated immediately to the personnel concerned.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.5.f',
            description: 'Imaging tests not available in the organization are outsourced to organization(s) based on their quality assurance system.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.5.g',
            description: 'The quality assurance programme for imaging services is implemented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.5.h',
            description: 'The programme addresses periodic internal / external peer review of imaging protocols and results using appropriate sampling.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'AAC.5.i',
            description: 'The programme includes periodic calibration and maintenance of all equipment.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.6',
        title: 'There is an established safety programme in the laboratory and imaging services.',
        intent: 'To ensure accuracy, reliability and safety of laboratory and imaging services.',
        objectiveElements: [
          {
            code: 'AAC.6.a',
            description: 'The laboratory-safety programme is implemented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.6.b',
            description: 'Laboratory personnel are appropriately trained in safe practices and are provided with appropriate safety measures.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.6.c',
            description: 'Patients are appropriately screened for safety / risk before imaging.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.6.d',
            description: 'Imaging personnel and patients use appropriate radiation safety and monitoring devices where applicable, and are trained in imaging safety practices and radiation-safety measures.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.6.e',
            description: 'Imaging signage is prominently displayed in all appropriate locations.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.7',
        title: 'Patient care is continuous and multidisciplinary in nature.',
        intent: 'To ensure continuity and coordination of care across departments.',
        objectiveElements: [
          {
            code: 'AAC.7.a',
            description: 'During all phases of care, there is a qualified individual identified as responsible for the patient\'s care.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.7.b',
            description: 'Information about the patient\'s care and response to treatment is shared among medical, nursing and other care-providers, including referrals to other departments.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.7.c',
            description: 'The organization implements standardised hand-over communication during each staffing shift, between shifts and during transfers between units/ departments.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'AAC.7.d',
            description: 'Patient transfer within the organization is done safely.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'AAC.8',
        title: 'The organization has an established discharge process, and defines the content of the discharge summary.',
        intent: 'To ensure safe discharge with appropriate planning and education.',
        objectiveElements: [
          {
            code: 'AAC.8.a',
            description: 'A discharge summary is given to all the patients leaving the organization (including patients leaving against medical advice).',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.8.b',
            description: 'Discharge summary contains the patient\'s name, unique identification number, date of admission and date of discharge.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.8.c',
            description: 'Discharge summary contains the reasons for admission, significant findings and diagnosis, the patient\'s condition at the time of discharge, information regarding investigation results, any procedure performed, medication administered and other treatment given.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.8.d',
            description: 'Discharge summary contains follow-up advice, medication and other instructions in an understandable manner.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.8.e',
            description: 'Discharge summary incorporates instructions about when and how to obtain urgent care.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'AAC.8.f',
            description: 'In case of death, the summary of the case also includes the cause of death.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'AAC.8.g',
            description: 'The organisation adheres to planned discharge and identify special needs regarding care following discharge.',
            category: 'Excellence',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 2: CARE OF PATIENTS (COP)
  // ============================================
  {
    code: 'COP',
    name: 'COP',
    fullName: 'Care of Patients',
    type: 'Patient Centered',
    standards: [
      {
        code: 'COP.1',
        title: 'Uniform care to patients is provided in all settings of the organization and is guided by written guidance, and the applicable laws and regulations.',
        intent: 'To ensure uniform, evidence-based care across all settings with proper documentation and legal compliance.',
        objectiveElements: [
          {
            code: 'COP.1.a',
            description: 'The organization has a uniform process for identification of patients and at a minimum, uses two identifiers.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.1.b',
            description: 'Care shall be provided in consonance with applicable laws and regulations.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.1.c',
            description: 'The organization adopts evidence-based clinical practice guidelines and/or clinical protocols to guide uniform patient care.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'COP.1.d',
            description: 'Care delivery is uniform for a given clinical condition when similar care is provided in more than one setting.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.1.e',
            description: 'Telemedicine facility is provided safely and securely based on written guidance.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.2',
        title: 'Emergency services including ambulance, and management of disasters, are provided in accordance with written guidance, applicable laws and regulations.',
        intent: 'To ensure comprehensive emergency care with proper infrastructure, personnel, and disaster management.',
        objectiveElements: [
          {
            code: 'COP.2.a',
            description: 'There shall be an identified area in the organization, which is easily accessible to receive and manage emergency patients, with adequate and appropriate resources.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.b',
            description: 'The organization manages medico-legal cases and provides emergency care in consonance with statutory requirements and in accordance with written guidance.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.2.c',
            description: 'Initiation of appropriate care is guided by a system of triage.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.d',
            description: 'Patients waiting in the emergency are reassessed as appropriate for the change in status.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.e',
            description: 'Admission, discharge to home or transfer to another organization is documented, and a discharge note shall be given to the patient.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.f',
            description: 'The organization shall implement a quality assurance programme.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'COP.2.g',
            description: 'The organization has systems in place for the management of patients found dead on arrival and patients who die within a few minutes of arrival.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.h',
            description: 'The organization has access to ambulance services commensurate with the scope of services provided by it.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.i',
            description: 'The ambulance(s) is fit for purpose, is operated by trained personnel, is appropriately equipped, and ensures that emergency medications are available in the ambulance.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.2.j',
            description: 'The emergency department identifies opportunities to initiate treatment at the earliest, when the patient is in transit to the organization.',
            category: 'Excellence',
            isCore: false
          },
          {
            code: 'COP.2.k',
            description: 'The organization manages potential community emergencies, epidemics and other disasters as per a documented plan.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.3',
        title: 'Cardio-pulmonary resuscitation services are provided uniformly across the organization.',
        intent: 'To ensure consistent and effective CPR services with proper equipment, training, and post-event analysis.',
        objectiveElements: [
          {
            code: 'COP.3.a',
            description: 'Resuscitation services are available to patients at all times.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.3.b',
            description: 'During cardiopulmonary resuscitation, assigned roles and responsibilities are complied with, and the events during cardiopulmonary resuscitation are recorded.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.3.c',
            description: 'The equipment and medications for use during cardiopulmonary resuscitation are available in various areas of the organization.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.3.d',
            description: 'A multidisciplinary committee does a post-event analysis of all cardiopulmonary resuscitations, and corrective and preventive measures are taken based on this.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.4',
        title: 'Nursing care is provided to patients in the organization in consonance with clinical protocols.',
        intent: 'To ensure quality nursing care aligned with overall patient care and documented properly.',
        objectiveElements: [
          {
            code: 'COP.4.a',
            description: 'Nursing care is aligned and integrated with overall patient care, and is documented in the patient record.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.4.b',
            description: 'Assignment of patient care is done as per current good clinical / nursing practice guidelines.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.4.c',
            description: 'Nurses are provided with appropriate and adequate equipment for providing safe and efficient nursing services.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.4.d',
            description: 'The organization develops and implements nursing clinical practice guidelines reflecting current standards of practice.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.5',
        title: 'Transfusion services are provided as per the scope of services of the organization, safely.',
        intent: 'To ensure safe blood transfusion services with proper consent, availability, and monitoring.',
        objectiveElements: [
          {
            code: 'COP.5.a',
            description: 'Transfusion services are commensurate with the services provided by the organization, and are governed by the applicable laws and regulations.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.5.b',
            description: 'Transfusion of blood and blood components is done safely.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.5.c',
            description: 'Blood and blood components are used rationally.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.5.d',
            description: 'Informed consent is obtained for transfusion of blood and blood products, and for donation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.5.e',
            description: 'Blood/blood components are available for use in emergency situations within a defined time frame.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.5.f',
            description: 'Post-transfusion form is collected, reactions if any identified and are analysed for corrective and preventive actions.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.6',
        title: 'Organization provides care in the intensive care and high dependency units, in a systematic manner.',
        intent: 'To ensure systematic ICU/HDU care with proper admission criteria, infection control, and end-of-life care.',
        objectiveElements: [
          {
            code: 'COP.6.a',
            description: 'The defined admission and discharge criteria for its intensive care and high dependency units are implemented, and defined procedures for the situation of bed shortages are followed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.6.b',
            description: 'The care is provided in intensive care and high dependency units based on written guidance by adequately available staff and equipment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.6.c',
            description: 'Infection control practices are documented and followed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.6.d',
            description: 'The organization shall implement a quality-assurance programme.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'COP.6.e',
            description: 'The organisation has a mechanism to counsel the patient and / or family periodically.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.6.f',
            description: 'End of life care is provided in a consistent manner in the organization, and is in consonance with legal requirements.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.7',
        title: 'Organization provides safe obstetric care.',
        intent: 'To ensure safe obstetric care including high-risk case management and neonatal care.',
        objectiveElements: [
          {
            code: 'COP.7.a',
            description: 'Obstetric services are organised and provided safely.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.7.b',
            description: 'The organization identifies and provides care to high risk obstetric cases with competent doctors and nurses, and where needed, refers them to another appropriate centre.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.7.c',
            description: 'Antenatal assessment also includes maternal nutrition.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.7.d',
            description: 'Appropriate peri-natal and post-natal monitoring is performed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.7.e',
            description: 'The organization caring for high risk obstetric cases has the human resources and facilities to take care of neonates of such cases.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.8',
        title: 'Organization provides safe paediatric services.',
        intent: 'To ensure safe paediatric care with age-specific competency and child protection measures.',
        objectiveElements: [
          {
            code: 'COP.8.a',
            description: 'Paediatric services are organised and provided safely.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.8.b',
            description: 'Neonatal care is in consonance with the national/ international guidelines.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.8.c',
            description: 'Those who care for children have age-specific competency.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.8.d',
            description: 'Provisions are made for special care of children.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.8.e',
            description: 'Patient assessment includes nutritional, growth, developmental and immunisation assessment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.8.f',
            description: 'The organization has measures in place to prevent child/neonate abduction and abuse.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.9',
        title: 'Procedural sedation is provided consistently and safely.',
        intent: 'To ensure safe procedural sedation with proper consent, monitoring, and discharge criteria.',
        objectiveElements: [
          {
            code: 'COP.9.a',
            description: 'Procedural sedation is administered in a consistent manner.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.9.b',
            description: 'Informed consent for administration of procedural sedation is obtained.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.9.c',
            description: 'Competent and trained persons perform and monitor sedation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.9.d',
            description: 'Intra-procedure monitoring includes at a minimum the heart rate, cardiac rhythm, respiratory rate, blood pressure, oxygen saturation, and level of sedation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.9.e',
            description: 'Post procedure monitoring is documented, and patients are discharged from the recovery area based on objective criteria.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.10',
        title: 'Anaesthesia services are provided consistently and safely.',
        intent: 'To ensure safe anaesthesia services with proper assessment, monitoring, and documentation.',
        objectiveElements: [
          {
            code: 'COP.10.a',
            description: 'Anaesthesia services are administered in a consistent and safe manner.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.10.b',
            description: 'The pre-anaesthesia assessment results in the formulation of an anaesthesia plan which is documented.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.10.c',
            description: 'A pre-induction assessment is performed and documented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.10.d',
            description: 'Informed consent for administration of anaesthesia, is obtained.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.10.e',
            description: 'Patients are monitored while under anaesthesia.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.10.f',
            description: 'Post anaesthesia monitoring is documented, and patients are discharged from the recovery area based on objective criteria.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.10.g',
            description: 'The type of anaesthesia and anaesthetic medications used are documented in the patient record.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.10.h',
            description: 'Intra-operative adverse anaesthesia events are recorded and monitored.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.11',
        title: 'Clinical procedures, as well as procedures in the operation theatre are performed in a safe and consistent manner.',
        intent: 'To ensure safe surgical and clinical procedures with proper consent, safety measures, and documentation.',
        objectiveElements: [
          {
            code: 'COP.11.a',
            description: 'Clinical procedures as well as procedures done in operation theatres are done in a consistent and safe manner.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.11.b',
            description: 'Surgical patients have a preoperative assessment, a documented pre-operative diagnosis, and pre-operative instructions provided before surgery and documented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.11.c',
            description: 'Informed consent is obtained by the doctor prior to the procedure.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.11.d',
            description: 'Care is taken to prevent adverse events like wrong site, wrong patient and wrong surgery.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.11.e',
            description: 'The procedure is done adhering to standard precautions.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.11.f',
            description: 'Procedures / operation notes, post procedure monitoring and post-operative care plan are documented accurately in the patient record.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.11.g',
            description: 'Appropriate facilities, equipment, instruments and supplies are available in the operating theatre.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.11.h',
            description: 'The organization shall implement a quality assurance programme.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'COP.11.i',
            description: 'The organ transplant program shall be in consonance with the legal requirements and shall be conducted ethically.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.11.j',
            description: 'The organization shall take measures to create awareness regarding organ donation.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'COP.12',
        title: 'The organization identifies and manages patients who are at higher risk of morbidity and mortality.',
        intent: 'To ensure identification and management of high-risk patients including fall risk, pressure ulcers, and DVT.',
        objectiveElements: [
          {
            code: 'COP.12.a',
            description: 'The organization identifies and manages vulnerable patients.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.12.b',
            description: 'The organization provides for a safe and secure environment for the vulnerable patient.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.12.c',
            description: 'The organization identifies and manages patients who are at risk of fall.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.12.d',
            description: 'The organization identifies and manages patients who are at risk of developing / worsening of pressure ulcers.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.12.e',
            description: 'The organization identifies and manages patients who are at risk of developing / worsening of developing deep vein thrombosis.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'COP.12.f',
            description: 'The organization identifies and manages patients who need restraints.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'COP.13',
        title: 'Pain management, rehabilitation services and nutritional therapy are provided to the patients in a safe, collaborative and consistent manner.',
        intent: 'To ensure comprehensive pain management, rehabilitation, and nutritional care for patients.',
        objectiveElements: [
          {
            code: 'COP.13.a',
            description: 'Patients in pain are effectively managed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.13.b',
            description: 'Pain alleviation measures or medications are initiated and titrated according to the patient\'s need and response.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.13.c',
            description: 'Scope of rehabilitation services at a minimum is commensurate to the services provided by the organization.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.13.d',
            description: 'Care providers collaboratively plan rehabilitation services.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.13.e',
            description: 'Patients admitted to the organization are screened for nutritional risk, and assessment is done for patients found at risk during nutritional screening.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'COP.13.f',
            description: 'The therapeutic diet is planned and provided collaboratively.',
            category: 'Commitment',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 3: MANAGEMENT OF MEDICATION (MOM)
  // ============================================
  {
    code: 'MOM',
    name: 'MOM',
    fullName: 'Management of Medication',
    type: 'Patient Centered',
    standards: [
      {
        code: 'MOM.1',
        title: 'Multidisciplinary committee guides pharmacy services and management of medication.',
        intent: 'To ensure safe and effective pharmacy operations.',
        objectiveElements: [
          {
            code: 'MOM.1.a',
            description: 'The organisation develops, updates and implements a list of medications appropriate for the patients and as per the scope of the organisation\'s clinical services.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.1.b',
            description: 'Pharmacy services and medication usage are implemented following written guidance through a multidisciplinary committee.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.1.c',
            description: 'The organisation adheres to the procedure for the acquisition of formulary medications and medications not listed in the formulary.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.1.d',
            description: 'There is a procedure to obtain medication when the pharmacy is closed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.1.e',
            description: 'Implantable prosthesis and medical devices are used in accordance with laid down criteria.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.1.f',
            description: 'The clinicians adhere to the current formulary.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'MOM.2',
        title: 'Medications are stored appropriately and are available where required.',
        intent: 'To ensure safe medication storage and availability.',
        objectiveElements: [
          {
            code: 'MOM.2.a',
            description: 'Medications are stored in a clean, safe and secure environment; and incorporating the manufacturer\'s recommendation(s).',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.2.b',
            description: 'Sound inventory control practices guide storage of the medications throughout the organisation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.2.c',
            description: 'The organisation defines a list and mechanism for storage of high-risk medication(s) including look - alike sound-alike medications.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.2.d',
            description: 'High-risk medications are stored in areas of the organisation where it is clinically necessary.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'MOM.2.e',
            description: 'The list of emergency medications is defined and is stored uniformly.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.2.f',
            description: 'Emergency medications are available all the time and are replenished promptly when used.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'MOM.3',
        title: 'Medications are prescribed safely and rationally.',
        intent: 'To ensure safe and appropriate medication prescribing.',
        objectiveElements: [
          {
            code: 'MOM.3.a',
            description: 'Medication prescription is in consonance with good practices/guidelines for the rational prescription of medications.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.3.b',
            description: 'The organisation adheres to the determined minimum requirements of a prescription.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.3.c',
            description: 'Drug allergies and previous adverse drug reactions are ascertained before prescribing.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.3.d',
            description: 'The organisation has a mechanism to assist the clinician in prescribing appropriate medication.',
            category: 'Excellence',
            isCore: false
          },
          {
            code: 'MOM.3.e',
            description: 'Implementation of verbal orders ensures safe medication management practices.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.3.f',
            description: 'Audit of medication orders/prescription is carried out to check for safe and rational prescription of medications.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'MOM.3.g',
            description: 'Corrective and/or preventive action(s) is taken based on the audit, where appropriate.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'MOM.3.h',
            description: 'Reconciliation of medications occurs at transition points of patient care.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'MOM.4',
        title: 'Medication orders are written in a uniform manner.',
        intent: 'To ensure standardized medication ordering.',
        objectiveElements: [
          {
            code: 'MOM.4.a',
            description: 'The organisation ensures that only authorised personnel write orders.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.4.b',
            description: 'Medication orders are written in a uniform location in the medical records, which also reflects the patient\'s name and unique identification number.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.4.c',
            description: 'Medication orders are legible, dated, timed and signed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.4.d',
            description: 'Medication orders contain the name of the medicine, route of administration, strength to be administered and frequency/time of administration.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'MOM.5',
        title: 'Medications are dispensed in a safe manner.',
        intent: 'To ensure accurate and safe medication dispensing.',
        objectiveElements: [
          {
            code: 'MOM.5.a',
            description: 'Dispensing of medications is done safely.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.5.b',
            description: 'Medication recalls are handled effectively.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.5.c',
            description: 'Near-expiry medications are handled effectively.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.5.d',
            description: 'Dispensed medications are labelled.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.5.e',
            description: 'High-risk medication orders are verified before dispensing.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.5.f',
            description: 'Return of medications to the pharmacy is addressed.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'MOM.6',
        title: 'Medications are administered safely.',
        intent: 'To ensure safe medication administration.',
        objectiveElements: [
          {
            code: 'MOM.6.a',
            description: 'Administration of medication is done in a safe manner.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.6.b',
            description: 'Prepared medication is labelled before preparation of a second drug.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.6.c',
            description: 'The patient is identified before administration.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.6.d',
            description: 'Medication is verified from the medication order and physically inspected before administration.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.6.e',
            description: 'Strength, route and timing is verified from the order before administration.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.6.f',
            description: 'Measures to avoid catheter and tubing mis-connections during medication administration are implemented.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.6.g',
            description: 'Medication administration is documented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.6.h',
            description: 'Measures to govern patient\'s self-administration of medications are implemented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.6.i',
            description: 'Measures to govern patient\'s medications brought from outside the organisation are implemented.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'MOM.7',
        title: 'Patients are monitored after medication administration.',
        intent: 'To detect and manage adverse drug events.',
        objectiveElements: [
          {
            code: 'MOM.7.a',
            description: 'Patients are monitored after medication administration.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.7.b',
            description: 'Medications are changed where appropriate based on the monitoring.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.7.c',
            description: 'The organisation captures near miss, medication error and adverse drug reaction.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'MOM.7.d',
            description: 'Near miss, medication error and adverse drug reaction are reported and analysed within a specified time frame.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.7.e',
            description: 'Corrective and/or preventive action(s) are taken based on the analysis.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'MOM.8',
        title: 'Narcotic drugs and psychotropic substances, chemotherapeutic agents and radioactive agents are used in a safe manner.',
        intent: 'To ensure safe handling and use of controlled substances.',
        objectiveElements: [
          {
            code: 'MOM.8.a',
            description: 'Narcotic drugs and psychotropic substances, chemotherapeutic agents and radioactive agents are used safely.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.8.b',
            description: 'Narcotic drugs and psychotropic substances, chemotherapeutic agents and radioactive agents are prescribed by appropriate caregivers.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.8.c',
            description: 'Narcotic drugs and psychotropic substances, chemotherapeutic agents and radioactive agents drugs are stored securely.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.8.d',
            description: 'Chemotherapy and radioactive agents are prepared properly and safely, and administered by qualified personnel.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.8.e',
            description: 'A proper record is kept of the usage, administration and disposal of narcotic drugs and psychotropic substances, chemotherapeutic agents and radioactive agents.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'MOM.9',
        title: 'Implantable prosthesis and medical devices are used in accordance with laid down criteria.',
        intent: 'To ensure safe use of implantable devices.',
        objectiveElements: [
          {
            code: 'MOM.9.a',
            description: 'Written guidance address procurement and usage of implantable prostheses.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.9.b',
            description: 'Patient and his/her family are counselled for the usage of the implantable prosthesis and medical devises including precautions if any.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'MOM.9.c',
            description: 'The batch and the serial number of the implantable prosthesis and medical devises are recorded in the patients\' medical records, the master logbook and the discharge summary.',
            category: 'Commitment',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 4: PATIENT RIGHTS AND EDUCATION (PRE)
  // ============================================
  {
    code: 'PRE',
    name: 'PRE',
    fullName: 'Patient Rights and Education',
    type: 'Patient Centered',
    standards: [
      {
        code: 'PRE.1',
        title: 'The organisation protects and promotes patient and family rights and informs them about their responsibilities during care.',
        intent: 'To ensure patients are aware of and exercise their rights.',
        objectiveElements: [
          {
            code: 'PRE.1.a',
            description: 'Patient and family rights and responsibilities are documented, displayed, and they are made aware of the same.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.1.b',
            description: 'Patient and family rights and responsibilities are actively promoted.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'PRE.1.c',
            description: 'The organisation protects patient and family rights.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.1.d',
            description: 'The organisation has a mechanism to report a violation of patient and family rights.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.1.e',
            description: 'Violation of patient and family rights are monitored, analysed and corrective/preventive action taken by the top leadership of the organisation.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'PRE.2',
        title: 'Patient and family rights support individual beliefs, values and involve the patient and family in decision-making processes.',
        intent: 'To respect patient autonomy and cultural values.',
        objectiveElements: [
          {
            code: 'PRE.2.a',
            description: 'Patients and family rights include respecting values and beliefs, any special preferences, cultural needs, and responding to requests for spiritual needs.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.b',
            description: 'Patient and family rights include respect for personal dignity and privacy during examination, procedures and treatment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.c',
            description: 'Patient and family rights include protection from neglect or abuse.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.d',
            description: 'Patient and family rights include treating patient information as confidential.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.2.e',
            description: 'Patient and family rights include the refusal of treatment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.f',
            description: 'Patient and family rights include a right to seek an additional opinion regarding clinical care.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.g',
            description: 'Patient and family rights include informed consent before the transfusion of blood and blood components, anaesthesia, surgery, initiation of any research protocol and any other invasive/high-risk procedures/treatment.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.2.h',
            description: 'Patient and family rights include a right to complain and information on how to voice a complaint.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.i',
            description: 'Patient and family rights include information on the expected cost of the treatment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.j',
            description: 'Patient and family rights include access to their clinical records.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.k',
            description: 'Patient and family rights include information on the name of the treating doctor, care plan, progress and information on their health care needs.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.l',
            description: 'Patient rights include determining what information regarding their care would be provided to self and family.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.m',
            description: 'The patient and/or family members are explained about the proposed care, including the risks, alternatives and benefits.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.n',
            description: 'The patient and/or family members are explained about the expected results and complications.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.2.o',
            description: 'The care plan is prepared and modified in consultation with the patient and/or family members.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'PRE.2.p',
            description: 'The patient and/or family members are provided multidisciplinary counselling when appropriate.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'PRE.3',
        title: 'Informed consent is obtained from the patient or family about their care.',
        intent: 'To ensure informed consent is obtained.',
        objectiveElements: [
          {
            code: 'PRE.3.a',
            description: 'The organisation obtains informed consent from the patient or family for situations where informed consent is required. Informed consent process adhered to statutory norms.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.3.b',
            description: 'Informed consent includes information regarding the procedure; it\'s risks, benefits, alternatives and as to who will perform the procedure in a language that they can understand.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.3.c',
            description: 'The organisation describes who can give consent when a patient is incapable of independent decision making and implements the same.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.3.d',
            description: 'Informed consent is taken by the person performing the procedure.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'PRE.4',
        title: 'Patient and families have a right to information, education and communication about their healthcare needs.',
        intent: 'To ensure patients receive appropriate health education.',
        objectiveElements: [
          {
            code: 'PRE.4.a',
            description: 'Patient and/or family are educated in a language and format that they can understand.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.4.b',
            description: 'Patient and/or family are educated about the safe and effective use of medication and the potential side effects of the medication, when appropriate.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.4.c',
            description: 'Patient and/or family are educated about food-drug interaction and about diet, nutrition and immunisations.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.4.d',
            description: 'Patient and/or family are educated about their specific disease process, complications and prevention strategies.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.4.e',
            description: 'Patient and/or family are educated about preventing healthcare associated infections.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.4.f',
            description: 'Communication with the patients and/or families is done effectively.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'PRE.5',
        title: 'Patients and families have a right to information on expected costs.',
        intent: 'To ensure transparency in healthcare costs.',
        objectiveElements: [
          {
            code: 'PRE.5.a',
            description: 'The patient and/or family members are made aware of the pricing policy in different settings (out-patient, emergency, ICU and in-patient).',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.5.b',
            description: 'The relevant tariff list is available to patients.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.5.c',
            description: 'The patient and/or family members are explained about the expected costs.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.5.d',
            description: 'Patient and/or family are informed about the financial implications when there is a change in the care plan.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'PRE.6',
        title: 'The organization has a mechanism to capture patient\'s feedback and to redress complaints.',
        intent: 'To ensure patient feedback is addressed appropriately.',
        objectiveElements: [
          {
            code: 'PRE.6.a',
            description: 'The organisation has a mechanism to capture feedback from patients, which includes patient satisfaction.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PRE.6.b',
            description: 'The organisation has a mechanism to capture the patient experience.',
            category: 'Excellence',
            isCore: false
          },
          {
            code: 'PRE.6.c',
            description: 'The organisation redresses patient complaints as per the defined mechanism. Patient and/or family members are made aware of the procedure for giving feedback and/or lodging complaints.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PRE.6.d',
            description: 'Feedback and complaints are reviewed and/or analysed within a defined time frame. Corrective and/or preventive action(s) are taken based on the analysis where appropriate.',
            category: 'Achievement',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 5: HOSPITAL INFECTION CONTROL (HIC)
  // ============================================
  {
    code: 'HIC',
    name: 'HIC',
    fullName: 'Hospital Infection Control',
    type: 'Patient Centered',
    standards: [
      {
        code: 'HIC.1',
        title: 'The organisation has a comprehensive and coordinated Hospital Infection Prevention and Control (HIC) programme aimed at reducing/eliminating risks to patients, visitors, providers of care and community.',
        intent: 'To establish a comprehensive infection control program.',
        objectiveElements: [
          {
            code: 'HIC.1.a',
            description: 'The hospital infection prevention and control programme is documented, which aims at preventing and reducing the risk of healthcare associated infections in the hospital.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.1.b',
            description: 'The infection prevention and control programme is reviewed based on infection control assessment tool.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'HIC.1.c',
            description: 'The organisation has a multidisciplinary infection control committee and an infection control team, which coordinate the implementation of all infection prevention and control activities.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.1.d',
            description: 'The organisation implements information, education and communication programme for infection prevention and control activities for the community and participates in managing community outbreaks and pandemics.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.1.e',
            description: 'The management makes available resources required for the infection control programme.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.1.f',
            description: 'Isolation/barrier nursing facilities are available.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'HIC.2',
        title: 'The organisation implements the infection prevention and control programme in clinical areas.',
        intent: 'To guide infection control activities in clinical settings.',
        objectiveElements: [
          {
            code: 'HIC.2.a',
            description: 'The organisation adheres to standard precautions at all times.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.2.b',
            description: 'The organisation adheres to hand-hygiene guidelines.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.2.c',
            description: 'The organisation adheres to transmission-based precautions.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.2.d',
            description: 'The organisation adheres to safe injection and infusion practices.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.2.e',
            description: 'Appropriate antimicrobial usage policy is established and documented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.2.f',
            description: 'The organisation implements the antimicrobial usage policy and monitors the rational use of antimicrobial agents.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.2.g',
            description: 'The organisation implements an antibiotic stewardship programme.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'HIC.3',
        title: 'The organisation implements the infection prevention and control programme in support services.',
        intent: 'To ensure infection control in support areas.',
        objectiveElements: [
          {
            code: 'HIC.3.a',
            description: 'The organisation has appropriate engineering controls to prevent infections.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.3.b',
            description: 'The organisation designs and implements a plan to reduce the risk of infection during construction and renovation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.3.c',
            description: 'The organisation adheres to housekeeping procedures.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.3.d',
            description: 'Biomedical waste (BMW) is handled appropriately and safely.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.3.e',
            description: 'The organisation adheres to laundry and linen management processes.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.3.f',
            description: 'The organisation adheres to kitchen sanitation and food-handling issues.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HIC.4',
        title: 'The organisation takes actions to prevent or reduce healthcare associated infections (HAI) in patients and staff working in the hospital.',
        intent: 'To reduce healthcare-associated infections.',
        objectiveElements: [
          {
            code: 'HIC.4.a',
            description: 'The organisation takes action to prevent catheter-associated urinary tract Infections.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.4.b',
            description: 'The organisation takes action to prevent infection-related ventilator associated complication/ventilator-associated pneumonia.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.4.c',
            description: 'The organisation takes action to prevent catheter linked blood stream infections.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.4.d',
            description: 'The organisation takes action to prevent surgical site infections.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.4.e',
            description: 'The organisation implements occupational health and safety practices to reduce the risk of transmitting microorganisms among health care providers.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.4.f',
            description: 'Appropriate post-exposure prophylaxis is provided to all staff members concerned.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HIC.5',
        title: 'The organisation performs surveillance to capture and monitor infection prevention and control data.',
        intent: 'To monitor and analyze infection data.',
        objectiveElements: [
          {
            code: 'HIC.5.a',
            description: 'The scope of surveillance incorporates tracking and analysing of infection risks, rates and trends.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.5.b',
            description: 'Surveillance includes monitoring compliance with hand-hygiene guidelines.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.5.c',
            description: 'Surveillance includes mechanisms to capture the occurrence of multi-drug-resistant organisms and highly virulent infections.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'HIC.5.d',
            description: 'The organisation identifies and takes appropriate action to control outbreaks of infections.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.5.e',
            description: 'Surveillance activities include monitoring the effectiveness of the housekeeping services.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.5.f',
            description: 'Surveillance data is analysed, and appropriate corrective and preventive actions are taken and feedback regarding the same is provided regularly to the appropriate health care team.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HIC.6',
        title: 'Infection prevention measures include sterilisation and/or disinfection of instruments, equipment and devices.',
        intent: 'To ensure effective sterilization of equipment and supplies.',
        objectiveElements: [
          {
            code: 'HIC.6.a',
            description: 'The organisation provides adequate space and appropriate zoning for sterilisation activities.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.6.b',
            description: 'Cleaning, packing, disinfection and/or sterilisation, storing and the issue of items is done as per the written guidance.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HIC.6.c',
            description: 'Reprocessing of single-use instruments, equipment and devices are done as per written guidance.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.6.d',
            description: 'Regular validation tests for sterilisation are carried out and documented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HIC.6.e',
            description: 'The established recall procedure is implemented when a breakdown in the sterilisation system is identified.',
            category: 'Commitment',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 6: PATIENT SAFETY AND QUALITY IMPROVEMENT (PSQ)
  // ============================================
  {
    code: 'PSQ',
    name: 'PSQ',
    fullName: 'Patient Safety and Quality Improvement',
    type: 'Organization Centered',
    standards: [
      {
        code: 'PSQ.1',
        title: 'The organisation implements a patient-safety programme and a structured quality improvement programme.',
        intent: 'To establish a systematic approach to patient safety and quality improvement.',
        objectiveElements: [
          {
            code: 'PSQ.1.a',
            description: 'The patient safety programme is developed, implemented and maintained by a multi-disciplinary committee.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.1.b',
            description: 'The patient-safety programme identifies opportunities for improvement based on review at pre-defined intervals.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.1.c',
            description: 'The organisation performs proactive analysis of patient safety risks and makes improvement accordingly.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.1.d',
            description: 'The organisation adapts and implements national/international patient-safety goals/solutions.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.1.e',
            description: 'A comprehensive quality improvement programme is developed, implemented and maintained by a multi-disciplinary committee.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.1.f',
            description: 'There is a designated individual for coordinating and implementing the quality improvement programme.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.1.g',
            description: 'The quality improvement programme identifies opportunities for improvement based on review at pre-defined intervals.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.1.h',
            description: 'Audits are conducted at regular intervals as a means of continuous monitoring.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.1.i',
            description: 'There is an established process in the organisation to monitor and improve quality of nursing care.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'PSQ.2',
        title: 'The organisation identifies key indicators to monitor the structures, processes and outcomes which are used as tools for continual improvement.',
        intent: 'To measure and monitor organizational performance.',
        objectiveElements: [
          {
            code: 'PSQ.2.a',
            description: 'The organisation identifies and monitors key indicators to oversee the clinical structures, processes and outcomes.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.2.b',
            description: 'The organisation identifies and monitors the key indicators to oversee infection control activities.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.2.c',
            description: 'The organisation identifies and monitors the key indicators to oversee the managerial structures, processes and outcomes.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.2.d',
            description: 'The organisation identifies and monitors the key indicators to oversee patient safety activities.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.2.e',
            description: 'Data is regularly verified by the quality team and is analysed to identify the opportunities for improvement.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'PSQ.3',
        title: 'There is an established system for clinical audit and quality improvement programmes.',
        intent: 'To systematically review and improve patient care.',
        objectiveElements: [
          {
            code: 'PSQ.3.a',
            description: 'Clinical audits are performed to improve the quality of patient care and documented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.3.b',
            description: 'The parameters to be audited are defined by the organisation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.3.c',
            description: 'Medical and nursing staff participates in this system.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.3.d',
            description: 'Remedial measures are implemented.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.3.e',
            description: 'The organisation undertakes quality improvement projects.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'PSQ.4',
        title: 'The patient safety and quality improvement programme are supported by the management.',
        intent: 'To ensure management support for quality and safety.',
        objectiveElements: [
          {
            code: 'PSQ.4.a',
            description: 'The management creates a culture of safety.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'PSQ.4.b',
            description: 'The leaders at all levels in the organisation are aware of the intent of the patient safety quality improvement program and the approach to its implementation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.4.c',
            description: 'The management makes available adequate resources required for patient safety and quality improvement programme, earmarks adequate funds from its annual budget in this regard.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.4.d',
            description: 'The management uses the feedback obtained from the workforce to improve patient safety and quality improvement programme.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'PSQ.5',
        title: 'Incidents are collected and analysed to ensure continual quality improvement.',
        intent: 'To learn from incidents and near-misses.',
        objectiveElements: [
          {
            code: 'PSQ.5.a',
            description: 'The organisation implements an incident management system.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'PSQ.5.b',
            description: 'The organisation has a mechanism to identify sentinel events.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.5.c',
            description: 'The organisation has an established process for analysis of incidents.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.5.d',
            description: 'Corrective and preventive actions are taken based on the findings of such analysis.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'PSQ.5.e',
            description: 'The organization shall have a process for informing various stakeholders in case of a near miss / adverse event / sentinel event.',
            category: 'Excellence',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 7: RESPONSIBILITIES OF MANAGEMENT (ROM)
  // ============================================
  {
    code: 'ROM',
    name: 'ROM',
    fullName: 'Responsibilities of Management',
    type: 'Organization Centered',
    standards: [
      {
        code: 'ROM.1',
        title: 'The organisation identifies those responsible for governance and their roles are defined.',
        intent: 'To ensure clear governance structure and accountability.',
        objectiveElements: [
          {
            code: 'ROM.1.a',
            description: 'Those responsible for governance are identified, and their roles and responsibilities are defined and documented.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'ROM.1.b',
            description: 'Those responsible for governance lay down the organisation\'s vision, mission and values and make them public.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.1.c',
            description: 'Those responsible for governance monitor and measure the performance of the organisation against the stated mission.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'ROM.1.d',
            description: 'Those responsible for governance appoint the senior leaders in the organisation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.1.e',
            description: 'Those responsible for governance support the ethical management framework of the organisation.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'ROM.2',
        title: 'The organisation is headed by a leader who shall be responsible for operating the organisation on a day-to-day basis.',
        intent: 'To ensure competent leadership.',
        objectiveElements: [
          {
            code: 'ROM.2.a',
            description: 'The person heading the organisation has requisite and appropriate administrative qualifications.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.2.b',
            description: 'The person heading the organisation has requisite and appropriate administrative experience.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.2.c',
            description: 'The leader is responsible for and complies with the laid-down and applicable legislations, regulations and notifications.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'ROM.2.d',
            description: 'The performance of the organisation\'s leader is reviewed for effectiveness.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'ROM.3',
        title: 'The organisation displays professionalism in its functioning.',
        intent: 'To ensure professional management practices.',
        objectiveElements: [
          {
            code: 'ROM.3.a',
            description: 'Those responsible for governance approve the strategic and operational plans and the organisation\'s annual budget.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.3.b',
            description: 'The organisation coordinates the functioning with departments and external agencies and monitors the progress in achieving the defined goals and objectives.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'ROM.3.c',
            description: 'The functioning of committees is reviewed for their effectiveness.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.3.d',
            description: 'The organisation documents the service standards that are measurable and monitors them.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'ROM.3.e',
            description: 'The organization documents staff rights and responsibilities.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'ROM.4',
        title: 'Management ensures that patient-safety aspects and risk-management issues are an integral part of patient care and hospital management.',
        intent: 'To integrate safety and risk management into organizational culture.',
        objectiveElements: [
          {
            code: 'ROM.4.a',
            description: 'Management ensures proactive risk management across the organisation.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'ROM.4.b',
            description: 'Management ensures integration between quality improvement, risk management and strategic planning within the organisation.',
            category: 'Excellence',
            isCore: false
          },
          {
            code: 'ROM.4.c',
            description: 'Management ensures implementation of systems for internal and external reporting of system and process failures.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'ROM.4.d',
            description: 'Management ensures that it has a documented agreement for all outsourced services that include service parameters.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'ROM.4.e',
            description: 'Management monitors the quality of the outsourced services and improvements are made as required.',
            category: 'Achievement',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 8: FACILITY MANAGEMENT AND SAFETY (FMS)
  // ============================================
  {
    code: 'FMS',
    name: 'FMS',
    fullName: 'Facility Management and Safety',
    type: 'Organization Centered',
    standards: [
      {
        code: 'FMS.1',
        title: 'The organisation\'s environment and facilities operate in a planned manner and promotes environment-friendly measures.',
        intent: 'To ensure planned facility operations and environmental responsibility.',
        objectiveElements: [
          {
            code: 'FMS.1.a',
            description: 'Facilities and space provisions are appropriate to the scope of services.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.1.b',
            description: 'As-built and updated drawings are maintained as per statutory requirements.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.1.c',
            description: 'There are internal and external sign postings in the organisation in a manner understood by the patient, families and community.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.1.d',
            description: 'Potable water and electricity are available round the clock.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.1.e',
            description: 'Alternate sources for electricity and water are provided as a backup for any failure/shortage and their functioning is tested at a predefined frequency.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.1.f',
            description: 'The organisation takes initiatives towards an energy-efficient and environment friendly hospital.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'FMS.2',
        title: 'The organisation\'s environment and facilities operate to ensure the safety of patients, their families, staff and visitors.',
        intent: 'To provide a safe physical environment.',
        objectiveElements: [
          {
            code: 'FMS.2.a',
            description: 'Patient-safety devices and infrastructure are installed across the organisation and inspected periodically.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.2.b',
            description: 'The organisation has facilities for the differently-abled.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.2.c',
            description: 'Operational planning identifies areas which need to have extra security and describes access to different areas in the hospital by staff, patients, and visitors.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'FMS.2.d',
            description: 'Facility inspection rounds to ensure safety are conducted at least once a month.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.2.e',
            description: 'Organisation conducts electrical safety audits for the facility.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'FMS.2.f',
            description: 'There is a procedure which addresses the identification and disposal of material(s) not in use in the organisation.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.2.g',
            description: 'Hazardous materials are identified and used safely within the organisation.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'FMS.3',
        title: 'The organisation has a programme for medical and support service equipment management.',
        intent: 'To ensure proper equipment management and maintenance.',
        objectiveElements: [
          {
            code: 'FMS.3.a',
            description: 'The organisation plans for medical and support service equipment in accordance with its services and strategic plan.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.3.b',
            description: 'Medical equipment and support service equipment are inventoried, and proper logs are maintained as required.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.3.c',
            description: 'The documented operational and maintenance (preventive and breakdown) plan for medical and support service equipment is implemented.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.3.d',
            description: 'Medical and support service equipment are periodically inspected and calibrated for their proper functioning.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.3.e',
            description: 'Qualified and trained personnel operate and maintain medical and support service equipment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.3.f',
            description: 'There is monitoring of medical equipment and medical devices related to adverse events, and compliance hazard notices on recalls.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'FMS.3.g',
            description: 'Downtime for critical equipment breakdown is monitored from reporting to inspection and implementation of corrective actions.',
            category: 'Achievement',
            isCore: false
          }
        ]
      },
      {
        code: 'FMS.4',
        title: 'The organisation has a programme for medical gases, vacuum and compressed air.',
        intent: 'To ensure reliable utility services.',
        objectiveElements: [
          {
            code: 'FMS.4.a',
            description: 'Written guidance governs the implementation of procurement, handling, storage, distribution, usage and replenishment of medical gases.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.4.b',
            description: 'Medical gases are handled, stored, distributed and used in a safe manner.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.4.c',
            description: 'Alternate sources for medical gases, vacuum and compressed air are provided for, in case of failure and their functioning is tested at a predefined frequency.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.4.d',
            description: 'There is an operational, inspection, testing and maintenance plan for piped medical gas, compressed air and vacuum installation.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'FMS.5',
        title: 'The organisation has plans for fire and non-fire emergencies within the facilities.',
        intent: 'To ensure preparedness for internal emergencies.',
        objectiveElements: [
          {
            code: 'FMS.5.a',
            description: 'The organisation has plans and provisions for early detection, abatement and containment of the fire, and non-fire emergencies.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'FMS.5.b',
            description: 'The organisation has a documented and displayed exit plan in case of fire and non-fire emergencies.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.5.c',
            description: 'Mock drills are held at least twice a year.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.5.d',
            description: 'There is a maintenance plan for fire-related equipment and infrastructure.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'FMS.5.e',
            description: 'The organisation has a service continuity plan in case of fire and non-fire emergencies.',
            category: 'Achievement',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 9: HUMAN RESOURCE MANAGEMENT (HRM)
  // ============================================
  {
    code: 'HRM',
    name: 'HRM',
    fullName: 'Human Resource Management',
    type: 'Organization Centered',
    standards: [
      {
        code: 'HRM.1',
        title: 'The organisation has a documented system of human resource planning.',
        intent: 'To ensure adequate staffing.',
        objectiveElements: [
          {
            code: 'HRM.1.a',
            description: 'Human resource planning supports the organisation\'s current and future ability to meet the care, treatment and service needs of the patient.',
            category: 'Excellence',
            isCore: false
          },
          {
            code: 'HRM.1.b',
            description: 'Written guidance governs the process of recruitment.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.1.c',
            description: 'The organisation maintains an adequate number and mix of staff to meet the care, treatment and service needs of the patient.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.1.d',
            description: 'The organisation has contingency plans to manage long- and short-term workforce shortages, including unplanned shortages.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'HRM.1.e',
            description: 'The reporting relationships, job specification and job description are defined for each category of staff.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.1.f',
            description: 'The organisation performs a background check of new staff.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.1.g',
            description: 'The organisation defines and implements a code of conduct for its staff.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.1.h',
            description: 'Exit interviews are conducted and used as a tool to improve human resource practices.',
            category: 'Achievement',
            isCore: false
          },
          {
            code: 'HRM.1.i',
            description: 'Written guidance governs disciplinary and grievance handling mechanisms.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.2',
        title: 'Staff are provided induction training and on-going professional training for development.',
        intent: 'To orient new staff and ensure continuous professional development.',
        objectiveElements: [
          {
            code: 'HRM.2.a',
            description: 'Staff are provided with induction training.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.2.b',
            description: 'Written guidance governs training and development policy for the staff through an on-going programme for professional training and development of the staff.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.2.c',
            description: 'Staff are appropriately trained based on their specific job description.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.2.d',
            description: 'Staff involved in direct patient care are provided training on cardiopulmonary resuscitation at the time of induction and periodically thereafter.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.2.e',
            description: 'Evaluation of training effectiveness is done by the organisation.',
            category: 'Excellence',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.3',
        title: 'Staff are trained in safety and quality-related aspects.',
        intent: 'To ensure staff competency in safety and quality.',
        objectiveElements: [
          {
            code: 'HRM.3.a',
            description: 'Staff are trained in the organisation\'s safety programme.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.3.b',
            description: 'Staff are provided training in the detection, handling, minimisation and elimination of identified risks within the organisation\'s environment.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.3.c',
            description: 'Staff members are made aware of procedures to follow in the event of an incident.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.3.d',
            description: 'Staff are trained in occupational safety aspects.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.3.e',
            description: 'Staff are trained in the organisation\'s disaster management plan.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.3.f',
            description: 'Staff are trained in handling fire and non-fire emergencies.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.3.g',
            description: 'Staff are trained in the organisation\'s quality improvement programme.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.4',
        title: 'An appraisal system for evaluating the performance of staff exists as an integral part of the human resource management process.',
        intent: 'To assess and improve staff performance.',
        objectiveElements: [
          {
            code: 'HRM.4.a',
            description: 'Performance appraisal is done for staff within the organisation and staff are made aware of the same at the time of induction.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.4.b',
            description: 'Performance is evaluated based on pre-determined criteria.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.4.c',
            description: 'The appraisal system is used as a tool for further development.',
            category: 'Excellence',
            isCore: false
          },
          {
            code: 'HRM.4.d',
            description: 'Performance appraisal is carried out at defined intervals and is documented.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.5',
        title: 'The organisation promotes staff well-being and addresses their health and safety needs.',
        intent: 'To ensure staff health and safety.',
        objectiveElements: [
          {
            code: 'HRM.5.a',
            description: 'Staff well-being is promoted through identification of health problems of the staff, including occupational health hazards, in accordance with the organisation\'s policy.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.5.b',
            description: 'Health checks of staff are done at least once a year and the findings/results are documented.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.5.c',
            description: 'Organisation provides treatment to staff who sustain workplace-related injuries.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.5.d',
            description: 'The organisation has measures in place for preventing and handling workplace violence.',
            category: 'Core',
            isCore: true
          }
        ]
      },
      {
        code: 'HRM.6',
        title: 'There is documented personal information for each staff member.',
        intent: 'To maintain accurate staff records.',
        objectiveElements: [
          {
            code: 'HRM.6.a',
            description: 'Personal files are maintained with respect to all staff, and their confidentiality is ensured.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.6.b',
            description: 'The personal files contain personal information regarding the staff\'s qualification, job description, proof of formal engagement verification of credentials and health status.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.6.c',
            description: 'Records of in-service training and education are contained in the personal files.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.6.d',
            description: 'Personal files contain results of all evaluations and remarks.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.7',
        title: 'There is a process for credentialing and privileging of medical professionals, permitted to provide patient care without supervision.',
        intent: 'To ensure only qualified medical professionals provide care.',
        objectiveElements: [
          {
            code: 'HRM.7.a',
            description: 'Medical professionals permitted by law, regulation and the organisation to provide patient care without supervision are identified.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.7.b',
            description: 'The education, registration, training, experience and other information of medical professionals are identified, verified, documented and updated periodically.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.7.c',
            description: 'Medical professionals are granted privileges to admit and care for the patients in consonance with their qualification, training, experience and registration.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.7.d',
            description: 'The requisite services to be provided by the medical professionals are known to them as well as the various departments/units of the organisation.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.8',
        title: 'There is a process for credentialing and privileging of nursing professionals, permitted to provide patient care without supervision.',
        intent: 'To ensure only qualified nursing professionals provide care.',
        objectiveElements: [
          {
            code: 'HRM.8.a',
            description: 'Nursing staff permitted by law, regulation and the organisation to provide patient care without supervision are identified.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.8.b',
            description: 'The education, registration, training, experience and other information of nursing staff are identified, verified, documented and updated periodically.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.8.c',
            description: 'Nursing staff are granted privileges in consonance with their qualification, training, experience and registration.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.8.d',
            description: 'The requisite services to be provided by the nursing staff are known to them as well as the various departments/units of the organisation.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'HRM.9',
        title: 'There is a process for credentialing and privileging of para-clinical professionals, permitted to provide patient care without supervision.',
        intent: 'To ensure only qualified para-clinical professionals provide care.',
        objectiveElements: [
          {
            code: 'HRM.9.a',
            description: 'Para-clinical professionals permitted by law, regulation and the organisation to provide patient care without supervision are identified.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.9.b',
            description: 'The education, registration, training and experience of para-clinical professionals are appropriately verified, documented and updated periodically.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'HRM.9.c',
            description: 'Para-clinical professionals are granted privileges in consonance with their qualification, training, experience and registration.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'HRM.9.d',
            description: 'The requisite services to be provided by the para-clinical professionals are known to them as well as the various departments/units of the organisation.',
            category: 'Commitment',
            isCore: false
          }
        ]
      }
    ]
  },

  // ============================================
  // CHAPTER 10: INFORMATION MANAGEMENT SYSTEM (IMS)
  // ============================================
  {
    code: 'IMS',
    name: 'IMS',
    fullName: 'Information Management System',
    type: 'Organization Centered',
    standards: [
      {
        code: 'IMS.1',
        title: 'Information needs of the stakeholders are met and data is captured and analyzed appropriately.',
        intent: 'To establish an effective information management framework.',
        objectiveElements: [
          {
            code: 'IMS.1.a',
            description: 'The organization identifies, captures and disseminates the information needs of the patients, visitors, staff, management, external agencies and community.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.1.b',
            description: 'Information management and technology acquisitions and maintenance plan are in consonance with the identified information needs.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.1.c',
            description: 'The organisation stores and retrieves data according to its information needs.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.1.d',
            description: 'The organization contributes to external databases in accordance with the law and regulations.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.1.e',
            description: 'Processes for data collection are standardized and data is analysed to meet the information needs.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'IMS.2',
        title: 'The patients cared for by the organisation have a complete and accurate medical record.',
        intent: 'To ensure complete and accurate medical records.',
        objectiveElements: [
          {
            code: 'IMS.2.a',
            description: 'The unique identifier is assigned to the medical record.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.2.b',
            description: 'The contents of medical record are identified, documented and provides a complete, up-to-date and chronological account of patient care.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.2.c',
            description: 'Authorized staff make the entry in the medical record, author of the entry can be identified.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.2.d',
            description: 'Entry in the medical record is named, signed, dated and timed.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.2.e',
            description: 'The medical record has only authorised abbreviations.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'IMS.3',
        title: 'The medical record reflects the continuity of care.',
        intent: 'To ensure medical records support care continuity.',
        objectiveElements: [
          {
            code: 'IMS.3.a',
            description: 'The medical record contains information regarding reasons for admission, diagnosis and plan of care.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.3.b',
            description: 'The medical record contains the details of assessments, re-assessments, consultations, results of investigations, operative and other procedures, and the details of the care provided.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.3.c',
            description: 'When patient is transferred to another hospital, the medical record contains the details of the transfer.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.3.d',
            description: 'The medical record contains a copy of the discharge summary.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.3.e',
            description: 'In case of death, the medical record contains a copy of the cause of death certificate.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.3.f',
            description: 'Care providers have access to current and past medical record.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'IMS.4',
        title: 'The organisation maintains confidentiality, integrity and security of records, data and information.',
        intent: 'To ensure confidentiality and integrity of records.',
        objectiveElements: [
          {
            code: 'IMS.4.a',
            description: 'The organization maintains the confidentiality of records, data and information.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.4.b',
            description: 'The organization maintains the integrity of records, data and information.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.4.c',
            description: 'The organization maintains the security of records, data and information.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.4.d',
            description: 'The organization discloses privileged health information as authorized by patient and/ or as required by law.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.4.e',
            description: 'Request for access to information in the medical records by patients/physicians and other public agencies are addressed consistently.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'IMS.5',
        title: 'The organization ensures availability of current and relevant documents, records, data and information and provides for retention of the same.',
        intent: 'To ensure document control and retention.',
        objectiveElements: [
          {
            code: 'IMS.5.a',
            description: 'The organization has an effective process for document control.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.5.b',
            description: 'The organization retains patient\'s clinical records, data and information, according to its requirements.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.5.c',
            description: 'The retention process provides expected confidentiality and security.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.5.d',
            description: 'The destruction of medical records, data and information is in accordance with the laid-down policy.',
            category: 'Commitment',
            isCore: false
          }
        ]
      },
      {
        code: 'IMS.6',
        title: 'The organisation regularly carries out a review of medical records.',
        intent: 'To ensure regular audit and improvement of medical records.',
        objectiveElements: [
          {
            code: 'IMS.6.a',
            description: 'The medical records are reviewed periodically.',
            category: 'Core',
            isCore: true
          },
          {
            code: 'IMS.6.b',
            description: 'The review uses a representative sample of both active and discharged patients, based on statistical principles.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.6.c',
            description: 'The review is conducted by identified individuals.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.6.d',
            description: 'The review of records is based on identified parameters.',
            category: 'Commitment',
            isCore: false
          },
          {
            code: 'IMS.6.e',
            description: 'Appropriate corrective and preventive measures are undertaken on the deficiencies pointed out in the review.',
            category: 'Commitment',
            isCore: false
          }
        ]
      }
    ]
  }
];

// Helper functions
export const getAllObjectiveElements = (): ObjectiveElement[] => {
  const elements: ObjectiveElement[] = [];
  nabhShcoStandards.forEach(chapter => {
    chapter.standards.forEach(standard => {
      elements.push(...standard.objectiveElements);
    });
  });
  return elements;
};

export const getCoreElements = (): ObjectiveElement[] => {
  return getAllObjectiveElements().filter(e => e.isCore);
};

export const getCommitmentElements = (): ObjectiveElement[] => {
  return getAllObjectiveElements().filter(e => e.category === 'Commitment');
};

export const getAchievementElements = (): ObjectiveElement[] => {
  return getAllObjectiveElements().filter(e => e.category === 'Achievement');
};

export const getExcellenceElements = (): ObjectiveElement[] => {
  return getAllObjectiveElements().filter(e => e.category === 'Excellence');
};

export const getStatistics = () => {
  const allElements = getAllObjectiveElements();
  return {
    totalChapters: nabhShcoStandards.length,
    totalStandards: nabhShcoStandards.reduce((acc, ch) => acc + ch.standards.length, 0),
    totalElements: allElements.length,
    coreElements: allElements.filter(e => e.category === 'Core').length,
    commitmentElements: allElements.filter(e => e.category === 'Commitment').length,
    achievementElements: allElements.filter(e => e.category === 'Achievement').length,
    excellenceElements: allElements.filter(e => e.category === 'Excellence').length,
  };
};

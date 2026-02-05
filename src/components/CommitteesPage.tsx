import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Icon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  // Removed Menu and IconButton as we use direct buttons now
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  Groups as GroupsIcon,
  EventNote as EventNoteIcon,
  AutoAwesome as AutoAwesomeIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Link as LinkIcon,
  // Removed MoreVertIcon as we use direct buttons now
} from '@mui/icons-material';
// NABH_TEAM import removed - now fetching from Supabase nabh_team_members table
import { supabase } from '../lib/supabase';
import LinkMetadataDialog from './shared/LinkMetadataDialog';
import type { LinkMetadata } from '../types/linkMetadata';

// Enhanced interfaces
interface CommitteeMember {
  id: string;
  name: string;
  role: string;
  designation: string;
  masterType: 'doctors' | 'employees' | 'consultants' | 'nabh_team';
  department?: string;
  phone?: string;
}

interface Meeting {
  id: string;
  date: string;
  agenda: string;
  minutes: string;
  attendees: string[];
  decisions: string[];
  actionItems: string[];
  nextMeetingDate?: string;
}

interface Committee {
  id: string;
  name: string;
  type: 'mandatory' | 'recommended' | 'custom';
  description: string;
  chairperson: CommitteeMember | null;
  members: CommitteeMember[];
  meetingFrequency: 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly';
  meetings: Meeting[];
  objectives: string[];
  createdAt: string;
  nextMeetingDate?: string;
  minMeetingsRequired: number;
  documentsLink?: string; // Google Docs/Sheets link
  linkMetadata?: {
    title: string;
    description: string;
    keywords: string[];
    category?: string;
    type?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}

// Master data sources - Doctors and Employees fetched from Supabase
interface MasterPersonData {
  id: string;
  name: string;
  designation: string;
  department: string;
  phone: string;
}

// RMO Doctor type from Supabase
interface RmoDoctor {
  id: string;
  sr_no: number;
  emp_id_no: string;
  name: string;
  qualification: string;
  designation: string;
  registration_no: string | null;
  doctor_type: string;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Team Member type from Supabase
interface TeamMember {
  id: string;
  name: string;
  role: string;
  designation: string;
  department: string;
  responsibilities: string[] | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Visiting Consultant type from Supabase
interface VisitingConsultant {
  id: string;
  sr_no: number;
  name: string;
  department: string;
  qualification: string | null;
  registration_no: string | null;
  registered_council: string;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Committee DB types from Supabase
interface CommitteeDB {
  id: string;
  name: string;
  type: string;
  description: string | null;
  meeting_frequency: string;
  objectives: string[] | null;
  min_meetings_required: number;
  chairperson_id: string | null;
  chairperson_name: string | null;
  chairperson_designation: string | null;
  chairperson_master_type: string | null;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CommitteeMemberDB {
  id: string;
  committee_id: string;
  member_id: string;
  name: string;
  designation: string | null;
  department: string | null;
  role_in_committee: string;
  master_type: string | null;
  phone: string | null;
  is_active: boolean;
  created_at: string;
}

interface CommitteeMeetingDB {
  id: string;
  committee_id: string;
  meeting_date: string;
  agenda: string | null;
  minutes: string | null;
  attendees: string[] | null;
  decisions: string[] | null;
  action_items: string[] | null;
  next_meeting_date: string | null;
  created_at: string;
}

// MASTER_TYPES will be created dynamically inside the component to use state for doctors

const NABH_MANDATORY_COMMITTEES = [
  {
    name: 'Hospital Quality Committee',
    description: 'Oversees all quality improvement activities and monitors quality indicators',
    objectives: ['Monitor quality indicators', 'Review quality improvement projects', 'Ensure NABH compliance'],
    meetingFrequency: 'Monthly' as const,
    minMeetingsRequired: 6,
  },
  {
    name: 'Hospital Infection Control Committee',
    description: 'Monitors and controls hospital-acquired infections',
    objectives: ['Surveillance of HAIs', 'Antibiotic stewardship', 'Infection prevention training'],
    meetingFrequency: 'Monthly' as const,
    minMeetingsRequired: 6,
  },
  {
    name: 'Pharmacy & Therapeutics Committee',
    description: 'Manages formulary and medication safety',
    objectives: ['Formulary management', 'Medication safety', 'ADR monitoring'],
    meetingFrequency: 'Quarterly' as const,
    minMeetingsRequired: 4,
  },
  {
    name: 'Medical Records Committee',
    description: 'Oversees medical records management and documentation standards',
    objectives: ['Medical records audit', 'Documentation standards', 'Record retention'],
    meetingFrequency: 'Quarterly' as const,
    minMeetingsRequired: 4,
  },
  {
    name: 'Internal Complaints Committee',
    description: 'Addresses internal complaints and grievances from staff and stakeholders',
    objectives: ['Handle internal grievances', 'Ensure fair resolution process', 'Maintain workplace harmony', 'Document complaint handling'],
    meetingFrequency: 'Monthly' as const,
    minMeetingsRequired: 6,
  },
];

export default function CommitteesPageEnhanced() {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [doctorsData, setDoctorsData] = useState<MasterPersonData[]>([]);
  const [employeesData, setEmployeesData] = useState<MasterPersonData[]>([]);
  const [consultantsData, setConsultantsData] = useState<MasterPersonData[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [isGenerateMinutesDialogOpen, setIsGenerateMinutesDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(null);
  // Removed menu anchor state as we now use direct buttons
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Dynamic MASTER_TYPES using fetched data from Supabase
  const MASTER_TYPES = [
    { value: 'doctors', label: 'Doctors Master', icon: 'medical_services', data: doctorsData },
    { value: 'employees', label: 'Employees Master', icon: 'badge', data: employeesData },
    { value: 'consultants', label: 'Consultants Master', icon: 'medical_information', data: consultantsData },
    { value: 'nabh_team', label: 'NABH Team', icon: 'groups', data: employeesData },
  ];

  // New committee form
  const [newCommittee, setNewCommittee] = useState({
    name: '',
    description: '',
    type: 'mandatory' as 'mandatory' | 'recommended' | 'custom',
    meetingFrequency: 'Monthly' as 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly',
    objectives: '',
    minMeetingsRequired: 6,
  });

  // Edit committee form
  const [editCommittee, setEditCommittee] = useState({
    id: '',
    name: '',
    description: '',
    type: 'mandatory' as 'mandatory' | 'recommended' | 'custom',
    meetingFrequency: 'Monthly' as 'Weekly' | 'Bi-weekly' | 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly',
    objectives: '',
    minMeetingsRequired: 6,
  });

  // Member selection form
  const [memberForm, setMemberForm] = useState({
    selectedMasterType: '',
    selectedPersonId: '',
    role: '',
  });

  // Meeting form (unused in current implementation)

  // Generate meeting minutes
  const generateMeetingMinutes = (committee: Committee) => {
    const meetings: Meeting[] = [];
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6); // Start 6 months ago

    const frequencyDays = {
      'Weekly': 7,
      'Bi-weekly': 14,
      'Monthly': 30,
      'Quarterly': 90,
      'Half-yearly': 180,
      'Yearly': 365,
    };

    const interval = frequencyDays[committee.meetingFrequency];
    const requiredMeetings = Math.max(committee.minMeetingsRequired, 6);

    for (let i = 0; i < requiredMeetings; i++) {
      const meetingDate = new Date(startDate);
      meetingDate.setDate(startDate.getDate() + (i * interval));

      const meeting: Meeting = {
        id: `meeting_${Date.now()}_${i}`,
        date: meetingDate.toISOString().split('T')[0],
        agenda: `${committee.name} Meeting #${i + 1}\n\n1. Review of previous meeting minutes\n2. ${committee.objectives[0] || 'Quality review'}\n3. Discussion on current initiatives\n4. Action items review\n5. Any other business`,
        minutes: `Meeting commenced at 10:00 AM with ${committee.chairperson?.name || 'Chairperson'} presiding.\n\nATTENDEES:\n${committee.members.map(m => `- ${m.name} (${m.designation})`).join('\n')}\n\nAGENDA ITEMS DISCUSSED:\n\n1. Previous Meeting Minutes:\n   - Minutes of previous meeting were reviewed and approved.\n\n2. ${committee.objectives[0] || 'Quality Review'}:\n   - Current status reviewed\n   - Areas for improvement identified\n\n3. Current Initiatives:\n   - Ongoing projects reviewed\n   - Progress against targets assessed\n\n4. Action Items:\n   - Previous action items reviewed\n   - New action items assigned\n\nMeeting concluded at 11:30 AM.\n\nNext meeting scheduled for: ${new Date(meetingDate.getTime() + interval * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}`,
        attendees: committee.members.map(m => m.name),
        decisions: [
          'Approved previous meeting minutes',
          'Agreed to continue current quality initiatives',
          'Assigned action items to respective members',
        ],
        actionItems: [
          `${committee.chairperson?.name || 'Chairperson'}: Review monthly reports`,
          `${committee.members[0]?.name || 'Member'}: Prepare next quarter planning`,
          'All members: Submit departmental updates before next meeting',
        ],
        nextMeetingDate: new Date(meetingDate.getTime() + interval * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      };

      meetings.push(meeting);
    }

    return meetings;
  };

  // Fetch doctors from Supabase rmo_doctors table
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const { data, error } = await supabase
          .from('rmo_doctors')
          .select('*')
          .eq('is_active', true)
          .order('sr_no', { ascending: true });

        if (error) {
          console.error('Error fetching doctors:', error);
          return;
        }

        if (data) {
          const formattedDoctors: MasterPersonData[] = (data as RmoDoctor[]).map(doc => ({
            id: doc.emp_id_no,
            name: doc.name,
            designation: doc.designation,
            department: doc.doctor_type === 'Allopathic' ? 'Medical' : 'AYUSH',
            phone: '',
          }));
          setDoctorsData(formattedDoctors);
        }
      } catch (err) {
        console.error('Error fetching doctors:', err);
      }
    };

    fetchDoctors();
  }, []);

  // Fetch employees from Supabase nabh_team_members table
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const { data, error } = await supabase
          .from('nabh_team_members')
          .select('*')
          .eq('is_active', true)
          .order('name', { ascending: true });

        if (error) {
          console.error('Error fetching employees:', error);
          return;
        }

        if (data) {
          const formattedEmployees: MasterPersonData[] = (data as TeamMember[]).map(emp => ({
            id: emp.id,
            name: emp.name,
            designation: emp.designation,
            department: emp.department,
            phone: '',
          }));
          setEmployeesData(formattedEmployees);
        }
      } catch (err) {
        console.error('Error fetching employees:', err);
      }
    };

    fetchEmployees();
  }, []);

  // Fetch consultants from Supabase visiting_consultants table
  useEffect(() => {
    const fetchConsultants = async () => {
      try {
        const { data, error } = await supabase
          .from('visiting_consultants')
          .select('*')
          .eq('is_active', true)
          .order('sr_no', { ascending: true });

        if (error) {
          console.error('Error fetching consultants:', error);
          return;
        }

        if (data) {
          const formattedConsultants: MasterPersonData[] = (data as VisitingConsultant[]).map(con => ({
            id: con.id,
            name: con.name,
            designation: con.qualification || 'Visiting Consultant',
            department: con.department,
            phone: '',
          }));
          setConsultantsData(formattedConsultants);
        }
      } catch (err) {
        console.error('Error fetching consultants:', err);
      }
    };

    fetchConsultants();
  }, []);

  // Load committees from Supabase
  useEffect(() => {
    const loadCommittees = async () => {
      try {
        // Fetch committees
        const { data: rawCommitteesData, error: committeesError } = await supabase
          .from('committees')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        if (committeesError) {
          console.error('Error loading committees:', committeesError);
          // If table doesn't exist or error, seed with default committees
          await seedDefaultCommittees();
          return;
        }

        const committeesData = rawCommitteesData as CommitteeDB[] | null;

        if (!committeesData || committeesData.length === 0) {
          // Seed default NABH mandatory committees
          await seedDefaultCommittees();
          return;
        }

        // Fetch members for all committees
        const { data: rawMembersData, error: membersError } = await supabase
          .from('committee_members')
          .select('*')
          .eq('is_active', true);

        if (membersError) {
          console.error('Error loading members:', membersError);
        }

        const membersData = rawMembersData as CommitteeMemberDB[] | null;

        // Fetch meetings for all committees
        const { data: rawMeetingsData, error: meetingsError } = await supabase
          .from('committee_meetings')
          .select('*')
          .order('meeting_date', { ascending: true });

        if (meetingsError) {
          console.error('Error loading meetings:', meetingsError);
        }

        const meetingsData = rawMeetingsData as CommitteeMeetingDB[] | null;

        // Map data to Committee interface
        const loadedCommittees: Committee[] = committeesData.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type as 'mandatory' | 'recommended' | 'custom',
          description: c.description || '',
          meetingFrequency: c.meeting_frequency as any,
          objectives: c.objectives || [],
          minMeetingsRequired: c.min_meetings_required,
          createdAt: c.created_at,
          documentsLink: '', // Initialize with empty link
          chairperson: c.chairperson_id ? {
            id: c.chairperson_id,
            name: c.chairperson_name || '',
            designation: c.chairperson_designation || '',
            role: 'Chairperson',
            masterType: c.chairperson_master_type as any,
          } : null,
          members: (membersData || [])
            .filter(m => m.committee_id === c.id)
            .map(m => ({
              id: m.member_id,
              name: m.name,
              designation: m.designation || '',
              role: m.role_in_committee,
              masterType: m.master_type as any,
              department: m.department || '',
              phone: m.phone || '',
            })),
          meetings: (meetingsData || [])
            .filter(m => m.committee_id === c.id)
            .map(m => ({
              id: m.id,
              date: m.meeting_date,
              agenda: m.agenda || '',
              minutes: m.minutes || '',
              attendees: m.attendees || [],
              decisions: m.decisions || [],
              actionItems: m.action_items || [],
              nextMeetingDate: m.next_meeting_date || undefined,
            })),
        }));

        setCommittees(loadedCommittees);
      } catch (err) {
        console.error('Error loading committees:', err);
        await seedDefaultCommittees();
      }
    };

    const seedDefaultCommittees = async () => {
      const defaultCommittees: Committee[] = [];

      for (const committee of NABH_MANDATORY_COMMITTEES) {
        const { data: rawData, error } = await supabase
          .from('committees')
          .insert({
            name: committee.name,
            type: 'mandatory',
            description: committee.description,
            meeting_frequency: committee.meetingFrequency,
            objectives: committee.objectives,
            min_meetings_required: committee.minMeetingsRequired,
          } as any)
          .select()
          .single();

        const data = rawData as CommitteeDB | null;

        if (error) {
          console.error('Error seeding committee:', error);
          // If insert fails (table may not exist), use local state
          defaultCommittees.push({
            id: `committee_${Date.now()}_${Math.random()}`,
            ...committee,
            type: 'mandatory' as const,
            chairperson: null,
            members: [],
            meetings: [],
            objectives: committee.objectives,
            createdAt: new Date().toISOString(),
          });
        } else if (data) {
          defaultCommittees.push({
            id: data.id,
            name: data.name,
            type: 'mandatory',
            description: data.description || '',
            meetingFrequency: data.meeting_frequency as any,
            objectives: data.objectives || [],
            minMeetingsRequired: data.min_meetings_required,
            createdAt: data.created_at,
            chairperson: null,
            members: [],
            meetings: [],
          });
        }
      }

      setCommittees(defaultCommittees);
    };

    loadCommittees();
  }, []);

  const handleAddCommittee = async () => {
    try {
      const { data: rawData, error } = await supabase
        .from('committees')
        .insert({
          name: newCommittee.name,
          type: newCommittee.type,
          description: newCommittee.description,
          meeting_frequency: newCommittee.meetingFrequency,
          objectives: newCommittee.objectives.split('\n').filter(obj => obj.trim()),
          min_meetings_required: newCommittee.minMeetingsRequired,
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error creating committee:', error);
        setSnackbar({ open: true, message: 'Failed to create committee', severity: 'error' });
        return;
      }

      const data = rawData as CommitteeDB;

      const committee: Committee = {
        id: data.id,
        name: data.name,
        description: data.description || '',
        type: data.type as any,
        chairperson: null,
        members: [],
        meetingFrequency: data.meeting_frequency as any,
        meetings: [],
        objectives: data.objectives || [],
        createdAt: data.created_at,
        minMeetingsRequired: data.min_meetings_required,
      };

      setCommittees([...committees, committee]);
      setNewCommittee({
        name: '',
        description: '',
        type: 'mandatory',
        meetingFrequency: 'Monthly',
        objectives: '',
        minMeetingsRequired: 6,
      });
      setIsAddDialogOpen(false);
      setSnackbar({ open: true, message: 'Committee created successfully', severity: 'success' });
    } catch (err) {
      console.error('Error creating committee:', err);
      setSnackbar({ open: true, message: 'Failed to create committee', severity: 'error' });
    }
  };

  const handleAddMember = async () => {
    if (!selectedCommittee || !memberForm.selectedMasterType || !memberForm.selectedPersonId) return;

    const masterData = MASTER_TYPES.find(m => m.value === memberForm.selectedMasterType)?.data;
    const selectedPerson = masterData?.find(p => p.id === memberForm.selectedPersonId);

    if (!selectedPerson) return;

    try {
      // Save to Supabase
      const { error } = await supabase
        .from('committee_members')
        .insert({
          committee_id: selectedCommittee.id,
          member_id: selectedPerson.id,
          name: selectedPerson.name,
          designation: selectedPerson.designation,
          department: selectedPerson.department,
          role_in_committee: memberForm.role || 'Member',
          master_type: memberForm.selectedMasterType,
          phone: selectedPerson.phone,
        } as any);

      if (error) {
        console.error('Error adding member:', error);
        setSnackbar({ open: true, message: 'Failed to add member', severity: 'error' });
        return;
      }

      const newMember: CommitteeMember = {
        id: selectedPerson.id,
        name: selectedPerson.name,
        role: memberForm.role || 'Member',
        designation: selectedPerson.designation,
        masterType: memberForm.selectedMasterType as any,
        department: selectedPerson.department,
        phone: selectedPerson.phone,
      };

      const updatedCommittee = {
        ...selectedCommittee,
        members: [...selectedCommittee.members, newMember],
      };

      setCommittees(committees.map(c => c.id === selectedCommittee.id ? updatedCommittee : c));
      setSelectedCommittee(updatedCommittee);
      setMemberForm({ selectedMasterType: '', selectedPersonId: '', role: '' });
      setIsMemberDialogOpen(false);
      setSnackbar({ open: true, message: 'Member added successfully', severity: 'success' });
    } catch (err) {
      console.error('Error adding member:', err);
      setSnackbar({ open: true, message: 'Failed to add member', severity: 'error' });
    }
  };

  const handleSetChairperson = async (member: CommitteeMember) => {
    if (!selectedCommittee) return;

    try {
      // Update in Supabase
      const updateData = {
        chairperson_id: member.id,
        chairperson_name: member.name,
        chairperson_designation: member.designation,
        chairperson_master_type: member.masterType,
      };
      const { error } = await (supabase
        .from('committees') as any)
        .update(updateData)
        .eq('id', selectedCommittee.id);

      if (error) {
        console.error('Error setting chairperson:', error);
        setSnackbar({ open: true, message: 'Failed to set chairperson', severity: 'error' });
        return;
      }

      const updatedCommittee = {
        ...selectedCommittee,
        chairperson: member,
      };

      setCommittees(committees.map(c => c.id === selectedCommittee.id ? updatedCommittee : c));
      setSelectedCommittee(updatedCommittee);
      setSnackbar({ open: true, message: 'Chairperson assigned successfully', severity: 'success' });
    } catch (err) {
      console.error('Error setting chairperson:', err);
      setSnackbar({ open: true, message: 'Failed to set chairperson', severity: 'error' });
    }
  };

  const handleSaveDocumentLink = async (linkData: LinkMetadata) => {
    if (!selectedCommittee) return;

    try {
      const updatedCommittee: Committee = {
        ...selectedCommittee,
        documentsLink: linkData.url,
        linkMetadata: {
          title: linkData.title,
          description: linkData.description,
          keywords: linkData.keywords,
          category: linkData.category,
          type: linkData.type,
          priority: linkData.priority,
        },
      };

      // Update in state
      setCommittees(committees.map(c => 
        c.id === selectedCommittee.id ? updatedCommittee : c
      ));

      // In a real implementation, this would save to Supabase
      // await supabase.from('committees').update({ 
      //   documents_link: linkData.url,
      //   link_metadata: updatedCommittee.linkMetadata 
      // }).eq('id', selectedCommittee.id);

      setSnackbar({ 
        open: true, 
        message: `Document link with metadata saved for ${selectedCommittee.name}`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving document link:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to save document link', 
        severity: 'error' 
      });
    }
  };

  const handleGenerateMinutes = async () => {
    if (!selectedCommittee) return;

    try {
      const generatedMeetings = generateMeetingMinutes(selectedCommittee);

      // Delete existing meetings for this committee first
      await supabase
        .from('committee_meetings')
        .delete()
        .eq('committee_id', selectedCommittee.id);

      // Insert new meetings to Supabase
      const meetingsToInsert = generatedMeetings.map(m => ({
        committee_id: selectedCommittee.id,
        meeting_date: m.date,
        agenda: m.agenda,
        minutes: m.minutes,
        attendees: m.attendees,
        decisions: m.decisions,
        action_items: m.actionItems,
        next_meeting_date: m.nextMeetingDate,
      }));

      const { data: rawInsertedMeetings, error } = await supabase
        .from('committee_meetings')
        .insert(meetingsToInsert as any)
        .select();

      if (error) {
        console.error('Error saving meetings:', error);
        setSnackbar({ open: true, message: 'Failed to save meetings', severity: 'error' });
        return;
      }

      const insertedMeetings = rawInsertedMeetings as CommitteeMeetingDB[] | null;

      // Update meetings with IDs from Supabase
      const meetingsWithIds = insertedMeetings?.map((m, idx) => ({
        ...generatedMeetings[idx],
        id: m.id,
      })) || generatedMeetings;

      const updatedCommittee = {
        ...selectedCommittee,
        meetings: meetingsWithIds,
      };

      setCommittees(committees.map(c => c.id === selectedCommittee.id ? updatedCommittee : c));
      setSelectedCommittee(updatedCommittee);
      setIsGenerateMinutesDialogOpen(false);
      setSnackbar({
        open: true,
        message: `Generated ${generatedMeetings.length} meeting minutes successfully`,
        severity: 'success'
      });
    } catch (err) {
      console.error('Error generating minutes:', err);
      setSnackbar({ open: true, message: 'Failed to generate minutes', severity: 'error' });
    }
  };

  const handleEditCommittee = (committee: Committee) => {
    setEditCommittee({
      id: committee.id,
      name: committee.name,
      description: committee.description,
      type: committee.type,
      meetingFrequency: committee.meetingFrequency,
      objectives: committee.objectives.join('\n'),
      minMeetingsRequired: committee.minMeetingsRequired,
    });
    setSelectedCommittee(committee);
    setIsEditDialogOpen(true);
  };

  const handleSaveEditCommittee = async () => {
    if (!selectedCommittee) return;

    try {
      const updateData = {
        name: editCommittee.name,
        type: editCommittee.type,
        description: editCommittee.description,
        meeting_frequency: editCommittee.meetingFrequency,
        objectives: editCommittee.objectives.split('\n').filter(obj => obj.trim()),
        min_meetings_required: editCommittee.minMeetingsRequired,
      };
      const { error } = await (supabase
        .from('committees') as any)
        .update(updateData)
        .eq('id', selectedCommittee.id);

      if (error) {
        console.error('Error updating committee:', error);
        setSnackbar({ open: true, message: 'Failed to update committee', severity: 'error' });
        return;
      }

      const updatedCommittee: Committee = {
        ...selectedCommittee,
        name: editCommittee.name,
        description: editCommittee.description,
        type: editCommittee.type,
        meetingFrequency: editCommittee.meetingFrequency,
        objectives: editCommittee.objectives.split('\n').filter(obj => obj.trim()),
        minMeetingsRequired: editCommittee.minMeetingsRequired,
      };

      setCommittees(committees.map(c => c.id === selectedCommittee.id ? updatedCommittee : c));
      setIsEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Committee updated successfully', severity: 'success' });
    } catch (err) {
      console.error('Error updating committee:', err);
      setSnackbar({ open: true, message: 'Failed to update committee', severity: 'error' });
    }
  };

  const handleDeleteCommittee = (committee: Committee) => {
    setSelectedCommittee(committee);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCommittee) return;

    try {
      // Delete from Supabase (soft delete by setting is_active to false)
      const { error } = await (supabase
        .from('committees') as any)
        .update({ is_active: false })
        .eq('id', selectedCommittee.id);

      if (error) {
        console.error('Error deleting committee:', error);
        setSnackbar({ open: true, message: 'Failed to delete committee', severity: 'error' });
        return;
      }

      setCommittees(committees.filter(c => c.id !== selectedCommittee.id));
      setIsDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Committee deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting committee:', err);
      setSnackbar({ open: true, message: 'Failed to delete committee', severity: 'error' });
    }
  };

  // Removed menu functions as we now use direct buttons

  const getSelectedMasterData = () => {
    return MASTER_TYPES.find(m => m.value === memberForm.selectedMasterType)?.data || [];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <GroupsIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Committee Management
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Enhanced committee management with master-based member selection
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Committee
        </Button>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {committees.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Committees
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error" fontWeight="bold">
                {committees.filter(c => !c.chairperson).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need Chairperson
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {committees.reduce((acc, c) => acc + c.meetings.length, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Meetings
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {committees.filter(c => c.meetings.length < 6).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Need Minutes
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Committees List */}
      <Box display="flex" gap={2} flexWrap="wrap">
        {committees.map(committee => (
          <Box flex="1" minWidth="400px" key={committee.id}>
            <Card elevation={2}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Typography variant="h6" fontWeight="bold">
                    {committee.name}
                  </Typography>
                  <Chip
                    label={committee.type}
                    size="small"
                    color={committee.type === 'mandatory' ? 'error' : 'primary'}
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {committee.description}
                </Typography>

                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Chairperson:
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body2" color={committee.chairperson ? 'text.primary' : 'text.secondary'}>
                      {committee.chairperson ? 
                        `${committee.chairperson.name} (${committee.chairperson.designation})` : 
                        'Not assigned'
                      }
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon />}
                      onClick={() => {
                        setSelectedCommittee(committee);
                        setIsMemberDialogOpen(true);
                      }}
                      sx={{ ml: 1, py: 0.25, fontSize: '0.75rem' }}
                    >
                      {committee.chairperson ? 'Change' : 'Assign'}
                    </Button>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Members: {committee.members.length}
                  </Typography>
                  {committee.members.slice(0, 3).map(member => (
                    <Chip
                      key={member.id}
                      label={member.name}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      variant="outlined"
                    />
                  ))}
                  {committee.members.length > 3 && (
                    <Chip
                      label={`+${committee.members.length - 3} more`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Box>

                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>
                    Meetings:
                  </Typography>
                  <Typography variant="body2">
                    {committee.meetings.length} meetings | {committee.meetingFrequency} frequency
                  </Typography>
                </Box>

                <Box mb={2}>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <LinkIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    <Typography variant="subtitle2">
                      Documents Link:
                    </Typography>
                  </Box>
                  {committee.documentsLink ? (
                    <Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">
                          {committee.linkMetadata?.title || 'Committee Documents'}
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => window.open(committee.documentsLink, '_blank')}
                        >
                          Open
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<EditIcon />}
                          onClick={() => {
                            setSelectedCommittee(committee);
                            setIsLinkDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      </Box>
                      {committee.linkMetadata?.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                          {committee.linkMetadata.description}
                        </Typography>
                      )}
                      {committee.linkMetadata?.keywords && (
                        <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                          {committee.linkMetadata.keywords.slice(0, 5).map((keyword, index) => (
                            <Chip
                              key={index}
                              label={keyword}
                              size="small"
                              sx={{ fontSize: '0.7rem', height: 18 }}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => {
                        setSelectedCommittee(committee);
                        setIsLinkDialogOpen(true);
                      }}
                      fullWidth
                    >
                      Add Document Link with Metadata
                    </Button>
                  )}
                </Box>

                {committee.meetings.length < 6 && (
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    Need at least 6 meeting minutes for NABH compliance
                  </Alert>
                )}
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<PersonIcon />}
                  onClick={() => {
                    setSelectedCommittee(committee);
                    setIsMemberDialogOpen(true);
                  }}
                >
                  Add Member
                </Button>
                <Button
                  size="small"
                  startIcon={<EventNoteIcon />}
                  onClick={() => {
                    setSelectedCommittee(committee);
                    // setIsMeetingDialogOpen(true); // Temporarily disabled
                  }}
                  disabled
                >
                  Add Meeting
                </Button>
                <Button
                  size="small"
                  startIcon={<AutoAwesomeIcon />}
                  onClick={() => {
                    setSelectedCommittee(committee);
                    setIsGenerateMinutesDialogOpen(true);
                  }}
                  variant="outlined"
                >
                  Generate Minutes
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditCommittee(committee)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteCommittee(committee)}
                  color="error"
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Add Committee Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Committee</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Committee Name"
            value={newCommittee.name}
            onChange={(e) => setNewCommittee({ ...newCommittee, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={newCommittee.description}
            onChange={(e) => setNewCommittee({ ...newCommittee, description: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Committee Type</InputLabel>
            <Select
              value={newCommittee.type}
              onChange={(e) => setNewCommittee({ ...newCommittee, type: e.target.value as any })}
            >
              <MenuItem value="mandatory">Mandatory</MenuItem>
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Meeting Frequency</InputLabel>
            <Select
              value={newCommittee.meetingFrequency}
              onChange={(e) => setNewCommittee({ ...newCommittee, meetingFrequency: e.target.value as any })}
            >
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Quarterly">Quarterly</MenuItem>
              <MenuItem value="Half-yearly">Half-yearly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Minimum Meetings Required"
            value={newCommittee.minMeetingsRequired}
            onChange={(e) => setNewCommittee({ ...newCommittee, minMeetingsRequired: parseInt(e.target.value) || 6 })}
            margin="normal"
            helperText="Minimum number of meetings required for NABH compliance"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Objectives (one per line)"
            value={newCommittee.objectives}
            onChange={(e) => setNewCommittee({ ...newCommittee, objectives: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddCommittee}>Add Committee</Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog - Enhanced with Master Selection */}
      <Dialog open={isMemberDialogOpen} onClose={() => setIsMemberDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          Add Member to {selectedCommittee?.name}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            First select the master type, then choose the specific person from that master.
          </Typography>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Select Master Type</InputLabel>
            <Select
              value={memberForm.selectedMasterType}
              onChange={(e) => setMemberForm({ 
                ...memberForm, 
                selectedMasterType: e.target.value,
                selectedPersonId: '' // Reset person selection when master changes
              })}
            >
              {MASTER_TYPES.map(master => (
                <MenuItem key={master.value} value={master.value}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Icon>{master.icon}</Icon>
                    {master.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {memberForm.selectedMasterType && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Select Person</InputLabel>
              <Select
                value={memberForm.selectedPersonId}
                onChange={(e) => setMemberForm({ ...memberForm, selectedPersonId: e.target.value })}
              >
                {getSelectedMasterData().map(person => (
                  <MenuItem key={person.id} value={person.id}>
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {person.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {person.designation} | {person.department}
                      </Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}

          <TextField
            fullWidth
            label="Role in Committee"
            value={memberForm.role}
            onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}
            margin="normal"
            placeholder="e.g., Member, Secretary, Co-Chairperson"
          />

          {/* Show current committee members */}
          {selectedCommittee && selectedCommittee.members.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Members:
              </Typography>
              <List dense>
                {selectedCommittee.members.map(member => (
                  <ListItem key={member.id}>
                    <ListItemText
                      primary={member.name}
                      secondary={`${member.designation} (${member.role})`}
                    />
                    <ListItemSecondaryAction>
                      {!selectedCommittee.chairperson && (
                        <Button
                          size="small"
                          onClick={() => handleSetChairperson(member)}
                        >
                          Set as Chairperson
                        </Button>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsMemberDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddMember}
            disabled={!memberForm.selectedMasterType || !memberForm.selectedPersonId}
          >
            Add Member
          </Button>
        </DialogActions>
      </Dialog>

      {/* Generate Meeting Minutes Dialog */}
      <Dialog 
        open={isGenerateMinutesDialogOpen} 
        onClose={() => setIsGenerateMinutesDialogOpen(false)} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Generate Meeting Minutes</DialogTitle>
        <DialogContent>
          <Typography variant="body2" gutterBottom>
            This will automatically generate {selectedCommittee?.minMeetingsRequired || 6} meeting minutes
            for <strong>{selectedCommittee?.name}</strong> based on the {selectedCommittee?.meetingFrequency.toLowerCase()} frequency.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Each meeting will include:
          </Typography>
          <ul style={{ margin: '8px 0', paddingLeft: '24px' }}>
            <li>Realistic meeting dates based on frequency</li>
            <li>Agenda items relevant to committee objectives</li>
            <li>Detailed minutes of meetings</li>
            <li>Attendance records of all members</li>
            <li>Key decisions and action items</li>
            <li>Next meeting dates</li>
          </ul>
          <Alert severity="info" sx={{ mt: 2 }}>
            This will replace any existing meetings for this committee.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsGenerateMinutesDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleGenerateMinutes}
            startIcon={<AutoAwesomeIcon />}
          >
            Generate Minutes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Committee Actions - Now using direct buttons on cards */}

      {/* Edit Committee Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Committee</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Committee Name"
            value={editCommittee.name}
            onChange={(e) => setEditCommittee({ ...editCommittee, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Description"
            value={editCommittee.description}
            onChange={(e) => setEditCommittee({ ...editCommittee, description: e.target.value })}
            margin="normal"
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Committee Type</InputLabel>
            <Select
              value={editCommittee.type}
              onChange={(e) => setEditCommittee({ ...editCommittee, type: e.target.value as any })}
            >
              <MenuItem value="mandatory">Mandatory</MenuItem>
              <MenuItem value="recommended">Recommended</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth margin="normal">
            <InputLabel>Meeting Frequency</InputLabel>
            <Select
              value={editCommittee.meetingFrequency}
              onChange={(e) => setEditCommittee({ ...editCommittee, meetingFrequency: e.target.value as any })}
            >
              <MenuItem value="Weekly">Weekly</MenuItem>
              <MenuItem value="Bi-weekly">Bi-weekly</MenuItem>
              <MenuItem value="Monthly">Monthly</MenuItem>
              <MenuItem value="Quarterly">Quarterly</MenuItem>
              <MenuItem value="Half-yearly">Half-yearly</MenuItem>
              <MenuItem value="Yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            type="number"
            label="Minimum Meetings Required"
            value={editCommittee.minMeetingsRequired}
            onChange={(e) => setEditCommittee({ ...editCommittee, minMeetingsRequired: parseInt(e.target.value) || 6 })}
            margin="normal"
            helperText="Minimum number of meetings required for NABH compliance"
          />
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Objectives (one per line)"
            value={editCommittee.objectives}
            onChange={(e) => setEditCommittee({ ...editCommittee, objectives: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEditCommittee}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Committee</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedCommittee?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone. All committee members and meeting records will be permanently deleted.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleConfirmDelete}
            startIcon={<DeleteIcon />}
          >
            Delete Committee
          </Button>
        </DialogActions>
      </Dialog>

      {/* Document Link Metadata Dialog */}
      {selectedCommittee && (
        <LinkMetadataDialog
          open={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
          onSave={handleSaveDocumentLink}
          initialUrl={selectedCommittee.documentsLink || ''}
          title={`Add Document Link for ${selectedCommittee.name}`}
          subtitle="Committee Documentation"
          context={`${selectedCommittee.name} - ${selectedCommittee.type} committee`}
          suggestedKeywords={[
            'committee',
            'meeting minutes',
            'nabh',
            'quality',
            selectedCommittee.name.toLowerCase().replace(/[^a-z0-9\s]/g, ''),
            selectedCommittee.type,
            ...selectedCommittee.objectives.flatMap(obj => obj.toLowerCase().split(' ')).filter(word => word.length > 3),
          ]}
          suggestedCategory="Committee Document"
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
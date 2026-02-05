import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Chip,
  Card,
  CardContent,
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
  IconButton,
  Menu,
  Icon,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Handshake as MOUIcon,
  Link as LinkIcon,
  Remove as RemoveIcon,
  OpenInNew as OpenIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface DocumentLink {
  id: string;
  url: string;
  title: string;
  type: 'Google Docs' | 'Google Sheets' | 'PDF' | 'Other';
}

interface MOU {
  id: string;
  title: string;
  partnerOrganization: string;
  category: 'Academic' | 'Corporate' | 'Government' | 'Healthcare' | 'Insurance' | 'Technology' | 'Research' | 'Other';
  signedDate: string;
  expiryDate: string;
  validityPeriod: string;
  status: 'Active' | 'Expired' | 'Under Renewal' | 'Terminated' | 'Draft';
  purpose: string;
  keyBenefits: string[];
  responsiblePerson: string;
  partnerContact: string;
  documentLinks: DocumentLink[];
  renewalRequired: boolean;
  financialImplications?: string;
  complianceRequirements: string;
  createdAt: string;
  updatedAt: string;
}

// Comprehensive default MOUs for Hope Hospital
const DEFAULT_MOUS: MOU[] = [
  {
    id: 'mou_001',
    title: 'Medical College Partnership for Internship Program',
    partnerOrganization: 'Government Medical College, Nagpur',
    category: 'Academic',
    signedDate: '2024-01-15',
    expiryDate: '2027-01-14',
    validityPeriod: '3 Years',
    status: 'Active',
    purpose: 'Provide clinical training opportunities for medical students and interns at Hope Hospital',
    keyBenefits: [
      'Access to qualified medical interns',
      'Academic collaboration opportunities',
      'Research partnerships',
      'Enhanced hospital reputation',
      'Knowledge exchange programs'
    ],
    responsiblePerson: 'Dr. Ruby Ammon',
    partnerContact: 'Dr. S.K. Sharma, Dean - GMC Nagpur',
    documentLinks: [
      {
        id: 'doc_001',
        url: '',
        title: 'Original MOU Document',
        type: 'PDF'
      },
      {
        id: 'doc_002',
        url: '',
        title: 'Internship Guidelines',
        type: 'Google Docs'
      }
    ],
    renewalRequired: true,
    financialImplications: 'No direct financial cost. Stipend expenses for interns as per norms.',
    complianceRequirements: 'MCI guidelines compliance, Regular evaluation reports, Academic audit participation',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_002',
    title: 'Corporate Health Package Agreement',
    partnerOrganization: 'TCS Limited, Nagpur',
    category: 'Corporate',
    signedDate: '2024-06-01',
    expiryDate: '2026-05-31',
    validityPeriod: '2 Years',
    status: 'Active',
    purpose: 'Provide comprehensive healthcare services to TCS employees and their families',
    keyBenefits: [
      'Guaranteed patient volume',
      'Steady revenue stream',
      'Corporate health market presence',
      'Long-term partnership',
      'Bulk service rates'
    ],
    responsiblePerson: 'Viji Murali',
    partnerContact: 'HR Manager - TCS Nagpur',
    documentLinks: [
      {
        id: 'doc_003',
        url: '',
        title: 'Corporate Health Agreement',
        type: 'PDF'
      },
      {
        id: 'doc_004',
        url: '',
        title: 'Service Rate Card',
        type: 'Google Sheets'
      },
      {
        id: 'doc_005',
        url: '',
        title: 'Employee Health Records Template',
        type: 'Google Sheets'
      }
    ],
    renewalRequired: true,
    financialImplications: '₹25 lakhs annual revenue potential. 15% discount on standard rates.',
    complianceRequirements: 'Corporate billing compliance, Monthly health reports, Employee satisfaction surveys',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_003',
    title: 'ESIC Empanelment Agreement',
    partnerOrganization: 'Employees State Insurance Corporation',
    category: 'Government',
    signedDate: '2023-08-15',
    expiryDate: '2026-08-14',
    validityPeriod: '3 Years',
    status: 'Active',
    purpose: 'Provide medical services to ESIC beneficiaries under the ESI scheme',
    keyBenefits: [
      'Access to large patient base',
      'Government-backed payments',
      'Social service contribution',
      'Steady income source',
      'Network hospital status'
    ],
    responsiblePerson: 'Dr. Murali BK',
    partnerContact: 'Regional Director - ESIC Maharashtra',
    documentLinks: [
      {
        id: 'doc_006',
        url: '',
        title: 'ESIC Empanelment Certificate',
        type: 'PDF'
      },
      {
        id: 'doc_007',
        url: '',
        title: 'ESIC Rate Schedule',
        type: 'Google Sheets'
      },
      {
        id: 'doc_008',
        url: '',
        title: 'Billing Guidelines',
        type: 'Google Docs'
      },
      {
        id: 'doc_009',
        url: '',
        title: 'Patient Registration Format',
        type: 'Google Docs'
      }
    ],
    renewalRequired: true,
    financialImplications: '₹1+ crore annual claims potential. Reimbursement as per ESIC rates.',
    complianceRequirements: 'ESIC guidelines adherence, Monthly claims submission, Audit compliance, Patient feedback',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_004',
    title: 'Insurance Network Partnership',
    partnerOrganization: 'HDFC ERGO Health Insurance',
    category: 'Insurance',
    signedDate: '2024-03-01',
    expiryDate: '2027-02-28',
    validityPeriod: '3 Years',
    status: 'Active',
    purpose: 'Network hospital partnership for cashless medical services to insurance policyholders',
    keyBenefits: [
      'Cashless treatment facility',
      'Increased patient footfall',
      'Guaranteed payments',
      'Marketing support',
      'Digital integration'
    ],
    responsiblePerson: 'K J Shashank',
    partnerContact: 'Network Manager - HDFC ERGO',
    documentLinks: [
      {
        id: 'doc_010',
        url: '',
        title: 'Network Hospital Agreement',
        type: 'PDF'
      },
      {
        id: 'doc_011',
        url: '',
        title: 'Tariff Rate Card',
        type: 'Google Sheets'
      }
    ],
    renewalRequired: true,
    financialImplications: '10-15% of total revenue. Payment within 30 days of claim approval.',
    complianceRequirements: 'Pre-authorization compliance, Claim documentation, Quality audits, TAT adherence',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_005',
    title: 'Diagnostic Equipment Maintenance Agreement',
    partnerOrganization: 'Philips Healthcare India',
    category: 'Technology',
    signedDate: '2024-04-15',
    expiryDate: '2026-04-14',
    validityPeriod: '2 Years',
    status: 'Active',
    purpose: 'Comprehensive maintenance and support for Philips diagnostic equipment',
    keyBenefits: [
      'Guaranteed uptime',
      '24/7 technical support',
      'Preventive maintenance',
      'Spare parts warranty',
      'Software updates'
    ],
    responsiblePerson: 'Suraj Rajput',
    partnerContact: 'Service Manager - Philips Healthcare',
    documentLinks: [
      {
        id: 'doc_012',
        url: '',
        title: 'AMC Agreement',
        type: 'PDF'
      },
      {
        id: 'doc_013',
        url: '',
        title: 'Equipment Inventory List',
        type: 'Google Sheets'
      },
      {
        id: 'doc_014',
        url: '',
        title: 'Service Call Log Template',
        type: 'Google Sheets'
      }
    ],
    renewalRequired: true,
    financialImplications: '₹8 lakhs annual AMC cost. Covers all major equipment maintenance.',
    complianceRequirements: 'Monthly service reports, Equipment performance tracking, Compliance with safety standards',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_006',
    title: 'Research Collaboration Agreement',
    partnerOrganization: 'Indian Council of Medical Research (ICMR)',
    category: 'Research',
    signedDate: '2024-09-01',
    expiryDate: '2027-08-31',
    validityPeriod: '3 Years',
    status: 'Active',
    purpose: 'Joint research initiatives in orthopedics and patient care outcomes',
    keyBenefits: [
      'Research funding opportunities',
      'Publication collaborations',
      'Academic recognition',
      'Access to research databases',
      'Clinical trial participation'
    ],
    responsiblePerson: 'Dr. Murali BK',
    partnerContact: 'Research Coordinator - ICMR',
    documentLinks: [
      {
        id: 'doc_015',
        url: '',
        title: 'Research Collaboration Agreement',
        type: 'PDF'
      },
      {
        id: 'doc_016',
        url: '',
        title: 'Research Protocol Templates',
        type: 'Google Docs'
      }
    ],
    renewalRequired: true,
    financialImplications: 'Research grants ranging ₹5-50 lakhs per project. Indirect benefits through publications.',
    complianceRequirements: 'Ethics committee approvals, Regular progress reports, Data sharing compliance, Publication guidelines',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_007',
    title: 'Nursing College Clinical Training Partnership',
    partnerOrganization: 'Datta Meghe College of Nursing',
    category: 'Academic',
    signedDate: '2024-02-01',
    expiryDate: '2027-01-31',
    validityPeriod: '3 Years',
    status: 'Active',
    purpose: 'Clinical training facility for nursing students and skill development programs',
    keyBenefits: [
      'Access to trained nursing students',
      'Faculty support',
      'Educational programs',
      'Recruitment pipeline',
      'Academic partnerships'
    ],
    responsiblePerson: 'Farsana (Head Nurse)',
    partnerContact: 'Principal - DMCON',
    documentLinks: [
      {
        id: 'doc_017',
        url: '',
        title: 'Clinical Training MOU',
        type: 'PDF'
      },
      {
        id: 'doc_018',
        url: '',
        title: 'Student Evaluation Forms',
        type: 'Google Docs'
      },
      {
        id: 'doc_019',
        url: '',
        title: 'Training Schedule Template',
        type: 'Google Sheets'
      }
    ],
    renewalRequired: true,
    financialImplications: 'Minimal direct cost. Potential recruitment savings of ₹2-3 lakhs annually.',
    complianceRequirements: 'Nursing council guidelines, Student safety protocols, Regular evaluations, Academic audits',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  },
  {
    id: 'mou_008',
    title: 'Laboratory Services Partnership',
    partnerOrganization: 'SRL Diagnostics',
    category: 'Healthcare',
    signedDate: '2024-05-01',
    expiryDate: '2026-04-30',
    validityPeriod: '2 Years',
    status: 'Active',
    purpose: 'Outsourced specialized laboratory testing services and technical support',
    keyBenefits: [
      'Access to advanced testing',
      'Cost-effective services',
      'Quick turnaround time',
      'Quality assurance',
      'Technical expertise'
    ],
    responsiblePerson: 'Dr. Sachin',
    partnerContact: 'Regional Manager - SRL Diagnostics',
    documentLinks: [
      {
        id: 'doc_020',
        url: '',
        title: 'Laboratory Services Agreement',
        type: 'PDF'
      },
      {
        id: 'doc_021',
        url: '',
        title: 'Test Menu & Rates',
        type: 'Google Sheets'
      }
    ],
    renewalRequired: true,
    financialImplications: '20-30% commission on tests. Estimated ₹10-15 lakhs annual revenue.',
    complianceRequirements: 'NABL accreditation maintenance, Quality control participation, Regular audits',
    createdAt: '2026-02-03T10:00:00.000Z',
    updatedAt: '2026-02-03T10:00:00.000Z',
  }
];

export default function MOUsMasterPage() {
  const [mous, setMous] = useState<MOU[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMOU, setSelectedMOU] = useState<MOU | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Fetch MOUs from Supabase
  const fetchMOUs = async () => {
    try {
      setLoading(true);

      // Fetch MOUs
      const { data: mousData, error: mousError } = await supabase
        .from('mous')
        .select('*')
        .order('created_at', { ascending: false });

      if (mousError) throw mousError;

      // Fetch all documents
      const { data: docsData, error: docsError } = await supabase
        .from('mou_documents')
        .select('*');

      if (docsError) throw docsError;

      // Map database data to component format
      const formattedMOUs: MOU[] = (mousData || []).map(mou => ({
        id: mou.id,
        title: mou.title,
        partnerOrganization: mou.partner_organization,
        category: mou.category as MOU['category'],
        signedDate: mou.signed_date,
        expiryDate: mou.expiry_date || '',
        validityPeriod: mou.validity_period || '',
        status: mou.status as MOU['status'],
        purpose: mou.purpose || '',
        keyBenefits: mou.key_benefits || [],
        responsiblePerson: mou.responsible_person || '',
        partnerContact: mou.partner_contact || '',
        documentLinks: (docsData || [])
          .filter(doc => doc.mou_id === mou.id)
          .map(doc => ({
            id: doc.id,
            url: doc.url || '',
            title: doc.title,
            type: doc.document_type as DocumentLink['type']
          })),
        renewalRequired: mou.renewal_required ?? true,
        financialImplications: mou.financial_implications || '',
        complianceRequirements: mou.compliance_requirements || '',
        createdAt: mou.created_at,
        updatedAt: mou.updated_at,
      }));

      setMous(formattedMOUs);
    } catch (error) {
      console.error('Error fetching MOUs:', error);
      setSnackbar({ open: true, message: 'Failed to fetch MOUs from database', severity: 'error' });
      // Fallback to default data if database fails
      setMous(DEFAULT_MOUS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMOUs();
  }, []);

  // Form state for new/edit MOU
  const [mouForm, setMouForm] = useState<Partial<MOU>>({
    title: '',
    partnerOrganization: '',
    category: 'Academic',
    signedDate: '',
    expiryDate: '',
    validityPeriod: '',
    status: 'Draft',
    purpose: '',
    keyBenefits: [],
    responsiblePerson: '',
    partnerContact: '',
    documentLinks: [{ id: 'doc_new_1', url: '', title: '', type: 'PDF' }],
    renewalRequired: true,
    financialImplications: '',
    complianceRequirements: '',
  });

  const getStatusColor = (status: MOU['status']) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Expired': return 'error';
      case 'Under Renewal': return 'warning';
      case 'Terminated': return 'error';
      case 'Draft': return 'info';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: MOU['category']) => {
    switch (category) {
      case 'Academic': return 'school';
      case 'Corporate': return 'business';
      case 'Government': return 'account_balance';
      case 'Healthcare': return 'local_hospital';
      case 'Insurance': return 'security';
      case 'Technology': return 'computer';
      case 'Research': return 'science';
      default: return 'handshake';
    }
  };

  const addDocumentLink = async (mouId?: string) => {
    if (mouId) {
      // Adding to existing MOU - save to database
      try {
        const { data, error } = await supabase
          .from('mou_documents')
          .insert({
            mou_id: mouId,
            title: 'New Document',
            url: '',
            document_type: 'PDF',
          })
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setMous(mous.map(mou => {
          if (mou.id === mouId) {
            return {
              ...mou,
              documentLinks: [
                ...mou.documentLinks,
                {
                  id: data.id,
                  url: '',
                  title: 'New Document',
                  type: 'PDF' as const
                }
              ],
            };
          }
          return mou;
        }));
      } catch (error) {
        console.error('Error adding document:', error);
        setSnackbar({ open: true, message: 'Failed to add document', severity: 'error' });
      }
    } else {
      // Adding to form (new MOU)
      setMouForm({
        ...mouForm,
        documentLinks: [
          ...(mouForm.documentLinks || []),
          {
            id: `doc_form_${Date.now()}`,
            url: '',
            title: '',
            type: 'PDF'
          }
        ]
      });
    }
  };

  const removeDocumentLink = async (mouId: string | undefined, linkId: string) => {
    if (mouId) {
      // Removing from existing MOU - delete from database
      try {
        const { error } = await supabase
          .from('mou_documents')
          .delete()
          .eq('id', linkId);

        if (error) throw error;

        // Update local state
        setMous(mous.map(mou => {
          if (mou.id === mouId) {
            return {
              ...mou,
              documentLinks: mou.documentLinks.filter(link => link.id !== linkId),
            };
          }
          return mou;
        }));
      } catch (error) {
        console.error('Error removing document:', error);
        setSnackbar({ open: true, message: 'Failed to remove document', severity: 'error' });
      }
    } else {
      // Removing from form
      setMouForm({
        ...mouForm,
        documentLinks: (mouForm.documentLinks || []).filter(link => link.id !== linkId)
      });
    }
  };

  const updateDocumentLink = async (mouId: string | undefined, linkId: string, field: keyof DocumentLink, value: string) => {
    if (mouId) {
      // Updating existing MOU - save to database
      try {
        const dbField = field === 'type' ? 'document_type' : field;
        const { error } = await supabase
          .from('mou_documents')
          .update({ [dbField]: value })
          .eq('id', linkId);

        if (error) throw error;

        // Update local state
        setMous(mous.map(mou => {
          if (mou.id === mouId) {
            return {
              ...mou,
              documentLinks: mou.documentLinks.map(link =>
                link.id === linkId ? { ...link, [field]: value } : link
              ),
            };
          }
          return mou;
        }));
      } catch (error) {
        console.error('Error updating document:', error);
        // Still update local state for better UX
        setMous(mous.map(mou => {
          if (mou.id === mouId) {
            return {
              ...mou,
              documentLinks: mou.documentLinks.map(link =>
                link.id === linkId ? { ...link, [field]: value } : link
              ),
            };
          }
          return mou;
        }));
      }
    } else {
      // Updating form
      setMouForm({
        ...mouForm,
        documentLinks: (mouForm.documentLinks || []).map(link =>
          link.id === linkId ? { ...link, [field]: value } : link
        )
      });
    }
  };

  const handleAddMOU = async () => {
    try {
      // Insert MOU into database
      const { data: newMouData, error: mouError } = await supabase
        .from('mous')
        .insert({
          title: mouForm.title,
          partner_organization: mouForm.partnerOrganization,
          category: mouForm.category,
          signed_date: mouForm.signedDate,
          expiry_date: mouForm.expiryDate || null,
          validity_period: mouForm.validityPeriod,
          status: mouForm.status,
          purpose: mouForm.purpose,
          key_benefits: mouForm.keyBenefits || [],
          responsible_person: mouForm.responsiblePerson,
          partner_contact: mouForm.partnerContact,
          renewal_required: mouForm.renewalRequired,
          financial_implications: mouForm.financialImplications,
          compliance_requirements: mouForm.complianceRequirements,
          hospital_id: 'hope',
        })
        .select()
        .single();

      if (mouError) throw mouError;

      // Insert document links
      if (mouForm.documentLinks && mouForm.documentLinks.length > 0) {
        const docsToInsert = mouForm.documentLinks
          .filter(doc => doc.title) // Only insert docs with title
          .map(doc => ({
            mou_id: newMouData.id,
            title: doc.title,
            url: doc.url || '',
            document_type: doc.type,
          }));

        if (docsToInsert.length > 0) {
          const { error: docsError } = await supabase
            .from('mou_documents')
            .insert(docsToInsert);

          if (docsError) throw docsError;
        }
      }

      resetForm();
      setIsAddDialogOpen(false);
      setSnackbar({ open: true, message: 'MOU added successfully', severity: 'success' });
      fetchMOUs(); // Refresh data
    } catch (error) {
      console.error('Error adding MOU:', error);
      setSnackbar({ open: true, message: 'Failed to add MOU', severity: 'error' });
    }
  };

  const handleEditMOU = (mou: MOU) => {
    setSelectedMOU(mou);
    setMouForm({ ...mou });
    setIsEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedMOU) return;

    try {
      const { error } = await supabase
        .from('mous')
        .update({
          title: mouForm.title,
          partner_organization: mouForm.partnerOrganization,
          category: mouForm.category,
          signed_date: mouForm.signedDate,
          expiry_date: mouForm.expiryDate || null,
          validity_period: mouForm.validityPeriod,
          status: mouForm.status,
          purpose: mouForm.purpose,
          key_benefits: mouForm.keyBenefits || [],
          responsible_person: mouForm.responsiblePerson,
          partner_contact: mouForm.partnerContact,
          renewal_required: mouForm.renewalRequired,
          financial_implications: mouForm.financialImplications,
          compliance_requirements: mouForm.complianceRequirements,
        })
        .eq('id', selectedMOU.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'MOU updated successfully', severity: 'success' });
      fetchMOUs(); // Refresh data
    } catch (error) {
      console.error('Error updating MOU:', error);
      setSnackbar({ open: true, message: 'Failed to update MOU', severity: 'error' });
    }
  };

  const handleDeleteMOU = (mou: MOU) => {
    setSelectedMOU(mou);
    setIsDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedMOU) return;

    try {
      // Documents will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('mous')
        .delete()
        .eq('id', selectedMOU.id);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'MOU deleted successfully', severity: 'success' });
      fetchMOUs(); // Refresh data
    } catch (error) {
      console.error('Error deleting MOU:', error);
      setSnackbar({ open: true, message: 'Failed to delete MOU', severity: 'error' });
    }
  };

  const resetForm = () => {
    setMouForm({
      title: '',
      partnerOrganization: '',
      category: 'Academic',
      signedDate: '',
      expiryDate: '',
      validityPeriod: '',
      status: 'Draft',
      purpose: '',
      keyBenefits: [],
      responsiblePerson: '',
      partnerContact: '',
      documentLinks: [{ id: 'doc_new_1', url: '', title: '', type: 'PDF' }],
      renewalRequired: true,
      financialImplications: '',
      complianceRequirements: '',
    });
    setSelectedMOU(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, mou: MOU) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMOU(mou);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Get statistics
  const totalMOUs = mous.length;
  const activeMOUs = mous.filter(m => m.status === 'Active').length;
  const expiringMOUs = mous.filter(m => {
    if (m.expiryDate === 'Permanent') return false;
    const expiry = new Date(m.expiryDate);
    const today = new Date();
    const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 90 && daysUntilExpiry > 0;
  }).length;
  const expiredMOUs = mous.filter(m => m.status === 'Expired').length;

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <MOUIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              MOUs & Partnership Agreements
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage Memoranda of Understanding and strategic partnerships with multiple document support
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add MOU
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {totalMOUs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total MOUs
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {activeMOUs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {expiringMOUs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expiring Soon
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="error.main" fontWeight="bold">
                {expiredMOUs}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* MOUs Grid */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      ) : mous.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <Typography color="text.secondary">No MOUs found. Add your first MOU to get started.</Typography>
        </Box>
      ) : (
      <Box display="flex" gap={3} flexWrap="wrap">
        {mous.map(mou => (
          <Box flex="1" minWidth="450px" key={mou.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Icon sx={{ color: 'primary.main' }}>{getCategoryIcon(mou.category)}</Icon>
                    <Typography variant="h6" fontWeight="bold">
                      {mou.title}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      label={mou.status}
                      color={getStatusColor(mou.status)}
                      size="small"
                    />
                    <Chip
                      label={mou.category}
                      variant="outlined"
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, mou)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="subtitle2" color="primary" gutterBottom>
                  {mou.partnerOrganization}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {mou.purpose}
                </Typography>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Signed: {new Date(mou.signedDate).toLocaleDateString()} | 
                    Expires: {new Date(mou.expiryDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Responsible: {mou.responsiblePerson}
                  </Typography>
                </Box>

                {mou.keyBenefits.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                      Key Benefits:
                    </Typography>
                    {mou.keyBenefits.slice(0, 3).map((benefit, index) => (
                      <Chip
                        key={index}
                        label={benefit}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }}
                      />
                    ))}
                    {mou.keyBenefits.length > 3 && (
                      <Chip
                        label={`+${mou.keyBenefits.length - 3} more`}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>
                )}

                <Divider sx={{ my: 2 }} />

                {/* Document Links Section */}
                <Box>
                  <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      Documents ({mou.documentLinks.length})
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => addDocumentLink(mou.id)}
                      sx={{ fontSize: '0.7rem' }}
                    >
                      Add More
                    </Button>
                  </Box>
                  
                  {mou.documentLinks.map((link) => (
                    <Box key={link.id} sx={{ mb: 1.5 }}>
                      <Box display="flex" alignItems="center" gap={0.5} mb={0.5}>
                        <LinkIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        <TextField
                          size="small"
                          placeholder="Document title"
                          value={link.title}
                          onChange={(e) => updateDocumentLink(mou.id, link.id, 'title', e.target.value)}
                          variant="standard"
                          sx={{ 
                            flex: 1,
                            '& .MuiInputBase-root': { fontSize: '0.75rem' }
                          }}
                        />
                        <FormControl size="small" sx={{ minWidth: 80 }}>
                          <Select
                            value={link.type}
                            onChange={(e) => updateDocumentLink(mou.id, link.id, 'type', e.target.value)}
                            variant="standard"
                            sx={{ fontSize: '0.7rem' }}
                          >
                            <MenuItem value="PDF">PDF</MenuItem>
                            <MenuItem value="Google Docs">Docs</MenuItem>
                            <MenuItem value="Google Sheets">Sheets</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                          </Select>
                        </FormControl>
                        {mou.documentLinks.length > 1 && (
                          <IconButton
                            size="small"
                            onClick={() => removeDocumentLink(mou.id, link.id)}
                            sx={{ color: 'error.main' }}
                          >
                            <RemoveIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                      
                      <Box display="flex" alignItems="center" gap={1}>
                        <TextField
                          fullWidth
                          size="small"
                          placeholder="Paste document link (PDF, Google Docs, Google Sheets)..."
                          value={link.url}
                          onChange={(e) => updateDocumentLink(mou.id, link.id, 'url', e.target.value)}
                          variant="outlined"
                          sx={{ 
                            '& .MuiOutlinedInput-root': {
                              fontSize: '0.7rem',
                              height: '28px',
                            }
                          }}
                        />
                        {link.url && (
                          <IconButton
                            size="small"
                            onClick={() => window.open(link.url, '_blank')}
                            sx={{ color: 'primary.main' }}
                          >
                            <OpenIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      )}

      {/* Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedMOU && handleEditMOU(selectedMOU)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit MOU
        </MenuItem>
        <MenuItem 
          onClick={() => selectedMOU && handleDeleteMOU(selectedMOU)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete MOU
        </MenuItem>
      </Menu>

      {/* Add MOU Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add New MOU</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="MOU Title"
              value={mouForm.title}
              onChange={(e) => setMouForm({ ...mouForm, title: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Partner Organization"
                value={mouForm.partnerOrganization}
                onChange={(e) => setMouForm({ ...mouForm, partnerOrganization: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={mouForm.category}
                  onChange={(e) => setMouForm({ ...mouForm, category: e.target.value as MOU['category'] })}
                >
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Corporate">Corporate</MenuItem>
                  <MenuItem value="Government">Government</MenuItem>
                  <MenuItem value="Healthcare">Healthcare</MenuItem>
                  <MenuItem value="Insurance">Insurance</MenuItem>
                  <MenuItem value="Technology">Technology</MenuItem>
                  <MenuItem value="Research">Research</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Signed Date"
                type="date"
                value={mouForm.signedDate}
                onChange={(e) => setMouForm({ ...mouForm, signedDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={mouForm.expiryDate}
                onChange={(e) => setMouForm({ ...mouForm, expiryDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Validity Period"
                value={mouForm.validityPeriod}
                onChange={(e) => setMouForm({ ...mouForm, validityPeriod: e.target.value })}
                placeholder="e.g., 3 Years"
              />
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Purpose"
              value={mouForm.purpose}
              onChange={(e) => setMouForm({ ...mouForm, purpose: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Responsible Person"
                value={mouForm.responsiblePerson}
                onChange={(e) => setMouForm({ ...mouForm, responsiblePerson: e.target.value })}
              />
              <TextField
                fullWidth
                label="Partner Contact"
                value={mouForm.partnerContact}
                onChange={(e) => setMouForm({ ...mouForm, partnerContact: e.target.value })}
              />
            </Box>
            
            {/* Document Links Section */}
            <Box>
              <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                <Typography variant="subtitle1" fontWeight="medium">
                  Document Links
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => addDocumentLink()}
                >
                  Add Document
                </Button>
              </Box>
              
              {mouForm.documentLinks?.map((link) => (
                <Box key={link.id} sx={{ mb: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  <Box display="flex" gap={2} mb={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Document Title"
                      value={link.title}
                      onChange={(e) => updateDocumentLink(undefined, link.id, 'title', e.target.value)}
                    />
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                      <InputLabel>Type</InputLabel>
                      <Select
                        value={link.type}
                        onChange={(e) => updateDocumentLink(undefined, link.id, 'type', e.target.value)}
                      >
                        <MenuItem value="PDF">PDF</MenuItem>
                        <MenuItem value="Google Docs">Google Docs</MenuItem>
                        <MenuItem value="Google Sheets">Google Sheets</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    {mouForm.documentLinks && mouForm.documentLinks.length > 1 && (
                      <IconButton
                        size="small"
                        onClick={() => removeDocumentLink(undefined, link.id)}
                        sx={{ color: 'error.main' }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                  <TextField
                    fullWidth
                    size="small"
                    label="Document URL"
                    value={link.url}
                    onChange={(e) => updateDocumentLink(undefined, link.id, 'url', e.target.value)}
                    placeholder="Paste PDF link, Google Docs, or Google Sheets URL..."
                  />
                </Box>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddMOU}>Add MOU</Button>
        </DialogActions>
      </Dialog>

      {/* Edit MOU Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit MOU</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="MOU Title"
              value={mouForm.title}
              onChange={(e) => setMouForm({ ...mouForm, title: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Partner Organization"
                value={mouForm.partnerOrganization}
                onChange={(e) => setMouForm({ ...mouForm, partnerOrganization: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={mouForm.status}
                  onChange={(e) => setMouForm({ ...mouForm, status: e.target.value as MOU['status'] })}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                  <MenuItem value="Under Renewal">Under Renewal</MenuItem>
                  <MenuItem value="Terminated">Terminated</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Purpose"
              value={mouForm.purpose}
              onChange={(e) => setMouForm({ ...mouForm, purpose: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Financial Implications"
              value={mouForm.financialImplications}
              onChange={(e) => setMouForm({ ...mouForm, financialImplications: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Compliance Requirements"
              value={mouForm.complianceRequirements}
              onChange={(e) => setMouForm({ ...mouForm, complianceRequirements: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveEdit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete MOU</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedMOU?.title}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
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
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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
    </Container>
  );
}
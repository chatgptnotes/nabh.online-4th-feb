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
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Assignment as AuditIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

interface ClinicalAudit {
  id: string;
  title: string;
  description: string;
  category: 'Patient Safety' | 'Quality Indicators' | 'Infection Control' | 'Medication Safety' | 'Documentation' | 'Compliance' | 'Other';
  auditType: 'Internal' | 'External' | 'Self Assessment' | 'Peer Review';
  department: string;
  auditor: string;
  startDate: string;
  completionDate?: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Overdue' | 'Cancelled';
  frequency: 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly' | 'One-time';
  criteria: string[];
  findings: string[];
  recommendations: string[];
  actionItems: string[];
  compliance: number; // Percentage
  samplesReviewed: number;
  totalSamples: number;
  nabhStandard?: string;
  priority: 'High' | 'Medium' | 'Low';
  followUpDate?: string;
  createdAt: string;
  lastUpdated: string;
  documentsLink?: string; // Google Docs/Sheets link
}

// Database interface
interface ClinicalAuditDB {
  id: string;
  title: string;
  description: string | null;
  category: string;
  audit_type: string;
  department: string | null;
  auditor: string | null;
  start_date: string | null;
  completion_date: string | null;
  status: string;
  frequency: string;
  criteria: string[] | null;
  findings: string[] | null;
  recommendations: string[] | null;
  action_items: string[] | null;
  compliance: number;
  samples_reviewed: number;
  total_samples: number;
  nabh_standard: string | null;
  priority: string;
  follow_up_date: string | null;
  documents_link: string | null;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Helper function to convert DB format to component format
const dbToAudit = (db: ClinicalAuditDB): ClinicalAudit => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  category: db.category as ClinicalAudit['category'],
  auditType: db.audit_type as ClinicalAudit['auditType'],
  department: db.department || '',
  auditor: db.auditor || '',
  startDate: db.start_date || '',
  completionDate: db.completion_date || undefined,
  status: db.status as ClinicalAudit['status'],
  frequency: db.frequency as ClinicalAudit['frequency'],
  criteria: db.criteria || [],
  findings: db.findings || [],
  recommendations: db.recommendations || [],
  actionItems: db.action_items || [],
  compliance: db.compliance,
  samplesReviewed: db.samples_reviewed,
  totalSamples: db.total_samples,
  nabhStandard: db.nabh_standard || undefined,
  priority: db.priority as ClinicalAudit['priority'],
  followUpDate: db.follow_up_date || undefined,
  createdAt: db.created_at.split('T')[0],
  lastUpdated: db.updated_at.split('T')[0],
  documentsLink: db.documents_link || '',
});

export default function ClinicalAuditsMasterPage() {
  const [audits, setAudits] = useState<ClinicalAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<ClinicalAudit | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Fetch audits from Supabase
  useEffect(() => {
    const fetchAudits = async () => {
      try {
        const { data, error } = await supabase
          .from('clinical_audits')
          .select('*')
          .eq('is_active', true)
          .eq('hospital_id', 'hope-hospital')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setAudits((data as ClinicalAuditDB[] || []).map(dbToAudit));
      } catch (error) {
        console.error('Error fetching audits:', error);
        setSnackbar({ open: true, message: 'Failed to load audits', severity: 'error' });
      } finally {
        setLoading(false);
      }
    };

    fetchAudits();
  }, []);

  // Form state
  const [auditForm, setAuditForm] = useState<Partial<ClinicalAudit>>({
    title: '',
    description: '',
    category: 'Patient Safety',
    auditType: 'Internal',
    department: '',
    auditor: '',
    startDate: '',
    completionDate: '',
    status: 'Planned',
    frequency: 'Quarterly',
    compliance: 0,
    samplesReviewed: 0,
    totalSamples: 0,
    priority: 'Medium',
  });

  const [criteriaText, setCriteriaText] = useState('');
  const [findingsText, setFindingsText] = useState('');
  const [recommendationsText, setRecommendationsText] = useState('');
  const [actionItemsText, setActionItemsText] = useState('');

  const handleAddAudit = async () => {
    try {
      const dbData = {
        title: auditForm.title || '',
        description: auditForm.description || null,
        category: auditForm.category || 'Patient Safety',
        audit_type: auditForm.auditType || 'Internal',
        department: auditForm.department || null,
        auditor: auditForm.auditor || null,
        start_date: auditForm.startDate || null,
        completion_date: auditForm.completionDate || null,
        status: auditForm.status || 'Planned',
        frequency: auditForm.frequency || 'Quarterly',
        criteria: criteriaText.split('\n').filter(item => item.trim()),
        findings: findingsText.split('\n').filter(item => item.trim()),
        recommendations: recommendationsText.split('\n').filter(item => item.trim()),
        action_items: actionItemsText.split('\n').filter(item => item.trim()),
        compliance: auditForm.compliance || 0,
        samples_reviewed: auditForm.samplesReviewed || 0,
        total_samples: auditForm.totalSamples || 0,
        nabh_standard: auditForm.nabhStandard || null,
        priority: auditForm.priority || 'Medium',
        follow_up_date: auditForm.followUpDate || null,
        documents_link: auditForm.documentsLink || null,
        hospital_id: 'hope-hospital',
        is_active: true,
      };

      const { data, error } = await (supabase
        .from('clinical_audits') as any)
        .insert([dbData])
        .select()
        .single();

      if (error) throw error;

      setAudits([dbToAudit(data as ClinicalAuditDB), ...audits]);
      resetForm();
      setIsAddDialogOpen(false);
      setSnackbar({ open: true, message: 'Clinical audit added successfully', severity: 'success' });
    } catch (error) {
      console.error('Error adding audit:', error);
      setSnackbar({ open: true, message: 'Failed to add audit', severity: 'error' });
    }
  };

  const handleEditAudit = (audit: ClinicalAudit) => {
    setAuditForm(audit);
    setCriteriaText(audit.criteria.join('\n'));
    setFindingsText(audit.findings.join('\n'));
    setRecommendationsText(audit.recommendations.join('\n'));
    setActionItemsText(audit.actionItems.join('\n'));
    setSelectedAudit(audit);
    setIsEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleUpdateAudit = async () => {
    if (!selectedAudit) return;

    try {
      const dbData = {
        title: auditForm.title || '',
        description: auditForm.description || null,
        category: auditForm.category || 'Patient Safety',
        audit_type: auditForm.auditType || 'Internal',
        department: auditForm.department || null,
        auditor: auditForm.auditor || null,
        start_date: auditForm.startDate || null,
        completion_date: auditForm.completionDate || null,
        status: auditForm.status || 'Planned',
        frequency: auditForm.frequency || 'Quarterly',
        criteria: criteriaText.split('\n').filter(item => item.trim()),
        findings: findingsText.split('\n').filter(item => item.trim()),
        recommendations: recommendationsText.split('\n').filter(item => item.trim()),
        action_items: actionItemsText.split('\n').filter(item => item.trim()),
        compliance: auditForm.compliance || 0,
        samples_reviewed: auditForm.samplesReviewed || 0,
        total_samples: auditForm.totalSamples || 0,
        nabh_standard: auditForm.nabhStandard || null,
        priority: auditForm.priority || 'Medium',
        follow_up_date: auditForm.followUpDate || null,
        documents_link: auditForm.documentsLink || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase
        .from('clinical_audits') as any)
        .update(dbData)
        .eq('id', selectedAudit.id)
        .select()
        .single();

      if (error) throw error;

      setAudits(audits.map(a => a.id === selectedAudit.id ? dbToAudit(data as ClinicalAuditDB) : a));
      resetForm();
      setIsEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Clinical audit updated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error updating audit:', error);
      setSnackbar({ open: true, message: 'Failed to update audit', severity: 'error' });
    }
  };

  const handleDeleteAudit = (audit: ClinicalAudit) => {
    setSelectedAudit(audit);
    setIsDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAudit) return;

    try {
      const { error } = await (supabase
        .from('clinical_audits') as any)
        .update({ is_active: false })
        .eq('id', selectedAudit.id);

      if (error) throw error;

      setAudits(audits.filter(a => a.id !== selectedAudit.id));
      setIsDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Clinical audit deleted successfully', severity: 'success' });
    } catch (error) {
      console.error('Error deleting audit:', error);
      setSnackbar({ open: true, message: 'Failed to delete audit', severity: 'error' });
    }
  };

  const resetForm = () => {
    setAuditForm({
      title: '',
      description: '',
      category: 'Patient Safety',
      auditType: 'Internal',
      department: '',
      auditor: '',
      startDate: '',
      completionDate: '',
      status: 'Planned',
      frequency: 'Quarterly',
      compliance: 0,
      samplesReviewed: 0,
      totalSamples: 0,
      priority: 'Medium',
    });
    setCriteriaText('');
    setFindingsText('');
    setRecommendationsText('');
    setActionItemsText('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, audit: ClinicalAudit) => {
    setMenuAnchor(event.currentTarget);
    setSelectedAudit(audit);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'primary';
      case 'Planned': return 'info';
      case 'Overdue': return 'error';
      case 'Cancelled': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'error';
      case 'Medium': return 'warning';
      case 'Low': return 'success';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Patient Safety': return '🛡️';
      case 'Quality Indicators': return '📊';
      case 'Infection Control': return '🧼';
      case 'Medication Safety': return '💊';
      case 'Documentation': return '📋';
      case 'Compliance': return '✅';
      default: return '🔍';
    }
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <AuditIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Clinical Audits Master
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage all clinical audits and quality assessments
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Clinical Audit
        </Button>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {audits.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Audits
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {audits.filter(a => a.status === 'Completed').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {audits.filter(a => a.status === 'In Progress').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              In Progress
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="info.main" fontWeight="bold">
              {Math.round(audits.filter(a => a.compliance > 0).reduce((acc, a) => acc + a.compliance, 0) / audits.filter(a => a.compliance > 0).length || 0)}%
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Avg Compliance
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Audits Grid */}
      {audits.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No clinical audits found. Click "Add Clinical Audit" to create one.
          </Typography>
        </Box>
      ) : (
      <Box display="flex" gap={3} flexWrap="wrap">
        {audits.map(audit => (
          <Box flex="1" minWidth="400px" key={audit.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ fontSize: '1.5em' }}>
                      {getCategoryIcon(audit.category)}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {audit.title}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip 
                      label={audit.priority} 
                      size="small" 
                      color={getPriorityColor(audit.priority) as any}
                    />
                    <Chip 
                      label={audit.status} 
                      size="small" 
                      color={getStatusColor(audit.status) as any}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, audit)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {audit.description}
                </Typography>

                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <TrendingUpIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {audit.auditor} • {audit.department} • {audit.auditType}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <ScheduleIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    {audit.frequency} • Started: {new Date(audit.startDate).toLocaleDateString()}
                    {audit.completionDate && ` • Completed: ${new Date(audit.completionDate).toLocaleDateString()}`}
                  </Typography>
                  {audit.nabhStandard && (
                    <Typography variant="caption" color="primary" display="block">
                      NABH Standard: {audit.nabhStandard}
                    </Typography>
                  )}
                </Box>

                {audit.compliance > 0 && (
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                      <Typography variant="subtitle2">Compliance</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {audit.compliance}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={audit.compliance} 
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                      {audit.samplesReviewed} of {audit.totalSamples} samples reviewed
                    </Typography>
                  </Box>
                )}

                {audit.findings.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>Key Findings:</Typography>
                    {audit.findings.slice(0, 2).map((finding, index) => (
                      <Typography key={index} variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        • {finding}
                      </Typography>
                    ))}
                    {audit.findings.length > 2 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        +{audit.findings.length - 2} more findings
                      </Typography>
                    )}
                  </Box>
                )}

                {audit.recommendations.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>Recommendations:</Typography>
                    {audit.recommendations.slice(0, 2).map((rec, index) => (
                      <Typography key={index} variant="body2" color="info.main" sx={{ fontSize: '0.85rem' }}>
                        ➤ {rec}
                      </Typography>
                    ))}
                    {audit.recommendations.length > 2 && (
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem' }}>
                        +{audit.recommendations.length - 2} more recommendations
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Documents Link Section */}
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <TrendingUpIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    <Typography variant="caption" fontWeight="medium" color="text.secondary">
                      Audit Documents:
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Google Docs/Sheets link..."
                      value={audit.documentsLink || ''}
                      onChange={(e) => {
                        const updatedAudit = { ...audit, documentsLink: e.target.value };
                        setAudits(audits.map(a => a.id === audit.id ? updatedAudit : a));
                      }}
                      onBlur={async (e) => {
                        try {
                          await (supabase
                            .from('clinical_audits') as any)
                            .update({ documents_link: e.target.value || null })
                            .eq('id', audit.id);
                        } catch (error) {
                          console.error('Error updating documents link:', error);
                        }
                      }}
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.75rem',
                          height: '32px',
                        }
                      }}
                    />
                    {audit.documentsLink && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(audit.documentsLink, '_blank')}
                        sx={{ minWidth: 'auto', px: 1, height: 32, fontSize: '0.7rem' }}
                      >
                        Open
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
      )}

      {/* Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => selectedAudit && handleEditAudit(selectedAudit)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Audit
        </MenuItem>
        <MenuItem 
          onClick={() => selectedAudit && handleDeleteAudit(selectedAudit)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Audit
        </MenuItem>
      </Menu>

      {/* Add Audit Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add New Clinical Audit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Audit Title"
              fullWidth
              value={auditForm.title || ''}
              onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={auditForm.description || ''}
              onChange={(e) => setAuditForm({ ...auditForm, description: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={auditForm.category || 'Patient Safety'}
                  onChange={(e) => setAuditForm({ ...auditForm, category: e.target.value as any })}
                >
                  <MenuItem value="Patient Safety">Patient Safety</MenuItem>
                  <MenuItem value="Quality Indicators">Quality Indicators</MenuItem>
                  <MenuItem value="Infection Control">Infection Control</MenuItem>
                  <MenuItem value="Medication Safety">Medication Safety</MenuItem>
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Compliance">Compliance</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Audit Type</InputLabel>
                <Select
                  value={auditForm.auditType || 'Internal'}
                  onChange={(e) => setAuditForm({ ...auditForm, auditType: e.target.value as any })}
                >
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                  <MenuItem value="Self Assessment">Self Assessment</MenuItem>
                  <MenuItem value="Peer Review">Peer Review</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Department"
                fullWidth
                value={auditForm.department || ''}
                onChange={(e) => setAuditForm({ ...auditForm, department: e.target.value })}
              />
              <TextField
                label="Auditor"
                fullWidth
                value={auditForm.auditor || ''}
                onChange={(e) => setAuditForm({ ...auditForm, auditor: e.target.value })}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={auditForm.startDate || ''}
                onChange={(e) => setAuditForm({ ...auditForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Completion Date"
                type="date"
                fullWidth
                value={auditForm.completionDate || ''}
                onChange={(e) => setAuditForm({ ...auditForm, completionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={auditForm.status || 'Planned'}
                  onChange={(e) => setAuditForm({ ...auditForm, status: e.target.value as any })}
                >
                  <MenuItem value="Planned">Planned</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={auditForm.frequency || 'Quarterly'}
                  onChange={(e) => setAuditForm({ ...auditForm, frequency: e.target.value as any })}
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Half-yearly">Half-yearly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="One-time">One-time</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Samples Reviewed"
                type="number"
                fullWidth
                value={auditForm.samplesReviewed || ''}
                onChange={(e) => setAuditForm({ ...auditForm, samplesReviewed: parseInt(e.target.value) || 0 })}
              />
              <TextField
                label="Total Samples"
                type="number"
                fullWidth
                value={auditForm.totalSamples || ''}
                onChange={(e) => setAuditForm({ ...auditForm, totalSamples: parseInt(e.target.value) || 0 })}
              />
              <TextField
                label="Compliance %"
                type="number"
                fullWidth
                value={auditForm.compliance || ''}
                onChange={(e) => setAuditForm({ ...auditForm, compliance: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="NABH Standard (optional)"
                fullWidth
                value={auditForm.nabhStandard || ''}
                onChange={(e) => setAuditForm({ ...auditForm, nabhStandard: e.target.value })}
                placeholder="e.g., PCC.1, HIC.2"
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={auditForm.priority || 'Medium'}
                  onChange={(e) => setAuditForm({ ...auditForm, priority: e.target.value as any })}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Audit Criteria (one per line)"
              fullWidth
              multiline
              rows={4}
              value={criteriaText}
              onChange={(e) => setCriteriaText(e.target.value)}
            />
            <TextField
              label="Findings (one per line)"
              fullWidth
              multiline
              rows={3}
              value={findingsText}
              onChange={(e) => setFindingsText(e.target.value)}
            />
            <TextField
              label="Recommendations (one per line)"
              fullWidth
              multiline
              rows={3}
              value={recommendationsText}
              onChange={(e) => setRecommendationsText(e.target.value)}
            />
            <TextField
              label="Action Items (one per line)"
              fullWidth
              multiline
              rows={3}
              value={actionItemsText}
              onChange={(e) => setActionItemsText(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddAudit}>Add Audit</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Audit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Clinical Audit</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Audit Title"
              fullWidth
              value={auditForm.title || ''}
              onChange={(e) => setAuditForm({ ...auditForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={auditForm.description || ''}
              onChange={(e) => setAuditForm({ ...auditForm, description: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={auditForm.category || 'Patient Safety'}
                  onChange={(e) => setAuditForm({ ...auditForm, category: e.target.value as any })}
                >
                  <MenuItem value="Patient Safety">Patient Safety</MenuItem>
                  <MenuItem value="Quality Indicators">Quality Indicators</MenuItem>
                  <MenuItem value="Infection Control">Infection Control</MenuItem>
                  <MenuItem value="Medication Safety">Medication Safety</MenuItem>
                  <MenuItem value="Documentation">Documentation</MenuItem>
                  <MenuItem value="Compliance">Compliance</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Audit Type</InputLabel>
                <Select
                  value={auditForm.auditType || 'Internal'}
                  onChange={(e) => setAuditForm({ ...auditForm, auditType: e.target.value as any })}
                >
                  <MenuItem value="Internal">Internal</MenuItem>
                  <MenuItem value="External">External</MenuItem>
                  <MenuItem value="Self Assessment">Self Assessment</MenuItem>
                  <MenuItem value="Peer Review">Peer Review</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Department"
                fullWidth
                value={auditForm.department || ''}
                onChange={(e) => setAuditForm({ ...auditForm, department: e.target.value })}
              />
              <TextField
                label="Auditor"
                fullWidth
                value={auditForm.auditor || ''}
                onChange={(e) => setAuditForm({ ...auditForm, auditor: e.target.value })}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                value={auditForm.startDate || ''}
                onChange={(e) => setAuditForm({ ...auditForm, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Completion Date"
                type="date"
                fullWidth
                value={auditForm.completionDate || ''}
                onChange={(e) => setAuditForm({ ...auditForm, completionDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={auditForm.status || 'Planned'}
                  onChange={(e) => setAuditForm({ ...auditForm, status: e.target.value as any })}
                >
                  <MenuItem value="Planned">Planned</MenuItem>
                  <MenuItem value="In Progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Overdue">Overdue</MenuItem>
                  <MenuItem value="Cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={auditForm.frequency || 'Quarterly'}
                  onChange={(e) => setAuditForm({ ...auditForm, frequency: e.target.value as any })}
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Half-yearly">Half-yearly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="One-time">One-time</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Samples Reviewed"
                type="number"
                fullWidth
                value={auditForm.samplesReviewed || ''}
                onChange={(e) => setAuditForm({ ...auditForm, samplesReviewed: parseInt(e.target.value) || 0 })}
              />
              <TextField
                label="Total Samples"
                type="number"
                fullWidth
                value={auditForm.totalSamples || ''}
                onChange={(e) => setAuditForm({ ...auditForm, totalSamples: parseInt(e.target.value) || 0 })}
              />
              <TextField
                label="Compliance %"
                type="number"
                fullWidth
                value={auditForm.compliance || ''}
                onChange={(e) => setAuditForm({ ...auditForm, compliance: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0, max: 100 }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="NABH Standard (optional)"
                fullWidth
                value={auditForm.nabhStandard || ''}
                onChange={(e) => setAuditForm({ ...auditForm, nabhStandard: e.target.value })}
                placeholder="e.g., PCC.1, HIC.2"
              />
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={auditForm.priority || 'Medium'}
                  onChange={(e) => setAuditForm({ ...auditForm, priority: e.target.value as any })}
                >
                  <MenuItem value="High">High</MenuItem>
                  <MenuItem value="Medium">Medium</MenuItem>
                  <MenuItem value="Low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="Audit Criteria (one per line)"
              fullWidth
              multiline
              rows={4}
              value={criteriaText}
              onChange={(e) => setCriteriaText(e.target.value)}
            />
            <TextField
              label="Findings (one per line)"
              fullWidth
              multiline
              rows={3}
              value={findingsText}
              onChange={(e) => setFindingsText(e.target.value)}
            />
            <TextField
              label="Recommendations (one per line)"
              fullWidth
              multiline
              rows={3}
              value={recommendationsText}
              onChange={(e) => setRecommendationsText(e.target.value)}
            />
            <TextField
              label="Action Items (one per line)"
              fullWidth
              multiline
              rows={3}
              value={actionItemsText}
              onChange={(e) => setActionItemsText(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateAudit}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Clinical Audit</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedAudit?.title}</strong>?
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
            Delete Audit
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
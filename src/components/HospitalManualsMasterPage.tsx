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
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  MenuBook as ManualIcon,
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
  Update as UpdateIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

// Database interface
interface HospitalManualDB {
  id: string;
  title: string;
  description: string | null;
  category: string;
  version: string;
  author: string | null;
  department: string | null;
  created_date: string | null;
  last_updated: string | null;
  next_review_date: string | null;
  status: string;
  approved_by: string | null;
  file_url: string | null;
  file_size: string | null;
  page_count: number | null;
  nabh_relevant: boolean;
  nabh_standards: string[] | null;
  tags: string[] | null;
  review_frequency: string;
  documents_link: string | null;
  distribution_list: string[] | null;
  implementation_date: string | null;
  training_required: boolean;
  hospital_id: string;
  is_active: boolean;
}

interface HospitalManual {
  id: string;
  title: string;
  description: string;
  category: 'Policy & Procedures' | 'Emergency Response' | 'Infection Control' | 'Quality Management' | 'Safety & Security' | 'HR & Admin' | 'Clinical Protocols' | 'Equipment & Technology' | 'Other';
  version: string;
  author: string;
  department: string;
  createdDate: string;
  lastUpdated: string;
  nextReviewDate: string;
  status: 'Current' | 'Under Review' | 'Expired' | 'Draft' | 'Archived';
  approvedBy: string;
  fileUrl?: string;
  fileSize?: string;
  pageCount?: number;
  nabhRelevant: boolean;
  nabhStandards: string[];
  tags: string[];
  reviewFrequency: 'Monthly' | 'Quarterly' | 'Half-yearly' | 'Yearly' | 'As needed';
  documentsLink?: string; // Google Docs/Sheets link
  distributionList: string[];
  implementationDate?: string;
  trainingRequired: boolean;
}

// Helper function to convert DB record to HospitalManual
const dbToManual = (db: HospitalManualDB): HospitalManual => ({
  id: db.id,
  title: db.title,
  description: db.description || '',
  category: db.category as HospitalManual['category'],
  version: db.version,
  author: db.author || '',
  department: db.department || '',
  createdDate: db.created_date || '',
  lastUpdated: db.last_updated || '',
  nextReviewDate: db.next_review_date || '',
  status: db.status as HospitalManual['status'],
  approvedBy: db.approved_by || '',
  fileUrl: db.file_url || undefined,
  fileSize: db.file_size || undefined,
  pageCount: db.page_count || undefined,
  nabhRelevant: db.nabh_relevant,
  nabhStandards: db.nabh_standards || [],
  tags: db.tags || [],
  reviewFrequency: db.review_frequency as HospitalManual['reviewFrequency'],
  documentsLink: db.documents_link || undefined,
  distributionList: db.distribution_list || [],
  implementationDate: db.implementation_date || undefined,
  trainingRequired: db.training_required,
});

export default function HospitalManualsMasterPage() {
  const [manuals, setManuals] = useState<HospitalManual[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch manuals from Supabase
  useEffect(() => {
    const fetchManuals = async () => {
      try {
        const { data, error } = await (supabase.from('hospital_manuals') as any)
          .select('*')
          .eq('is_active', true)
          .order('title', { ascending: true });

        if (error) {
          console.error('Error fetching manuals:', error);
        } else {
          const mappedManuals = (data as HospitalManualDB[] || []).map(dbToManual);
          setManuals(mappedManuals);
        }
      } catch (err) {
        console.error('Error fetching manuals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchManuals();
  }, []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedManual, setSelectedManual] = useState<HospitalManual | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [manualForm, setManualForm] = useState<Partial<HospitalManual>>({
    title: '',
    description: '',
    category: 'Policy & Procedures',
    version: '1.0',
    author: '',
    department: '',
    createdDate: '',
    status: 'Draft',
    approvedBy: '',
    reviewFrequency: 'Yearly',
    nabhRelevant: false,
    trainingRequired: false,
    tags: [],
    nabhStandards: [],
    distributionList: [],
    documentsLink: '',
  });

  const [tagsText, setTagsText] = useState('');
  const [nabhStandardsText, setNabhStandardsText] = useState('');
  const [distributionText, setDistributionText] = useState('');

  const handleAddManual = async () => {
    const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);
    const nabhStandards = nabhStandardsText.split(',').map(std => std.trim()).filter(std => std);
    const distributionList = distributionText.split(',').map(dist => dist.trim()).filter(dist => dist);
    const lastUpdated = new Date().toISOString().split('T')[0];
    const nextReviewDate = getNextReviewDate(manualForm.reviewFrequency || 'Yearly');

    try {
      const { data, error } = await (supabase.from('hospital_manuals') as any)
        .insert({
          title: manualForm.title,
          description: manualForm.description,
          category: manualForm.category,
          version: manualForm.version,
          author: manualForm.author,
          department: manualForm.department,
          created_date: manualForm.createdDate || new Date().toISOString().split('T')[0],
          last_updated: lastUpdated,
          next_review_date: nextReviewDate,
          status: manualForm.status,
          approved_by: manualForm.approvedBy,
          nabh_relevant: manualForm.nabhRelevant,
          nabh_standards: nabhStandards,
          tags: tags,
          review_frequency: manualForm.reviewFrequency,
          documents_link: manualForm.documentsLink,
          distribution_list: distributionList,
          implementation_date: manualForm.implementationDate,
          training_required: manualForm.trainingRequired,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding manual:', error);
        setSnackbar({ open: true, message: 'Failed to add manual', severity: 'error' });
        return;
      }

      const newManual = dbToManual(data as HospitalManualDB);
      setManuals([...manuals, newManual]);
      resetForm();
      setIsAddDialogOpen(false);
      setSnackbar({ open: true, message: 'Manual added successfully', severity: 'success' });
    } catch (err) {
      console.error('Error adding manual:', err);
      setSnackbar({ open: true, message: 'Failed to add manual', severity: 'error' });
    }
  };

  const handleEditManual = (manual: HospitalManual) => {
    setManualForm(manual);
    setTagsText(manual.tags.join(', '));
    setNabhStandardsText(manual.nabhStandards.join(', '));
    setDistributionText(manual.distributionList.join(', '));
    setSelectedManual(manual);
    setIsEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleUpdateManual = async () => {
    if (!selectedManual) return;

    const tags = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag);
    const nabhStandards = nabhStandardsText.split(',').map(std => std.trim()).filter(std => std);
    const distributionList = distributionText.split(',').map(dist => dist.trim()).filter(dist => dist);
    const lastUpdated = new Date().toISOString().split('T')[0];

    try {
      const { error } = await (supabase.from('hospital_manuals') as any)
        .update({
          title: manualForm.title,
          description: manualForm.description,
          category: manualForm.category,
          version: manualForm.version,
          author: manualForm.author,
          department: manualForm.department,
          created_date: manualForm.createdDate,
          last_updated: lastUpdated,
          next_review_date: manualForm.nextReviewDate,
          status: manualForm.status,
          approved_by: manualForm.approvedBy,
          nabh_relevant: manualForm.nabhRelevant,
          nabh_standards: nabhStandards,
          tags: tags,
          review_frequency: manualForm.reviewFrequency,
          documents_link: manualForm.documentsLink,
          distribution_list: distributionList,
          implementation_date: manualForm.implementationDate,
          training_required: manualForm.trainingRequired,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedManual.id);

      if (error) {
        console.error('Error updating manual:', error);
        setSnackbar({ open: true, message: 'Failed to update manual', severity: 'error' });
        return;
      }

      const updatedManual: HospitalManual = {
        ...selectedManual,
        ...manualForm,
        tags,
        nabhStandards,
        distributionList,
        lastUpdated,
      } as HospitalManual;

      setManuals(manuals.map(m => m.id === selectedManual.id ? updatedManual : m));
      resetForm();
      setIsEditDialogOpen(false);
      setSnackbar({ open: true, message: 'Manual updated successfully', severity: 'success' });
    } catch (err) {
      console.error('Error updating manual:', err);
      setSnackbar({ open: true, message: 'Failed to update manual', severity: 'error' });
    }
  };

  const handleDeleteManual = (manual: HospitalManual) => {
    setSelectedManual(manual);
    setIsDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedManual) return;

    try {
      // Soft delete - set is_active to false
      const { error } = await (supabase.from('hospital_manuals') as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', selectedManual.id);

      if (error) {
        console.error('Error deleting manual:', error);
        setSnackbar({ open: true, message: 'Failed to delete manual', severity: 'error' });
        return;
      }

      setManuals(manuals.filter(m => m.id !== selectedManual.id));
      setIsDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'Manual deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting manual:', err);
      setSnackbar({ open: true, message: 'Failed to delete manual', severity: 'error' });
    }
  };

  const resetForm = () => {
    setManualForm({
      title: '',
      description: '',
      category: 'Policy & Procedures',
      version: '1.0',
      author: '',
      department: '',
      createdDate: '',
      status: 'Draft',
      approvedBy: '',
      reviewFrequency: 'Yearly',
      nabhRelevant: false,
      trainingRequired: false,
    });
    setTagsText('');
    setNabhStandardsText('');
    setDistributionText('');
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, manual: HospitalManual) => {
    setMenuAnchor(event.currentTarget);
    setSelectedManual(manual);
  };

  const getNextReviewDate = (frequency: string): string => {
    const now = new Date();
    switch (frequency) {
      case 'Monthly':
        now.setMonth(now.getMonth() + 1);
        break;
      case 'Quarterly':
        now.setMonth(now.getMonth() + 3);
        break;
      case 'Half-yearly':
        now.setMonth(now.getMonth() + 6);
        break;
      case 'Yearly':
        now.setFullYear(now.getFullYear() + 1);
        break;
      default:
        now.setFullYear(now.getFullYear() + 1);
    }
    return now.toISOString().split('T')[0];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Current': return 'success';
      case 'Under Review': return 'warning';
      case 'Expired': return 'error';
      case 'Draft': return 'info';
      case 'Archived': return 'default';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Policy & Procedures': return '📋';
      case 'Emergency Response': return '🚨';
      case 'Infection Control': return '🧼';
      case 'Quality Management': return '📊';
      case 'Safety & Security': return '🛡️';
      case 'HR & Admin': return '👥';
      case 'Clinical Protocols': return '⚕️';
      case 'Equipment & Technology': return '🔧';
      default: return '📚';
    }
  };

  const isOverdue = (nextReviewDate: string): boolean => {
    return new Date(nextReviewDate) < new Date();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <ManualIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Hospital Manuals Master
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Manage all hospital policies, procedures, and operational manuals
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add Manual
        </Button>
      </Box>

      {/* Stats */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="primary" fontWeight="bold">
              {manuals.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Manuals
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="success.main" fontWeight="bold">
              {manuals.filter(m => m.status === 'Current').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="warning.main" fontWeight="bold">
              {manuals.filter(m => isOverdue(m.nextReviewDate)).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Overdue Review
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ minWidth: 200 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography variant="h3" color="error.main" fontWeight="bold">
              {manuals.filter(m => m.nabhRelevant).length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              NABH Relevant
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Manuals Grid */}
      {!loading && (
        <Box display="flex" gap={3} flexWrap="wrap">
          {manuals.length === 0 ? (
            <Box textAlign="center" py={6} width="100%">
              <ManualIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No manuals found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Add Manual" to create your first hospital manual.
              </Typography>
            </Box>
          ) : (
            manuals.map(manual => (
          <Box flex="1" minWidth="400px" key={manual.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="body1" sx={{ fontSize: '1.5em' }}>
                      {getCategoryIcon(manual.category)}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {manual.title}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    {manual.nabhRelevant && (
                      <Chip label="NABH" size="small" color="error" />
                    )}
                    {isOverdue(manual.nextReviewDate) && (
                      <Chip label="OVERDUE" size="small" color="error" />
                    )}
                    <Chip 
                      label={manual.status} 
                      size="small" 
                      color={getStatusColor(manual.status) as any}
                    />
                    <IconButton size="small" onClick={(e) => handleMenuOpen(e, manual)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {manual.description}
                </Typography>

                <Box mb={2}>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <ViewIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    Version {manual.version} • Author: {manual.author} • {manual.department}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block">
                    <UpdateIcon sx={{ fontSize: 14, mr: 0.5 }} />
                    Updated: {new Date(manual.lastUpdated).toLocaleDateString()} • 
                    Review: {new Date(manual.nextReviewDate).toLocaleDateString()}
                  </Typography>
                  {manual.fileSize && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      <DownloadIcon sx={{ fontSize: 14, mr: 0.5 }} />
                      {manual.fileSize} • {manual.pageCount} pages
                    </Typography>
                  )}
                </Box>

                {manual.nabhStandards.length > 0 && (
                  <Box mb={2}>
                    <Typography variant="subtitle2" gutterBottom>NABH Standards:</Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {manual.nabhStandards.slice(0, 4).map(standard => (
                        <Chip
                          key={standard}
                          label={standard}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {manual.nabhStandards.length > 4 && (
                        <Chip
                          label={`+${manual.nabhStandards.length - 4} more`}
                          size="small"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                )}

                <Box mb={2}>
                  <Typography variant="subtitle2" gutterBottom>Tags:</Typography>
                  <Box display="flex" gap={0.5} flexWrap="wrap">
                    {manual.tags.slice(0, 3).map(tag => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        variant="outlined"
                      />
                    ))}
                    {manual.tags.length > 3 && (
                      <Chip
                        label={`+${manual.tags.length - 3} more`}
                        size="small"
                        variant="outlined"
                      />
                    )}
                  </Box>
                </Box>

                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Approved by: {manual.approvedBy} • Review: {manual.reviewFrequency}
                  </Typography>
                  {manual.trainingRequired && (
                    <Chip label="Training Required" size="small" color="warning" sx={{ mt: 1 }} />
                  )}
                </Box>

                {/* Documents Link Section */}
                <Box sx={{ mt: 2 }}>
                  <Box display="flex" alignItems="center" gap={0.5} mb={1}>
                    <Icon sx={{ fontSize: 16, color: 'primary.main' }}>link</Icon>
                    <Typography variant="caption" fontWeight="medium" color="text.secondary">
                      Documents Link:
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Google Docs/Sheets link..."
                      value={manual.documentsLink || ''}
                      onChange={(e) => {
                        const updatedManual = { ...manual, documentsLink: e.target.value };
                        setManuals(manuals.map(m => m.id === manual.id ? updatedManual : m));
                      }}
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.75rem',
                          height: '32px',
                        }
                      }}
                    />
                    {manual.documentsLink && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(manual.documentsLink, '_blank')}
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
            ))
          )}
        </Box>
      )}

      {/* Actions Menu */}
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={() => setMenuAnchor(null)}>
        <MenuItem onClick={() => selectedManual && handleEditManual(selectedManual)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Manual
        </MenuItem>
        <MenuItem 
          onClick={() => selectedManual && handleDeleteManual(selectedManual)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Manual
        </MenuItem>
      </Menu>

      {/* Add Manual Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Add New Hospital Manual</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Manual Title"
              fullWidth
              value={manualForm.title || ''}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={manualForm.description || ''}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={manualForm.category || 'Policy & Procedures'}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as any })}
                >
                  <MenuItem value="Policy & Procedures">Policy & Procedures</MenuItem>
                  <MenuItem value="Emergency Response">Emergency Response</MenuItem>
                  <MenuItem value="Infection Control">Infection Control</MenuItem>
                  <MenuItem value="Quality Management">Quality Management</MenuItem>
                  <MenuItem value="Safety & Security">Safety & Security</MenuItem>
                  <MenuItem value="HR & Admin">HR & Admin</MenuItem>
                  <MenuItem value="Clinical Protocols">Clinical Protocols</MenuItem>
                  <MenuItem value="Equipment & Technology">Equipment & Technology</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={manualForm.status || 'Draft'}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Current">Current</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Version"
                fullWidth
                value={manualForm.version || ''}
                onChange={(e) => setManualForm({ ...manualForm, version: e.target.value })}
                placeholder="e.g., 1.0, 2.3"
              />
              <TextField
                label="Author"
                fullWidth
                value={manualForm.author || ''}
                onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Department"
                fullWidth
                value={manualForm.department || ''}
                onChange={(e) => setManualForm({ ...manualForm, department: e.target.value })}
              />
              <TextField
                label="Approved By"
                fullWidth
                value={manualForm.approvedBy || ''}
                onChange={(e) => setManualForm({ ...manualForm, approvedBy: e.target.value })}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Created Date"
                type="date"
                fullWidth
                value={manualForm.createdDate || ''}
                onChange={(e) => setManualForm({ ...manualForm, createdDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Review Frequency</InputLabel>
                <Select
                  value={manualForm.reviewFrequency || 'Yearly'}
                  onChange={(e) => setManualForm({ ...manualForm, reviewFrequency: e.target.value as any })}
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Half-yearly">Half-yearly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="As needed">As needed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl>
                <InputLabel>NABH Relevant</InputLabel>
                <Select
                  value={manualForm.nabhRelevant ? 'yes' : 'no'}
                  onChange={(e) => setManualForm({ ...manualForm, nabhRelevant: e.target.value === 'yes' })}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Training Required</InputLabel>
                <Select
                  value={manualForm.trainingRequired ? 'yes' : 'no'}
                  onChange={(e) => setManualForm({ ...manualForm, trainingRequired: e.target.value === 'yes' })}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="NABH Standards (comma separated)"
              fullWidth
              value={nabhStandardsText}
              onChange={(e) => setNabhStandardsText(e.target.value)}
              placeholder="e.g., HIC.1, PCC.8, PSQ.2"
            />
            <TextField
              label="Tags (comma separated)"
              fullWidth
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g., Hand Hygiene, PPE, Documentation"
            />
            <TextField
              label="Distribution List (comma separated)"
              fullWidth
              value={distributionText}
              onChange={(e) => setDistributionText(e.target.value)}
              placeholder="e.g., All Clinical Staff, Nursing, Pharmacy"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsAddDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleAddManual}>Add Manual</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Manual Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Edit Hospital Manual</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Manual Title"
              fullWidth
              value={manualForm.title || ''}
              onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              value={manualForm.description || ''}
              onChange={(e) => setManualForm({ ...manualForm, description: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={manualForm.category || 'Policy & Procedures'}
                  onChange={(e) => setManualForm({ ...manualForm, category: e.target.value as any })}
                >
                  <MenuItem value="Policy & Procedures">Policy & Procedures</MenuItem>
                  <MenuItem value="Emergency Response">Emergency Response</MenuItem>
                  <MenuItem value="Infection Control">Infection Control</MenuItem>
                  <MenuItem value="Quality Management">Quality Management</MenuItem>
                  <MenuItem value="Safety & Security">Safety & Security</MenuItem>
                  <MenuItem value="HR & Admin">HR & Admin</MenuItem>
                  <MenuItem value="Clinical Protocols">Clinical Protocols</MenuItem>
                  <MenuItem value="Equipment & Technology">Equipment & Technology</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={manualForm.status || 'Draft'}
                  onChange={(e) => setManualForm({ ...manualForm, status: e.target.value as any })}
                >
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Current">Current</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Version"
                fullWidth
                value={manualForm.version || ''}
                onChange={(e) => setManualForm({ ...manualForm, version: e.target.value })}
                placeholder="e.g., 1.0, 2.3"
              />
              <TextField
                label="Author"
                fullWidth
                value={manualForm.author || ''}
                onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Department"
                fullWidth
                value={manualForm.department || ''}
                onChange={(e) => setManualForm({ ...manualForm, department: e.target.value })}
              />
              <TextField
                label="Approved By"
                fullWidth
                value={manualForm.approvedBy || ''}
                onChange={(e) => setManualForm({ ...manualForm, approvedBy: e.target.value })}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                label="Created Date"
                type="date"
                fullWidth
                value={manualForm.createdDate || ''}
                onChange={(e) => setManualForm({ ...manualForm, createdDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
              <FormControl fullWidth>
                <InputLabel>Review Frequency</InputLabel>
                <Select
                  value={manualForm.reviewFrequency || 'Yearly'}
                  onChange={(e) => setManualForm({ ...manualForm, reviewFrequency: e.target.value as any })}
                >
                  <MenuItem value="Monthly">Monthly</MenuItem>
                  <MenuItem value="Quarterly">Quarterly</MenuItem>
                  <MenuItem value="Half-yearly">Half-yearly</MenuItem>
                  <MenuItem value="Yearly">Yearly</MenuItem>
                  <MenuItem value="As needed">As needed</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Box display="flex" gap={2} alignItems="center">
              <FormControl>
                <InputLabel>NABH Relevant</InputLabel>
                <Select
                  value={manualForm.nabhRelevant ? 'yes' : 'no'}
                  onChange={(e) => setManualForm({ ...manualForm, nabhRelevant: e.target.value === 'yes' })}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
              <FormControl>
                <InputLabel>Training Required</InputLabel>
                <Select
                  value={manualForm.trainingRequired ? 'yes' : 'no'}
                  onChange={(e) => setManualForm({ ...manualForm, trainingRequired: e.target.value === 'yes' })}
                >
                  <MenuItem value="yes">Yes</MenuItem>
                  <MenuItem value="no">No</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              label="NABH Standards (comma separated)"
              fullWidth
              value={nabhStandardsText}
              onChange={(e) => setNabhStandardsText(e.target.value)}
              placeholder="e.g., HIC.1, PCC.8, PSQ.2"
            />
            <TextField
              label="Tags (comma separated)"
              fullWidth
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="e.g., Hand Hygiene, PPE, Documentation"
            />
            <TextField
              label="Distribution List (comma separated)"
              fullWidth
              value={distributionText}
              onChange={(e) => setDistributionText(e.target.value)}
              placeholder="e.g., All Clinical Staff, Nursing, Pharmacy"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdateManual}>Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
        <DialogTitle>Delete Manual</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedManual?.title}</strong>?
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
            Delete Manual
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
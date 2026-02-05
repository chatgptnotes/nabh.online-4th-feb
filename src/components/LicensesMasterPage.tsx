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
  Grid,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Gavel as LicenseIcon,
  Warning as WarningIcon,
  CheckCircle as ValidIcon,
  Schedule as ExpiringIcon,
  Error as ExpiredIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

// Database interface
interface LicenseDB {
  id: string;
  name: string;
  category: string;
  license_number: string | null;
  issuing_authority: string | null;
  issue_date: string | null;
  expiry_date: string | null;
  validity_period: string | null;
  status: string;
  description: string | null;
  attached_document: string | null;
  renewal_process: string | null;
  responsible_person: string | null;
  reminder_days: number;
  last_renewal_date: string | null;
  renewal_cost: string | null;
  documents_link: string | null;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface License {
  id: string;
  name: string;
  category: 'Medical' | 'Fire Safety' | 'Environmental' | 'Building' | 'Business' | 'Equipment' | 'Professional' | 'Other';
  licenseNumber: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  validityPeriod: string; // e.g., "5 Years", "Annual", "Permanent"
  status: 'Valid' | 'Expiring Soon' | 'Expired' | 'Under Renewal';
  description: string;
  attachedDocument?: string;
  renewalProcess: string;
  responsiblePerson: string;
  reminderDays: number; // Days before expiry to send reminder
  lastRenewalDate?: string;
  renewalCost?: string;
  documentsLink?: string; // Google Docs/Sheets link
  createdAt: string;
  updatedAt: string;
}

// Helper function to convert DB record to License
const dbToLicense = (db: LicenseDB): License => ({
  id: db.id,
  name: db.name,
  category: db.category as License['category'],
  licenseNumber: db.license_number || '',
  issuingAuthority: db.issuing_authority || '',
  issueDate: db.issue_date || '',
  expiryDate: db.expiry_date || '',
  validityPeriod: db.validity_period || '',
  status: db.status as License['status'],
  description: db.description || '',
  attachedDocument: db.attached_document || undefined,
  renewalProcess: db.renewal_process || '',
  responsiblePerson: db.responsible_person || '',
  reminderDays: db.reminder_days,
  lastRenewalDate: db.last_renewal_date || undefined,
  renewalCost: db.renewal_cost || undefined,
  documentsLink: db.documents_link || undefined,
  createdAt: db.created_at,
  updatedAt: db.updated_at,
});

export default function LicensesMasterPage() {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch licenses from Supabase
  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        const { data, error } = await (supabase.from('licenses') as any)
          .select('*')
          .eq('is_active', true)
          .order('category', { ascending: true });

        if (error) {
          console.error('Error fetching licenses:', error);
        } else {
          const mappedLicenses = (data as LicenseDB[] || []).map(dbToLicense);
          setLicenses(mappedLicenses);
        }
      } catch (err) {
        console.error('Error fetching licenses:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLicenses();
  }, []);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state for new/edit license
  const [licenseForm, setLicenseForm] = useState<Partial<License>>({
    name: '',
    category: 'Medical',
    licenseNumber: '',
    issuingAuthority: '',
    issueDate: '',
    expiryDate: '',
    validityPeriod: '',
    status: 'Valid',
    description: '',
    renewalProcess: '',
    responsiblePerson: '',
    reminderDays: 60,
    renewalCost: '',
    documentsLink: '',
  });

  const getStatusColor = (status: License['status']) => {
    switch (status) {
      case 'Valid': return 'success';
      case 'Expiring Soon': return 'warning';
      case 'Expired': return 'error';
      case 'Under Renewal': return 'info';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: License['status']) => {
    switch (status) {
      case 'Valid': return <ValidIcon />;
      case 'Expiring Soon': return <ExpiringIcon />;
      case 'Expired': return <ExpiredIcon />;
      case 'Under Renewal': return <WarningIcon />;
      default: return <LicenseIcon />;
    }
  };

  const getCategoryIcon = (category: License['category']) => {
    switch (category) {
      case 'Medical': return 'medical_services';
      case 'Fire Safety': return 'local_fire_department';
      case 'Environmental': return 'eco';
      case 'Building': return 'apartment';
      case 'Business': return 'business';
      case 'Equipment': return 'precision_manufacturing';
      case 'Professional': return 'badge';
      default: return 'description';
    }
  };

  const handleAddLicense = async () => {
    try {
      const { data, error } = await (supabase.from('licenses') as any)
        .insert({
          name: licenseForm.name,
          category: licenseForm.category,
          license_number: licenseForm.licenseNumber,
          issuing_authority: licenseForm.issuingAuthority,
          issue_date: licenseForm.issueDate || null,
          expiry_date: licenseForm.expiryDate,
          validity_period: licenseForm.validityPeriod,
          status: licenseForm.status,
          description: licenseForm.description,
          renewal_process: licenseForm.renewalProcess,
          responsible_person: licenseForm.responsiblePerson,
          reminder_days: licenseForm.reminderDays,
          renewal_cost: licenseForm.renewalCost,
          documents_link: licenseForm.documentsLink,
        })
        .select()
        .single();

      if (error) {
        console.error('Error adding license:', error);
        setSnackbar({ open: true, message: 'Failed to add license', severity: 'error' });
        return;
      }

      const newLicense = dbToLicense(data as LicenseDB);
      setLicenses([...licenses, newLicense]);
      resetForm();
      setIsAddDialogOpen(false);
      setSnackbar({ open: true, message: 'License added successfully', severity: 'success' });
    } catch (err) {
      console.error('Error adding license:', err);
      setSnackbar({ open: true, message: 'Failed to add license', severity: 'error' });
    }
  };

  const handleEditLicense = (license: License) => {
    setSelectedLicense(license);
    setLicenseForm({ ...license });
    setIsEditDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedLicense) return;

    try {
      const { error } = await (supabase.from('licenses') as any)
        .update({
          name: licenseForm.name,
          category: licenseForm.category,
          license_number: licenseForm.licenseNumber,
          issuing_authority: licenseForm.issuingAuthority,
          issue_date: licenseForm.issueDate || null,
          expiry_date: licenseForm.expiryDate,
          validity_period: licenseForm.validityPeriod,
          status: licenseForm.status,
          description: licenseForm.description,
          renewal_process: licenseForm.renewalProcess,
          responsible_person: licenseForm.responsiblePerson,
          reminder_days: licenseForm.reminderDays,
          renewal_cost: licenseForm.renewalCost,
          documents_link: licenseForm.documentsLink,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedLicense.id);

      if (error) {
        console.error('Error updating license:', error);
        setSnackbar({ open: true, message: 'Failed to update license', severity: 'error' });
        return;
      }

      const updatedLicense = {
        ...selectedLicense,
        ...licenseForm,
        updatedAt: new Date().toISOString(),
      };

      setLicenses(licenses.map(l => l.id === selectedLicense.id ? updatedLicense : l));
      setIsEditDialogOpen(false);
      resetForm();
      setSnackbar({ open: true, message: 'License updated successfully', severity: 'success' });
    } catch (err) {
      console.error('Error updating license:', err);
      setSnackbar({ open: true, message: 'Failed to update license', severity: 'error' });
    }
  };

  const handleDeleteLicense = (license: License) => {
    setSelectedLicense(license);
    setIsDeleteDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedLicense) return;

    try {
      // Soft delete - set is_active to false
      const { error } = await (supabase.from('licenses') as any)
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', selectedLicense.id);

      if (error) {
        console.error('Error deleting license:', error);
        setSnackbar({ open: true, message: 'Failed to delete license', severity: 'error' });
        return;
      }

      setLicenses(licenses.filter(l => l.id !== selectedLicense.id));
      setIsDeleteDialogOpen(false);
      setSnackbar({ open: true, message: 'License deleted successfully', severity: 'success' });
    } catch (err) {
      console.error('Error deleting license:', err);
      setSnackbar({ open: true, message: 'Failed to delete license', severity: 'error' });
    }
  };

  const resetForm = () => {
    setLicenseForm({
      name: '',
      category: 'Medical',
      licenseNumber: '',
      issuingAuthority: '',
      issueDate: '',
      expiryDate: '',
      validityPeriod: '',
      status: 'Valid',
      description: '',
      renewalProcess: '',
      responsiblePerson: '',
      reminderDays: 60,
      renewalCost: '',
      documentsLink: '',
    });
    setSelectedLicense(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, license: License) => {
    setMenuAnchor(event.currentTarget);
    setSelectedLicense(license);
  };

  const handleMenuClose = () => {
    setMenuAnchor(null);
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    if (expiryDate === 'Permanent') return Infinity;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Get statistics
  const totalLicenses = licenses.length;
  const validLicenses = licenses.filter(l => l.status === 'Valid').length;
  const expiringLicenses = licenses.filter(l => l.status === 'Expiring Soon').length;
  const expiredLicenses = licenses.filter(l => l.status === 'Expired').length;

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <LicenseIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              Licenses & Statutory Requirements
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Track all licenses, certificates, and regulatory compliance with expiry monitoring
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add License
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Box display="flex" gap={2} mb={4} flexWrap="wrap">
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary" fontWeight="bold">
                {totalLicenses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Licenses
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main" fontWeight="bold">
                {validLicenses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Valid
              </Typography>
            </CardContent>
          </Card>
        </Box>
        <Box flex="1" minWidth="200px">
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="warning.main" fontWeight="bold">
                {expiringLicenses}
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
                {expiredLicenses}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Expired
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" py={6}>
          <CircularProgress />
        </Box>
      )}

      {/* Licenses Grid */}
      {!loading && (
        <Box display="flex" gap={3} flexWrap="wrap">
          {licenses.length === 0 ? (
            <Box textAlign="center" py={6} width="100%">
              <LicenseIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                No licenses found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Click "Add License" to create your first license.
              </Typography>
            </Box>
          ) : (
            licenses.map(license => (
          <Box flex="1" minWidth="400px" key={license.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Icon sx={{ color: 'primary.main' }}>{getCategoryIcon(license.category)}</Icon>
                    <Typography variant="h6" fontWeight="bold">
                      {license.name}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Chip
                      icon={getStatusIcon(license.status)}
                      label={license.status}
                      color={getStatusColor(license.status)}
                      size="small"
                    />
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, license)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {license.description}
                </Typography>

                <Box sx={{ mt: 2, mb: 2 }}>
                  <Grid container spacing={1}>
                    <Grid size={6}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        License Number:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {license.licenseNumber}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Issuing Authority:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium" noWrap>
                        {license.issuingAuthority}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Issue Date:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {new Date(license.issueDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Expiry Date:
                      </Typography>
                      <Typography 
                        variant="body2" 
                        fontWeight="medium"
                        color={getDaysUntilExpiry(license.expiryDate) <= 60 ? 'error.main' : 'text.primary'}
                      >
                        {license.expiryDate === 'Permanent' 
                          ? 'Permanent' 
                          : new Date(license.expiryDate).toLocaleDateString()
                        }
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Responsible Person:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {license.responsiblePerson}
                      </Typography>
                    </Grid>
                    <Grid size={6}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        Renewal Cost:
                      </Typography>
                      <Typography variant="body2" fontWeight="medium">
                        {license.renewalCost || 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>

                {license.expiryDate !== 'Permanent' && (
                  <Box sx={{ mb: 2 }}>
                    {getDaysUntilExpiry(license.expiryDate) <= 0 ? (
                      <Alert severity="error" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        License has expired!
                      </Alert>
                    ) : getDaysUntilExpiry(license.expiryDate) <= 60 ? (
                      <Alert severity="warning" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        Expires in {getDaysUntilExpiry(license.expiryDate)} days
                      </Alert>
                    ) : (
                      <Alert severity="info" sx={{ fontSize: '0.75rem', py: 0.5 }}>
                        Valid for {getDaysUntilExpiry(license.expiryDate)} days
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Google Docs Link Section */}
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
                      value={license.documentsLink || ''}
                      onChange={(e) => {
                        const updatedLicense = { ...license, documentsLink: e.target.value, updatedAt: new Date().toISOString() };
                        setLicenses(licenses.map(l => l.id === license.id ? updatedLicense : l));
                      }}
                      variant="outlined"
                      sx={{ 
                        '& .MuiOutlinedInput-root': {
                          fontSize: '0.75rem',
                          height: '32px',
                        }
                      }}
                    />
                    {license.documentsLink && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => window.open(license.documentsLink, '_blank')}
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
      <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
        <MenuItem onClick={() => selectedLicense && handleEditLicense(selectedLicense)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit License
        </MenuItem>
        <MenuItem 
          onClick={() => selectedLicense && handleDeleteLicense(selectedLicense)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete License
        </MenuItem>
      </Menu>

      {/* Add License Dialog */}
      <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New License</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="License/Certificate Name"
              value={licenseForm.name}
              onChange={(e) => setLicenseForm({ ...licenseForm, name: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={licenseForm.category}
                  onChange={(e) => setLicenseForm({ ...licenseForm, category: e.target.value as License['category'] })}
                >
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Fire Safety">Fire Safety</MenuItem>
                  <MenuItem value="Environmental">Environmental</MenuItem>
                  <MenuItem value="Building">Building</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="License Number"
                value={licenseForm.licenseNumber}
                onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Issuing Authority"
              value={licenseForm.issuingAuthority}
              onChange={(e) => setLicenseForm({ ...licenseForm, issuingAuthority: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Issue Date"
                type="date"
                value={licenseForm.issueDate}
                onChange={(e) => setLicenseForm({ ...licenseForm, issueDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={licenseForm.expiryDate}
                onChange={(e) => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
                helperText="Leave empty for permanent licenses"
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Validity Period"
                value={licenseForm.validityPeriod}
                onChange={(e) => setLicenseForm({ ...licenseForm, validityPeriod: e.target.value })}
                placeholder="e.g., 1 Year, 5 Years, Permanent"
              />
              <TextField
                fullWidth
                label="Renewal Cost"
                value={licenseForm.renewalCost}
                onChange={(e) => setLicenseForm({ ...licenseForm, renewalCost: e.target.value })}
                placeholder="e.g., ₹25,000"
              />
            </Box>
            <TextField
              fullWidth
              label="Responsible Person"
              value={licenseForm.responsiblePerson}
              onChange={(e) => setLicenseForm({ ...licenseForm, responsiblePerson: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={licenseForm.description}
              onChange={(e) => setLicenseForm({ ...licenseForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Renewal Process"
              value={licenseForm.renewalProcess}
              onChange={(e) => setLicenseForm({ ...licenseForm, renewalProcess: e.target.value })}
              placeholder="Describe the renewal process and requirements"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddLicense}>Add License</Button>
        </DialogActions>
      </Dialog>

      {/* Edit License Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit License</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label="License/Certificate Name"
              value={licenseForm.name}
              onChange={(e) => setLicenseForm({ ...licenseForm, name: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={licenseForm.category}
                  onChange={(e) => setLicenseForm({ ...licenseForm, category: e.target.value as License['category'] })}
                >
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Fire Safety">Fire Safety</MenuItem>
                  <MenuItem value="Environmental">Environmental</MenuItem>
                  <MenuItem value="Building">Building</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                  <MenuItem value="Equipment">Equipment</MenuItem>
                  <MenuItem value="Professional">Professional</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="License Number"
                value={licenseForm.licenseNumber}
                onChange={(e) => setLicenseForm({ ...licenseForm, licenseNumber: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Issuing Authority"
              value={licenseForm.issuingAuthority}
              onChange={(e) => setLicenseForm({ ...licenseForm, issuingAuthority: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Issue Date"
                type="date"
                value={licenseForm.issueDate}
                onChange={(e) => setLicenseForm({ ...licenseForm, issueDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
              <TextField
                fullWidth
                label="Expiry Date"
                type="date"
                value={licenseForm.expiryDate}
                onChange={(e) => setLicenseForm({ ...licenseForm, expiryDate: e.target.value })}
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Box>
            <Box display="flex" gap={2}>
              <TextField
                fullWidth
                label="Validity Period"
                value={licenseForm.validityPeriod}
                onChange={(e) => setLicenseForm({ ...licenseForm, validityPeriod: e.target.value })}
              />
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={licenseForm.status}
                  onChange={(e) => setLicenseForm({ ...licenseForm, status: e.target.value as License['status'] })}
                >
                  <MenuItem value="Valid">Valid</MenuItem>
                  <MenuItem value="Expiring Soon">Expiring Soon</MenuItem>
                  <MenuItem value="Expired">Expired</MenuItem>
                  <MenuItem value="Under Renewal">Under Renewal</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Responsible Person"
              value={licenseForm.responsiblePerson}
              onChange={(e) => setLicenseForm({ ...licenseForm, responsiblePerson: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={2}
              label="Description"
              value={licenseForm.description}
              onChange={(e) => setLicenseForm({ ...licenseForm, description: e.target.value })}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Renewal Process"
              value={licenseForm.renewalProcess}
              onChange={(e) => setLicenseForm({ ...licenseForm, renewalProcess: e.target.value })}
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
        <DialogTitle>Delete License</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{selectedLicense?.name}</strong>?
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
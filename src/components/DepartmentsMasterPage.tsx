import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  IconButton,
  Paper,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Tooltip,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Search,
  Download,
  Add,
  Business,
  Schedule,
  CheckCircle,
  Cancel,
  Warning,
  Assessment,
  Close,
  Edit,
  Delete
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

// Types
type DepartmentCategory = 'Clinical Speciality' | 'Super Speciality' | 'Support Services' | 'Administration';
type DepartmentType = 'Medical' | 'Surgical' | 'Diagnostic' | 'Support' | 'Administrative';

interface DepartmentDB {
  id: string;
  dept_id: string;
  name: string;
  code: string;
  category: string;
  type: string;
  description: string | null;
  head_of_department: string | null;
  contact_number: string | null;
  nabh_is_active: boolean;
  nabh_last_audit_date: string | null;
  nabh_compliance_status: string;
  services: string[] | null;
  equipment_list: string[] | null;
  staff_count: number | null;
  is_emergency_service: boolean;
  operating_hours: string | null;
  hospital_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Departments Master Page Component
 * Displays and manages all hospital departments from scope of services
 */
// Initial form state for new department
const initialFormState = {
  name: '',
  code: '',
  category: 'Clinical Speciality' as DepartmentCategory,
  type: 'Medical' as DepartmentType,
  description: '',
  head_of_department: '',
  contact_number: '',
  operating_hours: '',
  is_emergency_service: false,
  services: '',
};

const DepartmentsMasterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DepartmentCategory | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<DepartmentType | 'All'>('All');
  const [complianceFilter, setComplianceFilter] = useState<'All' | 'Compliant' | 'Non-Compliant' | 'Under Review' | 'Not Assessed'>('All');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  // Supabase data state
  const [departmentsData, setDepartmentsData] = useState<DepartmentDB[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Department dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Edit Department state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<DepartmentDB | null>(null);

  // Delete confirmation state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingDepartment, setDeletingDepartment] = useState<DepartmentDB | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch departments from Supabase
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await (supabase.from('departments') as any)
          .select('*')
          .eq('is_active', true)
          .order('dept_id', { ascending: true });

        if (error) {
          console.error('Error fetching departments:', error);
        } else {
          setDepartmentsData(data as DepartmentDB[] || []);
        }
      } catch (err) {
        console.error('Error fetching departments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  // Calculate statistics from fetched data
  const complianceStats = useMemo(() => {
    const total = departmentsData.length;
    const compliant = departmentsData.filter(dept => dept.nabh_compliance_status === 'Compliant').length;
    const nonCompliant = departmentsData.filter(dept => dept.nabh_compliance_status === 'Non-Compliant').length;
    const underReview = departmentsData.filter(dept => dept.nabh_compliance_status === 'Under Review').length;
    const notAssessed = departmentsData.filter(dept => dept.nabh_compliance_status === 'Not Assessed').length;
    return {
      total,
      compliant,
      nonCompliant,
      underReview,
      notAssessed,
      compliancePercentage: total > 0 ? Math.round((compliant / total) * 100) : 0
    };
  }, [departmentsData]);

  const categorySummary = useMemo(() => {
    return {
      'Clinical Speciality': departmentsData.filter(dept => dept.category === 'Clinical Speciality').length,
      'Super Speciality': departmentsData.filter(dept => dept.category === 'Super Speciality').length,
      'Support Services': departmentsData.filter(dept => dept.category === 'Support Services').length,
      'Administration': departmentsData.filter(dept => dept.category === 'Administration').length,
    };
  }, [departmentsData]);

  const emergencyDepartmentsCount = useMemo(() => {
    return departmentsData.filter(dept => dept.is_emergency_service).length;
  }, [departmentsData]);

  // Filter departments based on search and filters
  const filteredDepartments = useMemo(() => {
    let filtered = departmentsData;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(dept =>
        dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dept.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (dept.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(dept => dept.category === categoryFilter);
    }

    // Type filter
    if (typeFilter !== 'All') {
      filtered = filtered.filter(dept => dept.type === typeFilter);
    }

    // Compliance filter
    if (complianceFilter !== 'All') {
      filtered = filtered.filter(dept => dept.nabh_compliance_status === complianceFilter);
    }

    // Emergency services filter
    if (showEmergencyOnly) {
      filtered = filtered.filter(dept => dept.is_emergency_service);
    }

    return filtered;
  }, [departmentsData, searchTerm, categoryFilter, typeFilter, complianceFilter, showEmergencyOnly]);

  // Handle export to CSV
  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "Code,Name,Category,Type,Emergency Service,Operating Hours,Compliance Status,Services\n" +
      departmentsData.map(dept =>
        `"${dept.code}","${dept.name}","${dept.category}","${dept.type}","${dept.is_emergency_service}","${dept.operating_hours || ''}","${dept.nabh_compliance_status}","${(dept.services || []).join(', ')}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `departments_master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get compliance status color and icon
  const getComplianceDisplay = (status: string) => {
    switch (status) {
      case 'Compliant':
        return { icon: CheckCircle, color: 'success' as const, label: 'Compliant' };
      case 'Non-Compliant':
        return { icon: Cancel, color: 'error' as const, label: 'Non-Compliant' };
      case 'Under Review':
        return { icon: Warning, color: 'warning' as const, label: 'Under Review' };
      default:
        return { icon: Warning, color: 'secondary' as const, label: 'Not Assessed' };
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setTypeFilter('All');
    setComplianceFilter('All');
    setShowEmergencyOnly(false);
  };

  // Add Department handlers
  const handleOpenAddDialog = () => {
    setFormData(initialFormState);
    setOpenAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setOpenAddDialog(false);
    setFormData(initialFormState);
  };

  const handleFormChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddDepartment = async () => {
    // Validate required fields
    if (!formData.name.trim() || !formData.code.trim()) {
      setSnackbar({ open: true, message: 'Name and Code are required fields', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      // Generate dept_id based on existing count
      const deptId = `DEPT${String(departmentsData.length + 1).padStart(3, '0')}`;

      // Parse services from comma-separated string to array
      const servicesArray = formData.services
        ? formData.services.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const newDepartment = {
        dept_id: deptId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        type: formData.type,
        description: formData.description.trim() || null,
        head_of_department: formData.head_of_department.trim() || null,
        contact_number: formData.contact_number.trim() || null,
        operating_hours: formData.operating_hours.trim() || null,
        is_emergency_service: formData.is_emergency_service,
        services: servicesArray.length > 0 ? servicesArray : null,
        nabh_is_active: true,
        nabh_compliance_status: 'Not Assessed',
        hospital_id: 'hope-hospital',
        is_active: true,
      };

      const { data, error } = await (supabase.from('departments') as any)
        .insert([newDepartment])
        .select()
        .single();

      if (error) {
        console.error('Error adding department:', error);
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      } else {
        setDepartmentsData(prev => [...prev, data as DepartmentDB]);
        setSnackbar({ open: true, message: 'Department added successfully!', severity: 'success' });
        handleCloseAddDialog();
      }
    } catch (err) {
      console.error('Error adding department:', err);
      setSnackbar({ open: true, message: 'Failed to add department', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Edit Department handlers
  const handleOpenEditDialog = (department: DepartmentDB) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      code: department.code,
      category: department.category as DepartmentCategory,
      type: department.type as DepartmentType,
      description: department.description || '',
      head_of_department: department.head_of_department || '',
      contact_number: department.contact_number || '',
      operating_hours: department.operating_hours || '',
      is_emergency_service: department.is_emergency_service,
      services: (department.services || []).join(', '),
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingDepartment(null);
    setFormData(initialFormState);
  };

  const handleUpdateDepartment = async () => {
    if (!editingDepartment) return;

    if (!formData.name.trim() || !formData.code.trim()) {
      setSnackbar({ open: true, message: 'Name and Code are required fields', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const servicesArray = formData.services
        ? formData.services.split(',').map(s => s.trim()).filter(s => s)
        : [];

      const updatedData = {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        category: formData.category,
        type: formData.type,
        description: formData.description.trim() || null,
        head_of_department: formData.head_of_department.trim() || null,
        contact_number: formData.contact_number.trim() || null,
        operating_hours: formData.operating_hours.trim() || null,
        is_emergency_service: formData.is_emergency_service,
        services: servicesArray.length > 0 ? servicesArray : null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await (supabase.from('departments') as any)
        .update(updatedData)
        .eq('id', editingDepartment.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating department:', error);
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      } else {
        setDepartmentsData(prev => prev.map(d => d.id === editingDepartment.id ? data as DepartmentDB : d));
        setSnackbar({ open: true, message: 'Department updated successfully!', severity: 'success' });
        handleCloseEditDialog();
      }
    } catch (err) {
      console.error('Error updating department:', err);
      setSnackbar({ open: true, message: 'Failed to update department', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Department handlers
  const handleOpenDeleteDialog = (department: DepartmentDB) => {
    setDeletingDepartment(department);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setDeletingDepartment(null);
  };

  const handleDeleteDepartment = async () => {
    if (!deletingDepartment) return;

    setDeleting(true);
    try {
      const { error } = await (supabase.from('departments') as any)
        .update({ is_active: false })
        .eq('id', deletingDepartment.id);

      if (error) {
        console.error('Error deleting department:', error);
        setSnackbar({ open: true, message: `Error: ${error.message}`, severity: 'error' });
      } else {
        setDepartmentsData(prev => prev.filter(d => d.id !== deletingDepartment.id));
        setSnackbar({ open: true, message: 'Department deleted successfully!', severity: 'success' });
        handleCloseDeleteDialog();
      }
    } catch (err) {
      console.error('Error deleting department:', err);
      setSnackbar({ open: true, message: 'Failed to delete department', severity: 'error' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Departments Master
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Based on Scope of Services - Ayushman Nagpur Hospital (Sep 26, 2025)
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={handleExport}
              size="large"
            >
              Export for Audit
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              size="large"
              onClick={handleOpenAddDialog}
            >
              Add Department
            </Button>
          </Box>
        </Box>

        {/* Statistics Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Total Departments
                    </Typography>
                    <Typography variant="h4">
                      {complianceStats.total}
                    </Typography>
                  </Box>
                  <Business color="primary" sx={{ fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      NABH Compliance
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {complianceStats.compliancePercentage}%
                    </Typography>
                  </Box>
                  <CheckCircle color="success" sx={{ fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Emergency Services
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {emergencyDepartmentsCount}
                    </Typography>
                  </Box>
                  <Schedule color="error" sx={{ fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Under Review
                    </Typography>
                    <Typography variant="h4" color="warning.main">
                      {complianceStats.underReview}
                    </Typography>
                  </Box>
                  <Warning color="warning" sx={{ fontSize: 32 }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Category Summary */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Assessment />
              Department Categories
            </Typography>
            <Grid container spacing={3}>
              {Object.entries(categorySummary).map(([category, count]) => (
                <Grid size={{ xs: 6, md: 3 }} key={category}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h4" color="primary.main">
                      {count}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {category}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Filters and Search */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Grid container spacing={3}>
            {/* Search */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Category Filter */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={categoryFilter}
                  label="Category"
                  onChange={(e) => setCategoryFilter(e.target.value as DepartmentCategory | 'All')}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Clinical Speciality">Clinical Speciality</MenuItem>
                  <MenuItem value="Super Speciality">Super Speciality</MenuItem>
                  <MenuItem value="Support Services">Support Services</MenuItem>
                  <MenuItem value="Administration">Administration</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Type Filter */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={typeFilter}
                  label="Type"
                  onChange={(e) => setTypeFilter(e.target.value as DepartmentType | 'All')}
                >
                  <MenuItem value="All">All Types</MenuItem>
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Surgical">Surgical</MenuItem>
                  <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Compliance Filter */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Compliance</InputLabel>
                <Select
                  value={complianceFilter}
                  label="Compliance"
                  onChange={(e) => setComplianceFilter(e.target.value as typeof complianceFilter)}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Compliant">Compliant</MenuItem>
                  <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  <MenuItem value="Under Review">Under Review</MenuItem>
                  <MenuItem value="Not Assessed">Not Assessed</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Emergency Filter */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showEmergencyOnly}
                    onChange={(e) => setShowEmergencyOnly(e.target.checked)}
                  />
                }
                label="Emergency Only"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredDepartments.length} of {departmentsData.length} departments
            </Typography>
            {(searchTerm || categoryFilter !== 'All' || typeFilter !== 'All' || complianceFilter !== 'All' || showEmergencyOnly) && (
              <Button
                size="small"
                onClick={clearAllFilters}
                color="primary"
              >
                Clear Filters
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Departments Grid */}
      {!loading && (
        <Grid container spacing={3}>
          {filteredDepartments.map((department) => {
            const complianceDisplay = getComplianceDisplay(department.nabh_compliance_status);
            const ComplianceIcon = complianceDisplay.icon;
            const services = department.services || [];

            return (
              <Grid size={{ xs: 12, lg: 6 }} key={department.id}>
                <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                  <CardContent>
                    {/* Department Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6">
                            {department.name}
                          </Typography>
                          <Chip label={department.code} size="small" color="primary" variant="outlined" />
                          {department.is_emergency_service && (
                            <Chip label="24/7" size="small" color="error" />
                          )}
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {department.description}
                        </Typography>
                      </Box>
                      <Tooltip title={complianceDisplay.label}>
                        <IconButton color={complianceDisplay.color} size="small">
                          <ComplianceIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    {/* Department Details */}
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          CATEGORY
                        </Typography>
                        <Typography variant="body2">
                          {department.category}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          TYPE
                        </Typography>
                        <Typography variant="body2">
                          {department.type}
                        </Typography>
                      </Grid>
                    </Grid>

                    {/* Operating Hours */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Schedule fontSize="small" color="action" />
                      <Typography variant="body2" color="text.secondary">
                        {department.operating_hours || 'Not specified'}
                      </Typography>
                    </Box>

                    {/* Services */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                        SERVICES
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {services.slice(0, 3).map((service, index) => (
                          <Chip
                            key={index}
                            label={service}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                        {services.length > 3 && (
                          <Chip
                            label={`+${services.length - 3} more`}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Compliance Status */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Chip
                        icon={<ComplianceIcon />}
                        label={complianceDisplay.label}
                        size="small"
                        color={complianceDisplay.color}
                        variant="outlined"
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit Department">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleOpenEditDialog(department)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete Department">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleOpenDeleteDialog(department)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Button size="small" color="primary">
                          View Details
                        </Button>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* Empty State */}
      {!loading && filteredDepartments.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Business sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No departments found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters.
          </Typography>
        </Box>
      )}

      {/* Add Department Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Add New Department</Typography>
          <IconButton onClick={handleCloseAddDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            {/* Name */}
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Department Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
                placeholder="e.g., Cardiology"
              />
            </Grid>

            {/* Code */}
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                required
                placeholder="e.g., CARD"
                inputProps={{ maxLength: 10 }}
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  <MenuItem value="Clinical Speciality">Clinical Speciality</MenuItem>
                  <MenuItem value="Super Speciality">Super Speciality</MenuItem>
                  <MenuItem value="Support Services">Support Services</MenuItem>
                  <MenuItem value="Administration">Administration</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Type */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Surgical">Surgical</MenuItem>
                  <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Description */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={2}
                placeholder="Brief description of the department"
              />
            </Grid>

            {/* Head of Department */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Head of Department"
                value={formData.head_of_department}
                onChange={(e) => handleFormChange('head_of_department', e.target.value)}
                placeholder="e.g., Dr. Sharma"
              />
            </Grid>

            {/* Contact Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contact_number}
                onChange={(e) => handleFormChange('contact_number', e.target.value)}
                placeholder="e.g., +91-712-XXXXXXX"
              />
            </Grid>

            {/* Operating Hours */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Operating Hours"
                value={formData.operating_hours}
                onChange={(e) => handleFormChange('operating_hours', e.target.value)}
                placeholder="e.g., 24/7 or 9 AM - 5 PM"
              />
            </Grid>

            {/* Emergency Service */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_emergency_service}
                    onChange={(e) => handleFormChange('is_emergency_service', e.target.checked)}
                  />
                }
                label="24/7 Emergency Service"
              />
            </Grid>

            {/* Services */}
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Services (comma-separated)"
                value={formData.services}
                onChange={(e) => handleFormChange('services', e.target.value)}
                multiline
                rows={2}
                placeholder="e.g., OPD Consultation, IPD Care, Emergency Services"
                helperText="Enter services separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAddDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddDepartment}
            disabled={saving || !formData.name.trim() || !formData.code.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : <Add />}
          >
            {saving ? 'Adding...' : 'Add Department'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Department Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Department</Typography>
          <IconButton onClick={handleCloseEditDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Department Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <TextField
                fullWidth
                label="Code"
                value={formData.code}
                onChange={(e) => handleFormChange('code', e.target.value.toUpperCase())}
                required
                inputProps={{ maxLength: 10 }}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  <MenuItem value="Clinical Speciality">Clinical Speciality</MenuItem>
                  <MenuItem value="Super Speciality">Super Speciality</MenuItem>
                  <MenuItem value="Support Services">Support Services</MenuItem>
                  <MenuItem value="Administration">Administration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => handleFormChange('type', e.target.value)}
                >
                  <MenuItem value="Medical">Medical</MenuItem>
                  <MenuItem value="Surgical">Surgical</MenuItem>
                  <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                  <MenuItem value="Administrative">Administrative</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => handleFormChange('description', e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Head of Department"
                value={formData.head_of_department}
                onChange={(e) => handleFormChange('head_of_department', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.contact_number}
                onChange={(e) => handleFormChange('contact_number', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Operating Hours"
                value={formData.operating_hours}
                onChange={(e) => handleFormChange('operating_hours', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.is_emergency_service}
                    onChange={(e) => handleFormChange('is_emergency_service', e.target.checked)}
                  />
                }
                label="24/7 Emergency Service"
              />
            </Grid>
            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                label="Services (comma-separated)"
                value={formData.services}
                onChange={(e) => handleFormChange('services', e.target.value)}
                multiline
                rows={2}
                helperText="Enter services separated by commas"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateDepartment}
            disabled={saving || !formData.name.trim() || !formData.code.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : <Edit />}
          >
            {saving ? 'Updating...' : 'Update Department'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Department</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{deletingDepartment?.name}</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDeleteDialog} disabled={deleting}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteDepartment}
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <Delete />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DepartmentsMasterPage;
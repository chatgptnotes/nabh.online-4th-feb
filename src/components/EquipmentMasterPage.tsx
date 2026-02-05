import React, { useState, useMemo } from 'react';
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
  Paper,
  FormControlLabel,
  Checkbox,
  InputAdornment,
  Tooltip,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  CircularProgress
} from '@mui/material';
import {
  Search,
  Download,
  Add,
  MedicalServices,
  CheckCircle,
  Cancel,
  Warning,
  Assessment,
  Build,
  Star,
  Schedule,
  LocationOn,
  Close,
  Edit,
  Delete
} from '@mui/icons-material';
import {
  equipmentMaster,
  getCriticalEquipment,
  getEquipmentStats,
  getEquipmentCategorySummary,
  exportEquipmentListForAudit,
  type EquipmentCategory,
  type EquipmentStatus,
  type EquipmentCompliance
} from '../data/equipmentMaster';

/**
 * Equipment Master Page Component
 * Displays and manages all hospital equipment from Google Sheets data
 */
// Initial form state for new equipment
const initialFormState = {
  name: '',
  category: 'Critical Care' as EquipmentCategory,
  manufacturer: '',
  model: '',
  serialNumber: '',
  department: 'ICU',
  location: '',
  status: 'Operational' as EquipmentStatus,
  compliance: 'Compliant' as EquipmentCompliance,
  yearOfPurchase: new Date().getFullYear().toString(),
  criticalEquipment: false,
  biomedicalClearance: false,
  backupAvailable: false,
};

const EquipmentMasterPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<EquipmentCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'All'>('All');
  const [complianceFilter, setComplianceFilter] = useState<EquipmentCompliance | 'All'>('All');
  const [showCriticalOnly, setShowCriticalOnly] = useState(false);
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Local equipment list (can be modified)
  const [localEquipment, setLocalEquipment] = useState(equipmentMaster);

  // Add Equipment dialog state
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // View Details dialog state
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any | null>(null);

  // Edit Equipment dialog state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<any | null>(null);

  // Calculate statistics dynamically from localEquipment
  const equipmentStats = useMemo(() => {
    const total = localEquipment.length;
    const operational = localEquipment.filter(eq => eq.status === 'Operational').length;
    const critical = localEquipment.filter(eq => eq.criticalEquipment).length;
    const compliant = localEquipment.filter(eq => eq.compliance === 'Compliant').length;
    return {
      total,
      operational,
      operationalPercentage: total > 0 ? Math.round((operational / total) * 100) : 0,
      critical,
      compliant,
      compliancePercentage: total > 0 ? Math.round((compliant / total) * 100) : 0,
    };
  }, [localEquipment]);

  const categorySummary = useMemo(() => {
    return {
      'Critical Care': localEquipment.filter(eq => eq.category === 'Critical Care').length,
      'Monitoring': localEquipment.filter(eq => eq.category === 'Monitoring').length,
      'Diagnostic': localEquipment.filter(eq => eq.category === 'Diagnostic').length,
      'Therapeutic': localEquipment.filter(eq => eq.category === 'Therapeutic').length,
      'Emergency': localEquipment.filter(eq => eq.category === 'Emergency').length,
      'Support': localEquipment.filter(eq => eq.category === 'Support').length,
    };
  }, [localEquipment]);

  // Get unique departments
  const departments = useMemo(() => {
    const depts = [...new Set(localEquipment.map(eq => eq.department))];
    return depts.sort();
  }, [localEquipment]);

  // Filter equipment based on search and filters
  const filteredEquipment = useMemo(() => {
    let filtered = localEquipment;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(equipment => 
        equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.equipmentTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipment.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (categoryFilter !== 'All') {
      filtered = filtered.filter(equipment => equipment.category === categoryFilter);
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(equipment => equipment.status === statusFilter);
    }

    // Compliance filter
    if (complianceFilter !== 'All') {
      filtered = filtered.filter(equipment => equipment.compliance === complianceFilter);
    }

    // Department filter
    if (departmentFilter !== 'All') {
      filtered = filtered.filter(equipment => equipment.department === departmentFilter);
    }

    // Critical equipment filter
    if (showCriticalOnly) {
      filtered = filtered.filter(equipment => equipment.criticalEquipment);
    }

    return filtered;
  }, [searchTerm, categoryFilter, statusFilter, complianceFilter, departmentFilter, showCriticalOnly]);

  // Handle export to CSV
  const handleExport = () => {
    const exportData = exportEquipmentListForAudit();
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Equipment Tag,Name,Manufacturer,Category,Department,Location,Status,Compliance,Critical Equipment,Biomedical Clearance,Year of Purchase\n" +
      exportData.map(equipment => 
        `"${equipment.equipmentTag}","${equipment.name}","${equipment.manufacturer}","${equipment.category}","${equipment.department}","${equipment.location}","${equipment.status}","${equipment.compliance}","${equipment.criticalEquipment}","${equipment.biomedicalClearance}","${equipment.yearOfPurchase}"`
      ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `equipment_master_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Get status display properties
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'Operational':
        return { icon: CheckCircle, color: 'success' as const, label: 'Operational' };
      case 'Under Maintenance':
        return { icon: Build, color: 'warning' as const, label: 'Under Maintenance' };
      case 'Out of Service':
        return { icon: Cancel, color: 'error' as const, label: 'Out of Service' };
      case 'Pending Calibration':
        return { icon: Schedule, color: 'info' as const, label: 'Pending Calibration' };
      default:
        return { icon: Warning, color: 'secondary' as const, label: 'Unknown' };
    }
  };

  // Get compliance display properties
  const getComplianceDisplay = (compliance: string) => {
    switch (compliance) {
      case 'Compliant':
        return { icon: CheckCircle, color: 'success' as const, label: 'Compliant' };
      case 'Non-Compliant':
        return { icon: Cancel, color: 'error' as const, label: 'Non-Compliant' };
      case 'Calibration Due':
        return { icon: Warning, color: 'warning' as const, label: 'Calibration Due' };
      case 'Maintenance Due':
        return { icon: Build, color: 'warning' as const, label: 'Maintenance Due' };
      default:
        return { icon: Warning, color: 'secondary' as const, label: 'Pending Inspection' };
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setCategoryFilter('All');
    setStatusFilter('All');
    setComplianceFilter('All');
    setDepartmentFilter('All');
    setShowCriticalOnly(false);
  };

  // Add Equipment handlers
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

  const handleAddEquipment = async () => {
    if (!formData.name.trim() || !formData.manufacturer.trim()) {
      setSnackbar({ open: true, message: 'Name and Manufacturer are required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      // Generate new equipment ID and tag
      const newId = `eq_${Date.now()}`;
      const equipmentCount = localEquipment.length + 1;
      const categoryCode = formData.category.split(' ')[0].substring(0, 3).toUpperCase();
      const equipmentTag = `HOP-BME-ICU-${categoryCode}-${String(equipmentCount).padStart(2, '0')}`;

      const newEquipment = {
        id: newId,
        name: formData.name.trim(),
        category: formData.category,
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        equipmentTag,
        department: formData.department,
        location: formData.location.trim() || formData.department,
        quantity: 1,
        status: formData.status,
        compliance: formData.compliance,
        yearOfPurchase: formData.yearOfPurchase,
        biomedicalClearance: formData.biomedicalClearance,
        criticalEquipment: formData.criticalEquipment,
        backupAvailable: formData.backupAvailable,
      };

      setLocalEquipment(prev => [newEquipment, ...prev]);
      setSnackbar({ open: true, message: 'Equipment added successfully!', severity: 'success' });
      handleCloseAddDialog();
    } catch (err) {
      console.error('Error adding equipment:', err);
      setSnackbar({ open: true, message: 'Failed to add equipment', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Delete Equipment handler
  const handleDeleteEquipment = (equipmentId: string) => {
    setLocalEquipment(prev => prev.filter(eq => eq.id !== equipmentId));
    setSnackbar({ open: true, message: 'Equipment deleted successfully!', severity: 'success' });
  };

  // View Details handlers
  const handleViewDetails = (equipment: any) => {
    setSelectedEquipment(equipment);
    setOpenViewDialog(true);
  };

  const handleCloseViewDialog = () => {
    setOpenViewDialog(false);
    setSelectedEquipment(null);
  };

  // Edit Equipment handlers
  const handleOpenEditDialog = (equipment: any) => {
    setEditingEquipment(equipment);
    setFormData({
      name: equipment.name,
      category: equipment.category,
      manufacturer: equipment.manufacturer,
      model: equipment.model || '',
      serialNumber: equipment.serialNumber || '',
      department: equipment.department,
      location: equipment.location,
      status: equipment.status,
      compliance: equipment.compliance,
      yearOfPurchase: equipment.yearOfPurchase || '',
      criticalEquipment: equipment.criticalEquipment,
      biomedicalClearance: equipment.biomedicalClearance,
      backupAvailable: equipment.backupAvailable,
    });
    setOpenEditDialog(true);
  };

  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setEditingEquipment(null);
    setFormData(initialFormState);
  };

  const handleUpdateEquipment = () => {
    if (!editingEquipment) return;

    if (!formData.name.trim() || !formData.manufacturer.trim()) {
      setSnackbar({ open: true, message: 'Name and Manufacturer are required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const updatedEquipment = {
        ...editingEquipment,
        name: formData.name.trim(),
        category: formData.category,
        manufacturer: formData.manufacturer.trim(),
        model: formData.model.trim() || undefined,
        serialNumber: formData.serialNumber.trim() || undefined,
        department: formData.department,
        location: formData.location.trim() || formData.department,
        status: formData.status,
        compliance: formData.compliance,
        yearOfPurchase: formData.yearOfPurchase,
        criticalEquipment: formData.criticalEquipment,
        biomedicalClearance: formData.biomedicalClearance,
        backupAvailable: formData.backupAvailable,
      };

      setLocalEquipment(prev => prev.map(eq => eq.id === editingEquipment.id ? updatedEquipment : eq));
      setSnackbar({ open: true, message: 'Equipment updated successfully!', severity: 'success' });
      handleCloseEditDialog();
    } catch (err) {
      console.error('Error updating equipment:', err);
      setSnackbar({ open: true, message: 'Failed to update equipment', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom>
              Equipment Master
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Hope Hospital ICU Equipment Inventory - NABH Audit Ready
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
              Add Equipment
            </Button>
          </Box>
        </Box>

        {/* Equipment Overview Alert */}
        <Alert severity="info" sx={{ mb: 3 }}>
          <strong>ICU Equipment Inventory:</strong> {localEquipment.length} pieces of medical equipment tracked for NABH compliance.
          Critical equipment: {localEquipment.filter(eq => eq.criticalEquipment).length} units.
        </Alert>

        {/* Statistics Dashboard */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid size={{ xs: 12, md: 3 }}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography color="text.secondary" variant="overline">
                      Total Equipment
                    </Typography>
                    <Typography variant="h4">
                      {equipmentStats.total}
                    </Typography>
                  </Box>
                  <MedicalServices color="primary" sx={{ fontSize: 32 }} />
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
                      Operational
                    </Typography>
                    <Typography variant="h4" color="success.main">
                      {equipmentStats.operationalPercentage}%
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
                      Critical Equipment
                    </Typography>
                    <Typography variant="h4" color="error.main">
                      {equipmentStats.critical}
                    </Typography>
                  </Box>
                  <Star color="error" sx={{ fontSize: 32 }} />
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
                      {equipmentStats.compliancePercentage}%
                    </Typography>
                  </Box>
                  <Assessment color="success" sx={{ fontSize: 32 }} />
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
              Equipment Categories
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(categorySummary).map(([category, count]) => (
                <Grid size={{ xs: 6, md: 2 }} key={category}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: 'grey.50' }}>
                    <Typography variant="h5" color="primary.main">
                      {count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
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
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                placeholder="Search equipment..."
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
                  onChange={(e) => setCategoryFilter(e.target.value as EquipmentCategory | 'All')}
                >
                  <MenuItem value="All">All Categories</MenuItem>
                  <MenuItem value="Critical Care">Critical Care</MenuItem>
                  <MenuItem value="Monitoring">Monitoring</MenuItem>
                  <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="Therapeutic">Therapeutic</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Status Filter */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={statusFilter}
                  label="Status"
                  onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | 'All')}
                >
                  <MenuItem value="All">All Status</MenuItem>
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                  <MenuItem value="Pending Calibration">Pending Calibration</MenuItem>
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
                  onChange={(e) => setComplianceFilter(e.target.value as EquipmentCompliance | 'All')}
                >
                  <MenuItem value="All">All Compliance</MenuItem>
                  <MenuItem value="Compliant">Compliant</MenuItem>
                  <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  <MenuItem value="Calibration Due">Calibration Due</MenuItem>
                  <MenuItem value="Maintenance Due">Maintenance Due</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Department Filter */}
            <Grid size={{ xs: 12, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={departmentFilter}
                  label="Department"
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                >
                  <MenuItem value="All">All Departments</MenuItem>
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Critical Equipment Filter */}
            <Grid size={{ xs: 12, md: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showCriticalOnly}
                    onChange={(e) => setShowCriticalOnly(e.target.checked)}
                  />
                }
                label="Critical Only"
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Showing {filteredEquipment.length} of {equipmentMaster.length} equipment
            </Typography>
            {(searchTerm || categoryFilter !== 'All' || statusFilter !== 'All' || complianceFilter !== 'All' || departmentFilter !== 'All' || showCriticalOnly) && (
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

      {/* Equipment Grid */}
      <Grid container spacing={3}>
        {filteredEquipment.map((equipment) => {
          const statusDisplay = getStatusDisplay(equipment.status);
          const complianceDisplay = getComplianceDisplay(equipment.compliance);
          const StatusIcon = statusDisplay.icon;
          const ComplianceIcon = complianceDisplay.icon;

          return (
            <Grid size={{ xs: 12, lg: 6 }} key={equipment.id}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 4 } }}>
                <CardContent>
                  {/* Equipment Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Typography variant="h6">
                          {equipment.name}
                        </Typography>
                        <Chip label={equipment.equipmentTag} size="small" color="primary" variant="outlined" />
                        {equipment.criticalEquipment && (
                          <Chip label="Critical" size="small" color="error" icon={<Star />} />
                        )}
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {equipment.manufacturer} • {equipment.category}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title={statusDisplay.label}>
                        <StatusIcon color={statusDisplay.color} />
                      </Tooltip>
                      <Tooltip title={complianceDisplay.label}>
                        <ComplianceIcon color={complianceDisplay.color} />
                      </Tooltip>
                    </Box>
                  </Box>

                  {/* Equipment Details */}
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        DEPARTMENT
                      </Typography>
                      <Typography variant="body2">
                        {equipment.department}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <Typography variant="caption" color="text.secondary" display="block">
                        LOCATION
                      </Typography>
                      <Typography variant="body2">
                        {equipment.location}
                      </Typography>
                    </Grid>
                  </Grid>

                  {/* Location & Year */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {equipment.location}
                    </Typography>
                    {equipment.yearOfPurchase && (
                      <>
                        <Typography variant="body2" color="text.secondary"> • </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {equipment.yearOfPurchase}
                        </Typography>
                      </>
                    )}
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Status and Compliance */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Chip
                        icon={<StatusIcon />}
                        label={statusDisplay.label}
                        size="small"
                        color={statusDisplay.color}
                        variant="outlined"
                      />
                      <Chip
                        icon={<ComplianceIcon />}
                        label={complianceDisplay.label}
                        size="small"
                        color={complianceDisplay.color}
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {/* Additional Info */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {equipment.biomedicalClearance && (
                      <Chip label="BME Cleared" size="small" color="success" variant="filled" />
                    )}
                    {equipment.backupAvailable && (
                      <Chip label="Backup Available" size="small" color="info" variant="outlined" />
                    )}
                  </Box>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Tooltip title="Edit Equipment">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenEditDialog(equipment)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Equipment">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteEquipment(equipment.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Button size="small" color="primary" onClick={() => handleViewDetails(equipment)}>
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredEquipment.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <MedicalServices sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No equipment found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search criteria or filters.
          </Typography>
        </Box>
      )}

      {/* View Details Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={handleCloseViewDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">{selectedEquipment?.name}</Typography>
            {selectedEquipment?.criticalEquipment && (
              <Chip label="Critical" size="small" color="error" icon={<Star />} />
            )}
          </Box>
          <IconButton onClick={handleCloseViewDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEquipment && (
            <Grid container spacing={3}>
              {/* Basic Info */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom>Basic Information</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Equipment Tag</Typography>
                <Typography variant="body1" fontWeight={500}>{selectedEquipment.equipmentTag}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Category</Typography>
                <Typography variant="body1">{selectedEquipment.category}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Manufacturer</Typography>
                <Typography variant="body1">{selectedEquipment.manufacturer}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Model</Typography>
                <Typography variant="body1">{selectedEquipment.model || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Serial Number</Typography>
                <Typography variant="body1">{selectedEquipment.serialNumber || 'N/A'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Year of Purchase</Typography>
                <Typography variant="body1">{selectedEquipment.yearOfPurchase || 'N/A'}</Typography>
              </Grid>

              {/* Location Info */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>Location</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Department</Typography>
                <Typography variant="body1">{selectedEquipment.department}</Typography>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Location</Typography>
                <Typography variant="body1">{selectedEquipment.location}</Typography>
              </Grid>

              {/* Status Info */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>Status & Compliance</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Status</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedEquipment.status}
                    size="small"
                    color={selectedEquipment.status === 'Operational' ? 'success' : selectedEquipment.status === 'Under Maintenance' ? 'warning' : 'error'}
                  />
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <Typography variant="caption" color="text.secondary">Compliance</Typography>
                <Box sx={{ mt: 0.5 }}>
                  <Chip
                    label={selectedEquipment.compliance}
                    size="small"
                    color={selectedEquipment.compliance === 'Compliant' ? 'success' : selectedEquipment.compliance === 'Non-Compliant' ? 'error' : 'warning'}
                  />
                </Box>
              </Grid>

              {/* Additional Info */}
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>Additional Information</Typography>
                <Divider sx={{ mb: 2 }} />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {selectedEquipment.biomedicalClearance && (
                    <Chip label="BME Cleared" size="small" color="success" />
                  )}
                  {selectedEquipment.backupAvailable && (
                    <Chip label="Backup Available" size="small" color="info" />
                  )}
                  {selectedEquipment.criticalEquipment && (
                    <Chip label="Critical Equipment" size="small" color="error" />
                  )}
                  {!selectedEquipment.biomedicalClearance && !selectedEquipment.backupAvailable && !selectedEquipment.criticalEquipment && (
                    <Typography variant="body2" color="text.secondary">No additional flags</Typography>
                  )}
                </Box>
              </Grid>

              {/* Calibration Info if available */}
              {selectedEquipment.calibration && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>Calibration</Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Last Calibration</Typography>
                    <Typography variant="body1">{selectedEquipment.calibration.lastCalibrationDate}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Next Due</Typography>
                    <Typography variant="body1">{selectedEquipment.calibration.nextCalibrationDue}</Typography>
                  </Grid>
                </>
              )}

              {/* Maintenance Info if available */}
              {selectedEquipment.maintenance && (
                <>
                  <Grid size={{ xs: 12 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom sx={{ mt: 2 }}>Maintenance</Typography>
                    <Divider sx={{ mb: 2 }} />
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Last Maintenance</Typography>
                    <Typography variant="body1">{selectedEquipment.maintenance.lastMaintenanceDate}</Typography>
                  </Grid>
                  <Grid size={{ xs: 12, md: 6 }}>
                    <Typography variant="caption" color="text.secondary">Next Due</Typography>
                    <Typography variant="body1">{selectedEquipment.maintenance.nextMaintenanceDue}</Typography>
                  </Grid>
                </>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseViewDialog}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Equipment Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Edit Equipment</Typography>
          <IconButton onClick={handleCloseEditDialog} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid size={{ xs: 12, md: 8 }}>
              <TextField
                fullWidth
                label="Equipment Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  <MenuItem value="Critical Care">Critical Care</MenuItem>
                  <MenuItem value="Monitoring">Monitoring</MenuItem>
                  <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="Therapeutic">Therapeutic</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleFormChange('manufacturer', e.target.value)}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => handleFormChange('model', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => handleFormChange('serialNumber', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => handleFormChange('department', e.target.value)}
                >
                  <MenuItem value="ICU">ICU</MenuItem>
                  <MenuItem value="OT">OT</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Laboratory">Laboratory</MenuItem>
                  <MenuItem value="Radiology">Radiology</MenuItem>
                  <MenuItem value="General Ward">General Ward</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Year of Purchase"
                value={formData.yearOfPurchase}
                onChange={(e) => handleFormChange('yearOfPurchase', e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                  <MenuItem value="Pending Calibration">Pending Calibration</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Compliance</InputLabel>
                <Select
                  value={formData.compliance}
                  label="Compliance"
                  onChange={(e) => handleFormChange('compliance', e.target.value)}
                >
                  <MenuItem value="Compliant">Compliant</MenuItem>
                  <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  <MenuItem value="Pending Inspection">Pending Inspection</MenuItem>
                  <MenuItem value="Calibration Due">Calibration Due</MenuItem>
                  <MenuItem value="Maintenance Due">Maintenance Due</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.criticalEquipment}
                      onChange={(e) => handleFormChange('criticalEquipment', e.target.checked)}
                    />
                  }
                  label="Critical Equipment"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.biomedicalClearance}
                      onChange={(e) => handleFormChange('biomedicalClearance', e.target.checked)}
                    />
                  }
                  label="BME Clearance"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.backupAvailable}
                      onChange={(e) => handleFormChange('backupAvailable', e.target.checked)}
                    />
                  }
                  label="Backup Available"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseEditDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleUpdateEquipment}
            disabled={saving || !formData.name.trim() || !formData.manufacturer.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : <Edit />}
          >
            {saving ? 'Updating...' : 'Update Equipment'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Equipment Dialog */}
      <Dialog
        open={openAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Add New Equipment</Typography>
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
                label="Equipment Name"
                value={formData.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                required
                placeholder="e.g., Ventilator"
              />
            </Grid>

            {/* Category */}
            <Grid size={{ xs: 12, md: 4 }}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  label="Category"
                  onChange={(e) => handleFormChange('category', e.target.value)}
                >
                  <MenuItem value="Critical Care">Critical Care</MenuItem>
                  <MenuItem value="Monitoring">Monitoring</MenuItem>
                  <MenuItem value="Diagnostic">Diagnostic</MenuItem>
                  <MenuItem value="Therapeutic">Therapeutic</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Support">Support</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Manufacturer */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Manufacturer"
                value={formData.manufacturer}
                onChange={(e) => handleFormChange('manufacturer', e.target.value)}
                required
                placeholder="e.g., Mindray"
              />
            </Grid>

            {/* Model */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Model"
                value={formData.model}
                onChange={(e) => handleFormChange('model', e.target.value)}
                placeholder="e.g., SV-300"
              />
            </Grid>

            {/* Serial Number */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Serial Number"
                value={formData.serialNumber}
                onChange={(e) => handleFormChange('serialNumber', e.target.value)}
                placeholder="e.g., SN123456"
              />
            </Grid>

            {/* Department */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  label="Department"
                  onChange={(e) => handleFormChange('department', e.target.value)}
                >
                  <MenuItem value="ICU">ICU</MenuItem>
                  <MenuItem value="OT">OT</MenuItem>
                  <MenuItem value="Emergency">Emergency</MenuItem>
                  <MenuItem value="Laboratory">Laboratory</MenuItem>
                  <MenuItem value="Radiology">Radiology</MenuItem>
                  <MenuItem value="General Ward">General Ward</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Location */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={(e) => handleFormChange('location', e.target.value)}
                placeholder="e.g., ICU - Bay 1"
              />
            </Grid>

            {/* Year of Purchase */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Year of Purchase"
                value={formData.yearOfPurchase}
                onChange={(e) => handleFormChange('yearOfPurchase', e.target.value)}
                placeholder="e.g., 2024"
              />
            </Grid>

            {/* Status */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleFormChange('status', e.target.value)}
                >
                  <MenuItem value="Operational">Operational</MenuItem>
                  <MenuItem value="Under Maintenance">Under Maintenance</MenuItem>
                  <MenuItem value="Out of Service">Out of Service</MenuItem>
                  <MenuItem value="Pending Calibration">Pending Calibration</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Compliance */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Compliance</InputLabel>
                <Select
                  value={formData.compliance}
                  label="Compliance"
                  onChange={(e) => handleFormChange('compliance', e.target.value)}
                >
                  <MenuItem value="Compliant">Compliant</MenuItem>
                  <MenuItem value="Non-Compliant">Non-Compliant</MenuItem>
                  <MenuItem value="Pending Inspection">Pending Inspection</MenuItem>
                  <MenuItem value="Calibration Due">Calibration Due</MenuItem>
                  <MenuItem value="Maintenance Due">Maintenance Due</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Checkboxes */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.criticalEquipment}
                      onChange={(e) => handleFormChange('criticalEquipment', e.target.checked)}
                    />
                  }
                  label="Critical Equipment"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.biomedicalClearance}
                      onChange={(e) => handleFormChange('biomedicalClearance', e.target.checked)}
                    />
                  }
                  label="BME Clearance"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.backupAvailable}
                      onChange={(e) => handleFormChange('backupAvailable', e.target.checked)}
                    />
                  }
                  label="Backup Available"
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAddDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAddEquipment}
            disabled={saving || !formData.name.trim() || !formData.manufacturer.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : <Add />}
          >
            {saving ? 'Adding...' : 'Add Equipment'}
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

export default EquipmentMasterPage;
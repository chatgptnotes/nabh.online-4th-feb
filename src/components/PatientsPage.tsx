import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import Grid from '@mui/material/Grid';
import type { Patient } from '../types/patient';
import {
  loadAllPatients,
  searchPatients,
  deletePatient,
} from '../services/patientStorage';
import ImportPatientsModal from './patients/ImportPatientsModal';

type StatusFilter = 'All' | 'Active' | 'Discharged' | 'Transferred';

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info',
  });

  // Load patients on mount
  useEffect(() => {
    loadPatients();
  }, []);

  // Filter patients when search or status changes
  useEffect(() => {
    let result = patients;

    // Apply status filter
    if (statusFilter !== 'All') {
      result = result.filter((p) => p.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.patientName.toLowerCase().includes(query) ||
          p.visitId.toLowerCase().includes(query) ||
          (p.diagnosis && p.diagnosis.toLowerCase().includes(query))
      );
    }

    setFilteredPatients(result);
    setPage(0); // Reset to first page when filters change
  }, [patients, searchQuery, statusFilter]);

  const loadPatients = async () => {
    setIsLoading(true);
    try {
      const result = await loadAllPatients();
      if (result.success && result.data) {
        setPatients(result.data);
      } else {
        setSnackbar({
          open: true,
          message: result.error || 'Failed to load patients',
          severity: 'error',
        });
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setSnackbar({
        open: true,
        message: 'Error loading patients',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim().length >= 2) {
      // Use backend search for better results
      const result = await searchPatients(query);
      if (result.success && result.data) {
        // Filter by status if needed
        let filtered = result.data;
        if (statusFilter !== 'All') {
          filtered = filtered.filter((p) => p.status === statusFilter);
        }
        setFilteredPatients(filtered);
        return;
      }
    }
    // Fall back to client-side filtering (handled by useEffect)
  };

  const handleDeletePatient = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;

    const result = await deletePatient(id);
    if (result.success) {
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setSnackbar({
        open: true,
        message: 'Patient deleted successfully',
        severity: 'success',
      });
    } else {
      setSnackbar({
        open: true,
        message: result.error || 'Failed to delete patient',
        severity: 'error',
      });
    }
  };

  const handleImportComplete = () => {
    setSnackbar({
      open: true,
      message: 'Patients imported successfully',
      severity: 'success',
    });
    loadPatients();
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Calculate stats
  const totalPatients = patients.length;
  const activePatients = patients.filter((p) => p.status === 'Active').length;
  const dischargedPatients = patients.filter((p) => p.status === 'Discharged').length;
  const transferredPatients = patients.filter((p) => p.status === 'Transferred').length;

  // Get current page data
  const paginatedPatients = filteredPatients.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'Active':
        return 'success';
      case 'Discharged':
        return 'default';
      case 'Transferred':
        return 'warning';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            Patient Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {totalPatients} patients in database
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Icon>refresh</Icon>}
            onClick={loadPatients}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon>upload_file</Icon>}
            onClick={() => setIsImportModalOpen(true)}
          >
            Import Excel
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h5" color="primary" fontWeight={700}>
              {totalPatients}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Patients
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h5" color="success.main" fontWeight={700}>
              {activePatients}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'grey.100' }}>
            <Typography variant="h5" color="text.secondary" fontWeight={700}>
              {dischargedPatients}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Discharged
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 1.5, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h5" color="warning.main" fontWeight={700}>
              {transferredPatients}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Transferred
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search by name, visit ID, or diagnosis..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            size="small"
            sx={{ minWidth: 300, flex: 1 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Icon>search</Icon>
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <Icon>clear</Icon>
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Tabs
            value={statusFilter}
            onChange={(_, value) => setStatusFilter(value)}
            sx={{ minHeight: 40 }}
          >
            <Tab
              value="All"
              label={`All (${totalPatients})`}
              sx={{ minHeight: 40, py: 0 }}
            />
            <Tab
              value="Active"
              label={`Active (${activePatients})`}
              sx={{ minHeight: 40, py: 0 }}
            />
            <Tab
              value="Discharged"
              label={`Discharged (${dischargedPatients})`}
              sx={{ minHeight: 40, py: 0 }}
            />
            <Tab
              value="Transferred"
              label={`Transferred (${transferredPatients})`}
              sx={{ minHeight: 40, py: 0 }}
            />
          </Tabs>
        </Box>
      </Paper>

      {/* Patient Table */}
      <Paper>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        ) : filteredPatients.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 6 }}>
            <Icon sx={{ fontSize: 64, color: 'text.secondary' }}>person_off</Icon>
            <Typography variant="h6" sx={{ mt: 2 }}>
              {patients.length === 0 ? 'No patients yet' : 'No matching patients'}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              {patients.length === 0
                ? 'Import patients from an Excel file to get started'
                : 'Try adjusting your search or filters'}
            </Typography>
            {patients.length === 0 && (
              <Button
                variant="contained"
                startIcon={<Icon>upload_file</Icon>}
                onClick={() => setIsImportModalOpen(true)}
              >
                Import Excel
              </Button>
            )}
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 'calc(100vh - 450px)' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, width: 60 }}>Sr No</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, width: 120 }}>Visit ID</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Patient Name</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Diagnosis</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, width: 110 }}>Admission</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, width: 110 }}>Discharge</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, width: 100 }}>Status</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, width: 60 }} align="center">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedPatients.map((patient) => (
                    <TableRow key={patient.id} hover>
                      <TableCell>{patient.srNo || '-'}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="primary">
                          {patient.visitId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.patientName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Tooltip title={patient.diagnosis || ''} arrow>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 250,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {patient.diagnosis || '-'}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        {patient.admissionDate
                          ? new Date(patient.admissionDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {patient.dischargeDate
                          ? new Date(patient.dischargeDate).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={patient.status || 'Active'}
                          size="small"
                          color={getStatusColor(patient.status) as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => patient.id && handleDeletePatient(patient.id)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={filteredPatients.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              rowsPerPageOptions={[10, 25, 50, 100]}
            />
          </>
        )}
      </Paper>

      {/* Import Modal */}
      <ImportPatientsModal
        open={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportComplete={handleImportComplete}
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

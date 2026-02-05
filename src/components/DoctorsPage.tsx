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
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { doctorsMaster, syncDoctorsToDatabase } from '../data/doctorsMaster';
import type { Doctor } from '../data/doctorsMaster';

export default function DoctorsPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [formData, setFormData] = useState<Doctor>({
    sr_no: 0,
    emp_id_no: '',
    name: '',
    qualification: 'M.B.B.S',
    specialization: 'Resident Medical Officer',
    designation: 'RMO',
    registrationNumber: '',
    department: 'Hospital',
    role: 'RMO',
    doctor_type: 'Allopathic',
    is_active: true
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    loadDoctors();
  }, []);

  useEffect(() => {
    let filtered = doctors;

    // Filter by tab (doctor type)
    if (tabValue === 1) {
      filtered = filtered.filter(d => d.doctor_type === 'Allopathic');
    } else if (tabValue === 2) {
      filtered = filtered.filter(d => d.doctor_type === 'Non-Allopathic');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.qualification.toLowerCase().includes(query) ||
          d.registrationNumber.toLowerCase().includes(query) ||
          d.emp_id_no.toLowerCase().includes(query) ||
          d.designation.toLowerCase().includes(query)
      );
    }

    setFilteredDoctors(filtered);
    setPage(0);
  }, [doctors, searchQuery, tabValue]);

  const loadDoctors = async () => {
    setIsLoading(true);
    try {
      setDoctors(doctorsMaster);
    } catch (error) {
      console.error('Error loading doctors:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (doctor?: Doctor) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({ ...doctor });
    } else {
      setEditingDoctor(null);
      setFormData({
        sr_no: doctors.length + 1,
        emp_id_no: `H${String(doctors.length + 1).padStart(3, '0')}`,
        name: '',
        qualification: 'M.B.B.S',
        specialization: 'Resident Medical Officer',
        designation: 'RMO',
        registrationNumber: '',
        department: 'Hospital',
        role: 'RMO',
        doctor_type: 'Allopathic',
        is_active: true
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDoctor(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.qualification) {
      setSnackbar({ open: true, message: 'Name and Qualification are required', severity: 'error' });
      return;
    }

    if (editingDoctor) {
      setDoctors(doctors.map(d => d.emp_id_no === editingDoctor.emp_id_no ? formData : d));
      setSnackbar({ open: true, message: 'Doctor updated locally', severity: 'success' });
    } else {
      setDoctors([...doctors, formData]);
      setSnackbar({ open: true, message: 'Doctor added locally', severity: 'success' });
    }
    handleCloseDialog();
  };

  const handleDelete = (empId: string, name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setDoctors(doctors.filter(d => d.emp_id_no !== empId));
      setSnackbar({ open: true, message: 'Doctor removed locally', severity: 'success' });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncDoctorsToDatabase();
      setSnackbar({
        open: true,
        message: 'Doctors synced to database successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to sync doctors',
        severity: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const allopathicCount = doctors.filter(d => d.doctor_type === 'Allopathic').length;
  const nonAllopathicCount = doctors.filter(d => d.doctor_type === 'Non-Allopathic').length;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">medication_liquid</Icon>
            Resident Medical Officers (RMO)
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {doctors.length} RMO Doctors ({allopathicCount} Allopathic + {nonAllopathicCount} Non-Allopathic) - Hope Hospital
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={isSyncing ? <CircularProgress size={20} color="inherit" /> : <Icon>sync</Icon>}
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing...' : 'Sync to Database'}
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon>add</Icon>}
            onClick={() => handleOpenDialog()}
          >
            Add Doctor
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)}>
          <Tab label={`All (${doctors.length})`} />
          <Tab label={`Allopathic - MBBS (${allopathicCount})`} />
          <Tab label={`Non-Allopathic - BHMS/BAMS/BUMS (${nonAllopathicCount})`} />
        </Tabs>
      </Paper>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, Emp ID, qualification, or registration..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Icon>search</Icon>
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Paper>

      {/* Table */}
      <Paper>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Emp. ID</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Doctor Name</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Qualification</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Designation</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Reg. Number</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Type</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredDoctors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No doctors found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredDoctors
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((doc) => (
                  <TableRow key={doc.emp_id_no} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {doc.emp_id_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{doc.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.qualification}
                        size="small"
                        variant="outlined"
                        color={doc.doctor_type === 'Allopathic' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{doc.designation}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {doc.registrationNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.doctor_type}
                        size="small"
                        color={doc.doctor_type === 'Allopathic' ? 'success' : 'warning'}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(doc)}>
                        <Icon>edit</Icon>
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(doc.emp_id_no, doc.name)}>
                        <Icon>delete</Icon>
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={filteredDoctors.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDoctor ? 'Edit RMO Doctor' : 'Add New RMO Doctor'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Emp. ID No."
              fullWidth
              required
              value={formData.emp_id_no}
              onChange={(e) => setFormData({ ...formData, emp_id_no: e.target.value })}
              placeholder="e.g., H001"
            />
            <TextField
              label="Doctor Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Dr. John Smith"
            />
            <TextField
              label="Qualification"
              fullWidth
              required
              select
              slotProps={{ select: { native: true } }}
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            >
              <option value="M.B.B.S">M.B.B.S (Allopathic)</option>
              <option value="B.H.M.S">B.H.M.S (Homeopathy)</option>
              <option value="B.A.M.S">B.A.M.S (Ayurveda)</option>
              <option value="B.U.M.S">B.U.M.S (Unani)</option>
            </TextField>
            <TextField
              label="Designation"
              fullWidth
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              placeholder="e.g., RMO, RMO / Quality Coordinator"
            />
            <TextField
              label="Registration Number"
              fullWidth
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              placeholder="e.g., 2020/01/1234"
            />
            <TextField
              label="Doctor Type"
              fullWidth
              select
              slotProps={{ select: { native: true } }}
              value={formData.doctor_type}
              onChange={(e) => setFormData({ ...formData, doctor_type: e.target.value as 'Allopathic' | 'Non-Allopathic' })}
            >
              <option value="Allopathic">Allopathic (MBBS)</option>
              <option value="Non-Allopathic">Non-Allopathic (BHMS/BAMS/BUMS)</option>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

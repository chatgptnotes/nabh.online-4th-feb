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
import { visitingConsultantsMaster, syncConsultantsToDatabase } from '../data/visitingConsultantsMaster';
import type { VisitingConsultant } from '../data/visitingConsultantsMaster';

export default function VisitingConsultantsPage() {
  const [consultants, setConsultants] = useState<VisitingConsultant[]>([]);
  const [filteredConsultants, setFilteredConsultants] = useState<VisitingConsultant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingConsultant, setEditingConsultant] = useState<VisitingConsultant | null>(null);
  const [formData, setFormData] = useState<VisitingConsultant>({
    sr_no: 0,
    name: '',
    department: '',
    qualification: '',
    registration_no: '',
    registered_council: 'Maharashtra Medical Council'
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    loadConsultants();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredConsultants(
        consultants.filter(
          (c) =>
            c.name.toLowerCase().includes(query) ||
            c.department.toLowerCase().includes(query) ||
            c.qualification.toLowerCase().includes(query) ||
            c.registration_no.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredConsultants(consultants);
    }
    setPage(0);
  }, [consultants, searchQuery]);

  const loadConsultants = async () => {
    setIsLoading(true);
    try {
      setConsultants(visitingConsultantsMaster);
    } catch (error) {
      console.error('Error loading consultants:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (consultant?: VisitingConsultant) => {
    if (consultant) {
      setEditingConsultant(consultant);
      setFormData({ ...consultant });
    } else {
      setEditingConsultant(null);
      setFormData({
        sr_no: consultants.length + 1,
        name: '',
        department: '',
        qualification: '',
        registration_no: '',
        registered_council: 'Maharashtra Medical Council'
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingConsultant(null);
  };

  const handleSave = () => {
    if (!formData.name || !formData.department) {
      setSnackbar({ open: true, message: 'Name and Department are required', severity: 'error' });
      return;
    }

    if (editingConsultant) {
      setConsultants(consultants.map(c => c.name === editingConsultant.name ? formData : c));
      setSnackbar({ open: true, message: 'Consultant updated locally', severity: 'success' });
    } else {
      setConsultants([formData, ...consultants]);
      setSnackbar({ open: true, message: 'Consultant added locally', severity: 'success' });
    }
    handleCloseDialog();
  };

  const handleDelete = (name: string) => {
    if (confirm(`Are you sure you want to delete ${name}?`)) {
      setConsultants(consultants.filter(c => c.name !== name));
      setSnackbar({ open: true, message: 'Consultant removed locally', severity: 'success' });
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncConsultantsToDatabase();
      setSnackbar({
        open: true,
        message: 'Consultants synced to database successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to sync consultants',
        severity: 'error',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">medical_information</Icon>
            Visiting Consultants
          </Typography>
          <Typography variant="body2" color="text.secondary">
            22 Visiting Consultants with Registration Numbers - Hope Hospital
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
            Add Consultant
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, department, qualification, or registration number..."
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

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Chip label={`Total: ${filteredConsultants.length} Consultants`} color="primary" />
        <Chip label="All Registered with Maharashtra Medical Council" variant="outlined" />
      </Box>

      {/* Table */}
      <Paper>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Sr.</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Doctor Name</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Department</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Qualification</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Registration No.</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredConsultants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No consultants found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredConsultants
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((consultant) => (
                  <TableRow key={consultant.sr_no} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {consultant.sr_no}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{consultant.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={consultant.department} size="small" variant="outlined" color="primary" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{consultant.qualification}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        {consultant.registration_no}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="primary" onClick={() => handleOpenDialog(consultant)}>
                        <Icon>edit</Icon>
                      </IconButton>
                      <IconButton size="small" color="error" onClick={() => handleDelete(consultant.name)}>
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
          count={filteredConsultants.length}
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
        <DialogTitle>{editingConsultant ? 'Edit Consultant' : 'Add New Consultant'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Doctor Name"
              fullWidth
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Dr. John Smith"
            />
            <TextField
              label="Department"
              fullWidth
              required
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="e.g., CARDIOLOGY"
            />
            <TextField
              label="Qualification"
              fullWidth
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              placeholder="e.g., MBBS, MD, DM"
            />
            <TextField
              label="Registration Number"
              fullWidth
              value={formData.registration_no}
              onChange={(e) => setFormData({ ...formData, registration_no: e.target.value })}
              placeholder="e.g., 2020/01/1234"
            />
            <TextField
              label="Registered Council"
              fullWidth
              value={formData.registered_council}
              onChange={(e) => setFormData({ ...formData, registered_council: e.target.value })}
              placeholder="Maharashtra Medical Council"
            />
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

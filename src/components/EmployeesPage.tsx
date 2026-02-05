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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';
import { supabase } from '../lib/supabase';
import { staffMaster, syncStaffToDatabase } from '../data/staffMaster';

interface Employee {
  id: string;
  name: string;
  designation: string;
  department: string;
  role: string;
  emp_id_no?: string;
  is_active: boolean;
  created_at: string;
}

interface EmployeeFormData {
  name: string;
  designation: string;
  department: string;
  role: string;
  emp_id_no: string;
}

const initialFormData: EmployeeFormData = {
  name: '',
  designation: '',
  department: '',
  role: '',
  emp_id_no: '',
};

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredEmployees(
        employees.filter(
          (e) =>
            e.name.toLowerCase().includes(query) ||
            e.designation.toLowerCase().includes(query) ||
            e.department.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredEmployees(employees);
    }
    setPage(0); // Reset to first page when search changes
  }, [employees, searchQuery]);

  const loadEmployees = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('nabh_team_members')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      
      const dbEmployees = (data || []) as Employee[];
      const dbNames = new Set(dbEmployees.map(e => e.name));
      
      // Merge with master staff list if not in DB
      const localStaff = staffMaster
        .filter(s => !dbNames.has(s.name))
        .map((s, i) => ({
          ...s,
          id: `local_${i}`,
          created_at: new Date().toISOString()
        }));

      setEmployees([...dbEmployees, ...localStaff]);
    } catch (error) {
      console.error('Error loading employees:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load employees',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setFormData({
        name: employee.name,
        designation: employee.designation,
        department: employee.department,
        role: employee.role,
        emp_id_no: employee.emp_id_no || '',
      });
    } else {
      setEditingEmployee(null);
      setFormData(initialFormData);
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingEmployee(null);
    setFormData(initialFormData);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.designation.trim()) {
      setSnackbar({
        open: true,
        message: 'Name and Designation are required',
        severity: 'error',
      });
      return;
    }

    setIsSaving(true);
    try {
      if (editingEmployee) {
        // Update existing
        const updateData = {
          name: formData.name.trim(),
          designation: formData.designation.trim(),
          department: formData.department.trim() || 'General',
          role: formData.role.trim() || 'Staff',
          emp_id_no: formData.emp_id_no.trim(),
          updated_at: new Date().toISOString(),
        };
        const { error } = await supabase
          .from('nabh_team_members')
          .update(updateData as never)
          .eq('id', editingEmployee.id);

        if (error) throw error;
        setSnackbar({
          open: true,
          message: 'Employee updated successfully',
          severity: 'success',
        });
      } else {
        // Create new
        const insertData = {
          name: formData.name.trim(),
          designation: formData.designation.trim(),
          department: formData.department.trim() || 'General',
          role: formData.role.trim() || 'Staff',
          emp_id_no: formData.emp_id_no.trim(),
          is_active: true,
          responsibilities: [] as string[],
        };
        const { error } = await supabase.from('nabh_team_members').insert(insertData as never);

        if (error) throw error;
        setSnackbar({
          open: true,
          message: 'Employee added successfully',
          severity: 'success',
        });
      }

      handleCloseDialog();
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save employee',
        severity: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (employee: Employee) => {
    if (!confirm(`Delete employee "${employee.name}"?`)) return;

    try {
      const { error } = await supabase
        .from('nabh_team_members')
        .delete()
        .eq('id', employee.id);

      if (error) throw error;
      setSnackbar({
        open: true,
        message: 'Employee deleted successfully',
        severity: 'success',
      });
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete employee',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">badge</Icon>
            NABH Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage hospital staff for NABH documentation
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<Icon>sync</Icon>}
          sx={{ mr: 1 }}
          onClick={async () => {
            await syncStaffToDatabase();
            loadEmployees();
          }}
        >
          Sync All Staff
        </Button>
        <Button
          variant="contained"
          startIcon={<Icon>add</Icon>}
          onClick={() => handleOpenDialog()}
        >
          Add Employee
        </Button>
      </Box>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search by name, designation, or department..."
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
        <TableContainer sx={{ maxHeight: 500, overflow: 'auto' }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Emp. ID</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Designation</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Department</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</TableCell>
                <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      {searchQuery ? 'No employees found' : 'No employees added yet. Click "Add Employee" to start.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEmployees
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((employee) => (
                  <TableRow key={employee.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {employee.emp_id_no || '---'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{employee.name}</Typography>
                    </TableCell>
                    <TableCell>{employee.designation}</TableCell>
                    <TableCell>{employee.department}</TableCell>
                    <TableCell>{employee.role}</TableCell>
                    <TableCell>
                      <Chip
                        label={employee.is_active ? 'Active' : 'Inactive'}
                        color={employee.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleOpenDialog(employee)}
                      >
                        <Icon>edit</Icon>
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(employee)}
                      >
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
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredEmployees.length}
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
        <DialogTitle>
          {editingEmployee ? 'Edit Employee' : 'Add New Employee'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              label="Emp. ID No."
              value={formData.emp_id_no}
              onChange={(e) => setFormData({ ...formData, emp_id_no: e.target.value })}
              fullWidth
              placeholder="e.g., HOPE001"
            />
            <TextField
              label="Name *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Designation *"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              fullWidth
              placeholder="e.g., Quality Manager, Head Nurse"
            />
            <TextField
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
              placeholder="e.g., Nursing, Administration"
            />
            <TextField
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              fullWidth
              placeholder="e.g., NABH Coordinator, HOD"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isSaving}
            startIcon={isSaving ? <CircularProgress size={16} /> : <Icon>save</Icon>}
          >
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
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

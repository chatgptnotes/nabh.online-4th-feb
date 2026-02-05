import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Icon from '@mui/material/Icon';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TablePagination from '@mui/material/TablePagination';
import type { DocumentLevelItem } from '../services/documentLevelStorage';
import {
  loadDocumentsByLevel,
  saveDocument,
  updateDocument,
  deleteDocument
} from '../services/documentLevelStorage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const DOCUMENT_LEVELS = [
  {
    level: 1,
    label: 'Mission & Vision Statements',
    icon: 'flag',
    description: 'Organization\'s mission, vision, values and quality policy documents',
    color: '#1565C0',
  },
  {
    level: 2,
    label: 'Policies & Procedures',
    icon: 'policy',
    description: 'Hospital-wide policies and standard procedures',
    color: '#2E7D32',
  },
  {
    level: 3,
    label: 'Work Instructions',
    icon: 'assignment',
    description: 'Detailed step-by-step work instructions for specific tasks',
    color: '#ED6C02',
  },
  {
    level: 4,
    label: 'Forms, Formats & Records',
    icon: 'description',
    description: 'All forms, templates, checklists and record formats',
    color: '#9C27B0',
  },
  {
    level: 5,
    label: 'Documents of External Origin',
    icon: 'cloud_download',
    description: 'External regulatory documents, guidelines and reference materials',
    color: '#D32F2F',
  },
];

const INITIAL_FORM_DATA = {
  title: '',
  description: '',
  file_url: '',
  file_type: '',
  version: '1.0',
  status: 'Active' as const,
};

export default function DocumentLevelsPage() {
  const [searchParams] = useSearchParams();
  const levelParam = searchParams.get('level');
  const [tabValue, setTabValue] = useState(levelParam ? parseInt(levelParam) - 1 : 0);

  // Documents state
  const [documents, setDocuments] = useState<DocumentLevelItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentLevelItem | null>(null);
  const [viewDocument, setViewDocument] = useState<DocumentLevelItem | null>(null);

  // Form state
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (levelParam) {
      setTabValue(parseInt(levelParam) - 1);
    }
  }, [levelParam]);

  // Load documents when tab changes
  useEffect(() => {
    loadDocuments();
    setPage(0); // Reset to first page when tab changes
  }, [tabValue]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const currentLevel = tabValue + 1;
      const result = await loadDocumentsByLevel(currentLevel);
      if (result.success && result.data) {
        setDocuments(result.data);
      } else {
        setDocuments([]);
        console.log('No documents or table not found for level:', currentLevel);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleAdd = () => {
    setFormData(INITIAL_FORM_DATA);
    setAddDialogOpen(true);
  };

  const handleEdit = (doc: DocumentLevelItem) => {
    setSelectedDocument(doc);
    setFormData({
      title: doc.title,
      description: doc.description || '',
      file_url: doc.file_url || '',
      file_type: doc.file_type || '',
      version: doc.version,
      status: doc.status,
    });
    setEditDialogOpen(true);
  };

  const handleView = (doc: DocumentLevelItem) => {
    setViewDocument(doc);
    setViewDialogOpen(true);
  };

  const handlePrint = (doc: DocumentLevelItem) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const levelInfo = DOCUMENT_LEVELS[tabValue];
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${doc.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: ${levelInfo.color}; border-bottom: 2px solid ${levelInfo.color}; padding-bottom: 10px; }
            .content { white-space: pre-wrap; line-height: 1.6; }
            .header { margin-bottom: 20px; }
            .signature { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; }
            @media print { body { padding: 20px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <span>Level ${levelInfo.level}: ${levelInfo.label}</span>
          </div>
          <h1>${doc.title}</h1>
          <div class="content">${doc.description || 'No description available.'}</div>
          <div class="signature">
            <p>Staff Signature: _________________________</p>
          </div>
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDelete = async (doc: DocumentLevelItem) => {
    if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
      const result = await deleteDocument(doc.id);
      if (result.success) {
        showSnackbar('Document deleted successfully', 'success');
        loadDocuments();
      } else {
        showSnackbar(result.error || 'Failed to delete document', 'error');
      }
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }

    const currentLevel = tabValue + 1;
    const result = await saveDocument({
      level: currentLevel,
      title: formData.title,
      description: formData.description,
      file_url: formData.file_url,
      file_type: formData.file_type,
      version: formData.version,
      status: formData.status,
    });

    if (result.success) {
      showSnackbar('Document added successfully', 'success');
      setAddDialogOpen(false);
      loadDocuments();
    } else {
      showSnackbar(result.error || 'Failed to add document', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!selectedDocument) return;
    if (!formData.title.trim()) {
      showSnackbar('Title is required', 'error');
      return;
    }

    const result = await updateDocument(selectedDocument.id, {
      title: formData.title,
      description: formData.description,
      file_url: formData.file_url,
      file_type: formData.file_type,
      version: formData.version,
      status: formData.status,
    });

    if (result.success) {
      showSnackbar('Document updated successfully', 'success');
      setEditDialogOpen(false);
      setSelectedDocument(null);
      loadDocuments();
    } else {
      showSnackbar(result.error || 'Failed to update document', 'error');
    }
  };

  const currentLevel = DOCUMENT_LEVELS[tabValue];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Icon sx={{ color: 'primary.main', fontSize: 32 }}>layers</Icon>
          <Box>
            <Typography variant="h4" color="primary" fontWeight={700}>
              Document Levels
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Hierarchical document management system
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': {
              minHeight: 64,
              textTransform: 'none',
              fontWeight: 600,
            },
          }}
        >
          {DOCUMENT_LEVELS.map((level) => (
            <Tab
              key={level.level}
              icon={<Icon sx={{ color: level.color }}>{level.icon}</Icon>}
              iconPosition="start"
              label={
                <Box sx={{ textAlign: 'left' }}>
                  <Typography variant="caption" sx={{ color: level.color, fontWeight: 700 }}>
                    Level {level.level}
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {level.label}
                  </Typography>
                </Box>
              }
              sx={{
                '&.Mui-selected': {
                  bgcolor: `${level.color}10`,
                },
              }}
            />
          ))}
        </Tabs>

        {/* Tab Panels */}
        {DOCUMENT_LEVELS.map((level, index) => (
          <TabPanel key={level.level} value={tabValue} index={index}>
            <Box sx={{ p: 3 }}>
              {/* Level Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box
                    sx={{
                      width: 50,
                      height: 50,
                      borderRadius: 2,
                      bgcolor: `${level.color}15`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon sx={{ fontSize: 28, color: level.color }}>{level.icon}</Icon>
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={700} sx={{ color: level.color }}>
                      Level {level.level}: {level.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {level.description}
                    </Typography>
                  </Box>
                </Box>
                <Button
                  variant="contained"
                  startIcon={<Icon>add</Icon>}
                  onClick={handleAdd}
                  sx={{ bgcolor: level.color, '&:hover': { bgcolor: level.color } }}
                >
                  Add Document
                </Button>
              </Box>

              {/* Documents Table */}
              {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : documents.length === 0 ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                    borderStyle: 'dashed',
                  }}
                >
                  <Icon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }}>folder_open</Icon>
                  <Typography variant="h6" color="text.secondary" gutterBottom>
                    No documents yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Click "Add Document" to add your first document to {level.label}
                  </Typography>
                </Paper>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }} width={70}>Sr No</TableCell>
                        <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Title</TableCell>
                        <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Description</TableCell>
                        <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }} width={100}>Version</TableCell>
                        <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }} width={100}>Status</TableCell>
                        <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }} width={180} align="center">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents
                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                        .map((doc, index) => (
                        <TableRow key={doc.id} hover>
                          <TableCell>
                            <Typography fontWeight={500}>{page * rowsPerPage + index + 1}</Typography>
                          </TableCell>
                          <TableCell>
                            <Typography fontWeight={500}>{doc.title}</Typography>
                            {doc.file_url && (
                              <Typography variant="caption" color="primary">
                                <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                                  View File
                                </a>
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary" sx={{
                              maxWidth: 300,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              {doc.description || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>{doc.version}</TableCell>
                          <TableCell>
                            <Chip
                              label={doc.status}
                              size="small"
                              color={doc.status === 'Active' ? 'success' : doc.status === 'Draft' ? 'warning' : 'default'}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" onClick={() => handleView(doc)} color="info" title="View">
                              <Icon>visibility</Icon>
                            </IconButton>
                            <IconButton size="small" onClick={() => handlePrint(doc)} color="secondary" title="Print">
                              <Icon>print</Icon>
                            </IconButton>
                            <IconButton size="small" onClick={() => handleEdit(doc)} color="primary" title="Edit">
                              <Icon>edit</Icon>
                            </IconButton>
                            <IconButton size="small" onClick={() => handleDelete(doc)} color="error" title="Delete">
                              <Icon>delete</Icon>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={documents.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                  />
                </TableContainer>
              )}
            </Box>
          </TabPanel>
        ))}
      </Paper>

      {/* Add Document Dialog */}
      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: currentLevel.color, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon>{currentLevel.icon}</Icon>
            Add Document to Level {currentLevel.level}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="File URL (Google Drive, etc.)"
            fullWidth
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              sx={{ width: 120 }}
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              sx={{ width: 150 }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} sx={{ bgcolor: currentLevel.color }}>
            Add Document
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Document Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: currentLevel.color, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon>edit</Icon>
            Edit Document
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <TextField
            label="Title"
            fullWidth
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            label="File URL (Google Drive, etc.)"
            fullWidth
            value={formData.file_url}
            onChange={(e) => setFormData({ ...formData, file_url: e.target.value })}
            sx={{ mb: 2 }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Version"
              value={formData.version}
              onChange={(e) => setFormData({ ...formData, version: e.target.value })}
              sx={{ width: 120 }}
            />
            <TextField
              select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              sx={{ width: 150 }}
            >
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Draft">Draft</MenuItem>
              <MenuItem value="Archived">Archived</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleUpdate} sx={{ bgcolor: currentLevel.color }}>
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Document Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: currentLevel.color, color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon>visibility</Icon>
            View Document
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {viewDocument && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="caption" color="text.secondary">
                  Level {currentLevel.level}: {currentLevel.label}
                </Typography>
                <Chip
                  label={viewDocument.status}
                  size="small"
                  color={viewDocument.status === 'Active' ? 'success' : viewDocument.status === 'Draft' ? 'warning' : 'default'}
                />
              </Box>
              <Typography variant="h5" fontWeight={700} sx={{ color: currentLevel.color, mb: 1 }}>
                {viewDocument.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Version: {viewDocument.version}
              </Typography>
              <Paper sx={{ p: 3, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                  {viewDocument.description || 'No description available.'}
                </Typography>
              </Paper>
              {viewDocument.file_url && (
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Icon>open_in_new</Icon>}
                    href={viewDocument.file_url}
                    target="_blank"
                  >
                    Open File
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handlePrint(viewDocument!)} startIcon={<Icon>print</Icon>}>
            Print
          </Button>
          <Button onClick={() => setViewDialogOpen(false)} variant="contained" sx={{ bgcolor: currentLevel.color }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

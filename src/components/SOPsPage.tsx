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
  CardActions,
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
  Grid,
  Tab,
  Tabs,
  Divider,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Description as SOPIcon,
  CloudDownload as DownloadIcon,
  Visibility as ViewIcon,
  Link as LinkIcon,
  Folder as FolderIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import type { SOPDocument } from '../types/sop';
import {
  loadAllSOPs,
  loadSOPsByChapter,
  saveSOPDocument,
  updateSOPDocument,
  deleteSOPDocument,
  uploadMultipleSOPPdfs,
} from '../services/sopStorage';
import {
  extractFileIdFromUrl,
  fetchGoogleDocAsHTML,
  extractChapterFromFilename,
} from '../services/googleDriveExtractor';

const NABH_CHAPTERS = [
  { code: 'AAC', name: 'Access, Assessment and Continuity of Care' },
  { code: 'COP', name: 'Care of Patients' },
  { code: 'MOM', name: 'Management of Medication' },
  { code: 'PRE', name: 'Patient Rights and Education' },
  { code: 'HIC', name: 'Hospital Infection Control' },
  { code: 'PSQ', name: 'Patient Safety and Quality Improvement' },
  { code: 'ROM', name: 'Responsibilities of Management' },
  { code: 'FMS', name: 'Facility Management and Safety' },
  { code: 'HRM', name: 'Human Resource Management' },
  { code: 'IMS', name: 'Information Management System' },
];

const SOP_CATEGORIES = [
  'Policy',
  'Procedure',
  'Protocol',
  'Guideline',
  'Work Instruction',
  'Form',
  'Checklist',
  'Other',
];

export default function SOPsPage() {
  const navigate = useNavigate();
  const [sops, setSOPs] = useState<SOPDocument[]>([]);
  const [filteredSOPs, setFilteredSOPs] = useState<SOPDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChapter, setSelectedChapter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Dialog states
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSOP, setSelectedSOP] = useState<SOPDocument | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<SOPDocument>>({
    title: '',
    chapter_code: 'AAC',
    chapter_name: 'Access, Assessment and Continuity of Care',
    description: '',
    version: '1.0',
    status: 'Active',
    category: 'Procedure',
    is_public: false,
    extracted_content: '',
    pdf_urls: [],
    pdf_filenames: [],
  });

  // Import state
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);

  // PDF upload state
  const [pendingPdfs, setPendingPdfs] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuSOP, setMenuSOP] = useState<SOPDocument | null>(null);

  // Load SOPs on mount
  useEffect(() => {
    loadSOPsData();
  }, []);

  // Filter SOPs when filters change
  useEffect(() => {
    filterSOPs();
  }, [sops, selectedChapter, searchQuery, selectedStatus]);

  const loadSOPsData = async () => {
    setLoading(true);
    const result = await loadAllSOPs();
    if (result.success && result.data) {
      setSOPs(result.data);
    } else {
      showSnackbar(result.error || 'Failed to load SOPs', 'error');
    }
    setLoading(false);
  };

  const filterSOPs = () => {
    let filtered = [...sops];

    // Filter by chapter
    if (selectedChapter !== 'all') {
      filtered = filtered.filter(sop => sop.chapter_code === selectedChapter);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(sop => sop.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        sop =>
          sop.title.toLowerCase().includes(query) ||
          sop.description?.toLowerCase().includes(query) ||
          sop.category?.toLowerCase().includes(query)
      );
    }

    setFilteredSOPs(filtered);
  };

  const handleAdd = () => {
    setFormData({
      title: '',
      chapter_code: 'AAC',
      chapter_name: 'Access, Assessment and Continuity of Care',
      description: '',
      version: '1.0',
      status: 'Active',
      category: 'Procedure',
      is_public: false,
      extracted_content: '',
      pdf_urls: [],
      pdf_filenames: [],
    });
    setPendingPdfs([]);
    setAddDialogOpen(true);
  };

  const handleEdit = (sop: SOPDocument) => {
    setSelectedSOP(sop);
    setFormData({
      ...sop,
      pdf_urls: sop.pdf_urls || [],
      pdf_filenames: sop.pdf_filenames || [],
    });
    setPendingPdfs([]);
    setEditDialogOpen(true);
    handleCloseMenu();
  };

  const handlePdfSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const newFiles = Array.from(files).filter(f => f.type === 'application/pdf');
    if (newFiles.length !== files.length) {
      showSnackbar('Only PDF files are allowed', 'error');
    }
    setPendingPdfs(prev => [...prev, ...newFiles]);
  };

  const handleRemovePdf = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setFormData(prev => ({
        ...prev,
        pdf_urls: (prev.pdf_urls || []).filter((_, i) => i !== index),
        pdf_filenames: (prev.pdf_filenames || []).filter((_, i) => i !== index),
      }));
    } else {
      setPendingPdfs(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleView = (sop: SOPDocument) => {
    setSelectedSOP(sop);
    setViewDialogOpen(true);
    handleCloseMenu();
  };

  const handleDelete = async (sop: SOPDocument) => {
    if (window.confirm(`Are you sure you want to delete "${sop.title}"?`)) {
      const result = await deleteSOPDocument(sop.id);
      if (result.success) {
        showSnackbar('SOP deleted successfully', 'success');
        loadSOPsData();
      } else {
        showSnackbar(result.error || 'Failed to delete SOP', 'error');
      }
    }
    handleCloseMenu();
  };

  const handleSave = async () => {
    if (!formData.title || !formData.extracted_content) {
      showSnackbar('Please fill in required fields', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Upload pending PDFs first
      let pdfUrls = [...(formData.pdf_urls || [])];
      let pdfFilenames = [...(formData.pdf_filenames || [])];

      if (pendingPdfs.length > 0) {
        const uploadResult = await uploadMultipleSOPPdfs(pendingPdfs);
        if (uploadResult.success && uploadResult.urls && uploadResult.filenames) {
          pdfUrls = [...pdfUrls, ...uploadResult.urls];
          pdfFilenames = [...pdfFilenames, ...uploadResult.filenames];
        } else {
          throw new Error(uploadResult.error || 'Failed to upload PDFs');
        }
      }

      const sopData = {
        ...formData,
        chapter_name: NABH_CHAPTERS.find(ch => ch.code === formData.chapter_code)?.name || formData.chapter_code,
        pdf_urls: pdfUrls,
        pdf_filenames: pdfFilenames,
        pdf_url: pdfUrls[0] || undefined,
        pdf_filename: pdfFilenames[0] || undefined,
      };

      const result = await saveSOPDocument(sopData as Omit<SOPDocument, 'id' | 'created_at' | 'updated_at'>);

      if (result.success) {
        showSnackbar('SOP saved successfully', 'success');
        setAddDialogOpen(false);
        setPendingPdfs([]);
        loadSOPsData();
      } else {
        showSnackbar(result.error || 'Failed to save SOP', 'error');
      }
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Failed to save SOP', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedSOP || !formData.title) {
      showSnackbar('Please fill in required fields', 'error');
      return;
    }

    setIsUploading(true);

    try {
      // Upload pending PDFs first
      let pdfUrls = [...(formData.pdf_urls || [])];
      let pdfFilenames = [...(formData.pdf_filenames || [])];

      if (pendingPdfs.length > 0) {
        const uploadResult = await uploadMultipleSOPPdfs(pendingPdfs);
        if (uploadResult.success && uploadResult.urls && uploadResult.filenames) {
          pdfUrls = [...pdfUrls, ...uploadResult.urls];
          pdfFilenames = [...pdfFilenames, ...uploadResult.filenames];
        } else {
          throw new Error(uploadResult.error || 'Failed to upload PDFs');
        }
      }

      const updateData = {
        ...formData,
        pdf_urls: pdfUrls,
        pdf_filenames: pdfFilenames,
        pdf_url: pdfUrls[0] || undefined,
        pdf_filename: pdfFilenames[0] || undefined,
      };

      const result = await updateSOPDocument(selectedSOP.id, updateData);

      if (result.success) {
        showSnackbar('SOP updated successfully', 'success');
        setEditDialogOpen(false);
        setPendingPdfs([]);
        loadSOPsData();
      } else {
        showSnackbar(result.error || 'Failed to update SOP', 'error');
      }
    } catch (error) {
      showSnackbar(error instanceof Error ? error.message : 'Failed to update SOP', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImportFromDrive = async () => {
    if (!importUrl) {
      showSnackbar('Please enter a Google Drive URL', 'error');
      return;
    }

    setImporting(true);

    try {
      const fileId = extractFileIdFromUrl(importUrl);
      if (!fileId) {
        showSnackbar('Invalid Google Drive URL', 'error');
        setImporting(false);
        return;
      }

      // Fetch HTML content
      const content = await fetchGoogleDocAsHTML(fileId);

      // Extract chapter from filename (if available)
      const chapterCode = extractChapterFromFilename(importUrl) || 'AAC';

      // Pre-fill form
      setFormData({
        ...formData,
        google_drive_url: importUrl,
        google_drive_file_id: fileId,
        extracted_content: content,
        chapter_code: chapterCode,
        chapter_name: NABH_CHAPTERS.find(ch => ch.code === chapterCode)?.name || chapterCode,
      });

      setImportDialogOpen(false);
      setAddDialogOpen(true);
      showSnackbar('Content imported successfully! Please review and save.', 'success');
    } catch (error) {
      showSnackbar('Failed to import from Google Drive. Check if the document is publicly accessible.', 'error');
      console.error(error);
    }

    setImporting(false);
  };

  const handleShare = (sop: SOPDocument) => {
    const url = `${window.location.origin}/sop/${sop.id}`;
    navigator.clipboard.writeText(url);
    showSnackbar('Shareable URL copied to clipboard!', 'success');
    handleCloseMenu();
  };

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, sop: SOPDocument) => {
    setAnchorEl(event.currentTarget);
    setMenuSOP(sop);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setMenuSOP(null);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Group SOPs by chapter for stats
  const sopStats = NABH_CHAPTERS.map(chapter => ({
    ...chapter,
    count: sops.filter(sop => sop.chapter_code === chapter.code).length,
  }));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box textAlign="center">
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading SOPs...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <Icon sx={{ fontSize: 40, color: 'primary.main' }}>description</Icon>
          <Box>
            <Typography variant="h4" fontWeight="bold">
              Standard Operating Procedures
            </Typography>
            <Typography variant="body2" color="text.secondary">
              NABH SOPs organized by chapter with shareable links
            </Typography>
          </Box>
        </Box>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<FolderIcon />}
            onClick={() => setImportDialogOpen(true)}
          >
            Import from Drive
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
            Add SOP
          </Button>
        </Box>
      </Box>

      {/* Stats Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" mb={2}>
          SOPs by Chapter
        </Typography>
        <Grid container spacing={2}>
          {sopStats.map(stat => (
            <Grid item xs={6} sm={4} md={2.4} key={stat.code}>
              <Box textAlign="center">
                <Typography variant="h4" color="primary.main">
                  {stat.count}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {stat.code}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3} flexWrap="wrap">
        <TextField
          size="small"
          placeholder="Search SOPs..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Chapter</InputLabel>
          <Select value={selectedChapter} onChange={e => setSelectedChapter(e.target.value)} label="Chapter">
            <MenuItem value="all">All Chapters</MenuItem>
            {NABH_CHAPTERS.map(ch => (
              <MenuItem key={ch.code} value={ch.code}>
                {ch.code}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} label="Status">
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Draft">Draft</MenuItem>
            <MenuItem value="Under Review">Under Review</MenuItem>
            <MenuItem value="Archived">Archived</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* SOPs Grid */}
      <Grid container spacing={3}>
        {filteredSOPs.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>description</Icon>
              <Typography variant="h6" color="text.secondary">
                No SOPs found
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                {sops.length === 0
                  ? 'Start by importing SOPs from Google Drive or adding them manually.'
                  : 'Try adjusting your filters or search query.'}
              </Typography>
              {sops.length === 0 && (
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd}>
                  Add First SOP
                </Button>
              )}
            </Paper>
          </Grid>
        ) : (
          filteredSOPs.map(sop => (
            <Grid item xs={12} sm={6} md={4} key={sop.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start" mb={1}>
                    <Chip label={sop.chapter_code} color="primary" size="small" />
                    <IconButton size="small" onClick={e => handleOpenMenu(e, sop)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {sop.title}
                  </Typography>
                  {sop.description && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {sop.description}
                    </Typography>
                  )}
                  <Box display="flex" gap={1} mt={2} flexWrap="wrap">
                    <Chip label={sop.status} size="small" color={sop.status === 'Active' ? 'success' : 'default'} />
                    {sop.category && <Chip label={sop.category} size="small" variant="outlined" />}
                    {sop.version && <Chip label={`v${sop.version}`} size="small" variant="outlined" />}
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" startIcon={<ViewIcon />} onClick={() => handleView(sop)}>
                    View
                  </Button>
                  <Button size="small" startIcon={<ShareIcon />} onClick={() => handleShare(sop)}>
                    Share
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Context Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleCloseMenu}>
        <MenuItem onClick={() => menuSOP && handleView(menuSOP)}>
          <ViewIcon fontSize="small" sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => menuSOP && handleEdit(menuSOP)}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => menuSOP && handleShare(menuSOP)}>
          <ShareIcon fontSize="small" sx={{ mr: 1 }} />
          Share
        </MenuItem>
        {menuSOP?.google_drive_url && (
          <MenuItem onClick={() => window.open(menuSOP.google_drive_url, '_blank')}>
            <LinkIcon fontSize="small" sx={{ mr: 1 }} />
            Open in Drive
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => menuSOP && handleDelete(menuSOP)} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add/Edit Dialog */}
      <Dialog open={addDialogOpen || editDialogOpen} onClose={() => {
        setAddDialogOpen(false);
        setEditDialogOpen(false);
      }} maxWidth="md" fullWidth>
        <DialogTitle>{addDialogOpen ? 'Add SOP' : 'Edit SOP'}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <TextField
              label="Title"
              fullWidth
              required
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
            <FormControl fullWidth required>
              <InputLabel>Chapter</InputLabel>
              <Select
                value={formData.chapter_code}
                onChange={e => {
                  const chapter = NABH_CHAPTERS.find(ch => ch.code === e.target.value);
                  setFormData({
                    ...formData,
                    chapter_code: e.target.value,
                    chapter_name: chapter?.name || e.target.value,
                  });
                }}
                label="Chapter"
              >
                {NABH_CHAPTERS.map(ch => (
                  <MenuItem key={ch.code} value={ch.code}>
                    {ch.code} - {ch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    label="Category"
                  >
                    {SOP_CATEGORIES.map(cat => (
                      <MenuItem key={cat} value={cat}>
                        {cat}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Version"
                  fullWidth
                  value={formData.version}
                  onChange={e => setFormData({ ...formData, version: e.target.value })}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as SOPDocument['status'] })}
                    label="Status"
                  >
                    <MenuItem value="Draft">Draft</MenuItem>
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Under Review">Under Review</MenuItem>
                    <MenuItem value="Archived">Archived</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Effective Date"
                  type="date"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  value={formData.effective_date}
                  onChange={e => setFormData({ ...formData, effective_date: e.target.value })}
                />
              </Grid>
            </Grid>
            <TextField
              label="Content"
              fullWidth
              multiline
              rows={8}
              required
              value={formData.extracted_content}
              onChange={e => setFormData({ ...formData, extracted_content: e.target.value })}
              placeholder="Enter SOP content or import from Google Drive"
            />
            {formData.google_drive_url && (
              <Alert severity="info">
                Linked to Google Drive: <a href={formData.google_drive_url} target="_blank" rel="noopener noreferrer">View Original</a>
              </Alert>
            )}

            {/* PDF Upload Section */}
            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <Icon sx={{ color: '#D32F2F' }}>picture_as_pdf</Icon>
                <Typography fontWeight={600}>Attach PDF Documents</Typography>
              </Box>
              <Button
                variant="outlined"
                component="label"
                startIcon={<Icon>cloud_upload</Icon>}
                disabled={isUploading}
              >
                Upload PDFs
                <input
                  type="file"
                  hidden
                  multiple
                  accept=".pdf"
                  onChange={handlePdfSelect}
                />
              </Button>
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                Max file size: 10MB per file. You can upload multiple PDFs.
              </Typography>

              {/* Existing PDFs */}
              {(formData.pdf_urls?.length ?? 0) > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Uploaded PDFs:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {formData.pdf_urls?.map((url, index) => (
                      <Chip
                        key={`existing-${index}`}
                        label={formData.pdf_filenames?.[index] || `PDF ${index + 1}`}
                        icon={<Icon sx={{ fontSize: 18 }}>picture_as_pdf</Icon>}
                        onDelete={() => handleRemovePdf(index, true)}
                        onClick={() => window.open(url, '_blank')}
                        sx={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Box>
                </Box>
              )}

              {/* Pending PDFs */}
              {pendingPdfs.length > 0 && (
                <Box mt={2}>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    Pending upload:
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
                    {pendingPdfs.map((file, index) => (
                      <Chip
                        key={`pending-${index}`}
                        label={file.name}
                        icon={<Icon sx={{ fontSize: 18 }}>upload_file</Icon>}
                        onDelete={() => handleRemovePdf(index, false)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setAddDialogOpen(false);
              setEditDialogOpen(false);
            }}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={addDialogOpen ? handleSave : handleUpdate}
            disabled={isUploading}
            startIcon={isUploading ? <CircularProgress size={20} color="inherit" /> : null}
          >
            {isUploading ? 'Saving...' : (addDialogOpen ? 'Save' : 'Update')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import from Google Drive</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            <Alert severity="info">
              Enter a Google Drive document URL. Make sure the document is publicly accessible.
            </Alert>
            <TextField
              label="Google Drive URL"
              fullWidth
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              placeholder="https://docs.google.com/document/d/..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setImportDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleImportFromDrive} disabled={importing}>
            {importing ? <CircularProgress size={24} /> : 'Import'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">{selectedSOP?.title}</Typography>
            <Box display="flex" gap={1}>
              <IconButton onClick={() => selectedSOP && handleShare(selectedSOP)}>
                <ShareIcon />
              </IconButton>
              <IconButton onClick={() => setViewDialogOpen(false)}>
                <Icon>close</Icon>
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedSOP && (
            <Box>
              <Box display="flex" gap={1} mb={2}>
                <Chip label={selectedSOP.chapter_code} color="primary" size="small" />
                <Chip label={selectedSOP.status} size="small" />
                {selectedSOP.version && <Chip label={`v${selectedSOP.version}`} size="small" />}
              </Box>
              {selectedSOP.description && (
                <Typography variant="body1" paragraph>
                  {selectedSOP.description}
                </Typography>
              )}
              <Divider sx={{ my: 2 }} />
              <Box
                dangerouslySetInnerHTML={{ __html: selectedSOP.extracted_content }}
                sx={{
                  '& .sop-heading-1': { fontSize: '2rem', fontWeight: 'bold', mt: 2, mb: 1 },
                  '& .sop-heading-2': { fontSize: '1.5rem', fontWeight: 'bold', mt: 2, mb: 1 },
                  '& .sop-heading-3': { fontSize: '1.25rem', fontWeight: 'bold', mt: 1, mb: 1 },
                  '& .sop-paragraph': { mb: 1 },
                  '& .sop-table': { width: '100%', borderCollapse: 'collapse', my: 2 },
                  '& .sop-table td, & .sop-table th': { border: '1px solid #ddd', p: 1 },
                }}
              />
              {/* Attached PDFs - Embedded Viewer */}
              {selectedSOP.pdf_urls && selectedSOP.pdf_urls.length > 0 && (
                <Box mt={3}>
                  <Divider sx={{ mb: 2 }} />
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Attached Documents
                  </Typography>

                  {/* PDF Tabs if multiple */}
                  {selectedSOP.pdf_urls.length > 1 && (
                    <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
                      {selectedSOP.pdf_urls.map((url, index) => (
                        <Chip
                          key={index}
                          label={selectedSOP.pdf_filenames?.[index] || `PDF ${index + 1}`}
                          icon={<Icon sx={{ fontSize: 18 }}>picture_as_pdf</Icon>}
                          onClick={() => window.open(url, '_blank')}
                          color="primary"
                          variant="outlined"
                          sx={{ cursor: 'pointer' }}
                        />
                      ))}
                    </Box>
                  )}

                  {/* Embedded PDF Viewer */}
                  {selectedSOP.pdf_urls.map((url, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      {selectedSOP.pdf_urls && selectedSOP.pdf_urls.length > 1 && (
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>
                          {selectedSOP.pdf_filenames?.[index] || `PDF ${index + 1}`}
                        </Typography>
                      )}
                      <Paper
                        variant="outlined"
                        sx={{
                          width: '100%',
                          height: 500,
                          overflow: 'hidden',
                          borderRadius: 2,
                        }}
                      >
                        <iframe
                          src={`${url}#toolbar=1&navpanes=0`}
                          width="100%"
                          height="100%"
                          style={{ border: 'none' }}
                          title={selectedSOP.pdf_filenames?.[index] || `PDF ${index + 1}`}
                        />
                      </Paper>
                      <Button
                        size="small"
                        startIcon={<Icon>open_in_new</Icon>}
                        onClick={() => window.open(url, '_blank')}
                        sx={{ mt: 1 }}
                      >
                        Open in New Tab
                      </Button>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>{snackbar.message}</Alert>
      </Snackbar>
    </Container>
  );
}

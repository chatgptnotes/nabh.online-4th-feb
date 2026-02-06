import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Button,
} from '@mui/material';
import {
  PictureAsPdf as PdfIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { getGeneratedSOPsByChapter, deleteGeneratedSOP, type GeneratedSOP } from '../services/sopGeneratedStorage';

export default function SOPDatabasePage() {
  const navigate = useNavigate();
  const [sops, setSOPs] = useState<GeneratedSOP[]>([]);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<any[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedSOP, setSelectedSOP] = useState<GeneratedSOP | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Fetch chapters on mount
  useEffect(() => {
    fetchChapters();
  }, []);

  // Fetch SOPs when chapter filter changes
  useEffect(() => {
    fetchSOPs();
  }, [selectedChapter]);

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('nabh_chapters')
      .select('*')
      .order('chapter_number', { ascending: true });

    if (data) setChapters(data);
    if (error) console.error('Error fetching chapters:', error);
  };

  const fetchSOPs = async () => {
    setLoading(true);
    try {
      const result = await getGeneratedSOPsByChapter(selectedChapter || undefined);
      if (result.success && result.data) {
        setSOPs(result.data);
      } else {
        console.error('Error fetching SOPs:', result.error);
        showSnackbar('Failed to load SOPs', 'error');
      }
    } catch (error) {
      console.error('Error fetching SOPs:', error);
      showSnackbar('Failed to load SOPs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSOP = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this SOP? This will also delete the PDF file.')) {
      return;
    }

    try {
      const result = await deleteGeneratedSOP(id);
      if (result.success) {
        showSnackbar('SOP deleted successfully', 'success');
        fetchSOPs();
        if (selectedSOP?.id === id) {
          setSelectedSOP(null);
        }
      } else {
        showSnackbar(result.error || 'Failed to delete SOP', 'error');
      }
    } catch (error) {
      console.error('Error deleting SOP:', error);
      showSnackbar('Failed to delete SOP', 'error');
    }
  };

  const handleCardClick = (sop: GeneratedSOP) => {
    if (sop.pdf_url) {
      window.open(sop.pdf_url, '_blank');
    } else {
      setSelectedSOP(sop);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Draft': return 'warning';
      case 'Under Review': return 'info';
      case 'Archived': return 'default';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/recent-sops')} color="primary">
            <BackIcon />
          </IconButton>
          <Typography variant="h5" fontWeight="bold">
            📚 SOP Database
          </Typography>
          <Chip
            label={`${sops.length} SOPs`}
            color="primary"
            variant="outlined"
          />
        </Box>

        {/* Chapter Filter */}
        <FormControl size="small" sx={{ minWidth: 250, bgcolor: 'white' }}>
          <InputLabel>Filter by Chapter</InputLabel>
          <Select
            value={selectedChapter}
            label="Filter by Chapter"
            onChange={(e) => setSelectedChapter(e.target.value)}
          >
            <MenuItem value="">All Chapters</MenuItem>
            {chapters.map((ch) => (
              <MenuItem key={ch.id} value={ch.name.match(/^[A-Z]{3}/)?.[0] || ''}>
                {ch.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading SOPs...</Typography>
        </Box>
      ) : selectedSOP ? (
        /* SOP Detail View */
        <Paper elevation={2} sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                {selectedSOP.objective_code} - {selectedSOP.objective_title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedSOP.chapter_name}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<BackIcon />}
              onClick={() => setSelectedSOP(null)}
            >
              Back to List
            </Button>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip label={selectedSOP.chapter_code} color="primary" size="small" />
            <Chip label={`v${selectedSOP.version}`} color="info" size="small" />
            <Chip label={selectedSOP.status} color={getStatusColor(selectedSOP.status) as any} size="small" />
            {selectedSOP.document_number && (
              <Chip label={selectedSOP.document_number} variant="outlined" size="small" />
            )}
          </Box>

          <Box
            sx={{
              bgcolor: '#fff',
              border: '1px solid #ddd',
              borderRadius: 1,
              p: 2,
              minHeight: 400,
              '& iframe': {
                width: '100%',
                minHeight: 500,
                border: 'none'
              }
            }}
            dangerouslySetInnerHTML={{ __html: selectedSOP.sop_html_content }}
          />
        </Paper>
      ) : sops.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary">
            No SOPs found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {selectedChapter
              ? `No SOPs found for chapter ${selectedChapter}. Try selecting a different chapter or generate new SOPs.`
              : 'No SOPs have been generated yet. Go to Recent SOPs to generate your first SOP.'
            }
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => navigate('/recent-sops')}
          >
            Go to SOP Generator
          </Button>
        </Box>
      ) : (
        /* SOP Grid */
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: 2 }}>
          {sops.map((sop) => (
            <Paper
              key={sop.id}
              elevation={2}
              sx={{
                p: 2,
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)'
                },
                border: '1px solid',
                borderColor: 'divider',
              }}
              onClick={() => handleCardClick(sop)}
            >
              {/* Header Row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ lineHeight: 1.3 }}>
                  {sop.objective_code}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  {sop.pdf_url && (
                    <Chip
                      icon={<PdfIcon sx={{ fontSize: 16 }} />}
                      label="PDF"
                      size="small"
                      color="error"
                      sx={{ height: 24, '& .MuiChip-label': { px: 0.5 } }}
                    />
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => handleDeleteSOP(sop.id, e)}
                    sx={{ color: 'error.light', p: 0.5 }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>

              {/* Title */}
              <Typography
                variant="body2"
                sx={{
                  mb: 1.5,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  lineHeight: 1.4,
                  minHeight: '2.8em'
                }}
              >
                {sop.objective_title}
              </Typography>

              {/* Chips Row */}
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1.5 }}>
                <Chip
                  label={sop.chapter_code}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22 }}
                />
                <Chip
                  label={`v${sop.version}`}
                  size="small"
                  color="info"
                  sx={{ height: 22 }}
                />
                <Chip
                  label={sop.status}
                  size="small"
                  color={getStatusColor(sop.status) as any}
                  sx={{ height: 22 }}
                />
              </Box>

              {/* Footer */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  {new Date(sop.created_at).toLocaleDateString()}
                </Typography>
                {sop.created_by && (
                  <Typography variant="caption" color="text.secondary">
                    by {sop.created_by}
                  </Typography>
                )}
              </Box>

              {/* View Action Hint */}
              <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ViewIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  {sop.pdf_url ? 'Click to open PDF' : 'Click to view content'}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

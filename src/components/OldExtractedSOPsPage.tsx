import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  Collapse,
  Divider,
  Button,
  TextField,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as CopyIcon,
  Description as DescriptionIcon,
  Folder as FolderIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { supabase } from '../lib/supabase';

// NABH Chapter codes and their full names
const NABH_CHAPTERS = [
  { code: 'AAC', name: 'Access, Assessment and Continuity of Care', color: '#1565C0' },
  { code: 'COP', name: 'Care of Patients', color: '#2E7D32' },
  { code: 'MOM', name: 'Management of Medication', color: '#7B1FA2' },
  { code: 'PRE', name: 'Patient Rights and Education', color: '#C62828' },
  { code: 'HIC', name: 'Hospital Infection Control', color: '#00838F' },
  { code: 'CQI', name: 'Continuous Quality Improvement', color: '#EF6C00' },
  { code: 'ROM', name: 'Responsibilities of Management', color: '#5D4037' },
  { code: 'FMS', name: 'Facility Management and Safety', color: '#455A64' },
  { code: 'HRM', name: 'Human Resource Management', color: '#AD1457' },
  { code: 'IMS', name: 'Information Management System', color: '#1976D2' },
];

interface ChapterData {
  id: string;
  chapter_id: string;
  objective_code: string | null;
  data_type: string;
  content: string;
  title: string | null;
  created_by: string | null;
  created_at: string;
}

interface ChapterInfo {
  id: string;
  name: string;
  chapter_number: number;
}

export default function OldExtractedSOPsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState(0);
  const [chapterData, setChapterData] = useState<Record<string, ChapterData[]>>({});
  const [chapters, setChapters] = useState<ChapterInfo[]>([]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});
  const [editingItems, setEditingItems] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  const [editedTitle, setEditedTitle] = useState<Record<string, string>>({});
  const [savingItems, setSavingItems] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      // Fetch chapters first
      const { data: chaptersData, error: chaptersError } = await supabase
        .from('nabh_chapters')
        .select('id, name, chapter_number')
        .order('chapter_number', { ascending: true });

      if (chaptersError) {
        console.error('Error fetching chapters:', chaptersError);
        setSnackbar({ open: true, message: 'Error fetching chapters', severity: 'error' });
        return;
      }

      setChapters(chaptersData || []);

      // Fetch all chapter data
      const { data: allData, error: dataError } = await supabase
        .from('nabh_chapter_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (dataError) {
        console.error('Error fetching chapter data:', dataError);
        setSnackbar({ open: true, message: 'Error fetching SOP data', severity: 'error' });
        return;
      }

      // Group data by chapter code
      const grouped: Record<string, ChapterData[]> = {};

      NABH_CHAPTERS.forEach(ch => {
        grouped[ch.code] = [];
      });

      if (allData) {
        allData.forEach((item: ChapterData) => {
          // Find the chapter info to get the code
          const chapterInfo = chaptersData?.find(c => c.id === item.chapter_id);
          if (chapterInfo) {
            // Extract chapter code from name (e.g., "AAC - Access..." => "AAC")
            const codeMatch = chapterInfo.name.match(/^([A-Z]{3})/);
            if (codeMatch) {
              const code = codeMatch[1];
              if (grouped[code]) {
                grouped[code].push(item);
              }
            }
          }
        });
      }

      setChapterData(grouped);
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Failed to load data', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setSnackbar({ open: true, message: 'Content copied to clipboard!', severity: 'success' });
  };

  const handleStartEdit = (item: ChapterData) => {
    setEditingItems(prev => ({ ...prev, [item.id]: true }));
    setEditedContent(prev => ({ ...prev, [item.id]: item.content }));
    setEditedTitle(prev => ({ ...prev, [item.id]: item.title || '' }));
    // Auto-expand the item when editing
    setExpandedItems(prev => ({ ...prev, [item.id]: true }));
  };

  const handleCancelEdit = (itemId: string) => {
    setEditingItems(prev => ({ ...prev, [itemId]: false }));
    setEditedContent(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
    setEditedTitle(prev => {
      const updated = { ...prev };
      delete updated[itemId];
      return updated;
    });
  };

  const handleSaveEdit = async (item: ChapterData) => {
    setSavingItems(prev => ({ ...prev, [item.id]: true }));

    try {
      const { error } = await supabase
        .from('nabh_chapter_data')
        .update({
          content: editedContent[item.id],
          title: editedTitle[item.id] || null,
        })
        .eq('id', item.id);

      if (error) {
        console.error('Error updating:', error);
        setSnackbar({ open: true, message: 'Failed to save changes', severity: 'error' });
        return;
      }

      // Update local state
      setChapterData(prev => {
        const updated = { ...prev };
        Object.keys(updated).forEach(code => {
          updated[code] = updated[code].map(d => {
            if (d.id === item.id) {
              return {
                ...d,
                content: editedContent[item.id],
                title: editedTitle[item.id] || null,
              };
            }
            return d;
          });
        });
        return updated;
      });

      setEditingItems(prev => ({ ...prev, [item.id]: false }));
      setSnackbar({ open: true, message: 'Changes saved successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error:', error);
      setSnackbar({ open: true, message: 'Failed to save changes', severity: 'error' });
    } finally {
      setSavingItems(prev => ({ ...prev, [item.id]: false }));
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDataTypeColor = (dataType: string) => {
    switch (dataType) {
      case 'final_sop':
        return 'success';
      case 'documentation':
        return 'primary';
      default:
        return 'default';
    }
  };

  const currentChapter = NABH_CHAPTERS[selectedTab];
  const currentData = chapterData[currentChapter?.code] || [];

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header */}
      <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <FolderIcon sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Old Extracted SOP's
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              View and edit extracted SOP data from nabh_chapter_data table organized by NABH chapters
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Chapter Stats */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {NABH_CHAPTERS.map((ch, index) => (
          <Chip
            key={ch.code}
            label={`${ch.code}: ${chapterData[ch.code]?.length || 0}`}
            onClick={() => setSelectedTab(index)}
            sx={{
              bgcolor: selectedTab === index ? ch.color : 'transparent',
              color: selectedTab === index ? 'white' : ch.color,
              border: `1px solid ${ch.color}`,
              fontWeight: 600,
              '&:hover': {
                bgcolor: ch.color,
                color: 'white',
              },
            }}
          />
        ))}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              minWidth: 100,
              fontWeight: 600,
            },
          }}
        >
          {NABH_CHAPTERS.map((ch) => (
            <Tab
              key={ch.code}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <span>{ch.code}</span>
                  <Chip
                    label={chapterData[ch.code]?.length || 0}
                    size="small"
                    sx={{ height: 20, fontSize: '0.7rem' }}
                  />
                </Box>
              }
            />
          ))}
        </Tabs>
      </Paper>

      {/* Current Chapter Info */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: currentChapter?.color, color: 'white' }}>
        <Typography variant="h6" fontWeight="bold">
          {currentChapter?.code} - {currentChapter?.name}
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.9 }}>
          {currentData.length} extracted record(s) found
        </Typography>
      </Paper>

      {/* Data List */}
      {currentData.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <DescriptionIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary">
            No extracted data found for {currentChapter?.code}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Data will appear here when SOPs are extracted and saved for this chapter.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {currentData.map((item) => {
            const isEditing = editingItems[item.id];
            const isSaving = savingItems[item.id];

            return (
              <Card key={item.id} elevation={2} sx={{ border: isEditing ? '2px solid #1976d2' : 'none' }}>
                <CardContent sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip
                          label={item.data_type}
                          size="small"
                          color={getDataTypeColor(item.data_type) as any}
                        />
                        {item.objective_code && (
                          <Chip
                            label={item.objective_code}
                            size="small"
                            variant="outlined"
                          />
                        )}
                        {isEditing && (
                          <Chip
                            label="Editing"
                            size="small"
                            color="warning"
                            sx={{ fontWeight: 'bold' }}
                          />
                        )}
                      </Box>

                      {/* Title - Editable or Display */}
                      {isEditing ? (
                        <TextField
                          fullWidth
                          size="small"
                          label="Title"
                          value={editedTitle[item.id] || ''}
                          onChange={(e) => setEditedTitle(prev => ({ ...prev, [item.id]: e.target.value }))}
                          sx={{ mb: 1 }}
                        />
                      ) : (
                        <Typography variant="subtitle1" fontWeight="bold">
                          {item.title || `${currentChapter?.code} - ${item.objective_code || 'General'}`}
                        </Typography>
                      )}

                      <Typography variant="caption" color="text.secondary">
                        Created: {formatDate(item.created_at)} by {item.created_by || 'System'}
                      </Typography>
                    </Box>

                    {/* Action Buttons */}
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                      {isEditing ? (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            onClick={() => handleSaveEdit(item)}
                            disabled={isSaving}
                          >
                            Save
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon />}
                            onClick={() => handleCancelEdit(item.id)}
                            disabled={isSaving}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleStartEdit(item)}
                            title="Edit"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleCopy(item.content)} title="Copy content">
                            <CopyIcon fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => toggleExpand(item.id)}>
                            {expandedItems[item.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        </>
                      )}
                    </Box>
                  </Box>

                  {/* Preview - Only show when not editing and not expanded */}
                  {!isEditing && !expandedItems[item.id] && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%',
                      }}
                    >
                      {item.content?.substring(0, 200)}...
                    </Typography>
                  )}

                  {/* Expanded Content - View or Edit Mode */}
                  <Collapse in={expandedItems[item.id] || isEditing}>
                    <Divider sx={{ my: 2 }} />

                    {isEditing ? (
                      // Edit Mode - Textarea
                      <TextField
                        fullWidth
                        multiline
                        rows={15}
                        value={editedContent[item.id] || ''}
                        onChange={(e) => setEditedContent(prev => ({ ...prev, [item.id]: e.target.value }))}
                        sx={{
                          '& .MuiInputBase-input': {
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                          },
                        }}
                        placeholder="Enter content..."
                      />
                    ) : (
                      // View Mode
                      <Box
                        sx={{
                          bgcolor: '#f5f5f5',
                          p: 2,
                          borderRadius: 1,
                          maxHeight: '400px',
                          overflow: 'auto',
                        }}
                      >
                        {item.data_type === 'final_sop' && item.content?.startsWith('<') ? (
                          <Box
                            dangerouslySetInnerHTML={{ __html: item.content }}
                            sx={{
                              '& table': { width: '100%', borderCollapse: 'collapse' },
                              '& th, & td': { border: '1px solid #ddd', padding: '8px' },
                              '& h1, & h2, & h3': { marginTop: '16px', marginBottom: '8px' },
                            }}
                          />
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              whiteSpace: 'pre-wrap',
                              fontFamily: 'monospace',
                              fontSize: '0.85rem',
                            }}
                          >
                            {item.content}
                          </Typography>
                        )}
                      </Box>
                    )}
                  </Collapse>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

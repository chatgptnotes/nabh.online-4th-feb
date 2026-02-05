import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Chip,
  IconButton,
  Alert,
  Snackbar,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Link as LinkIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  Add as AddIcon,
  Description as DescriptionIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  AccessTime as AccessTimeIcon,
  Google as GoogleIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { useNABHStore } from '../store/nabhStore';
import LinkMetadataDialog from './shared/LinkMetadataDialog';
import type { LinkMetadata } from '../types/linkMetadata';

interface CheatSheet {
  chapterCode: string;
  chapterName: string;
  googleDocLink: string;
  linkTitle: string;
  description: string;
  lastUpdated: string;
  updatedBy: string;
  status: 'available' | 'missing' | 'outdated';
  tags: string[];
  keyPoints: string[];
  linkMetadata?: {
    title: string;
    description: string;
    keywords: string[];
    category?: string;
    type?: string;
    priority?: 'high' | 'medium' | 'low';
  };
}

// Chapter icons mapping
const chapterIcons: Record<string, string> = {
  AAC: 'accessible',
  COP: 'medical_services',
  MOM: 'medication',
  PRE: 'person',
  HIC: 'sanitizer',
  CQI: 'verified',
  PSQ: 'verified',
  ROM: 'business',
  FMS: 'apartment',
  HRM: 'groups',
  IMS: 'storage',
};

// Get chapter color based on code
const getChapterColor = (code: string) => {
  const colors: Record<string, string> = {
    AAC: '#E3F2FD', // Light Blue
    COP: '#E8F5E8', // Light Green
    MOM: '#FFF3E0', // Light Orange
    PRE: '#F3E5F5', // Light Purple
    HIC: '#E0F2F1', // Light Teal
    CQI: '#FFF8E1', // Light Yellow
    PSQ: '#FFEBEE', // Light Red
    ROM: '#F1F8E9', // Light Lime
    FMS: '#E1F5FE', // Light Cyan
    HRM: '#FCE4EC', // Light Pink
    IMS: '#F9FBE7', // Light Lime Green
  };
  return colors[code] || '#F5F5F5';
};

export default function CheatSheetsPage() {
  const { chapters } = useNABHStore();
  const [cheatSheets, setCheatSheets] = useState<CheatSheet[]>([]);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [selectedCheatSheet, setSelectedCheatSheet] = useState<CheatSheet | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const [additionalForm, setAdditionalForm] = useState({
    keyPoints: '',
    tags: '',
  });

  // Initialize cheat sheets from chapters
  useEffect(() => {
    const initialCheatSheets: CheatSheet[] = chapters.map(chapter => {
      // Check if there's existing data (would be loaded from Supabase in real implementation)
      const existingSheet = cheatSheets.find(cs => cs.chapterCode === chapter.code);
      
      if (existingSheet) {
        return existingSheet;
      }

      return {
        chapterCode: chapter.code,
        chapterName: chapter.fullName,
        googleDocLink: '',
        linkTitle: '',
        description: `Quick reference sheet for ${chapter.fullName} (${chapter.code})`,
        lastUpdated: '',
        updatedBy: '',
        status: 'missing' as const,
        tags: ['nabh', chapter.code.toLowerCase()],
        keyPoints: [],
        linkMetadata: undefined,
      };
    });

    setCheatSheets(initialCheatSheets);
  }, [chapters]);

  const handleEditCheatSheet = (cheatSheet: CheatSheet) => {
    setSelectedCheatSheet(cheatSheet);
    setAdditionalForm({
      keyPoints: cheatSheet.keyPoints.join('\n'),
      tags: cheatSheet.tags.join(', '),
    });
    setIsLinkDialogOpen(true);
  };

  const handleSaveLinkMetadata = async (linkData: LinkMetadata) => {
    if (!selectedCheatSheet) return;

    try {
      const updatedCheatSheet: CheatSheet = {
        ...selectedCheatSheet,
        googleDocLink: linkData.url,
        linkTitle: linkData.title,
        description: linkData.description,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'Dr. Shiraz (Quality Coordinator)',
        status: linkData.url ? 'available' : 'missing',
        tags: [...new Set([...selectedCheatSheet.tags, ...linkData.keywords])],
        linkMetadata: {
          title: linkData.title,
          description: linkData.description,
          keywords: linkData.keywords,
          category: linkData.category,
          type: linkData.type,
          priority: linkData.priority,
        },
      };

      // Update the cheat sheet in state
      setCheatSheets(sheets => 
        sheets.map(sheet => 
          sheet.chapterCode === selectedCheatSheet.chapterCode 
            ? updatedCheatSheet 
            : sheet
        )
      );

      // In a real implementation, this would save to Supabase with searchable metadata
      // await supabase.from('chapter_cheat_sheets').upsert(updatedCheatSheet);

      setSnackbar({ 
        open: true, 
        message: `Cheat sheet link with metadata saved for ${selectedCheatSheet.chapterCode}`, 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Error saving cheat sheet with metadata:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to save cheat sheet with metadata', 
        severity: 'error' 
      });
    }
  };

  // Old function removed - now using handleSaveLinkMetadata

  const handleDeleteCheatSheet = (chapterCode: string) => {
    setCheatSheets(sheets =>
      sheets.map(sheet =>
        sheet.chapterCode === chapterCode
          ? { ...sheet, googleDocLink: '', status: 'missing', lastUpdated: '', updatedBy: '' }
          : sheet
      )
    );
    setSnackbar({ 
      open: true, 
      message: `Cheat sheet link removed for ${chapterCode}`, 
      severity: 'success' 
    });
  };

  const handleOpenGoogleDoc = (link: string) => {
    if (link) {
      window.open(link, '_blank');
    }
  };

  const getStats = () => {
    const total = cheatSheets.length;
    const available = cheatSheets.filter(cs => cs.status === 'available').length;
    const missing = cheatSheets.filter(cs => cs.status === 'missing').length;
    const completionRate = total > 0 ? Math.round((available / total) * 100) : 0;

    return { total, available, missing, completionRate };
  };

  const stats = getStats();

  const getStatusColor = (status: CheatSheet['status']) => {
    switch (status) {
      case 'available': return 'success';
      case 'missing': return 'error';
      case 'outdated': return 'warning';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: CheatSheet['status']) => {
    switch (status) {
      case 'available': return <CheckCircleIcon />;
      case 'missing': return <WarningIcon />;
      case 'outdated': return <AccessTimeIcon />;
      default: return <WarningIcon />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <QuizIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h4" component="h1" fontWeight="bold">
              NABH Chapter Cheat Sheets
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Quick reference Google Docs for each NABH chapter - Essential for audit preparation
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" fontWeight="bold">
                {stats.total}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Chapters
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {stats.available}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cheat Sheets Ready
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {stats.missing}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Missing Cheat Sheets
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" fontWeight="bold">
                {stats.completionRate}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completion Rate
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* NABH Audit Alert */}
      {stats.completionRate < 100 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>NABH Audit Alert:</strong> {stats.missing} chapter cheat sheets missing. 
          Complete all cheat sheets before Feb 13-14, 2026 audit for quick reference during auditor questions.
        </Alert>
      )}

      {/* Cheat Sheets Grid */}
      <Grid container spacing={3}>
        {cheatSheets.map((cheatSheet) => (
          <Grid item xs={12} md={6} lg={4} key={cheatSheet.chapterCode}>
            <Card 
              elevation={2} 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column',
                bgcolor: getChapterColor(cheatSheet.chapterCode),
                border: cheatSheet.status === 'available' ? '2px solid #4CAF50' : 
                        cheatSheet.status === 'missing' ? '2px solid #f44336' : '1px solid #ddd'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                {/* Chapter Header */}
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar 
                    sx={{ 
                      bgcolor: 'primary.main',
                      width: 48,
                      height: 48,
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {cheatSheet.chapterCode}
                    </Typography>
                  </Avatar>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      {cheatSheet.chapterCode}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {cheatSheet.chapterName}
                    </Typography>
                  </Box>
                  <Chip
                    icon={getStatusIcon(cheatSheet.status)}
                    label={cheatSheet.status}
                    size="small"
                    color={getStatusColor(cheatSheet.status) as any}
                  />
                </Box>

                {/* Description */}
                <Typography variant="body2" color="text.secondary" mb={2}
                  sx={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                  {cheatSheet.description}
                </Typography>

                {/* Google Doc Status with Enhanced Metadata */}
                <Box display="flex" alignItems="center" gap={1} mb={2}>
                  <GoogleIcon sx={{ fontSize: 20, color: '#4285F4' }} />
                  <Box>
                    {cheatSheet.googleDocLink ? (
                      <>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {cheatSheet.linkTitle || 'Google Doc Linked ✓'}
                        </Typography>
                        {cheatSheet.linkMetadata && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {cheatSheet.linkMetadata.category} • {cheatSheet.linkMetadata.priority} priority
                          </Typography>
                        )}
                      </>
                    ) : (
                      <Typography variant="body2" color="error.main">
                        No Google Doc Link
                      </Typography>
                    )}
                  </Box>
                </Box>

                {/* Enhanced Description from Link Metadata */}
                {cheatSheet.linkMetadata?.description && (
                  <Box mb={2} p={2} bgcolor="primary.50" borderRadius={1} border="1px solid" borderColor="primary.200">
                    <Typography variant="body2" color="text.secondary" 
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}>
                      <strong>Content:</strong> {cheatSheet.linkMetadata.description}
                    </Typography>
                  </Box>
                )}

                {/* Tags and Keywords */}
                {(cheatSheet.tags.length > 0 || cheatSheet.linkMetadata?.keywords.length) && (
                  <Box mb={2}>
                    <Typography variant="caption" color="text.secondary" mb={1}>
                      Search Keywords:
                    </Typography>
                    <Box display="flex" gap={0.5} flexWrap="wrap">
                      {/* Original tags */}
                      {cheatSheet.tags.map((tag, index) => (
                        <Chip
                          key={`tag-${index}`}
                          label={tag}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', height: 20 }}
                        />
                      ))}
                      {/* Enhanced keywords from link metadata */}
                      {cheatSheet.linkMetadata?.keywords.map((keyword, index) => (
                        !cheatSheet.tags.includes(keyword) && (
                          <Chip
                            key={`keyword-${index}`}
                            label={keyword}
                            size="small"
                            variant="filled"
                            color="primary"
                            sx={{ fontSize: '0.7rem', height: 20 }}
                          />
                        )
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Key Points Preview */}
                {cheatSheet.keyPoints.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" mb={1}>Key Points:</Typography>
                    <List dense sx={{ py: 0 }}>
                      {cheatSheet.keyPoints.slice(0, 3).map((point, index) => (
                        <ListItem key={index} sx={{ py: 0.25, px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 16 }}>
                            <Box 
                              sx={{ 
                                width: 4, 
                                height: 4, 
                                bgcolor: 'primary.main', 
                                borderRadius: '50%' 
                              }} 
                            />
                          </ListItemIcon>
                          <ListItemText 
                            primary={point} 
                            sx={{ 
                              '& .MuiListItemText-primary': { 
                                fontSize: '0.875rem',
                                lineHeight: 1.2,
                              } 
                            }} 
                          />
                        </ListItem>
                      ))}
                      {cheatSheet.keyPoints.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          +{cheatSheet.keyPoints.length - 3} more points...
                        </Typography>
                      )}
                    </List>
                  </Box>
                )}

                {/* Last Updated Info */}
                {cheatSheet.lastUpdated && (
                  <Box mt={2} pt={1} borderTop="1px solid #eee">
                    <Typography variant="caption" color="text.secondary">
                      Updated: {new Date(cheatSheet.lastUpdated).toLocaleDateString()}
                    </Typography>
                    <br />
                    <Typography variant="caption" color="text.secondary">
                      By: {cheatSheet.updatedBy}
                    </Typography>
                  </Box>
                )}
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                <Box>
                  <Tooltip title="Edit cheat sheet">
                    <IconButton 
                      size="small"
                      onClick={() => handleEditCheatSheet(cheatSheet)}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  {cheatSheet.googleDocLink && (
                    <>
                      <Tooltip title="Open Google Doc">
                        <IconButton 
                          size="small"
                          onClick={() => handleOpenGoogleDoc(cheatSheet.googleDocLink)}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Remove link">
                        <IconButton 
                          size="small"
                          onClick={() => handleDeleteCheatSheet(cheatSheet.chapterCode)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </Box>
                <Box>
                  {cheatSheet.googleDocLink ? (
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<OpenInNewIcon />}
                      onClick={() => handleOpenGoogleDoc(cheatSheet.googleDocLink)}
                    >
                      Open Doc
                    </Button>
                  ) : (
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<AddIcon />}
                      onClick={() => handleEditCheatSheet(cheatSheet)}
                    >
                      Add Link
                    </Button>
                  )}
                </Box>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Enhanced Link Metadata Dialog */}
      {selectedCheatSheet && (
        <LinkMetadataDialog
          open={isLinkDialogOpen}
          onClose={() => setIsLinkDialogOpen(false)}
          onSave={handleSaveLinkMetadata}
          initialUrl={selectedCheatSheet.googleDocLink}
          title={`Add Link for ${selectedCheatSheet.chapterCode} Chapter`}
          subtitle={selectedCheatSheet.chapterName}
          context={`Chapter ${selectedCheatSheet.chapterCode} Cheat Sheet`}
          suggestedKeywords={[
            'nabh',
            selectedCheatSheet.chapterCode.toLowerCase(),
            'cheat sheet',
            'reference',
            'standards',
            'audit',
            ...selectedCheatSheet.tags,
          ]}
          suggestedCategory="Cheat Sheet"
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
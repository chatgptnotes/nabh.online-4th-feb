import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from '@mui/material';
import {
  Link as LinkIcon,
  Description as DescriptionIcon,
  LocalOffer as TagIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import type { LinkMetadata } from '../../types/linkMetadata';

// Re-export for convenience
export type { LinkMetadata } from '../../types/linkMetadata';

interface LinkMetadataDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (metadata: LinkMetadata) => void;
  initialUrl?: string;
  title: string;
  subtitle?: string;
  suggestedKeywords?: string[];
  suggestedCategory?: string;
  context?: string; // e.g., "Chapter AAC", "Quality Committee", etc.
}

// Common categories for different contexts
const DOCUMENT_CATEGORIES = [
  'Policy Document',
  'Procedure Manual',
  'Training Material',
  'Meeting Minutes',
  'Committee Document',
  'Evidence File',
  'Cheat Sheet',
  'Reference Guide',
  'Audit Report',
  'Quality Document',
  'NABH Standard',
  'SOP Document',
  'Forms & Templates',
  'Presentation',
  'External Link',
];

// Common NABH keywords for suggestions
const COMMON_NABH_KEYWORDS = [
  'nabh', 'quality', 'patient safety', 'infection control', 'hand hygiene',
  'admission', 'discharge', 'assessment', 'care plan', 'medication',
  'pain management', 'committee', 'training', 'audit', 'compliance',
  'standard', 'procedure', 'policy', 'evidence', 'documentation',
  'continuous improvement', 'patient rights', 'staff training',
  'emergency', 'safety', 'clinical audit', 'kpi', 'indicator',
];

export default function LinkMetadataDialog({
  open,
  onClose,
  onSave,
  initialUrl = '',
  title,
  subtitle,
  suggestedKeywords = [],
  suggestedCategory,
  context,
}: LinkMetadataDialogProps) {
  const [metadata, setMetadata] = useState<LinkMetadata>({
    url: initialUrl,
    title: '',
    description: '',
    keywords: [],
    category: suggestedCategory || '',
    type: 'other',
    priority: 'medium',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      setMetadata({
        url: initialUrl,
        title: '',
        description: '',
        keywords: suggestedKeywords,
        category: suggestedCategory || '',
        type: detectLinkType(initialUrl),
        priority: 'medium',
      });
      setKeywordInput('');
      setErrors({});
    }
  }, [open, initialUrl, suggestedKeywords, suggestedCategory]);

  // Auto-detect link type from URL
  const detectLinkType = (url: string): LinkMetadata['type'] => {
    if (!url) return 'other';
    
    if (url.includes('docs.google.com/document')) return 'google_docs';
    if (url.includes('docs.google.com/spreadsheets')) return 'google_sheets';
    if (url.includes('.pdf')) return 'pdf';
    if (url.startsWith('http')) return 'website';
    
    return 'other';
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!metadata.url.trim()) {
      newErrors.url = 'URL is required';
    } else if (!isValidUrl(metadata.url)) {
      newErrors.url = 'Please enter a valid URL';
    }

    if (!metadata.title.trim()) {
      newErrors.title = 'Document title is required';
    }

    if (!metadata.description.trim()) {
      newErrors.description = 'Description is required for searchability';
    }

    if (metadata.keywords.length === 0) {
      newErrors.keywords = 'At least one keyword is required for search';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if URL is valid
  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  // Handle URL change and auto-detect type
  const handleUrlChange = (url: string) => {
    setMetadata({
      ...metadata,
      url,
      type: detectLinkType(url),
    });
    
    // Clear URL error if now valid
    if (errors.url && isValidUrl(url)) {
      setErrors({ ...errors, url: '' });
    }
  };

  // Add keyword
  const handleAddKeyword = (keyword: string) => {
    if (keyword && !metadata.keywords.includes(keyword.toLowerCase())) {
      setMetadata({
        ...metadata,
        keywords: [...metadata.keywords, keyword.toLowerCase()],
      });
      setKeywordInput('');
      
      // Clear keywords error
      if (errors.keywords) {
        setErrors({ ...errors, keywords: '' });
      }
    }
  };

  // Remove keyword
  const handleRemoveKeyword = (keywordToRemove: string) => {
    setMetadata({
      ...metadata,
      keywords: metadata.keywords.filter(k => k !== keywordToRemove),
    });
  };

  // Handle save
  const handleSave = () => {
    if (validateForm()) {
      onSave(metadata);
      onClose();
    }
  };

  // Get link type display info
  const getLinkTypeInfo = (type: LinkMetadata['type']) => {
    switch (type) {
      case 'google_docs': return { label: 'Google Docs', color: '#4285F4' };
      case 'google_sheets': return { label: 'Google Sheets', color: '#34A853' };
      case 'pdf': return { label: 'PDF Document', color: '#EA4335' };
      case 'website': return { label: 'Website', color: '#FF6D01' };
      default: return { label: 'Other', color: '#9AA0A6' };
    }
  };

  const linkTypeInfo = getLinkTypeInfo(metadata.type);

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { minHeight: '500px' }
      }}
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <LinkIcon sx={{ color: 'primary.main' }} />
          <Box>
            <Typography variant="h6">{title}</Typography>
            {subtitle && (
              <Typography variant="subtitle2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Enhanced Link Saving:</strong> Add metadata to make this link searchable through the Global Search system. 
            This will help during NABH audit when auditors ask specific questions.
          </Typography>
        </Alert>

        {context && (
          <Box mb={2} p={2} bgcolor="primary.50" borderRadius={1}>
            <Typography variant="subtitle2" color="primary.main">
              Context: {context}
            </Typography>
          </Box>
        )}

        {/* URL Field */}
        <TextField
          fullWidth
          label="Document URL"
          value={metadata.url}
          onChange={(e) => handleUrlChange(e.target.value)}
          margin="normal"
          error={!!errors.url}
          helperText={errors.url || 'Paste the Google Docs/Sheets link or any document URL'}
          InputProps={{
            startAdornment: <LinkIcon sx={{ mr: 1, color: 'action.active' }} />,
            endAdornment: metadata.type !== 'other' && (
              <Chip
                label={linkTypeInfo.label}
                size="small"
                sx={{ 
                  bgcolor: linkTypeInfo.color + '20',
                  color: linkTypeInfo.color,
                  fontWeight: 'bold'
                }}
              />
            ),
          }}
        />

        {/* Title Field */}
        <TextField
          fullWidth
          label="Document Title"
          value={metadata.title}
          onChange={(e) => setMetadata({ ...metadata, title: e.target.value })}
          margin="normal"
          error={!!errors.title}
          helperText={errors.title || 'Enter a descriptive title for this document'}
          placeholder="e.g., AAC Chapter Cheat Sheet, Quality Committee Minutes, Admission SOP"
          InputProps={{
            startAdornment: <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />,
          }}
        />

        {/* Description Field */}
        <TextField
          fullWidth
          multiline
          rows={3}
          label="Description & Content Summary"
          value={metadata.description}
          onChange={(e) => setMetadata({ ...metadata, description: e.target.value })}
          margin="normal"
          error={!!errors.description}
          helperText={errors.description || 'Describe the content so it can be found through search'}
          placeholder="Brief summary of what this document contains, key topics covered, and why it's important for NABH audit..."
        />

        {/* Category Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Document Category</InputLabel>
          <Select
            value={metadata.category}
            onChange={(e) => setMetadata({ ...metadata, category: e.target.value })}
            startAdornment={<CategoryIcon sx={{ mr: 1, color: 'action.active' }} />}
          >
            <MenuItem value="">
              <em>Select a category</em>
            </MenuItem>
            {DOCUMENT_CATEGORIES.map(category => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Priority Selection */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Priority Level</InputLabel>
          <Select
            value={metadata.priority}
            onChange={(e) => setMetadata({ ...metadata, priority: e.target.value as LinkMetadata['priority'] })}
          >
            <MenuItem value="high">High Priority (NABH Critical)</MenuItem>
            <MenuItem value="medium">Medium Priority</MenuItem>
            <MenuItem value="low">Low Priority</MenuItem>
          </Select>
        </FormControl>

        {/* Keywords Section */}
        <Box mt={2}>
          <Typography variant="subtitle1" mb={1}>
            <TagIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Keywords for Search
          </Typography>
          
          <Autocomplete
            freeSolo
            options={COMMON_NABH_KEYWORDS}
            value={keywordInput}
            onChange={(_, value) => {
              if (typeof value === 'string') {
                handleAddKeyword(value);
              }
            }}
            onInputChange={(_, value) => setKeywordInput(value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && keywordInput.trim()) {
                e.preventDefault();
                handleAddKeyword(keywordInput.trim());
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Add Keywords"
                error={!!errors.keywords}
                helperText={errors.keywords || 'Add keywords that people might search for (press Enter to add)'}
                placeholder="e.g., quality, hand hygiene, admission, training..."
              />
            )}
          />

          {/* Current Keywords */}
          {metadata.keywords.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Current Keywords ({metadata.keywords.length}):
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {metadata.keywords.map((keyword, index) => (
                  <Chip
                    key={index}
                    label={keyword}
                    onDelete={() => handleRemoveKeyword(keyword)}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Suggested Keywords */}
          {suggestedKeywords.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" mb={1}>
                Suggested Keywords:
              </Typography>
              <Box display="flex" gap={0.5} flexWrap="wrap">
                {suggestedKeywords
                  .filter(keyword => !metadata.keywords.includes(keyword))
                  .map((keyword, index) => (
                    <Chip
                      key={index}
                      label={keyword}
                      onClick={() => handleAddKeyword(keyword)}
                      size="small"
                      variant="outlined"
                      clickable
                      sx={{ '&:hover': { bgcolor: 'primary.50' } }}
                    />
                  ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Preview */}
        <Box mt={3} p={2} bgcolor="grey.50" borderRadius={1}>
          <Typography variant="subtitle2" mb={1} color="text.secondary">
            Search Preview:
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {metadata.title || 'Document Title'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {metadata.description || 'Description will appear here'}
          </Typography>
          {metadata.keywords.length > 0 && (
            <Box mt={1}>
              {metadata.keywords.slice(0, 5).map((keyword, index) => (
                <Chip
                  key={index}
                  label={keyword}
                  size="small"
                  sx={{ mr: 0.5, fontSize: '0.7rem', height: 20 }}
                />
              ))}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose}>
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSave}
          disabled={!metadata.url.trim() || !metadata.title.trim()}
        >
          Save Link with Metadata
        </Button>
      </DialogActions>
    </Dialog>
  );
}
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
  IconButton,
  Divider,
  CircularProgress,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Description as DescriptionIcon,
} from '@mui/icons-material';
import {
  loadAllSOPPrompts,
  saveSOPPrompt,
  updateSOPPrompt,
  deleteSOPPrompt,
  type SOPPrompt,
} from '../services/sopPromptStorage';

interface SOPPromptUI extends SOPPrompt {
  createdAt: string;
  lastModified: string;
}

const defaultPrompt: Omit<SOPPromptUI, 'id' | 'createdAt' | 'lastModified'> = {
  title: 'SOP Generation Master',
  description: 'Comprehensive prompt for generating NABH compliant Standard Operating Procedures',
  prompt: `You are an AI coding agent responsible for generating NABH Third Edition compliant Standard Operating Procedures (SOPs) for Hope Hospital. Follow these mandatory requirements:

📋 SOP DOCUMENT STRUCTURE

1. HEADER SECTION (MANDATORY)
- Document Title: Clear, descriptive SOP title
- Document Number: Format "SOP-[DEPT]-[NUMBER]" (e.g., SOP-HIC-001)
- Version: Start with 1.0
- Effective Date: DD/MM/YYYY format
- Review Date: 1 year from effective date
- Page Number: Page X of Y format
- Department: Relevant department name
- Prepared By: Staff name with designation
- Reviewed By: Department head or QA coordinator
- Approved By: Medical Director or Administrator

2. REVISION HISTORY TABLE
- Version number
- Date of revision
- Description of changes
- Author name
- Approver name

3. PURPOSE SECTION
- Clear statement of why this SOP exists
- Link to NABH standard reference (e.g., "As per NABH Standard HIC.3")
- Expected outcomes

4. SCOPE SECTION
- Who this SOP applies to
- Which departments/areas are covered
- Any exclusions clearly stated

5. DEFINITIONS
- Technical terms used in the document
- Abbreviations and their full forms
- Hospital-specific terminology

6. RESPONSIBILITIES
- List each role involved
- Specific duties for each role
- Accountability matrix if complex

7. PROCEDURE STEPS
- Numbered step-by-step instructions
- Clear action verbs (Ensure, Verify, Document, etc.)
- Decision points with Yes/No branches
- Time-bound actions where applicable
- Cross-references to forms and checklists

8. DOCUMENTATION REQUIREMENTS
- Forms to be filled
- Records to be maintained
- Retention period
- Storage location

9. REFERENCES
- Related SOPs
- NABH standards referenced
- External guidelines (ICMR, WHO, etc.)

10. APPENDICES
- Related forms
- Checklists
- Flowcharts

🎯 FORMATTING REQUIREMENTS

- Use professional medical document formatting
- Include Hope Hospital logo placeholder
- Footer with document control information
- Clear section numbering (1.0, 1.1, 1.2, etc.)
- Tables for complex information
- Flowcharts for processes with decision points

🚨 MANDATORY STAFF NAMES
- Sonali (Clinical Audit Coordinator) - For review/preparation
- Gaurav (NABH Coordination Lead) - For approval
- Dr. Shiraz Sheikh (Quality Coordinator) - For medical SOPs

This SOP generation is for NABH AUDIT FEB 13-14, 2026. Every SOP must be audit-ready and demonstrate active compliance.`,
  category: 'SOP Generation',
  tags: ['SOP', 'NABH', 'Documentation', 'Procedures'],
};

function mapToUI(prompt: SOPPrompt): SOPPromptUI {
  return {
    ...prompt,
    createdAt: prompt.created_at ? new Date(prompt.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    lastModified: prompt.updated_at ? new Date(prompt.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
  };
}

export default function SOPPromptMasterPage() {
  const [prompts, setPrompts] = useState<SOPPromptUI[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SOPPromptUI>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setIsLoading(true);
    const result = await loadAllSOPPrompts();
    if (result.success && result.data) {
      if (result.data.length === 0) {
        // If no prompts in DB, save the default one
        const saveResult = await saveSOPPrompt(defaultPrompt);
        if (saveResult.success && saveResult.data) {
          setPrompts([mapToUI(saveResult.data)]);
          showSnackbar('Default prompt initialized', 'info');
        }
      } else {
        setPrompts(result.data.map(mapToUI));
      }
    } else {
      showSnackbar(result.error || 'Failed to load prompts', 'error');
    }
    setIsLoading(false);
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleAddNew = () => {
    setEditForm({
      title: '',
      description: '',
      prompt: '',
      category: '',
      tags: [],
    });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleEdit = (prompt: SOPPromptUI) => {
    setEditForm(prompt);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCopyPrompt = (prompt: SOPPromptUI) => {
    navigator.clipboard.writeText(prompt.prompt);
    showSnackbar('Prompt copied to clipboard', 'success');
  };

  const handleSavePrompt = async () => {
    if (!editForm.title || !editForm.prompt) {
      showSnackbar('Title and prompt are required', 'error');
      return;
    }

    setIsSaving(true);

    if (isEditing && editForm.id) {
      const result = await updateSOPPrompt(editForm.id, {
        title: editForm.title,
        description: editForm.description || '',
        prompt: editForm.prompt,
        category: editForm.category || '',
        tags: editForm.tags || [],
      });

      if (result.success && result.data) {
        setPrompts(prompts.map(p => p.id === editForm.id ? mapToUI(result.data!) : p));
        showSnackbar('Prompt updated successfully', 'success');
      } else {
        showSnackbar(result.error || 'Failed to update prompt', 'error');
      }
    } else {
      const result = await saveSOPPrompt({
        title: editForm.title,
        description: editForm.description || '',
        prompt: editForm.prompt,
        category: editForm.category || '',
        tags: editForm.tags || [],
      });

      if (result.success && result.data) {
        setPrompts([mapToUI(result.data), ...prompts]);
        showSnackbar('Prompt saved successfully', 'success');
      } else {
        showSnackbar(result.error || 'Failed to save prompt', 'error');
      }
    }

    setIsSaving(false);
    setIsDialogOpen(false);
    setEditForm({});
  };

  const handleDeletePrompt = async (promptId: string) => {
    const result = await deleteSOPPrompt(promptId);
    if (result.success) {
      setPrompts(prompts.filter(p => p.id !== promptId));
      showSnackbar('Prompt deleted', 'success');
    } else {
      showSnackbar(result.error || 'Failed to delete prompt', 'error');
    }
  };

  const HIDDEN_PROMPT_TITLES = new Set([
    'F1, F3, F4, Filter Prompt',
    'AI Filter - Hospital-Specific Content Extractor',
    'Detailed SOP Generation Master',
  ]);
  const visiblePrompts = prompts.filter(p => !HIDDEN_PROMPT_TITLES.has(p.title));

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <DescriptionIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          SOP Prompt Master
        </Typography>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Manage AI prompts for SOP generation and documentation
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {visiblePrompts.length} Prompt{visiblePrompts.length !== 1 ? 's' : ''} Available
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddNew}
          sx={{ borderRadius: 2 }}
        >
          Add New Prompt
        </Button>
      </Box>

      <Box display="flex" gap={3} flexWrap="wrap">
        {visiblePrompts.map((prompt) => (
          <Box flex="1" minWidth="400px" key={prompt.id}>
            <Card elevation={2} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" mb={2}>
                  <Typography variant="h6" component="h3" fontWeight="bold">
                    {prompt.title}
                  </Typography>
                  <Chip
                    label={prompt.category}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" mb={2}>
                  {prompt.description}
                </Typography>

                <Box mb={2}>
                  {prompt.tags.map((tag) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      sx={{ mr: 0.5, mb: 0.5 }}
                      variant="outlined"
                    />
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" display="block">
                  Created: {prompt.createdAt}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Modified: {prompt.lastModified}
                </Typography>
              </CardContent>

              <CardActions sx={{ p: 2, pt: 0 }}>
                <Button
                  size="small"
                  startIcon={<CopyIcon />}
                  onClick={() => handleCopyPrompt(prompt)}
                >
                  Copy
                </Button>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEdit(prompt)}
                >
                  Edit
                </Button>
                <IconButton
                  size="small"
                  onClick={() => handleDeletePrompt(prompt.id)}
                  sx={{ ml: 'auto' }}
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? 'Edit SOP Prompt' : 'Add New SOP Prompt'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              value={editForm.title || ''}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
            />
            <Box display="flex" gap={2}>
              <TextField
                label="Category"
                fullWidth
                value={editForm.category || ''}
                onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
              />
              <TextField
                label="Tags (comma separated)"
                fullWidth
                value={editForm.tags?.join(', ') || ''}
                onChange={(e) => setEditForm({
                  ...editForm,
                  tags: e.target.value.split(',').map(t => t.trim()).filter(t => t)
                })}
              />
            </Box>
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              value={editForm.description || ''}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            />
            <TextField
              label="Prompt Content"
              fullWidth
              required
              multiline
              rows={12}
              value={editForm.prompt || ''}
              onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)} disabled={isSaving}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePrompt} disabled={isSaving}>
            {isSaving ? <CircularProgress size={20} /> : (isEditing ? 'Save Changes' : 'Add Prompt')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}

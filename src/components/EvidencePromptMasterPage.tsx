import { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';

interface EvidencePrompt {
  id: string;
  title: string;
  description: string;
  prompt: string;
  category: string;
  tags: string[];
  createdAt: string;
  lastModified: string;
}

const defaultPrompts: EvidencePrompt[] = [
  {
    id: 'nabh-evidence-master',
    title: 'NABH Evidence Generation Master',
    description: 'Comprehensive prompt for generating NABH Third Edition compliant evidence documents',
    prompt: `You are an AI coding agent responsible for generating NABH Third Edition compliant evidence documents for Hope Hospital. Follow these mandatory requirements:

📋 REGISTER & DOCUMENTATION REQUIREMENTS

1. MINIMUM ROW REQUIREMENT
- Every register evidence MUST contain at least 20 rows of data
- No register should be shown with less than 20 entries
- If showing patient registers, ensure 20+ patient entries
- If showing equipment registers, ensure 20+ equipment entries

2. PATIENT DATA REQUIREMENTS
- Every patient mention MUST include correct unique patient ID
- Format: "Patient ID: HH-2024-XXXX" or similar hospital format
- Include admission date (DD/MM/YYYY format)
- Include discharge date where applicable (DD/MM/YYYY format)
- Patient names should be realistic Indian names
- Age, gender, department details must be consistent

3. MANDATORY STAFF NAMES
- These names MUST appear in ALL documents:
  - Sonali (Clinical Audit Coordinator)
  - Gaurav (NABH Coordination Lead) 
  - Shiraz (Quality Coordinator & SOP Admin)
- Rotate their appearances across different roles/signatures
- Include proper designations with names

4. DATE REQUIREMENTS
- Date of creation: Set to approximately 1 month prior to current date
- Review dates: Staggered within the past month
- Approval dates: Within past 30 days
- Next review dates: Set 3-6 months from creation date
- Use DD/MM/YYYY format consistently

📊 FORM & EVIDENCE REQUIREMENTS

5. FILLED FORMS MANDATE
- NO blank forms allowed as evidence
- Every field must be completed with realistic data
- Signatures, dates, and approvals must be present
- Cross-references between forms must be accurate

6. MULTIPLE FORMS RULE
- Minimum 5-6 filled forms per evidence category
- Single form is NEVER sufficient evidence
- Show variety in dates, departments, staff involved
- Demonstrate ongoing compliance, not one-time activity

🎯 DATA SOURCE REQUIREMENTS
All evidence data MUST be sourced from these masters:
- Consultant Master (Dr. Murali BK, Dr. Ruby Ammon, Dr. Shiraz, Dr. Sachin, etc.)
- Department Master (Emergency, Orthopedics, Surgery, Internal Medicine, etc.)
- Staff Master (Sonali, Gaurav, Shiraz, K J Shashank, Diksha, etc.)
- Equipment Master (Crash carts, Ventilators, Monitoring equipment, etc.)
- Services Master (Emergency, Surgical, Diagnostic, Laboratory services, etc.)

🚨 CRITICAL SUCCESS FACTORS
This evidence generation is for NABH AUDIT FEB 13-14, 2026. Every piece of evidence must be audit-ready, professional, demonstrating active compliance, and meeting all technical requirements.`,
    category: 'NABH Compliance',
    tags: ['NABH', 'Evidence Generation', 'Audit', 'Third Edition'],
    createdAt: '2026-02-03',
    lastModified: '2026-02-03',
  },
];

export default function EvidencePromptMasterPage() {
  const [prompts, setPrompts] = useState<EvidencePrompt[]>(defaultPrompts);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<EvidencePrompt>>({});

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

  const handleEdit = (prompt: EvidencePrompt) => {
    setEditForm(prompt);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleCopyPrompt = (prompt: EvidencePrompt) => {
    navigator.clipboard.writeText(prompt.prompt);
    // You might want to add a snackbar notification here
  };

  const handleSavePrompt = () => {
    if (isEditing && editForm.id) {
      setPrompts(prompts.map(p => p.id === editForm.id ? {
        ...editForm as EvidencePrompt,
        lastModified: new Date().toISOString().split('T')[0]
      } : p));
    } else {
      const newPrompt: EvidencePrompt = {
        ...editForm as EvidencePrompt,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
      };
      setPrompts([...prompts, newPrompt]);
    }
    setIsDialogOpen(false);
    setEditForm({});
  };

  const handleDeletePrompt = (promptId: string) => {
    setPrompts(prompts.filter(p => p.id !== promptId));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" mb={3}>
        <AssignmentIcon sx={{ mr: 2, color: 'primary.main', fontSize: 32 }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Evidence Prompt Master
        </Typography>
      </Box>

      <Typography variant="subtitle1" color="text.secondary" mb={4}>
        Manage AI prompts for NABH evidence generation and compliance documentation
      </Typography>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          {prompts.length} Prompt{prompts.length !== 1 ? 's' : ''} Available
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
        {prompts.map((prompt) => (
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
          {isEditing ? 'Edit Evidence Prompt' : 'Add New Evidence Prompt'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
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
              multiline
              rows={12}
              value={editForm.prompt || ''}
              onChange={(e) => setEditForm({ ...editForm, prompt: e.target.value })}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePrompt}>
            {isEditing ? 'Save Changes' : 'Add Prompt'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
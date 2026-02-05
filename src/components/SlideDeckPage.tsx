import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Icon from '@mui/material/Icon';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { getGeminiApiKey } from '../lib/supabase';
import { getHospitalInfo } from '../config/hospitalConfig';
import { extractFromDocument, generateImprovedDocument } from '../services/documentExtractor';
import { useNABHStore } from '../store/nabhStore';

interface Slide {
  id: string;
  title: string;
  content: string;
  type: 'title' | 'content' | 'chart' | 'table' | 'image' | 'summary';
  notes?: string;
}

interface Presentation {
  id: string;
  name: string;
  description: string;
  slides: Slide[];
  status: 'draft' | 'ready' | 'presented';
  createdAt: string;
  updatedAt: string;
  presentedAt?: string;
}

const UPLOAD_WORKFLOW_STEPS = ['Upload Presentation', 'Extract Content', 'Review & Edit', 'Generate Improved'];

const PRESENTATION_TEMPLATES = [
  {
    name: 'Hospital Overview for NABH Assessors',
    description: 'Introduction presentation for NABH assessment team',
    sections: ['Hospital Introduction', 'Infrastructure', 'Services', 'Quality Journey', 'NABH Preparation', 'Key Achievements'],
  },
  {
    name: 'Quality Indicators Dashboard',
    description: 'Presentation of hospital KPIs and quality metrics',
    sections: ['KPI Overview', 'Clinical Indicators', 'Patient Safety', 'Infection Control', 'Trends & Analysis', 'Improvement Plans'],
  },
  {
    name: 'Department-wise Compliance',
    description: 'Department-by-department NABH compliance status',
    sections: ['Overall Compliance', 'OPD', 'IPD', 'ICU', 'OT', 'Emergency', 'Nursing', 'Support Services'],
  },
  {
    name: 'Patient Safety Program',
    description: 'Overview of patient safety initiatives',
    sections: ['Safety Goals', 'Incident Reporting', 'Near Miss Analysis', 'Falls Prevention', 'Medication Safety', 'Outcomes'],
  },
  {
    name: 'Infection Control Program',
    description: 'Hospital infection control activities',
    sections: ['IC Structure', 'HAI Surveillance', 'Hand Hygiene', 'Antibiotic Stewardship', 'Training', 'Achievements'],
  },
];

export default function SlideDeckPage() {
  const { selectedHospital } = useNABHStore();
  const hospitalConfig = getHospitalInfo(selectedHospital);
  
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [selectedPresentation, setSelectedPresentation] = useState<Presentation | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newPresentation, setNewPresentation] = useState({
    name: '',
    description: '',
    template: '',
    customSections: '',
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Upload workflow states
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [uploadWorkflowStep, setUploadWorkflowStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isExtractingUpload, setIsExtractingUpload] = useState(false);
  const [extractedPresentationText, setExtractedPresentationText] = useState('');
  const [extractedSlides, setExtractedSlides] = useState<{ title: string; content: string }[]>([]);
  const [userSuggestions, setUserSuggestions] = useState('');
  const [isGeneratingUpload, setIsGeneratingUpload] = useState(false);
  const [generatedPresentationHTML, setGeneratedPresentationHTML] = useState('');
  const [activeUploadTab, setActiveUploadTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load presentations from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('nabh_presentations');
    if (saved) {
      setPresentations(JSON.parse(saved));
    }
  }, []);

  // Save presentations to localStorage
  useEffect(() => {
    localStorage.setItem('nabh_presentations', JSON.stringify(presentations));
  }, [presentations]);

  const generateSlideContent = async (title: string, section: string, hospitalInfo: typeof hospitalConfig) => {
    const geminiApiKey = getGeminiApiKey();
    if (!geminiApiKey) return '';

    const prompt = `Generate professional slide content for a hospital NABH assessment presentation.

Presentation: ${title}
Section: ${section}
Hospital: ${hospitalInfo.name}
Address: ${hospitalInfo.address}

Create content suitable for a PowerPoint slide with:
1. Main heading
2. 4-6 bullet points (concise, data-driven where possible)
3. Key statistics or achievements if relevant
4. Keep it professional and NABH-focused

Format as clean text with bullet points using - symbol.
Do not include any HTML tags.`;

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    } catch (error) {
      console.error('Error generating slide content:', error);
      return '';
    }
  };

  const handleCreatePresentation = async () => {
    if (!newPresentation.name.trim()) {
      setSnackbar({ open: true, message: 'Please enter presentation name', severity: 'error' });
      return;
    }

    setIsGenerating(true);

    try {
      const template = PRESENTATION_TEMPLATES.find(t => t.name === newPresentation.template);
      const sections = template?.sections || newPresentation.customSections.split('\n').filter(s => s.trim());

      // Generate title slide
      const slides: Slide[] = [{
        id: `slide_${Date.now()}_0`,
        title: newPresentation.name,
        content: `${hospitalConfig.name}\n${hospitalConfig.address}\n\nPresentation for NABH Assessment`,
        type: 'title',
        notes: 'Welcome the assessors and introduce the hospital.',
      }];

      // Generate content slides
      for (let i = 0; i < sections.length; i++) {
        const content = await generateSlideContent(newPresentation.name, sections[i], hospitalConfig);
        slides.push({
          id: `slide_${Date.now()}_${i + 1}`,
          title: sections[i],
          content: content || `Content for ${sections[i]}`,
          type: 'content',
          notes: '',
        });
      }

      // Add summary slide
      slides.push({
        id: `slide_${Date.now()}_summary`,
        title: 'Summary & Way Forward',
        content: `Key Highlights:\n- Committed to quality healthcare\n- Continuous improvement culture\n- Patient-centric approach\n- NABH compliance journey\n\nThank you for your time and guidance.`,
        type: 'summary',
        notes: 'Conclude with key takeaways and thank the assessors.',
      });

      const presentation: Presentation = {
        id: `presentation_${Date.now()}`,
        name: newPresentation.name,
        description: newPresentation.description || template?.description || '',
        slides,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setPresentations([...presentations, presentation]);
      setIsCreateDialogOpen(false);
      setNewPresentation({ name: '', description: '', template: '', customSections: '' });
      setSnackbar({ open: true, message: 'Presentation created successfully!', severity: 'success' });
    } catch (error) {
      console.error('Error creating presentation:', error);
      setSnackbar({ open: true, message: 'Failed to create presentation', severity: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdateSlide = (slideId: string, field: keyof Slide, value: string) => {
    if (!selectedPresentation) return;

    const updatedSlides = selectedPresentation.slides.map(slide =>
      slide.id === slideId ? { ...slide, [field]: value } : slide
    );

    const updatedPresentation = { ...selectedPresentation, slides: updatedSlides, updatedAt: new Date().toISOString() };
    setSelectedPresentation(updatedPresentation);
    setPresentations(prev => prev.map(p => p.id === updatedPresentation.id ? updatedPresentation : p));
  };

  const handleAddSlide = () => {
    if (!selectedPresentation) return;

    const newSlide: Slide = {
      id: `slide_${Date.now()}`,
      title: 'New Slide',
      content: 'Add your content here...',
      type: 'content',
      notes: '',
    };

    const updatedPresentation = {
      ...selectedPresentation,
      slides: [...selectedPresentation.slides, newSlide],
      updatedAt: new Date().toISOString(),
    };
    setSelectedPresentation(updatedPresentation);
    setPresentations(prev => prev.map(p => p.id === updatedPresentation.id ? updatedPresentation : p));
    setCurrentSlideIndex(updatedPresentation.slides.length - 1);
  };

  const handleDeleteSlide = (slideId: string) => {
    if (!selectedPresentation || selectedPresentation.slides.length <= 1) return;

    const updatedSlides = selectedPresentation.slides.filter(s => s.id !== slideId);
    const updatedPresentation = { ...selectedPresentation, slides: updatedSlides, updatedAt: new Date().toISOString() };
    setSelectedPresentation(updatedPresentation);
    setPresentations(prev => prev.map(p => p.id === updatedPresentation.id ? updatedPresentation : p));
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  const handleDeletePresentation = (id: string) => {
    setPresentations(prev => prev.filter(p => p.id !== id));
    setSnackbar({ open: true, message: 'Presentation deleted', severity: 'success' });
  };

  const handleExportHTML = (presentation: Presentation) => {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${presentation.name} - ${hospitalConfig.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; }
    .slide { width: 100%; min-height: 100vh; padding: 60px; display: flex; flex-direction: column; page-break-after: always; }
    .slide.title { background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%); color: white; justify-content: center; align-items: center; text-align: center; }
    .slide.content { background: white; }
    .slide.summary { background: linear-gradient(135deg, #1565C0 0%, #0D47A1 100%); color: white; }
    h1 { font-size: 48px; margin-bottom: 20px; }
    h2 { font-size: 36px; color: #1565C0; margin-bottom: 30px; border-bottom: 3px solid #1565C0; padding-bottom: 10px; }
    .slide.title h2, .slide.summary h2 { color: white; border-color: white; }
    .content-text { font-size: 24px; line-height: 1.8; white-space: pre-line; }
    .hospital-logo { width: 200px; margin-bottom: 30px; }
    .footer { margin-top: auto; font-size: 14px; color: #666; text-align: center; padding-top: 20px; border-top: 1px solid #ddd; }
    .slide.title .footer, .slide.summary .footer { color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.3); }
    @media print { .slide { page-break-after: always; } }
  </style>
</head>
<body>
${presentation.slides.map(slide => `
  <div class="slide ${slide.type}">
    ${slide.type === 'title' ? `<img src="${hospitalConfig.logo}" alt="Logo" class="hospital-logo" onerror="this.style.display='none'">` : ''}
    <h2>${slide.title}</h2>
    <div class="content-text">${slide.content}</div>
    <div class="footer">${hospitalConfig.name} | ${hospitalConfig.address}</div>
  </div>
`).join('')}
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentation.name.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
    setSnackbar({ open: true, message: 'Presentation exported as HTML', severity: 'success' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'success';
      case 'presented': return 'primary';
      default: return 'warning';
    }
  };

  // Upload workflow handlers
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadWorkflowStep(1);
      handleExtractFromFile(file);
    }
  };

  const handleExtractFromFile = async (file: File) => {
    setIsExtractingUpload(true);
    try {
      const result = await extractFromDocument(file, 'presentation');
      if (result.success && result.text) {
        setExtractedPresentationText(result.text);

        // Try to parse slides from the extracted text
        const slidesData = parseSlides(result.text);
        setExtractedSlides(slidesData);
        setUploadWorkflowStep(2);
        setSnackbar({ open: true, message: `Extracted ${slidesData.length} slides`, severity: 'success' });
      } else {
        setSnackbar({ open: true, message: result.error || 'Failed to extract content', severity: 'error' });
      }
    } catch (error) {
      console.error('Error extracting from file:', error);
      setSnackbar({ open: true, message: 'Error processing document', severity: 'error' });
    } finally {
      setIsExtractingUpload(false);
    }
  };

  const parseSlides = (text: string): { title: string; content: string }[] => {
    // Try to identify slide boundaries in the extracted text
    const slides: { title: string; content: string }[] = [];

    // Split by paragraph breaks to identify sections
    const sections = text.split(/\n{2,}/);

    if (sections.length < 2) {
      // If no clear sections, treat the whole text as one slide
      return [{ title: 'Imported Content', content: text }];
    }

    let currentTitle = '';
    let currentContent = '';

    sections.forEach((section, i) => {
      const trimmed = section.trim();
      if (!trimmed) return;

      // Check if this looks like a title (short, possibly uppercase)
      if (trimmed.length < 80 && !trimmed.includes('.') && i === 0) {
        if (currentTitle && currentContent) {
          slides.push({ title: currentTitle, content: currentContent.trim() });
        }
        currentTitle = trimmed;
        currentContent = '';
      } else if (trimmed.length < 60 && /^[A-Z]/.test(trimmed) && !trimmed.includes('.')) {
        if (currentTitle && currentContent) {
          slides.push({ title: currentTitle, content: currentContent.trim() });
        }
        currentTitle = trimmed;
        currentContent = '';
      } else {
        currentContent += (currentContent ? '\n\n' : '') + trimmed;
      }
    });

    // Don't forget the last slide
    if (currentTitle || currentContent) {
      slides.push({
        title: currentTitle || 'Slide ' + (slides.length + 1),
        content: currentContent.trim()
      });
    }

    return slides.length > 0 ? slides : [{ title: 'Imported Content', content: text }];
  };

  const handleGenerateImprovedPresentation = async () => {
    if (!extractedPresentationText) {
      setSnackbar({ open: true, message: 'No extracted content to generate from', severity: 'error' });
      return;
    }

    setIsGeneratingUpload(true);
    try {
      const html = await generateImprovedDocument(
        extractedPresentationText,
        'presentation',
        userSuggestions,
        hospitalConfig.name
      );
      setGeneratedPresentationHTML(html);
      setUploadWorkflowStep(3);
      setSnackbar({ open: true, message: 'Improved presentation generated', severity: 'success' });
    } catch (error) {
      console.error('Error generating presentation:', error);
      setSnackbar({ open: true, message: 'Error generating presentation', severity: 'error' });
    } finally {
      setIsGeneratingUpload(false);
    }
  };

  const handleCreatePresentationFromExtracted = () => {
    if (extractedSlides.length === 0) {
      setSnackbar({ open: true, message: 'No slides to import', severity: 'error' });
      return;
    }

    const slides: Slide[] = extractedSlides.map((s, i) => ({
      id: `slide_${Date.now()}_${i}`,
      title: s.title,
      content: s.content,
      type: i === 0 ? 'title' : i === extractedSlides.length - 1 ? 'summary' : 'content',
      notes: '',
    }));

    const presentation: Presentation = {
      id: `presentation_${Date.now()}`,
      name: uploadedFile?.name.replace(/\.[^.]+$/, '') || 'Imported Presentation',
      description: 'Imported from uploaded document',
      slides,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPresentations([...presentations, presentation]);
    resetUploadWorkflow();
    setSnackbar({ open: true, message: 'Presentation imported successfully', severity: 'success' });
  };

  const resetUploadWorkflow = () => {
    setIsUploadDialogOpen(false);
    setUploadWorkflowStep(0);
    setUploadedFile(null);
    setExtractedPresentationText('');
    setExtractedSlides([]);
    setUserSuggestions('');
    setGeneratedPresentationHTML('');
    setActiveUploadTab(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDownloadGeneratedPresentation = () => {
    if (!generatedPresentationHTML) return;

    const blob = new Blob([generatedPresentationHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Improved_Presentation.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintGeneratedPresentation = () => {
    if (!generatedPresentationHTML) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(generatedPresentationHTML);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} color="primary">
            Auditor Slide Decks
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Create and manage presentations for NABH assessors
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Icon>upload_file</Icon>}
            onClick={() => setIsUploadDialogOpen(true)}
          >
            Upload Presentation
          </Button>
          <Button
            variant="contained"
            startIcon={<Icon>add</Icon>}
            onClick={() => setIsCreateDialogOpen(true)}
          >
            Create Presentation
          </Button>
        </Box>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.pptx,.ppt,.png,.jpg,.jpeg"
          onChange={handleFileUpload}
        />
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.50' }}>
            <Typography variant="h4" color="primary" fontWeight={700}>{presentations.length}</Typography>
            <Typography variant="body2" color="text.secondary">Total Presentations</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'warning.50' }}>
            <Typography variant="h4" color="warning.main" fontWeight={700}>
              {presentations.filter(p => p.status === 'draft').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Drafts</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'success.50' }}>
            <Typography variant="h4" color="success.main" fontWeight={700}>
              {presentations.filter(p => p.status === 'ready').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">Ready</Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 6, md: 3 }}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: 'info.50' }}>
            <Typography variant="h4" color="info.main" fontWeight={700}>
              {presentations.reduce((acc, p) => acc + p.slides.length, 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">Total Slides</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Template Suggestions */}
      <Paper sx={{ p: 2, mb: 3, bgcolor: 'info.50' }}>
        <Typography variant="subtitle2" gutterBottom>
          <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>lightbulb</Icon>
          Suggested Templates for NABH Assessment
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          {PRESENTATION_TEMPLATES.map(template => (
            <Chip
              key={template.name}
              label={template.name}
              onClick={() => {
                setNewPresentation({ ...newPresentation, name: template.name, template: template.name, description: template.description });
                setIsCreateDialogOpen(true);
              }}
              sx={{ cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Paper>

      {/* Presentations Grid */}
      {presentations.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <Icon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }}>slideshow</Icon>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No presentations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Create your first slide deck for NABH assessors
          </Typography>
          <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={() => setIsCreateDialogOpen(true)}>
            Create Presentation
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={2}>
          {presentations.map(presentation => (
            <Grid key={presentation.id} size={{ xs: 12, sm: 6, md: 4 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Icon color="primary" sx={{ fontSize: 40 }}>slideshow</Icon>
                    <Chip label={presentation.status} size="small" color={getStatusColor(presentation.status)} />
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {presentation.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {presentation.description || 'No description'}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${presentation.slides.length} slides`} size="small" variant="outlined" />
                    <Chip label={new Date(presentation.updatedAt).toLocaleDateString()} size="small" variant="outlined" />
                  </Box>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Box>
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => { setSelectedPresentation(presentation); setCurrentSlideIndex(0); setIsEditDialogOpen(true); }}>
                        <Icon>edit</Icon>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Preview">
                      <IconButton size="small" onClick={() => { setSelectedPresentation(presentation); setCurrentSlideIndex(0); setIsPreviewOpen(true); }}>
                        <Icon>visibility</Icon>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export HTML">
                      <IconButton size="small" onClick={() => handleExportHTML(presentation)}>
                        <Icon>download</Icon>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDeletePresentation(presentation.id)}>
                        <Icon>delete</Icon>
                      </IconButton>
                    </Tooltip>
                  </Box>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">add</Icon>
            Create New Presentation
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Presentation Name"
            value={newPresentation.name}
            onChange={(e) => setNewPresentation({ ...newPresentation, name: e.target.value })}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Description"
            value={newPresentation.description}
            onChange={(e) => setNewPresentation({ ...newPresentation, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            select
            label="Template (optional)"
            value={newPresentation.template}
            onChange={(e) => {
              const template = PRESENTATION_TEMPLATES.find(t => t.name === e.target.value);
              setNewPresentation({
                ...newPresentation,
                template: e.target.value,
                customSections: template?.sections.join('\n') || '',
              });
            }}
            sx={{ mb: 2 }}
            slotProps={{ select: { native: true } }}
          >
            <option value="">Custom sections</option>
            {PRESENTATION_TEMPLATES.map(t => (
              <option key={t.name} value={t.name}>{t.name}</option>
            ))}
          </TextField>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Sections (one per line)"
            value={newPresentation.customSections}
            onChange={(e) => setNewPresentation({ ...newPresentation, customSections: e.target.value })}
            placeholder="Hospital Introduction&#10;Services Overview&#10;Quality Achievements&#10;..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsCreateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreatePresentation}
            disabled={isGenerating}
            startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <Icon>auto_awesome</Icon>}
          >
            {isGenerating ? 'Generating Slides...' : 'Create Presentation'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon color="primary">edit</Icon>
              Edit: {selectedPresentation?.name}
            </Box>
            <Button size="small" startIcon={<Icon>add</Icon>} onClick={handleAddSlide}>
              Add Slide
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedPresentation && (
            <Grid container spacing={2}>
              {/* Slide List */}
              <Grid size={{ xs: 12, md: 3 }}>
                <Paper variant="outlined" sx={{ p: 1, maxHeight: 500, overflow: 'auto' }}>
                  <Typography variant="subtitle2" sx={{ p: 1 }}>Slides ({selectedPresentation.slides.length})</Typography>
                  {selectedPresentation.slides.map((slide, index) => (
                    <Paper
                      key={slide.id}
                      sx={{
                        p: 1,
                        mb: 1,
                        cursor: 'pointer',
                        bgcolor: currentSlideIndex === index ? 'primary.100' : 'transparent',
                        border: currentSlideIndex === index ? '2px solid' : '1px solid',
                        borderColor: currentSlideIndex === index ? 'primary.main' : 'divider',
                      }}
                      onClick={() => setCurrentSlideIndex(index)}
                    >
                      <Typography variant="caption" color="text.secondary">Slide {index + 1}</Typography>
                      <Typography variant="body2" fontWeight={500} noWrap>{slide.title}</Typography>
                    </Paper>
                  ))}
                </Paper>
              </Grid>
              {/* Slide Editor */}
              <Grid size={{ xs: 12, md: 9 }}>
                {selectedPresentation.slides[currentSlideIndex] && (
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2">Slide {currentSlideIndex + 1} of {selectedPresentation.slides.length}</Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDeleteSlide(selectedPresentation.slides[currentSlideIndex].id)}
                        disabled={selectedPresentation.slides.length <= 1}
                      >
                        <Icon>delete</Icon>
                      </IconButton>
                    </Box>
                    <TextField
                      fullWidth
                      label="Slide Title"
                      value={selectedPresentation.slides[currentSlideIndex].title}
                      onChange={(e) => handleUpdateSlide(selectedPresentation.slides[currentSlideIndex].id, 'title', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={10}
                      label="Content"
                      value={selectedPresentation.slides[currentSlideIndex].content}
                      onChange={(e) => handleUpdateSlide(selectedPresentation.slides[currentSlideIndex].id, 'content', e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      label="Speaker Notes (optional)"
                      value={selectedPresentation.slides[currentSlideIndex].notes || ''}
                      onChange={(e) => handleUpdateSlide(selectedPresentation.slides[currentSlideIndex].id, 'notes', e.target.value)}
                    />
                  </Paper>
                )}
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Close</Button>
          <Button variant="contained" startIcon={<Icon>visibility</Icon>} onClick={() => { setIsEditDialogOpen(false); setIsPreviewOpen(true); }}>
            Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0, bgcolor: '#1a1a1a', minHeight: 500 }}>
          {selectedPresentation && selectedPresentation.slides[currentSlideIndex] && (
            <Box sx={{ position: 'relative' }}>
              {/* Slide Content */}
              <Box
                sx={{
                  p: 6,
                  minHeight: 450,
                  bgcolor: selectedPresentation.slides[currentSlideIndex].type === 'title' || selectedPresentation.slides[currentSlideIndex].type === 'summary'
                    ? 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)'
                    : 'white',
                  background: selectedPresentation.slides[currentSlideIndex].type === 'title' || selectedPresentation.slides[currentSlideIndex].type === 'summary'
                    ? 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)'
                    : 'white',
                  color: selectedPresentation.slides[currentSlideIndex].type === 'title' || selectedPresentation.slides[currentSlideIndex].type === 'summary'
                    ? 'white'
                    : 'inherit',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: selectedPresentation.slides[currentSlideIndex].type === 'title' ? 'center' : 'flex-start',
                  alignItems: selectedPresentation.slides[currentSlideIndex].type === 'title' ? 'center' : 'flex-start',
                  textAlign: selectedPresentation.slides[currentSlideIndex].type === 'title' ? 'center' : 'left',
                }}
              >
                <Typography
                  variant="h4"
                  fontWeight={700}
                  sx={{
                    color: selectedPresentation.slides[currentSlideIndex].type === 'content' ? 'primary.main' : 'inherit',
                    borderBottom: selectedPresentation.slides[currentSlideIndex].type === 'content' ? '3px solid' : 'none',
                    borderColor: 'primary.main',
                    pb: 1,
                    mb: 3,
                  }}
                >
                  {selectedPresentation.slides[currentSlideIndex].title}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                  }}
                >
                  {selectedPresentation.slides[currentSlideIndex].content}
                </Typography>
              </Box>
              {/* Navigation */}
              <Box sx={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <IconButton
                  onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                  disabled={currentSlideIndex === 0}
                  sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                >
                  <Icon>chevron_left</Icon>
                </IconButton>
                <Chip label={`${currentSlideIndex + 1} / ${selectedPresentation.slides.length}`} />
                <IconButton
                  onClick={() => setCurrentSlideIndex(Math.min(selectedPresentation.slides.length - 1, currentSlideIndex + 1))}
                  disabled={currentSlideIndex === selectedPresentation.slides.length - 1}
                  sx={{ bgcolor: 'rgba(255,255,255,0.8)' }}
                >
                  <Icon>chevron_right</Icon>
                </IconButton>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: '#1a1a1a' }}>
          <Button onClick={() => setIsPreviewOpen(false)} sx={{ color: 'white' }}>Close</Button>
          <Button
            variant="contained"
            startIcon={<Icon>download</Icon>}
            onClick={() => selectedPresentation && handleExportHTML(selectedPresentation)}
          >
            Export HTML
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
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Upload Presentation Dialog */}
      <Dialog
        open={isUploadDialogOpen}
        onClose={resetUploadWorkflow}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { minHeight: '70vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">upload_file</Icon>
            Upload & Improve Presentation
          </Box>
        </DialogTitle>
        <DialogContent>
          {/* Stepper */}
          <Stepper activeStep={uploadWorkflowStep} sx={{ mb: 3, pt: 2 }}>
            {UPLOAD_WORKFLOW_STEPS.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Step 0: Upload Document */}
          {uploadWorkflowStep === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 6,
                  border: '2px dashed',
                  borderColor: 'primary.main',
                  bgcolor: 'primary.50',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.100' }
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon sx={{ fontSize: 64, color: 'primary.main' }}>cloud_upload</Icon>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Click to Upload Existing Presentation
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Supports PowerPoint (PPTX/PPT), PDF, Word, and Images
                </Typography>
              </Paper>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Upload your existing presentation to extract content and generate an improved version for NABH assessors.
              </Typography>
            </Box>
          )}

          {/* Step 1: Extracting */}
          {uploadWorkflowStep === 1 && isExtractingUpload && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Extracting content from {uploadedFile?.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyzing slides and content...
              </Typography>
              <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
          )}

          {/* Step 2: Review & Edit Extracted Data */}
          {uploadWorkflowStep === 2 && (
            <Box>
              <Tabs value={activeUploadTab} onChange={(_, v) => setActiveUploadTab(v)} sx={{ mb: 2 }}>
                <Tab label={`Extracted Slides (${extractedSlides.length})`} icon={<Icon>slideshow</Icon>} iconPosition="start" />
                <Tab label="Raw Text" icon={<Icon>text_snippet</Icon>} iconPosition="start" />
              </Tabs>

              {activeUploadTab === 0 && (
                <Box>
                  <Paper variant="outlined" sx={{ maxHeight: 350, overflow: 'auto' }}>
                    {extractedSlides.map((slide, i) => (
                      <Box key={i} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Chip label={`Slide ${i + 1}`} size="small" color="primary" />
                          <TextField
                            size="small"
                            variant="standard"
                            value={slide.title}
                            onChange={(e) => {
                              const updated = [...extractedSlides];
                              updated[i].title = e.target.value;
                              setExtractedSlides(updated);
                            }}
                            sx={{ flexGrow: 1 }}
                            placeholder="Slide title"
                          />
                        </Box>
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          variant="outlined"
                          value={slide.content}
                          onChange={(e) => {
                            const updated = [...extractedSlides];
                            updated[i].content = e.target.value;
                            setExtractedSlides(updated);
                          }}
                        />
                      </Box>
                    ))}
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, mt: 2, bgcolor: 'warning.50' }}>
                    <Typography variant="subtitle2" color="warning.dark" gutterBottom>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>lightbulb</Icon>
                      Improvement Suggestions (Optional)
                    </Typography>
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      placeholder="Add any specific improvements (e.g., 'Add more data-driven points', 'Include quality metrics')"
                      value={userSuggestions}
                      onChange={(e) => setUserSuggestions(e.target.value)}
                    />
                  </Paper>
                </Box>
              )}

              {activeUploadTab === 1 && (
                <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                  <Typography variant="body2" component="pre" sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
                    {extractedPresentationText}
                  </Typography>
                </Paper>
              )}
            </Box>
          )}

          {/* Step 3: Generated Presentation */}
          {uploadWorkflowStep === 3 && generatedPresentationHTML && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mb: 2 }}>
                <Button size="small" startIcon={<Icon>print</Icon>} onClick={handlePrintGeneratedPresentation}>
                  Print
                </Button>
                <Button size="small" startIcon={<Icon>download</Icon>} onClick={handleDownloadGeneratedPresentation}>
                  Download HTML
                </Button>
              </Box>
              <Paper
                variant="outlined"
                sx={{ maxHeight: 500, overflow: 'auto', bgcolor: 'white' }}
              >
                <div dangerouslySetInnerHTML={{ __html: generatedPresentationHTML }} />
              </Paper>
            </Box>
          )}

          {/* Generating indicator */}
          {isGeneratingUpload && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} />
              <Typography variant="h6" sx={{ mt: 2 }}>
                Generating Improved Presentation
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Creating NABH-optimized slides...
              </Typography>
              <LinearProgress sx={{ mt: 3, maxWidth: 400, mx: 'auto' }} />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button onClick={resetUploadWorkflow}>Cancel</Button>
          {uploadWorkflowStep === 2 && (
            <>
              <Button
                variant="outlined"
                startIcon={<Icon>slideshow</Icon>}
                onClick={handleCreatePresentationFromExtracted}
                disabled={extractedSlides.length === 0}
              >
                Import as Presentation
              </Button>
              <Button
                variant="contained"
                startIcon={<Icon>auto_awesome</Icon>}
                onClick={handleGenerateImprovedPresentation}
                disabled={isGeneratingUpload}
              >
                Generate Improved
              </Button>
            </>
          )}
          {uploadWorkflowStep === 3 && (
            <Button
              variant="contained"
              startIcon={<Icon>slideshow</Icon>}
              onClick={handleCreatePresentationFromExtracted}
              disabled={extractedSlides.length === 0}
            >
              Import & Close
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

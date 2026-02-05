import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  TextField,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  AutoAwesome as GenerateIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { loadSOPsByChapter, saveSOPDocument } from '../services/sopStorage';
import { extractTextFromPDFUrl, generateSOPFromContent } from '../services/documentExtractor';
import { loadObjectiveEditsByChapter } from '../services/objectiveStorage';
import { supabase } from '../lib/supabase';

// NABH Chapters reference
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

export default function RecentSOPsPage() {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Chapter and DB selection
  const [dbChapters, setDbChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedChapterCode, setSelectedChapterCode] = useState<string>('');
  
  const [objectives, setObjectives] = useState<any[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<string>('');

  // Box 1 - PDF Content (Documentation)
  const [pdfContent, setPdfContent] = useState<string>('');
  const [extractingPdfs, setExtractingPdfs] = useState(false);

  // Box 2 - Titles & Interpretation
  const [titlesInterpretation, setTitlesInterpretation] = useState<string>('');

  // Box 3 - Final SOP
  const [finalSOP, setFinalSOP] = useState<string>('');
  const [generatingSOP, setGeneratingSOP] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Load chapters from DB on mount
  useEffect(() => {
    fetchChapters();
  }, []);

  const fetchChapters = async () => {
    const { data, error } = await supabase
      .from('nabh_chapters')
      .select('*')
      .order('chapter_number', { ascending: true });
    
    if (data) setDbChapters(data);
    if (error) console.error('Error fetching chapters:', error);
  };

  const getChapterName = (id: string) => {
    return dbChapters.find(ch => ch.id === id)?.name || '';
  };

  // Auto-load objectives when chapter changes
  useEffect(() => {
    if (selectedChapterCode) {
      loadChapterObjectives(selectedChapterCode);
    } else {
      setObjectives([]);
      setSelectedObjective('');
      setTitlesInterpretation('');
      setPdfContent('');
    }
  }, [selectedChapterCode]);

  const loadChapterObjectives = async (chapterCode: string) => {
    const result = await loadObjectiveEditsByChapter(chapterCode);
    if (result.success && result.data) {
      setObjectives(result.data);
      setSelectedObjective(''); 
    } else {
      setObjectives([]);
    }
  };

  // Extract PDFs handler
  const handleExtractPDFs = async () => {
    if (!selectedChapterCode) {
      showSnackbar('Please select a chapter first', 'error');
      return;
    }
    // ... remaining extract logic

    setExtractingPdfs(true);
    setPdfContent('');

    try {
      const result = await loadSOPsByChapter(selectedChapter);
      if (!result.success || !result.data) {
        showSnackbar(result.error || 'Failed to load SOPs', 'error');
        setExtractingPdfs(false);
        return;
      }

      const chapterSOPs = result.data;
      if (chapterSOPs.length === 0) {
        showSnackbar(`No SOPs found for chapter ${selectedChapter}`, 'error');
        setExtractingPdfs(false);
        return;
      }

      let extractedContent = '';
      let extractedCount = 0;

      for (const sop of chapterSOPs) {
        const pdfUrls = sop.pdf_urls || (sop.pdf_url ? [sop.pdf_url] : []);
        if (pdfUrls.length === 0) continue;

        extractedContent += `\n=== SOP SOURCE: ${sop.title} ===\n`;

        for (const url of pdfUrls) {
          try {
            const extractResult = await extractTextFromPDFUrl(url);
            if (extractResult.success && extractResult.text) {
              extractedContent += extractResult.text + '\n';
              extractedCount++;
            }
          } catch (e) {
            console.error('Error extracting PDF:', e);
          }
        }
      }

      setPdfContent(extractedContent || 'No documentation found in PDFs.');
      showSnackbar(`Extracted content from ${extractedCount} PDFs`, 'success');
    } catch (error) {
      showSnackbar('Failed to extract PDFs', 'error');
    } finally {
      setExtractingPdfs(false);
    }
  };

  // Generate SOP handler
  const handleGenerateSOP = async () => {
    if (!pdfContent && !titlesInterpretation && !customPrompt) {
      showSnackbar('No content available (Documentation, Interpretation, or Prompt) to generate SOP', 'error');
      return;
    }

    setGeneratingSOP(true);
    try {
      const result = await generateSOPFromContent(
        pdfContent,
        titlesInterpretation,
        selectedChapter,
        getChapterName(selectedChapter),
        customPrompt // All three pieces of content are now used
      );

      if (result.success && result.sop) {
        setFinalSOP(result.sop);
        showSnackbar('SOP generated successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to generate SOP', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to generate SOP', 'error');
    } finally {
      setGeneratingSOP(false);
    }
  };

  const handleCopyContent = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    showSnackbar(`${label} copied to clipboard!`, 'success');
  };

  const handleSaveDocumentationToDB = async () => {
    if (!pdfContent || !selectedChapterId) {
      showSnackbar('Ensure chapter is selected and content exists.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('nabh_chapter_data')
        .insert([{
          chapter_id: selectedChapterId,
          objective_code: selectedObjective || null,
          data_type: 'documentation',
          content: pdfContent,
          created_by: userData.user?.email || 'System'
        }]);

      if (error) throw error;
      showSnackbar('Documentation saved successfully!', 'success');
    } catch (error) {
      showSnackbar('Error saving documentation', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveToDB = async () => {
    if (!finalSOP || !selectedChapterId) {
      showSnackbar('Ensure chapter is selected and SOP generated.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('nabh_chapter_data')
        .insert([{
          chapter_id: selectedChapterId,
          objective_code: selectedObjective || null,
          data_type: 'final_sop',
          content: finalSOP,
          created_by: userData.user?.email || 'System'
        }]);

      if (error) throw error;
      showSnackbar('Final SOP saved successfully!', 'success');
    } catch (error) {
      showSnackbar('Error saving SOP', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header - Chapter and Objective Selectors */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
          <InputLabel>Select Chapter</InputLabel>
          <Select
            value={selectedChapterId}
            label="Select Chapter"
            onChange={(e) => {
              const id = e.target.value;
              setSelectedChapterId(id);
              const chapter = dbChapters.find(ch => ch.id === id);
              if (chapter) {
                // Determine Chapter Code (Assuming AAC, COP etc are in the name or we use a mapping)
                const codeMatch = chapter.name.match(/^[A-Z]{3}/);
                setSelectedChapterCode(codeMatch ? codeMatch[0] : '');
              }
            }}
          >
            {dbChapters.map((ch) => (
              <MenuItem key={ch.id} value={ch.id}>{ch.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }} disabled={!selectedChapterId}>
          <InputLabel>Objective</InputLabel>
          <Select
            value={selectedObjective}
            label="Objective"
            onChange={(e) => {
              const val = e.target.value;
              setSelectedObjective(val);
              const obj = objectives.find(o => o.objective_code === val);
              if (obj) {
                let content = `Title: ${obj.title || ''}\nInterpretation: ${obj.interpretations2 || ''}`;
                setTitlesInterpretation(content);
              }
            }}
          >
            {objectives.map((obj) => (
              <MenuItem key={obj.objective_code} value={obj.objective_code}>{obj.objective_code}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Main Container - Vertical Stack (Image Match) */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        
        {/* Box 1: Documentation (Top) */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, height: '28vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Documentation</Typography>
            <Box>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={handleSaveDocumentationToDB} 
                disabled={isSaving || !pdfContent}
                title="Save Documentation to DB"
              >
                {isSaving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" color="primary" onClick={handleExtractPDFs} disabled={!selectedChapterId || extractingPdfs}>
                {extractingPdfs ? <CircularProgress size={16} /> : <PdfIcon fontSize="small" />}
              </IconButton>
              <IconButton size="small" onClick={() => handleCopyContent(pdfContent, 'Documentation')} disabled={!pdfContent}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: 1, overflow: 'auto' }}>
            <TextField
              multiline
              fullWidth
              variant="standard"
              value={pdfContent}
              onChange={(e) => setPdfContent(e.target.value)}
              placeholder="Documentation data..."
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem', fontFamily: 'monospace' } }}
            />
          </Box>
        </Paper>

        {/* Box 2: Interpretation (Middle) */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, height: '28vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Interpretation</Typography>
            <IconButton size="small" onClick={() => handleCopyContent(titlesInterpretation, 'Interpretation')} disabled={!titlesInterpretation}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, p: 1, overflow: 'auto' }}>
            <TextField
              multiline
              fullWidth
              variant="standard"
              value={titlesInterpretation}
              onChange={(e) => setTitlesInterpretation(e.target.value)}
              placeholder="Interpretation data..."
              InputProps={{ disableUnderline: true, sx: { fontSize: '0.85rem' } }}
            />
          </Box>
        </Paper>

        {/* Box: Custom Prompt (New) */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">AI Instructions / Custom Prompt</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <TextField
              fullWidth
              multiline
              rows={2}
              variant="outlined"
              size="small"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="E.g. Write in points, focus on nursing staff, add a section for emergency..."
              sx={{ bgcolor: 'white' }}
            />
          </Box>
        </Paper>

        {/* Box 3: Final SOP Result (Bottom) */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, height: '28vh', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Final SOP Result</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton 
                size="small" 
                color="primary" 
                onClick={handleSaveToDB} 
                disabled={isSaving || !finalSOP}
                title="Save to Database"
              >
                {isSaving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
              </IconButton>
              <Button 
                size="small" 
                variant="contained" 
                color="primary" 
                startIcon={generatingSOP ? <CircularProgress size={14} color="inherit" /> : <GenerateIcon />}
                onClick={handleGenerateSOP}
                disabled={generatingSOP || (!pdfContent && !titlesInterpretation)}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Generate SOP
              </Button>
              <IconButton size="small" onClick={() => handleCopyContent(finalSOP, 'Final SOP')} disabled={!finalSOP}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ flex: 1, p: 1, overflow: 'auto', bgcolor: '#fafafa' }}>
            <TextField
              multiline
              fullWidth
              variant="standard"
              value={finalSOP}
              placeholder="Final generated SOP result..."
              InputProps={{ readOnly: true, disableUnderline: true, sx: { fontSize: '0.85rem' } }}
            />
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

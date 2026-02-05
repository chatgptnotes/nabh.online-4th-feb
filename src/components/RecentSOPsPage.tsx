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
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  AutoAwesome as GenerateIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  MergeType as MergeIcon,
} from '@mui/icons-material';
import { loadSOPsByChapter } from '../services/sopStorage';
import { extractTextFromPDFUrl, generateSOPFromContent, filterRelevantContent } from '../services/documentExtractor';
import { loadObjectiveEditsByChapter } from '../services/objectiveStorage';
import { supabase } from '../lib/supabase';

export default function RecentSOPsPage() {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Chapter and Objective Selection
  const [dbChapters, setDbChapters] = useState<any[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string>('');
  const [selectedChapterCode, setSelectedChapterCode] = useState<string>('');
  const [objectives, setObjectives] = useState<any[]>([]);
  const [selectedObjective, setSelectedObjective] = useState<string>('');

  // F1 - Old SOP extracted text (1st & 2nd Edition)
  const [oldSOPText, setOldSOPText] = useState<string>('');
  const [extractingOldSOP, setExtractingOldSOP] = useState(false);

  // F3 & F4 - Title and Interpretation (auto from objective selection)
  const [objectiveTitle, setObjectiveTitle] = useState<string>('');
  const [interpretation, setInterpretation] = useState<string>('');

  // AI Filter
  const [filterPrompt, setFilterPrompt] = useState<string>('');
  const [filteringContent, setFilteringContent] = useState(false);

  // F5 - Filtered relevant content
  const [filteredContent, setFilteredContent] = useState<string>('');

  // F6 - Merged content
  const [mergedContent, setMergedContent] = useState<string>('');

  // Final SOP Generation
  const [finalPrompt, setFinalPrompt] = useState<string>('');
  const [finalSOP, setFinalSOP] = useState<string>('');
  const [generatingSOP, setGeneratingSOP] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Load chapters on mount
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

  // Load objectives when chapter changes
  useEffect(() => {
    if (selectedChapterCode) {
      loadChapterObjectives(selectedChapterCode);
    } else {
      setObjectives([]);
      setSelectedObjective('');
      setObjectiveTitle('');
      setInterpretation('');
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

  // Auto-populate F3 and F4 when objective is selected
  const handleObjectiveChange = (objectiveCode: string) => {
    setSelectedObjective(objectiveCode);
    const obj = objectives.find(o => o.objective_code === objectiveCode);
    if (obj) {
      setObjectiveTitle(obj.title || '');
      setInterpretation(obj.interpretations2 || '');
    } else {
      setObjectiveTitle('');
      setInterpretation('');
    }
    // Clear dependent fields
    setFilteredContent('');
    setMergedContent('');
    setFinalSOP('');
  };

  // F1: Extract old SOP text
  const handleExtractOldSOP = async () => {
    if (!selectedChapterCode) {
      showSnackbar('Please select a chapter first', 'error');
      return;
    }

    setExtractingOldSOP(true);
    setOldSOPText('');

    try {
      const result = await loadSOPsByChapter(selectedChapterCode);
      if (!result.success || !result.data) {
        showSnackbar(result.error || 'Failed to load SOPs', 'error');
        setExtractingOldSOP(false);
        return;
      }

      const chapterSOPs = result.data;
      if (chapterSOPs.length === 0) {
        showSnackbar(`No SOPs found for chapter ${selectedChapterCode}`, 'error');
        setExtractingOldSOP(false);
        return;
      }

      let extractedContent = '';
      let extractedCount = 0;

      for (const sop of chapterSOPs) {
        const pdfUrls = sop.pdf_urls || (sop.pdf_url ? [sop.pdf_url] : []);
        if (pdfUrls.length === 0) continue;

        extractedContent += `\n=== SOP: ${sop.title} ===\n`;

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

      setOldSOPText(extractedContent || 'No content found in SOPs.');
      showSnackbar(`Extracted content from ${extractedCount} PDFs`, 'success');
    } catch (error) {
      showSnackbar('Failed to extract SOPs', 'error');
    } finally {
      setExtractingOldSOP(false);
    }
  };

  // AI Filter: Extract relevant content from F1
  const handleRunFilter = async () => {
    if (!oldSOPText) {
      showSnackbar('Please extract old SOP text first (F1)', 'error');
      return;
    }
    if (!selectedObjective) {
      showSnackbar('Please select an objective element', 'error');
      return;
    }

    setFilteringContent(true);
    setFilteredContent('');

    try {
      const result = await filterRelevantContent(
        oldSOPText,
        selectedObjective,
        objectiveTitle,
        interpretation,
        filterPrompt || undefined
      );

      if (result.success && result.filteredText) {
        setFilteredContent(result.filteredText);
        showSnackbar('Content filtered successfully!', 'success');
      } else {
        showSnackbar(result.error || 'Failed to filter content', 'error');
      }
    } catch (error) {
      showSnackbar('Failed to filter content', 'error');
    } finally {
      setFilteringContent(false);
    }
  };

  // F6: Merge all content
  const handleMergeAll = () => {
    let merged = '';

    if (objectiveTitle) {
      merged += `=== TITLE (F3) ===\n${objectiveTitle}\n\n`;
    }

    if (interpretation) {
      merged += `=== INTERPRETATION (F4) ===\n${interpretation}\n\n`;
    }

    if (filteredContent) {
      merged += `=== FILTERED RELEVANT CONTENT (F5) ===\n${filteredContent}\n`;
    }

    if (merged) {
      setMergedContent(merged.trim());
      showSnackbar('All content merged!', 'success');
    } else {
      showSnackbar('No content to merge', 'error');
    }
  };

  // Generate Final SOP
  const handleGenerateSOP = async () => {
    if (!mergedContent) {
      showSnackbar('Please merge content first (F6)', 'error');
      return;
    }

    setGeneratingSOP(true);
    try {
      const result = await generateSOPFromContent(
        mergedContent,
        `${objectiveTitle}\n${interpretation}`,
        selectedChapterCode,
        getChapterName(selectedChapterId),
        finalPrompt,
        selectedObjective // Pass objective code for document naming
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

  // Copy to clipboard
  const handleCopy = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    showSnackbar(`${label} copied!`, 'success');
  };

  // Save to database
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
          title: objectiveTitle,
          created_by: userData.user?.email || 'System'
        }]);

      if (error) throw error;
      showSnackbar('SOP saved successfully!', 'success');
    } catch (error) {
      showSnackbar('Error saving SOP', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  // Generate PDF - uses the already formatted HTML from finalSOP
  const handleGeneratePDF = async () => {
    if (!finalSOP) {
      showSnackbar('No SOP content to generate PDF', 'error');
      return;
    }

    setGeneratingPDF(true);

    try {
      const html2pdf = (await import('html2pdf.js')).default;

      // Create container with the generated HTML
      const container = document.createElement('div');
      container.innerHTML = finalSOP;
      document.body.appendChild(container);

      await html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `SOP-${selectedChapterCode}-${selectedObjective || 'General'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      }).from(container).save();

      document.body.removeChild(container);
      showSnackbar('PDF generated successfully!', 'success');
    } catch (error) {
      showSnackbar('Failed to generate PDF', 'error');
    } finally {
      setGeneratingPDF(false);
    }
  };

  // Textarea style
  const textareaStyle = {
    width: '100%',
    height: '120px',
    resize: 'vertical' as const,
    overflow: 'auto',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    fontSize: '0.85rem',
    fontFamily: 'monospace',
    padding: '8px',
    boxSizing: 'border-box' as const,
    backgroundColor: '#fff',
  };

  return (
    <Box sx={{ p: 2, bgcolor: '#f5f5f5', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header: Chapter Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2, mb: 2 }}>
        <FormControl size="small" sx={{ minWidth: 200, bgcolor: 'white' }}>
          <InputLabel>Select Chapter</InputLabel>
          <Select
            value={selectedChapterId}
            label="Select Chapter"
            onChange={async (e) => {
              const id = e.target.value;
              setSelectedChapterId(id);
              const chapter = dbChapters.find(ch => ch.id === id);
              if (chapter) {
                const codeMatch = chapter.name.match(/^[A-Z]{3}/);
                setSelectedChapterCode(codeMatch ? codeMatch[0] : '');
              }
              // Clear all fields
              setOldSOPText('');
              setFilteredContent('');
              setMergedContent('');
              setFinalSOP('');
              setSelectedObjective('');
              setObjectiveTitle('');
              setInterpretation('');

              // Auto-fetch F1 data from nabh_chapter_data for this chapter
              if (id) {
                setExtractingOldSOP(true);
                try {
                  const { data, error } = await supabase
                    .from('nabh_chapter_data')
                    .select('content, objective_code')
                    .eq('chapter_id', id)
                    .eq('data_type', 'documentation');

                  if (error) {
                    console.error('Error fetching documentation:', error);
                    showSnackbar('Error fetching documentation data', 'error');
                  } else if (data && data.length > 0) {
                    // Combine all documentation content with objective codes
                    const combinedContent = data.map(d =>
                      `=== SOP SOURCE: ${d.objective_code || 'General'} ===\n${d.content}`
                    ).join('\n\n');
                    setOldSOPText(combinedContent);
                    showSnackbar(`Loaded ${data.length} documentation record(s)`, 'success');
                  } else {
                    setOldSOPText('');
                    showSnackbar('No documentation found for this chapter', 'error');
                  }
                } catch (err) {
                  console.error('Error:', err);
                  showSnackbar('Failed to fetch documentation', 'error');
                } finally {
                  setExtractingOldSOP(false);
                }
              }
            }}
          >
            {dbChapters.map((ch) => (
              <MenuItem key={ch.id} value={ch.id}>{ch.name}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Main Container */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>

        {/* F1: Old SOP Extracted Text */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="subtitle2" fontWeight="bold">F1: 1st & 2nd Edition SOP Extracted Text</Typography>
            <Box>
              <Button
                size="small"
                variant="contained"
                startIcon={extractingOldSOP ? <CircularProgress size={14} color="inherit" /> : <PdfIcon />}
                onClick={handleExtractOldSOP}
                disabled={!selectedChapterId || extractingOldSOP}
                sx={{ fontSize: '0.75rem', mr: 1 }}
              >
                Extract
              </Button>
              <IconButton size="small" onClick={() => handleCopy(oldSOPText, 'F1')} disabled={!oldSOPText}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={oldSOPText}
              onChange={(e) => setOldSOPText(e.target.value)}
              placeholder="Select a chapter to auto-load 1st & 2nd Edition SOP text..."
              style={{ ...textareaStyle, height: '150px' }}
            />
          </Box>
        </Paper>

        {/* F2: Objective Element Selection */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#ede7f6' }}>
            <Typography variant="subtitle2" fontWeight="bold">F2: Objective Element (3rd Edition)</Typography>
          </Box>
          <Box sx={{ p: 1.5 }}>
            <FormControl fullWidth size="small" disabled={!selectedChapterId}>
              <InputLabel>Select Objective Element</InputLabel>
              <Select
                value={selectedObjective}
                label="Select Objective Element"
                onChange={(e) => handleObjectiveChange(e.target.value)}
              >
                {objectives.map((obj) => (
                  <MenuItem key={obj.objective_code} value={obj.objective_code}>
                    {obj.objective_code} - {obj.title?.substring(0, 60)}...
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* F3 & F4: Title and Interpretation (side by side) */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {/* F3: Title */}
          <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 1 }}>
            <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e8f5e9' }}>
              <Typography variant="subtitle2" fontWeight="bold">F3: Title</Typography>
              <IconButton size="small" onClick={() => handleCopy(objectiveTitle, 'F3')} disabled={!objectiveTitle}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 1 }}>
              <textarea
                value={objectiveTitle}
                onChange={(e) => setObjectiveTitle(e.target.value)}
                placeholder="Auto-populated from objective selection..."
                style={{ ...textareaStyle, height: '80px' }}
              />
            </Box>
          </Paper>

          {/* F4: Interpretation */}
          <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, flex: 2 }}>
            <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff3e0' }}>
              <Typography variant="subtitle2" fontWeight="bold">F4: Interpretation</Typography>
              <IconButton size="small" onClick={() => handleCopy(interpretation, 'F4')} disabled={!interpretation}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 1 }}>
              <textarea
                value={interpretation}
                onChange={(e) => setInterpretation(e.target.value)}
                placeholder="Auto-populated from objective selection..."
                style={{ ...textareaStyle, height: '80px' }}
              />
            </Box>
          </Paper>
        </Box>

        {/* AI Filter Prompt */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fce4ec' }}>
            <Typography variant="subtitle2" fontWeight="bold">AI Filter Prompt (Extract relevant from F1)</Typography>
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={filteringContent ? <CircularProgress size={14} color="inherit" /> : <FilterIcon />}
              onClick={handleRunFilter}
              disabled={filteringContent || !oldSOPText || !selectedObjective}
              sx={{ fontSize: '0.75rem' }}
            >
              Run Filter
            </Button>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={filterPrompt}
              onChange={(e) => setFilterPrompt(e.target.value)}
              placeholder="Optional: Custom filter instructions. Default: Extract only relevant sentences from F1 that match the selected objective..."
              style={{ ...textareaStyle, height: '60px' }}
            />
          </Box>
        </Paper>

        {/* F5: Filtered Relevant Content */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f3e5f5' }}>
            <Typography variant="subtitle2" fontWeight="bold">F5: Filtered Relevant Content (AI Output)</Typography>
            <IconButton size="small" onClick={() => handleCopy(filteredContent, 'F5')} disabled={!filteredContent}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={filteredContent}
              onChange={(e) => setFilteredContent(e.target.value)}
              placeholder="AI filtered content will appear here..."
              style={{ ...textareaStyle, height: '120px' }}
            />
          </Box>
        </Paper>

        {/* F6: Merged Content */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e0f7fa' }}>
            <Typography variant="subtitle2" fontWeight="bold">F6: Merged Content (F3 + F4 + F5)</Typography>
            <Box>
              <Button
                size="small"
                variant="contained"
                startIcon={<MergeIcon />}
                onClick={handleMergeAll}
                disabled={!objectiveTitle && !interpretation && !filteredContent}
                sx={{ fontSize: '0.75rem', mr: 1 }}
              >
                Fetch All
              </Button>
              <IconButton size="small" onClick={() => handleCopy(mergedContent, 'F6')} disabled={!mergedContent}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={mergedContent}
              onChange={(e) => setMergedContent(e.target.value)}
              placeholder="Click 'Fetch All' to merge F3 + F4 + F5..."
              style={{ ...textareaStyle, height: '120px' }}
            />
          </Box>
        </Paper>

        {/* Final Prompt */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', bgcolor: '#fff8e1' }}>
            <Typography variant="subtitle2" fontWeight="bold">Final Prompt: SOP Generation Instructions</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={finalPrompt}
              onChange={(e) => setFinalPrompt(e.target.value)}
              placeholder="Optional: Additional instructions for SOP generation based on NABH 3rd Edition..."
              style={{ ...textareaStyle, height: '60px' }}
            />
          </Box>
        </Paper>

        {/* Final SOP Result */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#c8e6c9' }}>
            <Typography variant="subtitle2" fontWeight="bold">Final SOP Result</Typography>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <IconButton
                size="small"
                color="primary"
                onClick={handleSaveToDB}
                disabled={isSaving || !finalSOP}
                title="Save to DB"
              >
                {isSaving ? <CircularProgress size={16} /> : <SaveIcon fontSize="small" />}
              </IconButton>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={generatingSOP ? <CircularProgress size={14} color="inherit" /> : <GenerateIcon />}
                onClick={handleGenerateSOP}
                disabled={generatingSOP || !mergedContent}
                sx={{ fontSize: '0.75rem' }}
              >
                Generate SOP
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={generatingPDF ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                onClick={handleGeneratePDF}
                disabled={generatingPDF || !finalSOP}
                sx={{ fontSize: '0.75rem' }}
              >
                PDF
              </Button>
              <IconButton size="small" onClick={() => handleCopy(finalSOP, 'Final SOP')} disabled={!finalSOP}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          {/* Rendered SOP Document Preview */}
          <Box sx={{ bgcolor: '#fff', minHeight: '500px' }}>
            {finalSOP ? (
              <Box
                sx={{
                  '& iframe': {
                    width: '100%',
                    minHeight: '500px',
                    border: 'none',
                    backgroundColor: 'white',
                  },
                }}
              >
                <iframe
                  srcDoc={finalSOP}
                  title="SOP Preview"
                  sandbox="allow-same-origin allow-popups"
                  style={{ display: 'block' }}
                />
              </Box>
            ) : (
              <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>
                <Typography variant="body2">
                  Click "Generate SOP" to create a professional SOP document...
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

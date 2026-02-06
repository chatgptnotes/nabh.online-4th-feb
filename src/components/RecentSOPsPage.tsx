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
  Chip,
} from '@mui/material';
import {
  ContentCopy as CopyIcon,
  AutoAwesome as GenerateIcon,
  PictureAsPdf as PdfIcon,
  Save as SaveIcon,
  Download as DownloadIcon,
  FilterAlt as FilterIcon,
  MergeType as MergeIcon,
  Edit as EditIcon,
  Chat as ChatIcon,
  Storage as StorageIcon,
} from '@mui/icons-material';
import { loadSOPsByChapter } from '../services/sopStorage';
import { extractTextFromPDFUrl, generateSOPFromContent, filterRelevantContent } from '../services/documentExtractor';
import { loadObjectiveEditsByChapter } from '../services/objectiveStorage';
import { loadAllSOPPrompts } from '../services/sopPromptStorage';
import { supabase } from '../lib/supabase';
import SOPImprovementChat from './SOPImprovementChat';
import { uploadAndSaveSOP, getGeneratedSOPsByChapter, type GeneratedSOP } from '../services/sopGeneratedStorage';
import { callGeminiAPI } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function RecentSOPsPage() {
  const navigate = useNavigate();
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
  const [isEditingFinalSOP, setIsEditingFinalSOP] = useState(false);
  const [isTextEditing, setIsTextEditing] = useState(false);
  const [sopPrompts, setSOPPrompts] = useState<any[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>('');

  // SOP Improvement Chat
  const [showImprovementChat, setShowImprovementChat] = useState(false);
  const [sopVersions, setSOPVersions] = useState<Array<{id: string, version: string, content: string, timestamp: Date}>>([]);
  const [currentVersion, setCurrentVersion] = useState<string>('1.0');

  // Existing SOP from database
  const [existingSOP, setExistingSOP] = useState<GeneratedSOP | null>(null);
  const [checkingExistingSOP, setCheckingExistingSOP] = useState(false);

  // F7: Direct Content Editor
  const [directEditContent, setDirectEditContent] = useState<string>('');
  const [aiImproving, setAiImproving] = useState(false);


  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  // Load chapters on mount
  useEffect(() => {
    fetchChapters();
  }, []);

  // Load AI Filter Prompt and SOP Prompts from database on mount
  useEffect(() => {
    const fetchPrompts = async () => {
      const result = await loadAllSOPPrompts();
      if (result.success && result.data && result.data.length > 0) {
        setSOPPrompts(result.data);
        setFilterPrompt(result.data[0].prompt);
        
        // Set default selection for Final Prompt dropdown
        // Find the first prompt with "SOP Generation" or similar in the title, or use the first one
        const defaultPrompt = result.data.find(p => 
          p.title?.toLowerCase().includes('sop generation') || 
          p.title?.toLowerCase().includes('generation') ||
          p.title?.toLowerCase().includes('instructions')
        ) || result.data[0];
        
        if (defaultPrompt) {
          setSelectedPromptId(defaultPrompt.id);
          setFinalPrompt(defaultPrompt.prompt);
        }
      }
    };
    fetchPrompts();
  }, []);

  // Handle prompt selection for Final Prompt
  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
    const selected = sopPrompts.find(p => p.id === promptId);
    if (selected) {
      setFinalPrompt(selected.prompt);
    }
  };

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
  const handleObjectiveChange = async (objectiveCode: string) => {
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
    setDirectEditContent('');
    setExistingSOP(null);

    // Check for existing SOP in nabh_generated_sops table
    if (objectiveCode && selectedChapterCode) {
      setCheckingExistingSOP(true);
      try {
        const { data, error } = await supabase
          .from('nabh_generated_sops')
          .select('*')
          .eq('chapter_code', selectedChapterCode)
          .eq('objective_code', objectiveCode)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (data && !error) {
          setExistingSOP(data);
          // Load existing SOP content into finalSOP and directEditContent
          if (data.sop_html_content) {
            setFinalSOP(data.sop_html_content);
            setDirectEditContent(data.sop_html_content);
          }
          showSnackbar(`✅ Found existing SOP for ${objectiveCode}${data.pdf_url ? ' (PDF available)' : ''}`, 'success');
        }
      } catch (err) {
        // No existing SOP found - this is normal
        console.log('No existing SOP found for', objectiveCode);
      } finally {
        setCheckingExistingSOP(false);
      }
    }
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
        setDirectEditContent(result.sop);
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

  // Save to database with PDF upload to bucket
  const handleSaveToDB = async () => {
    if (!finalSOP || !selectedChapterId || !selectedObjective) {
      showSnackbar('Ensure chapter and objective are selected and SOP generated.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Step 1: Generate PDF Blob
      let pdfBlob: Blob | undefined;
      try {
        const html2pdf = (await import('html2pdf.js')).default;
        const container = document.createElement('div');
        container.innerHTML = finalSOP;
        document.body.appendChild(container);

        pdfBlob = await html2pdf().set({
          margin: [15, 10, 15, 10],  // 15mm top/bottom, 10mm left/right
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        }).from(container).outputPdf('blob');

        document.body.removeChild(container);
      } catch (pdfError) {
        console.warn('PDF generation failed, saving without PDF:', pdfError);
      }

      // Step 2: Upload PDF + Save to nabh_generated_sops table
      const result = await uploadAndSaveSOP({
        chapter_id: selectedChapterId,
        chapter_code: selectedChapterCode,
        chapter_name: getChapterName(selectedChapterId),
        objective_code: selectedObjective,
        objective_title: objectiveTitle,
        f3_title: objectiveTitle,
        f4_interpretation: interpretation,
        sop_html_content: finalSOP,
      }, pdfBlob);

      if (result.success) {
        showSnackbar(`SOP saved successfully!${result.pdfUrl ? ' PDF uploaded.' : ''}`, 'success');
      } else {
        throw new Error(result.error || 'Failed to save SOP');
      }

    } catch (error) {
      console.error('Error saving SOP:', error);
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
        margin: [15, 10, 15, 10],  // 15mm top/bottom, 10mm left/right
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

  // SOP Improvement Chat Handlers
  const handleSOPUpdate = (updatedSOP: string) => {
    // Create new version
    const newVersionNumber = (parseFloat(currentVersion) + 0.1).toFixed(1);
    const newVersion = {
      id: Date.now().toString(),
      version: newVersionNumber,
      content: updatedSOP,
      timestamp: new Date()
    };
    
    setSOPVersions(prev => [...prev, newVersion]);
    setCurrentVersion(newVersionNumber);
    setFinalSOP(updatedSOP);
    setDirectEditContent(updatedSOP);

    showSnackbar(`SOP updated to version ${newVersionNumber}!`, 'success');
  };

  const handleFeedbackSave = async (feedback: any) => {
    try {
      // Save feedback to database for future improvements
      const { data: userData } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('sop_improvement_feedback')
        .insert([{
          chapter_code: selectedChapterCode,
          objective_code: selectedObjective,
          feedback_data: feedback,
          user_id: userData?.user?.id,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;
      showSnackbar('Feedback saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving feedback:', error);
      showSnackbar('Failed to save feedback', 'error');
    }
  };

  const handleStartImprovement = () => {
    if (!finalSOP) {
      showSnackbar('Please generate a SOP first before starting improvement', 'error');
      return;
    }
    
    // Initialize versions array with current SOP as v1.0
    if (sopVersions.length === 0) {
      const initialVersion = {
        id: Date.now().toString(),
        version: '1.0',
        content: finalSOP,
        timestamp: new Date()
      };
      setSOPVersions([initialVersion]);
    }
    
    setShowImprovementChat(true);
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
      {/* Header: Chapter Selection + SOP Database Button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 2, mb: 2 }}>
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
              setDirectEditContent('');
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

        <Button
          variant="contained"
          color="primary"
          startIcon={<StorageIcon />}
          onClick={() => navigate('/sop-database')}
          sx={{ fontWeight: 600 }}
        >
          📚 SOP Database
        </Button>
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
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', bgcolor: '#fff8e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="subtitle2" fontWeight="bold">Final Prompt: SOP Generation Instructions</Typography>
              {selectedPromptId && (
                <Typography variant="caption" color="success.main" sx={{ display: 'block', fontSize: '0.75rem' }}>
                  ✅ Default prompt auto-applied
                </Typography>
              )}
            </Box>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedPromptId}
                onChange={(e) => handlePromptSelect(e.target.value)}
                displayEmpty
                sx={{ fontSize: '0.8rem', bgcolor: '#fff' }}
              >
                <MenuItem value="" disabled>-- Select Prompt --</MenuItem>
                {sopPrompts.map((p) => (
                  <MenuItem key={p.id} value={p.id}>{p.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
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

        {/* F7: Direct Content Editor */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1 }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#e1f5fe' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">F7: Direct Content Editor</Typography>
              {directEditContent && directEditContent === finalSOP && (
                <Chip label="✓ Synced" size="small" color="success" sx={{ height: 20, fontSize: '0.7rem' }} />
              )}
              {directEditContent && directEditContent !== finalSOP && (
                <Chip label="⚠ Not synced" size="small" color="warning" sx={{ height: 20, fontSize: '0.7rem' }} />
              )}
              {aiImproving && (
                <Chip
                  icon={<CircularProgress size={12} />}
                  label="AI Improving..."
                  size="small"
                  color="secondary"
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                startIcon={aiImproving ? <CircularProgress size={14} color="inherit" /> : <GenerateIcon />}
                onClick={async () => {
                  if (!directEditContent) {
                    showSnackbar('No content to improve', 'error');
                    return;
                  }
                  setAiImproving(true);
                  try {
                    const improvePrompt = `You are an expert SOP writer for NABH hospital accreditation.

TASK: Improve the following SOP content to make it more professional, clear, and compliant with NABH standards.

CURRENT CONTENT:
${directEditContent}

INSTRUCTIONS:
1. Keep the same HTML structure and formatting
2. Improve language clarity and professionalism
3. Ensure NABH compliance terminology is used
4. Fix any grammatical errors
5. Make procedures more step-by-step if needed
6. Keep all existing sections but enhance them

OUTPUT: Return ONLY the improved HTML content, no explanations.`;

                    const response = await callGeminiAPI(improvePrompt, 0.7, 8192);
                    let improvedContent = response?.candidates?.[0]?.content?.parts?.[0]?.text || '';

                    if (improvedContent) {
                      // Clean up markdown if present
                      improvedContent = improvedContent.replace(/```html/g, '').replace(/```/g, '').trim();
                      setDirectEditContent(improvedContent);
                      setFinalSOP(improvedContent);
                      showSnackbar('✨ Content improved by AI!', 'success');
                    } else {
                      showSnackbar('AI did not return improved content', 'error');
                    }
                  } catch (error) {
                    console.error('AI Improve error:', error);
                    showSnackbar('Failed to improve content with AI', 'error');
                  } finally {
                    setAiImproving(false);
                  }
                }}
                disabled={!directEditContent || aiImproving}
                sx={{ fontSize: '0.75rem' }}
              >
                {aiImproving ? 'Improving...' : '✨ AI Improve'}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="primary"
                onClick={() => {
                  setFinalSOP(directEditContent);
                  showSnackbar('Content synced to preview!', 'success');
                }}
                disabled={!directEditContent || directEditContent === finalSOP}
                sx={{ fontSize: '0.75rem' }}
              >
                Sync to Preview
              </Button>
              <IconButton size="small" onClick={() => handleCopy(directEditContent, 'F7')} disabled={!directEditContent}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={directEditContent}
              onChange={(e) => setDirectEditContent(e.target.value)}
              onBlur={() => {
                if (directEditContent && directEditContent !== finalSOP) {
                  setFinalSOP(directEditContent);
                  showSnackbar('Content auto-synced to preview!', 'success');
                }
              }}
              placeholder="Edit content here. Changes will auto-sync to preview when you click outside. Use '✨ AI Improve' button to enhance content with Gemini AI..."
              style={{ ...textareaStyle, height: '250px', fontSize: '0.8rem' }}
            />
          </Box>
        </Paper>

        {/* Final SOP Result */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: existingSOP ? '#bbdefb' : '#c8e6c9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">Final SOP Result</Typography>
              {checkingExistingSOP && (
                <CircularProgress size={16} />
              )}
              {existingSOP && (
                <>
                  <Chip
                    label="✅ Existing SOP Found"
                    size="small"
                    color="info"
                    sx={{ height: 24 }}
                  />
                  <Chip
                    label={`v${existingSOP.version}`}
                    size="small"
                    variant="outlined"
                    sx={{ height: 24 }}
                  />
                  {existingSOP.pdf_url && (
                    <Button
                      size="small"
                      variant="contained"
                      color="error"
                      startIcon={<PdfIcon />}
                      onClick={() => window.open(existingSOP.pdf_url, '_blank')}
                      sx={{ fontSize: '0.7rem', py: 0.5, height: 24 }}
                    >
                      Open PDF
                    </Button>
                  )}
                </>
              )}
            </Box>
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
                sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', py: 0.5, px: 1 }}
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
                sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', py: 0.5, px: 1 }}
              >
                PDF
              </Button>
              <Button
                size="small"
                variant="contained"
                color={isTextEditing ? "warning" : "secondary"}
                startIcon={<EditIcon />}
                onClick={() => { setIsTextEditing(!isTextEditing); setIsEditingFinalSOP(false); }}
                disabled={!finalSOP}
                sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', py: 0.5, px: 1 }}
              >
                {isTextEditing ? 'Done' : 'Text Edit'}
              </Button>
              <Button
                size="small"
                variant="contained"
                color={isEditingFinalSOP ? "warning" : "info"}
                onClick={() => { setIsEditingFinalSOP(!isEditingFinalSOP); setIsTextEditing(false); }}
                disabled={!finalSOP}
                sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', py: 0.5, px: 1 }}
              >
                {isEditingFinalSOP ? 'Preview' : 'Code'}
              </Button>
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={<ChatIcon />}
                onClick={handleStartImprovement}
                disabled={!finalSOP}
                sx={{ fontSize: '0.7rem', whiteSpace: 'nowrap', py: 0.5, px: 1 }}
              >
                Improve SOP
              </Button>
              <IconButton size="small" onClick={() => handleCopy(finalSOP, 'Final SOP')} disabled={!finalSOP}>
                <CopyIcon fontSize="small" />
              </IconButton>
              {sopVersions.length > 0 && (
                <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                  v{currentVersion}
                </Typography>
              )}
            </Box>
          </Box>
          {/* Rendered SOP Document Preview */}
          <Box sx={{ bgcolor: '#fff', minHeight: '500px', maxWidth: '100%', overflow: 'hidden' }}>
            {finalSOP ? (
              isTextEditing ? (
                <Box sx={{ width: '100%', height: '600px', border: '2px solid #1976d2' }}>
                  <iframe
                    id="sop-text-editor"
                    srcDoc={`
                      <html>
                        <head>
                          <style>
                            body { margin: 0; padding: 16px; font-family: Arial, sans-serif; min-height: 100%; }
                            table { width: 100% !important; max-width: 100% !important; border-collapse: collapse; }
                            td, th { word-break: break-word; padding: 8px; border: 1px solid #ddd; }
                            img { max-width: 100%; height: auto; }
                            *:focus { outline: none; }
                          </style>
                        </head>
                        <body contenteditable="true">${finalSOP}</body>
                      </html>
                    `}
                    title="SOP Text Editor"
                    style={{
                      display: 'block',
                      width: '100%',
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'white',
                    }}
                    onLoad={(e) => {
                      const iframe = e.target as HTMLIFrameElement;
                      if (iframe.contentDocument) {
                        iframe.contentDocument.body.addEventListener('blur', () => {
                          if (iframe.contentDocument?.body) {
                            setFinalSOP(iframe.contentDocument.body.innerHTML);
                          }
                        });
                      }
                    }}
                  />
                </Box>
              ) : isEditingFinalSOP ? (
                <textarea
                  value={finalSOP}
                  onChange={(e) => setFinalSOP(e.target.value)}
                  style={{
                    width: '100%',
                    minHeight: '500px',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    padding: '10px',
                    border: 'none',
                    resize: 'vertical',
                    outline: 'none',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    overflow: 'auto',
                  }}
                >
                  <iframe
                    srcDoc={`
                      <html>
                        <head>
                          <style>
                            body { margin: 0; padding: 16px; font-family: Arial, sans-serif; }
                            table { width: 100% !important; max-width: 100% !important; border-collapse: collapse; table-layout: fixed; }
                            td, th { word-break: break-word; padding: 8px; }
                            img { max-width: 100%; height: auto; }
                          </style>
                        </head>
                        <body>${finalSOP}</body>
                      </html>
                    `}
                    title="SOP Preview"
                    sandbox="allow-same-origin allow-popups"
                    style={{
                      display: 'block',
                      width: '100%',
                      minHeight: '500px',
                      border: 'none',
                      backgroundColor: 'white',
                    }}
                  />
                </Box>
              )
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

      {/* SOP Improvement Chat Section */}
      {showImprovementChat && finalSOP && (
        <Box sx={{ mt: 2 }}>
          <Paper elevation={1} sx={{ overflow: 'hidden' }}>
            <Box sx={{ p: 2, bgcolor: 'success.50', borderBottom: 1, borderColor: 'divider' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" color="success.main">
                  🤖 SOP Improvement Assistant
                </Typography>
                <Box display="flex" alignItems="center" gap={1}>
                  {sopVersions.length > 1 && (
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => {/* Add version comparison logic */}}
                    >
                      Compare Versions
                    </Button>
                  )}
                  <Button 
                    size="small" 
                    variant="outlined"
                    onClick={() => setShowImprovementChat(false)}
                  >
                    Close Chat
                  </Button>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Let's work together to improve your SOP with targeted questions and iterative refinements
              </Typography>
            </Box>
            <SOPImprovementChat
              sopContent={finalSOP}
              sopTitle={objectiveTitle}
              objectiveCode={selectedObjective}
              chapterCode={selectedChapterCode}
              onSOPUpdate={handleSOPUpdate}
              onFeedbackSave={handleFeedbackSave}
            />
          </Paper>
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}

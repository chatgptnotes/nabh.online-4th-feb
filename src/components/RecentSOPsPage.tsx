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
  Download as DownloadIcon,
} from '@mui/icons-material';
import { loadSOPsByChapter, saveSOPDocument } from '../services/sopStorage';
import { extractTextFromPDFUrl, generateSOPFromContent } from '../services/documentExtractor';
import { loadObjectiveEditsByChapter } from '../services/objectiveStorage';
import { supabase } from '../lib/supabase';

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

  // Combined Content
  const [combinedContent, setCombinedContent] = useState<string>('');

  // PDF Generation
  const [generatingPDF, setGeneratingPDF] = useState(false);

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

    setExtractingPdfs(true);
    setPdfContent('');

    try {
      const result = await loadSOPsByChapter(selectedChapterCode);
      if (!result.success || !result.data) {
        showSnackbar(result.error || 'Failed to load SOPs', 'error');
        setExtractingPdfs(false);
        return;
      }

      const chapterSOPs = result.data;
      if (chapterSOPs.length === 0) {
        showSnackbar(`No SOPs found for chapter ${selectedChapterCode}`, 'error');
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
      showSnackbar('No content available to generate SOP', 'error');
      return;
    }

    setGeneratingSOP(true);
    try {
      const result = await generateSOPFromContent(
        pdfContent,
        titlesInterpretation,
        selectedChapterCode,
        getChapterName(selectedChapterId),
        customPrompt
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

  // Combine all content from Documentation, Interpretation, and Custom Prompt
  const handleCombineAll = () => {
    let combined = '';

    if (pdfContent) {
      combined += `=== DOCUMENTATION ===\n${pdfContent}\n\n`;
    }

    if (titlesInterpretation) {
      combined += `=== INTERPRETATION ===\n${titlesInterpretation}\n\n`;
    }

    if (customPrompt) {
      combined += `=== AI INSTRUCTIONS ===\n${customPrompt}\n`;
    }

    if (combined) {
      setCombinedContent(combined.trim());
      showSnackbar('All content combined!', 'success');
    } else {
      showSnackbar('No content to combine', 'error');
    }
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

  // Generate PDF function
  const handleGeneratePDF = async () => {
    if (!finalSOP) {
      showSnackbar('No SOP content to generate PDF', 'error');
      return;
    }

    setGeneratingPDF(true);

    try {
      // Dynamically load html2pdf
      const html2pdf = (await import('html2pdf.js')).default;

      const chapterName = getChapterName(selectedChapterId) || 'SOP Document';
      const today = new Date().toLocaleDateString('en-GB');

      // Get objective title from selected objective
      const selectedObj = objectives.find(o => o.objective_code === selectedObjective);
      const objectiveTitle = selectedObj?.title || chapterName;

      // Create professional SOP HTML template
      const sopHTML = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 28px; font-weight: bold;">
              <span style="color: #2563eb;">HOPE</span><span style="color: #dc2626;">HOSPITAL</span>
            </div>
            <div style="font-size: 11px; color: #666; letter-spacing: 1px;">Assured | Committed | Proficient</div>
          </div>

          <div style="height: 4px; background: linear-gradient(90deg, #2563eb, #1d4ed8); margin: 20px 0;"></div>

          <!-- Objective Code -->
          <div style="font-size: 14px; color: #333; margin-bottom: 20px;">
            <strong>SOP - ${selectedObjective || selectedChapterCode}</strong> - ${objectiveTitle}
          </div>

          <!-- Title Banner -->
          <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px 30px; text-align: center; border-radius: 8px; margin-bottom: 30px;">
            <h1 style="font-size: 20px; font-weight: 600; margin: 0;">Standard Operating Procedure</h1>
          </div>

          <!-- Metadata Table -->
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px; border: 1px solid #e5e7eb;">
            <tr>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600; width: 20%;">Document No</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; width: 30%;">DOC-${selectedChapterCode}-001</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600; width: 20%;">Version</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; width: 30%;">1.0</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600;">Department</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb;">Quality Department</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600;">Category</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb;">SOP</td>
            </tr>
            <tr>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600;">Effective Date</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb;">${today}</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb; background: #f9fafb; font-weight: 600;">Review Date</td>
              <td style="padding: 12px 15px; border: 1px solid #e5e7eb;">${today}</td>
            </tr>
          </table>

          <!-- SOP Content -->
          <div style="margin-bottom: 30px; line-height: 1.8; white-space: pre-wrap; font-size: 13px;">
            ${finalSOP.replace(/\n/g, '<br>')}
          </div>

          <!-- Approval Section -->
          <div style="margin: 40px 0;">
            <div style="display: flex; background: #4b5563; color: white; text-align: center; font-weight: 600; font-size: 13px;">
              <div style="flex: 1; padding: 12px; border-right: 1px solid #6b7280;">PREPARED BY</div>
              <div style="flex: 1; padding: 12px; border-right: 1px solid #6b7280;">REVIEWED BY</div>
              <div style="flex: 1; padding: 12px;">APPROVED BY</div>
            </div>
            <div style="display: flex; border: 1px solid #d1d5db; border-top: none;">
              <div style="flex: 1; padding: 20px; text-align: center; border-right: 1px solid #d1d5db;">
                <div style="font-weight: 600; margin-bottom: 5px;">Name: Sonali Kakde</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Designation: Clinical Audit Coordinator</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 15px;">Date: ${today}</div>
                <div style="font-size: 12px; color: #9ca3af;">Signature:</div>
                <div style="font-family: cursive; font-size: 20px; color: #1e3a8a;">Sonali</div>
              </div>
              <div style="flex: 1; padding: 20px; text-align: center; border-right: 1px solid #d1d5db;">
                <div style="font-weight: 600; margin-bottom: 5px;">Name: Gaurav Agrawal</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Designation: Hospital Administrator</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 15px;">Date: ${today}</div>
                <div style="font-size: 12px; color: #9ca3af;">Signature:</div>
                <div style="font-family: cursive; font-size: 20px; color: #1e3a8a;">Gaurav</div>
              </div>
              <div style="flex: 1; padding: 20px; text-align: center;">
                <div style="font-weight: 600; margin-bottom: 5px;">Name: Dr. Shiraz Khan</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 5px;">Designation: Quality Coordinator</div>
                <div style="font-size: 12px; color: #6b7280; margin-bottom: 15px;">Date: ${today}</div>
                <div style="font-size: 12px; color: #9ca3af;">Signature:</div>
                <div style="font-family: cursive; font-size: 20px; color: #1e3a8a;">Dr. Khan</div>
              </div>
            </div>
          </div>

          <!-- Version History -->
          <div style="margin: 40px 0;">
            <h3 style="font-size: 14px; font-weight: 600; margin-bottom: 10px; color: #374151;">Version History</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr>
                  <th style="background: #4b5563; color: white; padding: 10px 15px; text-align: left; font-size: 13px;">Version</th>
                  <th style="background: #4b5563; color: white; padding: 10px 15px; text-align: left; font-size: 13px;">Date</th>
                  <th style="background: #4b5563; color: white; padding: 10px 15px; text-align: left; font-size: 13px;">Description</th>
                  <th style="background: #4b5563; color: white; padding: 10px 15px; text-align: left; font-size: 13px;">Changed By</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 10px 15px; border: 1px solid #e5e7eb; font-size: 13px;">1.0</td>
                  <td style="padding: 10px 15px; border: 1px solid #e5e7eb; font-size: 13px;">${today}</td>
                  <td style="padding: 10px 15px; border: 1px solid #e5e7eb; font-size: 13px;">Initial Release</td>
                  <td style="padding: 10px 15px; border: 1px solid #e5e7eb; font-size: 13px;">Sonali Kakde</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Stamp Area -->
          <div style="border: 2px dashed #9ca3af; padding: 30px; text-align: center; margin: 30px 0; color: #9ca3af; font-size: 14px;">
            [HOSPITAL STAMP AREA]
          </div>

          <!-- Footer -->
          <div style="margin-top: 40px; text-align: center;">
            <div style="height: 4px; background: linear-gradient(90deg, #2563eb, #1d4ed8); margin-bottom: 20px;"></div>
            <div style="font-size: 12px; color: #6b7280;">
              <div style="margin-bottom: 5px;"><strong style="color: #374151;">Hope Hospital</strong> | 2, Teka Naka, Nagpur</div>
              <div style="margin-bottom: 5px;">Phone: +91-XXXX-XXXXXX | Email: info@hopehospital.com | Website: www.hopehospital.com</div>
              <div style="font-size: 11px; color: #9ca3af; margin-top: 10px;">This is a controlled document. Unauthorized copying or distribution is prohibited.</div>
            </div>
          </div>
        </div>
      `;

      // Create a temporary container
      const container = document.createElement('div');
      container.innerHTML = sopHTML;
      document.body.appendChild(container);

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `SOP-${selectedChapterCode || 'Document'}-${selectedObjective || 'General'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(container).save();

      // Remove temporary container
      document.body.removeChild(container);

      showSnackbar('PDF generated successfully!', 'success');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showSnackbar('Failed to generate PDF', 'error');
    } finally {
      setGeneratingPDF(false);
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

      {/* Main Container - Vertical Stack */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        
        {/* Box 1: Documentation */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Documentation</Typography>
            <Box>
              <IconButton
                size="small"
                color="primary"
                onClick={handleSaveDocumentationToDB}
                disabled={isSaving || !pdfContent}
                title="Save Documentation"
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
          <Box sx={{ p: 1 }}>
            <textarea
              value={pdfContent}
              onChange={(e) => setPdfContent(e.target.value)}
              placeholder="Documentation data..."
              style={{
                width: '100%',
                height: '150px',
                resize: 'vertical',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                padding: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
          </Box>
        </Paper>

        {/* Box 2: Interpretation */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Interpretation</Typography>
            <IconButton size="small" onClick={() => handleCopyContent(titlesInterpretation, 'Interpretation')} disabled={!titlesInterpretation}>
              <CopyIcon fontSize="small" />
            </IconButton>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={titlesInterpretation}
              onChange={(e) => setTitlesInterpretation(e.target.value)}
              placeholder="Interpretation data..."
              style={{
                width: '100%',
                height: '100px',
                resize: 'vertical',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '0.85rem',
                padding: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
          </Box>
        </Paper>

        {/* Custom Prompt Box */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">AI Instructions / Custom Prompt</Typography>
          </Box>
          <Box sx={{ p: 1 }}>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="E.g. Write in points, focus on nursing staff..."
              style={{
                width: '100%',
                height: '60px',
                resize: 'vertical',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '0.85rem',
                padding: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
          </Box>
        </Paper>

        {/* Combined Content Box */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Combined Content</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="contained"
                color="secondary"
                onClick={handleCombineAll}
                disabled={!pdfContent && !titlesInterpretation && !customPrompt}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Fetch All
              </Button>
              <IconButton size="small" onClick={() => handleCopyContent(combinedContent, 'Combined Content')} disabled={!combinedContent}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 1, bgcolor: '#f9f9f9' }}>
            <textarea
              value={combinedContent}
              onChange={(e) => setCombinedContent(e.target.value)}
              placeholder="Click 'Fetch All' to combine Documentation + Interpretation + AI Instructions..."
              style={{
                width: '100%',
                height: '120px',
                resize: 'vertical',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '0.85rem',
                fontFamily: 'monospace',
                padding: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
            />
          </Box>
        </Paper>

        {/* Box 3: Final SOP Result */}
        <Paper elevation={1} sx={{ border: '1px solid #ccc', borderRadius: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ p: 1, borderBottom: '1px solid #ccc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#fff' }}>
            <Typography variant="subtitle2" fontWeight="bold">Final SOP Result</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={handleSaveToDB}
                disabled={isSaving || !finalSOP}
                title="Save SOP"
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
              <Button
                size="small"
                variant="contained"
                color="success"
                startIcon={generatingPDF ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
                onClick={handleGeneratePDF}
                disabled={generatingPDF || !finalSOP}
                sx={{ fontSize: '0.75rem', py: 0.5 }}
              >
                Generate PDF
              </Button>
              <IconButton size="small" onClick={() => handleCopyContent(finalSOP, 'Final SOP')} disabled={!finalSOP}>
                <CopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Box sx={{ p: 1, bgcolor: '#fafafa' }}>
            <textarea
              value={finalSOP}
              readOnly
              placeholder="Final generated SOP result..."
              style={{
                width: '100%',
                height: '150px',
                resize: 'vertical',
                overflow: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                outline: 'none',
                fontSize: '0.85rem',
                padding: '8px',
                boxSizing: 'border-box',
                backgroundColor: '#fff',
              }}
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

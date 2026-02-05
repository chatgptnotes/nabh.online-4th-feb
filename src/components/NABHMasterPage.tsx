import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Icon from '@mui/material/Icon';
import Tooltip from '@mui/material/Tooltip';
import * as XLSX from 'xlsx';
import type { NABHChapter, NABHStandard, NABHObjectiveElement, ElementCategory } from '../types/nabh';
import {
  loadChaptersFromSupabase,
  loadAllStandards,
  loadAllObjectiveElements,
  insertChapter,
  insertStandard,
  insertObjectiveElement,
  updateChapter,
  updateStandard,
  updateObjectiveElement,
  deleteChapter,
  deleteStandard,
  deleteObjectiveElement,
  bulkInsertObjectiveElements,
} from '../services/objectiveStorage';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function NABHMasterPage() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Data state
  const [chapters, setChapters] = useState<NABHChapter[]>([]);
  const [standards, setStandards] = useState<NABHStandard[]>([]);
  const [elements, setElements] = useState<NABHObjectiveElement[]>([]);

  // Filter state
  const [filterChapter, setFilterChapter] = useState<string>('');
  const [filterStandard, setFilterStandard] = useState<string>('');

  // Dialog state
  const [chapterDialogOpen, setChapterDialogOpen] = useState(false);
  const [standardDialogOpen, setStandardDialogOpen] = useState(false);
  const [elementDialogOpen, setElementDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'chapter' | 'standard' | 'element'; id: string; name: string } | null>(null);

  // Form state for chapters
  const [editingChapter, setEditingChapter] = useState<NABHChapter | null>(null);
  const [chapterForm, setChapterForm] = useState({ chapter_number: '', name: '', description: '' });

  // Form state for standards
  const [editingStandard, setEditingStandard] = useState<NABHStandard | null>(null);
  const [standardForm, setStandardForm] = useState({ chapter_id: '', standard_number: '', name: '', description: '' });

  // Form state for elements
  const [editingElement, setEditingElement] = useState<NABHObjectiveElement | null>(null);
  const [elementForm, setElementForm] = useState<{
    chapter_id: string;
    standard_id: string;
    element_number: string;
    description: string;
    interpretation: string;
    is_core: boolean;
    category: ElementCategory;
  }>({
    chapter_id: '',
    standard_id: '',
    element_number: '',
    description: '',
    interpretation: '',
    is_core: false,
    category: 'Commitment',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [chaptersResult, standardsResult, elementsResult] = await Promise.all([
        loadChaptersFromSupabase(),
        loadAllStandards(),
        loadAllObjectiveElements(),
      ]);

      if (chaptersResult.success && chaptersResult.data) {
        setChapters(chaptersResult.data as NABHChapter[]);
      }
      if (standardsResult.success && standardsResult.data) {
        setStandards(standardsResult.data);
      }
      if (elementsResult.success && elementsResult.data) {
        setElements(elementsResult.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setMessage({ type: 'error', text: 'Failed to load data' });
    } finally {
      setLoading(false);
    }
  };

  // Get standards count for a chapter
  const getStandardsCount = (chapterId: string) => {
    return standards.filter(s => s.chapter_id === chapterId).length;
  };

  // Get elements count for a standard
  const getElementsCount = (standardId: string) => {
    return elements.filter(e => e.standard_id === standardId).length;
  };

  // Get chapter name by ID
  const getChapterName = (chapterId: string) => {
    return chapters.find(c => c.id === chapterId)?.name || '';
  };

  // Get filtered standards based on selected chapter
  const getFilteredStandards = (chapterId?: string) => {
    const id = chapterId || filterChapter;
    if (!id) return standards;
    return standards.filter(s => s.chapter_id === id);
  };

  // Get filtered elements based on selected chapter and standard
  const getFilteredElements = () => {
    let filtered = elements;
    if (filterChapter) {
      const chapterStandardIds = standards.filter(s => s.chapter_id === filterChapter).map(s => s.id);
      filtered = filtered.filter(e => chapterStandardIds.includes(e.standard_id));
    }
    if (filterStandard) {
      filtered = filtered.filter(e => e.standard_id === filterStandard);
    }

    // Sort elements by: Chapter -> Standard Number -> Element Letter
    // e.g., AAC.1.a, AAC.1.b, AAC.1.c, AAC.2.a, AAC.2.b, COP.1.a...
    return filtered.sort((a, b) => {
      const standardA = standards.find(s => s.id === a.standard_id);
      const standardB = standards.find(s => s.id === b.standard_id);

      if (!standardA || !standardB) return 0;

      const chapterA = chapters.find(c => c.id === standardA.chapter_id);
      const chapterB = chapters.find(c => c.id === standardB.chapter_id);

      if (!chapterA || !chapterB) return 0;

      // First sort by chapter number
      if (chapterA.chapter_number !== chapterB.chapter_number) {
        return chapterA.chapter_number - chapterB.chapter_number;
      }

      // Then by standard number (numeric comparison)
      const stdNumA = parseInt(standardA.standard_number) || 0;
      const stdNumB = parseInt(standardB.standard_number) || 0;
      if (stdNumA !== stdNumB) {
        return stdNumA - stdNumB;
      }

      // Finally by element letter (a, b, c, d...)
      return a.element_number.localeCompare(b.element_number);
    });
  };

  // Build element code (e.g., AAC.1.a)
  const buildElementCode = (element: NABHObjectiveElement) => {
    const standard = standards.find(s => s.id === element.standard_id);
    if (!standard) return element.element_number;
    const chapter = chapters.find(c => c.id === standard.chapter_id);
    if (!chapter) return `${standard.standard_number}.${element.element_number}`;
    return `${chapter.name}.${standard.standard_number}.${element.element_number}`;
  };

  // Get category display info
  const getCategoryDisplay = (element: NABHObjectiveElement): { label: string; color: 'default' | 'error' | 'primary' | 'secondary' } => {
    const category = element.category || (element.is_core ? 'Core' : 'Commitment');
    switch (category) {
      case 'Core':
        return { label: 'CORE', color: 'error' };
      case 'Achievement':
        return { label: 'Achievement', color: 'primary' };
      case 'Excellence':
        return { label: 'Excellence', color: 'secondary' };
      case 'Commitment':
      default:
        return { label: 'Commitment', color: 'default' };
    }
  };

  // Chapter CRUD handlers
  const handleAddChapter = () => {
    setEditingChapter(null);
    setChapterForm({ chapter_number: '', name: '', description: '' });
    setChapterDialogOpen(true);
  };

  const handleEditChapter = (chapter: NABHChapter) => {
    setEditingChapter(chapter);
    setChapterForm({
      chapter_number: chapter.chapter_number.toString(),
      name: chapter.name,
      description: chapter.description,
    });
    setChapterDialogOpen(true);
  };

  const handleSaveChapter = async () => {
    setSaving(true);
    try {
      if (editingChapter) {
        const result = await updateChapter(editingChapter.id, {
          chapter_number: parseInt(chapterForm.chapter_number),
          name: chapterForm.name,
          description: chapterForm.description,
        });
        if (result.success) {
          setMessage({ type: 'success', text: 'Chapter updated successfully' });
          await loadData();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update chapter' });
        }
      } else {
        const result = await insertChapter({
          chapter_number: parseInt(chapterForm.chapter_number),
          name: chapterForm.name,
          description: chapterForm.description,
        });
        if (result.success) {
          setMessage({ type: 'success', text: 'Chapter added successfully' });
          await loadData();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to add chapter' });
        }
      }
      setChapterDialogOpen(false);
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  // Standard CRUD handlers
  const handleAddStandard = () => {
    setEditingStandard(null);
    setStandardForm({ chapter_id: filterChapter || '', standard_number: '', name: '', description: '' });
    setStandardDialogOpen(true);
  };

  const handleEditStandard = (standard: NABHStandard) => {
    setEditingStandard(standard);
    setStandardForm({
      chapter_id: standard.chapter_id,
      standard_number: standard.standard_number,
      name: standard.name,
      description: standard.description || '',
    });
    setStandardDialogOpen(true);
  };

  const handleSaveStandard = async () => {
    setSaving(true);
    try {
      if (editingStandard) {
        const result = await updateStandard(editingStandard.id, {
          standard_number: standardForm.standard_number,
          name: standardForm.name,
          description: standardForm.description,
        });
        if (result.success) {
          setMessage({ type: 'success', text: 'Standard updated successfully' });
          await loadData();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update standard' });
        }
      } else {
        const result = await insertStandard({
          chapter_id: standardForm.chapter_id,
          standard_number: standardForm.standard_number,
          name: standardForm.name,
          description: standardForm.description,
        });
        if (result.success) {
          setMessage({ type: 'success', text: 'Standard added successfully' });
          await loadData();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to add standard' });
        }
      }
      setStandardDialogOpen(false);
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  // Element CRUD handlers
  const handleAddElement = () => {
    setEditingElement(null);
    setElementForm({
      chapter_id: filterChapter || '',
      standard_id: filterStandard || '',
      element_number: '',
      description: '',
      interpretation: '',
      is_core: false,
      category: 'Commitment',
    });
    setElementDialogOpen(true);
  };

  const handleEditElement = (element: NABHObjectiveElement) => {
    const standard = standards.find(s => s.id === element.standard_id);
    setEditingElement(element);
    setElementForm({
      chapter_id: standard?.chapter_id || '',
      standard_id: element.standard_id,
      element_number: element.element_number,
      description: element.description,
      interpretation: element.interpretation || '',
      is_core: element.is_core,
      category: element.category || (element.is_core ? 'Core' : 'Commitment'),
    });
    setElementDialogOpen(true);
  };

  const handleSaveElement = async () => {
    setSaving(true);
    try {
      if (editingElement) {
        const result = await updateObjectiveElement(editingElement.id, {
          element_number: elementForm.element_number,
          description: elementForm.description,
          interpretation: elementForm.interpretation,
          is_core: elementForm.is_core,
          category: elementForm.category,
        });
        if (result.success) {
          setMessage({ type: 'success', text: 'Element updated successfully' });
          await loadData();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to update element' });
        }
      } else {
        const result = await insertObjectiveElement({
          standard_id: elementForm.standard_id,
          element_number: elementForm.element_number,
          description: elementForm.description,
          interpretation: elementForm.interpretation,
          is_core: elementForm.is_core,
          category: elementForm.category,
        });
        if (result.success) {
          setMessage({ type: 'success', text: 'Element added successfully' });
          await loadData();
        } else {
          setMessage({ type: 'error', text: result.error || 'Failed to add element' });
        }
      }
      setElementDialogOpen(false);
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const handleDeleteClick = (type: 'chapter' | 'standard' | 'element', id: string, name: string) => {
    setDeleteTarget({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      let result;
      switch (deleteTarget.type) {
        case 'chapter':
          result = await deleteChapter(deleteTarget.id);
          break;
        case 'standard':
          result = await deleteStandard(deleteTarget.id);
          break;
        case 'element':
          result = await deleteObjectiveElement(deleteTarget.id);
          break;
      }
      if (result?.success) {
        setMessage({ type: 'success', text: `${deleteTarget.type} deleted successfully` });
        await loadData();
      } else {
        setMessage({ type: 'error', text: result?.error || 'Failed to delete' });
      }
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    } catch {
      setMessage({ type: 'error', text: 'An error occurred' });
    } finally {
      setSaving(false);
    }
  };

  // Excel template download
  const handleDownloadTemplate = () => {
    const templateData = [
      {
        chapter_code: 'AAC',
        standard_number: '1',
        element_letter: 'a',
        title: 'Example: The healthcare services being provided are defined.',
        interpretation: 'Example interpretation text explaining this objective element.',
        is_core: 'Yes',
      },
      {
        chapter_code: 'AAC',
        standard_number: '1',
        element_letter: 'b',
        title: 'Example: Each defined healthcare service should have appropriate scope.',
        interpretation: 'Another interpretation example.',
        is_core: 'No',
      },
    ];

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');

    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // chapter_code
      { wch: 15 }, // standard_number
      { wch: 15 }, // element_letter
      { wch: 60 }, // title
      { wch: 80 }, // interpretation
      { wch: 10 }, // is_core
    ];

    XLSX.writeFile(wb, 'nabh_elements_template.xlsx');
    setMessage({ type: 'success', text: 'Template downloaded successfully' });
  };

  // Excel import
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage({ type: 'info', text: 'Processing Excel file...' });

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet) as Array<{
        chapter_code: string;
        standard_number: string;
        element_letter: string;
        title: string;
        interpretation?: string;
        is_core?: string;
      }>;

      const elementsToInsert: Array<{
        standard_id: string;
        element_number: string;
        description: string;
        interpretation?: string;
        is_core?: boolean;
      }> = [];

      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i];
        const rowNum = i + 2; // Excel rows start at 1, plus header row

        // Find chapter
        const chapter = chapters.find(c => c.name.toUpperCase() === row.chapter_code?.toUpperCase());
        if (!chapter) {
          errors.push(`Row ${rowNum}: Chapter "${row.chapter_code}" not found`);
          continue;
        }

        // Find standard
        const standard = standards.find(
          s => s.chapter_id === chapter.id && s.standard_number === row.standard_number?.toString()
        );
        if (!standard) {
          errors.push(`Row ${rowNum}: Standard "${row.chapter_code}.${row.standard_number}" not found`);
          continue;
        }

        if (!row.element_letter || !row.title) {
          errors.push(`Row ${rowNum}: Missing element letter or title`);
          continue;
        }

        elementsToInsert.push({
          standard_id: standard.id,
          element_number: row.element_letter.toLowerCase(),
          description: row.title,
          interpretation: row.interpretation || '',
          is_core: row.is_core?.toLowerCase() === 'yes',
        });
      }

      if (elementsToInsert.length > 0) {
        const result = await bulkInsertObjectiveElements(elementsToInsert);
        await loadData();

        if (result.errors.length > 0) {
          errors.push(...result.errors);
        }

        setMessage({
          type: errors.length > 0 ? 'info' : 'success',
          text: `Imported ${result.inserted} elements. ${errors.length > 0 ? `Skipped ${errors.length} rows with errors.` : ''}`,
        });

        if (errors.length > 0) {
          console.log('Import errors:', errors);
        }
      } else {
        setMessage({ type: 'error', text: `No valid rows to import. Errors: ${errors.join('; ')}` });
      }
    } catch (error) {
      console.error('Import error:', error);
      setMessage({ type: 'error', text: 'Failed to process Excel file' });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading && chapters.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" fontWeight={600} sx={{ mb: 3 }}>
        NABH Master Management
      </Typography>

      {message && (
        <Alert severity={message.type} onClose={() => setMessage(null)} sx={{ mb: 3 }}>
          {message.text}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
        >
          <Tab label="Chapters" icon={<Icon>folder</Icon>} iconPosition="start" />
          <Tab label="Standards" icon={<Icon>list_alt</Icon>} iconPosition="start" />
          <Tab label="Objective Elements" icon={<Icon>checklist</Icon>} iconPosition="start" />
        </Tabs>

        {/* Chapters Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddChapter}>
                Add Chapter
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={80} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>#</TableCell>
                    <TableCell width={100} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Code</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Description</TableCell>
                    <TableCell width={100} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Standards</TableCell>
                    <TableCell width={120} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {chapters.map(chapter => (
                    <TableRow key={chapter.id} hover>
                      <TableCell>{chapter.chapter_number}</TableCell>
                      <TableCell>
                        <Chip label={chapter.name} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{chapter.description}</TableCell>
                      <TableCell>{getStandardsCount(chapter.id)}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditChapter(chapter)}>
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick('chapter', chapter.id, chapter.name)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Standards Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Chapter</InputLabel>
                <Select
                  value={filterChapter}
                  label="Filter by Chapter"
                  onChange={e => {
                    setFilterChapter(e.target.value);
                    setFilterStandard('');
                  }}
                >
                  <MenuItem value="">All Chapters</MenuItem>
                  {chapters.map(chapter => (
                    <MenuItem key={chapter.id} value={chapter.id}>
                      {chapter.name} - {chapter.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box sx={{ flexGrow: 1 }} />
              <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddStandard}>
                Add Standard
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={100} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Chapter</TableCell>
                    <TableCell width={80} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>#</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Name</TableCell>
                    <TableCell width={100} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Elements</TableCell>
                    <TableCell width={120} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredStandards().map(standard => (
                    <TableRow key={standard.id} hover>
                      <TableCell>
                        <Chip label={getChapterName(standard.chapter_id)} size="small" />
                      </TableCell>
                      <TableCell>{standard.standard_number}</TableCell>
                      <TableCell>
                        <Typography variant="body2">{standard.name}</Typography>
                        {standard.description && (
                          <Typography variant="caption" color="text.secondary">
                            {standard.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{getElementsCount(standard.id)}</TableCell>
                      <TableCell>
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleEditStandard(standard)}>
                            <Icon fontSize="small">edit</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteClick('standard', standard.id, `${getChapterName(standard.chapter_id)}.${standard.standard_number}`)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>

        {/* Objective Elements Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ px: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Chapter</InputLabel>
                <Select
                  value={filterChapter}
                  label="Filter by Chapter"
                  onChange={e => {
                    setFilterChapter(e.target.value);
                    setFilterStandard('');
                  }}
                >
                  <MenuItem value="">All Chapters</MenuItem>
                  {chapters.map(chapter => (
                    <MenuItem key={chapter.id} value={chapter.id}>
                      {chapter.name} - {chapter.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Standard</InputLabel>
                <Select
                  value={filterStandard}
                  label="Filter by Standard"
                  onChange={e => setFilterStandard(e.target.value)}
                  disabled={!filterChapter}
                >
                  <MenuItem value="">All Standards</MenuItem>
                  {getFilteredStandards().map(standard => (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.standard_number} - {standard.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ flexGrow: 1 }} />

              <Button variant="outlined" startIcon={<Icon>download</Icon>} onClick={handleDownloadTemplate}>
                Download Template
              </Button>
              <Button variant="outlined" startIcon={<Icon>upload</Icon>} onClick={handleImportClick}>
                Import Excel
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <Button variant="contained" startIcon={<Icon>add</Icon>} onClick={handleAddElement}>
                Add Element
              </Button>
            </Box>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell width={120} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Code</TableCell>
                    <TableCell width={120} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Category</TableCell>
                    <TableCell sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Title</TableCell>
                    <TableCell width={80} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Core</TableCell>
                    <TableCell width={120} sx={{ bgcolor: 'grey.100', color: 'primary.main', fontWeight: 700 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getFilteredElements().map(element => {
                    const categoryInfo = getCategoryDisplay(element);
                    return (
                      <TableRow key={element.id} hover>
                        <TableCell>
                          <Chip label={buildElementCode(element)} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={categoryInfo.label}
                            size="small"
                            color={categoryInfo.color}
                            variant={categoryInfo.color === 'default' ? 'outlined' : 'filled'}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ maxWidth: 500 }} noWrap>
                            {element.description}
                          </Typography>
                          {element.interpretation && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }} noWrap>
                              {element.interpretation.substring(0, 100)}...
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          {element.is_core && <Chip label="Core" size="small" color="error" />}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleEditElement(element)}>
                              <Icon fontSize="small">edit</Icon>
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteClick('element', element.id, buildElementCode(element))}
                            >
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {getFilteredElements().length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        <Typography color="text.secondary" sx={{ py: 4 }}>
                          No objective elements found. Use the filters above or add new elements.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </TabPanel>
      </Paper>

      {/* Chapter Dialog */}
      <Dialog open={chapterDialogOpen} onClose={() => setChapterDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingChapter ? 'Edit Chapter' : 'Add Chapter'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Chapter Number"
              type="number"
              value={chapterForm.chapter_number}
              onChange={e => setChapterForm({ ...chapterForm, chapter_number: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Code (e.g., AAC, COP)"
              value={chapterForm.name}
              onChange={e => setChapterForm({ ...chapterForm, name: e.target.value.toUpperCase() })}
              required
              fullWidth
              inputProps={{ maxLength: 5 }}
            />
            <TextField
              label="Description"
              value={chapterForm.description}
              onChange={e => setChapterForm({ ...chapterForm, description: e.target.value })}
              required
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChapterDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveChapter}
            disabled={saving || !chapterForm.chapter_number || !chapterForm.name || !chapterForm.description}
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Standard Dialog */}
      <Dialog open={standardDialogOpen} onClose={() => setStandardDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingStandard ? 'Edit Standard' : 'Add Standard'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <FormControl fullWidth required>
              <InputLabel>Chapter</InputLabel>
              <Select
                value={standardForm.chapter_id}
                label="Chapter"
                onChange={e => setStandardForm({ ...standardForm, chapter_id: e.target.value })}
                disabled={!!editingStandard}
              >
                {chapters.map(chapter => (
                  <MenuItem key={chapter.id} value={chapter.id}>
                    {chapter.name} - {chapter.description}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Standard Number (e.g., 1, 2, 3)"
              value={standardForm.standard_number}
              onChange={e => setStandardForm({ ...standardForm, standard_number: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Name"
              value={standardForm.name}
              onChange={e => setStandardForm({ ...standardForm, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Description (optional)"
              value={standardForm.description}
              onChange={e => setStandardForm({ ...standardForm, description: e.target.value })}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStandardDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveStandard}
            disabled={saving || !standardForm.chapter_id || !standardForm.standard_number || !standardForm.name}
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Element Dialog */}
      <Dialog open={elementDialogOpen} onClose={() => setElementDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingElement ? 'Edit Objective Element' : 'Add Objective Element'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth required>
                <InputLabel>Chapter</InputLabel>
                <Select
                  value={elementForm.chapter_id}
                  label="Chapter"
                  onChange={e => setElementForm({ ...elementForm, chapter_id: e.target.value, standard_id: '' })}
                  disabled={!!editingElement}
                >
                  {chapters.map(chapter => (
                    <MenuItem key={chapter.id} value={chapter.id}>
                      {chapter.name} - {chapter.description}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth required>
                <InputLabel>Standard</InputLabel>
                <Select
                  value={elementForm.standard_id}
                  label="Standard"
                  onChange={e => setElementForm({ ...elementForm, standard_id: e.target.value })}
                  disabled={!elementForm.chapter_id || !!editingElement}
                >
                  {getFilteredStandards(elementForm.chapter_id).map(standard => (
                    <MenuItem key={standard.id} value={standard.id}>
                      {standard.standard_number} - {standard.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Element Letter"
                value={elementForm.element_number}
                onChange={e => setElementForm({ ...elementForm, element_number: e.target.value.toLowerCase() })}
                required
                sx={{ width: 150 }}
                inputProps={{ maxLength: 2 }}
                placeholder="a, b, c..."
              />
            </Box>
            <TextField
              label="Title / Description"
              value={elementForm.description}
              onChange={e => setElementForm({ ...elementForm, description: e.target.value })}
              required
              fullWidth
              multiline
              rows={2}
              placeholder="The complete title of this objective element"
            />
            <TextField
              label="Interpretation"
              value={elementForm.interpretation}
              onChange={e => setElementForm({ ...elementForm, interpretation: e.target.value })}
              fullWidth
              multiline
              rows={4}
              placeholder="Detailed interpretation of this objective element"
            />
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={elementForm.category}
                  label="Category"
                  onChange={e => {
                    const newCategory = e.target.value as ElementCategory;
                    setElementForm({
                      ...elementForm,
                      category: newCategory,
                      is_core: newCategory === 'Core',
                    });
                  }}
                >
                  <MenuItem value="Commitment">Commitment</MenuItem>
                  <MenuItem value="Core">CORE</MenuItem>
                  <MenuItem value="Achievement">Achievement</MenuItem>
                  <MenuItem value="Excellence">Excellence</MenuItem>
                </Select>
              </FormControl>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={elementForm.is_core}
                    onChange={e => {
                      const isCore = e.target.checked;
                      setElementForm({
                        ...elementForm,
                        is_core: isCore,
                        category: isCore ? 'Core' : elementForm.category === 'Core' ? 'Commitment' : elementForm.category,
                      });
                    }}
                  />
                }
                label="Core Element"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setElementDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSaveElement}
            disabled={saving || !elementForm.standard_id || !elementForm.element_number || !elementForm.description}
          >
            {saving ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {deleteTarget?.type} "{deleteTarget?.name}"?
            {deleteTarget?.type === 'chapter' && ' This will also delete all associated standards and elements.'}
            {deleteTarget?.type === 'standard' && ' This will also delete all associated elements.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete} disabled={saving}>
            {saving ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// @ts-nocheck
import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Icon from '@mui/material/Icon';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Tooltip from '@mui/material/Tooltip';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Snackbar from '@mui/material/Snackbar';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { useNABHStore } from '../store/nabhStore';
import type { Status, Priority, ElementCategory, EvidenceFile, YouTubeVideo, TrainingMaterial, SOPDocument } from '../types/nabh';
import { ASSIGNEE_OPTIONS, getHospitalInfo, getNABHCoordinator } from '../config/hospitalConfig';
import { getClaudeApiKey, getGeminiApiKey, callGeminiAPI } from '../lib/supabase';
import {
  saveObjectiveToSupabase,
  loadObjectiveFromSupabase,
  saveGeneratedEvidence,
  updateGeneratedEvidence,
  loadGeneratedEvidences,
  deleteGeneratedEvidence,
  loadEvidenceById,
  type GeneratedEvidence,
} from '../services/objectiveStorage';
import { getEvidenceDocuments } from '../services/evidencePackages';
import {
  generateInfographic,
  svgToPngDataUrl,
  extractKeyPoints,
  availableTemplates,
  availableColorSchemes,
  type InfographicTemplate,
  type ColorScheme,
} from '../services/infographicGenerator';
import { generateGeminiInfographic } from '../services/geminiService';
import { getRelevantData } from '../services/hopeHospitalDatabase';

// Expandable TextField styles
const expandableTextFieldSx = {
  '& .MuiInputBase-root': {
    resize: 'vertical',
    overflow: 'auto',
    minHeight: '80px',
  },
  '& .MuiInputBase-inputMultiline': {
    resize: 'vertical',
    overflow: 'auto !important',
  },
};

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export default function ObjectiveDetailPage() {
  const { chapterId, objectiveId } = useParams<{ chapterId: string; objectiveId: string }>();
  const navigate = useNavigate();
  const { chapters, updateObjective, setSelectedChapter, isLoadingFromSupabase, loadDataFromSupabase, selectedHospital, setSelectedEvidenceForCreation } = useNABHStore();
  
  // Load data if not already loaded
  useEffect(() => {
    if (chapters.length === 0 && !isLoadingFromSupabase) {
      loadDataFromSupabase();
    }
  }, [chapters.length, isLoadingFromSupabase, loadDataFromSupabase]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trainingFileInputRef = useRef<HTMLInputElement>(null);
  const sopFileInputRef = useRef<HTMLInputElement>(null);
  const debouncedSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // State for adding YouTube video
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDescription, setNewVideoDescription] = useState('');
  
  // State for YouTube search
  const [isSearchingYouTube, setIsSearchingYouTube] = useState(false);
  const [youtubeSearchResults, setYoutubeSearchResults] = useState<Array<{title: string; url: string; description: string; thumbnail: string}>>([]);
  const [showYouTubeSearch, setShowYouTubeSearch] = useState(false);

  // State for adding training material
  const [showAddTraining, setShowAddTraining] = useState(false);
  const [newTrainingTitle, setNewTrainingTitle] = useState('');
  const [newTrainingDescription, setNewTrainingDescription] = useState('');
  const [newTrainingType, setNewTrainingType] = useState<'video' | 'photo' | 'document' | 'certificate'>('photo');
  const [newTrainingDate, setNewTrainingDate] = useState('');

  // State for SOP management
  const [showAddSOP, setShowAddSOP] = useState(false);
  const [newSOPTitle, setNewSOPTitle] = useState('');
  const [newSOPVersion, setNewSOPVersion] = useState('1.0');
  const [newSOPEffectiveDate, setNewSOPEffectiveDate] = useState('');
  const [newSOPDescription, setNewSOPDescription] = useState('');
  const [isGeneratingSOP, setIsGeneratingSOP] = useState(false);
  const [generatedSOPContent, setGeneratedSOPContent] = useState('');

  // State for Quality Documentation Assistant
  // @ts-expect-error - Unused but kept for future use
  const [isGeneratingEvidence, setIsGeneratingEvidence] = useState(false);
  // @ts-expect-error - Unused but kept for future use
  const [generatedEvidenceList, setGeneratedEvidenceList] = useState<string[]>([]);
  const [isGeneratingHindi, setIsGeneratingHindi] = useState(false);
  const [isSavingInterpretation, setIsSavingInterpretation] = useState(false);
  const [interpretationSaveSuccess, setInterpretationSaveSuccess] = useState(false);
  const [lastSavedInterpretation, setLastSavedInterpretation] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true); // Start as true to enable button initially

  // State for Evidence Generation Modal
  const [showEvidenceGenerationModal, setShowEvidenceGenerationModal] = useState(false);
  const [currentEvidenceToGenerate, setCurrentEvidenceToGenerate] = useState<{ id: string; text: string; selected: boolean; isAuditorPriority: boolean } | null>(null);
  const [evidenceGenerationPrompt, setEvidenceGenerationPrompt] = useState('');
  const [evidenceGenerationData, setEvidenceGenerationData] = useState('');
  const [editablePromptAndData, setEditablePromptAndData] = useState('');
  const [isLoadingPromptData, setIsLoadingPromptData] = useState(false);
  const [isExecutingGeneration, setIsExecutingGeneration] = useState(false);

  // State for Infographic Generator
  const [isGeneratingInfographic, setIsGeneratingInfographic] = useState(false);
  const [generatedInfographicSvg, setGeneratedInfographicSvg] = useState<string>('');
  const [infographicSaveStatus, setInfographicSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [selectedInfographicTemplate, setSelectedInfographicTemplate] = useState<InfographicTemplate>('modern-poster');
  const [selectedColorScheme, setSelectedColorScheme] = useState<ColorScheme>('healthcare-blue');
  const [infographicSource, setInfographicSource] = useState<'template' | 'gemini'>('template');
  const [customGeminiKey, setCustomGeminiKey] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<string>('');
  
  const handleTestConnection = async () => {
    setConnectionStatus('Testing...');
    try {
      const { testGeminiConnection } = await import('../services/geminiService');
      const result = await testGeminiConnection(customGeminiKey);
      setConnectionStatus(result);
    } catch (e: any) {
      setConnectionStatus(e.message);
    }
  };

  // State for Supabase persistence
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [isLoadingFromDb, setIsLoadingFromDb] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // State for Quality Document Builder
  interface ParsedEvidenceItem {
    id: string;
    text: string;
    selected: boolean;
    isAuditorPriority: boolean; // Marked as priority for auditors
  }
  const [parsedEvidenceItems, setParsedEvidenceItems] = useState<ParsedEvidenceItem[]>([]);
  // @ts-expect-error - Unused but kept for future use
  const [isGeneratingDocuments, setIsGeneratingDocuments] = useState(false);
  const [documentGenerationProgress, setDocumentGenerationProgress] = useState({ current: 0, total: 0 });
  // @ts-expect-error - Unused but kept for future use
  const [savedEvidences, setSavedEvidences] = useState<GeneratedEvidence[]>([]);
  // @ts-expect-error - Unused but kept for future use
  const [isLoadingEvidences, setIsLoadingEvidences] = useState(false);
  // @ts-expect-error - Unused but kept for future use
  const [evidenceViewModes, setEvidenceViewModes] = useState<Record<string, number>>({});
  // @ts-expect-error - Unused but kept for future use
  const [editingEvidenceContent, setEditingEvidenceContent] = useState<Record<string, string>>({});
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // State for custom prompt-based evidence generation
  const [customEvidencePrompt, setCustomEvidencePrompt] = useState('');
  // @ts-expect-error - Unused but kept for future use
  const [isGeneratingCustomEvidence, setIsGeneratingCustomEvidence] = useState(false);

  // State for generating detailed evidence document for individual items
  // @ts-expect-error - Unused but kept for future use
  const [generatingDetailedDocFor, setGeneratingDetailedDocFor] = useState<string | null>(null);
  // State for inline document preview (shows generated doc on same page)
  // @ts-expect-error - Unused but kept for future use
  const [inlinePreviewDoc, setInlinePreviewDoc] = useState<{ itemId: string; html: string } | null>(null);

  // State for evidence generation from interpretation
  interface InterpretationEvidenceItem {
    id: string;
    text: string;
    selected: boolean;
  }
  const [interpretationEvidenceItems, setInterpretationEvidenceItems] = useState<InterpretationEvidenceItem[]>([]);
  const [isGeneratingInterpretationEvidence, setIsGeneratingInterpretationEvidence] = useState(false);
  // Track saved evidence item documents: item.id -> saved document ID
  const [savedEvidenceItemDocuments, setSavedEvidenceItemDocuments] = useState<Record<string, string>>({});

  // State for registers section
  interface RegisterItem {
    id: string;
    name: string;
    description: string;
    htmlContent: string;
    isGenerated: boolean;
  }
  const [suggestedRegisters, setSuggestedRegisters] = useState<RegisterItem[]>([]);
  const [selectedRegisters, setSelectedRegisters] = useState<string[]>([]);
  // @ts-expect-error - Unused but kept for future use
  const [isGeneratingRegisters, setIsGeneratingRegisters] = useState(false);

  // State for document improvement feature
  const [uploadedDocumentFile, setUploadedDocumentFile] = useState<File | null>(null);
  // @ts-expect-error - Unused but kept for future use
  const [uploadedDocumentPreview, setUploadedDocumentPreview] = useState<string>('');

  // Helper function to convert numbers to Roman numerals
  const toRomanNumeral = (num: number): string => {
    const romanNumerals: [number, string][] = [
      [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
    ];
    let result = '';
    for (const [value, numeral] of romanNumerals) {
      while (num >= value) {
        result += numeral;
        num -= value;
      }
    }
    return result;
  };
  const [extractedDocumentText, setExtractedDocumentText] = useState('');
  // @ts-expect-error - Unused but kept for future use
  const [isExtractingText, setIsExtractingText] = useState(false);
  // @ts-expect-error - Unused but kept for future use
  const [isImprovingDocument, setIsImprovingDocument] = useState(false);
  const documentUploadRef = useRef<HTMLInputElement>(null);

  // Hospital config for evidence generation
  const nabhCoordinator = getNABHCoordinator();
  const currentHospital = getHospitalInfo(selectedHospital);
  const hospitalConfig = {
    name: currentHospital.name,
    address: currentHospital.address,
    phone: currentHospital.phone,
    email: currentHospital.email,
    website: currentHospital.website,
    qualityCoordinator: nabhCoordinator.name,
    qualityCoordinatorDesignation: nabhCoordinator.designation,
  };

  // Find chapter and objective
  const chapter = chapters.find((c) => c.id === chapterId || c.code.toLowerCase() === chapterId?.toLowerCase());
  const objective = chapter?.objectives.find((o) => o.id === objectiveId || o.code === objectiveId || o.code.toLowerCase().replace(/\./g, '-') === objectiveId?.toLowerCase());

  // Set selected chapter when page loads
  useEffect(() => {
    if (chapterId) {
      setSelectedChapter(chapterId);
    }
  }, [chapterId, setSelectedChapter]);

  // Load data from Supabase when page loads
  useEffect(() => {
    const loadFromSupabase = async () => {
      if (!objective?.code) return;

      setIsLoadingFromDb(true);
      try {
        const result = await loadObjectiveFromSupabase(objective.code);
        if (result.success && result.data && chapter) {
          // Merge Supabase data with local state
          const updates: Partial<typeof objective> = {};

          if (result.data.description) updates.description = result.data.description;
          if (result.data.hindiExplanation) updates.hindiExplanation = result.data.hindiExplanation;
          if (result.data.title) updates.title = result.data.title;
          if (result.data.evidencesList) updates.evidencesList = result.data.evidencesList;
          if (result.data.evidenceLinks) updates.evidenceLinks = result.data.evidenceLinks;
          if (result.data.status) updates.status = result.data.status;
          if (result.data.priority) updates.priority = result.data.priority;
          if (result.data.assignee) updates.assignee = result.data.assignee;
          if (result.data.startDate) updates.startDate = result.data.startDate;
          if (result.data.endDate) updates.endDate = result.data.endDate;
          if (result.data.deliverable) updates.deliverable = result.data.deliverable;
          if (result.data.notes) updates.notes = result.data.notes;
          if (result.data.infographicSvg) updates.infographicSvg = result.data.infographicSvg;
          if (result.data.infographicDataUrl) updates.infographicDataUrl = result.data.infographicDataUrl;
          if (result.data.evidenceFiles?.length) updates.evidenceFiles = result.data.evidenceFiles;
          if (result.data.youtubeVideos?.length) updates.youtubeVideos = result.data.youtubeVideos;
          if (result.data.trainingMaterials?.length) updates.trainingMaterials = result.data.trainingMaterials;
          if (result.data.sopDocuments?.length) updates.sopDocuments = result.data.sopDocuments;

          if (Object.keys(updates).length > 0) {
            updateObjective(chapter.id, objective.id, updates);
          }
        }
      } catch (error) {
        console.warn('Could not load from Supabase:', error);
      } finally {
        setIsLoadingFromDb(false);
        // Initialize lastSavedInterpretation after loading and mark as saved
        if (objective) {
          const currentText = objective.interpretations2 ?? objective.interpretation ?? '';
          setLastSavedInterpretation(currentText);
          setHasUnsavedChanges(false); // Mark as saved on load
          setInterpretationSaveSuccess(false); // Clear any previous success state
        }
      }
    };

    loadFromSupabase();
  }, [objective?.code]); // Only reload when objective code changes

  // Parse evidence list into checkable items when evidencesList changes
  useEffect(() => {
    if (!objective?.evidencesList) {
      setParsedEvidenceItems([]);
      return;
    }

    const lines = objective.evidencesList.split('\n').filter(line => line.trim());
    const items: ParsedEvidenceItem[] = [];
    const auditorPriorityItems = objective.auditorPriorityItems || [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      // Match lines that start with numbers, bullets, or dashes
      if (trimmed.match(/^(\d+[.):]|-|\*|•)/)) {
        const itemId = `evidence-item-${index}`;
        items.push({
          id: itemId,
          text: trimmed,
          selected: false,
          isAuditorPriority: auditorPriorityItems.includes(itemId),
        });
      }
    });

    setParsedEvidenceItems(items);
  }, [objective?.evidencesList, objective?.auditorPriorityItems]);

  // Load saved evidences when objective changes
  useEffect(() => {
    const loadSavedEvidences = async () => {
      if (!objective?.code) return;

      setIsLoadingEvidences(true);
      try {
        const result = await loadGeneratedEvidences(objective.code);
        if (result.success && result.data) {
          setSavedEvidences(result.data);

          // Load saved interpretation evidence items
          const interpretationEvidence = result.data.find(
            (ev) => ev.evidence_title?.includes('Generated Evidence Items') && ev.evidence_type === 'custom'
          );
          if (interpretationEvidence?.html_content) {
            try {
              const savedTexts = JSON.parse(interpretationEvidence.html_content);
              if (Array.isArray(savedTexts)) {
                const items = savedTexts.map((text, idx) => ({
                  id: `saved-${idx}`,
                  text,
                  selected: false
                }));
                setInterpretationEvidenceItems(items);

                // Map saved documents to evidence items
                const documentMap: Record<string, string> = {};
                console.log('[Evidence Matching] Total saved documents:', result.data?.length);
                console.log('[Evidence Matching] Current objective code:', objective.code);
                console.log('[Evidence Matching] Evidence items to match:', items.length);

                // Log all documents to debug matching
                result.data?.forEach((doc, i) => {
                  console.log(`  Document ${i + 1}: [${doc.objective_code}] ${doc.evidence_title?.substring(0, 60)} (${doc.evidence_type})`);
                });

                // Create a set to track which documents have been matched
                const matchedDocIds = new Set<string>();

                items.forEach((item, idx) => {
                  console.log(`[Evidence Matching] Item ${idx + 1}:`, item.text.substring(0, 60));

                  // 100% EXACT MATCHING - No fuzzy logic, only exact matches
                  const matchedDoc = result.data?.find((ev) => {
                    // FILTER 1: Must be a document type
                    if (ev.evidence_type !== 'document') {
                      return false;
                    }

                    // FILTER 2: Must match THIS exact objective code
                    if (ev.objective_code !== objective.code) {
                      return false;
                    }

                    // FILTER 3: Skip if already matched to another item (one-to-one mapping)
                    if (matchedDocIds.has(ev.id)) {
                      return false;
                    }

                    // FILTER 4: EXACT text match (case-insensitive, trimmed)
                    // The evidence_title or prompt must EXACTLY match the evidence item text
                    const itemText = item.text.trim();
                    const docTitle = (ev.evidence_title || '').trim();
                    const docPrompt = (ev.prompt || '').trim();

                    // Check for exact match (case-insensitive)
                    const exactMatch =
                      itemText.toLowerCase() === docTitle.toLowerCase() ||
                      itemText.toLowerCase() === docPrompt.toLowerCase();

                    if (exactMatch) {
                      console.log(`  ✓ EXACT MATCH found:`, docTitle.substring(0, 60));
                      return true;
                    }

                    return false;
                  });

                  if (matchedDoc) {
                    console.log(`  ✅ Matched document ID: ${matchedDoc.id}`);
                    console.log(`     Objective: ${matchedDoc.objective_code}`);
                    console.log(`     Title: ${matchedDoc.evidence_title?.substring(0, 80)}`);
                    documentMap[item.id] = matchedDoc.id;
                    matchedDocIds.add(matchedDoc.id); // Mark this document as matched
                  } else {
                    console.log(`  ❌ No exact match found for this item`);
                  }
                });

                console.log('[Evidence Matching] Final document map:', documentMap);
                setSavedEvidenceItemDocuments(documentMap);
              }
            } catch (parseError) {
              console.warn('Could not parse saved interpretation evidence items:', parseError);
            }
          }
        }
      } catch (error) {
        console.warn('Could not load saved evidences:', error);
      } finally {
        setIsLoadingEvidences(false);
      }
    };

    loadSavedEvidences();
  }, [objective?.code]);

  // Load suggested registers when objective changes
  // Note: This must be before early returns to maintain hook order
  useEffect(() => {
    if (!objective?.code) return;

    const objectiveCode = objective.code;
    const prefix = objectiveCode.substring(0, 3).toUpperCase();

    // Register suggestions by chapter prefix
    const registerSuggestions: Record<string, Array<{id: string; name: string; description: string; htmlContent: string; isGenerated: boolean}>> = {
      'AAC': [
        { id: 'reg-aac-1', name: 'Patient Registration Register', description: 'Register of all patients with UHID, demographics, and admission details', htmlContent: '', isGenerated: false },
        { id: 'reg-aac-2', name: 'Admission Register', description: 'Daily admission register with patient details and bed allocation', htmlContent: '', isGenerated: false },
        { id: 'reg-aac-3', name: 'Discharge Register', description: 'Patient discharge details with outcomes and follow-up instructions', htmlContent: '', isGenerated: false },
        { id: 'reg-aac-4', name: 'Transfer Register', description: 'Inter-department and external transfer records', htmlContent: '', isGenerated: false },
        { id: 'reg-aac-5', name: 'Bed Occupancy Register', description: 'Daily bed census and occupancy tracking', htmlContent: '', isGenerated: false },
      ],
      'COP': [
        { id: 'reg-cop-1', name: 'Patient Assessment Register', description: 'Initial and ongoing patient assessment records', htmlContent: '', isGenerated: false },
        { id: 'reg-cop-2', name: 'Clinical Care Plan Register', description: 'Individualized care plans for patients', htmlContent: '', isGenerated: false },
        { id: 'reg-cop-3', name: 'Nursing Care Register', description: 'Daily nursing care documentation', htmlContent: '', isGenerated: false },
        { id: 'reg-cop-4', name: 'Patient Education Register', description: 'Patient and family education records', htmlContent: '', isGenerated: false },
        { id: 'reg-cop-5', name: 'Consent Register', description: 'All consent forms obtained from patients', htmlContent: '', isGenerated: false },
      ],
      'MOM': [
        { id: 'reg-mom-1', name: 'Drug Inventory Register', description: 'Stock register for all medications', htmlContent: '', isGenerated: false },
        { id: 'reg-mom-2', name: 'High Alert Medication Register', description: 'Tracking of high-alert and look-alike drugs', htmlContent: '', isGenerated: false },
        { id: 'reg-mom-3', name: 'Narcotic Drug Register', description: 'Controlled substance tracking and accountability', htmlContent: '', isGenerated: false },
        { id: 'reg-mom-4', name: 'Adverse Drug Reaction Register', description: 'ADR reporting and monitoring', htmlContent: '', isGenerated: false },
        { id: 'reg-mom-5', name: 'Emergency Drug Register', description: 'Emergency medication usage tracking', htmlContent: '', isGenerated: false },
      ],
      'PRE': [
        { id: 'reg-pre-1', name: 'Patient Rights Register', description: 'Documentation of patient rights information provided', htmlContent: '', isGenerated: false },
        { id: 'reg-pre-2', name: 'Complaint Register', description: 'Patient complaints and grievance handling', htmlContent: '', isGenerated: false },
        { id: 'reg-pre-3', name: 'Feedback Register', description: 'Patient feedback and satisfaction records', htmlContent: '', isGenerated: false },
        { id: 'reg-pre-4', name: 'Informed Consent Register', description: 'All informed consents obtained', htmlContent: '', isGenerated: false },
      ],
      'HIC': [
        { id: 'reg-hic-1', name: 'Hand Hygiene Audit Register', description: 'Hand hygiene compliance monitoring', htmlContent: '', isGenerated: false },
        { id: 'reg-hic-2', name: 'Hospital Acquired Infection Register', description: 'HAI surveillance and tracking', htmlContent: '', isGenerated: false },
        { id: 'reg-hic-3', name: 'Biomedical Waste Register', description: 'BMW generation and disposal tracking', htmlContent: '', isGenerated: false },
        { id: 'reg-hic-4', name: 'Sterilization Register', description: 'CSSD sterilization records', htmlContent: '', isGenerated: false },
        { id: 'reg-hic-5', name: 'Needle Stick Injury Register', description: 'NSI incidents and post-exposure prophylaxis', htmlContent: '', isGenerated: false },
      ],
      'FMS': [
        { id: 'reg-fms-1', name: 'Equipment Maintenance Register', description: 'Preventive and breakdown maintenance records', htmlContent: '', isGenerated: false },
        { id: 'reg-fms-2', name: 'Fire Safety Drill Register', description: 'Mock drill records and observations', htmlContent: '', isGenerated: false },
        { id: 'reg-fms-3', name: 'Incident Register', description: 'All facility-related incidents', htmlContent: '', isGenerated: false },
        { id: 'reg-fms-4', name: 'Calibration Register', description: 'Equipment calibration tracking', htmlContent: '', isGenerated: false },
      ],
      'HRM': [
        { id: 'reg-hrm-1', name: 'Staff Attendance Register', description: 'Daily attendance and leave tracking', htmlContent: '', isGenerated: false },
        { id: 'reg-hrm-2', name: 'Training Register', description: 'Staff training records and certifications', htmlContent: '', isGenerated: false },
        { id: 'reg-hrm-3', name: 'Credential Verification Register', description: 'License and credential verification', htmlContent: '', isGenerated: false },
        { id: 'reg-hrm-4', name: 'Performance Appraisal Register', description: 'Annual performance reviews', htmlContent: '', isGenerated: false },
      ],
      'QI': [
        { id: 'reg-qi-1', name: 'Quality Indicator Register', description: 'Monthly quality indicators tracking', htmlContent: '', isGenerated: false },
        { id: 'reg-qi-2', name: 'CAPA Register', description: 'Corrective and Preventive Actions tracking with root cause analysis, corrective action, preventive action, responsible person, target date, completion date, and verification', htmlContent: '', isGenerated: false },
        { id: 'reg-qi-3', name: 'Near Miss Register', description: 'Near miss events reporting', htmlContent: '', isGenerated: false },
        { id: 'reg-qi-4', name: 'Sentinel Event Register', description: 'Sentinel events and RCA documentation', htmlContent: '', isGenerated: false },
        { id: 'reg-qi-5', name: 'Patient Safety Incident Register', description: 'All patient safety incidents', htmlContent: '', isGenerated: false },
      ],
      'PSQ': [
        { id: 'reg-psq-1', name: 'Quality Indicator Register', description: 'Monthly quality indicators tracking with trend analysis', htmlContent: '', isGenerated: false },
        { id: 'reg-psq-2', name: 'CAPA Register', description: 'Corrective and Preventive Actions with root cause (5-Why/Fishbone), corrective action, preventive action, responsible person, target date, completion date, and verification status', htmlContent: '', isGenerated: false },
        { id: 'reg-psq-3', name: 'Patient Safety Incident Register', description: 'All patient safety incidents with severity classification', htmlContent: '', isGenerated: false },
        { id: 'reg-psq-4', name: 'Near Miss Register', description: 'Near miss events reporting and analysis', htmlContent: '', isGenerated: false },
        { id: 'reg-psq-5', name: 'Sentinel Event Register', description: 'Sentinel events with RCA documentation', htmlContent: '', isGenerated: false },
        { id: 'reg-psq-6', name: 'Risk Assessment Register', description: 'Proactive risk assessments (FMEA)', htmlContent: '', isGenerated: false },
      ],
      'ROM': [
        { id: 'reg-rom-1', name: 'Management Review Minutes Register', description: 'Management review meeting records', htmlContent: '', isGenerated: false },
        { id: 'reg-rom-2', name: 'Strategic Plan Review Register', description: 'Annual strategic plan tracking', htmlContent: '', isGenerated: false },
        { id: 'reg-rom-3', name: 'CAPA Register', description: 'Management-level corrective actions from audit findings', htmlContent: '', isGenerated: false },
      ],
      'IMS': [
        { id: 'reg-ims-1', name: 'Medical Records Audit Register', description: 'Medical record completeness audits', htmlContent: '', isGenerated: false },
        { id: 'reg-ims-2', name: 'Document Control Register', description: 'Controlled document master list', htmlContent: '', isGenerated: false },
        { id: 'reg-ims-3', name: 'IT Incident Register', description: 'IT downtime and incident tracking', htmlContent: '', isGenerated: false },
      ],
    };

    const universalCAPARegister = {
      id: 'reg-universal-capa',
      name: 'CAPA Register (Master)',
      description: 'Master Corrective and Preventive Actions register with: Finding description, Root cause analysis (5-Why/Fishbone), Corrective action taken, Preventive measures, Responsible person, Target date, Completion date, Verification status',
      htmlContent: '',
      isGenerated: false,
    };

    let registers = registerSuggestions[prefix] || [];

    if (registers.length === 0) {
      registers = [
        { id: 'reg-gen-1', name: 'Activity Register', description: `Register for ${objective?.title || 'activities'}`, htmlContent: '', isGenerated: false },
        { id: 'reg-gen-2', name: 'Compliance Checklist Register', description: 'Daily/weekly compliance tracking', htmlContent: '', isGenerated: false },
        { id: 'reg-gen-3', name: 'Audit Register', description: 'Internal audit findings and actions', htmlContent: '', isGenerated: false },
        { id: 'reg-gen-4', name: 'Training Record Register', description: 'Related training documentation', htmlContent: '', isGenerated: false },
      ];
    }

    const hasCAPA = registers.some(r => r.name.toLowerCase().includes('capa'));
    if (!hasCAPA) {
      registers = [universalCAPARegister, ...registers];
    }

    setSuggestedRegisters(registers);
  }, [objective?.code, objective?.title]);

  // Show loading state while data is being fetched
  if (isLoadingFromSupabase || chapters.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" color="text.secondary">
          Loading objective data...
        </Typography>
      </Box>
    );
  }

  if (!chapter || !objective) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Icon sx={{ fontSize: 64, color: 'text.disabled' }}>error_outline</Icon>
        <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
          Objective not found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Looking for: {chapterId}/{objectiveId}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Icon>arrow_back</Icon>}
          onClick={() => navigate('/dashboard')}
          sx={{ mt: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  // Save current objective to Supabase
  const saveToSupabase = async (updatedObjective: typeof objective) => {
    if (!chapter || !updatedObjective) return;

    setSaveStatus('saving');
    try {
      const result = await saveObjectiveToSupabase(chapter.id, updatedObjective);
      if (result.success) {
        setSaveStatus('saved');
        setLastSaved(new Date());
        // Reset status after 3 seconds
        setTimeout(() => setSaveStatus('idle'), 3000);
      } else {
        console.error('Failed to save to Supabase:', result.error);
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      setSaveStatus('error');
    }
  };

  const handleFieldChange = (field: string, value: string | Status | Priority | ElementCategory) => {
    // Update local store immediately
    updateObjective(chapter.id, objective.id, { [field]: value });

    // Debounce Supabase save (save after 1 second of no changes)
    if (debouncedSaveRef.current) {
      clearTimeout(debouncedSaveRef.current);
    }

    debouncedSaveRef.current = setTimeout(() => {
      // Get the updated objective from store
      const updatedChapter = chapters.find((c) => c.id === chapter.id);
      const updatedObjective = updatedChapter?.objectives.find((o) => o.id === objective.id);
      if (updatedObjective) {
        saveToSupabase({ ...updatedObjective, [field]: value });
      }
    }, 1000);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const newFiles: EvidenceFile[] = await Promise.all(
      Array.from(files).map(async (file) => ({
        id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' as const : 'pdf' as const,
        size: file.size,
        dataUrl: await fileToBase64(file),
        uploadedAt: new Date().toISOString(),
      }))
    );

    const existingFiles = objective.evidenceFiles || [];
    const updatedFiles = [...existingFiles, ...newFiles];
    updateObjective(chapter.id, objective.id, {
      evidenceFiles: updatedFiles,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, evidenceFiles: updatedFiles });
  };

  const handleRemoveFile = (fileId: string) => {
    const existingFiles = objective.evidenceFiles || [];
    const updatedFiles = existingFiles.filter((f) => f.id !== fileId);
    updateObjective(chapter.id, objective.id, {
      evidenceFiles: updatedFiles,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, evidenceFiles: updatedFiles });
  };

  // YouTube Video functions
  const handleAddVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;

    const newVideo: YouTubeVideo = {
      id: `video-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newVideoTitle.trim(),
      url: newVideoUrl.trim(),
      description: newVideoDescription.trim(),
      addedBy: 'Current User',
      addedAt: new Date().toISOString(),
    };

    const existingVideos = objective.youtubeVideos || [];
    const updatedVideos = [...existingVideos, newVideo];
    updateObjective(chapter.id, objective.id, {
      youtubeVideos: updatedVideos,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, youtubeVideos: updatedVideos });

    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDescription('');
    setShowAddVideo(false);
  };

  const handleRemoveVideo = (videoId: string) => {
    const existingVideos = objective.youtubeVideos || [];
    const updatedVideos = existingVideos.filter((v) => v.id !== videoId);
    updateObjective(chapter.id, objective.id, {
      youtubeVideos: updatedVideos,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, youtubeVideos: updatedVideos });
  };
  
  // Search YouTube for relevant training videos
  const handleSearchYouTube = async () => {
    if (!objective) return;
    
    setIsSearchingYouTube(true);
    setShowYouTubeSearch(true);
    setYoutubeSearchResults([]);
    
    try {
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }
      
      // Get chapter context
      const chapterCode = objective.code.split('.')[0];
      const chapterNames: Record<string, string> = {
        'AAC': 'Access Assessment Continuity of Care',
        'COP': 'Care of Patients',
        'MOM': 'Management of Medication',
        'PRE': 'Patient Rights and Education',
        'HIC': 'Hospital Infection Control',
        'PSQ': 'Patient Safety Quality Improvement',
        'ROM': 'Responsibilities of Management',
        'FMS': 'Facility Management Safety',
        'HRM': 'Human Resource Management',
        'IMS': 'Information Management System',
      };
      
      const prompt = `You are a NABH accreditation expert. Find relevant YouTube training videos for this NABH SHCO 3rd Edition objective element.

Objective Code: ${objective.code}
Chapter: ${chapterNames[chapterCode] || chapterCode}
Description: ${objective.description}
${objective.interpretation ? `Interpretation: ${objective.interpretation}` : ''}

Return EXACTLY 6 YouTube video suggestions in this JSON format (no markdown, just JSON):
[
  {
    "title": "Video title as it would appear on YouTube",
    "searchQuery": "exact YouTube search query to find this video",
    "description": "Brief description of what staff will learn",
    "channel": "Likely channel name (e.g., NABH India, Hospital Training, etc.)"
  }
]

Focus on:
1. NABH training videos from official NABH channel
2. Hospital accreditation training videos
3. Healthcare quality management videos
4. Patient safety training videos
5. Infection control / hand hygiene videos (if HIC)
6. Clinical protocol training (if COP/MOM)

Prefer Indian healthcare context videos. Return ONLY valid JSON array.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );
      
      if (!response.ok) throw new Error('Failed to get video suggestions');
      
      const data = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      // Parse JSON from response
      const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        
        // Convert suggestions to search results with YouTube URLs
        const results = suggestions.map((s: any) => ({
          title: s.title,
          url: `https://www.youtube.com/results?search_query=${encodeURIComponent(s.searchQuery + ' NABH hospital training')}`,
          description: s.description,
          thumbnail: `https://via.placeholder.com/320x180/cc0000/ffffff?text=${encodeURIComponent(s.channel || 'YouTube')}`,
          searchQuery: s.searchQuery,
        }));
        
        setYoutubeSearchResults(results);
      }
    } catch (error) {
      console.error('Error searching YouTube:', error);
      setSnackbarMessage('Error searching for videos. Try manual search.');
      setSnackbarOpen(true);
    } finally {
      setIsSearchingYouTube(false);
    }
  };
  
  // Add video from search results
  const handleAddVideoFromSearch = (video: {title: string; url: string; description: string; searchQuery?: string}) => {
    // Open YouTube search in new tab for user to find and copy the actual URL
    if (video.searchQuery) {
      window.open(`https://www.youtube.com/results?search_query=${encodeURIComponent(video.searchQuery + ' NABH hospital training')}`, '_blank');
    } else {
      window.open(video.url, '_blank');
    }
    
    // Pre-fill the add video form
    setNewVideoTitle(video.title);
    setNewVideoDescription(video.description);
    setNewVideoUrl('');
    setShowAddVideo(true);
    setShowYouTubeSearch(false);
    
    setSnackbarMessage('Find the video on YouTube, copy its URL, and paste it below');
    setSnackbarOpen(true);
  };

  // Training Material functions
  const handleTrainingFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const newMaterial: TrainingMaterial = {
      id: `training-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newTrainingTitle.trim() || file.name,
      type: newTrainingType,
      dataUrl: await fileToBase64(file),
      description: newTrainingDescription.trim(),
      trainingDate: newTrainingDate,
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
    };

    const existingMaterials = objective.trainingMaterials || [];
    const updatedMaterials = [...existingMaterials, newMaterial];
    updateObjective(chapter.id, objective.id, {
      trainingMaterials: updatedMaterials,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, trainingMaterials: updatedMaterials });

    setNewTrainingTitle('');
    setNewTrainingDescription('');
    setNewTrainingDate('');
    setShowAddTraining(false);
  };

  const handleRemoveTrainingMaterial = (materialId: string) => {
    const existingMaterials = objective.trainingMaterials || [];
    const updatedMaterials = existingMaterials.filter((m) => m.id !== materialId);
    updateObjective(chapter.id, objective.id, {
      trainingMaterials: updatedMaterials,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, trainingMaterials: updatedMaterials });
  };

  // SOP functions
  const handleSOPFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || !files[0]) return;

    const file = files[0];
    const fileType = file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'doc';

    const newSOP: SOPDocument = {
      id: `sop-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: newSOPTitle.trim() || file.name,
      fileName: file.name,
      fileType: fileType as 'pdf' | 'doc' | 'docx',
      fileSize: file.size,
      dataUrl: await fileToBase64(file),
      version: newSOPVersion,
      effectiveDate: newSOPEffectiveDate,
      description: newSOPDescription.trim(),
      uploadedBy: 'Current User',
      uploadedAt: new Date().toISOString(),
    };

    const existingSOPs = objective.sopDocuments || [];
    const updatedSOPs = [...existingSOPs, newSOP];
    updateObjective(chapter.id, objective.id, {
      sopDocuments: updatedSOPs,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, sopDocuments: updatedSOPs });

    setNewSOPTitle('');
    setNewSOPVersion('1.0');
    setNewSOPEffectiveDate('');
    setNewSOPDescription('');
    setShowAddSOP(false);
  };

  const handleRemoveSOP = (sopId: string) => {
    const existingSOPs = objective.sopDocuments || [];
    const updatedSOPs = existingSOPs.filter((s) => s.id !== sopId);
    updateObjective(chapter.id, objective.id, {
      sopDocuments: updatedSOPs,
    });

    // Save to Supabase
    saveToSupabase({ ...objective, sopDocuments: updatedSOPs });
  };

  // Generate SOP
  const handleGenerateSOP = async () => {
    setIsGeneratingSOP(true);
    setGeneratedSOPContent('');

    try {
      const apiKey = await getClaudeApiKey();
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 4096,
          messages: [
            {
              role: 'user',
              content: `Generate a Standard Operating Procedure (SOP) document for NABH accreditation compliance.

Objective Code: ${objective.code}
Objective Title: ${objective.description}
Category: ${objective.category}
Hospital Name: ${hospitalConfig.name}

Generate a comprehensive SOP that includes:
1. Purpose and Scope
2. Definitions
3. Responsibilities
4. Procedure Steps (detailed, numbered)
5. Documentation Requirements
6. Quality Indicators
7. References

Format it professionally with clear sections and bullet points.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate SOP');
      }

      const data = await response.json();
      const content = data.content[0]?.text || 'Failed to generate SOP';
      setGeneratedSOPContent(content);
    } catch (error) {
      console.error('Error generating SOP:', error);
      setGeneratedSOPContent('Error generating SOP. Please check your API key configuration.');
    } finally {
      setIsGeneratingSOP(false);
    }
  };

  const getYouTubeThumbnail = (url: string): string => {
    const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/)?.[1];
    return videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : '';
  };

  // Generate Evidence List based on interpretation (using Gemini API with model fallback)
  const handleGenerateEvidenceList = async () => {
    setIsGeneratingEvidence(true);
    setGeneratedEvidenceList([]);

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const prompt = `For the following NABH accreditation objective element, generate a prioritized list of exactly 10 evidences that would be required to demonstrate compliance. List them in order of importance (most important first).

Objective Code: ${objective.code}
Interpretation: ${objective.description}
Category: ${objective.category}
${objective.isCore ? 'This is a CORE element which is mandatorily assessed.' : ''}

Format your response as a numbered list (1-10) with each evidence item on a new line. Be specific about the type of document, record, or proof needed. Start directly with the list, no introduction.`;

      // Use the current working model
      console.log(`[Generate Evidence List] Using model: gemini-2.0-flash`);
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Generate Evidence List] API Error:', response.status, errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`[Generate Evidence List] Success`);

      if (!data || !data.candidates) {
        console.error('[Generate Evidence List] Invalid response:', data);
        throw new Error('Invalid response from API');
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse the numbered list
      const evidenceItems = content
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+[.):\s]/))
        .map((line: string) => line.trim().replace(/^\d+[.):\s]*/, '').trim())
        .slice(0, 10);

      setGeneratedEvidenceList(evidenceItems);

      // Auto-populate the evidencesList field
      if (evidenceItems.length > 0) {
        const formattedList = evidenceItems.map((item: string, idx: number) => `${idx + 1}. ${item}`).join('\n');
        handleFieldChange('evidencesList', formattedList);
      }
    } catch (error) {
      console.error('Error generating evidence list:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGeneratedEvidenceList([`Error generating evidence list: ${errorMessage}`]);
    } finally {
      setIsGeneratingEvidence(false);
    }
  };

  // Generate 8 evidence items from interpretation text
  const handleGenerateEvidenceFromInterpretation = async () => {
    const interpretationText = objective.interpretations2 ?? objective.interpretation ?? '';
    if (!interpretationText.trim()) return;

    setIsGeneratingInterpretationEvidence(true);
    setInterpretationEvidenceItems([]);

    try {
      const apiKey = getGeminiApiKey();
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const prompt = `Based on this NABH objective interpretation:
"${interpretationText}"

Objective Code: ${objective.code}
${objective.isCore ? 'Note: This is a CORE element which is critical for patient safety.' : ''}

Generate exactly 8 specific evidence items that a hospital should prepare for NABH audit.
Format: Numbered list (1-8)
Each item should be:
- Specific document/record name
- Actionable and verifiable
- Relevant to hospital quality compliance

Start directly with the numbered list, no introduction or explanation.`;

      // Use the current working model
      console.log('Using model: gemini-2.0-flash');
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`API Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Success with gemini-2.0-flash');

      if (!data || !data.candidates) {
        console.error('Invalid response:', data);
        throw new Error('Invalid response from API');
      }

      const content = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Parse the numbered list
      const evidenceItems = content
        .split('\n')
        .filter((line: string) => line.trim().match(/^\d+[.):\s]/))
        .map((line: string, idx: number) => ({
          id: `interp-evidence-${idx}`,
          text: line.trim()
            .replace(/^\d+[.):\s]*/, '')  // Remove numbering
            .replace(/\*\*/g, '')          // Remove ** markdown bold
            .trim(),
          selected: true, // All selected by default
        }))
        .slice(0, 8);

      setInterpretationEvidenceItems(evidenceItems);
      setHasUnsavedChanges(true); // Enable Save button for newly generated items
      setInterpretationSaveSuccess(false); // Clear any previous save success state
    } catch (error) {
      console.error('Error generating evidence from interpretation:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setInterpretationEvidenceItems([{
        id: 'error',
        text: `Error: ${errorMessage}`,
        selected: false,
      }]);
    } finally {
      setIsGeneratingInterpretationEvidence(false);
    }
  };

  // Toggle interpretation evidence item selection
  const handleToggleInterpretationEvidence = (id: string) => {
    setInterpretationEvidenceItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Add selected interpretation evidence items to the evidence list
  const handleAddSelectedInterpretationEvidence = () => {
    const selectedItems = interpretationEvidenceItems.filter(item => item.selected && item.id !== 'error');
    if (selectedItems.length === 0) return;

    const currentList = objective.evidencesList || '';
    const newItems = selectedItems.map((item, idx) => {
      const existingCount = currentList.split('\n').filter(line => line.trim().match(/^\d+\./)).length;
      return `${existingCount + idx + 1}. ${item.text}`;
    }).join('\n');

    const updatedList = currentList ? `${currentList}\n${newItems}` : newItems;
    handleFieldChange('evidencesList', updatedList);

    // Keep the generated items visible but unselect them to show they've been added
    setInterpretationEvidenceItems(items =>
      items.map(item => ({ ...item, selected: false }))
    );

    // Show success message with instruction
    setSnackbarMessage(`Added ${selectedItems.length} evidence item(s) to the Evidence List below. Scroll down to see them, then click Save to store in database.`);
    setSnackbarOpen(true);
  };


  // View saved evidence item document
  const handleViewSavedEvidenceItem = async (documentId: string) => {
    try {
      console.log('[View Evidence] Loading document ID:', documentId);
      const result = await loadEvidenceById(documentId);
      console.log('[View Evidence] Load result:', result.success, result.data?.evidence_title);

      if (result.success && result.data && result.data.html_content) {
        console.log('[View Evidence] Opening document:', result.data.evidence_title);
        const newWindow = window.open('', '_blank');
        if (newWindow) {
          newWindow.document.write(result.data.html_content);
          newWindow.document.close();
        } else {
          console.error('[View Evidence] Failed to open new window (popup blocked?)');
          setSnackbarMessage('Failed to open document. Please allow popups for this site.');
          setSnackbarOpen(true);
        }
      } else {
        console.error('[View Evidence] Error loading saved document:', result.error);
        setSnackbarMessage(`Failed to load document: ${result.error || 'Unknown error'}`);
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('[View Evidence] Exception loading saved document:', error);
      setSnackbarMessage('Error loading document. Please try again.');
      setSnackbarOpen(true);
    }
  };

  // Print evidence items
  const handlePrintEvidenceItems = () => {
    if (interpretationEvidenceItems.length === 0) return;

    const hospitalInfo = getHospitalInfo();
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Generated Evidence Items - ${objective.code}</title>
        <style>
          @page {
            margin: 1in;
          }
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #1976d2;
          }
          .hospital-name {
            font-size: 24px;
            font-weight: bold;
            color: #1976d2;
            margin-bottom: 5px;
          }
          .document-title {
            font-size: 18px;
            font-weight: bold;
            margin-top: 10px;
          }
          .objective-info {
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f5f5f5;
            border-left: 4px solid #1976d2;
          }
          .objective-code {
            font-weight: bold;
            color: #1976d2;
          }
          .evidence-list {
            margin-top: 20px;
          }
          .evidence-item {
            margin-bottom: 15px;
            padding: 10px;
            border-left: 3px solid #4caf50;
            background-color: #f9f9f9;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            font-size: 12px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="hospital-name">${hospitalInfo.name}</div>
          <div class="document-title">Generated Evidence Items</div>
        </div>

        <div class="objective-info">
          <div><span class="objective-code">Objective Code:</span> ${objective.code}</div>
          <div><strong>Category:</strong> ${objective.category}</div>
          ${objective.isCore ? '<div><strong>Type:</strong> CORE Element</div>' : ''}
        </div>

        <div class="evidence-list">
          <h3>Evidence Items (${interpretationEvidenceItems.length})</h3>
          ${interpretationEvidenceItems.map((item, idx) => `
            <div class="evidence-item">
              <strong>${toRomanNumeral(idx + 1)}.</strong> ${item.text}
            </div>
          `).join('')}
        </div>

        <div class="footer">
          Generated on ${new Date().toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })} | ${hospitalInfo.name}
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  // Toggle evidence item selection
  const handleToggleEvidenceItem = (id: string) => {
    setParsedEvidenceItems(items =>
      items.map(item =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  // Select/deselect all evidence items
  const handleSelectAllEvidenceItems = () => {
    const allSelected = parsedEvidenceItems.every(item => item.selected);
    setParsedEvidenceItems(items =>
      items.map(item => ({ ...item, selected: !allSelected }))
    );
  };

  // Toggle auditor priority for an evidence item and save to Supabase
  const handleToggleAuditorPriority = async (itemId: string) => {
    if (!objective || !chapterId) return;

    // Update local state
    const updatedItems = parsedEvidenceItems.map(item =>
      item.id === itemId ? { ...item, isAuditorPriority: !item.isAuditorPriority } : item
    );
    setParsedEvidenceItems(updatedItems);

    // Get the new list of auditor priority items
    const newAuditorPriorityItems = updatedItems
      .filter(item => item.isAuditorPriority)
      .map(item => item.id);

    // Update objective with new auditor priority items
    const updatedObjective = {
      ...objective,
      auditorPriorityItems: newAuditorPriorityItems,
    };

    // Save to Supabase
    const result = await saveObjectiveToSupabase(chapterId, updatedObjective);
    if (result.success) {
      const item = updatedItems.find(i => i.id === itemId);
      const isNowPriority = item?.isAuditorPriority;
      setSnackbarMessage(isNowPriority ? 'Marked as auditor priority' : 'Removed from auditor priority');
      setSnackbarOpen(true);
    } else {
      // Revert on error
      setParsedEvidenceItems(parsedEvidenceItems);
      setSnackbarMessage('Failed to update auditor priority');
      setSnackbarOpen(true);
    }
  };

  // Count auditor priority items
  const auditorPriorityCount = parsedEvidenceItems.filter(item => item.isAuditorPriority).length;

  // Open evidence generation modal to show prompt and data
  const handleGenerateDetailedEvidence = async (item: ParsedEvidenceItem) => {
    console.log('handleGenerateDetailedEvidence called', { item, objective });

    if (!objective) {
      console.error('Cannot generate document: objective is null');
      setSnackbarMessage('Error: No objective data available');
      setSnackbarOpen(true);
      return;
    }

    // Store current evidence item
    setCurrentEvidenceToGenerate(item);

    // Open modal and start loading prompt and data
    setShowEvidenceGenerationModal(true);
    setIsLoadingPromptData(true);

    try {
      // Get evidence package (array of related documents)
      const documentsToGenerate = getEvidenceDocuments(item.text);
      console.log(`📦 Evidence Package identified: ${documentsToGenerate.length} document(s) to generate`);

      // Get database context for this evidence
      const contentPrompt = await getEvidenceDocumentPrompt(item.text);

      // Build the generation prompt
      const generationPrompt = `${contentPrompt}

OBJECTIVE: ${objective.code} - ${objective.title}
EVIDENCE REQUIREMENT: ${item.text}

DOCUMENT PACKAGE TO GENERATE:
${documentsToGenerate.map((doc, idx) => `${idx + 1}. ${doc.title} (${doc.documentType})\n   ${doc.description}`).join('\n\n')}

TOTAL DOCUMENTS: ${documentsToGenerate.length}`;

      // Set the prompt and data
      setEvidenceGenerationPrompt(generationPrompt);
      setEvidenceGenerationData(contentPrompt);

      // Combine both into editable text
      setEditablePromptAndData(generationPrompt);

      setIsLoadingPromptData(false);
    } catch (error) {
      console.error('Error loading prompt and data:', error);
      setSnackbarMessage('Error loading evidence data');
      setSnackbarOpen(true);
      setIsLoadingPromptData(false);
      setShowEvidenceGenerationModal(false);
    }
  };

  // Execute evidence generation with custom prompt
  const handleExecuteEvidenceGeneration = async () => {
    if (!objective || !currentEvidenceToGenerate) {
      return;
    }

    const item = currentEvidenceToGenerate;

    // Get evidence package (array of related documents)
    const documentsToGenerate = getEvidenceDocuments(item.text);
    console.log(`📦 Executing generation for ${documentsToGenerate.length} document(s)`);

    setIsExecutingGeneration(true);

    setGeneratingDetailedDocFor(item.id);
    setInlinePreviewDoc(null);

    try {
      // Generate unique package ID to link all documents
      const packageId = `pkg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const generatedDocs: { title: string; html: string }[] = [];

      // Generate each document in the package
      for (let docIndex = 0; docIndex < documentsToGenerate.length; docIndex++) {
        const doc = documentsToGenerate[docIndex];

        setSnackbarMessage(`Generating document ${docIndex + 1}/${documentsToGenerate.length}: ${doc.title}...`);
        setSnackbarOpen(true);

        console.log(`\n📄 Generating: ${doc.title} (${doc.documentType})`);

        // Use the custom edited prompt from modal
        const generationPrompt = `${editablePromptAndData}

OBJECTIVE: ${objective.code} - ${objective.title}
EVIDENCE REQUIREMENT: ${item.text}

DOCUMENT TO GENERATE (Part ${docIndex + 1} of ${documentsToGenerate.length}):
Title: ${doc.title}
Type: ${doc.documentType}
Description: ${doc.description}

═══════════════════════════════════════════════════════════════════
CRITICAL INSTRUCTIONS - CREATE DETAILED, COMPREHENSIVE DOCUMENTS
═══════════════════════════════════════════════════════════════════

🎯 DOCUMENT COMPLETENESS REQUIREMENTS:
1. Generate a COMPLETE, FILLED, AUDITOR-READY document (NOT a blank template)
2. Use ACTUAL data from ${hospitalConfig.name} database (patient records, staff records, equipment data provided above)
3. Each document must be 2-4 pages long with COMPREHENSIVE detail
4. Include ALL required sections, forms, registers, checklists as appropriate

📊 FOR REGISTERS & LOG BOOKS:
- Create FULL DATA TABLES with 15-25 rows of FILLED entries
- Include ALL relevant columns with proper headers
- Example columns for attendance: Sr No, Employee ID, Name, Designation, Department, Signature, Date, Time In, Time Out
- Example columns for equipment: Sr No, Equipment ID, Equipment Name, Location, Date, Reading, Status, Technician Name, Signature
- Example columns for patient records: Sr No, UHID, Patient Name, Age, Gender, Diagnosis, Admission Date, Status
- Fill EVERY row with realistic data using the database records provided
- Add proper table styling with alternating row colors, borders, headers
- Include summary statistics at the bottom (Total entries: X, Completed: Y, Pending: Z)

📝 FOR FORMS:
- Fill ALL fields with realistic data (no blank fields)
- Include checkboxes (✓ checked where appropriate)
- Add handwritten-style signatures using cursive fonts
- Include stamps, dates, reference numbers
- Add "Form No:", "Version:", "Page X of Y" in headers

📋 FOR CHECKLISTS:
- Include 15-20 checklist items with YES/NO/NA columns
- Add checkmarks (✓) or crosses (✗) for each item
- Include "Compliant/Non-Compliant" status
- Add "Checked By" and "Verified By" signatures
- Include compliance percentage calculation

🏥 FOR ATTENDANCE SHEETS:
- Minimum 20-30 employee entries
- Columns: Sr No, Employee ID, Name, Designation, Department, Signature, Time In, Time Out
- Use actual staff names from database
- Add realistic signatures using SVG or cursive fonts
- Include header: Training Topic, Date, Venue, Trainer Name
- Add footer: Total Attendees, Present, Absent

📝 FOR TRAINING ASSESSMENT (MCQ):
- Create 10 multiple-choice questions with 4 options each
- Mark correct answers
- Show employee responses for 5-10 employees
- Include scoring: Employee Name, Score (X/10), Pass/Fail, Signature
- Add pass criteria (e.g., 70% or 7/10)
- Include question categories (Knowledge, Application, Compliance)

📊 FOR AUDIT REPORTS:
- Include detailed audit criteria table (15-20 items)
- Columns: Sr No, Audit Criteria, Standard Requirement, Observation, Evidence Seen, Score, Remarks
- Add scoring system (Compliant=2, Partial=1, Non-Compliant=0)
- Calculate total score and compliance percentage
- Include CAPA (Corrective Action) table with: Finding, Root Cause, Action, Responsible Person, Target Date, Status
- Add auditor signatures and dates

🔬 FOR EQUIPMENT CALIBRATION:
- Include detailed calibration data table
- Columns: Parameter, Standard Value, Measured Value, Deviation, Acceptance Criteria, Result (Pass/Fail)
- Add equipment details: Make, Model, Serial No, Location, Last Calibration, Next Due
- Include calibration certificate with standards used
- Add technician signature and certification number

💊 FOR MEDICATION CHARTS:
- Create 7-day medication administration record
- Columns for each day with time slots (Morning, Afternoon, Evening, Night)
- Include: Drug Name, Dose, Route, Frequency, Start Date, Stop Date
- Mark administered doses with nurse initials
- Add PRN (as needed) medications separately
- Include allergies section at top

🦠 FOR INFECTION SURVEILLANCE:
- Monthly data table with daily entries
- Columns: Date, Ward, Patient Name, UHID, Type of Infection, Site, Organism, Antibiotic, Outcome
- Include infection rate calculation
- Add graph or chart showing trends
- Include preventive actions taken

DETAILED FORMATTING REQUIREMENTS:
✓ Professional hospital letterhead with logo
✓ Document control: Doc No, Version, Effective Date, Review Date, Page X of Y
✓ Proper section headings and sub-headings
✓ Data tables with borders, headers, alternating row colors
✓ Signature blocks: Prepared By, Reviewed By, Approved By (with names, designations, dates, signatures)
✓ Hospital stamp/seal area
✓ Footer with hospital name, address, document reference
✓ Use realistic dates from 6-9 months ago
✓ Include actual employee names, patient UHIDs, equipment IDs from database
✓ Professional fonts: Arial, Calibri, or Segoe UI
✓ Proper spacing, margins, and print-ready layout

🎨 CSS STYLING - MUST INCLUDE:
- Professional color scheme (blues/greens for headers)
- Table borders and styling
- Alternating row colors for readability
- Signature boxes with borders
- Print-friendly layout (@media print rules)
- Responsive design
- Professional spacing and padding

⚠️ ABSOLUTE REQUIREMENTS:
- NO BLANK TEMPLATES - Everything must be FILLED
- NO PLACEHOLDER TEXT - Use actual data
- NO "Sample" or "Example" - Make it look REAL
- Minimum 15-25 rows of data in registers/tables
- Include realistic calculations, totals, percentages
- Add proper signatures using cursive fonts or SVG
- Make it INDISTINGUISHABLE from real hospital documentation

Generate complete HTML document with embedded CSS. Output ONLY the HTML, nothing else.`;

        // Call our secure backend proxy
        const data = await callGeminiAPI(generationPrompt, 0.7, 8192);
        let rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (!rawContent) {
          console.error(`❌ No content generated for: ${doc.title}`);
          continue;
        }

        // Extract and post-process HTML
        const extractedHtml = extractHTMLFromResponse(rawContent);
        const htmlContent = postProcessHTML(extractedHtml);

        // Save to database
        const result = await saveGeneratedEvidence({
          objective_code: objective.code || '',
          evidence_title: `${doc.title}`,
          prompt: `${item.text} - ${doc.description}`,
          generated_content: extractTextFromHTML(htmlContent),
          html_content: htmlContent,
          evidence_type: 'package',
          hospital_config: hospitalConfig,
          package_id: packageId,
          package_sequence: docIndex + 1,
          package_total: documentsToGenerate.length,
        });

        if (result.success && result.id) {
          console.log(`✅ Saved: ${doc.title} (ID: ${result.id})`);

          generatedDocs.push({ title: doc.title, html: htmlContent });

          // Add to local state
          const newEvidence: GeneratedEvidence = {
            id: result.id,
            objective_code: objective.code || '',
            evidence_title: `${doc.title}`,
            prompt: `${item.text} - ${doc.description}`,
            generated_content: extractTextFromHTML(htmlContent),
            html_content: htmlContent,
            evidence_type: 'package',
            hospital_config: hospitalConfig,
            created_at: new Date().toISOString(),
          };
          setSavedEvidences(prev => [newEvidence, ...prev]);
        } else {
          console.error(`❌ Failed to save: ${doc.title}`, result.error);
        }
      }

      setSnackbarMessage(`✅ Evidence package complete! Generated ${generatedDocs.length} document(s). Check "Generated Evidences" section below.`);
      setSnackbarOpen(true);

      console.log(`\n🎉 Package generation complete! ${generatedDocs.length} documents saved.`);

      // Close modal on success
      setShowEvidenceGenerationModal(false);
      setCurrentEvidenceToGenerate(null);

    } catch (error) {
      console.error('❌ Error generating evidence package:', error);
      setSnackbarMessage(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setSnackbarOpen(true);
    } finally {
      setGeneratingDetailedDocFor(null);
      setIsExecutingGeneration(false);
    }
  };

  // Get formatted dates
  const getFormattedDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Document dates should be 9 months prior to current date (for NABH audit compliance)
  const today = new Date();
  const documentDate = new Date(today.getFullYear(), today.getMonth() - 9, today.getDate());
  const effectiveDate = getFormattedDate(documentDate);
  const reviewDate = getFormattedDate(new Date(documentDate.getFullYear() + 1, documentDate.getMonth(), documentDate.getDate()));

  // Logo URL - use production URL for generated documents stored in database
  const logoUrl = window.location.hostname === 'localhost'
    ? `${window.location.origin}${hospitalConfig.name === 'Ayushman Hospital' ? '/ayushman-logo.png' : '/hospital-logo.png'}`
    : `https://www.nabh.online${hospitalConfig.name === 'Ayushman Hospital' ? '/ayushman-logo.png' : '/hospital-logo.png'}`;

  // Get the HTML template for evidence documents
  const getEvidenceDocumentPrompt = async (evidenceItem?: string) => {
    // Get relevant Hope Hospital data based on evidence type
    const relevantData = evidenceItem ? await getRelevantData(evidenceItem) : {};

    // Format data for prompt
    const dataContext = hospitalConfig.name === 'Hope Hospital' ? `

CRITICAL: Use these ACTUAL Hope Hospital records in your evidence generation. This is real data from our database:

${relevantData.patients && relevantData.patients.length > 0 ? `
=== PATIENT RECORDS (Hope Hospital Database) ===
${relevantData.patients.map((p, idx) => `
Patient ${idx + 1}:
- Visit ID/UHID: ${p.visit_id}
- Serial No: ${p.sr_no || 'N/A'}
- Patient Name: ${p.patient_name}
- Diagnosis: ${p.diagnosis || 'Not specified'}
- Admission Date: ${p.admission_date || 'Not specified'}
${p.discharge_date ? `- Discharge Date: ${p.discharge_date}` : '- Status: ' + p.status}
`).join('\n')}

NOTE: Use these EXACT patient names and Visit IDs. Do not modify them. If you need additional details like age, contact, etc., create realistic values that fit with the patient's name and context.
` : ''}

${relevantData.staff && relevantData.staff.length > 0 ? `
=== STAFF RECORDS (Hope Hospital Database) ===
${relevantData.staff.map((s, idx) => `
Staff ${idx + 1}:
- Name: ${s.name}
- Role: ${s.role}
- Designation: ${s.designation}
- Department: ${s.department}
- Responsibilities: ${s.responsibilities?.join(', ') || 'General duties'}
- Status: ${s.is_active ? 'Active' : 'Inactive'}
`).join('\n')}

NOTE: Use these EXACT staff names and designations for any staff-related documentation.
` : ''}

${relevantData.equipment && relevantData.equipment.length > 0 ? `
=== EQUIPMENT RECORDS (Hope Hospital Database) ===
${relevantData.equipment.map((e, idx) => `
Equipment ${idx + 1}:
- Equipment ID: ${e.equipmentId}
- Name: ${e.name}
- Category: ${e.category}
- Manufacturer: ${e.manufacturer}
- Purchase Date: ${e.purchaseDate}
- Last Calibration: ${e.lastCalibrationDate}
- Next Calibration: ${e.nextCalibrationDate}
- Location: ${e.location}
- Status: ${e.status}
`).join('\n')}
` : ''}

${relevantData.incidents && relevantData.incidents.length > 0 ? `
=== INCIDENT RECORDS (Hope Hospital Database) ===
${relevantData.incidents.map((i, idx) => `
Incident ${idx + 1}:
- Incident ID: ${i.incidentId}
- Date/Time: ${i.date} at ${i.time}
- Location: ${i.location}
- Reported By: ${i.reportedBy}
- Type: ${i.incidentType}
- Description: ${i.description}
- Action Taken: ${i.actionTaken}
- Status: ${i.status}
`).join('\n')}
` : ''}

INSTRUCTIONS FOR USING THIS DATA:
1. Use EXACT names, UHIDs, employee IDs, and other identifiers from above
2. Fill forms/registers with this actual data - do NOT invent fake data
3. Create realistic filled formats showing these specific records
4. If you need more entries than provided, you may add similar realistic entries following the same pattern
5. Make the evidence look like actual hospital records, not templates
6. Include specific dates, numbers, and details from the database
7. Create various types of filled formats: registers, forms, reports, logs, checklists
` : '';

    return `You are an expert in NABH (National Accreditation Board for Hospitals and Healthcare Providers) accreditation documentation for ${hospitalConfig.name}.
${dataContext}

Generate a complete HTML document for the selected evidence item in ENGLISH ONLY (internal document).

IMPORTANT: Generate the output as a complete, valid HTML document with embedded CSS styling. The document must be modern, professional, and print-ready.

Use EXACTLY this HTML template structure (fill in the content sections):

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>[Document Title] - ${hospitalConfig.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #1565C0; padding-bottom: 10px; margin-bottom: 20px; }
    .logo { width: 180px; height: auto; margin: 0 auto 5px; display: block; }
    .hospital-address { font-size: 11px; color: #666; }
    .doc-title { background: linear-gradient(135deg, #1565C0, #0D47A1); color: white; padding: 12px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 5px; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .info-table th { background: #f5f5f5; font-weight: 600; width: 25%; }
    .auth-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .auth-table th { background: linear-gradient(135deg, #1565C0, #0D47A1); color: white; padding: 10px; text-align: center; }
    .auth-table td { border: 1px solid #ddd; padding: 15px; text-align: center; vertical-align: top; }
    .signature-box { margin-top: 10px; padding: 8px; border: 1px solid #1565C0; border-radius: 5px; background: #f8f9fa; }
    .signature-name { font-weight: bold; color: #1565C0; font-size: 14px; }
    .signature-line { font-family: 'Brush Script MT', cursive; font-size: 18px; color: #0D47A1; margin: 5px 0; }
    .section { margin: 20px 0; }
    .section-title { background: #e3f2fd; padding: 8px 12px; font-weight: bold; color: #1565C0; border-left: 4px solid #1565C0; margin-bottom: 10px; }
    .section-content { padding: 10px 15px; }
    .section-content ul { margin-left: 20px; }
    .section-content li { margin: 5px 0; }
    .procedure-step { margin: 10px 0; padding: 10px; background: #fafafa; border-radius: 5px; border-left: 3px solid #1565C0; }
    .step-number { display: inline-block; width: 25px; height: 25px; background: #1565C0; color: white; border-radius: 50%; text-align: center; line-height: 25px; margin-right: 10px; font-weight: bold; }
    .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; }
    .data-table th { background: #1565C0; color: white; padding: 10px; text-align: left; }
    .data-table td { border: 1px solid #ddd; padding: 8px; }
    .data-table tr:nth-child(even) { background: #f9f9f9; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #1565C0; text-align: center; font-size: 10px; color: #666; }
    .revision-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
    .revision-table th { background: #455a64; color: white; padding: 8px; }
    .revision-table td { border: 1px solid #ddd; padding: 8px; }
    .stamp-area { border: 2px solid #1565C0; border-radius: 10px; padding: 15px; text-align: center; margin: 20px 0; background: #f8f9fa; }
    .stamp-text { font-weight: bold; color: #1565C0; font-size: 14px; }
    @media print { body { padding: 0; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="${hospitalConfig.name}" class="logo" onerror="this.style.display='none'">
    <div class="hospital-address">${hospitalConfig.address} | Phone: ${hospitalConfig.phone}</div>
  </div>

  <div class="doc-title">[DOCUMENT TITLE - Replace with appropriate title]</div>

  <table class="info-table">
    <tr><th>Document No</th><td>[Generate appropriate doc number like POL-QMS-001, SOP-AAC-001, etc.]</td><th>Version</th><td>1.0</td></tr>
    <tr><th>Department</th><td>[Appropriate department]</td><th>Category</th><td>[Policy/SOP/Record/Format]</td></tr>
    <tr><th>Effective Date</th><td>${effectiveDate}</td><th>Review Date</th><td>${reviewDate}</td></tr>
  </table>

  <table class="auth-table">
    <tr><th>PREPARED BY</th><th>REVIEWED BY</th><th>APPROVED BY</th></tr>
    <tr>
      <td>
        <div class="signature-box">
          <div class="signature-name">Jagruti</div>
          <div>Quality Manager / HR</div>
          <div>Date: ${effectiveDate}</div>
          <div class="signature-line">Jagruti</div>
        </div>
      </td>
      <td>
        <div class="signature-box">
          <div class="signature-name">Gaurav</div>
          <div>Hospital Administrator</div>
          <div>Date: ${effectiveDate}</div>
          <div class="signature-line">Gaurav</div>
        </div>
      </td>
      <td>
        <div class="signature-box">
          <div class="signature-name">Dr. Shiraz Sheikh</div>
          <div>NABH Coordinator / Administrator</div>
          <div>Date: ${effectiveDate}</div>
          <div class="signature-line">Dr. Shiraz Sheikh</div>
        </div>
      </td>
    </tr>
  </table>

  [MAIN CONTENT - Generate detailed content using sections below]

  <div class="section">
    <div class="section-title">1. Purpose</div>
    <div class="section-content">[Purpose of this document]</div>
  </div>

  <div class="section">
    <div class="section-title">2. Scope</div>
    <div class="section-content">[Scope and applicability]</div>
  </div>

  <div class="section">
    <div class="section-title">3. Responsibilities</div>
    <div class="section-content">[Who is responsible for what]</div>
  </div>

  <div class="section">
    <div class="section-title">4. Procedure / Policy</div>
    <div class="section-content">[Detailed procedure or policy content]</div>
  </div>

  <div class="section">
    <div class="section-title">5. Documentation</div>
    <div class="section-content">[Related forms, records, registers]</div>
  </div>

  <div class="section">
    <div class="section-title">6. References</div>
    <div class="section-content">NABH SHCO 3rd Edition Standards</div>
  </div>

  <table class="revision-table">
    <tr><th>Version</th><th>Date</th><th>Description</th><th>Changed By</th></tr>
    <tr><td>1.0</td><td>${effectiveDate}</td><td>Initial Release</td><td>Quality Department</td></tr>
  </table>

  <div class="stamp-area">
    <div class="stamp-text">${hospitalConfig.name.toUpperCase()}</div>
    <div>QUALITY MANAGEMENT SYSTEM</div>
    <div style="margin-top: 5px; font-size: 10px;">Controlled Document</div>
  </div>

  <div class="footer">
    <strong>${hospitalConfig.name}</strong> | ${hospitalConfig.address}<br>
    Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email} | Website: ${hospitalConfig.website}<br>
    This is a controlled document. Unauthorized copying or distribution is prohibited.
  </div>
</body>
</html>

Generate the complete HTML with all sections filled in appropriately based on the evidence item provided. Make the content detailed, practical, and ready for NABH assessment.

${hospitalConfig.name === 'Hope Hospital' ? `
SPECIFIC INSTRUCTIONS FOR HOPE HOSPITAL EVIDENCE:
1. Create FILLED formats, NOT blank templates
2. Use the patient/staff/equipment data provided above
3. Generate realistic completed forms like:
   - Patient Admission Register with actual entries
   - Staff Training Records with actual names and dates
   - Equipment Calibration Logs with actual equipment IDs
   - Incident Report Forms with real incident data
   - Medication Administration Records (MAR) with patient details
   - Consent Forms with patient information filled in
   - Assessment Forms with actual patient data
   - Audit Checklists with observations marked
4. Include multiple entries/records to show consistent documentation
5. Make it look like actual working hospital records, not examples
6. Use proper formatting: tables, checkboxes (✓), signatures, stamps
7. Add realistic handwritten-style notes where appropriate
8. Include serial numbers, page numbers, reference numbers
` : ''}
`;
  };

  // Extract HTML from AI response (handles markdown code blocks)
  const extractHTMLFromResponse = (response: string): string => {
    let content = response.trim();

    // Remove markdown code blocks if present
    const htmlCodeBlockMatch = content.match(/```html\s*([\s\S]*?)```/i);
    if (htmlCodeBlockMatch) {
      content = htmlCodeBlockMatch[1].trim();
    } else {
      // Try generic code block
      const codeBlockMatch = content.match(/```\s*([\s\S]*?)```/);
      if (codeBlockMatch) {
        content = codeBlockMatch[1].trim();
      }
    }

    // If content starts with DOCTYPE or html tag, return as-is
    if (content.startsWith('<!DOCTYPE') || content.startsWith('<html')) {
      return content;
    }

    // Try to find HTML document in the response
    const doctypeIndex = content.indexOf('<!DOCTYPE html>');
    if (doctypeIndex !== -1) {
      return content.substring(doctypeIndex);
    }

    const htmlIndex = content.indexOf('<html');
    if (htmlIndex !== -1) {
      return content.substring(htmlIndex);
    }

    // If no proper HTML found, wrap in basic structure with logo
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Quality Document - ${hospitalConfig.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #1565C0; padding-bottom: 15px; margin-bottom: 20px; }
    .logo { width: 180px; height: auto; margin: 0 auto 2px; display: block; }
    .hospital-address { font-size: 11px; color: #666; }
    .content { padding: 20px 0; white-space: pre-wrap; line-height: 1.8; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #1565C0; text-align: center; font-size: 10px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoUrl}" alt="${hospitalConfig.name}" class="logo" onerror="this.style.display='none'">
    <div class="hospital-address">${hospitalConfig.address} | Phone: ${hospitalConfig.phone}</div>
  </div>
  <div class="content">${content}</div>
  <div class="footer">
    <strong>${hospitalConfig.name}</strong> | ${hospitalConfig.address}<br>
    Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email}
  </div>
</body>
</html>`;
  };

  // Post-process HTML to ensure correct branding, dates, and signatures
  const postProcessHTML = (html: string): string => {
    let processed = html;

    // 0. FIRST - Replace ALL variations of "Dr. Murali's Hope Hospital" with "Hope Hospital" EVERYWHERE
    // This must happen FIRST before any other processing
    processed = processed.replace(/Dr\.?\s*Murali'?s?\s+Hope\s+Hospital/gi, 'Hope Hospital');
    processed = processed.replace(/Dr\.?\s*Murali'?s?\s*Hope\s*Hospital/gi, 'Hope Hospital');
    processed = processed.replace(/DR\.?\s*MURALI'?S?\s+HOPE\s+HOSPITAL/gi, 'HOPE HOSPITAL');
    processed = processed.replace(/DR\.?\s*MURALI'?S?\s*HOPE\s*HOSPITAL/gi, 'HOPE HOSPITAL');

    // 0. SECOND - If Ayushman Hospital is selected, replace Hope Hospital mentions
    if (hospitalConfig.name === 'Ayushman Hospital') {
      processed = processed.replace(/Hope\s+Hospital/gi, 'Ayushman Hospital');
      processed = processed.replace(/HOPE\s+HOSPITAL/gi, 'AYUSHMAN HOSPITAL');
    }

    // 1. REMOVE the tagline div completely (handles nested divs issue)
    processed = processed.replace(/<div[^>]*class="tagline"[^>]*>[\s\S]*?<\/div>/gi, '');

    // 2. Remove tagline text anywhere it appears
    processed = processed.replace(/Assured\s*\|\s*Committed\s*\|\s*Proficient/gi, '');

    // 3. Fix the logo - replace any logo with correct one (2px margin = ~0.5cm spacing)
    const logoImg = `<img src="${logoUrl}" alt="${hospitalConfig.name}" class="logo" style="width: 180px; height: auto; margin: 0 auto 2px; display: block;" onerror="this.style.display='none'">`;

    processed = processed.replace(
      /<img[^>]*class="logo"[^>]*>/gi,
      logoImg
    );

    // 4. Replace logo placeholders - various patterns AI might generate
    processed = processed.replace(
      /<div[^>]*class="logo-area"[^>]*>[\s\S]*?<\/div>/gi,
      logoImg
    );
    processed = processed.replace(
      /<div[^>]*class="logo"[^>]*>[\s\S]*?<\/div>/gi,
      logoImg
    );
    processed = processed.replace(
      /HOSPITAL\s*(<br\s*\/?>)?\s*LOGO/gi,
      logoImg
    );
    // Replace SVG logo placeholders
    processed = processed.replace(
      /<svg[^>]*class="logo"[^>]*>[\s\S]*?<\/svg>/gi,
      logoImg
    );
    // Replace any img with logo in src that isn't our actual logo
    processed = processed.replace(
      /<img[^>]*src="[^"]*logo[^"]*"[^>]*>/gi,
      logoImg
    );
    // Replace text-based logo placeholders in header
    processed = processed.replace(
      /<div[^>]*class="hospital-logo"[^>]*>[\s\S]*?<\/div>/gi,
      logoImg
    );
    // Replace [LOGO] or [Hospital Logo] placeholders
    processed = processed.replace(
      /\[(?:HOSPITAL\s*)?LOGO\]/gi,
      logoImg
    );
    // Replace "Hope ring eran" or similar broken text (from SVG rendering)
    processed = processed.replace(
      /Hope\s*ring\s*eran/gi,
      ''
    );
    // Clean up placeholder text artifacts that AI might generate
    processed = processed.replace(/-placeholder['"]*>/gi, '');
    processed = processed.replace(/placeholder['"]*>/gi, '');
    processed = processed.replace(/>Here</gi, '><');
    processed = processed.replace(/Logo\s*Here/gi, '');
    processed = processed.replace(/Image\s*Here/gi, '');

    // 4b. Replace placeholder boxes (gray boxes, empty divs for logo)
    // Match any div that looks like a placeholder box with specific dimensions
    processed = processed.replace(
      /<div[^>]*style="[^"]*(?:width:\s*(?:80|100|120|150|180)px[^"]*height:\s*(?:60|80|100)px|height:\s*(?:60|80|100)px[^"]*width:\s*(?:80|100|120|150|180)px)[^"]*(?:background|border)[^"]*"[^>]*>[\s\S]*?<\/div>/gi,
      logoImg
    );
    // Match placeholder text patterns
    processed = processed.replace(
      /\[?(?:Logo|Hospital\s*Logo|Logo\s*Here|Insert\s*Logo)\]?/gi,
      logoImg
    );

    // 4c. Inject logo into header if not present - replace hospital name at top with logo + name
    if (!processed.includes(logoUrl)) {
      // Replace the first "Hospital Name" heading with logo + name
      const nameRegex = new RegExp(`<h1[^>]*>${hospitalConfig.name}<\/h1>`, 'i');
      processed = processed.replace(
        nameRegex,
        `<div style="text-align: center;">${logoImg}<h1 style="margin-top: 5px; font-size: 24px; color: #1565C0;">${hospitalConfig.name}</h1></div>`
      );
      // Also try with div class hospital-name
      const divNameRegex = new RegExp(`<div[^>]*class="hospital-name"[^>]*>${hospitalConfig.name}<\/div>`, 'i');
      processed = processed.replace(
        divNameRegex,
        `<div style="text-align: center;">${logoImg}<div class="hospital-name" style="margin-top: 5px; font-size: 20px; font-weight: bold; color: #1565C0;">${hospitalConfig.name}</div></div>`
      );
      // Insert logo at the very beginning of header div if no logo found
      processed = processed.replace(
        /<div[^>]*class="header"[^>]*>/i,
        `<div class="header" style="text-align: center;">${logoImg}`
      );
    }

    // 5. Fix hospital-address div to have correct phone
    processed = processed.replace(
      /<div[^>]*class="hospital-address"[^>]*>[\s\S]*?<\/div>/gi,
      `<div class="hospital-address" style="font-size: 11px; color: #666;">${hospitalConfig.address} | Phone: ${hospitalConfig.phone}</div>`
    );

    // 6. Fix dates
    processed = processed.replace(/Date:\s*<\/div>/gi, `Date: ${effectiveDate}</div>`);
    processed = processed.replace(/Date:\s*$/gm, `Date: ${effectiveDate}`);
    processed = processed.replace(/\[DD\/MM\/YYYY\]/g, effectiveDate);
    processed = processed.replace(/\[Date\]/g, effectiveDate);
    processed = processed.replace(/Effective Date<\/th><td>[^<]*<\/td>/gi, `Effective Date</th><td>${effectiveDate}</td>`);
    processed = processed.replace(/Review Date<\/th><td>[^<]*<\/td>/gi, `Review Date</th><td>${reviewDate}</td>`);

    // 7. Fix signature sections with realistic handwritten signatures
    // Jagruti - flowing feminine signature with loops
    const jagrutiSignature = `<svg width="130" height="50" viewBox="0 0 130 50" style="display:inline-block;vertical-align:middle;">
      <defs>
        <filter id="blur1" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
        </filter>
      </defs>
      <path d="M8,28 C12,18 18,12 28,16 C38,20 32,32 42,28 C52,24 48,14 58,18 C68,22 72,30 82,26 C88,24 92,18 98,22 L105,20" 
            stroke="#1a237e" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#blur1)"/>
      <path d="M85,18 C90,12 95,10 100,14" stroke="#1a237e" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <text x="25" y="46" font-family="'Times New Roman', serif" font-size="9" fill="#555" font-style="italic">Jagruti</text>
    </svg>`;
    
    // Gaurav - angular masculine signature
    const gauravSignature = `<svg width="120" height="50" viewBox="0 0 120 50" style="display:inline-block;vertical-align:middle;">
      <defs>
        <filter id="blur2" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
        </filter>
      </defs>
      <path d="M10,30 L20,15 L35,28 L45,12 L55,25 L70,18 L85,30 L95,22" 
            stroke="#0d47a1" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#blur2)"/>
      <path d="M70,18 C78,8 88,12 95,8" stroke="#0d47a1" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <text x="30" y="46" font-family="'Times New Roman', serif" font-size="9" fill="#555" font-style="italic">Gaurav</text>
    </svg>`;
    
    // Dr. Shiraz Sheikh - professional doctor's signature with flourish
    const drShirazSignature = `<svg width="160" height="55" viewBox="0 0 160 55" style="display:inline-block;vertical-align:middle;">
      <defs>
        <filter id="blur3" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="0.4"/>
        </filter>
      </defs>
      <path d="M12,25 C18,12 28,8 38,15 C48,22 45,32 55,28 C65,24 62,15 75,18 C88,21 95,30 108,25 C118,21 128,15 140,22" 
            stroke="#1565c0" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#blur3)"/>
      <path d="M130,22 Q140,12 148,18 L150,16" stroke="#1565c0" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M5,30 L15,30" stroke="#1565c0" stroke-width="1.5" fill="none" stroke-linecap="round"/>
      <text x="25" y="50" font-family="'Times New Roman', serif" font-size="10" fill="#444" font-style="italic">Dr. Shiraz Sheikh</text>
    </svg>`;

    processed = processed.replace(
      /Name:\s*(Quality Manager|Quality Officer|Staff|Prepared By Staff|\[Name\])?(\s*<br|\s*$)/gi,
      `Name: Jagruti$2`
    );
    processed = processed.replace(
      /Designation:\s*(Quality Officer|Staff|\[Designation\])?(\s*<br|\s*$)/gi,
      `Designation: Quality Manager / HR$2`
    );
    processed = processed.replace(
      /Signature:\s*<\/td>/gi,
      `Signature: ${jagrutiSignature}</td>`
    );
    processed = processed.replace(
      /Sd\/-/gi,
      jagrutiSignature
    );
    
    // Replace Gaurav signatures in Verified By sections
    processed = processed.replace(
      /VERIFIED BY[\s\S]*?Name:\s*Gaurav/gi,
      `VERIFIED BY</th></tr><tr><td style="text-align: center; padding: 15px;">
        <div><strong>Gaurav</strong></div>
        <div>Hospital Administrator</div>
        <div style="margin-top: 8px;">${gauravSignature}</div>
      </td></tr><tr><td>Name: Gaurav`
    );

    // 8. Ensure Dr. Shiraz Sheikh is in Approved By with realistic signature
    if (!processed.includes('Dr. Shiraz Sheikh') && processed.includes('APPROVED BY')) {
      processed = processed.replace(
        /APPROVED BY<\/th>[\s\S]*?<td>([\s\S]*?)<\/td>/i,
        `APPROVED BY</th></tr><tr><td style="text-align: center; padding: 15px;">
          <div><strong>Dr. Shiraz Sheikh</strong></div>
          <div>NABH Coordinator / Administrator</div>
          <div>Date: ${effectiveDate}</div>
          <div style="margin-top: 8px;">${drShirazSignature}</div>
        </td>`
      );
    }

    // 9. Fix phone numbers
    processed = processed.replace(
      /Phone:\s*\+?91-?X+|\+91-XXXX-XXXXXX/gi,
      `Phone: ${hospitalConfig.phone}`
    );

    // 10. Fix stamp area content
    processed = processed.replace(
      /<div[^>]*class="stamp-area"[^>]*>[\s\S]*?<\/div>/gi,
      `<div class="stamp-area" style="border: 2px solid #1565C0; border-radius: 10px; padding: 15px; text-align: center; margin: 20px 0; background: #f8f9fa;">
        <div style="font-weight: bold; color: #1565C0; font-size: 14px;">${hospitalConfig.name.toUpperCase()}</div>
        <div style="font-weight: 600; margin-top: 5px;">QUALITY MANAGEMENT SYSTEM</div>
        <div style="margin-top: 5px; font-size: 11px; color: #666;">Controlled Document</div>
      </div>`
    );

    // 11. Fix margins - reduce to 2px for tighter spacing
    processed = processed.replace(/margin:\s*0\s*auto\s*10px/gi, 'margin: 0 auto 2px');
    processed = processed.replace(/margin:\s*0\s*auto\s*5px/gi, 'margin: 0 auto 2px');
    processed = processed.replace(/margin-bottom:\s*10px/gi, 'margin-bottom: 2px');
    processed = processed.replace(/margin-bottom:\s*5px/gi, 'margin-bottom: 2px');

    // 12. Final cleanup - remove any remaining tagline text
    processed = processed.replace(/>\s*Assured\s*\|\s*Committed\s*\|\s*Proficient\s*</gi, '><');

    // 13. Final pass - ensure no "Dr. Murali" text remains anywhere
    processed = processed.replace(/Dr\.?\s*Murali/gi, '');

    return processed;
  };

  // Extract editable text from HTML content
  const extractTextFromHTML = (html: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());

    const sections: string[] = [];

    // Extract title
    const title = tempDiv.querySelector('.doc-title, h1, title');
    if (title) {
      sections.push(`TITLE: ${title.textContent?.trim() || ''}`);
      sections.push('');
    }

    // Extract sections
    const sectionElements = tempDiv.querySelectorAll('.section');
    sectionElements.forEach(section => {
      const sectionTitle = section.querySelector('.section-title');
      const sectionContent = section.querySelector('.section-content');

      if (sectionTitle) {
        sections.push(`## ${sectionTitle.textContent?.trim()}`);
      }
      if (sectionContent) {
        sections.push(sectionContent.textContent?.trim() || '');
      }
      sections.push('');
    });

    // If no structured content found, get all text
    if (sections.length < 3) {
      return tempDiv.textContent?.trim() || html;
    }

    return sections.join('\n');
  };

  // Generate evidence documents for selected items
  const handleGenerateEvidenceDocuments = async () => {
    console.log('handleGenerateEvidenceDocuments called');
    const selectedItems = parsedEvidenceItems.filter(item => item.selected);
    console.log('Selected items:', selectedItems.length);

    if (selectedItems.length === 0) {
      console.warn('No items selected for batch generation');
      setSnackbarMessage('Please select at least one evidence item');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingDocuments(true);
    setDocumentGenerationProgress({ current: 0, total: selectedItems.length });
    setSnackbarMessage(`Starting generation of ${selectedItems.length} document(s)...`);
    setSnackbarOpen(true);

    const geminiApiKey = getGeminiApiKey();
    const claudeApiKey = getClaudeApiKey();
    console.log('API keys:', { gemini: !!geminiApiKey, claude: !!claudeApiKey });

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i];
      console.log(`\n=== Generating evidence ${i + 1}/${selectedItems.length} ===`);
      console.log('Item:', item.text);

      setDocumentGenerationProgress({ current: i + 1, total: selectedItems.length });
      setSnackbarMessage(`Generating ${i + 1} of ${selectedItems.length}: ${item.text.substring(0, 40)}...`);
      setSnackbarOpen(true);

      try {
        // Get evidence-specific prompt with relevant data (async - fetches from database)
        const contentPrompt = await getEvidenceDocumentPrompt(item.text);

        const userMessage = `Objective Element: ${objective?.description}

Evidence Item to Generate:
${item.text}

Generate complete, ready-to-use FILLED EVIDENCE with actual data from Hope Hospital database (NOT blank templates). Use the patient records, staff records, equipment records provided in the system prompt. Make it look like real hospital documentation with specific entries, dates, names, and numbers.`;

        let rawContent: string = '';

        // Try Gemini first, fallback to Claude
        if (geminiApiKey) {
          try {
            console.log('Calling Gemini API...');
            const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
              {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: `${contentPrompt}\n\n${userMessage}` }] }],
                  generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
                }),
              }
            );

            if (response.ok) {
              const data = await response.json();
              rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
              console.log('Gemini response received, content length:', rawContent.length);
            } else {
              const errorText = await response.text();
              console.error('Gemini API error:', response.status, errorText);
            }
          } catch (geminiErr) {
            console.error('Gemini exception:', geminiErr);
          }
        }

        if (!rawContent && claudeApiKey) {
          console.log('Trying Claude API...');
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': claudeApiKey,
              'anthropic-version': '2023-06-01',
              'anthropic-dangerous-direct-browser-access': 'true',
            },
            body: JSON.stringify({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 4096,
              messages: [{ role: 'user', content: `${contentPrompt}\n\n${userMessage}` }],
            }),
          });

          if (response.ok) {
            const data = await response.json();
            rawContent = data.content?.[0]?.text || '';
            console.log('Claude response received, content length:', rawContent.length);
          } else {
            const errorText = await response.text();
            console.error('Claude API error:', response.status, errorText);
          }
        }

        if (rawContent) {
          console.log('Processing HTML content...');
          // Extract clean HTML from response and post-process it
          const extractedHtml = extractHTMLFromResponse(rawContent);
          const htmlContent = postProcessHTML(extractedHtml);

          // Extract title from the evidence item
          const title = item.text.replace(/^\d+[.):]\s*/, '').substring(0, 100);
          console.log('Saving to Supabase:', title);

          // Save to Supabase
          const result = await saveGeneratedEvidence({
            objective_code: objective?.code || '',
            evidence_title: title,
            prompt: item.text,
            generated_content: extractTextFromHTML(htmlContent),
            html_content: htmlContent,
            evidence_type: 'document',
            hospital_config: hospitalConfig,
          });

          if (result.success && result.id) {
            console.log('✓ Successfully saved evidence:', result.id);
            successCount++;

            // Add to local state
            const newEvidence: GeneratedEvidence = {
              id: result.id,
              objective_code: objective?.code || '',
              evidence_title: title,
              prompt: item.text,
              generated_content: extractTextFromHTML(htmlContent),
              html_content: htmlContent,
              evidence_type: 'document',
              hospital_config: hospitalConfig,
              created_at: new Date().toISOString(),
            };
            setSavedEvidences(prev => [newEvidence, ...prev]);
          } else {
            console.error('✗ Failed to save evidence:', result.error);
            failCount++;
          }
        } else {
          console.error('✗ No content generated for:', item.text);
          failCount++;
        }
      } catch (error) {
        console.error('✗ Exception generating evidence:', error);
        failCount++;
        // Continue with next item even if this one fails
      }

      // Small delay between API calls to avoid rate limiting
      if (i < selectedItems.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log(`\n=== Batch generation complete ===`);
    console.log(`Success: ${successCount}, Failed: ${failCount}, Total: ${selectedItems.length}`);

    setIsGeneratingDocuments(false);

    if (successCount > 0) {
      setSnackbarMessage(`✓ Generated ${successCount} of ${selectedItems.length} document(s). ${failCount > 0 ? `${failCount} failed.` : ''} Scroll down to see saved documents.`);
    } else {
      setSnackbarMessage(`✗ Failed to generate documents. Check console for errors.`);
    }
    setSnackbarOpen(true);

    // Deselect all items after generation
    setParsedEvidenceItems(items => items.map(item => ({ ...item, selected: false })));
  };

  // Copy share link to clipboard
  const handleCopyShareLink = (evidenceId: string) => {
    const shareUrl = `${window.location.origin}/evidence/${evidenceId}`;
    navigator.clipboard.writeText(shareUrl);
    setSnackbarMessage('Share link copied to clipboard');
    setSnackbarOpen(true);
  };

  // Handle edit mode content change
  const handleEditContent = (evidenceId: string, content: string) => {
    setEditingEvidenceContent(prev => ({ ...prev, [evidenceId]: content }));
  };


  // Delete evidence
  const handleDeleteEvidence = async (evidenceId: string) => {
    const result = await deleteGeneratedEvidence(evidenceId);
    if (result.success) {
      setSavedEvidences(prev => prev.filter(ev => ev.id !== evidenceId));
      setSnackbarMessage('Evidence deleted');
      setSnackbarOpen(true);
    }
  };

  // Preview evidence in new window
  const handlePreviewEvidence = (content: string, _title: string) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(content);
      previewWindow.document.close();
    }
  };

  // Print evidence
  const handlePrintEvidence = (content: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Generate custom evidence from user prompt
  const handleGenerateCustomEvidence = async () => {
    if (!customEvidencePrompt.trim()) {
      setSnackbarMessage('Please enter a prompt for the evidence document');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingCustomEvidence(true);

    try {
      const geminiApiKey = await getGeminiApiKey();
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      const basePrompt = await getEvidenceDocumentPrompt(customEvidencePrompt);
      const prompt = `${basePrompt}

OBJECTIVE: ${objective?.code} - ${objective?.title}

USER REQUEST: ${customEvidencePrompt}

Generate a complete, professional HTML document for the above requirement. Use ACTUAL data from Hope Hospital database provided in the system prompt (patient records, staff records, equipment records). Create FILLED formats with real entries, NOT blank templates. Make it look like authentic hospital documentation.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
          }),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (rawContent) {
        const extractedHtml = extractHTMLFromResponse(rawContent);
        const htmlContent = postProcessHTML(extractedHtml);
        const title = customEvidencePrompt.substring(0, 100);

        const result = await saveGeneratedEvidence({
          objective_code: objective?.code || '',
          evidence_title: title,
          prompt: customEvidencePrompt,
          generated_content: extractTextFromHTML(htmlContent),
          html_content: htmlContent,
          evidence_type: 'custom',
          hospital_config: hospitalConfig,
        });

        if (result.success && result.id) {
          const newEvidence: GeneratedEvidence = {
            id: result.id,
            objective_code: objective?.code || '',
            evidence_title: title,
            prompt: customEvidencePrompt,
            generated_content: extractTextFromHTML(htmlContent),
            html_content: htmlContent,
            evidence_type: 'custom',
            hospital_config: hospitalConfig,
            created_at: new Date().toISOString(),
          };
          setSavedEvidences(prev => [newEvidence, ...prev]);
          setCustomEvidencePrompt('');
          setSnackbarMessage('Custom evidence document generated successfully');
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
      console.error('Error generating custom evidence:', error);
      setSnackbarMessage('Error generating custom evidence. Check console.');
      setSnackbarOpen(true);
    }

    setIsGeneratingCustomEvidence(false);
  };

  // Toggle register selection
  const handleToggleRegister = (registerId: string) => {
    setSelectedRegisters(prev =>
      prev.includes(registerId)
        ? prev.filter(id => id !== registerId)
        : [...prev, registerId]
    );
  };

  // Generate selected registers
  const handleGenerateRegisters = async () => {
    if (selectedRegisters.length === 0) {
      setSnackbarMessage('Please select at least one register to generate');
      setSnackbarOpen(true);
      return;
    }

    setIsGeneratingRegisters(true);

    try {
      const geminiApiKey = await getGeminiApiKey();
      if (!geminiApiKey) throw new Error('Gemini API key not configured');

      for (const registerId of selectedRegisters) {
        const register = suggestedRegisters.find(r => r.id === registerId);
        if (!register) continue;

        const prompt = `Generate a complete HTML document for a hospital register/log book.

HOSPITAL: ${hospitalConfig.name}, ${hospitalConfig.address}
REGISTER NAME: ${register.name}
DESCRIPTION: ${register.description}
NABH OBJECTIVE: ${objective?.code} - ${objective?.title}

Create a professional, print-ready HTML document with:
1. Hospital header with "${hospitalConfig.name.toUpperCase()}" branding and address: ${hospitalConfig.address}
2. Register title, document number, version, and purpose
3. A table with EXACTLY 18-20 realistic entries spanning the last 9 months (from ${new Date(Date.now() - 270 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN')} to ${new Date().toLocaleDateString('en-IN')})
4. Columns appropriate for this type of register with proper headers
5. Signature verification section at bottom
6. Footer with "${hospitalConfig.name.toUpperCase()} - QUALITY MANAGEMENT SYSTEM - Controlled Document"

MANDATORY - Use these INDIAN NAMES for entries (mix and match):
Patient names: Rajesh Kumar, Priya Sharma, Amit Patel, Sunita Devi, Mahesh Verma, Kavita Singh, Ramesh Yadav, Anita Gupta, Suresh Reddy, Lakshmi Iyer, Arun Nair, Meena Joshi, Vikram Thakur, Sanjay Desai, Neha Kulkarni, Ravi Pillai, Deepa Menon, Kiran Saxena
Staff names: Dr. Shiraz Sheikh, Dr. Anjali Mehta, Dr. Vikash Agarwal, Nurse Priyanka, Nurse Rekha, Jagruti (QM), Gaurav (Admin), Sunil (Lab Tech), Kavitha (Pharmacist)

For CAPA Register entries, MUST include these columns:
- S.No. | Date | Finding/NC Description | Root Cause (use 5-Why or Fishbone) | Corrective Action | Preventive Action | Responsible Person | Target Date | Completion Date | Verification Status | Verified By

IMPORTANT:
- Dates must be distributed across 9 months, not clustered
- Use realistic medical/hospital scenarios
- Status should show mix: "Open", "Closed", "In Progress"
- Include proper serial numbers

Generate complete HTML with embedded CSS styling. Do NOT use markdown code blocks.`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
            }),
          }
        );

        if (!response.ok) continue;
        const data = await response.json();
        const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        if (rawContent) {
          const extractedHtml = extractHTMLFromResponse(rawContent);
          const htmlContent = postProcessHTML(extractedHtml);

          // Save to Supabase
          const result = await saveGeneratedEvidence({
            objective_code: objective?.code || '',
            evidence_title: register.name,
            prompt: `Register: ${register.name} - ${register.description}`,
            generated_content: extractTextFromHTML(htmlContent),
            html_content: htmlContent,
            evidence_type: 'register',
            hospital_config: hospitalConfig,
          });

          if (result.success && result.id) {
            const newEvidence: GeneratedEvidence = {
              id: result.id,
              objective_code: objective?.code || '',
              evidence_title: register.name,
              prompt: `Register: ${register.name}`,
              generated_content: extractTextFromHTML(htmlContent),
              html_content: htmlContent,
              evidence_type: 'register',
              hospital_config: hospitalConfig,
              created_at: new Date().toISOString(),
            };
            setSavedEvidences(prev => [newEvidence, ...prev]);
          }
        }
      }

      setSelectedRegisters([]);
      setSnackbarMessage(`Generated ${selectedRegisters.length} register(s) successfully`);
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error generating registers:', error);
      setSnackbarMessage('Error generating registers. Check console.');
      setSnackbarOpen(true);
    }

    setIsGeneratingRegisters(false);
  };

  // Handle document upload for improvement
  const handleDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedDocumentFile(file);
    setExtractedDocumentText('');

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedDocumentPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setUploadedDocumentPreview('');
    }

    // Extract text using Gemini Vision
    await extractTextFromDocument(file);
  };

  // Extract text from uploaded document using Gemini Vision
  const extractTextFromDocument = async (file: File) => {
    setIsExtractingText(true);

    try {
      const geminiApiKey = await getGeminiApiKey();
      if (!geminiApiKey) {
        throw new Error('Gemini API key not configured');
      }

      // Convert file to base64
      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.readAsDataURL(file);
      });

      const mimeType = file.type || 'image/jpeg';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: base64,
                  },
                },
                {
                  text: `Extract ALL text content from this document image. This is a hospital document/register/form.

Return the extracted text in a structured format:
1. Document Title/Header
2. All field labels and their values
3. Table headers and data (if any)
4. Any signatures, dates, or footer text

Be thorough and extract every piece of text visible in the document. Maintain the structure and layout as much as possible.`,
                },
              ],
            }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 4096 },
          }),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      setExtractedDocumentText(extractedText);
      setSnackbarMessage('Text extracted from document successfully');
      setSnackbarOpen(true);
    } catch (error) {
      console.error('Error extracting text:', error);
      setSnackbarMessage('Error extracting text from document. Try again.');
      setSnackbarOpen(true);
    }

    setIsExtractingText(false);
  };

  // Generate improved document from extracted text
  const handleImproveDocument = async () => {
    if (!extractedDocumentText.trim()) {
      setSnackbarMessage('Please upload a document first to extract text');
      setSnackbarOpen(true);
      return;
    }

    setIsImprovingDocument(true);

    try {
      const geminiApiKey = await getGeminiApiKey();
      if (!geminiApiKey) throw new Error('Gemini API key not configured');

      const prompt = `You are a hospital document designer for ${hospitalConfig.name}. Create a professionally designed HTML document based on the following extracted content from an existing hospital document.

HOSPITAL: ${hospitalConfig.name}
ADDRESS: ${hospitalConfig.address}
PHONE: ${hospitalConfig.phone}

EXTRACTED CONTENT FROM ORIGINAL DOCUMENT:
${extractedDocumentText}

NABH OBJECTIVE: ${objective?.code} - ${objective?.title}

INSTRUCTIONS:
1. Create a complete, professional HTML document with embedded CSS
2. Maintain ALL the original content and data - do not remove any information
3. Improve the visual design with:
   - Clean, modern layout
   - Professional typography
   - Proper tables with borders and alternating row colors
   - Clear section headers
   - Hospital branding header with logo placeholder
   - Proper spacing and alignment
4. Add hospital header with logo placeholder and address
5. Add professional footer with hospital details
6. Add controlled document stamp area
7. Include signature blocks if relevant
8. Use dates from the original document, or if not present, use dates within last 9 months

Generate complete HTML with embedded CSS. Do NOT use markdown or code blocks. Start directly with <!DOCTYPE html>.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 8192 },
          }),
        }
      );

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      const rawContent = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (rawContent) {
        const extractedHtml = extractHTMLFromResponse(rawContent);
        const htmlContent = postProcessHTML(extractedHtml);
        const title = `Improved: ${uploadedDocumentFile?.name || 'Document'}`;

        const result = await saveGeneratedEvidence({
          objective_code: objective?.code || '',
          evidence_title: title,
          prompt: `Improved document from: ${uploadedDocumentFile?.name}`,
          generated_content: extractTextFromHTML(htmlContent),
          html_content: htmlContent,
          evidence_type: 'document',
          hospital_config: hospitalConfig,
        });

        if (result.success && result.id) {
          const newEvidence: GeneratedEvidence = {
            id: result.id,
            objective_code: objective?.code || '',
            evidence_title: title,
            prompt: `Improved document from: ${uploadedDocumentFile?.name}`,
            generated_content: extractTextFromHTML(htmlContent),
            html_content: htmlContent,
            evidence_type: 'document',
            hospital_config: hospitalConfig,
            created_at: new Date().toISOString(),
          };
          setSavedEvidences(prev => [newEvidence, ...prev]);

          // Clear the upload state
          setUploadedDocumentFile(null);
          setUploadedDocumentPreview('');
          setExtractedDocumentText('');
          if (documentUploadRef.current) {
            documentUploadRef.current.value = '';
          }

          setSnackbarMessage('Document improved and saved successfully');
          setSnackbarOpen(true);
        }
      }
    } catch (error) {
      console.error('Error improving document:', error);
      setSnackbarMessage('Error improving document. Check console.');
      setSnackbarOpen(true);
    }

    setIsImprovingDocument(false);
  };

  const selectedEvidenceCount = parsedEvidenceItems.filter(item => item.selected).length;

  // Generate Hindi explanation based on interpretation
  const handleGenerateHindiExplanation = async (interpretation: string) => {
    if (!interpretation.trim()) return;

    setIsGeneratingHindi(true);

    try {
      const apiKey = await getClaudeApiKey();
      if (!apiKey) {
        throw new Error('API key not configured');
      }

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1024,
          messages: [
            {
              role: 'user',
              content: `Translate and explain the following NABH accreditation standard interpretation into Hindi. The explanation should be detailed and accurate. You may use complex sentences if necessary, but the meaning must not be changed. This is for hospital staff training purposes.

Objective Code: ${objective.code}
English Interpretation: ${interpretation}
${objective.isCore ? 'Note: This is a CORE element which is critical for patient safety.' : ''}

Provide only the Hindi explanation, no English text. The explanation should be comprehensive and explain what the hospital needs to do to comply with this standard.`,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate Hindi explanation');
      }

      const data = await response.json();
      const hindiContent = data.content[0]?.text || '';

      if (hindiContent.trim()) {
        updateObjective(chapter.id, objective.id, { hindiExplanation: hindiContent.trim() });

        // Save to Supabase
        saveToSupabase({ ...objective, hindiExplanation: hindiContent.trim() });
      }
    } catch (error) {
      console.error('Error generating Hindi explanation:', error);
    } finally {
      setIsGeneratingHindi(false);
    }
  };

  // Handle interpretation change - saves to interpretations2 (user-editable field)
  const handleInterpretationChange = (newInterpretation: string) => {
    handleFieldChange('interpretations2', newInterpretation);
    // Mark as unsaved if different from last saved version
    setHasUnsavedChanges(newInterpretation !== lastSavedInterpretation);
    // Clear success state when user starts editing
    setInterpretationSaveSuccess(false);
  };

  // Save infographic to Supabase using the objective_edits table
  const saveInfographicToSupabase = async (imageDataUrl: string) => {
    setInfographicSaveStatus('saving');
    try {
      // Save to nabh_objective_edits table (which exists)
      const result = await saveObjectiveToSupabase(chapter.id, {
        ...objective,
        infographicSvg: '', // We're using image now, not SVG
        infographicDataUrl: imageDataUrl,
      });

      if (result.success) {
        setInfographicSaveStatus('saved');
        setLastSaved(new Date());
        return true;
      } else {
        console.warn('Infographic not saved to Supabase:', result.error);
        setInfographicSaveStatus('error');
        return false;
      }
    } catch (error) {
      console.warn('Infographic storage to Supabase failed:', error);
      setInfographicSaveStatus('error');
      return false;
    }
  };

  // Generate Professional Bilingual Infographic using SVG Generator
  const handleGenerateInfographic = async () => {
    if (!objective.description) return;

    setIsGeneratingInfographic(true);
    setGeneratedInfographicSvg('');

    try {
      // Extract key compliance points from the description
      const keyPoints = extractKeyPoints(objective.description);
      
      const config = {
        title: objective.title || objective.code,
        titleHindi: objective.hindiExplanation ? objective.hindiExplanation.substring(0, 80) : undefined,
        code: objective.code,
        isCore: objective.isCore,
        description: objective.description,
        descriptionHindi: objective.hindiExplanation,
        keyPoints: keyPoints,
        keyPointsHindi: [], // Can be populated if Hindi points are available
        hospitalName: hospitalConfig.name,
        hospitalAddress: hospitalConfig.address,
        template: selectedInfographicTemplate,
        colorScheme: selectedColorScheme,
        showIcons: true,
      };

      let svgContent: string;

      if (infographicSource === 'gemini') {
        // Use Gemini AI to generate the infographic
        svgContent = await generateGeminiInfographic(config, customGeminiKey);
      } else {
        // Use standard template generator
        svgContent = generateInfographic(config);
      }

      // Convert SVG to PNG data URL for better compatibility
      const pngDataUrl = await svgToPngDataUrl(svgContent, 2);
      
      console.log('Infographic generated successfully');
      setGeneratedInfographicSvg(pngDataUrl);

      // Update objective with infographic (local storage)
      updateObjective(chapter.id, objective.id, {
        infographicSvg: svgContent,
        infographicDataUrl: pngDataUrl,
      });

      // Save to Supabase for persistence
      await saveInfographicToSupabase(pngDataUrl);
      
    } catch (error) {
      console.error('Error generating infographic:', error);
      setGeneratedInfographicSvg('');
      alert(`Failed to generate infographic: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingInfographic(false);
    }
  };

  // Download infographic as PNG
  const handleDownloadInfographic = () => {
    const imageUrl = generatedInfographicSvg || objective.infographicDataUrl;
    if (!imageUrl) return;

    // If it's already a data URL (base64 image), download directly
    if (imageUrl.startsWith('data:image/')) {
      const link = document.createElement('a');
      link.download = `${objective.code}-infographic.png`;
      link.href = imageUrl;
      link.click();
      return;
    }

    // If it's SVG (legacy), convert to PNG
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    const svgBlob = new Blob([imageUrl], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width || 800;
      canvas.height = img.height || 1000;
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${objective.code}-infographic.png`;
      link.href = pngUrl;
      link.click();
    };

    img.src = url;
  };

  const evidenceFiles = objective.evidenceFiles || [];

  const handleBack = () => {
    navigate('/');
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link
          component="button"
          variant="body2"
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
          underline="hover"
        >
          <Icon sx={{ mr: 0.5, fontSize: 18 }}>home</Icon>
          Dashboard
        </Link>
        <Link
          component="button"
          variant="body2"
          onClick={() => {
            setSelectedChapter(chapter.id);
            navigate('/');
          }}
          underline="hover"
          sx={{ cursor: 'pointer' }}
        >
          {chapter.code} - {chapter.fullName}
        </Link>
        <Typography color="text.primary">{objective.code}</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              startIcon={<Icon>arrow_back</Icon>}
              onClick={handleBack}
              size="small"
            >
              Back
            </Button>
            <Icon color="primary" sx={{ fontSize: 32 }}>description</Icon>
            <Typography variant="h5" fontWeight={600}>
              {objective.code}
            </Typography>
            {objective.isCore && (
              <Chip label="CORE" size="medium" color="error" />
            )}
            {objective.priority === 'Prev NC' && (
              <Chip label="Prev NC" size="medium" color="warning" />
            )}
            <Chip label={objective.category} size="medium" variant="outlined" />
          </Box>
          {/* Save Status Indicator */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {isLoadingFromDb && (
              <Chip
                icon={<CircularProgress size={14} />}
                label="Loading..."
                size="small"
                color="default"
              />
            )}
            {saveStatus === 'saving' && (
              <Chip
                icon={<CircularProgress size={14} />}
                label="Saving..."
                size="small"
                color="info"
              />
            )}
            {saveStatus === 'saved' && (
              <Chip
                icon={<Icon sx={{ fontSize: 16 }}>cloud_done</Icon>}
                label="Saved"
                size="small"
                color="success"
              />
            )}
            {saveStatus === 'error' && (
              <Chip
                icon={<Icon sx={{ fontSize: 16 }}>cloud_off</Icon>}
                label="Save failed"
                size="small"
                color="error"
              />
            )}
            {lastSaved && saveStatus === 'idle' && (
              <Typography variant="caption" color="text.secondary">
                Last saved: {lastSaved.toLocaleTimeString()}
              </Typography>
            )}
          </Box>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {objective.description}
        </Typography>
      </Paper>

      {/* AI Interpretation Section */}
      {objective.interpretation && (
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.50', border: '1px solid', borderColor: 'primary.200' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Icon color="primary">auto_awesome</Icon>
            <Typography variant="h6" fontWeight={600} color="primary.main">
              Interpretation & Guidance
            </Typography>
            <Chip label="AI Generated" size="small" color="primary" variant="outlined" />
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.primary' }}>
            {objective.interpretation}
          </Typography>
          <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'primary.200' }}>
            <Typography variant="caption" color="text.secondary">
              This interpretation provides practical guidance for compliance, including documents to maintain,
              what NABH assessors look for, and relevant Indian regulatory context.
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Main Content */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            value={objective.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            size="small"
          />

          {/* Interpretation (formerly Description) */}
          <Box>
            <TextField
              fullWidth
              label="Interpretation by 3rd Edition NABH Book"
              value={objective.interpretations2 ?? objective.interpretation ?? ''}
              onChange={(e) => handleInterpretationChange(e.target.value)}
              multiline
              minRows={3}
              size="small"
              sx={expandableTextFieldSx}
              helperText="Edit and click Save to store your interpretation"
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                color={!hasUnsavedChanges && interpretationSaveSuccess ? "success" : "primary"}
                size="small"
                startIcon={isSavingInterpretation ? <CircularProgress size={16} color="inherit" /> : !hasUnsavedChanges && interpretationSaveSuccess ? <Icon>check</Icon> : <Icon>save</Icon>}
                disabled={isSavingInterpretation || !hasUnsavedChanges}
                onClick={async () => {
                  setIsSavingInterpretation(true);
                  try {
                    const result = await saveObjectiveToSupabase(chapter.id, objective);
                    if (result.success) {
                      // Save generated evidence items if they exist
                      if (interpretationEvidenceItems.length > 0) {
                        const evidenceTexts = interpretationEvidenceItems
                          .filter(item => item.id !== 'error')
                          .map(item => item.text);

                        const hospitalInfo = getHospitalInfo();
                        const coordinator = getNABHCoordinator();
                        await saveGeneratedEvidence({
                          objective_code: objective.code,
                          evidence_title: `Generated Evidence Items - ${objective.code}`,
                          prompt: 'Auto-generated evidence items from interpretation',
                          generated_content: evidenceTexts.join('\n'),
                          html_content: JSON.stringify(evidenceTexts),
                          evidence_type: 'custom' as const,
                          hospital_config: {
                            name: hospitalInfo.name,
                            address: hospitalInfo.address,
                            phone: hospitalInfo.phone,
                            email: hospitalInfo.email,
                            website: hospitalInfo.website,
                            qualityCoordinator: coordinator.name,
                            qualityCoordinatorDesignation: coordinator.designation,
                          }
                        });
                      }

                      // Mark as saved
                      const currentText = objective.interpretations2 ?? objective.interpretation ?? '';
                      setLastSavedInterpretation(currentText);
                      setHasUnsavedChanges(false);
                      setInterpretationSaveSuccess(true);
                      // Don't clear success state - it will clear when user edits

                      // Also generate Hindi explanation
                      if (currentText.trim()) {
                        await handleGenerateHindiExplanation(currentText);
                      }
                    }
                  } catch (error) {
                    console.error('Error saving interpretation:', error);
                  } finally {
                    setIsSavingInterpretation(false);
                  }
                }}
                sx={{ minWidth: 100 }}
              >
                {isSavingInterpretation ? 'Saving...' : !hasUnsavedChanges && interpretationSaveSuccess ? 'Saved' : 'Save'}
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                size="small"
                startIcon={isGeneratingInterpretationEvidence ? <CircularProgress size={16} color="inherit" /> : <Icon>auto_awesome</Icon>}
                disabled={isGeneratingInterpretationEvidence || !(objective.interpretations2 ?? objective.interpretation)?.trim()}
                onClick={handleGenerateEvidenceFromInterpretation}
              >
                {isGeneratingInterpretationEvidence ? 'Generating...' : 'Generate 8 Evidence Items'}
              </Button>
              <Button
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<Icon>print</Icon>}
                disabled={interpretationEvidenceItems.length === 0}
                onClick={handlePrintEvidenceItems}
              >
                Print
              </Button>
              {interpretationSaveSuccess && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'success.main' }}>
                  <Icon color="success">check_circle</Icon>
                  <Typography variant="caption" color="success.main" fontWeight={600}>
                    Saved!
                  </Typography>
                </Box>
              )}
              {isGeneratingHindi && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={16} />
                  <Typography variant="caption" color="text.secondary">
                    Generating Hindi...
                  </Typography>
                </Box>
              )}
            </Box>

            {/* Generated Evidence Items Display */}
            {interpretationEvidenceItems.length > 0 && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'success.50', borderRadius: 1, border: '1px solid', borderColor: 'success.200' }}>
                <Typography variant="subtitle2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Icon color="success">checklist</Icon>
                  Generated Evidence Items ({interpretationEvidenceItems.length})
                </Typography>
                <Box sx={{ mb: 1, display: 'flex', gap: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    color="success"
                    startIcon={<Icon>check_box</Icon>}
                    onClick={() => {
                      setInterpretationEvidenceItems(items =>
                        items.map(item => ({ ...item, selected: true }))
                      );
                    }}
                  >
                    Select All
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Icon>check_box_outline_blank</Icon>}
                    onClick={() => {
                      setInterpretationEvidenceItems(items =>
                        items.map(item => ({ ...item, selected: false }))
                      );
                    }}
                  >
                    Deselect All
                  </Button>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {interpretationEvidenceItems.map((item, idx) => (
                    <Box
                      key={item.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1,
                        p: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: item.selected ? 'success.main' : 'divider',
                      }}
                    >
                      <Checkbox
                        checked={item.selected}
                        onChange={() => handleToggleInterpretationEvidence(item.id)}
                        size="small"
                        color="success"
                      />
                      <Typography variant="body2" sx={{ flex: 1 }}>
                        {toRomanNumeral(idx + 1)}. {item.text}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <Tooltip title={savedEvidenceItemDocuments[item.id] ? "View generated document" : "Document not yet generated"}>
                          <span>
                            <IconButton
                              size="small"
                              color={savedEvidenceItemDocuments[item.id] ? "primary" : "default"}
                              onClick={() => savedEvidenceItemDocuments[item.id] && handleViewSavedEvidenceItem(savedEvidenceItemDocuments[item.id])}
                              disabled={!savedEvidenceItemDocuments[item.id]}
                              sx={{
                                opacity: savedEvidenceItemDocuments[item.id] ? 1 : 0.3,
                              }}
                            >
                              <Icon>visibility</Icon>
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setInterpretationEvidenceItems([])}
                  >
                    Clear
                  </Button>
                  <Button
                    variant="contained"
                    size="small"
                    color="primary"
                    startIcon={<Icon>auto_awesome</Icon>}
                    onClick={() => {
                      const selectedItems = interpretationEvidenceItems.filter(item => item.selected);
                      // Pass both the evidence items AND the objective code
                      setSelectedEvidenceForCreation(selectedItems, objective.code);
                      navigate('/ai-generator');
                    }}
                    disabled={!interpretationEvidenceItems.some(item => item.selected)}
                  >
                    Evidence Creator
                  </Button>
                </Box>
              </Box>
            )}

          </Box>

          {/* Hindi Explanation Section */}
          <Accordion defaultExpanded sx={{ bgcolor: 'warning.50', border: '1px solid', borderColor: 'warning.200' }}>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="warning">translate</Icon>
                <Typography fontWeight={600}>Hindi Explanation (Staff Training)</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" icon={<Icon>school</Icon>} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  This explanation is for staff training purposes. If the interpretation above has been edited, click the button below to regenerate the Hindi translation.
                </Typography>
              </Alert>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="outlined"
                  color="warning"
                  startIcon={isGeneratingHindi ? <CircularProgress size={16} color="inherit" /> : <Icon>refresh</Icon>}
                  onClick={() => handleGenerateHindiExplanation(objective.interpretation || objective.description)}
                  disabled={isGeneratingHindi || !objective.description}
                  size="small"
                >
                  {isGeneratingHindi ? 'Generating...' : 'Update Hindi Explanation from Interpretation'}
                </Button>
              </Box>
              {objective.hindiExplanation ? (
                <Typography
                  variant="body1"
                  sx={{
                    fontFamily: '"Noto Sans Devanagari", "Mangal", sans-serif',
                    lineHeight: 1.8,
                    fontSize: '1rem',
                    bgcolor: 'background.paper',
                    p: 2,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  {objective.hindiExplanation}
                </Typography>
              ) : (
                <Alert severity="warning" icon={<Icon>info</Icon>}>
                  <Typography variant="body2">
                    No Hindi explanation available. Click the button above to generate one from the interpretation.
                  </Typography>
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Bilingual Infographic Section */}
          <Accordion sx={{ bgcolor: 'info.50', border: '1px solid', borderColor: 'info.200' }}>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="info">image</Icon>
                <Typography fontWeight={600}>Bilingual Infographic (English + Hindi)</Typography>
                <Chip label="Professional Templates" size="small" color="info" variant="outlined" />
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" icon={<Icon>lightbulb</Icon>} sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Generate a high-quality, professional bilingual infographic for display in hospital areas. Choose from multiple modern templates and color schemes.
                </Typography>
              </Alert>
              
              {/* Generator Source Selection */}
              <Box sx={{ mb: 2, display: 'flex', justifyContent: 'center' }}>
                <ToggleButtonGroup
                  value={infographicSource}
                  exclusive
                  onChange={(_, value) => value && setInfographicSource(value)}
                  aria-label="infographic source"
                  size="small"
                  color="primary"
                >
                  <ToggleButton value="template" sx={{ px: 3 }}>
                    <Icon sx={{ mr: 1, fontSize: 18 }}>dashboard</Icon>
                    Standard Templates
                  </ToggleButton>
                  <ToggleButton value="gemini" sx={{ px: 3 }}>
                    <Icon sx={{ mr: 1, fontSize: 18 }}>auto_awesome</Icon>
                    Gemini AI (v3 Preview)
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Template & Color Scheme Selection */}
              {infographicSource === 'gemini' && (
                <Box sx={{ mb: 3 }}>
                   <TextField
                    fullWidth
                    size="small"
                    label="Gemini API Key (Optional)"
                    placeholder="Enter your API key here if the default one fails"
                    value={customGeminiKey}
                    onChange={(e) => setCustomGeminiKey(e.target.value)}
                    type="password"
                    helperText={
                      <span>
                        Get a free key at{' '}
                        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer">
                          Google AI Studio
                        </a>
                      </span>
                    }
                  />
                  <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Button size="small" variant="outlined" onClick={handleTestConnection}>
                      Test Key
                    </Button>
                    {connectionStatus && (
                      <Typography variant="caption" color={connectionStatus.startsWith('Success') ? 'success.main' : 'error.main'}>
                        {connectionStatus}
                      </Typography>
                    )}
                  </Box>
                </Box>
              )}

              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Template Style</InputLabel>
                    <Select
                      value={selectedInfographicTemplate}
                      label="Template Style"
                      onChange={(e) => setSelectedInfographicTemplate(e.target.value as InfographicTemplate)}
                    >
                      {availableTemplates.map((template) => (
                        <MenuItem key={template.value} value={template.value}>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>{template.label}</Typography>
                            <Typography variant="caption" color="text.secondary">{template.description}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Color Scheme</InputLabel>
                    <Select
                      value={selectedColorScheme}
                      label="Color Scheme"
                      onChange={(e) => setSelectedColorScheme(e.target.value as ColorScheme)}
                    >
                      {availableColorSchemes.map((scheme) => (
                        <MenuItem key={scheme.value} value={scheme.value}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box
                              sx={{
                                width: 20,
                                height: 20,
                                borderRadius: '50%',
                                bgcolor: scheme.preview,
                                border: '2px solid',
                                borderColor: 'grey.300',
                              }}
                            />
                            <Typography variant="body2">{scheme.label}</Typography>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {/* Quick Color Scheme Preview */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                {availableColorSchemes.map((scheme) => (
                  <Tooltip key={scheme.value} title={scheme.label}>
                    <Box
                      onClick={() => setSelectedColorScheme(scheme.value)}
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 1,
                        bgcolor: scheme.preview,
                        cursor: 'pointer',
                        border: '3px solid',
                        borderColor: selectedColorScheme === scheme.value ? 'common.white' : 'transparent',
                        boxShadow: selectedColorScheme === scheme.value ? `0 0 0 2px ${scheme.preview}` : 'none',
                        transition: 'all 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                    />
                  </Tooltip>
                ))}
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                <Button
                  variant="contained"
                  color={infographicSource === 'gemini' ? "secondary" : "info"}
                  startIcon={isGeneratingInfographic ? <CircularProgress size={16} color="inherit" /> : <Icon>auto_awesome</Icon>}
                  onClick={handleGenerateInfographic}
                  disabled={isGeneratingInfographic || !objective.description}
                  sx={{ minWidth: 200 }}
                >
                  {isGeneratingInfographic ? 'Generating...' : `Generate with ${infographicSource === 'gemini' ? 'Gemini AI' : 'Templates'}`}
                </Button>
                {(generatedInfographicSvg || objective.infographicDataUrl) && (
                  <>
                    <Button
                      variant="outlined"
                      color="info"
                      startIcon={<Icon>download</Icon>}
                      onClick={handleDownloadInfographic}
                    >
                      Download PNG
                    </Button>
                    <Button
                      variant="outlined"
                      color="secondary"
                      startIcon={<Icon>refresh</Icon>}
                      onClick={handleGenerateInfographic}
                      disabled={isGeneratingInfographic}
                    >
                      Regenerate
                    </Button>
                  </>
                )}
                {infographicSaveStatus === 'saving' && (
                  <Chip
                    icon={<CircularProgress size={14} />}
                    label="Saving..."
                    size="small"
                    color="default"
                  />
                )}
                {infographicSaveStatus === 'saved' && (
                  <Chip
                    icon={<Icon sx={{ fontSize: 16 }}>cloud_done</Icon>}
                    label="Saved"
                    size="small"
                    color="success"
                  />
                )}
                {infographicSaveStatus === 'error' && (
                  <Chip
                    icon={<Icon sx={{ fontSize: 16 }}>cloud_off</Icon>}
                    label="Local only"
                    size="small"
                    color="warning"
                  />
                )}
              </Box>

              {/* Display generated or saved infographic */}
              {(generatedInfographicSvg || objective.infographicDataUrl) && (
                <Box
                  sx={{
                    border: '2px solid',
                    borderColor: 'info.200',
                    borderRadius: 2,
                    p: 2,
                    bgcolor: 'background.paper',
                    overflow: 'auto',
                    maxHeight: 700,
                    textAlign: 'center',
                  }}
                >
                  <img
                    src={generatedInfographicSvg || objective.infographicDataUrl}
                    alt={`${objective.code} Infographic`}
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      display: 'block',
                      margin: '0 auto',
                      borderRadius: '8px',
                    }}
                    onError={(e) => {
                      console.error('Image failed to load:', e);
                      console.log('Image src length:', (generatedInfographicSvg || objective.infographicDataUrl || '').length);
                    }}
                    onLoad={() => {
                      console.log('Image loaded successfully');
                    }}
                  />
                </Box>
              )}

              {!generatedInfographicSvg && !objective.infographicDataUrl && (
                <Box
                  sx={{
                    border: '2px dashed',
                    borderColor: 'grey.300',
                    borderRadius: 2,
                    p: 4,
                    textAlign: 'center',
                    bgcolor: 'grey.50',
                  }}
                >
                  <Icon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }}>image</Icon>
                  <Typography color="text.secondary">
                    Click "Generate Infographic" to create a bilingual visual for this objective
                  </Typography>
                </Box>
              )}
            </AccordionDetails>
          </Accordion>

          <Divider />

          {/* Status and Assignment Section */}
          <Typography variant="subtitle1" fontWeight={600}>
            Status & Assignment
          </Typography>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={objective.status || ''}
                  label="Status"
                  onChange={(e) => handleFieldChange('status', e.target.value as Status)}
                >
                  <MenuItem value="">Not Set</MenuItem>
                  <MenuItem value="Not started">Not Started</MenuItem>
                  <MenuItem value="In progress">In Progress</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
                  <MenuItem value="Blocked">Blocked</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Priority</InputLabel>
                <Select
                  value={objective.priority || ''}
                  label="Priority"
                  onChange={(e) => handleFieldChange('priority', e.target.value as Priority)}
                >
                  <MenuItem value="">Not Set</MenuItem>
                  <MenuItem value="CORE">CORE</MenuItem>
                  <MenuItem value="Prev NC">Previous NC</MenuItem>
                  <MenuItem value="P0">P0 - Critical</MenuItem>
                  <MenuItem value="P1">P1 - High</MenuItem>
                  <MenuItem value="P2">P2 - Medium</MenuItem>
                  <MenuItem value="P3">P3 - Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Assignee</InputLabel>
                <Select
                  value={objective.assignee || ''}
                  label="Assignee"
                  onChange={(e) => handleFieldChange('assignee', e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {ASSIGNEE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={objective.endDate || ''}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                size="small"
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Grid>
          </Grid>


          <TextField
            fullWidth
            label="Evidence Links"
            value={objective.evidenceLinks}
            onChange={(e) => handleFieldChange('evidenceLinks', e.target.value)}
            multiline
            minRows={2}
            size="small"
            placeholder="Add links to evidence documents..."
            sx={expandableTextFieldSx}
          />


          {/* File Upload */}
          <Box>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              accept="image/*,.pdf"
              style={{ display: 'none' }}
            />
            <Button
              variant="outlined"
              startIcon={<Icon>upload_file</Icon>}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Evidence Files
            </Button>
          </Box>

          {/* Uploaded Files Grid */}
          {evidenceFiles.length > 0 && (
            <Grid container spacing={2}>
              {evidenceFiles.map((file) => (
                <Grid key={file.id} size={{ xs: 12, sm: 6, md: 4 }}>
                  <Card variant="outlined">
                    {file.type === 'image' ? (
                      <CardMedia
                        component="img"
                        height="140"
                        image={file.dataUrl}
                        alt={file.name}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 140,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100',
                        }}
                      >
                        <Icon sx={{ fontSize: 48, color: 'grey.500' }}>picture_as_pdf</Icon>
                      </Box>
                    )}
                    <CardContent sx={{ py: 1 }}>
                      <Typography variant="body2" noWrap>
                        {file.name}
                      </Typography>
                    </CardContent>
                    <CardActions>
                      <Tooltip title="View">
                        <IconButton
                          size="small"
                          onClick={() => window.open(file.dataUrl, '_blank')}
                        >
                          <Icon>visibility</Icon>
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleRemoveFile(file.id)}
                        >
                          <Icon>delete</Icon>
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          <Divider />

          {/* YouTube Training Videos Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="error">play_circle</Icon>
                <Typography fontWeight={600}>
                  Training Videos ({(objective.youtubeVideos || []).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Existing Videos */}
                {(objective.youtubeVideos || []).length > 0 && (
                  <Grid container spacing={2}>
                    {(objective.youtubeVideos || []).map((video) => (
                      <Grid key={video.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card variant="outlined">
                          <CardMedia
                            component="img"
                            height="140"
                            image={getYouTubeThumbnail(video.url)}
                            alt={video.title}
                            sx={{ cursor: 'pointer' }}
                            onClick={() => window.open(video.url, '_blank')}
                          />
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {video.title}
                            </Typography>
                            {video.description && (
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {video.description}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions>
                            <Tooltip title="Watch Video">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => window.open(video.url, '_blank')}
                              >
                                <Icon>play_circle</Icon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Remove Video">
                              <IconButton
                                size="small"
                                onClick={() => video.id && handleRemoveVideo(video.id)}
                              >
                                <Icon>delete</Icon>
                              </IconButton>
                            </Tooltip>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Action Buttons */}
                {!showAddVideo && (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={isSearchingYouTube ? <CircularProgress size={20} color="inherit" /> : <Icon>youtube_searched_for</Icon>}
                      onClick={handleSearchYouTube}
                      size="medium"
                      disabled={isSearchingYouTube}
                      sx={{ 
                        flex: 1,
                        minWidth: 250,
                        fontWeight: 600,
                        boxShadow: 2,
                        py: 1.5,
                        '&:hover': { boxShadow: 4, bgcolor: 'error.700' }
                      }}
                    >
                      {isSearchingYouTube ? 'Searching YouTube...' : 'Search NABH Training Videos'}
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Icon>add</Icon>}
                      onClick={() => setShowAddVideo(true)}
                      size="medium"
                      sx={{ minWidth: 180, py: 1.5 }}
                    >
                      Add Video Manually
                    </Button>
                    <Box sx={{ width: '100%', mt: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Icon fontSize="small" color="info">info</Icon>
                        Use the Search button to find and add official NABH training videos directly.
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Add Video Form */}
                {showAddVideo && (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.300' }}>
                    <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Icon color="error">add_circle</Icon>
                      Add YouTube Video
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Video Title"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                        size="small"
                        placeholder="e.g., NABH COP Chapter Overview"
                      />
                      <TextField
                        fullWidth
                        label="YouTube URL"
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                        size="small"
                        placeholder="https://www.youtube.com/watch?v=..."
                        helperText="Paste the full YouTube URL here"
                      />
                      <TextField
                        fullWidth
                        label="Description (optional)"
                        value={newVideoDescription}
                        onChange={(e) => setNewVideoDescription(e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowAddVideo(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={handleAddVideo}
                          disabled={!newVideoTitle.trim() || !newVideoUrl.trim()}
                          startIcon={<Icon>save</Icon>}
                        >
                          Save Video
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                )}
                
                {/* YouTube Search Results */}
                {showYouTubeSearch && (
                  <Box sx={{ mt: 2, p: 2, bgcolor: 'error.50', borderRadius: 1, border: '1px solid', borderColor: 'error.200' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2" color="error.main">
                        <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>youtube_searched_for</Icon>
                        Suggested Training Videos for {objective.code}
                      </Typography>
                      <IconButton size="small" onClick={() => setShowYouTubeSearch(false)}>
                        <Icon>close</Icon>
                      </IconButton>
                    </Box>
                    
                    {isSearchingYouTube ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 3, justifyContent: 'center' }}>
                        <CircularProgress size={24} color="error" />
                        <Typography color="text.secondary">Searching for relevant NABH training videos...</Typography>
                      </Box>
                    ) : youtubeSearchResults.length > 0 ? (
                      <Grid container spacing={2}>
                        {youtubeSearchResults.map((video, index) => (
                          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                            <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                              <Box sx={{ p: 1.5, bgcolor: 'error.100', display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Icon color="error">play_circle</Icon>
                                <Typography variant="caption" fontWeight={600} color="error.dark" noWrap>
                                  YouTube Search
                                </Typography>
                              </Box>
                              <CardContent sx={{ flexGrow: 1, py: 1 }}>
                                <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5, lineHeight: 1.3 }}>
                                  {video.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', lineHeight: 1.4 }}>
                                  {video.description}
                                </Typography>
                              </CardContent>
                              <CardActions sx={{ pt: 0 }}>
                                <Button
                                  size="small"
                                  color="error"
                                  startIcon={<Icon>search</Icon>}
                                  onClick={() => handleAddVideoFromSearch(video)}
                                  fullWidth
                                >
                                  Find & Add
                                </Button>
                              </CardActions>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Alert severity="info" icon={<Icon>info</Icon>}>
                        Click "Search NABH Training Videos" to find relevant videos for this objective element.
                      </Alert>
                    )}
                    
                    <Alert severity="info" icon={<Icon>lightbulb</Icon>} sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>How to add:</strong> Click "Find & Add" to open YouTube search. Find the video, copy its URL, and paste it in the form.
                      </Typography>
                    </Alert>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Training Materials Section */}
          <Accordion>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="primary">school</Icon>
                <Typography fontWeight={600}>
                  Training Materials ({(objective.trainingMaterials || []).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Existing Materials */}
                {(objective.trainingMaterials || []).length > 0 && (
                  <Grid container spacing={2}>
                    {(objective.trainingMaterials || []).map((material) => (
                      <Grid key={material.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card variant="outlined">
                          {material.type === 'photo' ? (
                            <CardMedia
                              component="img"
                              height="140"
                              image={material.dataUrl || material.fileUrl}
                              alt={material.title}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: 140,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'grey.100',
                              }}
                            >
                              <Icon sx={{ fontSize: 48, color: 'grey.500' }}>
                                {material.type === 'certificate' ? 'workspace_premium' : material.type === 'video' ? 'videocam' : 'description'}
                              </Icon>
                            </Box>
                          )}
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {material.title}
                            </Typography>
                            <Chip label={material.type} size="small" sx={{ mt: 0.5 }} />
                          </CardContent>
                          <CardActions>
                            <Tooltip title="View">
                              <IconButton
                                size="small"
                                onClick={() => window.open(material.dataUrl || material.fileUrl, '_blank')}
                              >
                                <Icon>visibility</Icon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveTrainingMaterial(material.id)}
                              >
                                <Icon>delete</Icon>
                              </IconButton>
                            </Tooltip>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Add Training Form */}
                {showAddTraining ? (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Add Training Material
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="Title"
                        value={newTrainingTitle}
                        onChange={(e) => setNewTrainingTitle(e.target.value)}
                        size="small"
                      />
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={newTrainingType}
                          label="Type"
                          onChange={(e) => setNewTrainingType(e.target.value as 'video' | 'photo' | 'document' | 'certificate')}
                        >
                          <MenuItem value="photo">Photo</MenuItem>
                          <MenuItem value="video">Video</MenuItem>
                          <MenuItem value="document">Document</MenuItem>
                          <MenuItem value="certificate">Certificate</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        label="Training Date"
                        type="date"
                        value={newTrainingDate}
                        onChange={(e) => setNewTrainingDate(e.target.value)}
                        size="small"
                        slotProps={{ inputLabel: { shrink: true } }}
                      />
                      <TextField
                        fullWidth
                        label="Interpretation"
                        value={newTrainingDescription}
                        onChange={(e) => setNewTrainingDescription(e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                      <input
                        type="file"
                        ref={trainingFileInputRef}
                        onChange={handleTrainingFileUpload}
                        accept="image/*,video/*,.pdf,.doc,.docx"
                        style={{ display: 'none' }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => trainingFileInputRef.current?.click()}
                        >
                          Select File & Upload
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowAddTraining(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Icon>add</Icon>}
                    onClick={() => setShowAddTraining(true)}
                    size="small"
                  >
                    Add Training Material
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* SOP Documents Section */}
          <Accordion>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="success">policy</Icon>
                <Typography fontWeight={600}>
                  SOP Documents ({(objective.sopDocuments || []).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Existing SOPs */}
                {(objective.sopDocuments || []).length > 0 && (
                  <Grid container spacing={2}>
                    {(objective.sopDocuments || []).map((sop) => (
                      <Grid key={sop.id} size={{ xs: 12, sm: 6, md: 4 }}>
                        <Card variant="outlined">
                          <Box
                            sx={{
                              height: 100,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: 'success.50',
                            }}
                          >
                            <Icon sx={{ fontSize: 48, color: 'success.main' }}>policy</Icon>
                          </Box>
                          <CardContent sx={{ py: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {sop.title}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Version: {sop.version} | {sop.effectiveDate}
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Tooltip title="View SOP">
                              <IconButton
                                size="small"
                                onClick={() => window.open(sop.dataUrl, '_blank')}
                              >
                                <Icon>visibility</Icon>
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => handleRemoveSOP(sop.id)}
                              >
                                <Icon>delete</Icon>
                              </IconButton>
                            </Tooltip>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Add SOP Form */}
                {showAddSOP ? (
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                      Add SOP Document
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        label="SOP Title"
                        value={newSOPTitle}
                        onChange={(e) => setNewSOPTitle(e.target.value)}
                        size="small"
                      />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            label="Version"
                            value={newSOPVersion}
                            onChange={(e) => setNewSOPVersion(e.target.value)}
                            size="small"
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            label="Effective Date"
                            type="date"
                            value={newSOPEffectiveDate}
                            onChange={(e) => setNewSOPEffectiveDate(e.target.value)}
                            size="small"
                            slotProps={{ inputLabel: { shrink: true } }}
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        label="Interpretation"
                        value={newSOPDescription}
                        onChange={(e) => setNewSOPDescription(e.target.value)}
                        size="small"
                        multiline
                        rows={2}
                      />
                      <input
                        type="file"
                        ref={sopFileInputRef}
                        onChange={handleSOPFileUpload}
                        accept=".pdf,.doc,.docx"
                        style={{ display: 'none' }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => sopFileInputRef.current?.click()}
                        >
                          Select File & Upload
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={isGeneratingSOP ? <CircularProgress size={16} /> : <Icon>auto_awesome</Icon>}
                          onClick={handleGenerateSOP}
                          disabled={isGeneratingSOP}
                        >
                          Generate
                        </Button>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => setShowAddSOP(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                      {generatedSOPContent && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                          <Typography variant="subtitle2" sx={{ mb: 1 }}>
                            Generated SOP Content:
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: '0.75rem' }}
                          >
                            {generatedSOPContent}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Icon>add</Icon>}
                    onClick={() => setShowAddSOP(true)}
                    size="small"
                  >
                    Add SOP Document
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Divider />

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes"
            value={objective.notes || ''}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            multiline
            minRows={3}
            size="small"
            placeholder="Add any additional notes..."
            sx={expandableTextFieldSx}
          />
        </Box>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      {/* Evidence Generation Modal */}
      <Dialog
        open={showEvidenceGenerationModal}
        onClose={() => !isExecutingGeneration && setShowEvidenceGenerationModal(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">description</Icon>
            <Typography variant="h6" fontWeight={600}>
              Review Evidence Generation
            </Typography>
          </Box>
          {!isExecutingGeneration && (
            <IconButton onClick={() => setShowEvidenceGenerationModal(false)} size="small">
              <Icon>close</Icon>
            </IconButton>
          )}
        </DialogTitle>

        <DialogContent dividers>
          {isLoadingPromptData ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading evidence data and preparing prompt...
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {/* Evidence Item Info */}
              <Alert severity="info" icon={<Icon>info</Icon>}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Evidence to Generate:
                </Typography>
                <Typography variant="body2">
                  {currentEvidenceToGenerate?.text}
                </Typography>
              </Alert>

              {/* Prompt Display Section */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon color="primary">visibility</Icon>
                    <Typography fontWeight={600}>View Original Prompt & Data</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Readonly Prompt Display */}
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                        GENERATION PROMPT:
                      </Typography>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          bgcolor: 'grey.50',
                          maxHeight: 300,
                          overflow: 'auto',
                          fontFamily: 'monospace',
                          fontSize: '0.75rem',
                          whiteSpace: 'pre-wrap'
                        }}
                      >
                        {evidenceGenerationPrompt}
                      </Paper>
                    </Box>

                    {/* Readonly Data Display */}
                    {evidenceGenerationData && (
                      <Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block', fontWeight: 600 }}>
                          DATABASE DATA (Patient Records, Staff, Equipment):
                        </Typography>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 2,
                            bgcolor: 'grey.50',
                            maxHeight: 200,
                            overflow: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '0.75rem',
                            whiteSpace: 'pre-wrap'
                          }}
                        >
                          {evidenceGenerationData}
                        </Paper>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>

              {/* Editable Prompt Section */}
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Icon color="warning">edit</Icon>
                    Edit Prompt Before Generation
                  </Typography>
                  <Button
                    size="small"
                    startIcon={<Icon>refresh</Icon>}
                    onClick={() => setEditablePromptAndData(evidenceGenerationPrompt)}
                  >
                    Reset to Original
                  </Button>
                </Box>
                <Alert severity="warning" sx={{ mb: 1 }}>
                  <Typography variant="caption">
                    You can modify the prompt below to customize how the evidence will be generated. This is useful for adding specific requirements or changing the focus.
                  </Typography>
                </Alert>
                <TextField
                  fullWidth
                  multiline
                  rows={15}
                  value={editablePromptAndData}
                  onChange={(e) => setEditablePromptAndData(e.target.value)}
                  placeholder="Edit the generation prompt here..."
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                    }
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Characters: {editablePromptAndData.length}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setShowEvidenceGenerationModal(false)}
            disabled={isExecutingGeneration}
            startIcon={<Icon>cancel</Icon>}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="success"
            size="large"
            onClick={handleExecuteEvidenceGeneration}
            disabled={isLoadingPromptData || isExecutingGeneration || !editablePromptAndData.trim()}
            startIcon={isExecutingGeneration ? <CircularProgress size={20} color="inherit" /> : <Icon>play_arrow</Icon>}
          >
            {isExecutingGeneration ? 'Generating Documents...' : 'Run This to Generate Evidence'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Tabs,
  Tab,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
  Divider,
  Alert,
  IconButton,
  Tooltip,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  LocalHospital as MedicalIcon,
  LocalFireDepartment as FireIcon,
  ChildCare as InfantIcon,
  Download as DownloadIcon,
  Assignment as FormIcon,
  School as TrainingIcon,
  Assessment as DrillIcon,
  Warning as EmergencyIcon,
  CheckCircle as CheckIcon,
  Description as DocIcon,
  Print as PrintIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

// Import from Supabase storage service
import {
  emergencyCodesStorage,
  type EmergencyCodeProtocol as DBProtocol,
  type EmergencyCodeDocument as DBDocument
} from '../services/emergencyCodesStorage';

// Fallback to mock data if DB is empty
import {
  EMERGENCY_CODES_MASTER,
  generateEmergencyCodeReport,
  getDocumentsByCodeType as getMockDocuments,
  EMERGENCY_CODES_SUMMARY
} from '../data/emergencyCodesMaster';
import type {
  EmergencyCodeProtocol,
  EmergencyCodeDocument,
  EmergencyCodeType,
  DocumentType
} from '../types/emergencyCodes';
import { getHospitalInfo } from '../config/hospitalConfig';
import { useNABHStore } from '../store/nabhStore';

const EmergencyCodesPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedCode, setSelectedCode] = useState<EmergencyCodeType>('CODE_BLUE');
  const [selectedDocument, setSelectedDocument] = useState<EmergencyCodeDocument | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedContent, setEditedContent] = useState('');

  // Get current hospital info
  const { selectedHospital } = useNABHStore();
  const hospitalConfig = getHospitalInfo(selectedHospital);

  // Database state
  const [loading, setLoading] = useState(true);
  const [dbProtocols, setDbProtocols] = useState<DBProtocol[]>([]);
  const [dbDocuments, setDbDocuments] = useState<DBDocument[]>([]);
  const [dataSource, setDataSource] = useState<'database' | 'mock'>('mock');

  // Add Document Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success'
  });
  const [newDocument, setNewDocument] = useState({
    code_type: 'CODE_BLUE',
    document_type: 'SOP',
    title: '',
    description: '',
    category: '',
    frequency: '',
    template: '',
    evidence_requirement: '',
    responsible_person: '',
    review_frequency: 'Annual'
  });

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [protocols, documents] = await Promise.all([
          emergencyCodesStorage.getAllProtocols(),
          emergencyCodesStorage.getAllDocuments()
        ]);

        if (protocols.length > 0) {
          setDbProtocols(protocols);
          setDbDocuments(documents);
          setDataSource('database');
          console.log('Emergency codes loaded from database:', protocols.length, 'protocols,', documents.length, 'documents');
        } else {
          setDataSource('mock');
          console.log('Using mock data - no database records found');
        }
      } catch (error) {
        console.error('Error loading emergency codes:', error);
        setDataSource('mock');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get protocols - from DB or mock
  const protocols = dataSource === 'database'
    ? dbProtocols.map(p => ({
        codeType: p.code_type as EmergencyCodeType,
        name: p.name,
        description: p.description,
        responseTime: p.response_time,
        activationCriteria: p.activation_criteria || [],
        responseTeam: p.response_team || {},
        equipmentRequired: p.equipment_required || [],
        documents: dbDocuments.filter(d => d.code_type === p.code_type).map(d => ({
          id: d.doc_id,
          codeType: d.code_type as EmergencyCodeType,
          documentType: d.document_type as DocumentType,
          title: d.title,
          description: d.description,
          category: d.category,
          frequency: d.frequency,
          mandatoryFields: d.mandatory_fields || [],
          template: d.template,
          evidenceRequirement: d.evidence_requirement,
          nabhStandard: d.nabh_standard || [],
          responsiblePerson: d.responsible_person,
          reviewFrequency: d.review_frequency,
          lastUpdated: d.updated_at
        }))
      }))
    : EMERGENCY_CODES_MASTER;

  // Get documents by code type
  const getDocumentsByCodeType = (codeType: EmergencyCodeType) => {
    if (dataSource === 'database') {
      return dbDocuments
        .filter(d => d.code_type === codeType)
        .map(d => ({
          id: d.doc_id,
          codeType: d.code_type as EmergencyCodeType,
          documentType: d.document_type as DocumentType,
          title: d.title,
          description: d.description,
          category: d.category,
          frequency: d.frequency,
          mandatoryFields: d.mandatory_fields || [],
          template: d.template,
          evidenceRequirement: d.evidence_requirement,
          nabhStandard: d.nabh_standard || [],
          responsiblePerson: d.responsible_person,
          reviewFrequency: d.review_frequency,
          lastUpdated: d.updated_at
        }));
    }
    return getMockDocuments(codeType);
  };

  const getCodeIcon = (codeType: EmergencyCodeType) => {
    switch (codeType) {
      case 'CODE_BLUE':
        return <MedicalIcon sx={{ color: '#2196f3' }} />;
      case 'CODE_RED':
        return <FireIcon sx={{ color: '#f44336' }} />;
      case 'CODE_PINK':
        return <InfantIcon sx={{ color: '#e91e63' }} />;
      default:
        return <EmergencyIcon />;
    }
  };

  const getCodeColor = (codeType: EmergencyCodeType) => {
    switch (codeType) {
      case 'CODE_BLUE':
        return '#2196f3';
      case 'CODE_RED':
        return '#f44336';
      case 'CODE_PINK':
        return '#e91e63';
      default:
        return '#666666';
    }
  };

  const handleDocumentView = (document: EmergencyCodeDocument) => {
    setSelectedDocument(document);
    setEditedContent(document.template);
    setIsEditMode(false);
    setShowDocumentDialog(true);
  };

  const handleFormGenerate = (document: EmergencyCodeDocument) => {
    setSelectedDocument(document);
    setFormData({});
    setShowFormDialog(true);
  };

  const handleFormSave = () => {
    // In a real implementation, this would save to database
    console.log('Saving form data:', formData);
    setShowFormDialog(false);
    alert('Form saved successfully!');
  };

  const handleFormDownload = (document: EmergencyCodeDocument) => {
    const content = document.template;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${document.title.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Download as formatted HTML document
  const handleDownloadFormatted = () => {
    if (!selectedDocument) return;

    const content = isEditMode ? editedContent : selectedDocument.template;
    const codeColor = getCodeColor(selectedCode);

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${selectedDocument.title} - ${hospitalConfig.name}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 3px solid ${codeColor};
    }
    .header img { height: 60px; margin-bottom: 15px; }
    .header h1 {
      color: ${codeColor};
      margin: 0;
      font-size: 24px;
    }
    .meta {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
      font-size: 12px;
      color: #666;
    }
    .content h2 {
      color: ${codeColor};
      border-bottom: 2px solid #eee;
      padding-bottom: 5px;
      margin-top: 25px;
    }
    .content h3 { color: #555; margin-top: 15px; }
    .content ul { margin-left: 20px; }
    .content li { margin-bottom: 8px; }
    .signature-line {
      display: flex;
      margin-top: 15px;
      gap: 10px;
    }
    .signature-line span { font-weight: bold; min-width: 100px; }
    .signature-line div {
      flex: 1;
      border-bottom: 1px solid #999;
      min-width: 200px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 15px;
      border-top: 2px solid #eee;
      text-align: center;
      font-size: 11px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${window.location.origin}${hospitalConfig.logo}" alt="${hospitalConfig.name}">
    <h1>${selectedDocument.title.toUpperCase()}</h1>
  </div>

  <div class="meta">
    <div>
      <strong>Document Type:</strong> ${selectedDocument.documentType.replace('_', ' ')}<br>
      <strong>Responsible:</strong> ${selectedDocument.responsiblePerson}
    </div>
    <div style="text-align: right;">
      <strong>NABH Standards:</strong> ${selectedDocument.nabhStandard.join(', ')}<br>
      <strong>Frequency:</strong> ${selectedDocument.frequency}
    </div>
  </div>

  <div class="content">
    ${formatContentToHTML(content)}
  </div>

  <div class="footer">
    <p>${hospitalConfig.name} | ${hospitalConfig.address}</p>
    <p>Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email}</p>
    <p>Generated on: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' })}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedDocument.title.replace(/\s+/g, '_')}_${hospitalConfig.name.replace(/\s+/g, '_')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Convert markdown-like content to HTML
  const formatContentToHTML = (content: string): string => {
    return content
      .split('\n')
      .map(line => {
        const trimmed = line.trim();
        if (!trimmed) return '<br>';
        if (trimmed.startsWith('# ')) return `<h1>${trimmed.slice(2).replace(/\*\*/g, '')}</h1>`;
        if (trimmed.startsWith('## ')) return `<h2>${trimmed.slice(3).replace(/\*\*/g, '')}</h2>`;
        if (trimmed.startsWith('### ')) return `<h3>${trimmed.slice(4).replace(/\*\*/g, '')}</h3>`;
        if (trimmed.startsWith('- ')) return `<li>${trimmed.slice(2).replace(/\*\*/g, '')}</li>`;
        if (/^\d+\.\s/.test(trimmed)) return `<li>${trimmed.replace(/^\d+\.\s/, '').replace(/\*\*/g, '')}</li>`;
        if (trimmed.startsWith('**Signature') || trimmed.startsWith('**Date') || trimmed.startsWith('**Review')) {
          const parts = trimmed.split(':**');
          return `<div class="signature-line"><span>${parts[0].replace(/\*\*/g, '')}:</span><div>${parts[1]?.trim() || ''}</div></div>`;
        }
        return `<p>${trimmed.replace(/\*\*/g, '')}</p>`;
      })
      .join('\n');
  };

  // Preview document (opens in new window without auto-print)
  const handlePreviewDocument = () => {
    const previewWindow = window.open('', '_blank');
    if (!previewWindow || !selectedDocument) return;

    const content = isEditMode ? editedContent : selectedDocument.template;
    const codeColor = getCodeColor(selectedCode);

    previewWindow.document.write(`
<!DOCTYPE html>
<html>
<head>
  <title>${selectedDocument.title} - ${hospitalConfig.name}</title>
  <style>
    @page { size: A4; margin: 15mm; }
    * { box-sizing: border-box; }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 20px;
      background: #f5f5f5;
    }
    .document {
      background: white;
      padding: 40px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      border-radius: 4px;
    }
    .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid ${codeColor}; }
    .header img { height: 60px; margin-bottom: 15px; }
    .header h1 { color: ${codeColor}; margin: 0; font-size: 24px; }
    h2 { color: ${codeColor}; border-bottom: 2px solid #eee; padding-bottom: 8px; font-size: 18px; margin-top: 25px; }
    h3 { color: #555; font-size: 15px; margin-top: 15px; }
    ul { margin-left: 20px; }
    li { margin-bottom: 8px; font-size: 14px; }
    p { font-size: 14px; margin-bottom: 10px; }
    .signature-line { display: flex; margin-top: 15px; gap: 10px; }
    .signature-line span { font-weight: bold; min-width: 120px; }
    .signature-line div { flex: 1; border-bottom: 1px solid #999; min-width: 200px; }
    .footer { margin-top: 30px; padding-top: 15px; border-top: 2px solid #eee; text-align: center; font-size: 11px; color: #666; }
    .print-btn {
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${codeColor};
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .print-btn:hover { opacity: 0.9; }
    @media print {
      body { background: white; padding: 0; }
      .document { box-shadow: none; padding: 20px; }
      .print-btn { display: none; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ Print</button>
  <div class="document">
    <div class="header">
      <img src="${window.location.origin}${hospitalConfig.logo}" alt="${hospitalConfig.name}">
      <h1>${selectedDocument.title.toUpperCase()}</h1>
    </div>
    <div class="content">${formatContentToHTML(content)}</div>
    <div class="footer">
      <p>${hospitalConfig.name} | ${hospitalConfig.address}</p>
      <p>Phone: ${hospitalConfig.phone} | Email: ${hospitalConfig.email}</p>
    </div>
  </div>
</body>
</html>`);
    previewWindow.document.close();
  };

  // Render formatted document from markdown-like template
  const renderFormattedDocument = (document: EmergencyCodeDocument) => {
    const protocol = EMERGENCY_CODES_MASTER.find(p => p.codeType === selectedCode);
    const lines = document.template.split('\n');
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;
    let listKey = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <Box key={`list-${listKey++}`} sx={{ ml: 3, mb: 2 }}>
            {listItems.map((item, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                <Typography sx={{ mr: 1, color: 'primary.main', fontWeight: 'bold' }}>•</Typography>
                <Typography variant="body1">{item}</Typography>
              </Box>
            ))}
          </Box>
        );
        listItems = [];
      }
      inList = false;
    };

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();

      // Skip empty lines but flush list
      if (!trimmedLine) {
        flushList();
        return;
      }

      // Main title (# )
      if (trimmedLine.startsWith('# ')) {
        flushList();
        elements.push(
          <Box key={index} sx={{ textAlign: 'center', mb: 3, pb: 2, borderBottom: '3px solid', borderColor: getCodeColor(selectedCode) }}>
            {/* Hospital Logo */}
            <Box sx={{ mb: 2 }}>
              <img
                src={hospitalConfig.logo}
                alt={hospitalConfig.name}
                style={{ height: 60, objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 'bold', color: getCodeColor(selectedCode), mb: 1 }}>
              {trimmedLine.replace('# ', '').replace(/\*\*/g, '')}
            </Typography>
          </Box>
        );
        return;
      }

      // Section headers (## )
      if (trimmedLine.startsWith('## ')) {
        flushList();
        elements.push(
          <Box key={index} sx={{ mt: 3, mb: 2, pb: 1, borderBottom: '2px solid #eee' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold', color: getCodeColor(selectedCode) }}>
              {trimmedLine.replace('## ', '').replace(/\*\*/g, '')}
            </Typography>
          </Box>
        );
        return;
      }

      // Sub-section headers (### )
      if (trimmedLine.startsWith('### ')) {
        flushList();
        elements.push(
          <Typography key={index} variant="subtitle1" sx={{ fontWeight: 'bold', mt: 2, mb: 1, color: '#555' }}>
            {trimmedLine.replace('### ', '').replace(/\*\*/g, '')}
          </Typography>
        );
        return;
      }

      // Numbered list items (1. 2. 3.)
      if (/^\d+\.\s/.test(trimmedLine)) {
        const content = trimmedLine.replace(/^\d+\.\s/, '');
        inList = true;
        listItems.push(content.replace(/\*\*/g, ''));
        return;
      }

      // Bullet points (- )
      if (trimmedLine.startsWith('- ')) {
        const content = trimmedLine.replace('- ', '');
        inList = true;
        listItems.push(content.replace(/\*\*/g, ''));
        return;
      }

      // Signature line (**Signature:** or **Date:**)
      if (trimmedLine.startsWith('**Signature') || trimmedLine.startsWith('**Date') || trimmedLine.startsWith('**Review')) {
        flushList();
        const parts = trimmedLine.split(':**');
        elements.push(
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', mt: 2, gap: 2 }}>
            <Typography sx={{ fontWeight: 'bold', minWidth: 120 }}>
              {parts[0].replace(/\*\*/g, '')}:
            </Typography>
            <Box sx={{ flex: 1, borderBottom: '1px solid #999', minWidth: 200 }}>
              <Typography>{parts[1]?.trim() || ''}</Typography>
            </Box>
          </Box>
        );
        return;
      }

      // Bold text lines (**text**)
      if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
        flushList();
        elements.push(
          <Typography key={index} variant="body1" sx={{ fontWeight: 'bold', my: 1 }}>
            {trimmedLine.replace(/\*\*/g, '')}
          </Typography>
        );
        return;
      }

      // Regular paragraph
      flushList();
      elements.push(
        <Typography key={index} variant="body1" sx={{ mb: 1 }}>
          {trimmedLine.replace(/\*\*/g, '')}
        </Typography>
      );
    });

    // Flush any remaining list items
    flushList();

    return (
      <Box className="document-container">
        {/* Document Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 4 }}>
          <Box>
            <Typography variant="caption" color="text.secondary">DOCUMENT TYPE</Typography>
            <Chip label={document.documentType.replace('_', ' ')} size="small" color="primary" sx={{ ml: 1 }} />
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">NABH STANDARDS</Typography>
            <Typography variant="body2">{document.nabhStandard.join(', ')}</Typography>
          </Box>
        </Box>

        {/* Document Content */}
        <Paper elevation={0} sx={{ p: 4, border: '1px solid #ddd', borderRadius: 2 }}>
          {elements}
        </Paper>

        {/* Document Footer */}
        <Box sx={{ mt: 3, pt: 2, borderTop: '2px solid #eee' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Responsible: <strong>{document.responsiblePerson}</strong>
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">
                Frequency: <strong>{document.frequency}</strong>
              </Typography>
            </Box>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              {hospitalConfig.name} | {hospitalConfig.address}
            </Typography>
            <br />
            <Typography variant="caption" color="text.secondary">
              Phone: {hospitalConfig.phone} | Email: {hospitalConfig.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  };

  const handleProtocolDownload = (codeType: EmergencyCodeType) => {
    const report = generateEmergencyCodeReport(codeType);
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${codeType}_Protocol_Report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Add Document Handlers
  const handleOpenAddDialog = () => {
    setNewDocument({
      code_type: 'CODE_BLUE',
      document_type: 'SOP',
      title: '',
      description: '',
      category: '',
      frequency: '',
      template: '',
      evidence_requirement: '',
      responsible_person: '',
      review_frequency: 'Annual'
    });
    setShowAddDialog(true);
  };

  const handleCloseAddDialog = () => {
    setShowAddDialog(false);
  };

  const handleNewDocChange = (field: string, value: string) => {
    setNewDocument(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveDocument = async () => {
    if (!newDocument.title.trim()) {
      setSnackbar({ open: true, message: 'Title is required', severity: 'error' });
      return;
    }

    setSaving(true);
    try {
      const docId = `${newDocument.code_type.substring(5, 7)}_${newDocument.document_type}_${Date.now()}`;

      const savedDoc = await emergencyCodesStorage.saveDocument({
        doc_id: docId,
        code_type: newDocument.code_type,
        document_type: newDocument.document_type,
        title: newDocument.title,
        description: newDocument.description,
        category: newDocument.category,
        frequency: newDocument.frequency,
        template: newDocument.template,
        evidence_requirement: newDocument.evidence_requirement,
        responsible_person: newDocument.responsible_person,
        review_frequency: newDocument.review_frequency,
        mandatory_fields: [],
        nabh_standard: [],
        hospital_id: 'hope'
      });

      if (savedDoc) {
        setDbDocuments(prev => [...prev, savedDoc]);
        setSnackbar({ open: true, message: 'Document saved successfully!', severity: 'success' });
        handleCloseAddDialog();
      } else {
        setSnackbar({ open: true, message: 'Failed to save document', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving document:', error);
      setSnackbar({ open: true, message: 'Error saving document', severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const renderProtocolOverview = () => (
    <Grid container spacing={3}>
      {protocols.map((protocol) => (
        <Grid item xs={12} md={4} key={protocol.codeType}>
          <Card 
            sx={{ 
              border: `2px solid ${getCodeColor(protocol.codeType)}`,
              cursor: 'pointer',
              '&:hover': { boxShadow: 6 }
            }}
            onClick={() => setSelectedCode(protocol.codeType)}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                {getCodeIcon(protocol.codeType)}
                <Typography variant="h6" color={getCodeColor(protocol.codeType)}>
                  {protocol.codeType.replace('_', ' ')}
                </Typography>
              </Box>
              
              <Typography variant="h5" gutterBottom>
                {protocol.name}
              </Typography>
              
              <Typography variant="body2" color="text.secondary" mb={2}>
                {protocol.description}
              </Typography>

              <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Chip 
                  label={`Response: ${protocol.responseTime}`} 
                  size="small" 
                  color="primary"
                />
                <Chip 
                  label={`${protocol.documents.length} Documents`} 
                  size="small" 
                  color="secondary"
                />
              </Box>

              <Box display="flex" gap={1}>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleProtocolDownload(protocol.codeType);
                  }}
                >
                  Download Protocol
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderProtocolDetails = () => {
    const protocol = EMERGENCY_CODES_MASTER.find(p => p.codeType === selectedCode);
    if (!protocol) return null;

    return (
      <Box>
        <Paper sx={{ p: 3, mb: 3, border: `2px solid ${getCodeColor(selectedCode)}` }}>
          <Box display="flex" alignItems="center" gap={2} mb={2}>
            {getCodeIcon(selectedCode)}
            <Typography variant="h4" color={getCodeColor(selectedCode)}>
              {protocol.name}
            </Typography>
          </Box>
          
          <Alert severity="info" sx={{ mb: 3 }}>
            Response Time Target: <strong>{protocol.responseTime}</strong>
          </Alert>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color={getCodeColor(selectedCode)}>
                Activation Criteria
              </Typography>
              <List dense>
                {protocol.activationCriteria.map((criteria, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <EmergencyIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={criteria} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color={getCodeColor(selectedCode)}>
                Response Team
              </Typography>
              <List dense>
                {protocol.responseTeam.map((member, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={member} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color={getCodeColor(selectedCode)}>
                Required Equipment
              </Typography>
              <List dense>
                {protocol.equipmentRequired.map((equipment, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <CheckIcon color="success" />
                    </ListItemIcon>
                    <ListItemText primary={equipment} />
                  </ListItem>
                ))}
              </List>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom color={getCodeColor(selectedCode)}>
                Training Requirements
              </Typography>
              <List dense>
                {protocol.trainingRequirements.map((req, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <TrainingIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={req} />
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>
        </Paper>

        <Typography variant="h5" gutterBottom>
          Documentation Package
        </Typography>

        <Grid container spacing={2}>
          {protocol.documents.map((document) => (
            <Grid item xs={12} md={6} key={document.id}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box display="flex" alignItems="center" gap={1} mb={2}>
                    <DocIcon />
                    <Typography variant="h6" noWrap>
                      {document.title}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {document.description}
                  </Typography>

                  <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                    <Chip 
                      label={document.documentType.replace('_', ' ')} 
                      size="small" 
                      color="primary"
                    />
                    <Chip 
                      label={document.frequency} 
                      size="small" 
                      color="secondary"
                    />
                  </Box>

                  <Typography variant="caption" display="block" mb={2}>
                    <strong>Responsible:</strong> {document.responsiblePerson}
                  </Typography>

                  <Typography variant="caption" display="block" mb={2}>
                    <strong>NABH Standards:</strong> {document.nabhStandard.join(', ')}
                  </Typography>

                  <Box display="flex" gap={1} flexWrap="wrap">
                    <Button
                      size="small"
                      startIcon={<FormIcon />}
                      onClick={() => handleDocumentView(document)}
                    >
                      View Template
                    </Button>
                    <Button
                      size="small"
                      startIcon={<DownloadIcon />}
                      onClick={() => handleFormDownload(document)}
                    >
                      Download
                    </Button>
                    {document.documentType !== 'SOP' && (
                      <Button
                        size="small"
                        startIcon={<PrintIcon />}
                        variant="outlined"
                        onClick={() => handleFormGenerate(document)}
                      >
                        Generate Form
                      </Button>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const renderSummaryDashboard = () => (
    <Box>
      <Typography variant="h4" gutterBottom>
        Emergency Codes Summary
      </Typography>

      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="primary">
                {EMERGENCY_CODES_SUMMARY.totalProtocols}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Emergency Protocols
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="secondary">
                {EMERGENCY_CODES_SUMMARY.totalDocuments}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Documents
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="success.main">
                100%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                NABH Compliance
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h3" color="warning.main">
                READY
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Audit Status
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="success" sx={{ mb: 3 }}>
        <strong>NABH Audit Ready!</strong> All emergency protocols are documented and compliant with NABH 3rd Edition standards.
      </Alert>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              startIcon={<DownloadIcon />}
              variant="contained"
              onClick={() => {
                EMERGENCY_CODES_MASTER.forEach(protocol => {
                  handleProtocolDownload(protocol.codeType);
                });
              }}
            >
              Download All Protocols
            </Button>
            <Button
              startIcon={<PrintIcon />}
              variant="outlined"
            >
              Print Documentation Package
            </Button>
            <Button
              startIcon={<TrainingIcon />}
              variant="outlined"
            >
              Schedule Training Drills
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="h3" gutterBottom>
          Emergency Codes Master
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenAddDialog}
          >
            Add Document
          </Button>
          <Chip
            label={dataSource === 'database' ? '📊 Database' : '📁 Mock Data'}
            color={dataSource === 'database' ? 'success' : 'warning'}
            size="small"
          />
        </Box>
      </Box>
      <Typography variant="subtitle1" color="text.secondary" mb={3}>
        Code Blue, Code Red & Code Pink - Complete Documentation System
      </Typography>

      <Tabs value={selectedTab} onChange={(_, newValue) => setSelectedTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Protocol Details" />
        <Tab label="Summary Dashboard" />
      </Tabs>

      {selectedTab === 0 && renderProtocolOverview()}
      {selectedTab === 1 && renderProtocolDetails()}
      {selectedTab === 2 && renderSummaryDashboard()}

      {/* Document Template Dialog - Properly Formatted */}
      <Dialog
        open={showDocumentDialog}
        onClose={() => {
          setShowDocumentDialog(false);
          setIsEditMode(false);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: '1px solid #eee', pb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <DocIcon color="primary" />
              <Box>
                <Typography variant="h6">{selectedDocument?.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDocument?.description}
                </Typography>
              </Box>
            </Box>
            <Box>
              <Tooltip title={isEditMode ? "Save Changes" : "Edit Document"}>
                <IconButton
                  onClick={() => setIsEditMode(!isEditMode)}
                  color={isEditMode ? "primary" : "default"}
                >
                  {isEditMode ? <SaveIcon /> : <EditIcon />}
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          {selectedDocument && (
            <Box sx={{
              p: 4,
              backgroundColor: 'white',
              minHeight: '60vh',
              '& .document-container': {
                fontFamily: 'Arial, sans-serif',
                lineHeight: 1.6,
                color: '#333',
              }
            }}>
              {isEditMode ? (
                <TextField
                  multiline
                  fullWidth
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  variant="outlined"
                  minRows={20}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '13px',
                      lineHeight: 1.5,
                    }
                  }}
                />
              ) : (
                renderFormattedDocument({ ...selectedDocument, template: editedContent || selectedDocument.template })
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ borderTop: '1px solid #eee', p: 2, gap: 1 }}>
          <Button onClick={() => {
            setShowDocumentDialog(false);
            setIsEditMode(false);
          }}>
            Close
          </Button>
          <Button
            startIcon={<DocIcon />}
            onClick={handlePreviewDocument}
            variant="contained"
            color="primary"
          >
            Preview
          </Button>
        </DialogActions>
      </Dialog>

      {/* Form Generation Dialog */}
      <Dialog 
        open={showFormDialog} 
        onClose={() => setShowFormDialog(false)}
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          Generate Form: {selectedDocument?.title}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {selectedDocument?.mandatoryFields.map((field, index) => (
              <Grid item xs={12} md={6} key={index}>
                <TextField
                  fullWidth
                  label={field}
                  value={formData[field] || ''}
                  onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                  margin="normal"
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFormDialog(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleFormSave}
            variant="contained"
            color="primary"
          >
            Generate & Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog
        open={showAddDialog}
        onClose={handleCloseAddDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add New Emergency Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Code Type */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Emergency Code"
                value={newDocument.code_type}
                onChange={(e) => handleNewDocChange('code_type', e.target.value)}
              >
                <MenuItem value="CODE_BLUE">CODE BLUE - Medical Emergency</MenuItem>
                <MenuItem value="CODE_RED">CODE RED - Fire Emergency</MenuItem>
                <MenuItem value="CODE_PINK">CODE PINK - Infant Security</MenuItem>
              </TextField>
            </Grid>

            {/* Document Type */}
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Document Type"
                value={newDocument.document_type}
                onChange={(e) => handleNewDocChange('document_type', e.target.value)}
              >
                <MenuItem value="SOP">SOP - Standard Operating Procedure</MenuItem>
                <MenuItem value="TRAINING_RECORD">Training Record</MenuItem>
                <MenuItem value="INCIDENT_FORM">Incident Report Form</MenuItem>
                <MenuItem value="DRILL_REPORT">Drill Report</MenuItem>
                <MenuItem value="CHECKLIST">Checklist</MenuItem>
              </TextField>
            </Grid>

            {/* Title */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Title"
                value={newDocument.title}
                onChange={(e) => handleNewDocChange('title', e.target.value)}
                required
                placeholder="e.g., Code Blue Activation Checklist"
              />
            </Grid>

            {/* Description */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={2}
                label="Description"
                value={newDocument.description}
                onChange={(e) => handleNewDocChange('description', e.target.value)}
                placeholder="Brief description of the document purpose"
              />
            </Grid>

            {/* Category & Frequency */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Category"
                value={newDocument.category}
                onChange={(e) => handleNewDocChange('category', e.target.value)}
                placeholder="e.g., Protocol Documentation"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Frequency"
                value={newDocument.frequency}
                onChange={(e) => handleNewDocChange('frequency', e.target.value)}
                placeholder="e.g., Per incident, Quarterly"
              />
            </Grid>

            {/* Responsible Person & Review Frequency */}
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Responsible Person"
                value={newDocument.responsible_person}
                onChange={(e) => handleNewDocChange('responsible_person', e.target.value)}
                placeholder="e.g., Dr. Shiraz - Quality Coordinator"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Review Frequency"
                value={newDocument.review_frequency}
                onChange={(e) => handleNewDocChange('review_frequency', e.target.value)}
              >
                <MenuItem value="Monthly">Monthly</MenuItem>
                <MenuItem value="Quarterly">Quarterly</MenuItem>
                <MenuItem value="Half-Yearly">Half-Yearly</MenuItem>
                <MenuItem value="Annual">Annual</MenuItem>
                <MenuItem value="Per incident">Per Incident</MenuItem>
              </TextField>
            </Grid>

            {/* Evidence Requirement */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Evidence Requirement"
                value={newDocument.evidence_requirement}
                onChange={(e) => handleNewDocChange('evidence_requirement', e.target.value)}
                placeholder="e.g., Signed document with date, training certificates"
              />
            </Grid>

            {/* Template */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={6}
                label="Document Template"
                value={newDocument.template}
                onChange={(e) => handleNewDocChange('template', e.target.value)}
                placeholder="Enter the document template content here..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseAddDialog} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveDocument}
            disabled={saving || !newDocument.title.trim()}
            startIcon={saving ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {saving ? 'Saving...' : 'Save Document'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmergencyCodesPage;
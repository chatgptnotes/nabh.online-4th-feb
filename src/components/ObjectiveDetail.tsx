import { useRef, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
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
import { useNABHStore } from '../store/nabhStore';
import type { Status, Priority, ElementCategory, EvidenceFile, YouTubeVideo, TrainingMaterial, SOPDocument } from '../types/nabh';
import { ASSIGNEE_OPTIONS, HOSPITAL_INFO } from '../config/hospitalConfig';
import { getClaudeApiKey } from '../lib/supabase';

interface ObjectiveDetailProps {
  open: boolean;
  onClose: () => void;
  chapterId: string;
  objectiveId: string | null;
}

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

export default function ObjectiveDetail({
  open,
  onClose,
  chapterId,
  objectiveId,
}: ObjectiveDetailProps) {
  const { chapters, updateObjective } = useNABHStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trainingFileInputRef = useRef<HTMLInputElement>(null);
  const sopFileInputRef = useRef<HTMLInputElement>(null);

  // State for adding YouTube video
  const [showAddVideo, setShowAddVideo] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoDescription, setNewVideoDescription] = useState('');

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

  // State for training document generators
  const [trainingDate, setTrainingDate] = useState('');
  const [trainingTime, setTrainingTime] = useState('');
  const [trainingVenue, setTrainingVenue] = useState('');
  const [trainerName, setTrainerName] = useState('');
  const [trainerDesignation, setTrainerDesignation] = useState('');
  const [isGeneratingNotice, setIsGeneratingNotice] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState('');
  const [isGeneratingAttendance, setIsGeneratingAttendance] = useState(false);
  const [generatedAttendance, setGeneratedAttendance] = useState('');
  const [isGeneratingMCQ, setIsGeneratingMCQ] = useState(false);
  const [generatedMCQ, setGeneratedMCQ] = useState('');
  const [mcqQuestionCount, setMcqQuestionCount] = useState(10);

  const chapter = chapters.find((c) => c.id === chapterId);
  const objective = chapter?.objectives.find((o) => o.id === objectiveId);

  if (!objective) return null;

  const handleFieldChange = (field: string, value: string) => {
    updateObjective(chapterId, objective.id, { [field]: value });
  };

  // Helper to generate unique ID
  const generateId = (prefix: string) => {
    return `${prefix}-${crypto.randomUUID()}`;
  };

  // YouTube video handlers
  const handleAddYouTubeVideo = () => {
    if (!newVideoTitle.trim() || !newVideoUrl.trim()) return;

    const newVideo: YouTubeVideo = {
      id: generateId('video'),
      title: newVideoTitle.trim(),
      url: newVideoUrl.trim(),
      description: newVideoDescription.trim() || undefined,
      addedBy: 'Staff',
      addedAt: new Date().toISOString(),
    };

    const currentVideos = objective.youtubeVideos || [];
    updateObjective(chapterId, objective.id, {
      youtubeVideos: [...currentVideos, newVideo],
    });

    setNewVideoTitle('');
    setNewVideoUrl('');
    setNewVideoDescription('');
    setShowAddVideo(false);
  };

  const handleDeleteVideo = (videoId: string) => {
    const currentVideos = objective.youtubeVideos || [];
    updateObjective(chapterId, objective.id, {
      youtubeVideos: currentVideos.filter((v) => v.id !== videoId),
    });
  };

  // Training material handlers
  const handleTrainingFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'application/pdf'];
    const maxSize = 50 * 1024 * 1024; // 50MB for videos

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not supported. Only images, videos (MP4, WebM) and PDFs are allowed.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 50MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const fileType = file.type.startsWith('image/') ? 'photo' :
                         file.type.startsWith('video/') ? 'video' : 'document';

        const newMaterial: TrainingMaterial = {
          id: generateId('training'),
          type: fileType,
          title: newTrainingTitle.trim() || file.name,
          description: newTrainingDescription.trim() || undefined,
          dataUrl,
          uploadedBy: 'Staff',
          uploadedAt: new Date().toISOString(),
          trainingDate: newTrainingDate || undefined,
        };

        const currentMaterials = objective.trainingMaterials || [];
        updateObjective(chapterId, objective.id, {
          trainingMaterials: [...currentMaterials, newMaterial],
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset
    setNewTrainingTitle('');
    setNewTrainingDescription('');
    setNewTrainingDate('');
    setShowAddTraining(false);
    if (trainingFileInputRef.current) {
      trainingFileInputRef.current.value = '';
    }
  };

  const handleDeleteTrainingMaterial = (materialId: string) => {
    const currentMaterials = objective.trainingMaterials || [];
    updateObjective(chapterId, objective.id, {
      trainingMaterials: currentMaterials.filter((m) => m.id !== materialId),
    });
  };

  const getYouTubeThumbnail = (url: string): string => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
  };

  // SOP handlers
  const handleSOPFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 25 * 1024 * 1024; // 25MB

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not supported. Only PDF and Word documents (DOC, DOCX) are allowed.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 25MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const fileType = file.type === 'application/pdf' ? 'pdf' :
                        file.type === 'application/msword' ? 'doc' : 'docx';

        const newSOP: SOPDocument = {
          id: generateId('sop'),
          title: newSOPTitle.trim() || file.name.replace(/\.[^/.]+$/, ''),
          fileName: file.name,
          fileType: fileType as 'pdf' | 'doc' | 'docx',
          fileSize: file.size,
          dataUrl,
          version: newSOPVersion || '1.0',
          effectiveDate: newSOPEffectiveDate || new Date().toISOString().split('T')[0],
          uploadedBy: 'Staff',
          uploadedAt: new Date().toISOString(),
          description: newSOPDescription.trim() || undefined,
        };

        const currentSOPs = objective.sopDocuments || [];
        updateObjective(chapterId, objective.id, {
          sopDocuments: [...currentSOPs, newSOP],
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset
    setNewSOPTitle('');
    setNewSOPVersion('1.0');
    setNewSOPEffectiveDate('');
    setNewSOPDescription('');
    setShowAddSOP(false);
    if (sopFileInputRef.current) {
      sopFileInputRef.current.value = '';
    }
  };

  const handleDeleteSOP = (sopId: string) => {
    const currentSOPs = objective.sopDocuments || [];
    updateObjective(chapterId, objective.id, {
      sopDocuments: currentSOPs.filter((s) => s.id !== sopId),
    });
  };

  const handleViewSOP = (sop: SOPDocument) => {
    const newWindow = window.open();
    if (newWindow) {
      if (sop.fileType === 'pdf') {
        newWindow.document.write(`
          <html>
            <head><title>${sop.title} - ${sop.fileName}</title></head>
            <body style="margin:0;padding:0;">
              <embed src="${sop.dataUrl}" type="application/pdf" width="100%" height="100%" />
            </body>
          </html>
        `);
      } else {
        // For Word documents, provide download link
        const link = document.createElement('a');
        link.href = sop.dataUrl;
        link.download = sop.fileName;
        link.click();
      }
    }
  };

  const handleGenerateSOP = async () => {
    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      alert('Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
      return;
    }

    setIsGeneratingSOP(true);
    setGeneratedSOPContent('');

    try {
      const prompt = `You are an expert in NABH documentation for ${HOSPITAL_INFO.name}.

Generate a complete HTML document for this Standard Operating Procedure (SOP) in ENGLISH ONLY.

NABH Code: ${objective.code}
Title: ${objective.title}
Description: ${objective.description}

Generate a complete, valid HTML document with embedded CSS:

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>SOP - ${objective.title} - ${HOSPITAL_INFO.name}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, sans-serif; font-size: 12px; line-height: 1.6; color: #333; padding: 20px; max-width: 800px; margin: 0 auto; }
    .header { text-align: center; border-bottom: 3px solid #2E7D32; padding-bottom: 15px; margin-bottom: 20px; }
    .logo-area { width: 100px; height: 100px; margin: 0 auto 10px; border: 2px solid #2E7D32; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #2E7D32, #1B5E20); color: white; font-size: 12px; font-weight: bold; }
    .hospital-name { font-size: 22px; font-weight: bold; color: #2E7D32; margin: 10px 0 5px; }
    .hospital-address { font-size: 11px; color: #666; }
    .doc-title { background: linear-gradient(135deg, #2E7D32, #1B5E20); color: white; padding: 12px; font-size: 16px; font-weight: bold; text-align: center; margin: 20px 0; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .sop-title { font-size: 14px; color: #2E7D32; text-align: center; margin-bottom: 15px; font-weight: 600; }
    .info-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .info-table th, .info-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    .info-table th { background: #E8F5E9; font-weight: 600; color: #2E7D32; width: 25%; }
    .auth-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .auth-table th { background: #2E7D32; color: white; padding: 10px; text-align: center; }
    .auth-table td { border: 1px solid #ddd; padding: 15px; text-align: center; vertical-align: top; height: 100px; }
    .section { margin: 20px 0; }
    .section-title { background: linear-gradient(90deg, #E8F5E9, white); padding: 10px 15px; font-weight: bold; color: #2E7D32; border-left: 4px solid #2E7D32; margin-bottom: 10px; font-size: 13px; border-radius: 0 5px 5px 0; }
    .section-content { padding: 10px 15px; }
    .procedure-step { margin: 12px 0; padding: 12px; background: #FAFAFA; border-radius: 8px; border-left: 3px solid #2E7D32; }
    .step-number { display: inline-block; width: 28px; height: 28px; background: #2E7D32; color: white; border-radius: 50%; text-align: center; line-height: 28px; margin-right: 12px; font-weight: bold; font-size: 12px; }
    .data-table { width: 100%; border-collapse: collapse; margin: 10px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .data-table th { background: #2E7D32; color: white; padding: 10px; text-align: left; }
    .data-table td { border: 1px solid #ddd; padding: 10px; }
    .data-table tr:nth-child(even) { background: #F5F5F5; }
    .footer { margin-top: 30px; padding: 15px; background: #F5F5F5; border-radius: 8px; text-align: center; font-size: 10px; color: #666; }
    .revision-table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 11px; }
    .revision-table th { background: #455A64; color: white; padding: 8px; }
    .revision-table td { border: 1px solid #ddd; padding: 8px; }
    .stamp-area { border: 2px dashed #ccc; padding: 25px; text-align: center; margin: 20px 0; color: #999; border-radius: 8px; }
    ul, ol { margin-left: 20px; }
    li { margin: 5px 0; }
    @media print { body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">HOSPITAL<br>LOGO</div>
    <div class="hospital-name">${HOSPITAL_INFO.name}</div>
    <div class="hospital-address">${HOSPITAL_INFO.address}</div>
  </div>

  <div class="doc-title">STANDARD OPERATING PROCEDURE</div>
  <div class="sop-title">${objective.title}</div>

  <table class="info-table">
    <tr><th>Document No</th><td>SOP-${objective.code.replace(/\./g, '-')}-001</td><th>Version</th><td>1.0</td></tr>
    <tr><th>NABH Code</th><td>${objective.code}</td><th>Category</th><td>Standard Operating Procedure</td></tr>
    <tr><th>Effective Date</th><td>[DD/MM/YYYY]</td><th>Review Date</th><td>[DD/MM/YYYY]</td></tr>
    <tr><th>Department</th><td>[Department Name]</td><th>Page</th><td>1 of X</td></tr>
  </table>

  <table class="auth-table">
    <tr><th width="33%">PREPARED BY</th><th width="33%">REVIEWED BY</th><th width="33%">APPROVED BY</th></tr>
    <tr>
      <td>Name: _______________<br><br>Designation: _______________<br><br>Date: _______________<br><br>Signature:</td>
      <td>Name: _______________<br><br>Designation: _______________<br><br>Date: _______________<br><br>Signature:</td>
      <td>Name: _______________<br><br>Designation: _______________<br><br>Date: _______________<br><br>Signature:</td>
    </tr>
  </table>

  <div class="section">
    <div class="section-title">1. PURPOSE</div>
    <div class="section-content">[Purpose of this SOP]</div>
  </div>

  <div class="section">
    <div class="section-title">2. SCOPE</div>
    <div class="section-content">[Scope of this SOP]</div>
  </div>

  <div class="section">
    <div class="section-title">3. DEFINITIONS</div>
    <div class="section-content">
      <table class="data-table">
        <tr><th>Term</th><th>Definition</th></tr>
        <tr><td>[Term]</td><td>[Definition]</td></tr>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">4. RESPONSIBILITIES</div>
    <div class="section-content">
      <table class="data-table">
        <tr><th>Role</th><th>Responsibility</th></tr>
        <tr><td>[Role]</td><td>[Responsibility]</td></tr>
      </table>
    </div>
  </div>

  <div class="section">
    <div class="section-title">5. PROCEDURE</div>
    <div class="section-content">
      <div class="procedure-step"><span class="step-number">1</span>[Step description]</div>
      <div class="procedure-step"><span class="step-number">2</span>[Step description]</div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">6. DOCUMENTATION</div>
    <div class="section-content">[Required documents and records]</div>
  </div>

  <div class="section">
    <div class="section-title">7. REFERENCES</div>
    <div class="section-content">
      <ul>
        <li>NABH SHCO 3rd Edition Standards</li>
        <li>Hospital Policies</li>
      </ul>
    </div>
  </div>

  <table class="revision-table">
    <tr><th>Version</th><th>Date</th><th>Description</th><th>Changed By</th></tr>
    <tr><td>1.0</td><td>[Date]</td><td>Initial Release</td><td>[Name]</td></tr>
  </table>

  <div class="stamp-area">HOSPITAL STAMP</div>

  <div class="footer">
    <strong>${HOSPITAL_INFO.name}</strong> | ${HOSPITAL_INFO.address}<br>
    This is a controlled document. Unauthorized copying or distribution is prohibited.
  </div>
</body>
</html>

Fill in all sections with relevant content based on the NABH objective element description provided.`;

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
          max_tokens: 8192,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate SOP');
      }

      const data = await response.json();
      const content = data.content?.[0]?.text || '';
      setGeneratedSOPContent(content);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate SOP. Please try again.');
    } finally {
      setIsGeneratingSOP(false);
    }
  };

  const handleCopyGeneratedSOP = () => {
    navigator.clipboard.writeText(generatedSOPContent);
    alert('SOP content copied to clipboard!');
  };

  // Training Document Generators
  const handleGenerateTrainingNotice = async () => {
    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      alert('Claude API key not configured. Please add VITE_CLAUDE_API_KEY to your .env file.');
      return;
    }

    if (!trainingDate || !trainerName) {
      alert('Please enter training date and trainer name.');
      return;
    }

    setIsGeneratingNotice(true);
    setGeneratedNotice('');

    try {
      const prompt = `Generate a professional training notice/announcement in ENGLISH ONLY for ${HOSPITAL_INFO.name}. This is an internal document.

Hospital: ${HOSPITAL_INFO.name}
Address: ${HOSPITAL_INFO.address}

Training Details:
- Topic: ${objective.title} (${objective.code})
- Date: ${trainingDate}
- Time: ${trainingTime || 'To be announced'}
- Venue: ${trainingVenue || 'Hospital Conference Room'}
- Trainer: ${trainerName}
- Trainer Designation: ${trainerDesignation || 'Trainer'}

Generate a complete HTML document for this Training Notice with modern, professional styling.

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #9C27B0; padding-bottom: 15px; margin-bottom: 20px; }
    .logo-area { width: 100px; height: 100px; margin: 0 auto 10px; border: 2px solid #9C27B0; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: white; font-weight: bold; font-size: 12px; }
    .hospital-name { font-size: 22px; font-weight: bold; color: #9C27B0; margin: 5px 0; }
    .hospital-address { font-size: 12px; color: #666; }
    .doc-title { background: linear-gradient(135deg, #9C27B0, #7B1FA2); color: white; padding: 12px 20px; text-align: center; font-size: 18px; font-weight: bold; margin: 20px 0; border-radius: 5px; }
    .info-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .info-table td { padding: 8px 12px; border: 1px solid #e0e0e0; }
    .info-table td:first-child { font-weight: 600; background: #F3E5F5; width: 30%; color: #7B1FA2; }
    .notice-body { background: #FAFAFA; border-left: 4px solid #9C27B0; padding: 15px 20px; margin: 20px 0; }
    .notice-body p { margin-bottom: 10px; }
    .training-details { background: #F3E5F5; border-radius: 8px; padding: 15px; margin: 20px 0; }
    .training-details h3 { color: #7B1FA2; margin-bottom: 10px; font-size: 14px; border-bottom: 1px solid #CE93D8; padding-bottom: 5px; }
    .training-details table { width: 100%; }
    .training-details td { padding: 5px 10px; }
    .training-details td:first-child { font-weight: 600; width: 35%; }
    .important-note { background: #FFF3E0; border: 1px solid #FFB74D; border-radius: 5px; padding: 12px; margin: 15px 0; }
    .important-note strong { color: #E65100; }
    .signature-area { margin-top: 40px; }
    .signature-box { display: inline-block; width: 45%; text-align: center; }
    .signature-line { border-top: 1px solid #333; margin-top: 40px; padding-top: 5px; }
    .footer { text-align: center; margin-top: 30px; padding-top: 15px; border-top: 2px solid #9C27B0; font-size: 11px; color: #666; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">HOSPITAL<br>LOGO</div>
    <div class="hospital-name">${HOSPITAL_INFO.name}</div>
    <div class="hospital-address">${HOSPITAL_INFO.address}</div>
  </div>

  <div class="doc-title">TRAINING NOTICE</div>

  <table class="info-table">
    <tr><td>Reference No.</td><td>TRN/${objective.code.replace(/\./g, '/')}/${new Date().getFullYear()}</td></tr>
    <tr><td>Date</td><td>[Current Date]</td></tr>
    <tr><td>To</td><td>All Concerned Staff</td></tr>
    <tr><td>Subject</td><td>Training on ${objective.title}</td></tr>
  </table>

  <div class="notice-body">
    [Body of notice explaining the training, its importance, who should attend, what to bring, etc.]
  </div>

  <div class="training-details">
    <h3>TRAINING DETAILS</h3>
    <table>
      <tr><td>Training Topic:</td><td>${objective.title}</td></tr>
      <tr><td>NABH Reference:</td><td>${objective.code}</td></tr>
      <tr><td>Date:</td><td>${trainingDate}</td></tr>
      <tr><td>Time:</td><td>${trainingTime || 'To be announced'}</td></tr>
      <tr><td>Venue:</td><td>${trainingVenue || 'Hospital Conference Room'}</td></tr>
      <tr><td>Trainer:</td><td>${trainerName}, ${trainerDesignation || 'Trainer'}</td></tr>
    </table>
  </div>

  <div class="important-note">
    <strong>Note:</strong> Attendance is mandatory for all designated staff. Please report on time.
  </div>

  <div class="signature-area">
    <div class="signature-box">
      <div class="signature-line">
        Issued By<br>
        Quality Coordinator<br>
        ${HOSPITAL_INFO.name}
      </div>
    </div>
  </div>

  <div class="footer">
    <strong>${HOSPITAL_INFO.name}</strong> | ${HOSPITAL_INFO.address}<br>
    This is an official training notice from the Quality Department.
  </div>
</body>
</html>

Fill in the notice body with appropriate content explaining why this training is important and who should attend.`;

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
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate notice');
      }

      const data = await response.json();
      setGeneratedNotice(data.content?.[0]?.text || '');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate notice.');
    } finally {
      setIsGeneratingNotice(false);
    }
  };

  const handleGenerateAttendanceSheet = async () => {
    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      alert('Claude API key not configured.');
      return;
    }

    setIsGeneratingAttendance(true);
    setGeneratedAttendance('');

    try {
      const prompt = `Generate a training attendance sheet in ENGLISH ONLY for ${HOSPITAL_INFO.name}. This is an internal document.

Hospital: ${HOSPITAL_INFO.name}
Training Topic: ${objective.title} (${objective.code})
Training Date: ${trainingDate || '[Date]'}
Trainer: ${trainerName || '[Trainer Name]'}

Generate a complete HTML document for this Training Attendance Sheet with modern, professional styling.

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 12px; line-height: 1.5; color: #333; max-width: 850px; margin: 0 auto; padding: 15px; }
    .header { text-align: center; border-bottom: 3px solid #1976D2; padding-bottom: 12px; margin-bottom: 15px; }
    .logo-area { width: 80px; height: 80px; margin: 0 auto 8px; border: 2px solid #1976D2; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #1976D2, #1565C0); color: white; font-weight: bold; font-size: 10px; }
    .hospital-name { font-size: 20px; font-weight: bold; color: #1976D2; margin: 3px 0; }
    .hospital-address { font-size: 11px; color: #666; }
    .doc-title { background: linear-gradient(135deg, #1976D2, #1565C0); color: white; padding: 10px 15px; text-align: center; font-size: 16px; font-weight: bold; margin: 15px 0; border-radius: 5px; }
    .training-info { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 15px 0; background: #E3F2FD; padding: 12px; border-radius: 5px; }
    .training-info div { display: flex; }
    .training-info strong { min-width: 130px; color: #1565C0; }
    .attendance-table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    .attendance-table th { background: #1976D2; color: white; padding: 8px 6px; text-align: left; font-size: 11px; }
    .attendance-table td { border: 1px solid #BBDEFB; padding: 10px 6px; }
    .attendance-table tr:nth-child(even) { background: #F5F5F5; }
    .attendance-table tr:hover { background: #E3F2FD; }
    .sno-col { width: 40px; text-align: center; }
    .name-col { width: 25%; }
    .designation-col { width: 20%; }
    .department-col { width: 20%; }
    .signature-col { width: 20%; }
    .totals-row { background: #E3F2FD !important; font-weight: bold; }
    .certification { margin-top: 20px; border: 2px solid #1976D2; border-radius: 8px; padding: 15px; background: #F5F5F5; }
    .certification h4 { color: #1565C0; margin-bottom: 10px; font-size: 13px; }
    .certification p { margin-bottom: 8px; }
    .signature-area { display: flex; justify-content: space-between; margin-top: 15px; }
    .signature-box { width: 45%; text-align: center; }
    .signature-line { border-bottom: 1px solid #333; height: 30px; margin-bottom: 5px; }
    .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px solid #1976D2; font-size: 10px; color: #666; }
    @media print { body { padding: 10px; font-size: 11px; } .attendance-table td { padding: 8px 4px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">HOSPITAL<br>LOGO</div>
    <div class="hospital-name">${HOSPITAL_INFO.name}</div>
    <div class="hospital-address">${HOSPITAL_INFO.address}</div>
  </div>

  <div class="doc-title">TRAINING ATTENDANCE SHEET</div>

  <div class="training-info">
    <div><strong>Training Topic:</strong> ${objective.title}</div>
    <div><strong>NABH Reference:</strong> ${objective.code}</div>
    <div><strong>Date:</strong> ${trainingDate || '_____________'}</div>
    <div><strong>Time:</strong> ${trainingTime || '_____________'}</div>
    <div><strong>Venue:</strong> ${trainingVenue || '_____________'}</div>
    <div><strong>Trainer:</strong> ${trainerName || '_____________'}</div>
    <div><strong>Trainer Designation:</strong> ${trainerDesignation || '_____________'}</div>
  </div>

  <table class="attendance-table">
    <tr>
      <th class="sno-col">S.No</th>
      <th class="name-col">Name</th>
      <th class="designation-col">Designation</th>
      <th class="department-col">Department</th>
      <th class="signature-col">Signature</th>
    </tr>
    [Generate 20 rows with S.No 1-20, empty cells for name, designation, department, signature]
    <tr class="totals-row">
      <td colspan="4" style="text-align: right;">Total Attendees:</td>
      <td></td>
    </tr>
  </table>

  <div class="certification">
    <h4>TRAINER'S CERTIFICATION</h4>
    <p>I certify that the above training was conducted as per the schedule and the participants mentioned above attended the session.</p>
    <div class="signature-area">
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong>Trainer Signature</strong>
      </div>
      <div class="signature-box">
        <div class="signature-line"></div>
        <strong>Date</strong>
      </div>
    </div>
  </div>

  <div class="footer">
    <strong>${HOSPITAL_INFO.name}</strong> | ${HOSPITAL_INFO.address}<br>
    Document Reference: ATT/${objective.code.replace(/\./g, '/')}/${new Date().getFullYear()}
  </div>
</body>
</html>

Generate the complete HTML with all 20 attendance rows filled in with empty cells.`;

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
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate attendance sheet');
      }

      const data = await response.json();
      setGeneratedAttendance(data.content?.[0]?.text || '');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate attendance sheet.');
    } finally {
      setIsGeneratingAttendance(false);
    }
  };

  const handleGenerateMCQTest = async () => {
    const apiKey = getClaudeApiKey();
    if (!apiKey) {
      alert('Claude API key not configured.');
      return;
    }

    setIsGeneratingMCQ(true);
    setGeneratedMCQ('');

    try {
      const prompt = `Generate a Multiple Choice Question (MCQ) test in ENGLISH ONLY for training evaluation at ${HOSPITAL_INFO.name}. This is an internal document.

Hospital: ${HOSPITAL_INFO.name}
Training Topic: ${objective.title}
NABH Code: ${objective.code}
Topic Description: ${objective.description}

Generate ${mcqQuestionCount} MCQ questions to evaluate staff understanding of this topic.

Generate a complete HTML document for this MCQ Test with modern, professional styling.

<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 13px; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; border-bottom: 3px solid #D32F2F; padding-bottom: 15px; margin-bottom: 15px; }
    .logo-area { width: 80px; height: 80px; margin: 0 auto 8px; border: 2px solid #D32F2F; border-radius: 8px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #D32F2F, #C62828); color: white; font-weight: bold; font-size: 10px; }
    .hospital-name { font-size: 20px; font-weight: bold; color: #D32F2F; margin: 3px 0; }
    .hospital-address { font-size: 11px; color: #666; }
    .doc-title { background: linear-gradient(135deg, #D32F2F, #C62828); color: white; padding: 10px 15px; text-align: center; font-size: 16px; font-weight: bold; margin: 15px 0; border-radius: 5px; }
    .test-info { display: grid; grid-template-columns: 1fr 1fr; gap: 5px; margin: 15px 0; background: #FFEBEE; padding: 12px; border-radius: 5px; border: 1px solid #FFCDD2; }
    .test-info div { display: flex; font-size: 12px; }
    .test-info strong { min-width: 120px; color: #C62828; }
    .participant-info { margin: 15px 0; padding: 12px; border: 1px solid #ddd; border-radius: 5px; }
    .participant-info h4 { color: #C62828; margin-bottom: 10px; font-size: 12px; }
    .participant-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .participant-field { display: flex; align-items: center; gap: 8px; }
    .participant-field label { font-weight: 600; min-width: 100px; font-size: 11px; }
    .participant-field .blank { flex: 1; border-bottom: 1px solid #999; min-height: 20px; }
    .instructions { background: #FFF3E0; border: 1px solid #FFB74D; border-radius: 5px; padding: 12px; margin: 15px 0; }
    .instructions h4 { color: #E65100; margin-bottom: 8px; font-size: 12px; }
    .instructions ul { margin-left: 20px; font-size: 11px; }
    .questions { margin: 20px 0; }
    .question { margin-bottom: 18px; padding: 12px; border: 1px solid #E0E0E0; border-radius: 5px; background: #FAFAFA; }
    .question-number { display: inline-block; background: #D32F2F; color: white; width: 24px; height: 24px; text-align: center; line-height: 24px; border-radius: 50%; font-weight: bold; font-size: 12px; margin-right: 8px; }
    .question-text { font-weight: 600; margin-bottom: 10px; display: inline; }
    .options { margin-left: 32px; }
    .option { display: flex; align-items: center; margin: 5px 0; padding: 5px 10px; border-radius: 3px; }
    .option:hover { background: #FFEBEE; }
    .option-letter { display: inline-block; width: 22px; height: 22px; border: 2px solid #D32F2F; border-radius: 50%; text-align: center; line-height: 18px; font-weight: bold; margin-right: 10px; font-size: 11px; }
    .option-text { flex: 1; }
    .official-use { margin-top: 25px; border: 2px solid #D32F2F; border-radius: 8px; padding: 15px; background: #FFEBEE; }
    .official-use h4 { color: #C62828; margin-bottom: 10px; text-align: center; font-size: 12px; border-bottom: 1px solid #FFCDD2; padding-bottom: 8px; }
    .score-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; text-align: center; }
    .score-item label { display: block; font-weight: 600; margin-bottom: 5px; font-size: 11px; }
    .score-item .value { border-bottom: 1px solid #333; min-height: 25px; }
    .evaluator-section { margin-top: 15px; display: flex; justify-content: space-between; }
    .evaluator-box { width: 45%; text-align: center; }
    .evaluator-box .line { border-bottom: 1px solid #333; height: 30px; margin-bottom: 5px; }
    .answer-key { margin-top: 30px; page-break-before: always; border: 2px dashed #D32F2F; padding: 15px; background: #FFF; }
    .answer-key h4 { color: #C62828; text-align: center; margin-bottom: 10px; }
    .answer-key p { text-align: center; font-size: 11px; color: #666; margin-bottom: 10px; }
    .answers-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; }
    .answer-item { background: #FFEBEE; padding: 5px 10px; border-radius: 3px; text-align: center; font-weight: 600; }
    .footer { text-align: center; margin-top: 20px; padding-top: 10px; border-top: 2px solid #D32F2F; font-size: 10px; color: #666; }
    @media print { .answer-key { page-break-before: always; } body { padding: 10px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo-area">HOSPITAL<br>LOGO</div>
    <div class="hospital-name">${HOSPITAL_INFO.name}</div>
    <div class="hospital-address">${HOSPITAL_INFO.address}</div>
  </div>

  <div class="doc-title">TRAINING EVALUATION TEST</div>

  <div class="test-info">
    <div><strong>Topic:</strong> ${objective.title}</div>
    <div><strong>NABH Code:</strong> ${objective.code}</div>
    <div><strong>Total Questions:</strong> ${mcqQuestionCount}</div>
    <div><strong>Time:</strong> 15 minutes</div>
    <div><strong>Total Marks:</strong> ${mcqQuestionCount}</div>
    <div><strong>Passing Score:</strong> 70%</div>
  </div>

  <div class="participant-info">
    <h4>PARTICIPANT INFORMATION</h4>
    <div class="participant-grid">
      <div class="participant-field"><label>Name:</label><div class="blank"></div></div>
      <div class="participant-field"><label>Designation:</label><div class="blank"></div></div>
      <div class="participant-field"><label>Department:</label><div class="blank"></div></div>
      <div class="participant-field"><label>Date:</label><div class="blank"></div></div>
    </div>
  </div>

  <div class="instructions">
    <h4>INSTRUCTIONS</h4>
    <ul>
      <li>Circle or tick the correct answer for each question</li>
      <li>Each question carries 1 mark</li>
      <li>All questions are compulsory</li>
      <li>No negative marking</li>
    </ul>
  </div>

  <div class="questions">
    [Generate ${mcqQuestionCount} questions in this format:]
    <div class="question">
      <span class="question-number">1</span>
      <span class="question-text">[Question text]</span>
      <div class="options">
        <div class="option"><span class="option-letter">a</span><span class="option-text">[Option A]</span></div>
        <div class="option"><span class="option-letter">b</span><span class="option-text">[Option B]</span></div>
        <div class="option"><span class="option-letter">c</span><span class="option-text">[Option C]</span></div>
        <div class="option"><span class="option-letter">d</span><span class="option-text">[Option D]</span></div>
      </div>
    </div>
    [Continue for all ${mcqQuestionCount} questions]
  </div>

  <div class="official-use">
    <h4>FOR OFFICIAL USE ONLY</h4>
    <div class="score-grid">
      <div class="score-item"><label>Total Score:</label><div class="value"></div><span>/ ${mcqQuestionCount}</span></div>
      <div class="score-item"><label>Percentage:</label><div class="value"></div><span>%</span></div>
      <div class="score-item"><label>Result:</label><div class="value"></div><span>PASS / FAIL</span></div>
    </div>
    <div class="evaluator-section">
      <div class="evaluator-box"><div class="line"></div><strong>Evaluator Signature</strong></div>
      <div class="evaluator-box"><div class="line"></div><strong>Date</strong></div>
    </div>
  </div>

  <div class="answer-key">
    <h4>ANSWER KEY</h4>
    <p>(Keep Separately - For Evaluator Only)</p>
    <div class="answers-grid">
      [List all answers: Q1: a, Q2: b, etc.]
    </div>
  </div>

  <div class="footer">
    <strong>${HOSPITAL_INFO.name}</strong> | ${HOSPITAL_INFO.address}<br>
    Document Reference: MCQ/${objective.code.replace(/\./g, '/')}/${new Date().getFullYear()}
  </div>
</body>
</html>

Generate the complete HTML with all ${mcqQuestionCount} MCQ questions filled in with proper questions and options related to the training topic.`;

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
          max_tokens: 8192,
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Failed to generate MCQ test');
      }

      const data = await response.json();
      setGeneratedMCQ(data.content?.[0]?.text || '');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate MCQ test.');
    } finally {
      setIsGeneratingMCQ(false);
    }
  };

  const handleCopyContent = (content: string, label: string) => {
    navigator.clipboard.writeText(content);
    alert(`${label} copied to clipboard!`);
  };

  // Check if content is HTML
  const isHTMLContent = (content: string): boolean => {
    return content.trim().startsWith('<!DOCTYPE html>') || content.trim().startsWith('<html');
  };

  // Preview content in new window
  const handlePreviewContent = (content: string, title: string) => {
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      if (isHTMLContent(content)) {
        previewWindow.document.write(content);
      } else {
        previewWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${HOSPITAL_INFO.name}</title>
              <style>
                body { font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.5; padding: 20px; white-space: pre-wrap; background: #f5f5f5; }
              </style>
            </head>
            <body>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
          </html>
        `);
      }
      previewWindow.document.close();
    }
  };

  // Print content handler
  const handlePrintContent = (content: string, title: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      if (isHTMLContent(content)) {
        // If content is already HTML, use it directly
        printWindow.document.write(content);
      } else {
        // Plain text content - wrap in basic HTML
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${title} - ${HOSPITAL_INFO.name}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.5;
                  padding: 20px;
                  white-space: pre-wrap;
                }
                @media print {
                  body { margin: 0; padding: 15px; }
                }
              </style>
            </head>
            <body>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
          </html>
        `);
      }
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Download as PDF handler (uses print to PDF)
  const handleDownloadPDF = (content: string, filename: string) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      if (isHTMLContent(content)) {
        // If content is already HTML, use it directly
        printWindow.document.write(content);
      } else {
        // Plain text content - wrap in basic HTML
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${filename}</title>
              <style>
                body {
                  font-family: 'Courier New', monospace;
                  font-size: 12px;
                  line-height: 1.5;
                  padding: 20px;
                  white-space: pre-wrap;
                }
                @page { margin: 1cm; }
              </style>
            </head>
            <body>${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</body>
          </html>
        `);
      }
      printWindow.document.close();
      // Trigger print dialog - user can save as PDF
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    Array.from(files).forEach((file) => {
      if (!allowedTypes.includes(file.type)) {
        alert(`File "${file.name}" is not supported. Only images (JPEG, PNG, GIF, WebP) and PDFs are allowed.`);
        return;
      }

      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum size is 10MB.`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        const newFile: EvidenceFile = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          type: file.type.startsWith('image/') ? 'image' : 'pdf',
          size: file.size,
          dataUrl,
          uploadedAt: new Date().toISOString(),
        };

        const currentFiles = objective.evidenceFiles || [];
        updateObjective(chapterId, objective.id, {
          evidenceFiles: [...currentFiles, newFile],
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const currentFiles = objective.evidenceFiles || [];
    updateObjective(chapterId, objective.id, {
      evidenceFiles: currentFiles.filter((f) => f.id !== fileId),
    });
  };

  const handleViewFile = (file: EvidenceFile) => {
    const newWindow = window.open();
    if (newWindow) {
      if (file.type === 'pdf') {
        newWindow.document.write(`
          <html>
            <head><title>${file.name}</title></head>
            <body style="margin:0;padding:0;">
              <embed src="${file.dataUrl}" type="application/pdf" width="100%" height="100%" />
            </body>
          </html>
        `);
      } else {
        newWindow.document.write(`
          <html>
            <head><title>${file.name}</title></head>
            <body style="margin:0;padding:20px;background:#1a1a1a;display:flex;justify-content:center;align-items:center;min-height:100vh;">
              <img src="${file.dataUrl}" style="max-width:100%;max-height:100%;object-fit:contain;" alt="${file.name}" />
            </body>
          </html>
        `);
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const evidenceFiles = objective.evidenceFiles || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Icon color="primary">description</Icon>
            <Typography variant="h6" fontWeight={600}>
              {objective.code}
            </Typography>
            {objective.isCore && (
              <Chip label="CORE" size="small" color="error" />
            )}
            {objective.priority === 'Prev NC' && (
              <Chip label="Prev NC" size="small" color="warning" />
            )}
            <Chip label={objective.category} size="small" variant="outlined" />
          </Box>
          <IconButton onClick={onClose}>
            <Icon>close</Icon>
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Title */}
          <TextField
            fullWidth
            label="Title"
            value={objective.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            size="small"
          />

          {/* Description */}
          <TextField
            fullWidth
            label="Description"
            value={objective.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            multiline
            minRows={3}
            size="small"
            sx={expandableTextFieldSx}
          />

          {/* Hindi Explanation Section */}
          {objective.hindiExplanation && (
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
                    This explanation is for staff training purposes. Share with your team.
                  </Typography>
                </Alert>
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
              </AccordionDetails>
            </Accordion>
          )}

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
                          <Box
                            sx={{
                              position: 'relative',
                              paddingTop: '56.25%',
                              bgcolor: 'grey.900',
                              cursor: 'pointer',
                            }}
                            onClick={() => window.open(video.url, '_blank')}
                          >
                            <Box
                              component="img"
                              src={getYouTubeThumbnail(video.url)}
                              alt={video.title}
                              sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                              }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                bgcolor: 'rgba(255,0,0,0.8)',
                                borderRadius: '50%',
                                width: 48,
                                height: 48,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Icon sx={{ color: 'white', fontSize: 28 }}>play_arrow</Icon>
                            </Box>
                          </Box>
                          <CardContent sx={{ pb: 1 }}>
                            <Tooltip title={video.title}>
                              <Typography variant="subtitle2" noWrap fontWeight={600}>
                                {video.title}
                              </Typography>
                            </Tooltip>
                            {video.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {video.description}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions sx={{ pt: 0 }}>
                            <Button
                              size="small"
                              startIcon={<Icon>open_in_new</Icon>}
                              onClick={() => window.open(video.url, '_blank')}
                            >
                              Watch
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => video.id && handleDeleteVideo(video.id)}
                            >
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Add Video Form */}
                {showAddVideo ? (
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Add YouTube Video
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Video Title"
                        placeholder="e.g., Hand Hygiene Training"
                        value={newVideoTitle}
                        onChange={(e) => setNewVideoTitle(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="YouTube URL"
                        placeholder="https://www.youtube.com/watch?v=..."
                        value={newVideoUrl}
                        onChange={(e) => setNewVideoUrl(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Description (optional)"
                        placeholder="Brief description of the video"
                        value={newVideoDescription}
                        onChange={(e) => setNewVideoDescription(e.target.value)}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Icon>add</Icon>}
                          onClick={handleAddYouTubeVideo}
                          disabled={!newVideoTitle.trim() || !newVideoUrl.trim()}
                        >
                          Add Video
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setShowAddVideo(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  </Card>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Icon>add</Icon>}
                    onClick={() => setShowAddVideo(true)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Add YouTube Video
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* Training Document Generator Section */}
          <Accordion sx={{ bgcolor: 'secondary.50', border: '1px solid', borderColor: 'secondary.200' }}>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="secondary">auto_awesome</Icon>
                <Typography fontWeight={600}>Training Document Generator</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Generate training documents: Notice, Attendance Sheet, and MCQ Test for staff evaluation.
                </Typography>
              </Alert>

              {/* Training Details Form */}
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  Training Details (for document generation)
                </Typography>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Training Date"
                      type="date"
                      value={trainingDate}
                      onChange={(e) => setTrainingDate(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Training Time"
                      placeholder="e.g., 10:00 AM - 12:00 PM"
                      value={trainingTime}
                      onChange={(e) => setTrainingTime(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Venue"
                      placeholder="e.g., Conference Room"
                      value={trainingVenue}
                      onChange={(e) => setTrainingVenue(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Trainer Name"
                      placeholder="e.g., Dr. Sharma"
                      value={trainerName}
                      onChange={(e) => setTrainerName(e.target.value)}
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Trainer Designation"
                      placeholder="e.g., Infection Control Nurse"
                      value={trainerDesignation}
                      onChange={(e) => setTrainerDesignation(e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Card>

              {/* Generate Buttons */}
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={isGeneratingNotice ? <CircularProgress size={16} color="inherit" /> : <Icon>campaign</Icon>}
                  onClick={handleGenerateTrainingNotice}
                  disabled={isGeneratingNotice}
                >
                  {isGeneratingNotice ? 'Generating...' : 'Generate Training Notice'}
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={isGeneratingAttendance ? <CircularProgress size={16} color="inherit" /> : <Icon>people</Icon>}
                  onClick={handleGenerateAttendanceSheet}
                  disabled={isGeneratingAttendance}
                >
                  {isGeneratingAttendance ? 'Generating...' : 'Generate Attendance Sheet'}
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TextField
                    size="small"
                    type="number"
                    label="Questions"
                    value={mcqQuestionCount}
                    onChange={(e) => setMcqQuestionCount(parseInt(e.target.value) || 10)}
                    sx={{ width: 100 }}
                    inputProps={{ min: 5, max: 20 }}
                  />
                  <Button
                    variant="contained"
                    color="warning"
                    startIcon={isGeneratingMCQ ? <CircularProgress size={16} color="inherit" /> : <Icon>quiz</Icon>}
                    onClick={handleGenerateMCQTest}
                    disabled={isGeneratingMCQ}
                  >
                    {isGeneratingMCQ ? 'Generating...' : 'Generate MCQ Test'}
                  </Button>
                </Box>
              </Box>

              {/* Generated Training Notice */}
              {generatedNotice && (
                <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'primary.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>campaign</Icon>
                      Training Notice
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<Icon>visibility</Icon>} onClick={() => handlePreviewContent(generatedNotice, 'Training Notice')}>
                        Preview
                      </Button>
                      <Button size="small" startIcon={<Icon>print</Icon>} onClick={() => handlePrintContent(generatedNotice, 'Training Notice')}>
                        Print
                      </Button>
                      <Button size="small" startIcon={<Icon>download</Icon>} onClick={() => handleDownloadPDF(generatedNotice, 'Training-Notice')}>
                        PDF
                      </Button>
                      <Button size="small" startIcon={<Icon>content_copy</Icon>} onClick={() => handleCopyContent(generatedNotice, 'Training Notice')}>
                        Copy
                      </Button>
                      <Button size="small" color="error" startIcon={<Icon>close</Icon>} onClick={() => setGeneratedNotice('')}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                  {isHTMLContent(generatedNotice) && (
                    <Box sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                      <iframe
                        srcDoc={generatedNotice}
                        title="Training Notice Preview"
                        style={{ width: '100%', height: '400px', border: 'none' }}
                        sandbox="allow-same-origin"
                      />
                    </Box>
                  )}
                  <Accordion>
                    <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                      <Typography variant="caption" color="text.secondary">
                        <Icon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }}>code</Icon>
                        Edit HTML Source
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        fullWidth
                        multiline
                        minRows={10}
                        maxRows={20}
                        value={generatedNotice}
                        onChange={(e) => setGeneratedNotice(e.target.value)}
                        sx={{ bgcolor: 'background.paper', fontFamily: 'monospace', fontSize: '0.75rem' }}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Card>
              )}

              {/* Generated Attendance Sheet */}
              {generatedAttendance && (
                <Card variant="outlined" sx={{ p: 2, mb: 2, bgcolor: 'success.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>people</Icon>
                      Attendance Sheet
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<Icon>visibility</Icon>} onClick={() => handlePreviewContent(generatedAttendance, 'Attendance Sheet')}>
                        Preview
                      </Button>
                      <Button size="small" startIcon={<Icon>print</Icon>} onClick={() => handlePrintContent(generatedAttendance, 'Attendance Sheet')}>
                        Print
                      </Button>
                      <Button size="small" startIcon={<Icon>download</Icon>} onClick={() => handleDownloadPDF(generatedAttendance, 'Attendance-Sheet')}>
                        PDF
                      </Button>
                      <Button size="small" startIcon={<Icon>content_copy</Icon>} onClick={() => handleCopyContent(generatedAttendance, 'Attendance Sheet')}>
                        Copy
                      </Button>
                      <Button size="small" color="error" startIcon={<Icon>close</Icon>} onClick={() => setGeneratedAttendance('')}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                  {isHTMLContent(generatedAttendance) && (
                    <Box sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                      <iframe
                        srcDoc={generatedAttendance}
                        title="Attendance Sheet Preview"
                        style={{ width: '100%', height: '500px', border: 'none' }}
                        sandbox="allow-same-origin"
                      />
                    </Box>
                  )}
                  <Accordion>
                    <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                      <Typography variant="caption" color="text.secondary">
                        <Icon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }}>code</Icon>
                        Edit HTML Source
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        fullWidth
                        multiline
                        minRows={10}
                        maxRows={20}
                        value={generatedAttendance}
                        onChange={(e) => setGeneratedAttendance(e.target.value)}
                        sx={{ bgcolor: 'background.paper', fontFamily: 'monospace', fontSize: '0.75rem' }}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Card>
              )}

              {/* Generated MCQ Test */}
              {generatedMCQ && (
                <Card variant="outlined" sx={{ p: 2, bgcolor: 'warning.50' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>quiz</Icon>
                      MCQ Evaluation Test
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button size="small" variant="outlined" startIcon={<Icon>visibility</Icon>} onClick={() => handlePreviewContent(generatedMCQ, 'MCQ Evaluation Test')}>
                        Preview
                      </Button>
                      <Button size="small" startIcon={<Icon>print</Icon>} onClick={() => handlePrintContent(generatedMCQ, 'MCQ Evaluation Test')}>
                        Print
                      </Button>
                      <Button size="small" startIcon={<Icon>download</Icon>} onClick={() => handleDownloadPDF(generatedMCQ, 'MCQ-Evaluation-Test')}>
                        PDF
                      </Button>
                      <Button size="small" startIcon={<Icon>content_copy</Icon>} onClick={() => handleCopyContent(generatedMCQ, 'MCQ Test')}>
                        Copy
                      </Button>
                      <Button size="small" color="error" startIcon={<Icon>close</Icon>} onClick={() => setGeneratedMCQ('')}>
                        Close
                      </Button>
                    </Box>
                  </Box>
                  <Alert severity="info" sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      The answer key is included at the end. Keep it separate from the test paper.
                    </Typography>
                  </Alert>
                  {isHTMLContent(generatedMCQ) && (
                    <Box sx={{ mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                      <iframe
                        srcDoc={generatedMCQ}
                        title="MCQ Test Preview"
                        style={{ width: '100%', height: '600px', border: 'none' }}
                        sandbox="allow-same-origin"
                      />
                    </Box>
                  )}
                  <Accordion>
                    <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
                      <Typography variant="caption" color="text.secondary">
                        <Icon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }}>code</Icon>
                        Edit HTML Source
                      </Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TextField
                        fullWidth
                        multiline
                        minRows={15}
                        maxRows={25}
                        value={generatedMCQ}
                        onChange={(e) => setGeneratedMCQ(e.target.value)}
                        sx={{ bgcolor: 'background.paper', fontFamily: 'monospace', fontSize: '0.75rem' }}
                      />
                    </AccordionDetails>
                  </Accordion>
                </Card>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Internal Training Evidence Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="success">school</Icon>
                <Typography fontWeight={600}>
                  Internal Training Evidence ({(objective.trainingMaterials || []).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Upload training photos, videos, certificates, and attendance sheets as evidence of staff training.
                </Typography>
              </Alert>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Existing Training Materials */}
                {(objective.trainingMaterials || []).length > 0 && (
                  <Grid container spacing={2}>
                    {(objective.trainingMaterials || []).map((material) => (
                      <Grid key={material.id} size={{ xs: 6, sm: 4, md: 3 }}>
                        <Card variant="outlined" sx={{ height: '100%' }}>
                          {material.type === 'photo' && material.dataUrl && (
                            <CardMedia
                              component="img"
                              height="120"
                              image={material.dataUrl}
                              alt={material.title}
                              sx={{ objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => window.open(material.dataUrl, '_blank')}
                            />
                          )}
                          {material.type === 'video' && (
                            <Box
                              sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'primary.dark',
                              }}
                            >
                              <Icon sx={{ fontSize: 48, color: 'white' }}>videocam</Icon>
                            </Box>
                          )}
                          {material.type === 'document' && (
                            <Box
                              sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'error.light',
                              }}
                            >
                              <Icon sx={{ fontSize: 48, color: 'white' }}>description</Icon>
                            </Box>
                          )}
                          {material.type === 'certificate' && (
                            <Box
                              sx={{
                                height: 120,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: 'success.light',
                              }}
                            >
                              <Icon sx={{ fontSize: 48, color: 'white' }}>workspace_premium</Icon>
                            </Box>
                          )}
                          <CardContent sx={{ pb: 1 }}>
                            <Tooltip title={material.title}>
                              <Typography variant="caption" noWrap fontWeight={600} sx={{ display: 'block' }}>
                                {material.title}
                              </Typography>
                            </Tooltip>
                            <Chip
                              label={material.type}
                              size="small"
                              sx={{ mt: 0.5, height: 20, fontSize: 10 }}
                            />
                            {material.trainingDate && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                Training: {material.trainingDate}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions sx={{ pt: 0 }}>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteTrainingMaterial(material.id)}
                            >
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Add Training Material Form */}
                {showAddTraining ? (
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Add Training Evidence
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <FormControl fullWidth size="small">
                        <InputLabel>Type</InputLabel>
                        <Select
                          value={newTrainingType}
                          label="Type"
                          onChange={(e) => setNewTrainingType(e.target.value as typeof newTrainingType)}
                        >
                          <MenuItem value="photo">Training Photo</MenuItem>
                          <MenuItem value="video">Training Video</MenuItem>
                          <MenuItem value="document">Attendance Sheet / Document</MenuItem>
                          <MenuItem value="certificate">Certificate</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        fullWidth
                        size="small"
                        label="Title"
                        placeholder="e.g., Hand Hygiene Training Session"
                        value={newTrainingTitle}
                        onChange={(e) => setNewTrainingTitle(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Description (optional)"
                        placeholder="Brief description"
                        value={newTrainingDescription}
                        onChange={(e) => setNewTrainingDescription(e.target.value)}
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Training Date"
                        type="date"
                        value={newTrainingDate}
                        onChange={(e) => setNewTrainingDate(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Icon>upload</Icon>}
                          onClick={() => trainingFileInputRef.current?.click()}
                        >
                          Upload File
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setShowAddTraining(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                      <input
                        ref={trainingFileInputRef}
                        type="file"
                        accept="image/*,video/mp4,video/webm,application/pdf"
                        onChange={handleTrainingFileUpload}
                        style={{ display: 'none' }}
                      />
                    </Box>
                  </Card>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<Icon>add</Icon>}
                    onClick={() => setShowAddTraining(true)}
                    sx={{ alignSelf: 'flex-start' }}
                  >
                    Add Training Evidence
                  </Button>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          {/* SOP Documents Section */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Icon color="primary">description</Icon>
                <Typography fontWeight={600}>
                  Standard Operating Procedures (SOPs) ({(objective.sopDocuments || []).length})
                </Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Upload hospital SOPs (PDF or Word documents) or generate a new SOP if needed.
                </Typography>
              </Alert>

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
                              bgcolor: sop.fileType === 'pdf' ? 'error.light' : 'primary.light',
                              cursor: 'pointer',
                            }}
                            onClick={() => handleViewSOP(sop)}
                          >
                            <Icon sx={{ fontSize: 48, color: 'white' }}>
                              {sop.fileType === 'pdf' ? 'picture_as_pdf' : 'description'}
                            </Icon>
                          </Box>
                          <CardContent sx={{ pb: 1 }}>
                            <Tooltip title={sop.title}>
                              <Typography variant="subtitle2" noWrap fontWeight={600}>
                                {sop.title}
                              </Typography>
                            </Tooltip>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                              <Chip
                                label={sop.fileType.toUpperCase()}
                                size="small"
                                color={sop.fileType === 'pdf' ? 'error' : 'primary'}
                                sx={{ height: 20, fontSize: 10 }}
                              />
                              <Chip
                                label={`v${sop.version}`}
                                size="small"
                                variant="outlined"
                                sx={{ height: 20, fontSize: 10 }}
                              />
                            </Box>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              Effective: {sop.effectiveDate}
                            </Typography>
                            {sop.description && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                {sop.description}
                              </Typography>
                            )}
                          </CardContent>
                          <CardActions sx={{ pt: 0, justifyContent: 'space-between' }}>
                            <Button
                              size="small"
                              startIcon={<Icon>visibility</Icon>}
                              onClick={() => handleViewSOP(sop)}
                            >
                              View
                            </Button>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteSOP(sop.id)}
                            >
                              <Icon fontSize="small">delete</Icon>
                            </IconButton>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}

                {/* Add SOP Form */}
                {showAddSOP ? (
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Upload SOP Document
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="SOP Title"
                        placeholder="e.g., Hand Hygiene Protocol"
                        value={newSOPTitle}
                        onChange={(e) => setNewSOPTitle(e.target.value)}
                      />
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Version"
                            placeholder="1.0"
                            value={newSOPVersion}
                            onChange={(e) => setNewSOPVersion(e.target.value)}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Effective Date"
                            type="date"
                            value={newSOPEffectiveDate}
                            onChange={(e) => setNewSOPEffectiveDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description (optional)"
                        placeholder="Brief description of the SOP"
                        value={newSOPDescription}
                        onChange={(e) => setNewSOPDescription(e.target.value)}
                      />
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          size="small"
                          startIcon={<Icon>upload</Icon>}
                          onClick={() => sopFileInputRef.current?.click()}
                        >
                          Upload SOP File
                        </Button>
                        <Button
                          size="small"
                          onClick={() => setShowAddSOP(false)}
                        >
                          Cancel
                        </Button>
                      </Box>
                      <input
                        ref={sopFileInputRef}
                        type="file"
                        accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                        onChange={handleSOPFileUpload}
                        style={{ display: 'none' }}
                      />
                    </Box>
                  </Card>
                ) : (
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      startIcon={<Icon>upload_file</Icon>}
                      onClick={() => setShowAddSOP(true)}
                    >
                      Upload SOP
                    </Button>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={isGeneratingSOP ? <CircularProgress size={16} color="inherit" /> : <Icon>auto_awesome</Icon>}
                      onClick={handleGenerateSOP}
                      disabled={isGeneratingSOP}
                    >
                      {isGeneratingSOP ? 'Generating...' : 'Generate SOP'}
                    </Button>
                  </Box>
                )}

                {/* Generated SOP Content */}
                {generatedSOPContent && (
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'success.50' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>auto_awesome</Icon>
                        Generated SOP
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button size="small" startIcon={<Icon>print</Icon>} onClick={() => handlePrintContent(generatedSOPContent, 'SOP')}>
                          Print
                        </Button>
                        <Button size="small" startIcon={<Icon>download</Icon>} onClick={() => handleDownloadPDF(generatedSOPContent, `SOP-${objective.code}`)}>
                          PDF
                        </Button>
                        <Button size="small" startIcon={<Icon>content_copy</Icon>} onClick={handleCopyGeneratedSOP}>
                          Copy
                        </Button>
                        <Button size="small" color="error" startIcon={<Icon>close</Icon>} onClick={() => setGeneratedSOPContent('')}>
                          Close
                        </Button>
                      </Box>
                    </Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        Edit the SOP below as needed. Use Print or PDF to save, or Copy to paste into Word.
                      </Typography>
                    </Alert>
                    <TextField
                      fullWidth
                      multiline
                      minRows={15}
                      maxRows={25}
                      value={generatedSOPContent}
                      onChange={(e) => setGeneratedSOPContent(e.target.value)}
                      sx={{ bgcolor: 'background.paper', fontFamily: 'monospace', fontSize: '0.8rem' }}
                    />
                  </Card>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Divider />

          {/* Status, Priority, Category, Assignee Row */}
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
                  <MenuItem value="Blocked">Blocked</MenuItem>
                  <MenuItem value="Completed">Completed</MenuItem>
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
                  <MenuItem value="P0">P0</MenuItem>
                  <MenuItem value="P1">P1</MenuItem>
                  <MenuItem value="P2">P2</MenuItem>
                  <MenuItem value="P3">P3</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select
                  value={objective.category || ''}
                  label="Category"
                  onChange={(e) => handleFieldChange('category', e.target.value as ElementCategory)}
                >
                  <MenuItem value="Core">Core</MenuItem>
                  <MenuItem value="Commitment">Commitment</MenuItem>
                  <MenuItem value="Achievement">Achievement</MenuItem>
                  <MenuItem value="Excellence">Excellence</MenuItem>
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
                  <MenuItem value="">Not Assigned</MenuItem>
                  {ASSIGNEE_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider />

          {/* Dates Row */}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="Start Date"
                type="date"
                value={objective.startDate}
                onChange={(e) => handleFieldChange('startDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                label="End Date"
                type="date"
                value={objective.endDate}
                onChange={(e) => handleFieldChange('endDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Divider />

          {/* Evidence List */}
          <TextField
            fullWidth
            label="Evidence List"
            value={objective.evidencesList}
            onChange={(e) => handleFieldChange('evidencesList', e.target.value)}
            multiline
            minRows={3}
            size="small"
            placeholder="List the required evidences for this objective element..."
            sx={expandableTextFieldSx}
          />

          {/* Evidence Links */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
              <TextField
                fullWidth
                label="Evidence Links (comma-separated)"
                value={objective.evidenceLinks}
                onChange={(e) => handleFieldChange('evidenceLinks', e.target.value)}
                multiline
                minRows={2}
                size="small"
                placeholder="file1.pdf, file2.docx, folder/file3.xlsx"
                helperText="Enter file names or links separated by commas"
                sx={expandableTextFieldSx}
              />
              <Tooltip title="Upload files to add links">
                <Button
                  variant="outlined"
                  sx={{ minWidth: 'auto', px: 2, py: 1.5, mt: 0.5 }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Icon>upload_file</Icon>
                </Button>
              </Tooltip>
            </Box>
          </Box>

          {/* Evidence File Upload Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={600}>
                <Icon sx={{ verticalAlign: 'middle', mr: 1 }}>attach_file</Icon>
                Evidence Files ({evidenceFiles.length})
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Icon>upload_file</Icon>}
                onClick={() => fileInputRef.current?.click()}
                size="small"
              >
                Upload Evidence
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </Box>

            {evidenceFiles.length === 0 ? (
              <Box
                sx={{
                  border: '2px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 4,
                  textAlign: 'center',
                  bgcolor: 'action.hover',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'action.selected',
                  },
                }}
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }}>cloud_upload</Icon>
                <Typography variant="body1" color="text.secondary">
                  Click to upload or drag and drop
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Images (JPEG, PNG, GIF, WebP) or PDF files. Max 10MB each.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {evidenceFiles.map((file) => (
                  <Grid key={file.id} size={{ xs: 6, sm: 4, md: 3 }}>
                    <Card
                      sx={{
                        position: 'relative',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                      }}
                    >
                      {file.type === 'image' ? (
                        <CardMedia
                          component="img"
                          height="120"
                          image={file.dataUrl}
                          alt={file.name}
                          sx={{
                            objectFit: 'cover',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleViewFile(file)}
                        />
                      ) : (
                        <Box
                          sx={{
                            height: 120,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: 'error.light',
                            cursor: 'pointer',
                          }}
                          onClick={() => handleViewFile(file)}
                        >
                          <Icon sx={{ fontSize: 48, color: 'error.contrastText' }}>picture_as_pdf</Icon>
                        </Box>
                      )}
                      <Box sx={{ p: 1, flexGrow: 1 }}>
                        <Tooltip title={file.name}>
                          <Typography
                            variant="caption"
                            noWrap
                            sx={{ display: 'block', fontWeight: 500 }}
                          >
                            {file.name}
                          </Typography>
                        </Tooltip>
                        <Typography variant="caption" color="text.secondary">
                          {formatFileSize(file.size)}
                        </Typography>
                      </Box>
                      <CardActions sx={{ justifyContent: 'space-between', pt: 0 }}>
                        <Tooltip title="View">
                          <IconButton size="small" onClick={() => handleViewFile(file)}>
                            <Icon fontSize="small">visibility</Icon>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteFile(file.id)}
                          >
                            <Icon fontSize="small">delete</Icon>
                          </IconButton>
                        </Tooltip>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
                {/* Add more button */}
                <Grid size={{ xs: 6, sm: 4, md: 3 }}>
                  <Card
                    sx={{
                      height: '100%',
                      minHeight: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '2px dashed',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Icon sx={{ fontSize: 32, color: 'text.secondary' }}>add</Icon>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Add more
                      </Typography>
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Deliverable */}
          <TextField
            fullWidth
            label="Deliverable"
            value={objective.deliverable}
            onChange={(e) => handleFieldChange('deliverable', e.target.value)}
            multiline
            minRows={2}
            size="small"
            placeholder="What is the expected deliverable for this objective..."
            sx={expandableTextFieldSx}
          />

          <Divider />

          {/* Notes */}
          <TextField
            fullWidth
            label="Notes"
            value={objective.notes}
            onChange={(e) => handleFieldChange('notes', e.target.value)}
            multiline
            minRows={3}
            placeholder="Add notes, comments, or additional information..."
            sx={expandableTextFieldSx}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          startIcon={<Icon>save</Icon>}
          onClick={onClose}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
